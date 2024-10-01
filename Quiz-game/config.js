// config.js
const CONFIG = {
    gameSettings: {
        defaultTimeLimit: 60,
        pointsPerCorrectAnswer: 10,
        penalties: {
            wrongAnswer: 5
        }
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
],
    firebaseConfig = {
    apiKey: "AIzaSyAF4vkip75_XV74EP6vf_TrsnbRbQur1iQ",
    authDomain: "bcaexamprep-auth-project.firebaseapp.com",
    projectId: "bcaexamprep-auth-project",
    storageBucket: "bcaexamprep-auth-project.appspot.com",
    messagingSenderId: "666537879299",
    appId: "1:666537879299:web:70401ac08f2a8dde42ab36",
    measurementId: "G-WWWFS9DPH9"
}
};

// Export the configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
