
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
        this.timerInterval = null;
        this.gameContainer = document.getElementById('game-container');
this.initialFontSize = parseInt(window.getComputedStyle(this.codeDisplay).fontSize);
        this.minFontSize = 12;
        this.maxFontSize = 24;
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
    handleResize() {
        this.updateGameAreaDimensions();
        this.adjustFontSize();
        this.repositionElements();
        this.reformatText();
    }
    updateGameAreaDimensions() {
        this.gameWidth = this.gameContainer.clientWidth;
        this.gameHeight = this.gameContainer.clientHeight;
    }

    adjustFontSize() {
        const containerWidth = this.gameContainer.clientWidth;
        let fontSize = this.initialFontSize;

        // Adjust font size based on container width
        if (containerWidth < 600) {
            fontSize = Math.max(this.minFontSize, fontSize - 2);
        } else if (containerWidth > 1200) {
            fontSize = Math.min(this.maxFontSize, fontSize + 2);
        }

        this.codeDisplay.style.fontSize = `${fontSize}px`;
        this.codeInput.style.fontSize = `${fontSize}px`;
    }

    repositionElements() {
        // Adjust the height of the code display and input areas
        const headerHeight = document.querySelector('header').offsetHeight;
        const gameInfoHeight = document.getElementById('game-info').offsetHeight;
        const availableHeight = window.innerHeight - headerHeight - gameInfoHeight - 40; // 40px for margins

        const codeDisplayHeight = Math.floor(availableHeight * 0.6);
        const codeInputHeight = availableHeight - codeDisplayHeight;

        this.codeDisplay.style.height = `${codeDisplayHeight}px`;
        this.codeInput.style.height = `${codeInputHeight}px`;
    }

    reformatText() {
        if (this.isCodeMode) {
            this.displayCodeWithSyntaxHighlighting(this.currentLanguage);
        } else {
            this.displayTextWithWrapping();
        }
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
        this.handleLongLines();
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
    const indentationLevel = this.getIndentationLevel() + 1; // Add one level of indentation
    const spaces = '    '.repeat(indentationLevel); // 4 spaces per indentation level

    // Insert the correct number of spaces at the current cursor position
    const cursorPosition = this.codeInput.selectionStart;
    const textBeforeCursor = this.codeInput.value.substring(0, cursorPosition);
    const textAfterCursor = this.codeInput.value.substring(cursorPosition);

    // Update the value and reposition the cursor
    this.codeInput.value = textBeforeCursor + spaces + textAfterCursor;
    this.codeInput.selectionStart = this.codeInput.selectionEnd = cursorPosition + spaces.length;

    this.handleInput({ target: this.codeInput }); // Update game logic
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

   getIndentationLevel() {
    // Get the current value up to the cursor position
    const cursorPosition = this.codeInput.selectionStart;
    const textBeforeCursor = this.codeInput.value.substring(0, cursorPosition);

    // Find the current line by splitting the text before the cursor on new lines
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1]; // Get the last line (current line)

    // Calculate the indentation level (number of spaces) based on the current line's leading spaces
    const leadingSpaces = currentLine.match(/^\s+/); // Match any leading whitespace
    return leadingSpaces ? leadingSpaces[0].length / 4 : 0; // Assuming 4 spaces per indent level
}


    displayTextWithWrapping()  {
        // Implement text wrapping logic
        const words = this.currentContent.split(' ');
        let lines = [];
        let currentLine = '';

        for (const word of words) {
            if ((currentLine + word).length > this.getMaxLineLength()) {
                lines.push(currentLine.trim());
                currentLine = '';
            }
            currentLine += word + ' ';
        }
        if (currentLine) {
            lines.push(currentLine.trim());
        }

        this.codeDisplay.innerHTML = lines.join('<br>');
    }
    handleLongLines() {
        const codeLines = this.codeDisplay.querySelectorAll('.line');
        const maxWidth = this.codeDisplay.clientWidth - 20; // 20px for padding

        codeLines.forEach(line => {
            if (line.scrollWidth > maxWidth) {
                line.style.overflowX = 'auto';
                line.style.whiteSpace = 'pre';
            } else {
                line.style.overflowX = 'visible';
                line.style.whiteSpace = 'pre-wrap';
            }
        });
    }
    getMaxLineLength() {
        const fontSize = parseFloat(window.getComputedStyle(this.codeDisplay).fontSize);
        return Math.floor(this.codeDisplay.clientWidth / (fontSize * 0.6)); // Approximate character width
    }
}
