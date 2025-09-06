// State
let autoConvertEnabled = false;
let isConverting = false;
let mutationObserver = null;

// Message listener from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "convertEquations") {
    const count = convertTextEquations();
    sendResponse({ success: true, count });
  } else if (request.action === "setAutoConvert") {
    setAutoConvert(request.enabled);
  }
  // Return true only if async response is planned (not needed here)
});

// Initialize preference from storage
chrome.storage.local.get({ autoConvertEnabled: false }, (res) => {
  autoConvertEnabled = res.autoConvertEnabled;
  if (autoConvertEnabled) {
    ensureObserver();
  }
});

// React to storage changes (if changed in another popup instance)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.autoConvertEnabled) {
    setAutoConvert(changes.autoConvertEnabled.newValue);
  }
});

function setAutoConvert(enabled) {
  autoConvertEnabled = enabled;
  if (enabled) {
    ensureObserver();
  } else {
    disconnectObserver();
  }
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

function handleMutations(mutations) {
  if (!autoConvertEnabled) return;
  if (isConverting) return;

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

// Manual batch conversion
function convertTextEquations() {
  let count = 0;
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const candidates = [];
  let node;
  while ((node = walker.nextNode())) {
    if (node.textContent.includes("\\[") && node.textContent.includes("\\]")) {
      candidates.push(node);
    }
  }

  candidates.forEach((textNode) => {
    const original = textNode.textContent;
    const updated = original.replace(/\\\[(.*?)\\\]/g, "$$$1$");
    if (updated !== original) {
      textNode.textContent = updated;
      count += (original.match(/\\\[/g) || []).length;
      notifyInput(textNode.parentElement);
    }
  });

  return count;
}

// Single node conversion (auto mode)
function convertSingleTextNode(textNode) {
  if (isConverting) return;
  const text = textNode.textContent;
  if (!text || !text.includes("\\[") || !text.includes("\\]")) return;

  const newText = text.replace(/\\\[(.*?)\\\]/g, "$$$1$");
  if (newText === text) return;

  isConverting = true;
  textNode.textContent = newText;
  notifyInput(textNode.parentElement);

  setTimeout(() => {
    isConverting = false;
  }, 50);
}

function notifyInput(parent) {
  if (!parent) return;
  const evt = new Event("input", { bubbles: true, cancelable: true });
  parent.dispatchEvent(evt);
}
