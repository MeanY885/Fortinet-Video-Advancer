// Fortinet Video Auto-Advancer Content Script with Toggle and Debug Console
(function() {
    // ================= UI SETUP =================
    function injectUI() {
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
    }

    // Call after UI is injected
    // Prevent multiple UI instances
    if (!window._faaUiInjected) {
        var progressBarFill = document.querySelector('[data-ref="progressBarFill"]');
        if (progressBarFill) {
            var widthMatch = (progressBarFill.getAttribute('style')||'').match(/width:\s*([0-9.]+)%/);
            var width = widthMatch ? parseFloat(widthMatch[1]) : 0;
            if (width > 2) {
                window._faaUiInjected = true;
                injectUI();
            }
        }
    }

    // ================ DEBUG CONSOLE ================
    let lastDebugMsg = null;
    function logDebug(msg) {
        if (msg === lastDebugMsg) return; // suppress consecutive duplicate
        lastDebugMsg = msg;
        const consoleDiv = document.getElementById('faa-debug-console');
        if (consoleDiv) {
            const now = new Date();
            const timestr = now.toLocaleTimeString();
            const entry = document.createElement('div');
            entry.textContent = `[${timestr}] ${msg}`;
            consoleDiv.appendChild(entry);
            consoleDiv.scrollTop = consoleDiv.scrollHeight;
        }
        // Optionally, also log to browser console for devs
        // console.log('[FAA]', msg);
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

    // ================ MAIN LOGIC ================
    let observer = null;
    let lastWasComplete = false;
    let advanceTimeout = null;

    // Removed waitForScormAndProgressBar, no longer needed


    function waitForProgressBarFill() {
        let hasLoggedNeverFound = false;
        function poll() {
            const progressBarFill = document.querySelector('[data-ref="progressBarFill"]');
            if (!progressBarFill) {
                if (!hasLoggedNeverFound) {
                    logDebug('Waiting for progress bar...');
                    hasLoggedNeverFound = true;
                }
                setTimeout(poll, 1000);
                return;
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

    // ================ INIT ================
    function setupToggleUI() {
        injectUI();
        const toggle = document.getElementById('faa-toggle');
        getToggleState((enabled) => {
            toggle.checked = !!enabled;
        });
        toggle.addEventListener('change', (e) => {
            setToggleState(e.target.checked);
        });
    }

    function startScript() {
        function afterDOMReady() {
            // Only run if the progress bar is present in this frame
            if (!document.querySelector('[data-ref="progressBarFill"]')) {
                return; // Do nothing in frames without the player bar
            }
            setupToggleUI();
            waitForProgressBarFill(); // Directly start polling for progress bar
            setupManualNextListener();
            logDebug('Extension loaded.');
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', afterDOMReady);
        } else {
            afterDOMReady();
        }
    }
    startScript();
})();
