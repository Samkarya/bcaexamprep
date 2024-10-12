import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, sendEmailVerification, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
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

// DOM elements
const noAccountMessage = document.getElementById('no-account-message');
const authContainer = document.getElementById('auth-container');
const loadingIndicator = document.getElementById('loading-indicator');
const usernameElement = document.getElementById('username');
const profileDetails = document.getElementById('profile-details');
const profileForm = document.getElementById('profile-form');
const profileView = document.getElementById('profile-view');
const profileEdit = document.getElementById('profile-edit');
const editProfileBtn = document.getElementById('edit-profile-btn');
const cancelEditBtn = document.getElementById('cancel-edit');
const resetPasswordBtn = document.getElementById('reset-password-btn');
const verifyEmailBtn = document.getElementById('verify-email');
const logoutBtn = document.getElementById('logout-btn');
const createAccountButton = document.getElementById('create-account-button');

let currentUser = null;

// Authentication listener
onAuthStateChanged(auth, (user) => {
    setLoading(true);
  console.log('Auth State Changed: User:', user);
    if (user) {
        currentUser = user;
        noAccountMessage.style.display = 'none';
        authContainer.style.display = 'block';
        usernameElement.textContent =  user.email || "Warrior";
        loadUserData(user.uid);
        updateEmailVerificationUI(user);
    } else {
      console.log('User is not authenticated.');
        noAccountMessage.style.display = 'block';
        authContainer.style.display = 'none';
    }
    setLoading(false);
});

// Load user data
async function loadUserData(userId) {
    try {
        setLoading(true);
      console.log('Loading User Data for UID:', userId);
        const userDoc = await getDoc(doc(db, 'users', userId));
      console.log('Firestore Document:', userDoc);
        if (userDoc.exists()) {
            const userData = userDoc.data();
          console.log('Firestore Document:', userDoc);
            displayUserProfile(userData);
            populateEditForm(userData);
        } else {
            showToast('User profile not found. Please update your profile.', 'error');
        }
    } catch (error) {
        handleError(error);
    } finally {
        setLoading(false);
    }
}

// Display user profile
function displayUserProfile(userData) {
  console.log('Displaying User Profile:', userData);
    profileDetails.innerHTML = `
        <p><strong>Name:</strong> ${userData.name || 'Not set'}</p>
        <p><strong>Age:</strong> ${userData.age || 'Not set'}</p>
        <p><strong>Gender:</strong> ${userData.gender || 'Not set'}</p>
        <p><strong>Education:</strong></p>
        <ul>
            ${userData.education ? userData.education.map(edu => `
                <li>
                    ${edu.collegeName} - ${edu.course} (Year: ${edu.year}, Semester: ${edu.semester})
                    ${edu.otherInfo ? `<br>Additional Info: ${edu.otherInfo}` : ''}
                </li>
            `).join('') : '<li>No education information provided</li>'}
        </ul>
        <p><strong>Future Goals:</strong> ${userData.goals || 'Not set'}</p>
    `;
}

// Populate edit form
function populateEditForm(userData) {
    document.getElementById('name').value = userData.name || '';
    document.getElementById('age').value = userData.age || '';
    document.getElementById('gender').value = userData.gender || '';
    document.getElementById('goals').value = userData.goals || '';
    
    const educationFields = document.getElementById('education-fields');
    educationFields.innerHTML = '';
    if (userData.education && userData.education.length > 0) {
        userData.education.forEach(edu => addEducationField(edu));
    } else {
        addEducationField();
    }
}

// Add education field
function addEducationField(data = {}) {
    const educationFields = document.getElementById('education-fields');
    const educationEntry = document.createElement('div');
    educationEntry.className = 'education-entry';
    educationEntry.innerHTML = `
        <input type="text" placeholder="College/University Name" class="college-name" required value="${data.collegeName || ''}">
        <input type="text" placeholder="Course" class="course" required value="${data.course || ''}">
        <input type="number" placeholder="Year" class="year" min="1900" max="2099" required value="${data.year || ''}">
        <input type="number" placeholder="Semester" class="semester" min="1" max="12" required value="${data.semester || ''}">
        <textarea placeholder="Other related info" class="other-info">${data.otherInfo || ''}</textarea>
        <button type="button" class="btn btn-secondary remove-education">Remove</button>
    `;
    educationFields.appendChild(educationEntry);

    educationEntry.querySelector('.remove-education').addEventListener('click', () => {
        educationFields.removeChild(educationEntry);
    });
}

// Event Listeners
editProfileBtn.addEventListener('click', () => {
    profileView.style.display = 'none';
    profileEdit.style.display = 'block';
});

cancelEditBtn.addEventListener('click', () => {
    profileView.style.display = 'block';
    profileEdit.style.display = 'none';
});

document.getElementById('add-education').addEventListener('click', () => addEducationField());

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (currentUser) {
        try {
            setLoading(true);
            const formData = {
                name: document.getElementById('name').value,
                age: parseInt(document.getElementById('age').value),
                gender: document.getElementById('gender').value,
                goals: document.getElementById('goals').value,
                education: Array.from(document.querySelectorAll('.education-entry')).map(entry => ({
                    collegeName: entry.querySelector('.college-name').value,
                    course: entry.querySelector('.course').value,
                    year: parseInt(entry.querySelector('.year').value),
                    semester: parseInt(entry.querySelector('.semester').value),
                    otherInfo: entry.querySelector('.other-info').value
                }))
            };
            await setDoc(doc(db, 'users', currentUser.uid), formData);
            showToast('Profile updated successfully!', 'success');
            loadUserData(currentUser.uid);
            profileView.style.display = 'block';
            profileEdit.style.display = 'none';
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    }
});

resetPasswordBtn.addEventListener('click', async () => {
    if (currentUser) {
        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, currentUser.email);
            showToast('Password reset email sent. Please check your inbox.', 'success');
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    }
});

verifyEmailBtn.addEventListener('click', async () => {
    if (currentUser && !currentUser.emailVerified) {
        try {
            setLoading(true);
            await sendEmailVerification(currentUser);
            showToast('Verification email sent. Please check your inbox.', 'success');
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    }
});

logoutBtn.addEventListener('click', async () => {
    try {
        setLoading(true);
        await signOut(auth);
        showToast('Logged out successfully.', 'success');
    } catch (error) {
        handleError(error);
    } finally {
        setLoading(false);
    }
});

createAccountButton.addEventListener('click', () => {
    window.showAuthPopup();
});

function updateEmailVerificationUI(user) {
    if (user.emailVerified) {
        verifyEmailBtn.textContent = 'Email Verified';
        verifyEmailBtn.disabled = true;
        verifyEmailBtn.classList.remove('btn-secondary');
        verifyEmailBtn.classList.add('btn-success');
    } else {
        verifyEmailBtn.textContent = 'Verify Email';
        verifyEmailBtn.disabled = false;
        verifyEmailBtn.classList.remove('btn-success');
        verifyEmailBtn.classList.add('btn-secondary');
    }
}

function setLoading(isLoading) {
    loadingIndicator.style.display = isLoading ? 'block' : 'none';
    Array.from(document.querySelectorAll('button')).forEach(btn => btn.disabled = isLoading);
}

// Initial setup
setLoading(true);
