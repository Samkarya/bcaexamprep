// Import Firebase modules 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, sendEmailVerification, updatePassword, sendPasswordResetEmail, updateEmail } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-check.js";
import { firebaseConfig, showToast, handleError } from "https://samkarya.github.io/bcaexamprep/firebase/common-utils.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LeER1AqAAAAABaic_YKxvN30vuPQPlMJfpS9e1L'),
  isTokenAutoRefreshEnabled: true
});

// Get DOM elements
const noAccountMessage = document.getElementById('no-account-message');
const authContainer = document.querySelector('.auth-container-dash');
const resetPasswordBtn = document.getElementById('reset-password-btn');
const usernameElement = document.getElementById('username');
const profileForm = document.getElementById('profile-form');
const nameInput = document.getElementById('name');
const ageInput = document.getElementById('age');
const genderSelect = document.getElementById('gender');
const educationFields = document.getElementById('education-fields');
const addEducationBtn = document.getElementById('add-education');
const goalsTextarea = document.getElementById('goals');
const verifyEmailBtn = document.getElementById('verify-email');
const logoutBtn = document.getElementById('logout-btn');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const loadingIndicator = document.getElementById('loading-indicator');
const toastElement = document.getElementById('toast');
const createAccountButton = document.getElementById('create-account-button');

let profileChangesCount = 0;
const MAX_PROFILE_CHANGES = 5;

// Authentication listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        noAccountMessage.style.display = 'none';
        authContainer.style.display = 'block';
        usernameElement.textContent = user.displayName || user.email;
        loadUserData(user.uid);
        updateEmailVerificationUI(user);
    } else {
        noAccountMessage.style.display = 'block';
        authContainer.style.display = 'none';
    }
});

// Load user data from Firestore
async function loadUserData(userId) {
    try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', userId));
        console.log(userDoc);
        if (userDoc.exists()) {
    const userData = userDoc.data();

    nameInput.value = userData.name || ''; // Default to empty string if missing
    usernameElement.textContent = userData.username || '🙏'; 
    ageInput.value = userData.age || ''; // Handle missing age
    genderSelect.value = userData.gender || ''; // Handle missing gender
    goalsTextarea.value = userData.goals || ''; // Handle missing goals
    // Load education data
    educationFields.innerHTML = ''; // Clear existing fields
    if (userData.education && userData.education.length > 0) {
        userData.education.forEach(edu => addEducationField(edu));
    } else {
        addEducationField(); // Add an empty field if no education data
    }

    // Handle profile change count logic
    const lastChangeDate = userData.lastChangeDate;
    const today = new Date().toISOString().split('T')[0];
    if (lastChangeDate === today) {
        profileChangesCount = userData.profileChangesCount || 0;
    } else {
        profileChangesCount = 0;
    }
} else {
    console.error('User document does not exist');
}

    } catch (error) {
        handleError(error);
    } finally {
        setLoading(false);
    }
}

// Save user data
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
        if (profileChangesCount >= MAX_PROFILE_CHANGES) {
            showToast('You have reached the maximum number of profile changes for today.', 'warning');
            return;
        }
        if (!validateForm()) {
            return;
        }
        try {
            setLoading(true);
            await setDoc(doc(db, 'users', user.uid), {
                name: nameInput.value,
                age: parseInt(ageInput.value),
                gender: genderSelect.value,
                education: getEducationData(),
                goals: goalsTextarea.value,
                profileChangesCount: profileChangesCount + 1,
                lastChangeDate: new Date().toISOString().split('T')[0]
            });
            profileChangesCount++;
            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    }
});

// Add education field
function addEducationField(data = {}) {
    const educationEntry = document.createElement('div');
    educationEntry.className = 'education-entry';
    educationEntry.innerHTML = `
        <input type="text" placeholder="College/University Name" class="college-name" required value="${data.collegeName || ''}">
        <input type="text" placeholder="Course" class="course" required value="${data.course || ''}">
        <input type="number" placeholder="Year" class="year" min="1900" max="2099" required value="${data.year || ''}">
        <input type="number" placeholder="Semester" class="semester" min="1" max="12" required value="${data.semester || ''}">
        <textarea placeholder="Other related info" class="other-info">${data.otherInfo || ''}</textarea>
        <button type="button" class="btn btn-remove-education">Remove</button>
    `;
    educationFields.appendChild(educationEntry);

    educationEntry.querySelector('.btn-remove-education').addEventListener('click', () => {
        educationFields.removeChild(educationEntry);
    });
}

// Get education data from form
function getEducationData() {
    const educationEntries = document.querySelectorAll('.education-entry');
    return Array.from(educationEntries).map(entry => ({
        collegeName: entry.querySelector('.college-name').value,
        course: entry.querySelector('.course').value,
        year: parseInt(entry.querySelector('.year').value),
        semester: parseInt(entry.querySelector('.semester').value),
        otherInfo: entry.querySelector('.other-info').value
    }));
}

// Add education button functionality
addEducationBtn.addEventListener('click', () => addEducationField());

// Form validation
function validateForm() {
    let isValid = true;
    if (!validateInput(nameInput.value, 'name')) {
        showError('Please enter a valid name (2-30 characters, letters only).');
        isValid = false;
    }
    if (!validateInput(ageInput.value, 'age')) {
        showError('Please enter a valid age (1-120).');
        isValid = false;
    }
    return isValid;
}

function validateInput(input, type) {
    switch(type) {
        case 'name':
            return /^[a-zA-Z ]{2,30}$/.test(input);
        case 'age':
            const age = parseInt(input);
            return age > 0 && age < 120;
        default:
            return true;
    }
}

// Reset password functionality
resetPasswordBtn.addEventListener('click', async () => {
    if (await confirmAction('Are you sure you want to reset your password?')) {
        const user = auth.currentUser;
        if (user) {
            try {
                setLoading(true);
                await sendPasswordResetEmail(auth, user.email);
                showToast('Password reset email sent. Please check your inbox.');
            } catch (error) {
                handleError(error);
            } finally {
                setLoading(false);
            }
        }
    }
});

// Logout functionality
logoutBtn.addEventListener('click', async () => {
    if (await confirmAction('Are you sure you want to log out?')) {
        try {
            setLoading(true);
            await signOut(auth);
            window.showAuthPopup();
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    }
});

// Email verification
function updateEmailVerificationUI(user) {
    if (user.emailVerified) {
        verifyEmailBtn.textContent = 'Email Verified';
        verifyEmailBtn.disabled = true;
        verifyEmailBtn.style.backgroundColor = 'green';
    } else {
        verifyEmailBtn.textContent = 'Verify Email';
        verifyEmailBtn.disabled = false;
        verifyEmailBtn.style.backgroundColor = '#007BFF';
        verifyEmailBtn.addEventListener('click', sendVerificationEmail);
    }
}

// Send verification email
async function sendVerificationEmail() {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
        try {
            setLoading(true);
            await sendEmailVerification(user);
            showToast('Verification email sent. Please check your inbox.');
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    }
}

// Confirm action helper
function confirmAction(message) {
    return new Promise(resolve => {
        const confirmed = confirm(message);
        resolve(confirmed);
    });
}

// Utility functions
function setLoading(isLoading) {
    if (isLoading) {
        loadingIndicator.style.display = 'block';
    } else {
        loadingIndicator.style.display = 'none';
    }
}

