// Fortinet Video Auto-Advancer Content Script with Toggle and Debug Console
(function() {
    // Track the current lesson number for sequential navigation
    let currentLessonNumber = 2; // Start with LESSON02
    
    // Ensure UI is only injected in the top frame
    const isTopFrame = window === window.top;
    // ================= UI SETUP =================
    function injectUI() {
        // Only inject UI in the top frame
        if (!isTopFrame) return;
        
        // Check if UI already exists on the page
        const oldUi = document.getElementById('fortinet-auto-advancer-ui');
        if (oldUi) oldUi.remove();
        
        const container = document.createElement('div');
        container.id = 'fortinet-auto-advancer-ui';
        container.innerHTML = `
            <style>
                #fortinet-auto-advancer-ui {
                    position: fixed;
                    top: 4px;
                    right: 4px;
                    z-index: 99999;
                    background: rgba(34, 34, 34, 0.97);
                    border-radius: 10px;
                    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.12);
                    padding: 8px 10px 8px 12px;
                    min-width: 180px;
                    font-family: 'Segoe UI', Arial, sans-serif;
                    color: #fff;
                    font-size: 14px;
                    max-width: 95vw;
                    max-height: 90vh;
                    overflow: auto;
                }
                #fortinet-auto-advancer-ui h4 {
                    margin: 0 0 6px 0;
                    font-size: 16px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                #faa-toggle-row {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px;
                }
                #faa-toggle-label {
                    margin-right: 8px;
                }
                #faa-toggle {
                    width: 38px;
                    height: 20px;
                    appearance: none;
                    background: #444;
                    outline: none;
                    border-radius: 12px;
                    position: relative;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                #faa-toggle:checked {
                    background: #4caf50;
                }
                #faa-toggle::before {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #fff;
                    transition: transform 0.2s;
                }
                #faa-toggle:checked::before {
                    transform: translateX(18px);
                }
                #faa-debug-console {
                    background: #222;
                    border-radius: 6px;
                    margin-top: 5px;
                    padding: 8px 6px;
                    font-size: 13px;
                    max-height: 120px;
                    overflow-y: auto;
                }
            </style>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                <span style="font-weight:bold;font-size:14px;">Fortinet Auto Advancer</span>
                <div style="display:flex;gap:3px;">
                    <button id="faa-reset-btn" style="background:#d9534f;color:#fff;border:none;border-radius:3px;padding:2px 6px;cursor:pointer;font-size:12px;">Reset to LESSON02</button>
                    <button id="faa-showlog-btn" style="background:#444;color:#fff;border:none;border-radius:3px;padding:2px 6px;cursor:pointer;font-size:12px;">Hide Log</button>
                    <button id="faa-hideui-btn" style="background:#444;color:#fff;border:none;border-radius:3px;padding:2px 6px;cursor:pointer;font-size:12px;">Hide UI</button>
                    <button id="faa-closeui-btn" style="background:#444;color:#fff;border:none;border-radius:3px;padding:2px 6px;cursor:pointer;font-size:12px;">×</button>
                </div>
            </div>
            <div id="faa-toggle-row" style="margin-top:6px;display:flex;align-items:center;gap:8px;">
                <span id="faa-toggle-label">Auto-Advance:</span>
                <input type="checkbox" id="faa-toggle" />
            </div>
            <div id="faa-debug-console" style="margin-top:6px;"></div>

        `;
        document.body.appendChild(container);
        setupAdvancerUIButtons();
        // Ensure the UI stays within viewport if moved
        function clampToViewport() {
            const rect = container.getBoundingClientRect();
            let changed = false;
            let left = rect.left, top = rect.top;
            if (rect.right > window.innerWidth) { left -= (rect.right - window.innerWidth); changed = true; }
            if (rect.bottom > window.innerHeight) { top -= (rect.bottom - window.innerHeight); changed = true; }
            if (rect.left < 0) { left = 0; changed = true; }
            if (rect.top < 0) { top = 0; changed = true; }
            if (changed) {
                container.style.left = left + 'px';
                container.style.top = top + 'px';
                container.style.right = '';
            }
        }
        // Clamp after any mouseup (in case user moves it)
        window.addEventListener('mouseup', clampToViewport);
        // Clamp on window resize
        window.addEventListener('resize', clampToViewport);
        // Clamp initially
        setTimeout(clampToViewport, 100);
    }

    // ================ UI BUTTON LOGIC ================
    function setupAdvancerUIButtons() {
        var showLogBtn = document.getElementById('faa-showlog-btn');
        var debugConsole = document.getElementById('faa-debug-console');
        var hideUiBtn = document.getElementById('faa-hideui-btn');
        var closeUiBtn = document.getElementById('faa-closeui-btn');
        var resetBtn = document.getElementById('faa-reset-btn');
        var advUi = document.getElementById('fortinet-auto-advancer-ui');
        if (showLogBtn && debugConsole) {
            showLogBtn.addEventListener('click', function() {
                if (debugConsole.style.display === 'none') {
                    debugConsole.style.display = '';
                    showLogBtn.textContent = 'Hide Log';
                } else {
                    debugConsole.style.display = 'none';
                    showLogBtn.textContent = 'Show Log';
                }
            });
        }
        if (hideUiBtn && advUi) {
            hideUiBtn.addEventListener('click', function() {
                advUi.style.display = 'none';
                var restoreBtn = document.createElement('button');
                restoreBtn.id = 'faa-restoreui-btn';
                restoreBtn.textContent = 'Show Advancer';
                restoreBtn.style.position = 'fixed';
                restoreBtn.style.top = '4px';
                restoreBtn.style.right = '4px';
                restoreBtn.style.zIndex = 100000;
                restoreBtn.style.background = '#444';
                restoreBtn.style.color = '#fff';
                restoreBtn.style.border = 'none';
                restoreBtn.style.borderRadius = '8px';
                restoreBtn.style.fontSize = '12px';
                restoreBtn.style.padding = '2px 10px';
                restoreBtn.style.cursor = 'pointer';
                restoreBtn.onclick = function() {
                    advUi.style.display = '';
                    restoreBtn.remove();
                };
                document.body.appendChild(restoreBtn);
            });
        }
        if (closeUiBtn && advUi) {
            closeUiBtn.addEventListener('click', function() {
                advUi.style.display = 'none';
                var reopenBtn = document.createElement('button');
                reopenBtn.id = 'faa-reopenui-btn';
                reopenBtn.textContent = '🟢';
                reopenBtn.title = 'Show Fortinet Advancer';
                reopenBtn.style.position = 'fixed';
                reopenBtn.style.top = '4px';
                reopenBtn.style.right = '4px';
                reopenBtn.style.zIndex = 100000;
                reopenBtn.style.background = '#fff';
                reopenBtn.style.color = '#444';
                reopenBtn.style.border = '1px solid #444';
                reopenBtn.style.borderRadius = '10px';
                reopenBtn.style.fontSize = '16px';
                reopenBtn.style.padding = '2px 10px';
                reopenBtn.style.cursor = 'pointer';
                reopenBtn.onclick = function() {
                    advUi.style.display = '';
                    reopenBtn.remove();
                };
                document.body.appendChild(reopenBtn);
            });
        }
        
        // Add reset button event listener
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                setCurrentLessonNumber(2); // Reset to LESSON02
                logDebug('State reset - Current lesson set back to LESSON02');
                
                // If on homepage, attempt to find and click LESSON02 now
                if (isHomePage()) {
                    setTimeout(() => {
                        findAndClickNextLesson();
                    }, 500);
                }
            });
        }
    }

    // Call after UI is injected - but only in top frame
    // Prevent multiple UI instances
    if (isTopFrame && !window._faaUiInjected) {
        // Only inject UI in top frame, regardless of whether we find a progress bar
        window._faaUiInjected = true;
        injectUI();
    }

    // ================ DEBUG CONSOLE ================
    let lastDebugMsg = null;
    function logDebug(msg) {
        if (msg === lastDebugMsg) return; // suppress consecutive duplicate
        lastDebugMsg = msg;
        
        // Always log to console for debugging
        console.log('[FAA]', msg);
        
        // If we're in an iframe, send the message to the top frame
        if (!isTopFrame) {
            try {
                window.top.postMessage({
                    type: 'faa-debug',
                    message: msg
                }, '*');
            } catch (e) {
                // Ignore cross-origin errors
            }
            return;
        }
        
        // In top frame, update the UI
        const consoleDiv = document.getElementById('faa-debug-console');
        if (consoleDiv) {
            const now = new Date();
            const timestr = now.toLocaleTimeString();
            const entry = document.createElement('div');
            entry.textContent = `[${timestr}] ${msg}`;
            consoleDiv.appendChild(entry);
            consoleDiv.scrollTop = consoleDiv.scrollHeight;
        }
    }
    
    // Listen for messages from iframes
    if (isTopFrame) {
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'faa-debug') {
                logDebug(`[iframe] ${event.data.message}`);
            }
        });
    }

    // ================ TOGGLE HANDLING ================
    function setToggleState(enabled) {
        const toggle = document.getElementById('faa-toggle');
        if (toggle) toggle.checked = !!enabled;
        chrome.storage.local.set({ 'faa_enabled': !!enabled });
        logDebug('Auto-Advance ' + (enabled ? 'ENABLED' : 'DISABLED'));
    }
    function getToggleState(cb) {
        chrome.storage.local.get(['faa_enabled'], (result) => {
            cb(result.faa_enabled !== false); // default ON
        });
    }
    function getCurrentLessonNumber(cb) {
        chrome.storage.local.get(['faa_current_lesson'], (result) => {
            cb(result.faa_current_lesson || 2); // default to start with LESSON02
        });
    }
    function setCurrentLessonNumber(lessonNumber) {
        chrome.storage.local.set({ 'faa_current_lesson': lessonNumber });
        currentLessonNumber = lessonNumber;
        logDebug(`Current lesson number set to ${lessonNumber}`);
    }

    // ================ MAIN LOGIC ================
    let observer = null;
    let lastWasComplete = false;
    let advanceTimeout = null;

    // Removed waitForScormAndProgressBar, no longer needed


    function waitForProgressBarFill() {
        let hasLoggedNeverFound = false;
        let storylineProgressInterval = null;
        
        function checkForStorylineProgress() {
            // Check for Storyline 360 progress elements
            const storylineProgressIndicators = [
                // Check for Storyline's progress control div
                document.querySelector('#progress-container'),
                // Check for a control bar that might contain progress
                document.querySelector('#control-bar'),
                // Check for standard Storyline progress elements
                document.querySelector('.slide-progress'),
                // Look for any element with progress in the class name
                document.querySelector('[class*="progress"]'),
                // Look for any element with slider in the class name
                document.querySelector('[class*="slider"]')
            ].filter(Boolean);
            
            if (storylineProgressIndicators.length > 0) {
                logDebug('Found Storyline progress indicators: ' + storylineProgressIndicators.length);
                // Clear interval since we found progress indicators
                if (storylineProgressInterval) {
                    clearInterval(storylineProgressInterval);
                    storylineProgressInterval = null;
                }
                
                // Setup an interval to check for progress
                setInterval(() => {
                    // For Storyline content, we need to periodically check if we're at the end
                    // Check if we can find a Next button that's active
                    const nextButtons = Array.from(document.querySelectorAll('button, .button, [role="button"], #next, #nextBtn, .next-slide, .nextslide, .button-next'));
                    const activeNextButton = nextButtons.find(btn => {
                        const text = (btn.textContent || '').toLowerCase();
                        const isVisible = btn.offsetParent !== null;
                        const isNext = text.includes('next') || btn.id.toLowerCase().includes('next') || 
                                    (btn.className && btn.className.toLowerCase().includes('next'));
                        return isVisible && isNext && !btn.disabled;
                    });
                    
                    if (activeNextButton) {
                        logDebug('Found active Next button in Storyline content. Clicking it.');
                        activeNextButton.click();
                    }
                    
                    // Also check for completion indicators
                    const completionIndicators = [
                        document.querySelector('.completed'),
                        document.querySelector('.complete-slide'),
                        document.querySelector('.finish-slide'),
                        document.querySelector('[data-complete="true"]')
                    ].filter(Boolean);
                    
                    if (completionIndicators.length > 0) {
                        logDebug('Found completion indicators. Attempting to advance.');
                        clickNextButton();
                    }
                }, 5000);
                
                return true;
            }
            
            return false;
        }
        
        function poll() {
            // First try to find standard Fortinet progress bar
            const progressBarFill = document.querySelector('[data-ref="progressBarFill"]');
            
            if (!progressBarFill) {
                // If no standard progress bar, check for Storyline progress
                if (checkForStorylineProgress()) {
                    // Found Storyline progress indicators, stop polling
                    return;
                }
                
                if (!hasLoggedNeverFound) {
                    logDebug('Waiting for progress bar...');
                    // Start a separate interval to check for Storyline content
                    if (!storylineProgressInterval) {
                        storylineProgressInterval = setInterval(() => {
                            if (checkForStorylineProgress()) {
                                clearInterval(storylineProgressInterval);
                                storylineProgressInterval = null;
                            }
                        }, 2000);
                    }
                    hasLoggedNeverFound = true;
                }
                setTimeout(poll, 1000);
                return;
            }
            
            // Clear Storyline check interval if we found the standard progress bar
            if (storylineProgressInterval) {
                clearInterval(storylineProgressInterval);
                storylineProgressInterval = null;
            }
            
            logDebug('Progress bar found. Observing...');
            observer = new MutationObserver(() => {
                checkAndAdvance(progressBarFill);
            });
            observer.observe(progressBarFill, { attributes: true, attributeFilter: ['style'] });
            checkAndAdvance(progressBarFill);
        }
        
        poll();
    }

    function checkAndAdvance(progressBarFill) {
        getToggleState((enabled) => {
            if (!enabled) return;
            const style = progressBarFill.getAttribute('style') || '';
            if (style.includes('width: 100%')) {
                if (!lastWasComplete) {
                    logDebug('Progress bar reached 100%. Waiting 2s to advance...');
                    lastWasComplete = true;
                    if (advanceTimeout) clearTimeout(advanceTimeout);
                    advanceTimeout = setTimeout(() => {
                        logDebug('Clicked NEXT.');
                        clickNextButton();
                    }, 2000);
                }
            } else {
                lastWasComplete = false;
                if (advanceTimeout) {
                    clearTimeout(advanceTimeout);
                    advanceTimeout = null;
                }
            }
        });
    }

    // --- XHR Logging ---
    let logNextXhr = false;
    (function patchXHR() {
        const origOpen = window.XMLHttpRequest.prototype.open;
        const origSend = window.XMLHttpRequest.prototype.send;
        window.XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            this._faa_url = url;
            return origOpen.apply(this, [method, url, ...rest]);
        };
        window.XMLHttpRequest.prototype.send = function(...args) {
            this.addEventListener('load', function() {
                if (logNextXhr) {
                    // Only log .js XHRs (like in your screenshot)
                    if (typeof this._faa_url === 'string' && this._faa_url.match(/\.js(\?|$)/)) {
                        logDebug(`XHR: ${this._faa_url} [${this.status}] (${this.responseType || 'text'})`);
                    }
                }
            });
            return origSend.apply(this, args);
        };
    })();

    // Listen for manual clicks on NEXT
    function setupManualNextListener() {
        const navButtons = getNextButtons();
        if (navButtons.length === 0) {
            logDebug('No navigation button/link found for manual click listener.');
            return;
        }
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                logDebug('NEXT navigation triggered (manual or auto). Will log next XHRs.');
                logNextXhr = true;
                setTimeout(() => { logNextXhr = false; }, 2000);
            });
        });
    }

    function getNextButtons() {
        // Prefer #next button as seen in Storyline player
        const nextBtn = document.getElementById('next');
        if (nextBtn && nextBtn.offsetParent !== null) return [nextBtn];
        // Fallback to #next-activity-link if present (legacy/top-level)
        const nextLink = document.getElementById('next-activity-link');
        if (nextLink && nextLink.offsetParent !== null) return [nextLink];
        // Fallback: try visible buttons with NEXT label (for resilience)
        const candidates = Array.from(document.querySelectorAll('button, a')).filter(el => {
            return el.offsetParent !== null && /next/i.test(el.textContent);
        });
        return candidates;
    }

    function clickNextButton() {
        const navButtons = getNextButtons();
        if (navButtons.length > 0) {
            logDebug('Clicking NEXT navigation.');
            navButtons[0].click();
            logDebug('NEXT navigation triggered (auto). Will log next XHRs.');
            logNextXhr = true;
            setTimeout(() => { logNextXhr = false; }, 2000);
        } else {
            logDebug('No NEXT navigation button or link found or visible. Attempting redirect to course homepage.');
            // Try to find the course homepage link in current frame
            var backToCourse = document.querySelector('a.backtocourse[href*="course/view.php?id="]');
            if (backToCourse && backToCourse.href) {
                logDebug('Redirecting to course homepage from current frame: ' + backToCourse.href);
                window.location.href = backToCourse.href;
                return;
            }
            // Try to find the course homepage link in top window (if not same as current)
            try {
                if (window.top && window.top !== window && window.top.document) {
                    var topBackToCourse = window.top.document.querySelector('a.backtocourse[href*="course/view.php?id="]');
                    if (topBackToCourse && topBackToCourse.href) {
                        logDebug('Redirecting to course homepage from top window: ' + topBackToCourse.href);
                        window.top.location.href = topBackToCourse.href;
                        return;
                    } else {
                        logDebug('No course homepage link found in top window.');
                    }
                }
            } catch (e) {
                logDebug('Unable to access top window for course homepage link (likely cross-origin).');
            }
            logDebug('No course homepage link found in any context.');
        }
    }
    
    // Function to check if we're on the homepage
    function isHomePage() {
        // Check if we're on the course view page
        return window.location.href.includes('course/view.php');
    }
    
    // Function to find and click the next lesson in sequence
    function findAndClickNextLesson() {
        getCurrentLessonNumber(lessonNumber => {
            // Format with space after LESSON as seen in HTML: "LESSON 02"
            const lessonNumber2Digits = String(lessonNumber).padStart(2, '0');
            const lessonSpaceFormat = `LESSON ${lessonNumber2Digits}`;
            const lessonNoSpaceFormat = `LESSON${lessonNumber2Digits}`;
            
            logDebug(`Looking for lesson formats: "${lessonSpaceFormat}" or "${lessonNoSpaceFormat}"...`);
            
            // Track the clickable parent element
            let lessonElement = null;
            let lessonLink = null;
            
            // First approach: Find direct data-activityname attributes
            const activityElements = document.querySelectorAll('[data-activityname]');
            for (const element of activityElements) {
                const activityName = element.getAttribute('data-activityname');
                if (activityName && (
                    activityName.includes(lessonSpaceFormat) || 
                    activityName.includes(lessonNoSpaceFormat)
                )) {
                    // Found the lesson container - now find closest clickable element
                    lessonElement = element;
                    logDebug(`Found lesson ${lessonNumber} by data-activityname: "${activityName}"`);
                    
                    // Try to find the anchor tag within this container
                    const anchor = element.querySelector('a');
                    if (anchor) {
                        lessonLink = anchor;
                        logDebug('Found anchor element inside activity container');
                    } else {
                        // The element itself might be clickable
                        lessonLink = element;
                    }
                    break;
                }
            }
            
            // Second approach: Look for div.activityname with matching text inside its children
            if (!lessonLink) {
                const activityNameDivs = document.querySelectorAll('div.activityname');
                for (const div of activityNameDivs) {
                    const text = div.textContent || '';
                    if (text.includes(lessonSpaceFormat) || text.includes(lessonNoSpaceFormat)) {
                        // Found a matching activity name - check for parent link
                        let parent = div;
                        // Walk up 5 levels at most to find a clickable parent
                        for (let i = 0; i < 5; i++) {
                            if (!parent) break;
                            
                            // Check if this element has an anchor
                            const anchor = parent.querySelector('a');
                            if (anchor) {
                                lessonLink = anchor;
                                logDebug(`Found lesson ${lessonNumber} link from activityname div: "${text}"`);
                                break;
                            }
                            
                            // Move to parent
                            parent = parent.parentElement;
                        }
                        if (lessonLink) break;
                    }
                }
            }
            
            // Third approach: Look for any a[href] with text content matching our lesson
            if (!lessonLink) {
                const allLinks = document.querySelectorAll('a[href]');
                for (const link of allLinks) {
                    const text = link.textContent || '';
                    if (text.includes(lessonSpaceFormat) || text.includes(lessonNoSpaceFormat)) {
                        lessonLink = link;
                        logDebug(`Found lesson ${lessonNumber} by direct link text: "${text}"`);
                        break;
                    }
                }
            }
            
            // Fourth approach: Look through any div that has the lesson text
            if (!lessonLink) {
                const allDivs = document.querySelectorAll('div');
                for (const div of allDivs) {
                    const text = div.textContent || '';
                    if (text.includes(lessonSpaceFormat) || text.includes(lessonNoSpaceFormat)) {
                        // Check if this div or its parent is clickable
                        if (div.onclick || div.classList.contains('clickable') || div.style.cursor === 'pointer') {
                            lessonLink = div;
                            logDebug(`Found lesson ${lessonNumber} via clickable div: "${text}"`);
                            break;
                        }
                        
                        // Try to find parent activity-item
                        let parent = div.closest('.activity-item');
                        if (parent) {
                            lessonLink = parent;
                            logDebug(`Found lesson ${lessonNumber} via parent activity-item`);
                            break;
                        }
                    }
                }
            }
            
            // If found a lesson link, click it and update lesson counter
            if (lessonLink) {
                // Scroll to the element to make sure it's visible
                lessonLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Set a slight delay before clicking to ensure scrolling is complete
                setTimeout(() => {
                    // Increment the lesson number for next time
                    setCurrentLessonNumber(lessonNumber + 1);
                    
                    // Click the lesson element
                    logDebug(`Clicking on lesson ${lessonNumber}`);
                    lessonLink.click();
                }, 500);
            } else {
                logDebug(`Could not find lesson ${lessonNumber} on the page. Course may be complete.`);
            }
        });
    }

    // ================ INIT ================
    function setupToggleUI() {
        // Only set up UI in top frame
        if (!isTopFrame) return;
        
        injectUI();
        const toggle = document.getElementById('faa-toggle');
        if (!toggle) return; // UI wasn't injected
        
        getToggleState((enabled) => {
            toggle.checked = !!enabled;
        });
        toggle.addEventListener('change', (e) => {
            setToggleState(e.target.checked);
        });
    }

    // Help identify what type of content we're in
    function detectContentType() {
        try {
            // Check for Storyline 360 indicators
            const isStoryline = !!document.querySelector('#app') || 
                            !!document.querySelector('[class*="player"]') ||
                            !!document.querySelector('[class*="slide"]') ||
                            document.title.includes('Storyline') ||
                            window.location.href.includes('story_content');
            
            // Check for SCORM wrapper indicators
            const isScormWrapper = !!document.querySelector('#scorm_object') ||
                                !!document.querySelector('#scormpage') ||
                                window.location.href.includes('/scorm/player.php');
            
            return {
                isStoryline,
                isScormWrapper,
                isCourseHomepage: isHomePage()
            };
        } catch (e) {
            // Fall back to basic detection if any errors
            return {
                isStoryline: window.location.href.includes('story_content'),
                isScormWrapper: window.location.href.includes('/scorm/player.php'),
                isCourseHomepage: isHomePage()
            };
        }
    }
    
    function startScript() {
        function afterDOMReady() {
            // Always set up UI in top frame only
            if (isTopFrame) {
                setupToggleUI();
                logDebug(`Extension loaded in top frame: ${window.location.href}`);
            }
            
            const contentType = detectContentType();
            
            // Log detected content type (only if interesting)
            if (contentType.isStoryline || contentType.isScormWrapper || contentType.isCourseHomepage) {
                logDebug(`Content type detected - Storyline: ${contentType.isStoryline}, SCORM: ${contentType.isScormWrapper}, Homepage: ${contentType.isCourseHomepage}`);
            }
            
            // Check if we're on the homepage and should click the next lesson
            if (contentType.isCourseHomepage) {
                logDebug('Detected course homepage.');
                
                getToggleState(enabled => {
                    if (enabled) {
                        // Wait a moment for the page to fully load before searching for the next lesson
                        setTimeout(() => {
                            logDebug('Searching for next lesson button to click...');
                            findAndClickNextLesson();
                        }, 1500);
                    }
                });
                return;
            }
            
            // For Storyline content, always try to watch for progress
            if (contentType.isStoryline) {
                logDebug('Detected Storyline content. Setting up progress monitoring.');
                waitForProgressBarFill();
                setupManualNextListener();
                return;
            }
            
            // For standard SCORM content, only run if progress bar is visible
            const progressBarElement = document.querySelector('[data-ref="progressBarFill"]');
            if (progressBarElement) {
                logDebug('Found standard progress bar element. Setting up monitoring.');
                waitForProgressBarFill();
                setupManualNextListener();
            } else if (!contentType.isScormWrapper && !contentType.isStoryline) {
                // If no progress bar and not in a wrapper or Storyline, still try to set up monitoring
                // This is a fallback for frames that might load content dynamically
                logDebug('No progress bar found. Will poll for it to appear.');
                waitForProgressBarFill();
                setupManualNextListener();
            }
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', afterDOMReady);
        } else {
            afterDOMReady();
        }
    }
    startScript();
})();
