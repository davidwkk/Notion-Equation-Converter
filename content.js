// Notion Equation Converter — \[...\]→/math, $$...$$/$$...$$/$...$→inline
// Manual: Ctrl+Alt+M or popup. Auto: text replacement while typing.

(function () {
  "use strict";

  // State
  let autoConvertEnabled = false, isConverting = false, mutationObserver = null;

  // Regex — matches \[ \], $$ $$, \( \), $ $ (in priority order)
  const SCAN_RE =
    /(?:\\\[\s*\S[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\\\(\s*\S[\s\S]*?\\\)|\$(?:\$|[^\$\n]*[a-zA-Z\\][^\$\n]*)\$)/;
  const BRACKET_DISPLAY_RE = /\\\[(\s*\S[\s\S]*?)\\\]/g;
  const PAREN_INLINE_RE    = /\\\((\s*\S[\s\S]*?)\\\)/g;
  const SINGLE_DOLLAR_RE   = /(?<!\$)\$([^\$\n]*[a-zA-Z\\][^\$\n]*)\$(?!\$)/g;
  const hasBracketEq = (t) => /\\\[[\s\S]*?\\\]/.test(t) || /\\\([\s\S]*?\\\)/.test(t);

  // Timing (ms)
  const TIMING = {
    FOCUS: 50, QUICK: 20, DIALOG: 100, MATH_BLOCK: 100,
    POST_CONVERT: 300, TOGGLE_TIMEOUT: 5000, AUTO_DEBOUNCE: 200,
  };

  const api = typeof browser !== "undefined" ? browser : chrome;

  // Message handling
  api.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "convertEquations") {
      convertMathEquations()
        .then((c) => sendResponse({ success: true, count: c }))
        .catch((e) => sendResponse({ success: false, error: e.message }));
      return true;
    }
    if (request.action === "setAutoConvert") setAutoConvert(request.enabled);
  });

  // Keyboard shortcut
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.altKey && (event.key === "M" || event.key === "m")) {
      event.preventDefault();
      convertMathEquations();
    }
  });

  // Initialization
  api.storage.local.get({ autoConvertEnabled: false }, (res) => {
    autoConvertEnabled = res.autoConvertEnabled;
    if (autoConvertEnabled) startAutoConvert();
  });
  api.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.autoConvertEnabled)
      setAutoConvert(changes.autoConvertEnabled.newValue);
  });

  // Auto-Convert — text replacement via MutationObserver
  let autoConvertTimer = null;
  const pendingNodes = new Set();

  function setAutoConvert(enabled) {
    autoConvertEnabled = enabled;
    if (enabled) { startAutoConvert(); convertTextEquations(); }
    else stopAutoConvert();
  }

  function startAutoConvert() {
    if (mutationObserver) return;
    mutationObserver = new MutationObserver(handleMutations);
    mutationObserver.observe(document.body, {
      childList: true, subtree: true, characterData: true,
    });
  }

  function stopAutoConvert() {
    if (mutationObserver) { mutationObserver.disconnect(); mutationObserver = null; }
  }
  function handleMutations(mutations) {
    if (!autoConvertEnabled || isConverting) return;
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        const t = mutation.target.textContent;
        if (t && hasBracketEq(t)) pendingNodes.add(mutation.target);
      } else if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent && hasBracketEq(node.textContent)) pendingNodes.add(node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
            let tn;
            while ((tn = w.nextNode()))
              if (tn.textContent && hasBracketEq(tn.textContent)) pendingNodes.add(tn);
          }
        }
      }
    }
    if (pendingNodes.size > 0) {
      if (autoConvertTimer) clearTimeout(autoConvertTimer);
      autoConvertTimer = setTimeout(processPendingNodes, TIMING.AUTO_DEBOUNCE);
    }
  }

  function processPendingNodes() {
    autoConvertTimer = null;
    for (const node of pendingNodes) {
      if (!document.contains(node)) continue;
      autoConvertNode(node);
    }
    pendingNodes.clear();
  }

  function autoConvertNode(textNode) {
    if (isConverting) return;
    const text = textNode.textContent;
    if (!text || !hasBracketEq(text)) return;
    if (textNode.parentElement?.closest(".notion-code-block")) return;
    const updated = replaceEqText(text);
    if (updated === text) return;
    isConverting = true;
    textNode.textContent = updated;
    notifyInput(textNode.parentElement);
    setTimeout(() => { isConverting = false; }, 50);
  }

  function replaceEqText(text) {
    PAREN_INLINE_RE.lastIndex = 0;
    let r = text.replace(PAREN_INLINE_RE, (_m, g1) => `$$${g1}$$`);
    BRACKET_DISPLAY_RE.lastIndex = 0;
    return r.replace(BRACKET_DISPLAY_RE, (_m, g1) => `$$${g1}$$`);
  }

  function convertTextEquations() {
    let count = 0;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) {
      if (n.parentElement?.closest(".notion-code-block")) continue;
      const t = n.textContent;
      if (t && (t.includes("\\[") || t.includes("\\(") || t.includes("$"))) nodes.push(n);
    }
    for (const node of nodes) {
      const orig = node.textContent;
      if (!orig) continue;
      let updated = replaceEqText(orig);
      updated = updated.replace(SINGLE_DOLLAR_RE, (_m, g1) => {
        if (/[-+*/=<>]$/.test(g1.trimEnd())) return _m;
        return `$$${g1}$$`;
      });
      if (updated !== orig) {
        node.textContent = updated;
        count += [...orig.matchAll(PAREN_INLINE_RE)].length
              + [...orig.matchAll(BRACKET_DISPLAY_RE)].length
              + [...orig.matchAll(SINGLE_DOLLAR_RE)].length;
        notifyInput(node.parentElement);
      }
    }
    return count;
  }

  // Manual Conversion — unified DOM-order scan with toggle handling
  async function convertMathEquations() {
    if (isConverting) return 0;
    isConverting = true;
    window.focus();
    await delay(TIMING.FOCUS);
    injectCSS(
      'div[role="dialog"] { opacity: 0 !important; transform: scale(0.001) !important; } ' +
      ".notion-text-action-menu { opacity: 0 !important; transform: scale(0.001) !important; pointer-events: none !important; }");
    try { return await scanAndConvert(document.body); }
    finally { removeStyleTag(); isConverting = false; }
  }

  async function scanAndConvert(root) {
    let count = 0;
    const seen = new WeakSet();
    while (true) {
      const next = findNextItem(root, seen);
      if (!next) break;
      if (next.type === "equation") {
        seen.add(next.node);
        if (await convertEquation(next.node, next.text)) count++;
      } else {
        await processFoldedToggleInPlace(next.element);
      }
    }
    return count;
  }

  function findNextItem(root, seen) {
    const equations = findEquationNodes(root).filter((e) => !seen.has(e));
    const toggles = findFoldedToggles(root).filter(
      (t) => !t.hasAttribute("data-nmq-processed"));
    const candidates = [];
    for (const eq of equations) {
      const match = eq.nodeValue.match(SCAN_RE);
      if (!match) continue;
      const rect = eq.parentElement?.getBoundingClientRect();
      if (!rect) continue;
      candidates.push({
        type: "equation", node: eq, text: match[0],
        top: rect.top + window.scrollY, left: rect.left + window.scrollX,
      });
    }
    for (const toggle of toggles) {
      const rect = toggle.getBoundingClientRect();
      candidates.push({
        type: "toggle", element: toggle,
        top: rect.top + window.scrollY, left: rect.left + window.scrollX,
      });
    }
    candidates.sort((a, b) => a.top - b.top || a.left - b.left);
    return candidates[0] || null;
  }

  // Per-equation conversion

  async function convertEquation(node, equationText) {
    const cls = classifyEquation(equationText);
    if (!cls) return false;
    try {
      const editableParent = findEditableParent(node);
      if (!editableParent) return false;
      editableParent.click();
      await delay(TIMING.FOCUS);
      const range = createRangeForText(editableParent, equationText);
      if (!range) return false;
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      await delay(TIMING.QUICK);
      if (!sel.rangeCount || sel.toString() !== equationText) return false;
      if (cls.isDisplay) await convertDisplayEquation(cls.latex);
      else await convertInlineEquation(cls.latex);
      return true;
    } catch (err) {
      console.error("Equation conversion failed:", err);
      return false;
    }
  }

  function classifyEquation(text) {
    if (text.startsWith("\\[") && text.endsWith("\\]"))
      return { isDisplay: true, latex: text.slice(2, -2).trim() };
    if (text.startsWith("$$") && text.endsWith("$$") && text.length >= 4)
      return { isDisplay: false, latex: text.slice(2, -2).trim() };
    if (text.startsWith("\\(") && text.endsWith("\\)"))
      return { isDisplay: false, latex: text.slice(2, -2).trim() };
    if (text.startsWith("$") && !text.startsWith("$$") && text.endsWith("$") && text.length >= 3) {
      const latex = text.slice(1, -1);
      if (/[-+*/=<>]$/.test(latex.trimEnd())) return null;
      return { isDisplay: false, latex };
    }
    return null;
  }

  // Display equation → /math block

  async function convertDisplayEquation(latex) {
    const sel = window.getSelection();
    sel.deleteFromDocument();
    await delay(TIMING.FOCUS);
    document.execCommand("insertText", false, "/math");
    await delay(TIMING.DIALOG);
    dispatchKeyEvent("Enter", { keyCode: 13 });
    await delay(TIMING.MATH_BLOCK);
    if (isEditableEl(document.activeElement))
      insertTextIntoActiveEl(document.activeElement, latex);
    await delay(TIMING.DIALOG);
    if (document.querySelector('div[role="alert"]'))
      dispatchKeyEvent("Escape", { keyCode: 27 });
    else if (!clickDoneButton())
      dispatchKeyEvent("Escape", { keyCode: 27 });
    await delay(TIMING.POST_CONVERT);
  }

  // Inline equation → $$...$$ re-insertion
  async function convertInlineEquation(latex) {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return;
    sel.deleteFromDocument();
    await delay(TIMING.QUICK);
    document.execCommand("insertText", false, `$$${latex}$$`);
    await delay(TIMING.POST_CONVERT);
  }

  // Toggle utilities

  function findFoldedToggles(root) {
    return Array.from(root.querySelectorAll(".notion-toggle-block")).filter((t) => {
      const btn = t.querySelector('div[role="button"]');
      return btn && btn.getAttribute("aria-expanded") === "false";
    });
  }

  function waitForContentRender(toggleEl, timeout) {
    return new Promise((resolve, reject) => {
      const obs = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            if (node.matches(".notion-selectable") || node.querySelector(".notion-selectable")) {
              obs.disconnect(); clearTimeout(timer); resolve(); return;
            }
          }
        }
      });
      obs.observe(toggleEl, { childList: true, subtree: true });
      const timer = setTimeout(() => {
        obs.disconnect();
        reject(new Error("Timeout waiting for toggle content"));
      }, timeout);
      if (toggleEl.querySelector(".notion-selectable")) {
        obs.disconnect(); clearTimeout(timer); resolve();
      }
    });
  }

  async function expandToggle(toggleEl) {
    const btn = toggleEl.querySelector('div[role="button"]');
    if (!btn) throw new Error("Toggle button not found");
    if (btn.getAttribute("aria-expanded") === "true") return;
    btn.click();
    await waitForContentRender(toggleEl, TIMING.TOGGLE_TIMEOUT);
  }

  function collapseToggle(toggleEl) {
    const btn = toggleEl.querySelector('div[role="button"]');
    if (!btn || btn.getAttribute("aria-expanded") === "false") return;
    btn.click();
  }

  async function processFoldedToggleInPlace(toggleEl) {
    if (!document.contains(toggleEl)) return;
    try { await expandToggle(toggleEl); }
    catch (err) { console.warn("Toggle expand failed:", err); return; }
    try { await scanAndConvert(toggleEl); }
    catch (err) { console.error("Toggle conversion failed:", err); }
    collapseToggle(toggleEl);
    toggleEl.setAttribute("data-nmq-processed", "");
  }

  // DOM / selection utilities

  function createRangeForText(containerEl, searchText) {
    const startIdx = containerEl.textContent.indexOf(searchText);
    if (startIdx === -1) return null;
    const endIdx = startIdx + searchText.length;
    const w = document.createTreeWalker(containerEl, NodeFilter.SHOW_TEXT, null, false);
    let pos = 0, sNode = null, sOff = 0, eNode = null, eOff = 0, node;
    while ((node = w.nextNode())) {
      const len = node.nodeValue.length, nodeEnd = pos + len;
      if (!sNode && nodeEnd > startIdx) { sNode = node; sOff = startIdx - pos; }
      if (!eNode && nodeEnd >= endIdx)   { eNode = node; eOff = endIdx - pos; break; }
      pos = nodeEnd;
    }
    if (!sNode || !eNode) return null;
    const range = document.createRange();
    range.setStart(sNode, sOff);
    range.setEnd(eNode, eOff);
    return range;
  }

  function findEquationNodes(root) {
    const nodes = [];
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const v = n.nodeValue;
      if (!v) continue;
      if (v.includes("\\[") || v.includes("\\(") || v.includes("$$") || v.includes("$")) {
        if (n.parentElement?.closest(".notion-code-block")) continue;
        nodes.push(n);
      }
    }
    return nodes;
  }

  function findEditableParent(node) {
    let p = node.parentElement;
    while (p && p.getAttribute("data-content-editable-leaf") !== "true")
      p = p.parentElement;
    if (p?.closest(".notion-code-block")) return null;
    return p;
  }

  const clickDoneButton = () => {
    const b = [...document.querySelectorAll('[role="button"]')]
      .find((x) => x.textContent.includes("Done"));
    return b ? (b.click(), true) : false;
  };
  const isEditableEl = (el) => el && (el.isContentEditable
    || el.tagName === "INPUT" || el.tagName === "TEXTAREA");
  const insertTextIntoActiveEl = (el, text) => {
    if (el.value !== undefined) { el.value = text; el.dispatchEvent(new Event("input", { bubbles: true })); }
    else document.execCommand("insertText", false, text);
  };

  function injectCSS(css) {
    const s = document.createElement("style");
    s.type = "text/css"; s.id = "notion-math-converter-hide-dialog";
    s.appendChild(document.createTextNode(css));
    document.head.appendChild(s);
  }

  function removeStyleTag() {
    const s = document.getElementById("notion-math-converter-hide-dialog");
    if (s) s.remove();
  }

  const notifyInput = (p) => p && p.dispatchEvent(
    new Event("input", { bubbles: true, cancelable: true }));
  const dispatchKeyEvent = (key, opts = {}) => {
    const el = document.activeElement;
    if (!el) return;
    el.dispatchEvent(new KeyboardEvent("keydown", {
      key, code: opts.code || `Key${key.toUpperCase()}`,
      keyCode: opts.keyCode || 0, which: opts.keyCode || 0,
      ctrlKey: !!opts.ctrlKey, shiftKey: !!opts.shiftKey,
      bubbles: true, cancelable: true,
    }));
  };
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
})();
