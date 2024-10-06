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
       
        this.signupBtn = document.getElementById('signupBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
    }

    setupAuthListeners() {
        this.logoutBtn.addEventListener('click', () => this.logout());
        onAuthStateChanged(auth, user => this.handleAuthStateChange(user));
    }

   
    handleAuthStateChange(user) {
        if (user) {
            this.signupBtn.style.display = 'none';
            this.logoutBtn.style.display = 'block';
        } else {
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
