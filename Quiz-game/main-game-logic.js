class QuizGame {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.timer = null;
        this.timeRemaining = 60;
        this.currentSubject = null;
        this.questions = [];
        
        // DOM Elements
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.resultScreen = document.getElementById('resultScreen');
        this.questionElement = document.getElementById('question');
        this.optionsContainer = document.getElementById('options');
        this.scoreElement = document.getElementById('scoreValue');
        this.timerElement = document.getElementById('timerValue');
        this.subjectButtons = document.getElementById('subjectButtons');
        
        this.initializeSubjects();
        this.setupEventListeners();
    }

    initializeSubjects() {
        const subjects = ['C Programming', 'Digital Electronics', 'Computer Graphics', 'Operating System', 'Software Engineering', 'Optimization Techniquies', 'Graph Theory'];
        subjects.forEach(subject => {
            const button = document.createElement('button'); 
            button.classList.add('subject-btn');
            button.textContent = subject;
            button.addEventListener('click', () => this.startGame(subject));
            this.subjectButtons.appendChild(button);
        });
    }

    setupEventListeners() {
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('viewLeaderboardBtn').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.showWelcomeScreen());
    }

    startGame(subject) {
        this.currentSubject = subject;
        this.questions = this.loadQuestions(subject);
        this.currentQuestion = 0;
        this.score = 0;
        this.timeRemaining = 60;
        
        this.welcomeScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';
        
        this.startTimer();
        this.displayQuestion();
    }

    loadQuestions(subject) {
        // In a real implementation, this would load from your subject-specific JS files
        // For now, we'll return a dummy question
        return [
            {
                question: "Sample question for " + subject,
                options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                answer: "B. Option 2",
                explanation: "This is an explanation"
            }
        ];
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestion];
        this.questionElement.textContent = question.question;
        
        this.optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.classList.add('option');
            button.textContent = option;
            button.addEventListener('click', () => this.checkAnswer(index));
            this.optionsContainer.appendChild(button);
        });
    }

    checkAnswer(selectedIndex) {
        const question = this.questions[this.currentQuestion];
        const correctIndex = question.answer.charAt(0).toUpperCase().charCodeAt(0) - 65;
        
        if (selectedIndex === correctIndex) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
        }
        
        this.currentQuestion++;
        if (this.currentQuestion < this.questions.length) {
            this.displayQuestion();
        } else {
            this.endGame();
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.timerElement.textContent = this.timeRemaining;
            
            if (this.timeRemaining <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    endGame() {
        clearInterval(this.timer);
        
        const gameData = {
            subject: this.currentSubject,
            score: this.score,
            timeTaken: 60 - this.timeRemaining
        };
        
        this.saveGameData(gameData);
        this.showResultScreen(gameData);
    }

    saveGameData(gameData) {
        if (firebase.auth().currentUser) {
            // Save to Firestore
            firebase.firestore().collection('gameHistory').add({
                userId: firebase.auth().currentUser.uid,
                ...gameData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Save to localStorage
            const localGameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
            localGameHistory.push({
                ...gameData,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('gameHistory', JSON.stringify(localGameHistory));
        }
    }

    showResultScreen(gameData) {
        this.gameScreen.style.display = 'none';
        this.resultScreen.style.display = 'block';
        
        document.getElementById('finalScore').textContent = gameData.score;
        document.getElementById('timeTaken').textContent = gameData.timeTaken + 's';
    }

    showLeaderboard() {
        this.resultScreen.style.display = 'none';
        document.getElementById('leaderboardScreen').style.display = 'block';
        // Leaderboard logic will be implemented in leaderboard.js
    }

    showWelcomeScreen() {
        document.getElementById('leaderboardScreen').style.display = 'none';
        this.welcomeScreen.style.display = 'block';
    }

    resetGame() {
        this.resultScreen.style.display = 'none';
        this.startGame(this.currentSubject);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new QuizGame();
});
