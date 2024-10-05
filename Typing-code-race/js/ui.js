class UI {
    static showStartOptions() {
        const startContainer = document.createElement('div');
        startContainer.id = 'start-options';
        startContainer.className = 'start-options';
        
        startContainer.innerHTML = `
            <h2>Choose Your Typing Challenge</h2>
            <div class="mode-buttons">
                <button id="code-mode-btn" class="mode-btn code-mode">
                    <span class="mode-icon">⌨️</span>
                    <span class="mode-title">Code Practice</span>
                    <span class="mode-desc">Type actual code snippets</span>
                    <span class="mode-stats">Best WPM: <span id="code-best-wpm">--</span></span>
                </button>
                <button id="text-mode-btn" class="mode-btn text-mode">
                    <span class="mode-icon">📝</span>
                    <span class="mode-title">Concept Practice</span>
                    <span class="mode-desc">Type programming concepts</span>
                    <span class="mode-stats">Best WPM: <span id="text-best-wpm">--</span></span>
                </button>
            </div>
            <div class="difficulty-selector">
                <label for="time-limit">Time Limit:</label>
                <select id="time-limit">
                    <option value="30">30 seconds</option>
                    <option value="60" selected>60 seconds</option>
                    <option value="120">2 minutes</option>
                    <option value="300">5 minutes</option>
                </select>
            </div>
        `;

        this.hideGameElements();
        document.getElementById('start-box').appendChild(startContainer);
        
        // Add event listeners
        document.getElementById('code-mode-btn').addEventListener('click', () => this.startGame('code'));
        document.getElementById('text-mode-btn').addEventListener('click', () => this.startGame('text'));
        
        this.loadAndDisplayBestScores();
    }
    
    static startGame(mode) {
        const timeLimit = parseInt(document.getElementById('time-limit').value);
        game.timeLimit = timeLimit;
        game.start(mode);
    }

    static loadAndDisplayBestScores() {
        const user = firebase.auth().currentUser;
        if (user) {
            firebase.firestore().collection('scores')
                .where('userId', '==', user.uid)
                .orderBy('wpm', 'desc')
                .get()
                .then(snapshot => {
                    let bestCodeWPM = '--';
                    let bestTextWPM = '--';
                    
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.mode === 'code' && bestCodeWPM === '--') {
                            bestCodeWPM = data.wpm;
                        } else if (data.mode === 'text' && bestTextWPM === '--') {
                            bestTextWPM = data.wpm;
                        }
                    });
                    
                    document.getElementById('code-best-wpm').textContent = bestCodeWPM;
                    document.getElementById('text-best-wpm').textContent = bestTextWPM;
                });
        }
    }
    
    static hideGameElements() {
        document.getElementById('code-input').style.display = 'none';     
        document.getElementById('game-info').style.display = 'none';       
        document.getElementById('code-display').style.display = 'none';
    }
    
    static showGameElements() {
        document.getElementById('code-display').style.display = 'block';
        document.getElementById('code-input').style.display = 'block';
        document.getElementById('game-info').style.display = 'flex';
    }

    static hideStartOptions() {
        const startContainer = document.getElementById('start-options');
        if (startContainer) {
            startContainer.remove();
        }
        this.showGameElements();
    }

    static updateGameInfo(wpm, accuracy) {
        const wpmElement = document.getElementById('wpm');
        const accuracyElement = document.getElementById('accuracy');
        
        if (wpmElement) {
            // Add a CSS class based on WPM for color coding
            wpmElement.className = this.getWPMColorClass(wpm);
            wpmElement.textContent = `WPM: ${wpm}`;
        }
        
        if (accuracyElement) {
            accuracyElement.className = this.getAccuracyColorClass(accuracy);
            accuracyElement.textContent = `Accuracy: ${accuracy}%`;
        }
    }
    
    static getWPMColorClass(wpm) {
        if (wpm >= 80) return 'metric-excellent';
        if (wpm >= 60) return 'metric-good';
        if (wpm >= 40) return 'metric-average';
        return 'metric-needs-improvement';
    }
    
    static getAccuracyColorClass(accuracy) {
        if (accuracy >= 98) return 'metric-excellent';
        if (accuracy >= 95) return 'metric-good';
        if (accuracy >= 90) return 'metric-average';
        return 'metric-needs-improvement';
    }

    static showGameOver(time, wpm, accuracy) {
        this.hideGameElements();
        
        const gameOverContainer = document.createElement('div');
        gameOverContainer.className = 'game-over';
        
        const timeInSeconds = Math.round(time);
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
        
        gameOverContainer.innerHTML = `
            <h2>Game Complete!</h2>
            <div class="results-container">
                <div class="result-item ${this.getWPMColorClass(wpm)}">
                    <div class="result-value">${wpm}</div>
                    <div class="result-label">WPM</div>
                </div>
                <div class="result-item ${this.getAccuracyColorClass(accuracy)}">
                    <div class="result-value">${accuracy}%</div>
                    <div class="result-label">Accuracy</div>
                </div>
                <div class="result-item">
                    <div class="result-value">${timeDisplay}</div>
                    <div class="result-label">Time</div>
                </div>
            </div>
            <div class="game-over-buttons">
                <button id="restart-btn" class="primary-btn">Play Again</button>
                <button id="share-btn" class="secondary-btn">Share Result</button>
            </div>
        `;
        
        document.getElementById('game-container').appendChild(gameOverContainer);
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            gameOverContainer.remove();
            this.showStartOptions();
        });
        
        document.getElementById('share-btn').addEventListener('click', () => {
            this.shareResult(wpm, accuracy);
        });
    }
    
    static shareResult(wpm, accuracy) {
        const text = `I just typed ${wpm} WPM with ${accuracy}% accuracy on Code Typer! Can you beat my score? 🚀⌨️`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Code Typing Result',
                text: text,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(text)
                .then(() => alert('Result copied to clipboard!'))
                .catch(console.error);
        }
    }

    static updateUserInfo(user) {
        const userInfo = document.getElementById('user-info');
        if (user) {
            userInfo.innerHTML = `
                <div class="user-profile">
                    <span class="username">${user.email}</span>
                    <button id="logout-btn" class="logout-btn">Logout</button>
                </div>
            `;
            document.getElementById('logout-btn').addEventListener('click', () => {
                firebase.auth().signOut();
            });
        } else {
            userInfo.innerHTML = `
                <div class="auth-buttons">
                    <button id="login-btn" class="auth-btn">Login</button>
                    <button id="signup-btn" class="auth-btn">Sign Up</button>
                </div>
            `;
            document.getElementById('login-btn').addEventListener('click', Auth.showLoginForm);
            document.getElementById('signup-btn').addEventListener('click', Auth.showSignupForm);
        }
    }
}
