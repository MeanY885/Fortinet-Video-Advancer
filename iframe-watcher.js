// This script runs in the top frame and watches for iframes being added or changed
// If a new iframe matches the Fortinet player domain, it injects the content script

const TARGET_HOST = 'training.fortinet.com';
const TARGET_PATH = '/scorm/player.php'; // Main SCORM path
const STORY_CONTENT = 'story_content'; // Storyline 360 content path

// Keep track of frames we've already processed to avoid duplicates
const processedFrames = new Set();

// Get the frame ID based on URL and other attributes - returns a hash-like string
function getFrameIdentifier(iframe) {
    const src = iframe.src || '';
    const id = iframe.id || '';
    return `${src}|${id}`;
}

function injectIntoMatchingIframes() {
    const iframes = Array.from(document.getElementsByTagName('iframe'));
    for (const iframe of iframes) {
        try {
            const src = iframe.src || '';
            const id = iframe.id || '';
            const frameIdentifier = getFrameIdentifier(iframe);
            
            // If we've already processed this frame, skip it
            if (processedFrames.has(frameIdentifier)) {
                continue;
            }
            
            let shouldInject = false;
            let frameType = 'unknown';
            
            // Check for Fortinet SCORM player
            if (src.includes(TARGET_HOST) && src.includes(TARGET_PATH)) {
                shouldInject = true;
                frameType = 'scorm';
            }
            
            // Also look for Storyline 360 content (often loaded in scorm_object iframe)
            if (id === 'scorm_object' || src.includes(STORY_CONTENT)) {
                shouldInject = true;
                frameType = 'storyline';
            }
            
            if (shouldInject) {
                console.log(`[FAA] Found ${frameType} iframe:`, src);
                // Mark this frame as processed
                processedFrames.add(frameIdentifier);
                
                // Find the frameId for this iframe
                const frameIndex = iframes.indexOf(iframe);
                const frameId = frameIndex + 1; // Frame IDs typically start at 1 for first iframe
                
                // Inject content.js into this iframe
                chrome.runtime.sendMessage({
                    action: 'injectContentScript',
                    frameId: frameId,
                    frameSrc: src,
                    frameType: frameType
                });
            }
        } catch (e) {
            // Ignore cross-origin errors
            console.log('[FAA] Error checking iframe:', e.message);
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
