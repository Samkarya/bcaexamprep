
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
        this.timeRemaining = GAME_CONFIG.defaultTimeLimit;
        this.currentSubject = null;
        this.questions = [];
        this.questionSets = new Map();
        
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
        this.initializeTimeSelection();
        this.setupEventListeners();
    }

    
    initializeTimeSelection() {
        const timeSlider = document.getElementById('timeSlider');
        const timeDisplay = document.getElementById('timeDisplay');
        
        timeSlider.addEventListener('input', (e) => {
            const seconds = e.target.value;
            timeDisplay.textContent = `${seconds} seconds`;
        });
    }
    
     initializeSubjects() {
        GAME_CONFIG.subjects.forEach(subject => {
            const button = document.createElement('button');
            button.classList.add('subject-btn');
            button.dataset.subjectId = subject.id;
            
            const icon = document.createElement('span');
            icon.textContent = subject.icon;
            icon.classList.add('subject-icon');
            
            const name = document.createElement('span');
            name.textContent = subject.name;
            
            const difficulty = document.createElement('span');
            difficulty.textContent = '⭐'.repeat(subject.difficulty);
            difficulty.classList.add('difficulty');
            
            button.appendChild(icon);
            button.appendChild(name);
            button.appendChild(difficulty);
            
            button.addEventListener('click', () => this.startGame(subject.id));
            this.subjectButtons.appendChild(button);
        });
    }

    setupEventListeners() {
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('viewLeaderboardBtn').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.showWelcomeScreen());
    }

    startGame(subject) {
         if (!auth.currentUser) {
            const proceed = confirm('You need to be logged in to save your score and compete on the leaderboard. Continue as guest?');
            if (!proceed) return;
        }
        
        this.currentSubject = subject;
        this.timeRemaining = parseInt(document.getElementById('timeSlider').value);
        this.questions = this.loadQuestions(subject);
        this.currentQuestion = 0;
        this.score = 0;
        this.timeRemaining = 60;
        
        this.welcomeScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';
        
        this.startTimer();
        this.displayQuestion();
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
        const shuffled = [...questions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
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
        this.currentSubject = subjectId;
        const subject = getSubjectConfig(subjectId);
        
        this.questions = await this.loadQuestions(subjectId);
        this.currentQuestion = 0;
        this.score = 0;
        this.timeRemaining = GAME_CONFIG.defaultTimeLimit;
        
        this.welcomeScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';
        
        // Update UI with subject info
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
        const correctLetter = question.answer.split('.')[0].trim();
        const correctIndex = 'ABCD'.indexOf(correctLetter);
        
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

   async saveGameData(gameData) {
    if (auth.currentUser) {
        try {

            //create a reference to user's document 
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            //get user documents
            const userDoc = await getDoc(userDocRef);

             if (!userDoc.exists()) {
                // Create user document if it doesn't exist
                await setDoc(userDocRef, {
                    gameHistory: [],
                    displayName: auth.currentUser.displayName || 'Anonymous User',
                    email: auth.currentUser.email
                });
            }
            
              // Add new game to gameHistory collection
            const gameHistoryRef = collection(db, 'gameHistory');
            await addDoc(gameHistoryRef, {
                userId: auth.currentUser.uid,
                ...gameData,
                timestamp: serverTimestamp()
            });
            
        } catch (error) {
            console.error('Error saving game data to Firestore:', error);
            this.saveToLocalStorage(gameData);
        }
    } else {
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

    showLeaderboard() {
        if (!auth.currentUser) {
            alert('Please sign in to view the leaderboard!');
            return;
        }
        
        this.resultScreen.style.display = 'none';
        document.getElementById('leaderboardScreen').style.display = 'block';
        // Trigger leaderboard data load
    }
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
