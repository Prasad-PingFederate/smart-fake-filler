async function fillActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab || !tab.id) return;
  const url = tab.url || "";
  if (url.startsWith("chrome:") || url.startsWith("edge:") || url.startsWith("about:")) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { action: "fillForm" });
  } catch (e) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ["content.js"],
    });
    await chrome.tabs.sendMessage(tab.id, { action: "fillForm" });
  }
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "fill-form") fillActiveTab();
});
