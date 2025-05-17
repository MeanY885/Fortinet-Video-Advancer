// Always inject iframe-watcher.js into the top frame on Fortinet pages
chrome.webNavigation.onCommitted.addListener(function(details) {
    if (details.frameId === 0) {
        // Only inject watcher in top frame
        chrome.scripting.executeScript({
            target: {tabId: details.tabId, frameIds: [0]},
            files: ["iframe-watcher.js"]
        });
        
        // Inject content script in top frame only initially
        chrome.scripting.executeScript({
            target: {tabId: details.tabId, frameIds: [0]},
            files: ["content.js"]
        });
    }
}, {
    url: [{hostContains: "training.fortinet.com"}]
});

// Listen for messages from iframe-watcher.js to inject content.js into discovered iframes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'injectContentScript' && sender.tab && sender.tab.id) {
        // Only inject into the specific frame that needs it
        chrome.scripting.executeScript({
            target: {tabId: sender.tab.id, frameIds: [message.frameId]},
            files: ["content.js"]
        });
    }
});

