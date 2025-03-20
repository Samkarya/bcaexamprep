// account-ui-controller.js
import { auth } from 'https://samkarya.github.io/bcaexamprep/Rewamp/scripts/firebase/firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import {
  getUserData,
  updateUserProfile,
  sendVerificationEmail,
  changeUserPassword,
  updateUserPreferences,
  deleteUserAccount,
  calculatePasswordStrength
} from 'https://samkarya.github.io/bcaexamprep/Rewamp/scripts/firebase/pages/accountPage.js';

document.addEventListener('DOMContentLoaded', () => {
  setupTabNavigation();
  
  // Check authentication state
  onAuthStateChanged(auth, user => {
    if (user) {
      // User is signed in
      initializeAccountDashboard(user);
    } else {
      // User is not signed in, redirect to login
      window.location.href = 'login.html';
    }
  });
});

// Initialize account dashboard
function initializeAccountDashboard(user) {
  loadUserData(user);
  setupProfileManagement(user);
  setupSecuritySettings(user);
  setupPreferences(user);
}

// Setup tab navigation
function setupTabNavigation() {
  const tabs = document.querySelectorAll('.edu-nav-tab');
  const tabContents = document.querySelectorAll('.edu-tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Show corresponding content
      const targetId = `${tab.dataset.tab}-content`;
      document.getElementById(targetId).classList.add('active');
    });
  });
}

// Load user data and populate UI
async function loadUserData(user) {
  // Display basic user info immediately from auth object
  displayBasicUserInfo(user);
  
  // Load additional user data from Firestore
  try {
    const { success, data } = await getUserData(user.uid);
    
    if (success) {
      // Populate profile form with data
      document.getElementById('displayName').value = data.displayName || '';
      document.getElementById('bio').value = data.bio || '';
      
      // Set preferences toggles
      if (data.preferences) {
        setPreferenceToggles(data.preferences);
        
        // Apply dark mode if enabled
        if (data.preferences.darkMode) {
          document.querySelector('.edu-account-dashboard').classList.add('dark-mode');
        }
      }
    }
  } catch (error) {
    showNotification("Error loading user data", "error");
  }
}

// Display basic user information from Auth object
function displayBasicUserInfo(user) {
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('user-verification-status').textContent = 
    `Email verification status: ${user.emailVerified ? 'Verified' : 'Not Verified'}`;
  
  // Show verification button if email not verified
  if (!user.emailVerified) {
    document.getElementById('verify-email-btn').style.display = 'block';
  }
  
  // Set user initials in avatar
  const initials = user.email.substring(0, 2).toUpperCase();
  document.getElementById('user-initials').textContent = initials;
  
  // Set display name (fallback to email if no display name)
  document.getElementById('user-display-name').textContent = 
    user.displayName || user.email.split('@')[0];
  
  // Format and display account dates
  const creationDate = new Date(user.metadata.creationTime);
  document.getElementById('account-created-date').textContent = 
    creationDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const lastLoginDate = new Date(user.metadata.lastSignInTime);
  document.getElementById('last-login-date').textContent = 
    lastLoginDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Set preference toggle states based on user data
function setPreferenceToggles(preferences) {
  document.getElementById('dark-mode-toggle').checked = preferences.darkMode || false;
  document.getElementById('email-notifications-toggle').checked = preferences.emailNotifications !== false;
  document.getElementById('updates-notifications-toggle').checked = preferences.updatesNotifications !== false;
  document.getElementById('study-reminders-toggle').checked = preferences.studyReminders || false;
  document.getElementById('share-progress-toggle').checked = preferences.shareProgress || false;
  document.getElementById('public-profile-toggle').checked = preferences.publicProfile || false;
}

// Setup profile management functionality
function setupProfileManagement(user) {
  // Logout functionality
  document.querySelector('.edu-logout-btn').addEventListener('click', () => {
    auth.signOut()
      .then(() => {
        window.location.href = 'login.html';
      })
      .catch(error => {
        showNotification("Error signing out. Please try again.", "error");
      });
  });
  
  // Email verification
  const verifyEmailBtn = document.getElementById('verify-email-btn');
  verifyEmailBtn.addEventListener('click', async () => {
    try {
      const { success } = await sendVerificationEmail();
      
      if (success) {
        verifyEmailBtn.style.display = 'none';
        document.getElementById('verification-sent-msg').style.display = 'inline';
        setTimeout(() => {
          document.getElementById('verification-sent-msg').style.display = 'none';
        }, 5000);
      }
    } catch (error) {
      showNotification("Error sending verification email", "error");
    }
  });
  
  // Toggle edit profile form
  const editProfileBtn = document.querySelector('.edu-edit-profile-btn');
  const editProfileForm = document.querySelector('.edu-edit-profile-form');
  const cancelBtn = document.querySelector('.edu-cancel-btn');
  
  editProfileBtn.addEventListener('click', () => {
    editProfileForm.style.display = 'block';
  });
  
  cancelBtn.addEventListener('click', () => {
    editProfileForm.style.display = 'none';
  });
  
  // Update profile information
  const profileForm = document.getElementById('profile-form');
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const displayName = document.getElementById('displayName').value;
    const bio = document.getElementById('bio').value;
    
    try {
      const { success } = await updateUserProfile(user.uid, { displayName, bio });
      
      if (success) {
        document.getElementById('user-display-name').textContent = displayName;
        showNotification("Profile updated successfully!", "success");
        editProfileForm.style.display = 'none';
      }
    } catch (error) {
      showNotification("Error updating profile", "error");
    }
  });
}

