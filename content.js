// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "convertEquations") {
    const count = convertTextEquations();
    sendResponse({ success: true, count: count });
  }
});

function convertTextEquations() {
  let count = 0;

  // Find all text nodes in the document
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) {
    // Only process text nodes that contain our pattern
    if (node.textContent.includes("\\[") && node.textContent.includes("\\]")) {
      textNodes.push(node);
    }
  }

  // Process each text node
  textNodes.forEach((textNode) => {
    const originalText = textNode.textContent;
    const newText = originalText.replace(/\\\[(.*?)\\\]/g, "$$$1$");

    if (newText !== originalText) {
      textNode.textContent = newText;
      count += (originalText.match(/\\\[/g) || []).length;

      // Trigger input event to notify Notion of the change
      const parent = textNode.parentElement;
      if (parent) {
        const inputEvent = new Event("input", {
          bubbles: true,
          cancelable: true,
        });
        parent.dispatchEvent(inputEvent);
      }
    }
  });

  return count;
}

// Optional: Real-time conversion as you type
let isConverting = false;

function setupAutoConversion() {
  const observer = new MutationObserver((mutations) => {
    if (isConverting) return; // Prevent infinite loops

    mutations.forEach((mutation) => {
      if (mutation.type === "characterData" || mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            convertSingleTextNode(node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Check text nodes within the added element
            const walker = document.createTreeWalker(
              node,
              NodeFilter.SHOW_TEXT,
              null,
              false
            );

            let textNode;
            while ((textNode = walker.nextNode())) {
              convertSingleTextNode(textNode);
            }
          }
        });

        // Also check modified text nodes
        if (mutation.target.nodeType === Node.TEXT_NODE) {
          convertSingleTextNode(mutation.target);
        }
      }
    });
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

function convertSingleTextNode(textNode) {
  if (isConverting) return;

  const text = textNode.textContent;
  if (text.includes("\\[") && text.includes("\\]")) {
    isConverting = true;

    const newText = text.replace(/\\\[(.*?)\\\]/g, "$$$1$");
    if (newText !== text) {
      textNode.textContent = newText;

      // Notify Notion of the change
      const parent = textNode.parentElement;
      if (parent) {
        const inputEvent = new Event("input", {
          bubbles: true,
          cancelable: true,
        });
        parent.dispatchEvent(inputEvent);
      }
    }

    setTimeout(() => {
      isConverting = false;
    }, 100);
  }
}

// Initialize auto-conversion when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupAutoConversion);
} else {
  setupAutoConversion();
}
