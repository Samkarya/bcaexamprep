// Global game instance
let game;
// Main initialization function
function initializeApp() {
    try {
        /*initializeFirebase();
        initializeAuth();
        initializeAds();*/
        initializeEventListeners();
       
        // Create game instance
        game = new Game();
       
        // Show start options
        UI.showStartOptions();
       
        /*if (CONFIG.DEBUG) {
            console.log('App initialized successfully');
        }*/
    } catch (error) {
        console.error('Error initializing app:', error);
        showErrorMessage('Failed to initialize the app. Please refresh the page.');
    }
}
/*
// Initialize Firebase
function initializeFirebase() {
    if (!firebase.apps.length) {
        firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
    }
   
    // Initialize Firestore
    const db = firebase.firestore();
    if (CONFIG.DEBUG) {
        console.log('Firebase initialized');
    }
}
// Initialize Authentication
function initializeAuth() {
    firebase.auth().onAuthStateChanged(user => {
        UI.updateUserInfo(user);
        if (user && CONFIG.DEBUG) {
            console.log('User signed in:', user.email);
        }
    });
}
// Initialize Advertisements
function initializeAds() {
    if (typeof Ads !== 'undefined') {
        Ads.init();
        if (CONFIG.DEBUG) {
            console.log('Ads initialized');
        }
    }
}
*/
// Initialize Event Listeners
function initializeEventListeners() {
    // Handle keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
   
    // Handle visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);
   
    // Handle window resize
    window.addEventListener('resize', debounce(() => game?.handleResize(), 250));
}

function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + Enter to restart game
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (game) {
            if (game.isGameActive) {
                game.restart();
            } else {
                UI.showStartOptions();
            }
        }
    }
}
// Visibility change handler
function handleVisibilityChange() {
    if (document.hidden && game && game.isGameActive) {
        game.pauseGame();
    }
}
// Window resize handler
function handleWindowResize() {
    if (game) {
        game.handleResize();
    }
}
// Utility function to show error message
function showErrorMessage(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.textContent = message;
    document.body.appendChild(errorContainer);
}
// Utility function to debounce function calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
document.addEventListener('DOMContentLoaded', () => {
    UI.hideLoading();
});
// Load handling
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
/*// Expose game to window for debugging purposes if needed
if (CONFIG.DEBUG) {
    window.game = game;
}*/