// Setup security settings functionality
function setupSecuritySettings(user) {
  // Password change functionality
  const changePasswordBtn = document.getElementById('change-password-btn');
  const changePasswordForm = document.getElementById('change-password-form');
  const cancelPasswordBtn = document.querySelector('.edu-cancel-password-btn');
  const updatePasswordBtn = document.getElementById('update-password-btn');
  
  changePasswordBtn.addEventListener('click', () => {
    changePasswordForm.style.display = 'block';
  });
  
  cancelPasswordBtn.addEventListener('click', () => {
    changePasswordForm.style.display = 'none';
    resetPasswordFields();
  });
  
  // Password strength indicator
  const newPasswordInput = document.getElementById('new-password');
  const strengthMeter = document.querySelector('.edu-strength-meter');
  const strengthText = document.querySelector('.edu-strength-text');
  
  newPasswordInput.addEventListener('input', () => {
    const password = newPasswordInput.value;
    const strength = calculatePasswordStrength(password);
    
    // Update strength meter
    strengthMeter.style.width = `${strength}%`;
    
    // Update strength text and color
    updateStrengthIndicator(strength, strengthMeter, strengthText);
  });
  
  // Update password
  updatePasswordBtn.addEventListener('click', async () => {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword !== confirmPassword) {
      showNotification("New passwords don't match!", "error");
      return;
    }
    
    if (calculatePasswordStrength(newPassword) < 50) {
      if (!confirm("Your password is not very strong. Are you sure you want to continue?")) {
        return;
      }
    }
    
    try {
      const { success, error } = await changeUserPassword(currentPassword, newPassword);
      
      if (success) {
        showNotification("Password updated successfully!", "success");
        changePasswordForm.style.display = 'none';
        resetPasswordFields();
      } else {
        showNotification(error || "Error updating password", "error");
      }
    } catch (error) {
      showNotification("Error updating password", "error");
    }
  });
  
  // Delete account functionality
  const deleteAccountBtn = document.getElementById('delete-account-btn');
  const deleteConfirmModal = document.getElementById('delete-confirm-modal');
  const cancelDeleteBtn = document.querySelector('.edu-cancel-delete-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  
  deleteAccountBtn.addEventListener('click', () => {
    deleteConfirmModal.style.display = 'flex';
  });
  
  cancelDeleteBtn.addEventListener('click', () => {
    deleteConfirmModal.style.display = 'none';
    document.getElementById('delete-password').value = '';
  });
  
  confirmDeleteBtn.addEventListener('click', async () => {
    const password = document.getElementById('delete-password').value;
    
    if (!password) {
      showNotification("Please enter your password to confirm deletion", "error");
      return;
    }
    
    try {
      const { success, error } = await deleteUserAccount(password);
      
      if (success) {
        showNotification("Your account has been deleted", "success");
        window.location.href = '/';
      } else {
        showNotification(error || "Error deleting account", "error");
      }
    } catch (error) {
      showNotification("Error deleting account", "error");
    }
  });
}

// Setup preferences functionality
function setupPreferences(user) {
  // Save user settings
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  saveSettingsBtn.addEventListener('click', async () => {
    // Gather preferences
    const preferences = {
      darkMode: document.getElementById('dark-mode-toggle').checked,
      emailNotifications: document.getElementById('email-notifications-toggle').checked,
      updatesNotifications: document.getElementById('updates-notifications-toggle').checked,
      studyReminders: document.getElementById('study-reminders-toggle').checked,
      shareProgress: document.getElementById('share-progress-toggle').checked,
      publicProfile: document.getElementById('public-profile-toggle').checked
    };
    // Apply dark mode toggle immediately
    if (preferences.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
        
    try {
      const { success } = await updateUserPreferences(user.uid, preferences);
      
      if (success) {
        showNotification("Settings saved successfully!", "success");
      }
    } catch (error) {
      showNotification("Error saving settings", "error");
    }
  });
}

// Helper function to update password strength indicator
function updateStrengthIndicator(strength, meter, text) {
  if (strength < 25) {
    text.textContent = 'Weak';
    meter.style.backgroundColor = '#ff4d4d';
  } else if (strength < 50) {
    text.textContent = 'Fair';
    meter.style.backgroundColor = '#ffa64d';
  } else if (strength < 75) {
    text.textContent = 'Good';
    meter.style.backgroundColor = '#ffff4d';
  } else {
    text.textContent = 'Strong';
    meter.style.backgroundColor = '#4dff4d';
  }
}

// Helper function to reset password fields
function resetPasswordFields() {
  document.getElementById('current-password').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-password').value = '';
  document.querySelector('.edu-strength-meter').style.width = '0%';
  document.querySelector('.edu-strength-text').textContent = 'Password strength';
}

// Helper function to show notifications
function showNotification(message, type = 'info') {
  // Create notification element if it doesn't exist
  let notification = document.querySelector('.edu-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'edu-notification';
    document.body.appendChild(notification);
  }
  
  // Set message and style based on type
  notification.textContent = message;
  notification.className = `edu-notification ${type}`;
  
  // Show notification
  notification.style.display = 'block';
  
  // Hide after delay
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}