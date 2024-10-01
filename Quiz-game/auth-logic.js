// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-check.js";
import { firebaseConfig } from "https://samkarya.github.io/bcaexamprep/firebase/common-utils.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LeER1AqAAAAABaic_YKxvN30vuPQPlMJfpS9e1L'),
    isTokenAutoRefreshEnabled: true
});

class AuthManager {
    constructor() {
        this.setupAuthUI();
        this.setupAuthListeners();
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

        onAuthStateChanged(auth, user => this.handleAuthStateChange(user));
    }

    handleLogin(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]').value;

        signInWithEmailAndPassword(auth, email, password)
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

        createUserWithEmailAndPassword(auth, email, password)
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
        signOut(auth)
            .then(() => {
                // Handle any UI updates after logout
            })
            .catch(error => alert(error.message));
    }

    async syncLocalData() {
        const localGameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
        if (localGameHistory.length > 0 && auth.currentUser) {
            try {
                const userDocRef = doc(db, 'users', auth.currentUser.uid);
                await setDoc(userDocRef, {
                    gameHistory: localGameHistory
                }, { merge: true });
                
                localStorage.removeItem('gameHistory');
                console.log('Local data synced successfully');
            } catch (error) {
                console.error('Error syncing local data:', error);
            }
        }
    }
}

// Initialize AuthManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const authManager = new AuthManager();
});

export { auth, db };
