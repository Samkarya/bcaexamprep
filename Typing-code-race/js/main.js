document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
    Auth.init();
    Ads.init();
    initializeGame();
});

function initializeGame() {
    UI.showStartOptions();
    const codeButton = document.getElementById('code-mode-btn');
    const textButton = document.getElementById('text-mode-btn');
    
    codeButton.addEventListener('click', () => startGame('code'));
    textButton.addEventListener('click', () => startGame('text'));
}

function startGame(mode) {
    UI.hideStartOptions();
    const gameInstance = new Game();
    gameInstance.start(mode);
}


