class SecurityManager {
    constructor() {
        this.isAuthenticated = false;
        this.overlayActive = false;
        this.devToolsOpen = false;
        this.observers = [];
    }

    initialize() {
        // Set up dev tools detection
        //this.setupDevToolsDetection();
        
        // Set up DOM mutation observer
        this.setupMutationObserver();
        
        // Set up console protection
        this.protectConsole();
        
        // Initial check for authentication
        this.checkAuthAndRespond();
    }

    setupDevToolsDetection() {
        // Method 1: Debug protection
        setInterval(() => {
            const startTime = performance.now();
            debugger;
            const endTime = performance.now();
            
            if (endTime - startTime > 100) {
                this.handleDevToolsOpen();
            }
        }, 1000);

        // Method 2: Window size detection
        const threshold = 160;
        const checkWindowSize = () => {
            if (window.outerWidth - window.innerWidth > threshold || 
                window.outerHeight - window.innerHeight > threshold) {
                this.handleDevToolsOpen();
            } else {
                this.devToolsOpen = false;
            }
        };

        window.addEventListener('resize', checkWindowSize);
        setInterval(checkWindowSize, 1000);
    }

    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    // Check if the mutation is related to our overlay
                    const isOverlayModification = mutation.target.id === 'auth-overlay' || 
                        mutation.target.closest('#auth-overlay');
                    
                    if (!isOverlayModification && !this.isAuthenticated) {
                        // Revert unauthorized DOM modifications
                        mutation.target.remove();
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            attributes: true,
            subtree: true
        });

        this.observers.push(observer);
    }

    protectConsole() {
        const protectedLog = console.log;
        const protectedWarn = console.warn;
        const protectedError = console.error;
        const protectedInfo = console.info;
        
        console.log = (...args) => {
            if (!this.devToolsOpen) {
                protectedLog.apply(console, args);
            }
        };
        
        console.warn = (...args) => {
            if (!this.devToolsOpen) {
                protectedWarn.apply(console, args);
            }
        };
        
        console.error = (...args) => {
            if (!this.devToolsOpen) {
                protectedError.apply(console, args);
            }
        };
        
        console.info = (...args) => {
            if (!this.devToolsOpen) {
                protectedInfo.apply(console, args);
            }
        };
    }

    displayOverlay() {
        if (this.overlayActive) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'auth-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            font-family: Arial, sans-serif;
        `;

        const content = `
            <div style="background: rgba(255, 255, 255, 0.1); padding: 2rem; border-radius: 10px; text-align: center; max-width: 90%; width: 400px;">
                <h1 style="color: white; font-size: 24px; margin-bottom: 20px;">
                    Access Restricted
                </h1>
                <p style="color: #ccc; margin-bottom: 20px;">
                    This content is only available for registered users.
                </p>
                <button id="create-ac" style="
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    font-size: 16px;
                    cursor: pointer;
                    border-radius: 5px;
                    margin: 5px;
                    transition: background-color 0.3s;
                ">
                    Sign Up
                </button>
                <button id="go-back-button" style="
                    background-color: #f44336;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    font-size: 16px;
                    cursor: pointer;
                    border-radius: 5px;
                    margin: 5px;
                    transition: background-color 0.3s;
                ">
                    Go Back
                </button>
            </div>
        `;

        overlay.innerHTML = content;
        document.body.appendChild(overlay);
        
        // Add event listeners
        document.getElementById('create-ac').addEventListener('click', () => {
            window.location.href = 'https://bcaexamprep.blogspot.com/p/bca-exam-prep-account.html';
        });
        
        document.getElementById('go-back-button').addEventListener('click', () => {
            window.history.back();
        });

        this.overlayActive = true;
        
        // Prevent right-click on overlay
        overlay.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Prevent keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                (e.ctrlKey && e.key === 'U')
            ) {
                e.preventDefault();
            }
        });
    }

    removeOverlay() {
        const overlay = document.getElementById('auth-overlay');
        if (overlay) {
            overlay.remove();
            this.overlayActive = false;
        }
    }

    handleDevToolsOpen() {
        this.devToolsOpen = true;
        if (!this.overlayActive) {
            this.displayOverlay();
        }
        // Optionally clear sensitive data from memory
        this.clearSensitiveData();
    }

    clearSensitiveData() {
        // Clear any sensitive data from memory
        if (window.firebaseData) {
            window.firebaseData.contents = [];
        }
        // Clear local storage
        localStorage.clear();
        // Clear session storage
        sessionStorage.clear();
    }

    checkAuthAndRespond() {
        // Check authentication status using Firebase
        if (window.firebaseData) {
            window.firebaseData.checkAuthStatus().then(isAuthenticated => {
                this.isAuthenticated = isAuthenticated;
                if (!isAuthenticated) {
                    this.displayOverlay();
                }
            });
        } else {
            this.displayOverlay();
        }
    }

    destroy() {
        // Clean up observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        this.removeOverlay();
    }
}

// Create and initialize the security manager
const securityManager = new SecurityManager();
securityManager.initialize();

export default securityManager;
