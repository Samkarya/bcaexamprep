
import { auth, db } from './auth-logic.js';
import { getDoc, doc,collection, serverTimestamp, writeBatch } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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
            difficulty: 2,
            fileName: 'c-prog-mcqs.js'
        },
        {
            id: 'digital_electronics',
            name: 'Digital Electronics',
            icon: '🔌',
            difficulty: 3,
            fileName: 'decomcqs.js'
        },
        {
            id: 'computer_graphics',
            name: 'Computer Graphics',
            icon: '🎨',
            difficulty: 2,
            fileName: 'cgma-mcqs.js'
        },
        {
            id: 'operating_system',
            name: 'Operating System',
            icon: '🖥️',
            difficulty: 4,
            fileName: 'os-mcqs.js'
        },
        {
            id: 'software_engineering',
            name: 'Software Engineering',
            icon: '🔧',
            difficulty: 3,
            fileName: 'software-engineering-mcqs.js'
        },
        {
            id: 'optimization_techniques',
            name: 'Optimization Techniques',
            icon: '📈',
            difficulty: 4,
            fileName: 'optimization-research-mcqs.js'
        },
        {
            id: 'graph_theory',
            name: 'Graph Theory',
            icon: '📊',
            difficulty: 3,
            fileName: 'graph-theory-mcqs.js'
        }
    ]
};

