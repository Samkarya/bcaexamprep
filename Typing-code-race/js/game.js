class Game {
    constructor() {
        this.codeDisplay = document.getElementById('code-display');
        this.codeInput = document.getElementById('code-input');
        this.timerDisplay = document.getElementById('timer');
        this.wpmDisplay = document.getElementById('wpm');
        this.accuracyDisplay = document.getElementById('accuracy');
        this.cursor = document.createElement('span');
        this.cursor.className = 'cursor';
        this.startTime = 0;
        this.endTime = 0;
        this.currentSnippet = '';
        this.timeLimit = 60; // in seconds
        this.charIndex = 0;
    }

    start() {
        this.currentSnippet = getRandomCodeSnippet();
        this.displayCodeWithCursor();
        this.codeInput.value = '';
        this.codeInput.focus();
        this.startTime = Date.now();
        this.startTimer();
        this.codeInput.addEventListener('input', () => this.checkProgress());
        this.codeInput.addEventListener('input', (e) => this.handleInput(e));
        this.codeInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        UI.updateGameInfo(0, 100);
    }
    displayCodeWithCursor() {
        const codeParts = this.currentSnippet.split('');
        this.codeDisplay.innerHTML = '';
        codeParts.forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            if (index === 0) {
                span.insertAdjacentElement('afterend', this.cursor);
            }
            this.codeDisplay.appendChild(span);
        });
    }
handleInput(e) {
        const inputChar = e.data;
        if (inputChar === null) {
            // Handle backspace
            if (this.charIndex > 0) {
                this.charIndex--;
                this.moveCursor();
            }
        } else if (inputChar === this.currentSnippet[this.charIndex]) {
            this.charIndex++;
            this.moveCursor();
            this.checkProgress();
        } else {
            // Incorrect input, prevent it
            e.preventDefault();
            this.codeInput.value = this.codeInput.value.slice(0, -1);
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const indentationLevel = this.getIndentationLevel();
            const spaces = '    '.repeat(indentationLevel);
            if (this.currentSnippet.startsWith(spaces, this.charIndex)) {
                this.codeInput.value += spaces;
                this.charIndex += spaces.length;
                this.moveCursor();
            }
        }
    }
     getIndentationLevel() {
        const lines = this.currentSnippet.slice(0, this.charIndex).split('\n');
        const lastLine = lines[lines.length - 1];
        return lastLine.search(/\S|$/) / 4; // Assuming 4 spaces per indentation level
    }
     moveCursor() {
        const codeChars = this.codeDisplay.children;
        this.cursor.remove();
        if (this.charIndex < codeChars.length) {
            codeChars[this.charIndex].insertAdjacentElement('beforebegin', this.cursor);
        } else {
            this.codeDisplay.appendChild(this.cursor);
        }
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
