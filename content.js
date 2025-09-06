// Notion Equation Converter Content Script
// Converts \[ ... \] to $ ... $ only when there is at least one non-whitespace character between the brackets.
// Empty \[\] or whitespace-only \[   \] are ignored.

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let autoConvertEnabled = false;
let isConverting = false;
let mutationObserver = null;

// ---------------------------------------------------------------------------
// Regex
// ---------------------------------------------------------------------------
// Captures inner math (with at least one non-whitespace char) across lines, non-greedy
const EQUATION_REGEX = /\\\[(\s*\S[\s\S]*?)\\\]/g;

// Helper to safely test without leaving lastIndex side-effects
function hasEquation(text) {
  EQUATION_REGEX.lastIndex = 0;
  return EQUATION_REGEX.test(text);
}

// ---------------------------------------------------------------------------
// Message Listener (from popup)
// ---------------------------------------------------------------------------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "convertEquations") {
    const count = convertTextEquations();
    sendResponse({ success: true, count });
  } else if (request.action === "setAutoConvert") {
    setAutoConvert(request.enabled);
  }
});

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------
chrome.storage.local.get({ autoConvertEnabled: false }, (res) => {
  autoConvertEnabled = res.autoConvertEnabled;
  if (autoConvertEnabled) ensureObserver();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.autoConvertEnabled) {
    setAutoConvert(changes.autoConvertEnabled.newValue);
  }
});

// ---------------------------------------------------------------------------
// Auto-convert Toggle Handling
// ---------------------------------------------------------------------------
function setAutoConvert(enabled) {
  autoConvertEnabled = enabled;
  if (enabled) ensureObserver();
  else disconnectObserver();
}

function ensureObserver() {
  if (mutationObserver) return;
  mutationObserver = new MutationObserver(handleMutations);
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

function disconnectObserver() {
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
}

// ---------------------------------------------------------------------------
// Mutation Handling (Auto Mode)
// ---------------------------------------------------------------------------
function handleMutations(mutations) {
  if (!autoConvertEnabled || isConverting) return;

  for (const mutation of mutations) {
    if (mutation.type === "characterData") {
      convertSingleTextNode(mutation.target);
    } else if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          convertSingleTextNode(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const walker = document.createTreeWalker(
            node,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );
          let tn;
          while ((tn = walker.nextNode())) {
            convertSingleTextNode(tn);
          }
        }
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Manual Batch Conversion
// ---------------------------------------------------------------------------
function convertTextEquations() {
  let totalConverted = 0;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const candidates = [];
  let node;
  while ((node = walker.nextNode())) {
    const txt = node.textContent;
    if (txt && txt.includes("\\[") && txt.includes("\\]")) {
      candidates.push(node);
    }
  }

  candidates.forEach((textNode) => {
    const original = textNode.textContent;
    if (!original) return;

    EQUATION_REGEX.lastIndex = 0;
    const matches = [...original.matchAll(EQUATION_REGEX)];
    if (matches.length === 0) return;

    // Replace \[ ... \] with $ ... $
    EQUATION_REGEX.lastIndex = 0;
    const updated = original.replace(EQUATION_REGEX, "$$$1$");

    if (updated !== original) {
      textNode.textContent = updated;
      totalConverted += matches.length;
      notifyInput(textNode.parentElement);
    }
  });

  return totalConverted;
}

// ---------------------------------------------------------------------------
// Single Node Conversion (Auto Mode)
// ---------------------------------------------------------------------------
function convertSingleTextNode(textNode) {
  if (isConverting) return;
  const text = textNode.textContent;
  if (!text) return;
  if (!text.includes("\\[") || !text.includes("\\]")) return;
  if (!hasEquation(text)) return;

  EQUATION_REGEX.lastIndex = 0;
  const newText = text.replace(EQUATION_REGEX, "$$$1$");
  if (newText === text) return;

  isConverting = true;
  textNode.textContent = newText;
  notifyInput(textNode.parentElement);

  setTimeout(() => {
    isConverting = false;
  }, 50);
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
function notifyInput(parent) {
  if (!parent) return;
  const evt = new Event("input", { bubbles: true, cancelable: true });
  parent.dispatchEvent(evt);
}
