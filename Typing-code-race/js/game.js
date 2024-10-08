class Game {
    constructor() {
        this.initializeElements();
        this.resetGameState();
    }

    initializeElements() {
        this.codeDisplay = document.getElementById('code-display');
        this.codeInput = document.getElementById('code-input');
        this.gameInfo = document.getElementById('game-info');
        this.savedGameInfo = document.getElementById('saved-game-info');
        this.timerDisplay = document.getElementById('timer');
        this.wpmDisplay = document.getElementById('wpm');
        this.accuracyDisplay = document.getElementById('accuracy');
        this.cursor = document.createElement('span');
        this.cursor.className = 'cursor';
        this.gameContainer = document.getElementById('game-container');
        this.initialFontSize = parseInt(window.getComputedStyle(this.codeDisplay).fontSize);
        this.minFontSize = 12;
        this.maxFontSize = 24;
    }

    resetGameState() {
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
        this.loadFromLocalStorage();
    }

    start(mode = 'code') {
        this.resetGameState();
        
        this.gameMode = mode;
        this.isCodeMode = mode === 'code';
        this.isCodePractice = mode ==='p-code'
        this.isGameActive = true;
        this.codeInput.disabled = false;
        this.codeInput.value = '';
        this.codeDisplay.innerHTML = '';
        UI.hideStartOptions();
        
        const content = this.getContent();
        if(this.isCodeMode || this.isCodePractice){
            this.currentContent = content.code;
        }
        else{
            this.currentContent = content.description;
        }
        
        
        this.formatText();
        
        this.setupEventListeners();
        this.codeInput.focus();
        this.startTime = Date.now();
        this.startTimer(mode);
        this.handleResize();
        
        
    }

    restart() {
        this.endGame(false); // End current game without showing game over screen
        if (this.gameMode === 'code' || this.gameMode=== 'text'){
            this.start(this.isCodeMode ? 'code' : 'text');
        }
        else{
            this.start(this.isCodePractice ? 'p-code' : 'p-text');
        }
    }
    getContent(){
        const snippet = getRandomCodeSnippet();
        return snippet;
        
    }
    formatText() {
        const formattedArray = this.formatToFixedLines(this.currentContent, this.getMaxLineLength());
        this.displayFormattedText(formattedArray);
    }

    formatToFixedLines(text, maxLength){
        const lines = [];
        let currentLine = '';

        for (let i = 0; i < text.length; i++) {
            if (text[i] === '\n') {  // handle new line
                lines.push(currentLine + '\n');
                currentLine = '';
            } else if (text[i] === '\t') { // handle tab
                currentLine += '    '; // convert tab to four spaces
            } else {
                currentLine += text[i];
            }

            if (currentLine.length === maxLength) {
                lines.push(currentLine);
                currentLine = '';
            }
        }
        if (currentLine.length > 0) {
            lines.push(currentLine); // push remaining text
        }

        return lines;
    }
    displayFormattedText(lines) {
        lines.forEach(line => {
            const div = document.createElement('div');
            div.classList.add('line');
            for (let char of line) {
                const span = document.createElement('span');
                span.classList.add('char');
                span.textContent = char === ' ' ? ' ' : char;
                div.appendChild(span);
            }
            this.codeDisplay.appendChild(div);
        });
        this.handleLongLines();
    }
    handleResize() {
        this.updateGameAreaDimensions();
        this.adjustFontSize();
        this.repositionElements();
        
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

    setupEventListeners() {
        this.codeInput.addEventListener('input', this.handleInput.bind(this));
        this.codeInput.addEventListener('keydown', this.handleKeyDown.bind(this));
        
    }   

    handleInput(e) {
        if (!this.isGameActive) return;
        
        const inputText = this.codeInput.value;
        const codeChars = this.codeDisplay.querySelectorAll('.char');
        
        this.updateCharacterStyling(inputText, codeChars);
        this.updateGameMetrics(inputText);
        this.moveCursor();
    }
   
    updateCharacterStyling(inputText, codeChars) {
    let inputIndex = 0;
    codeChars.forEach((char, index) => {
        char.classList.remove('correct', 'incorrect', 'current');
        
        if (index < inputText.length) {
            const isCorrect = inputText[inputIndex] === char.textContent;
            char.classList.add(isCorrect ? 'correct' : 'incorrect');
            inputIndex++;
        } else if (index === inputText.length) {
            
            if (char.textContent === '\0'){
                this.endGame();
            }
            else{char.classList.add('current');}
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
        
        if ((this.isCodeMode || this.isCodePractice )&& e.key === 'Tab') {
            e.preventDefault();
            this.handleTabKey();
        }
    }

    handleTabKey() {
    
    const spaces = '    '; // 4 spaces per indentation level

    // Insert the correct number of spaces at the current cursor position
    const cursorPosition = this.codeInput.selectionStart;
    const textBeforeCursor = this.codeInput.value.substring(0, cursorPosition);
    const textAfterCursor = this.codeInput.value.substring(cursorPosition);

    // Update the value and reposition the cursor
    this.codeInput.value = textBeforeCursor + spaces + textAfterCursor;
    this.codeInput.selectionStart = this.codeInput.selectionEnd = cursorPosition + spaces.length;

    this.handleInput({ target: this.codeInput }); // Update game logic
}

    startTimer(mode) {
        if(mode === 'code' || mode ==='text'){
        let timeLeft = this.timeLimit;
        this.timerDisplay.textContent = `Time: ${timeLeft}s`;
        
        this.timerInterval = setInterval(() => {
            timeLeft--;
            this.timerDisplay.textContent = `Time: ${timeLeft}s`;
            
            if (timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }else{
        this.timerDisplay.textContent = `Practice Mode`;
    }
}

    endGame(showGameOver = true) {
        this.isGameActive = false;
        this.endTime = Date.now();
        clearInterval(this.timerInterval);
        
        if (showGameOver) {
            const totalTime = (this.endTime - this.startTime) / 1000;
            const finalWPM = this.calculateFinalWPM(totalTime);
            const finalAccuracy = this.calculateAccuracy();
            
            UI.showGameOver(totalTime, finalWPM, finalAccuracy);
            this.saveToLocalStorage(finalWPM, finalAccuracy,totalTime )
            triggerAchievementOnGameOver();
        }
        
        this.codeInput.disabled = true;
    }
    
   calculateFinalWPM(totalTimeInSeconds) {
    const minutes = totalTimeInSeconds / 60;
    const correctlyTypedCharacters = this.codeInput.value.length; // Total correct characters
    const wordsTyped = correctlyTypedCharacters / 5; // Standard: 5 characters = 1 word
    return Math.round(wordsTyped / minutes); // Calculate WPM based on correct characters
}

saveToLocalStorage(wpm, accuracy, time_taken) {
    const savedData = localStorage.getItem('bca_exam_prep_typing_data');
    let previousData = savedData ? JSON.parse(savedData) : { wpm: 0, accuracy: 0 };

    if (wpm > previousData.wpm || accuracy > previousData.accuracy || time_taken > previousData.time){
    const updated_data = {
        wpm: wpm,
        accuracy: accuracy,
        time: time_taken
    };
    localStorage.setItem('bca_exam_prep_typing_data', JSON.stringify(updated_data));
}
}
loadFromLocalStorage() {
    // Get saved data from localStorage
    const savedData = localStorage.getItem('bca_exam_prep_typing_data');

    // Check if data exists
    if (savedData) {
        document.getElementById('saved-game-info').style.display = 'flex';
        const typingData = JSON.parse(savedData);
        document.getElementById('saved-wpm').textContent = 'WPM: ' + typingData.wpm;
        document.getElementById('saved-accuracy').textContent = 'Accuracy: ' + typingData.accuracy + "%";
        document.getElementById('saved-time').textContent = 'Time: ' + typingData.time;
    } else {
        document.getElementById('saved-game-info').style.display = 'none'; 
    }
}

    /*saveScore(wpm, accuracy) {
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
    }*/
    moveCursor() {
        const codeChars = this.codeDisplay.querySelectorAll('.char');
        this.cursor.remove();
    
        if (this.charIndex < codeChars.length) {
            codeChars[this.charIndex].insertAdjacentElement('beforebegin', this.cursor);
            this.ensureCursorVisible();
        } else {
            this.codeDisplay.appendChild(this.cursor);
        }
    }
    ensureCursorVisible() {
        const cursorElement = this.cursor;
        if (!cursorElement) return;

        const displayRect = this.codeDisplay.getBoundingClientRect();
        const cursorRect = cursorElement.getBoundingClientRect();
        const line = cursorElement.closest('.line');

        // Vertical scrolling
        const cursorTop = cursorRect.top - displayRect.top;
        const cursorBottom = cursorRect.bottom - displayRect.top;
        const viewportHeight = this.codeDisplay.clientHeight;
        const currentScrollTop = this.codeDisplay.scrollTop;

        // Define buffer zones (20% of viewport)
        const topBuffer = viewportHeight * 0.2;
        const bottomBuffer = viewportHeight * 0.8;

        let newScrollTop = currentScrollTop;

        // Scroll if cursor is too close to top or bottom
        if (cursorTop < topBuffer) {
            // Cursor too close to top
            newScrollTop = currentScrollTop - (topBuffer - cursorTop);
        } else if (cursorBottom > bottomBuffer) {
            // Cursor too close to bottom
            newScrollTop = currentScrollTop + (cursorBottom - bottomBuffer);
        }

        // Horizontal scrolling if needed
        if (line) {
            const lineRect = line.getBoundingClientRect();
            const cursorLeft = cursorRect.left - lineRect.left;
            const cursorRight = cursorRect.right - lineRect.left;
            const lineWidth = line.clientWidth;
            const currentScrollLeft = line.scrollLeft;

            // Define horizontal buffer (10% of line width)
            const horizontalBuffer = lineWidth * 0.1;

            if (cursorLeft < horizontalBuffer) {
                // Cursor too close to left
                line.scrollLeft = currentScrollLeft - (horizontalBuffer - cursorLeft);
            } else if (cursorRight > lineWidth - horizontalBuffer) {
                // Cursor too close to right
                line.scrollLeft = currentScrollLeft + (cursorRight - (lineWidth - horizontalBuffer));
            }
        }

        // Apply vertical scroll if needed
        if (newScrollTop !== currentScrollTop) {
            this.smoothScrollTo(newScrollTop);
        }
    }

    smoothScrollTo(targetPosition) {
        const startPosition = this.codeDisplay.scrollTop;
        const distance = targetPosition - startPosition;
        const duration = 150; // Reduced duration for more responsive feeling
        const startTime = performance.now();

        const animateScroll = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            // Linear easing for more predictable cursor following
            const newPosition = startPosition + (distance * progress);
            this.codeDisplay.scrollTop = newPosition;

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
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
    const correctlyTypedCharacters = this.codeInput.value.length - this.mistakes; // Total correct characters
    const wordsTyped = correctlyTypedCharacters / 5; // Standard: 5 characters = 1 word
    return Math.round(wordsTyped / minutes); // Calculate WPM based on correct characters
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


   displayTextWithWrapping() {
    const words = this.currentContent.split(' ');
    let currentLine = '';
    let lines = [];
    const maxLineLength = 60; 
    const punctuationMarks = ['.', ',', ';', ':', '!', '?']; // Consider these marks for natural breaks
    const threshold = maxLineLength * 0.75; // Allow early wrapping if the line has punctuation and exceeds 75% of the max

    words.forEach(word => {
        // Check if adding this word would exceed the max line length
        if ((currentLine + word).length > maxLineLength) {
            // If the current line contains punctuation and is longer than the threshold, wrap it
            if (punctuationMarks.some(mark => currentLine.includes(mark)) && currentLine.length > threshold) {
                lines.push(currentLine.trim());
                currentLine = '';
            } else {
                lines.push(currentLine.trim());
                currentLine = '';
            }
        }
        currentLine += word + ' ';
    });

    // Push any remaining text in the currentLine after the loop
    if (currentLine.trim()) {
        lines.push(currentLine.trim());
    }

    const wrappedText = lines.join('\n');
    this.currentContent = wrappedText; // Update currentContent with wrapped text

    // Create spans for each character
    const textHtml = wrappedText.split('').map(char => 
        `<span class="char">${char === '\n' ? '\n' : char}</span>`
    ).join('');

    this.codeDisplay.innerHTML = textHtml;

    // Insert cursor at the beginning
    const firstChar = this.codeDisplay.querySelector('.char');
    if (firstChar) {
        firstChar.insertAdjacentElement('beforebegin', this.cursor);
    }
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
