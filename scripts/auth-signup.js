// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    serverTimestamp,
    runTransaction
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js";
import { 
    initializeAppCheck, 
    ReCaptchaV3Provider 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-check.js";

import { firebaseConfig } from "https://samkarya.github.io/bcaexamprep/firebase/common-utils.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore(app);

// Initialize Firebase App Check
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LeER1AqAAAAABaic_YKxvN30vuPQPlMJfpS9e1L'),
    isTokenAutoRefreshEnabled: true
});

// Get DOM elements
const authForm = document.getElementById('auth-form');
const authPopup = document.getElementById('auth-popup');
const authOverlay = document.getElementById('auth-overlay');
const closeAuth = document.getElementById('close-auth');
const authTitle = document.getElementById('auth-title');
const authBtn = document.getElementById('auth-btn');
const authSwitchText = document.getElementById('auth-switch-text');
const authSwitchLink = document.getElementById('auth-switch-link');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const usernameInput = document.getElementById('username');
const usernameGroup = document.getElementById('username-group');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const passwordToggle = document.getElementById('password-toggle');
const passwordStrength = document.querySelector('.password-strength');
const passwordStrengthText = document.querySelector('.password-strength-text');
const authSpinner = document.getElementById('auth-spinner');

let isLoginMode = false;

// Enhanced user creation function
async function createUserProfile(user, username, email) {
    try {
        await runTransaction(db, async (transaction) => {
            // Check username in transaction
            const usernameDoc = await transaction.get(doc(db, 'usernames', username.toLowerCase()));
            if (usernameDoc.exists()) {
                throw new Error('Username already taken');
            }
            
            // Set user profile
            const userDocRef = doc(db, 'users', user.uid);
            transaction.set(userDocRef, {
                username: username,
                email: email,
                createdAt: serverTimestamp(),
                lastActive: serverTimestamp(),
                preferences: {
                    theme: 'light',
                },
                achievements: [],
                roles: ['user']
            });
            
            // Set username
            const usernameDocRef = doc(db, 'usernames', username.toLowerCase());
            transaction.set(usernameDocRef, {
                uid: user.uid,
                createdAt: serverTimestamp()
            });
        });
        return true;
    } catch (error) {
        console.error("Error in createUserProfile:", error);
        throw error;
    }
}

// Function to update last active timestamp
async function updateLastActive(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            lastActive: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error("Error updating last active:", error);
    }
}

// Auth form submit handler
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const username = usernameInput ? usernameInput.value.trim() : null;

    errorMessage.textContent = '';
    successMessage.textContent = '';

    if (email === '' || password === '' || (!isLoginMode && username === '')) {
        errorMessage.textContent = 'Please fill in all fields.';
        return;
    }

    // Show loading spinner
    authBtn.style.display = 'none';
    authSpinner.style.display = 'block';

    try {
        if (!isLoginMode) {
            // Create user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await createUserProfile(userCredential.user, username, email);
            successMessage.textContent = 'Account created successfully!';
        } else {
            // Login
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await updateLastActive(userCredential.user.uid);
            successMessage.textContent = 'Logged in successfully!';
        }

        // Clear input fields
        emailInput.value = '';
        passwordInput.value = '';
        if (usernameInput) usernameInput.value = '';
        
        setTimeout(() => {
            window.location.reload();
        }, 1500); // Give user time to see success message
    } catch (error) {
        let friendlyErrorMessage = "An error occurred. Please try again.";
        if (error.message === 'Username already taken') {
            friendlyErrorMessage = "This username is already taken. Please choose another.";
        } else if (error.code === 'auth/email-already-in-use') {
            friendlyErrorMessage = "This email is already registered. Please try logging in instead.";
        } else if (error.code === 'auth/invalid-email') {
            friendlyErrorMessage = "Please enter a valid email address.";
        } else if (error.code === 'auth/weak-password') {
            friendlyErrorMessage = "Password should be at least 6 characters long.";
        } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            friendlyErrorMessage = "Invalid email or password. Please try again.";
        }
        errorMessage.textContent = friendlyErrorMessage;
    } finally {
        // Hide loading spinner and show button
        authBtn.style.display = 'block';
        authSpinner.style.display = 'none';
    }
});

// Password strength checker
function checkPasswordStrength(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return 0;
    let strength = 0;
    if (hasUppercase) strength++;
    if (hasLowercase) strength++;
    if (hasNumbers) strength++;
    if (hasSpecialChars) strength++;
    return strength;
}

function updatePasswordStrengthIndicator(strength) {
    const colors = ['#ff4d4d', '#ffa500', '#ffff00', '#00ff00'];
    const texts = ['Weak', 'Fair', 'Good', 'Strong'];
    passwordStrength.style.width = `${(strength / 4) * 100}%`;
    passwordStrength.style.backgroundColor = colors[strength - 1] || '';
    passwordStrengthText.textContent = texts[strength - 1] || '';
}

// Event Listeners
passwordInput.addEventListener('input', () => {
    const strength = checkPasswordStrength(passwordInput.value);
    updatePasswordStrengthIndicator(strength);
});

passwordToggle.addEventListener('click', () => {
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordToggle.textContent = passwordInput.type === 'password' ? 'Show' : 'Hide';
});

authSwitchLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    updateAuthMode();
});

// Update auth mode function
function updateAuthMode() {
    authPopup.style.opacity = '0';
    setTimeout(() => {
        authTitle.textContent = isLoginMode ? 'Login' : 'Create Account';
        authBtn.textContent = isLoginMode ? 'Login' : 'Sign Up';
        authSwitchText.textContent = isLoginMode ? "Don't have an account?" : 'Already have an account?';
        authSwitchLink.textContent = isLoginMode ? 'Sign up here' : 'Login here';
        usernameGroup.style.display = isLoginMode ? 'none' : 'block';
        errorMessage.textContent = '';
        successMessage.textContent = '';
        authPopup.style.opacity = '1';
    }, 300);
}

// Auth state observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        updateLastActive(user.uid);
    }
});

// Show/hide auth popup
window.showAuthPopup = function() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is already logged in");
            // Redirect to dashboard or show a message
        } else {
            authOverlay.style.display = 'block';
            authPopup.style.display = 'block';
            setTimeout(() => {
                authOverlay.style.opacity = '1';
                authPopup.style.opacity = '1';
            }, 50);
        }
    });
}

closeAuth.addEventListener('click', () => {
    authOverlay.style.opacity = '0';
    authPopup.style.opacity = '0';
    setTimeout(() => {
        authOverlay.style.display = 'none';
        authPopup.style.display = 'none';
    }, 300);
});
