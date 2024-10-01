class AuthManager {
    constructor() {
        this.initializeFirebase();
        this.setupAuthUI();
        this.setupAuthListeners();
    }

    initializeFirebase() {
        // Initialize Firebase with your config
        const firebaseConfig = {firebaseConfig = {
    apiKey: "AIzaSyAF4vkip75_XV74EP6vf_TrsnbRbQur1iQ",
    authDomain: "bcaexamprep-auth-project.firebaseapp.com",
    projectId: "bcaexamprep-auth-project",
    storageBucket: "bcaexamprep-auth-project.appspot.com",
    messagingSenderId: "666537879299",
    appId: "1:666537879299:web:70401ac08f2a8dde42ab36",
    measurementId: "G-WWWFS9DPH9"};
        firebase.initializeApp(firebaseConfig);
    }

    setupAuthUI() {
        this.loginBtn = document.getElementById('loginBtn');
        this.signupBtn = document.getElementById('signupBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.loginModal = document.getElementById('loginModal');
        this.signupModal = document.getElementById('signupModal');
        this.loginForm = document.getElementById('loginForm');
        this.signupForm = document.getElementById('signupForm');

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.loginModal.style.display = 'none';
                this.signupModal.style.display = 'none';
            });
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.loginModal) this.loginModal.style.display = 'none';
            if (e.target === this.signupModal) this.signupModal.style.display = 'none';
        });
    }

    setupAuthListeners() {
        this.loginBtn.addEventListener('click', () => this.loginModal.style.display = 'block');
        this.signupBtn.addEventListener('click', () => this.signupModal.style.display = 'block');
        this.logoutBtn.addEventListener('click', () => this.logout());

        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.signupForm.addEventListener('submit', (e) => this.handleSignup(e));

        firebase.auth().onAuthStateChanged(user => this.handleAuthStateChange(user));
    }

    handleLogin(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]').value;

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                this.loginModal.style.display = 'none';
                this.syncLocalData();
            })
            .catch(error => alert(error.message));
    }

    handleSignup(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]').value;
        const username = e.target.querySelector('input[type="text"]').value;

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                return userCredential.user.updateProfile({
                    displayName: username
                });
            })
            .then(() => {
                this.signupModal.style.display = 'none';
                this.syncLocalData();
            })
            .catch(error => alert(error.message));
    }

    handleAuthStateChange(user) {
        if (user) {
            this.loginBtn.style.display = 'none';
            this.signupBtn.style.display = 'none';
            this.logoutBtn.style.display = 'block';
        } else {
            this.loginBtn.style.display = 'block';
            this.signupBtn.style.display = 'block';
            this.logoutBtn.style.display = 'none';
        }
    }

    logout() {
        firebase.auth().signOut()
            .then(() => {
                // Handle any UI updates after logout
            })
            .catch(error => alert(error.message));
    }

    syncLocalData() {
        const localGameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
        if (localGameHistory.length > 0) {
            const batch = firebase.firestore().batch();
            const userRef = firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid);
            
            localGameHistory.forEach(game => {
                const gameRef = firebase.firestore().collection('gameHistory').doc();
                batch.set(gameRef, {
                    ...game,
                    userId: firebase.auth().currentUser.uid
                });
            });

            batch.commit()
                .then(() => {
                    localStorage.removeItem('gameHistory');
                    console.log('Local data synced successfully');
                })
                .catch(error => console.error('Error syncing local data:', error));
        }
    }
}

// Initialize AuthManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const authManager = new AuthManager();
});
