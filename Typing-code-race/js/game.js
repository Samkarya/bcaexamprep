class Game {
    constructor() {
        this.codeDisplay = document.getElementById('code-display');
        this.codeInput = document.getElementById('code-input');
        this.timerDisplay = document.getElementById('timer');
        this.wpmDisplay = document.getElementById('wpm');
        this.accuracyDisplay = document.getElementById('accuracy');
        this.startTime = 0;
        this.endTime = 0;
        this.currentSnippet = '';
        this.timeLimit = 60; // in seconds
    }

    start() {
        this.currentSnippet = getRandomCodeSnippet();
        this.codeDisplay.textContent = this.currentSnippet;
        this.codeInput.value = '';
        this.codeInput.focus();
        this.startTime = Date.now();
        this.startTimer();
        this.codeInput.addEventListener('input', () => this.checkProgress());
        UI.updateGameInfo(0, 100);
    }

    startTimer() {
        let timeLeft = this.timeLimit;
        const timer = setInterval(() => {
            timeLeft--;
            this.timerDisplay.textContent = `Time: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.endGame();
            }
        }, 1000);
    }

    checkProgress() {
        const currentInput = this.codeInput.value;
        const currentLength = currentInput.length;
        const accuracy = this.calculateAccuracy(currentInput);
        const wpm = this.calculateWPM(currentLength);
        
        this.wpmDisplay.textContent = `WPM: ${wpm}`;
        this.accuracyDisplay.textContent = `Accuracy: ${accuracy}%`;

        if (currentInput === this.currentSnippet) {
            this.endGame();
        }
      UI.updateGameInfo(wpm, accuracy);
    }

    calculateAccuracy(input) {
        let correctChars = 0;
        for (let i = 0; i < input.length; i++) {
            if (input[i] === this.currentSnippet[i]) {
                correctChars++;
            }
        }
        return Math.round((correctChars / input.length) * 100);
    }

    calculateWPM(charCount) {
        const minutes = (Date.now() - this.startTime) / 60000;
        return Math.round((charCount / 5) / minutes);
    }

    endGame() {
        this.endTime = Date.now();
        const totalTime = (this.endTime - this.startTime) / 1000;
        const finalWPM = this.calculateWPM(this.currentSnippet.length);
        const finalAccuracy = this.calculateAccuracy(this.codeInput.value);
        
        Ads.showInterstitialAd(() => {
            UI.showGameOver(totalTime, finalWPM, finalAccuracy);
            this.saveScore(finalWPM, finalAccuracy);
        });
    }
  saveScore(wpm, accuracy) {
        const user = firebase.auth().currentUser;
        if (user) {
            firebase.firestore().collection('scores').add({
                userId: user.uid,
                wpm: wpm,
                accuracy: accuracy,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }
}