// Helper function to find subject config by ID
function getSubjectConfig(subjectId) {
    return GAME_CONFIG.subjects.find(subject => subject.id === subjectId);
}
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
        this.timeRemaining = null;
        this.currentSubject = null;
        this.questions = [];
        this.questionSets = new Map();
        
        // DOM Elements
       // DOM Elements
        this.elements = {
            welcomeScreen: document.getElementById('welcomeScreen'),
            gameScreen: document.getElementById('gameScreen'),
            resultScreen: document.getElementById('resultScreen'),
            questionElement: document.getElementById('question'),
            optionsContainer: document.getElementById('options'),
            scoreElement: document.getElementById('scoreValue'),
            timerElement: document.getElementById('timerValue'),
            subjectButtons: document.getElementById('subjectButtons'),
            timeSlider: document.getElementById('timeSlider'),
            timeDisplay: document.getElementById('timeDisplay')
        };
        
        this.initializeSubjects();
        this.initializeTimeSelection();
        this.setupEventListeners();
    }

    initializeTimeSelection() {
        this.elements.timeSlider.addEventListener('input', (e) => {
            const seconds = e.target.value;
            this.elements.timeDisplay.textContent = `${seconds} seconds`;
        });
    }
    
     initializeSubjects() {
        GAME_CONFIG.subjects.forEach(subject => {
            const button = document.createElement('button');
            button.classList.add('subject-btn');
            button.dataset.subjectId = subject.id;
            button.setAttribute('aria-label', `Start ${subject.name} quiz`);
            
            const icon = document.createElement('span');
            icon.textContent = subject.icon;
            icon.classList.add('subject-icon');
            icon.setAttribute('aria-hidden', 'true');
            
            const name = document.createElement('span');
            name.textContent = subject.name;
            
            const difficulty = document.createElement('span');
            difficulty.textContent = '⭐'.repeat(subject.difficulty);
            difficulty.classList.add('difficulty');
            difficulty.setAttribute('aria-label', `Difficulty: ${subject.difficulty} out of 5`);
            
            button.appendChild(icon);
            button.appendChild(name);
            button.appendChild(difficulty);
            
            button.addEventListener('click', () => this.startGame(subject.id));
            this.elements.subjectButtons.appendChild(button);
        });
    }

    setupEventListeners() {
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('viewLeaderboardBtn').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.showWelcomeScreen());
    }
     
       

     async loadQuestions(subjectId) {
        try {
            if (this.questionSets.has(subjectId)) {
                return this.questionSets.get(subjectId);
            }

            const subjectConfig = getSubjectConfig(subjectId);
            if (!subjectConfig) {
                throw new Error(`No configuration found for subject: ${subjectId}`);
            }

            // Using a predefined list of allowed file names for security
            const allowedFiles = GAME_CONFIG.subjects.map(subject => subject.fileName);
            if (!allowedFiles.includes(subjectConfig.fileName)) {
                throw new Error(`Invalid file name: ${subjectConfig.fileName}`);
            }

            const module = await import(`https://samkarya.github.io/mcq-data/${subjectConfig.fileName}`);
            const questions = module.default || module.mcqs;

            if (!Array.isArray(questions) || !questions.length) {
                throw new Error(`Invalid questions format in ${subjectConfig.fileName}`);
            }

            this.questionSets.set(subjectId, questions);
            return this.shuffleQuestions(questions);

        } catch (error) {
            console.error('Error loading questions:', error);
            return this.getFallbackQuestions(subjectId);
        }
    }

    shuffleQuestions(questions) {
        return [...questions].sort(() => Math.random() - 0.5);
    }

     getFallbackQuestions(subjectId) {
        const subject = getSubjectConfig(subjectId);
        return [{
            question: `Sample question for ${subject.name}`,
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            answer: "A",
            explanation: "This is a fallback question. The actual questions failed to load."
        }];
    }
  
         
       async startGame(subjectId) {
        if (!auth.currentUser) {
            const proceed = await this.showConfirmDialog('You need to be logged in to save your score and compete on the leaderboard. Continue as guest?');
            if (!proceed) return;
        }
        this.currentSubject = subjectId;
        const subject = getSubjectConfig(subjectId);
        this.timeRemaining = parseInt(this.elements.timeSlider.value) || GAME_CONFIG.defaultTimeLimit;
        this.questions = await this.loadQuestions(subjectId);
        this.currentQuestion = 0;
        this.score = 0;
        
        this.elements.welcomeScreen.style.display = 'none';
        this.elements.gameScreen.style.display = 'block';
        
        document.getElementById('currentSubject').textContent = subject.name;
        document.getElementById('subjectIcon').textContent = subject.icon;
        
        this.startTimer();
        this.displayQuestion();
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestion];
        if (!question) {
            this.endGame();
            return;
        }

       // Render HTML content and MathJax in the question
    this.elements.questionElement.innerHTML = question.question;
    MathJax.typeset();  // Ensure MathJax renders the math code
        
        this.elements.optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const button = document.createElement('div');
            button.classList.add('option');
            button.innerHTML = option;  // Render HTML in options
            button.dataset.index = index;
            button.addEventListener('click', () => this.checkAnswer(index));
            this.elements.optionsContainer.appendChild(button);
        });
    }

    checkAnswer(selectedIndex) {
        const question = this.questions[this.currentQuestion];
        const correctLetter = question.answer.split('.')[0].trim();
        const correctIndex = 'ABCD'.indexOf(correctLetter);
        
        const options = this.elements.optionsContainer.querySelectorAll('.option');
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
            this.score += GAME_CONFIG.pointsPerCorrectAnswer;
            this.elements.scoreElement.textContent = this.score;
        }
        
        /*if (question.explanation) {
            const explanationDiv = document.createElement('div');
            explanationDiv.classList.add('explanation');
            explanationDiv.textContent = question.explanation;
            this.elements.optionsContainer.appendChild(explanationDiv);
        }*/

        setTimeout(() => {
            this.currentQuestion++;
            if (this.currentQuestion < this.questions.length) {
                this.displayQuestion();
            } else {
                this.endGame();
            }
        }, 2000);
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.elements.timerElement.textContent = this.timeRemaining;
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
            timeTaken: GAME_CONFIG.defaultTimeLimit - this.timeRemaining
        };
        
        this.saveGameData(gameData);
        this.showResultScreen(gameData);
    }

    async saveGameData(gameData) {
        if (auth.currentUser) {
            try {
                const batch = writeBatch(db);

                const userDocRef = doc(db, 'users', auth.currentUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    batch.set(userDocRef, {
                        gameHistory: [],
                        displayName: auth.currentUser.displayName || 'Anonymous User',
                        email: auth.currentUser.email
                    });
                }
                
                const gameHistoryRef = doc(collection(db, 'gameHistory'));
                batch.set(gameHistoryRef, {
                    userId: auth.currentUser.uid,
                    ...gameData,
                    timestamp: serverTimestamp()
                });

                await batch.commit();
            } catch (error) {
                console.error('Error saving game data to Firestore:', error);
                this.saveToLocalStorage(gameData);
            }
        } else {
            this.saveToLocalStorage(gameData);
        }
    }

    saveToLocalStorage(gameData) {
        const localGameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
        localGameHistory.push({
            ...gameData,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('gameHistory', JSON.stringify(localGameHistory));
    }

    showResultScreen(gameData) {
        this.elements.gameScreen.style.display = 'none';
        this.elements.resultScreen.style.display = 'block';
        
        document.getElementById('finalScore').textContent = gameData.score;
        document.getElementById('timeTaken').textContent = gameData.timeTaken + 's';
    }

    async showLeaderboard() {
        if (!auth.currentUser) {
            await this.showAlert('Please sign in to view the leaderboard!');
            return;
        }
        
        this.elements.resultScreen.style.display = 'none';
        document.getElementById('leaderboardScreen').style.display = 'block';
        // Implement leaderboard data loading here
    }

    resetGame() {
        this.elements.resultScreen.style.display = 'none';
        this.startGame(this.currentSubject);
    }

    showWelcomeScreen() {
        this.elements.resultScreen.style.display = 'none';
        this.elements.welcomeScreen.style.display = 'block';
    }

    // Utility methods for better user interaction
    showAlert(message) {
        return new Promise(resolve => {
            alert(message);
            resolve();
        });
    }

    showConfirmDialog(message) {
        return new Promise(resolve => {
            const result = confirm(message);
            resolve(result);
        });
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new QuizGame();
});
