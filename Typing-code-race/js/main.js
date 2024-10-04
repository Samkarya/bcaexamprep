document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
    Auth.init();
    Ads.init();
    initializeGame();
});

function initializeGame() {
    UI.showStartButton();
    const startButton = document.getElementById('start-btn');
    startButton.addEventListener('click', startGame);
}

function startGame() {
    UI.hideStartButton();
    const gameInstance = new Game();
    gameInstance.start();
}
