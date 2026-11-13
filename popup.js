async function run(action) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;
  const url = tab.url || "";
  if (url.startsWith("chrome:") || url.startsWith("edge:") || url.startsWith("about:")) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { action });
  } catch (e) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ["content.js"],
    });
    await chrome.tabs.sendMessage(tab.id, { action });
  }
  window.close();
}

document.getElementById("fillBtn").addEventListener("click", () => run("fillForm"));
document.getElementById("clearBtn").addEventListener("click", () => run("clearForm"));
