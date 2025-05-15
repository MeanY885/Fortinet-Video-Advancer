// Always inject iframe-watcher.js into the top frame on Fortinet pages
chrome.webNavigation.onCommitted.addListener(function(details) {
    if (details.frameId === 0) {
        chrome.scripting.executeScript({
            target: {tabId: details.tabId, frameIds: [0]},
            files: ["iframe-watcher.js"]
        });
    } else {
        // For iframes, inject content.js as before
        chrome.scripting.executeScript({
            target: {tabId: details.tabId, frameIds: [details.frameId]},
            files: ["content.js"]
        });
    }
}, {
    url: [{hostContains: "training.fortinet.com"}]
});

// Listen for messages from iframe-watcher.js to inject content.js into discovered iframes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'injectContentScript' && sender.tab && sender.tab.id) {
        chrome.scripting.executeScript({
            target: {tabId: sender.tab.id},
            files: ["content.js"]
        });
    }
});
