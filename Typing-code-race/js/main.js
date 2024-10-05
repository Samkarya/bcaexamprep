document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
    Auth.init();
    Ads.init();
    initializeGame();
});

let game;

function initializeGame() {
    game = new Game();
    UI.showStartButton();
    UI.showStartOptions();
    UI.updateUserInfo(firebase.auth().currentUser);
}

// Event listener for auth state changes
firebase.auth().onAuthStateChanged((user) => {
    UI.updateUserInfo(user);
});

// Initialize the game when the page loads
window.addEventListener('load', initializeGame);
