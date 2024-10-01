
import { auth, db } from './auth-logic.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Game settings
const GAME_CONFIG = {
    defaultTimeLimit: 60,
    pointsPerCorrectAnswer: 10,
    penalties: {
        wrongAnswer: 5
    },
    subjects: [
    {
        id: 'c_programming',
        name: 'C Programming',
        icon: '💻',
        difficulty: 2
    },
    {
        id: 'digital_electronics',
        name: 'Digital Electronics',
        icon: '🔌',
        difficulty: 3
    },
    {
        id: 'computer_graphics',
        name: 'Computer Graphics',
        icon: '🎨',
        difficulty: 2
    },
    {
        id: 'operating_system',
        name: 'Operating System',
        icon: '🖥️',
        difficulty: 4
    },
    {
        id: 'software_engineering',
        name: 'Software Engineering',
        icon: '🔧',
        difficulty: 3
    },
    {
        id: 'optimization_techniques',
        name: 'Optimization Techniques',
        icon: '📈',
        difficulty: 4
    },
    {
        id: 'graph_theory',
        name: 'Graph Theory',
        icon: '📊',
        difficulty: 3
    }
]
        };
// Map subject names to file names
const SUBJECT_FILE_MAP = {
    'C Programming': 'c-prog-mcqs.js',
    'Computer Graphics': 'cgma-mcqs.js',
    'Digital Electronics': 'decomcqs.js',
    'Graph Theory': 'graph-theory-mcqs.js',
    'Operating Systems': 'os-mcqs.js',
    'Software Engineering': 'software-engineering-mcqs.js',
    'Optimization Research': 'optimization-research-mcqs.js'
};

class QuizGame {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.timer = null;
        this.timeRemaining = GAME_CONFIG.defaultTimeLimit;
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
        
        // Add property to store loaded question sets
        this.questionSets = new Map();
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

    async loadQuestions(subject) {
         try {
            // Check if questions are already loaded
            if (this.questionSets.has(subject)) {
                return this.questionSets.get(subject);
            }

            // Get the corresponding file name
            const fileName = SUBJECT_FILE_MAP[subject];
            if (!fileName) {
                throw new Error(`No question file found for subject: ${subject}`);
            }

            // Dynamically import the question file
            const module = await import(`https://samkarya.github.io/mcq-data/${fileName}`);
            const questions = module.default || module.questions;

            // Validate questions format
            if (!Array.isArray(questions) || !questions.length) {
                throw new Error(`Invalid questions format in ${fileName}`);
            }

            // Store questions for future use
            this.questionSets.set(subject, questions);

            // Shuffle questions
            return this.shuffleQuestions(questions);

        } catch (error) {
            console.error('Error loading questions:', error);
            return this.getFallbackQuestions(subject);
        }
    }

    shuffleQuestions(questions) {
        const shuffled = [...questions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    getFallbackQuestions(subject) {
        return [
            {
                question: `Sample question for ${subject}`,
                options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                answer: "B",
                explanation: "This is a fallback question. The actual questions failed to load."
            }
        ];
    }

      async startGame(subject) {
        this.currentSubject = subject;
        this.questions = await this.loadQuestions(subject);
        this.currentQuestion = 0;
        this.score = 0;
        this.timeRemaining = GAME_CONFIG.defaultTimeLimit;
        
        this.welcomeScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';
        
        this.startTimer();
        this.displayQuestion();
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestion];
        if (!question) {
            this.endGame();
            return;
        }

        this.questionElement.textContent = question.question;
        
        this.optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.classList.add('option');
            button.textContent = option;
            button.dataset.index = index;
            button.addEventListener('click', () => this.checkAnswer(index));
            this.optionsContainer.appendChild(button);
        });
    }

    checkAnswer(selectedIndex) {
        const question = this.questions[this.currentQuestion];
        const correctIndex = 'ABCD'.indexOf(question.answer.charAt(0));
        
        // Disable all options
        const options = this.optionsContainer.querySelectorAll('.option');
        options.forEach(option => {
            option.disabled = true;
            const index = parseInt(option.dataset.index);
            if (index === correctIndex) {
                option.classList.add('correct');
            } else if (index === selectedIndex) {
                option.classList.add('incorrect');
            }
        });

        if (selectedIndex === correctIndex) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
        }
        
        // Show explanation if available
        if (question.explanation) {
            const explanationDiv = document.createElement('div');
            explanationDiv.classList.add('explanation');
            explanationDiv.textContent = question.explanation;
            this.optionsContainer.appendChild(explanationDiv);
        }

        // Wait before moving to next question
        setTimeout(() => {
            this.currentQuestion++;
            if (this.currentQuestion < this.questions.length) {
                this.displayQuestion();
            } else {
                this.endGame();
            }
        }, 2000);
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

   async saveGameData(gameData) {
    if (auth.currentUser) {
        try {
            // Save to Firestore
            const gameHistoryRef = collection(db, 'gameHistory');
            await addDoc(gameHistoryRef, {
                userId: auth.currentUser.uid,
                ...gameData,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error('Error saving game data to Firestore:', error);
            // Fallback to localStorage if Firestore save fails
            this.saveToLocalStorage(gameData);
        }
    } else {
        // Save to localStorage
        this.saveToLocalStorage(gameData);
    }
}

// Helper method to save to localStorage
saveToLocalStorage(gameData) {
    const localGameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
    localGameHistory.push({
        ...gameData,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('gameHistory', JSON.stringify(localGameHistory));
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
