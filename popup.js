document.addEventListener("DOMContentLoaded", function () {
  const convertBtn = document.getElementById("convertBtn");
  const status = document.getElementById("status");

  convertBtn.addEventListener("click", async function () {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab.url.includes("notion.so") && !tab.url.includes("notion.site")) {
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
          showStatus(`✅ Converted ${count} equation(s)!`, "success");
        } else {
          showStatus("No \\[ \\] patterns found", "error");
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
    setTimeout(() => {
      status.textContent = "";
      status.className = "status";
    }, 3000);
  }
});
