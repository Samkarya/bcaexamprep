// common-utils.js

// Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyAF4vkip75_XV74EP6vf_TrsnbRbQur1iQ",
    authDomain: "bcaexamprep-auth-project.firebaseapp.com",
    projectId: "bcaexamprep-auth-project",
    storageBucket: "bcaexamprep-auth-project.appspot.com",
    messagingSenderId: "666537879299",
    appId: "1:666537879299:web:70401ac08f2a8dde42ab36",
    measurementId: "G-WWWFS9DPH9"
};
// Toast notification
export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 10px 20px;
        border-radius: 5px;
        color: white;
        font-size: 16px;
        z-index: 10000;
    `;

    switch (type) {
        case 'success':
            toast.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            toast.style.backgroundColor = '#f44336';
            break;
        case 'warning':
            toast.style.backgroundColor = '#ff9800';
            break;
        default:
            toast.style.backgroundColor = '#2196F3';
    }

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Error handling
export function handleError(error) {
    console.error('Error:', error);
    let message = 'An unexpected error occurred. Please try again.';
    if (error.code === 'auth/requires-recent-login') {
        message = 'For security reasons, please log out and log in again to perform this action.';
    } else if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already in use. Please use a different email address.';
    }
    showToast(message, 'error');
}

// Loading indicator
export function setLoading(isLoading) {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = isLoading ? 'block' : 'none';
    }
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.disabled = isLoading;
    });
}

// Confirmation dialog
export function confirmAction(message) {
    return new Promise((resolve) => {
        const result = window.confirm(message);
        resolve(result);
    });
}

// Input validation
export function validateInput(input, type) {
    switch(type) {
        case 'name':
            return /^[a-zA-Z ]{2,30}$/.test(input);
        case 'age':
            const age = parseInt(input);
            return age > 0 && age < 120;
        case 'email':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
        default:
            return true;
    }
}

// Debounce function
export function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// Load script dynamically
export function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}
