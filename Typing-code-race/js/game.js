class Game {
    constructor() {
        this.codeDisplay = document.getElementById('code-display');
        this.codeInput = document.getElementById('code-input');
        this.gameInfo = document.getElementById('game-info');
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
        this.mistakes = 0;
        this.totalKeystrokes = 0;
        this.isGameActive = false;
        this.lastWPMUpdate = 0;
        this.wpmUpdateInterval = 500; // Update WPM every 500ms
    }

    start(mode = 'code') {
        this.isCodeMode = mode === 'code';
        this.isGameActive = true;
        UI.hideStartOptions();
        
        const snippet = getRandomCodeSnippet();
        this.currentContent = this.isCodeMode ? snippet.code : snippet.description;
        
        if (this.isCodeMode) {
            this.displayCodeWithSyntaxHighlighting(snippet.language);
        } else {
            this.displayTextWithWrapping();
        }
        
        this.resetGameState();
        this.startTimer();
        this.setupEventListeners();
    }

    resetGameState() {
        this.codeInput.value = '';
        this.charIndex = 0;
        this.mistakes = 0;
        this.totalKeystrokes = 0;
        this.startTime = Date.now();
        this.lastWPMUpdate = this.startTime;
        this.codeInput.focus();
    }

    setupEventListeners() {
        this.codeInput.addEventListener('input', this.handleInput.bind(this));
        this.codeInput.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    displayCodeWithSyntaxHighlighting(language) {
        const formattedCode = this.formatCode(this.currentContent);
        const highlightedCode = applySyntaxHighlighting(formattedCode, language);
        
        // Convert highlighted HTML to a format where each character is wrapped in a span
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = highlightedCode;
        
        let finalHtml = '';
        const processNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent.split('').map(char => 
                    `<span class="char">${char === ' ' ? '&nbsp;' : char === '\n' ? '↵\n' : char}</span>`
                ).join('');
            } else {
                const className = node.className;
                return node.textContent.split('').map(char =>
                    `<span class="char ${className}">${char === ' ' ? '&nbsp;' : char === '\n' ? '↵\n' : char}</span>`
                ).join('');
            }
        };

        const processChildren = (element) => {
            Array.from(element.childNodes).forEach(child => {
                finalHtml += processNode(child);
            });
        };

        processChildren(tempDiv);
        this.codeDisplay.innerHTML = finalHtml;
        
        // Insert cursor at the beginning
        const firstChar = this.codeDisplay.querySelector('.char');
        if (firstChar) {
            firstChar.insertAdjacentElement('beforebegin', this.cursor);
        }
    }

    formatCode(code) {
        // Basic code formatting - you can enhance this based on needs
        return code.split('\n').map(line => {
            const trimmedLine = line.trimLeft();
            const indentation = line.length - trimmedLine.length;
            return '    '.repeat(Math.floor(indentation / 4)) + trimmedLine;
        }).join('\n');
    }

    handleInput(e) {
        if (!this.isGameActive) return;
        
        const inputText = this.codeInput.value;
        const codeChars = this.codeDisplay.querySelectorAll('.char');
        
        this.updateCharacterStyling(inputText, codeChars);
        this.updateGameMetrics(inputText);
        this.moveCursor();
        
        if (inputText === this.currentContent) {
            this.endGame();
        }
    }

    updateCharacterStyling(inputText, codeChars) {
        codeChars.forEach((char, index) => {
            char.classList.remove('correct', 'incorrect', 'current');
            if (index < inputText.length) {
                const isCorrect = inputText[index] === this.currentContent[index];
                char.classList.add(isCorrect ? 'correct' : 'incorrect');
            } else if (index === inputText.length) {
                char.classList.add('current');
            }
        });
    }

    updateGameMetrics(inputText) {
        this.charIndex = inputText.length;
        this.totalKeystrokes++;
        
        // Update WPM and accuracy periodically to avoid too frequent updates
        const now = Date.now();
        if (now - this.lastWPMUpdate >= this.wpmUpdateInterval) {
            this.updateWPMAndAccuracy();
            this.lastWPMUpdate = now;
        }
    }

    updateWPMAndAccuracy() {
        const elapsedMinutes = (Date.now() - this.startTime) / 60000;
        const typedCharacters = this.codeInput.value.length;
        const accuracy = this.calculateAccuracy();
        
        // WPM calculation: (characters / 5) / time in minutes
        // We use a weighted average of gross and net WPM
        const grossWPM = Math.round((this.totalKeystrokes / 5) / elapsedMinutes);
        const netWPM = Math.round((typedCharacters / 5) / elapsedMinutes);
        const wpm = Math.round((grossWPM + netWPM) / 2);

        this.wpmDisplay.textContent = `WPM: ${wpm}`;
        this.accuracyDisplay.textContent = `Accuracy: ${accuracy}%`;
        
        UI.updateGameInfo(wpm, accuracy);
    }

    calculateAccuracy() {
        const typed = this.codeInput.value;
        let correctChars = 0;
        
        for (let i = 0; i < typed.length; i++) {
            if (typed[i] === this.currentContent[i]) {
                correctChars++;
            }
        }
        
        return typed.length === 0 ? 100 : Math.round((correctChars / typed.length) * 100);
    }

    handleKeyDown(e) {
        if (!this.isGameActive) return;
        
        if (this.isCodeMode && e.key === 'Tab') {
            e.preventDefault();
            this.handleTabKey();
        }
    }

    handleTabKey() {
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

    startTimer() {
        let timeLeft = this.timeLimit;
        this.timerDisplay.textContent = `Time: ${timeLeft}s`;
        
        this.timerInterval = setInterval(() => {
            timeLeft--;
            this.timerDisplay.textContent = `Time: ${timeLeft}s`;
            
            if (timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    endGame() {
        this.isGameActive = false;
        this.endTime = Date.now();
        clearInterval(this.timerInterval);
        
        const totalTime = (this.endTime - this.startTime) / 1000;
        const finalWPM = this.calculateFinalWPM(totalTime);
        const finalAccuracy = this.calculateAccuracy();
        
        UI.showGameOver(totalTime, finalWPM, finalAccuracy);
        this.saveScore(finalWPM, finalAccuracy);
    }

    calculateFinalWPM(totalTimeInSeconds) {
        const minutes = totalTimeInSeconds / 60;
        const wordsTyped = this.currentContent.length / 5; // Standard: 5 characters = 1 word
        return Math.round(wordsTyped / minutes);
    }

    saveScore(wpm, accuracy) {
        const user = firebase.auth().currentUser;
        if (user) {
            firebase.firestore().collection('scores').add({
                userId: user.uid,
                wpm: wpm,
                accuracy: accuracy,
                mode: this.isCodeMode ? 'code' : 'text',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
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
}
