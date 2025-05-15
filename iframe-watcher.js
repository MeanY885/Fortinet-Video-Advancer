// This script runs in the top frame and watches for iframes being added or changed
// If a new iframe matches the Fortinet player domain, it injects the content script

const TARGET_HOST = 'training.fortinet.com';
const TARGET_PATH = '/scorm/player.php'; // adjust if needed

function injectIntoMatchingIframes() {
    const iframes = Array.from(document.getElementsByTagName('iframe'));
    for (const iframe of iframes) {
        try {
            const src = iframe.src || '';
            if (
                src.includes(TARGET_HOST) &&
                src.includes(TARGET_PATH)
            ) {
                // Inject content.js into this iframe
                chrome.runtime.sendMessage({
                    action: 'injectContentScript',
                    frameSelector: iframe,
                    frameSrc: src
                });
            }
        } catch (e) {
            // Ignore cross-origin
        }
    }
}

// Observe for new iframes added
const observer = new MutationObserver(() => {
    injectIntoMatchingIframes();
});
observer.observe(document.body, { childList: true, subtree: true });

// Initial scan
injectIntoMatchingIframes();

// Listen for SPA navigation (history.pushState, replaceState, popstate)
function hookHistoryEvents() {
    const _pushState = history.pushState;
    const _replaceState = history.replaceState;
    function trigger() {
        setTimeout(() => {
            injectIntoMatchingIframes();
        }, 500);
    }
    history.pushState = function() {
        _pushState.apply(this, arguments);
        trigger();
    };
    history.replaceState = function() {
        _replaceState.apply(this, arguments);
        trigger();
    };
    window.addEventListener('popstate', trigger);
}
hookHistoryEvents();
