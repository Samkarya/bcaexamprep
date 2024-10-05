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
         document.getElementById('code-input').style.display = 'none';     
        document.getElementById('game-info').style.display = 'none';       
        document.getElementById('code-display').style.display = 'none';
        document.getElementById("start-box").appendChild(startContainer);
        
        // Add event listeners to the buttons
        document.getElementById('code-mode-btn').addEventListener('click', () => game.start('code'));
        document.getElementById('text-mode-btn').addEventListener('click', () => game.start('text'));
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
    static showStartButton() {
        document.getElementById('start-options').style.display = 'block';
        document.getElementById('code-input').style.display = 'none';
        document.getElementById('game-info').style.display = 'none';
         document.getElementById('code-display').style.display = 'block';
        document.getElementById('code-display').textContent = 'Click Start to begin!';
    }

    static hideStartButton() {
        document.getElementById('start-options').style.display = 'none';
         document.getElementById('code-display').style.display = 'block';
        document.getElementById('code-input').style.display = 'block';
        document.getElementById('game-info').style.display = 'block';
    }

  static showGameOver(time, wpm, accuracy) {
      document.getElementById('code-input').style.display = 'none';
        document.getElementById('game-info').style.display = 'none';
        const gameOverContainer = document.createElement('div');
        gameOverContainer.className = 'game-over';
        gameOverContainer.innerHTML = `
            <h2>Game Over!</h2>
            <p>Time: ${time.toFixed(1)} seconds</p>
            <p>WPM: ${wpm}</p>
            <p>Accuracy: ${accuracy}%</p>
            <button id="restart-btn">Play Again</button>
        `;
        
        document.getElementById('game-container').appendChild(gameOverContainer);
        
         const restartButton = document.getElementById('restart-btn');
        restartButton.addEventListener('click', () => {
            gameOverContainer.remove();
            UI.showStartOptions(); // Show start options instead of directly initializing the game
        });
    }

    static updateUserInfo(user) {
        const userInfo = document.getElementById('user-info');
        if (user) {
            userInfo.innerHTML = `
                <span id="username">${user.email}</span>
                <button id="logout-btn">Logout</button>
            `;
            document.getElementById('logout-btn').addEventListener('click', () => {
                firebase.auth().signOut();
            });
        } else {
            userInfo.innerHTML = `
                <span id="username">Guest</span>
                <button id="login-btn">Login</button>
                <button id="signup-btn">Sign Up</button>
            `;
            document.getElementById('login-btn').addEventListener('click', Auth.showLoginForm);
            document.getElementById('signup-btn').addEventListener('click', Auth.showSignupForm);
        }
    }
}
