class UI {
    static elements = {
        startBox: document.getElementById('start-box'),
        userInfo: document.getElementById('user-info'),
        username: document.getElementById('username'),
        //loginBtn: document.getElementById('login-btn'),
        //signupBtn: document.getElementById('signup-btn'),
        gameInfo: document.getElementById('game-info'),
        codeDisplay: document.getElementById('code-display'),
        codeInput: document.getElementById('code-input'),
        timer: document.getElementById('timer'),
        wpm: document.getElementById('wpm'),
        accuracy: document.getElementById('accuracy'),
        errorContainer: document.getElementById('error-container'),
        loadingOverlay: document.getElementById('loading-overlay')
    };

    static showStartOptions() {
        this.elements.startBox.innerHTML = `
            <div class="start-options">
                <h2>Choose Your Mode</h2>
                <div class="mode-buttons">
                    <button class="mode-btn" onclick="game.start('code')">Code Mode</button>
                    <button class="mode-btn" onclick="game.start('text')">Text Mode</button>
                    <button class="mode-btn" onclick="game.start('p-code')">Practice Code Mode</button>
                    <button class="mode-btn" onclick="game.start('p-text')">Practice Text Mode</button>
                </div>
                <!--<div class="time-selector">
                    <label for="time">Time:</label>
                    <select id="time">
                        <option value="30">30 sec</option>
                        <option value="60" selected>1 min</option>
                        <option value="300">5 min</option>
                        <option value="600">10 min</option>
                    </select>
                </div>-->
            </div>
        `;
        this.elements.startBox.style.display = 'block';
        this.elements.codeDisplay.style.display = 'none';
        this.elements.codeInput.style.display = 'none';
    }

    static hideStartOptions() {
        this.elements.startBox.style.display = 'none';
        this.elements.codeDisplay.style.display = 'block';
        this.elements.codeInput.style.display = 'block';
    }

    static updateUserInfo(user) {
        if (user) {
            this.elements.username.textContent = user.displayName || user.email;
            this.elements.loginBtn.style.display = 'none';
            this.elements.signupBtn.style.display = 'none';
        } else {
            this.elements.username.textContent = 'Guest';
            this.elements.loginBtn.style.display = 'inline-block';
            this.elements.signupBtn.style.display = 'inline-block';
        }
    }

    static updateGameInfo(wpm, accuracy) {
        this.elements.wpm.textContent = `WPM: ${wpm}`;
        this.elements.accuracy.textContent = `Accuracy: ${accuracy}%`;
    }

    static showGameOver(totalTime, finalWPM, finalAccuracy) {
        this.elements.codeInput.disabled = true;
        this.elements.codeInput.style.display = 'none';
        this.elements.startBox.innerHTML = `
            <div class="game-over" id ='game-over'>
                <h2>Game Over!</h2>
                <p id='time-para'>Time: ${totalTime.toFixed(2)} seconds</p>
                <p id='wpm-para'>WPM: ${finalWPM}</p>
                <p id='accuracy-para'>Accuracy: ${finalAccuracy}%</p>
                <button onclick="game.restart()">Restart</button>
                <button onclick="UI.showStartOptions()">Change Mode</button>
            </div>
        `;
        this.elements.startBox.style.display = 'block';
    }
    static showError(message) {
        this.elements.errorContainer.textContent = message;
        this.elements.errorContainer.style.display = 'block';
        setTimeout(() => {
            this.elements.errorContainer.style.display = 'none';
        }, 5000);
    }

    static showLoading() {
        this.elements.loadingOverlay.style.display = 'flex';
    }

    static hideLoading() {
        this.elements.loadingOverlay.style.display = 'none';
    }

    static updateTimer(timeLeft) {
        this.elements.timer.textContent = `Time: ${timeLeft}s`;
    }
}

// Export the UI class if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}

