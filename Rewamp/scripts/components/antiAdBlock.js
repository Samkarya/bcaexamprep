(function() {
    // Configuration object - can be modified as needed
    const config = {
        gracePeriodMinutes: 1, // Default grace period in minutes before showing the message
        imageUrl: '', // Optional image URL to display in the message
        verificationImageUrl: '', // Optional image URL to display in verification message
        mainMessage: 'We noticed you\'re using an ad blocker',
        subMessage: 'Our content is supported by ads. Please consider disabling your ad blocker to help us continue providing free content.',
        ctaPrimary: 'I\'ve disabled my ad blocker',
        ctaSecondary: 'Continue with ad blocker',
        thankYouMessage: 'Thank you for supporting us!',
        countdownMessage: 'This message will close in {seconds} seconds...',
        verificationMessage: 'We\'re still detecting an ad blocker',
        verificationSubMessage: 'Please follow these steps to disable your ad blocker:',
        forcedMode: false, // If true, users cannot access the site without disabling ad blocker
        persistentTimer: true, // If true, grace period timer continues across page visits
        observerEnabled: true // If true, detects if overlay is removed via dev tools
    };

    // Create CSS styles for the overlay
    const styles = `
        .ad-blocker-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.85);
            z-index: 999999;
            overflow: auto;
            backdrop-filter: blur(5px);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .ad-blocker-container {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
            margin: 10vh auto;
            max-width: 500px;
            padding: 2rem;
            text-align: center;
            position: relative;
        }
        
        .ad-blocker-image {
            max-width: 100%;
            margin-bottom: 1.5rem;
            border-radius: 4px;
        }
        
        .ad-blocker-title {
            font-size: 1.75rem;
            margin-bottom: 1rem;
            color: #333;
        }
        
        .ad-blocker-message {
            font-size: 1rem;
            line-height: 1.5;
            margin-bottom: 1.5rem;
            color: #555;
        }
        
        .ad-blocker-buttons {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-top: 1.5rem;
        }
        
        .ad-blocker-button {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            font-weight: 600;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
        }
        
        .ad-blocker-button-primary {
            background-color: #4CAF50;
            color: white;
        }
        
        .ad-blocker-button-primary:hover {
            background-color: #45a049;
        }
        
        .ad-blocker-button-secondary {
            background-color: #f1f1f1;
            color: #333;
        }
        
        .ad-blocker-button-secondary:hover {
            background-color: #e5e5e5;
        }
        
        .ad-blocker-countdown {
            margin-top: 1rem;
            font-size: 0.875rem;
            color: #777;
        }
        
        .ad-blocker-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            font-size: 1.5rem;
            cursor: pointer;
            color: #999;
            background: none;
            border: none;
            line-height: 1;
        }
        
        .ad-blocker-close:hover {
            color: #333;
        }
        
        .ad-blocker-view {
            display: none;
        }
        
        .ad-blocker-view.active {
            display: block;
        }
        
        .verification-steps {
            text-align: left;
            margin: 1rem 0;
        }
        
        .verification-steps li {
            margin-bottom: 0.5rem;
        }
    `;

    // Add CSS to the page
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    // Create the ad detection elements
    const t = "pointer-events: none; height: 1px; width: 0; opacity: 0; visibility: hidden; position: fixed; bottom: 0;";
    const adDetectionDiv = document.createElement("div");
    const bannerAdsDiv = document.createElement("div");
    const adsByGoogleIns = document.createElement("ins");

    adDetectionDiv.id = "div-gpt-ad-3061307416813-0";
    adDetectionDiv.style = t;
    bannerAdsDiv.className = "textads banner-ads banner_ads ad-unit ad-zone ad-space adsbox ads";
    bannerAdsDiv.style = t;
    adsByGoogleIns.className = "adsbygoogle";
    adsByGoogleIns.style = "display: none;";

    const adElements = { allowed: null, elements: [adDetectionDiv, bannerAdsDiv, adsByGoogleIns] };

    // Function to check if ads are blocked
    function checkAdsStatus(callback) {
        const body = document.body;

        if (typeof callback === "function") {
            if (typeof adElements.allowed === "boolean") {
                callback(adElements);
            } else {
                body.appendChild(adDetectionDiv);
                body.appendChild(bannerAdsDiv);
                body.appendChild(adsByGoogleIns);
                
                setTimeout(function() {
                    if (adDetectionDiv.offsetHeight === 0 || bannerAdsDiv.offsetHeight === 0 || adsByGoogleIns.firstElementChild) {
                        adElements.allowed = false;
                        callback(adElements);
                    } else {
                        const scriptElement = document.createElement("script");
                        scriptElement.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
                        scriptElement.async = true;
                        scriptElement.crossOrigin = "anonymous";
                        scriptElement.onload = function() { adElements.allowed = true; callback(adElements); };
                        scriptElement.onerror = function() { adElements.allowed = false; callback(adElements); };
                        document.head.appendChild(scriptElement);
                    }
                    
                    adDetectionDiv.remove();
                    bannerAdsDiv.remove();
                    adsByGoogleIns.remove();
                }, 100);
            }
        }
    }

    // Create the overlay HTML
    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'ad-blocker-overlay';
        overlay.className = 'ad-blocker-overlay';

        const mainImageHtml = config.imageUrl ? 
            `<img src="${config.imageUrl}" alt="Ad Blocker Detected" class="ad-blocker-image">` : '';
            
        const verificationImageHtml = config.verificationImageUrl ? 
            `<img src="${config.verificationImageUrl}" alt="Verification Required" class="ad-blocker-image">` : '';

        overlay.innerHTML = `
            <div class="ad-blocker-container">
                <button class="ad-blocker-close" id="ad-blocker-close" ${config.forcedMode ? 'style="display:none"' : ''}>&times;</button>
                
                <!-- Initial Message View -->
                <div id="initial-message-view" class="ad-blocker-view active">
                    ${mainImageHtml}
                    <h2 class="ad-blocker-title">${config.mainMessage}</h2>
                    <p class="ad-blocker-message">${config.subMessage}</p>
                    <div class="ad-blocker-buttons">
                        <button class="ad-blocker-button ad-blocker-button-primary" id="ad-blocker-continue">${config.ctaPrimary}</button>
                        <button class="ad-blocker-button ad-blocker-button-secondary" id="ad-blocker-dismiss" ${config.forcedMode ? 'style="display:none"' : ''}>${config.ctaSecondary}</button>
                    </div>
                </div>
                
                <!-- Verification Message View -->
                <div id="verification-message-view" class="ad-blocker-view">
                    ${verificationImageHtml}
                    <h2 class="ad-blocker-title">${config.verificationMessage}</h2>
                    <p class="ad-blocker-message">${config.verificationSubMessage}</p>
                    <ul class="verification-steps">
                        <li>Check that your ad blocker extension is completely disabled</li>
                        <li>Refresh the page after disabling</li>
                        <li>If using multiple ad blockers, ensure all are disabled</li>
                    </ul>
                    <div class="ad-blocker-buttons">
                        <button class="ad-blocker-button ad-blocker-button-primary" id="verify-again-button">I've disabled it, check again</button>
                        <button class="ad-blocker-button ad-blocker-button-secondary" id="refresh-page-button">Refresh page</button>
                    </div>
                </div>
                
                <!-- Thank You Message View -->
                <div id="thank-you-message-view" class="ad-blocker-view">
                    <h2 class="ad-blocker-title">Thank You!</h2>
                    <p class="ad-blocker-message">${config.thankYouMessage}</p>
                    <div class="ad-blocker-countdown" id="ad-blocker-countdown"></div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        
        // Add event listeners
        document.getElementById('ad-blocker-continue').addEventListener('click', verifyAdBlockerDisabled);
        if (!config.forcedMode) {
            document.getElementById('ad-blocker-dismiss').addEventListener('click', dismissOverlay);
            document.getElementById('ad-blocker-close').addEventListener('click', dismissOverlay);
        }
        document.getElementById('verify-again-button').addEventListener('click', verifyAdBlockerDisabled);
        document.getElementById('refresh-page-button').addEventListener('click', function() {
            window.location.reload();
        });
    }

    // Show the overlay
    function showOverlay() {
        const overlay = document.getElementById('ad-blocker-overlay');
        if (overlay) {
            overlay.style.display = 'block';
        } else {
            createOverlay();
            document.getElementById('ad-blocker-overlay').style.display = 'block';
        }
        
        // Set up the observer if enabled
        if (config.observerEnabled) {
            setupOverlayObserver();
        }
    }

    // Hide the overlay
    function hideOverlay() {
        const overlay = document.getElementById('ad-blocker-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // Switch between different views
    function switchToView(viewId) {
        const views = document.querySelectorAll('.ad-blocker-view');
        views.forEach(view => view.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
    }

    // Verify if ad blocker is disabled
    function verifyAdBlockerDisabled() {
        checkAdsStatus(function(ads) {
            if (ads.allowed) {
                showThankYouMessage();
            } else {
                switchToView('verification-message-view');
            }
        });
    }

    // Show thank you message with countdown
    function showThankYouMessage() {
        switchToView('thank-you-message-view');
        
        let seconds = 5;
        const countdownElement = document.getElementById('ad-blocker-countdown');
        
        const countdownInterval = setInterval(function() {
            countdownElement.textContent = config.countdownMessage.replace('{seconds}', seconds);
            
            if (seconds <= 0) {
                clearInterval(countdownInterval);
                hideOverlay();
                sessionStorage.setItem('adBlockerDisabled', 'true');
            }
            
            seconds--;
        }, 1000);
        
        countdownElement.textContent = config.countdownMessage.replace('{seconds}', seconds);
    }

    // Dismiss the overlay and set storage
    function dismissOverlay() {
        hideOverlay();
        // Use sessionStorage if we want it to last just for this session
        sessionStorage.setItem('adBlockerDismissed', 'true');
    }
    
    // Set up grace period timer
    function setupGracePeriod() {
        const expireTime = config.gracePeriodMinutes * 60 * 1000;
        const currentTime = new Date().getTime();
        
        // Check if we already have a timer running
        let gracePeriodEnd = sessionStorage.getItem('adBlockerGracePeriodEnd');
        
        if (!gracePeriodEnd || !config.persistentTimer) {
            // Set new expiration time
            gracePeriodEnd = currentTime + expireTime;
            sessionStorage.setItem('adBlockerGracePeriodEnd', gracePeriodEnd);
        }
        
        // Calculate remaining time
        const remainingTime = gracePeriodEnd - currentTime;
        
        if (remainingTime <= 0) {
            // Grace period already expired
            checkAndShowOverlay();
        } else {
            // Set timeout for remaining time
            setTimeout(function() {
                checkAndShowOverlay();
            }, remainingTime);
        }
    }
    
    // Check and show overlay if ad blocker detected
    function checkAndShowOverlay() {
        checkAdsStatus(function(ads) {
            if (!ads.allowed) {
                showOverlay();
            }
        });
    }
    
    // Set up observer to detect if overlay is removed via dev tools
    function setupOverlayObserver() {
        const overlay = document.getElementById('ad-blocker-overlay');
        if (!overlay) return;
        
        // Create an observer instance
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                    // Check if display is being modified
                    if (overlay.style.display === 'none' || 
                        !overlay.classList.contains('ad-blocker-overlay')) {
                        // If we're in forced mode and no proper dismissal happened
                        if (config.forcedMode && 
                            !sessionStorage.getItem('adBlockerDisabled') && 
                            !sessionStorage.getItem('adBlockerDismissed')) {
                            // Reset the overlay
                            setTimeout(function() {
                                overlay.style.display = 'block';
                                if (!overlay.classList.contains('ad-blocker-overlay')) {
                                    overlay.classList.add('ad-blocker-overlay');
                                }
                            }, 100);
                        }
                    }
                }
            });
        });
        
        // Configuration of the observer
        const config = { attributes: true };
        
        // Start observing
        observer.observe(overlay, config);
        
        // Watch for removal of the entire overlay element
        const bodyObserver = new MutationObserver(function(mutations) {
            if (!document.getElementById('ad-blocker-overlay') && 
                config.forcedMode && 
                !sessionStorage.getItem('adBlockerDisabled') && 
                !sessionStorage.getItem('adBlockerDismissed')) {
                // Recreate the overlay if it was removed
                createOverlay();
                document.getElementById('ad-blocker-overlay').style.display = 'block';
                setupOverlayObserver(); // Re-establish observers
                switchToView('initial-message-view');
            }
        });
        
        // Start observing the body for child removals
        bodyObserver.observe(document.body, { childList: true });
    }

    // Initialize the anti-adblock system
    function initAntiAdblock(options) {
        // Merge user options with default config
        if (options) {
            Object.assign(config, options);
        }
        
        // Check if already handled
        if (sessionStorage.getItem('adBlockerDisabled') === 'true' || 
           (!config.forcedMode && sessionStorage.getItem('adBlockerDismissed') === 'true')) {
            return;
        }
        
        // Create overlay (hidden initially)
        createOverlay();
        
        // Start grace period timer if specified
        if (config.gracePeriodMinutes > 0) {
            setupGracePeriod();
        } else {
            // Check immediately if no grace period
            checkAndShowOverlay();
        }
    }

    // Expose the initialization function to global scope
    window.initAntiAdblock = initAntiAdblock;
})();

// Usage example:
// initAntiAdblock({
//     gracePeriodMinutes: 2,
//     imageUrl: 'https://example.com/your-image.jpg',
//     verificationImageUrl: 'https://example.com/verification-image.jpg',
//     forcedMode: true,
//     persistentTimer: true,
//     observerEnabled: true
// });