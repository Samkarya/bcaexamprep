class UI {
    static updateGameInfo(wpm, accuracy) {
        document.getElementById('wpm').textContent = `WPM: ${wpm}`;
        document.getElementById('accuracy').textContent = `Accuracy: ${accuracy}%`;
    }

    static showStartButton() {
        document.getElementById('start-btn').style.display = 'block';
        document.getElementById('code-input').style.display = 'none';
        document.getElementById('code-display').textContent = 'Click Start to begin!';
    }

    static hideStartButton() {
        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('code-input').style.display = 'block';
    }

    static showGameOver(time, wpm, accuracy) {
        const gameOverHTML = `
            <div id="game-over">
                <h2>Game Over!</h2>
                <p>Time: ${time.toFixed(2)}s</p>
                <p>WPM: ${wpm}</p>
                <p>Accuracy: ${accuracy}%</p>
                <button id="play-again-btn">Play Again</button>
            </div>
        `;
        document.getElementById('game-container').innerHTML = gameOverHTML;
        document.getElementById('play-again-btn').addEventListener('click', () => {
            location.reload();
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
