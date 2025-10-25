document.addEventListener("DOMContentLoaded", function () {
  const convertBtn = document.getElementById("convertBtn");
  const status = document.getElementById("status");
  const autoToggle = document.getElementById("autoConvertToggle");

  // Initialize toggle from storage (default false)
  chrome.storage.local.get({ autoConvertEnabled: false }, (res) => {
    autoToggle.checked = res.autoConvertEnabled;
  });

  autoToggle.addEventListener("change", async () => {
    const enabled = autoToggle.checked;
    chrome.storage.local.set({ autoConvertEnabled: enabled }, () => {
      showStatus(
        enabled ? "Auto-convert enabled" : "Auto-convert disabled",
        "info"
      );
    });

    // Notify active tab content script (if on Notion)
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (
      tab &&
      tab.id &&
      tab.url &&
      (tab.url.includes("notion.so") || tab.url.includes("notion.site"))
    ) {
      chrome.tabs.sendMessage(tab.id, {
        action: "setAutoConvert",
        enabled,
      });
    }
  });

  convertBtn.addEventListener("click", async function () {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (
        !tab.url ||
        (!tab.url.includes("notion.so") && !tab.url.includes("notion.site"))
      ) {
        showStatus("Please open a Notion page first!", "error");
        return;
      }

      showStatus("Converting...", "info");

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "convertEquations",
      });

      if (response && response.success) {
        const count = response.count;
        if (count > 0) {
          showStatus(`Converted ${count} equation(s)!`, "success");
        } else {
          showStatus("No [ ] patterns found", "error");
        }
      } else {
        showStatus("Conversion failed", "error");
      }
    } catch (error) {
      showStatus("Error: Refresh the page and try again", "error");
      console.error("Extension error:", error);
    }
  });

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    clearTimeout(showStatus._t);
    showStatus._t = setTimeout(() => {
      status.textContent = "";
      status.className = "status";
    }, 3000);
  }
});
