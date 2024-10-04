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

// Update UI class to handle new game modes
class UI {
    static showStartOptions() {
        const startContainer = document.createElement('div');
        startContainer.id = 'start-options';
        startContainer.className = 'start-options';
        
        startContainer.innerHTML = `
            <h2>Choose Your Practice Mode</h2>
            <div class="mode-buttons">
                <button id="code-mode-btn" class="mode-btn code-mode">
                    <span class="mode-icon">⌨️</span>
                    <span class="mode-title">Code Practice</span>
                    <span class="mode-desc">Practice typing actual code snippets</span>
                </button>
                <button id="text-mode-btn" class="mode-btn text-mode">
                    <span class="mode-icon">📝</span>
                    <span class="mode-title">Concept Practice</span>
                    <span class="mode-desc">Practice typing code descriptions</span>
                </button>
            </div>
        `;
        
        document.body.appendChild(startContainer);
    }
    
    static hideStartOptions() {
        const startContainer = document.getElementById('start-options');
        if (startContainer) {
            startContainer.remove();
        }
    }

    static updateGameInfo(wpm, accuracy) {
        const wpmDisplay = document.getElementById('wpm');
        const accuracyDisplay = document.getElementById('accuracy');
        if (wpmDisplay) wpmDisplay.textContent = `WPM: ${wpm}`;
        if (accuracyDisplay) accuracyDisplay.textContent = `Accuracy: ${accuracy}%`;
    }

    static showGameOver(time, wpm, accuracy) {
        const gameOverContainer = document.createElement('div');
        gameOverContainer.className = 'game-over';
        gameOverContainer.innerHTML = `
            <h2>Game Over!</h2>
            <p>Time: ${time.toFixed(1)} seconds</p>
            <p>WPM: ${wpm}</p>
            <p>Accuracy: ${accuracy}%</p>
            <button id="restart-btn">Play Again</button>
        `;
        
        document.body.appendChild(gameOverContainer);
        
        const restartButton = document.getElementById('restart-btn');
        restartButton.addEventListener('click', () => {
            gameOverContainer.remove();
            initializeGame();
        });
    }
}
