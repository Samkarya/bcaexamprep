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
