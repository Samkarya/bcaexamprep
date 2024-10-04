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
        this.currentContent = '';
        this.timeLimit = 60; // in seconds
        this.charIndex = 0;
    }
start(mode = 'code') {
        this.isCodeMode = mode === 'code';
        const snippet = getRandomCodeSnippet();
        this.currentContent = this.isCodeMode ? snippet.code : snippet.description;
        
        if (this.isCodeMode) {
            this.displayCodeWithSyntaxHighlighting(snippet.language);
        } else {
            this.displayTextWithWrapping();
        }
        
        this.codeInput.value = '';
        this.codeInput.focus();
        this.startTime = Date.now();
        this.startTimer();
        this.codeInput.addEventListener('input', (e) => this.handleInput(e));
        this.codeInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        UI.updateGameInfo(0, 100);
    }
 displayTextWithWrapping() {
        const words = this.currentContent.split(' ');
        let currentLine = '';
        let lines = [];
        const maxLineLength = 60; // Adjust based on your display width

        words.forEach(word => {
            if ((currentLine + word).length > maxLineLength) {
                lines.push(currentLine.trim());
                currentLine = '';
            }
            currentLine += word + ' ';
        });
        if (currentLine.trim()) {
            lines.push(currentLine.trim());
        }

        const wrappedText = lines.join('\n');
        this.currentContent = wrappedText; // Update currentContent with wrapped text

        // Create spans for each character
        const textHtml = wrappedText.split('').map(char => 
            `<span class="char">${char === '\n' ? '↵\n' : char}</span>`
        ).join('');

        this.codeDisplay.innerHTML = textHtml;
        
        // Insert cursor at the beginning
        const firstChar = this.codeDisplay.querySelector('.char');
        if (firstChar) {
            firstChar.insertAdjacentElement('beforebegin', this.cursor);
        }
    }

    displayCodeWithSyntaxHighlighting(language) {
        const highlightedCode = applySyntaxHighlighting(this.currentContent, language);
        this.codeDisplay.innerHTML = highlightedCode;
        
        // Wrap each character in a span for individual styling
        const textNodes = Array.from(this.codeDisplay.childNodes);
        let newHtml = '';
        textNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                const chars = node.textContent.split('');
                newHtml += chars.map(char => `<span class="char">${char}</span>`).join('');
            } else {
                const chars = node.textContent.split('');
                const className = node.className;
                newHtml += chars.map(char => `<span class="char ${className}">${char}</span>`).join('');
            }
        });
        this.codeDisplay.innerHTML = newHtml;
        
        // Insert cursor at the beginning
        const firstChar = this.codeDisplay.querySelector('.char');
        if (firstChar) {
            firstChar.insertAdjacentElement('beforebegin', this.cursor);
        }
    }

    handleInput(e) {
        const inputText = this.codeInput.value;
        const codeChars = this.codeDisplay.querySelectorAll('.char');
        
        // Reset all characters' styling
        codeChars.forEach(char => {
            char.classList.remove('correct', 'incorrect');
        });
        
        // Apply styling for typed characters
        for (let i = 0; i < inputText.length; i++) {
            if (i < codeChars.length) {
                 const expectedChar = this.currentContent[i];
                const typedChar = inputText[i];
                
                if (typedChar === expectedChar) {
                    codeChars[i].classList.add('correct');
                } else {
                    codeChars[i].classList.add('incorrect');
                }
            }
        }
        
        this.charIndex = inputText.length;
        this.moveCursor();
        this.checkProgress();
    }

   handleKeyDown(e) {
        if (this.isCodeMode && e.key === 'Tab') {
            e.preventDefault();
            const indentationLevel = this.getIndentationLevel();
            const spaces = '    '.repeat(indentationLevel);
            if (this.currentContent.startsWith(spaces, this.charIndex)) {
                const cursorPosition = this.codeInput.selectionStart;
                const textBeforeCursor = this.codeInput.value.substring(0, cursorPosition);
                const textAfterCursor = this.codeInput.value.substring(cursorPosition);
                this.codeInput.value = textBeforeCursor + spaces + textAfterCursor;
                this.codeInput.selectionStart = this.codeInput.selectionEnd = cursorPosition + spaces.length;
                this.handleInput({ target: this.codeInput });
            }
        }
    }

      getIndentationLevel() {
        const lines = this.currentContent.slice(0, this.charIndex).split('\n');
        const lastLine = lines[lines.length - 1];
        return lastLine.search(/\S|$/) / 4;
    }

    moveCursor() {
        const codeChars = this.codeDisplay.querySelectorAll('.char');
        this.cursor.remove();
        
        if (this.charIndex < codeChars.length) {
            codeChars[this.charIndex].insertAdjacentElement('beforebegin', this.cursor);
        } else {
            this.codeDisplay.appendChild(this.cursor);
        }
    }

    startTimer() {
        let timeLeft = this.timeLimit;
        this.timerInterval = setInterval(() => {
            timeLeft--;
            this.timerDisplay.textContent = `Time: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(this.timerInterval);
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

        if (currentInput === this.currentContent) {
            this.endGame();
        }
        UI.updateGameInfo(wpm, accuracy);
    }

    calculateAccuracy(input) {
        let correctChars = 0;
        for (let i = 0; i < input.length; i++) {
            if (input[i] === this.currentContent[i]) {
                correctChars++;
            }
        }
        return input.length === 0 ? 100 : Math.round((correctChars / input.length) * 100);
    }

    calculateWPM(charCount) {
        const minutes = (Date.now() - this.startTime) / 60000;
        return Math.round((charCount / 5) / minutes) || 0; // Prevent NaN when minutes is very small
    }


     endGame() {
        this.endTime = Date.now();
        const totalTime = (this.endTime - this.startTime) / 1000;
        const finalWPM = this.calculateWPM(this.currentContent.length);
        const finalAccuracy = this.calculateAccuracy(this.codeInput.value);
        
        clearInterval(this.timerInterval); // Clear the timer interval
        
        UI.showGameOver(totalTime, finalWPM, finalAccuracy);
        this.saveScore(finalWPM, finalAccuracy);
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
