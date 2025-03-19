import { 
  loginUser, 
  registerUser, 
  resetPassword, 
  checkAuthState 
} from 'https://samkarya.github.io/bcaexamprep/Rewamp/scripts/firebase/pages/loginPage.js';  

document.addEventListener('DOMContentLoaded', () => {   
  // DOM Elements
  const loginTab = document.getElementById('edu-login-tab');
  const registerTab = document.getElementById('edu-register-tab');
  const loginForm = document.getElementById('edu-login-form');
  const registerForm = document.getElementById('edu-register-form');
  const resetForm = document.getElementById('edu-reset-form');
  const forgotPassword = document.getElementById('edu-forgot-password');
  const backToLogin = document.getElementById('edu-back-to-login');
  const heading = document.getElementById('edu-auth-heading');
  const subtitle = document.getElementById('edu-auth-subtitle');
  

  // Tab switching
  loginTab.addEventListener('click', () => {
    showLoginForm();
  });

  registerTab.addEventListener('click', () => {
    showRegisterForm();
  });

  // Forgot password link
  forgotPassword.addEventListener('click', (e) => {
    e.preventDefault();
    showResetForm();
  });

  // Back to login button
  backToLogin.addEventListener('click', () => {
    showLoginForm();
  });

  // Password strength meter
  const passwordInput = document.getElementById('edu-register-password');
  const passwordStrengthBar = document.getElementById('edu-password-strength-bar');
  const passwordStrengthText = document.getElementById('edu-password-strength-text');
  
  passwordInput.addEventListener('input', () => {
    updatePasswordStrength(
      passwordInput.value,
      passwordStrengthBar,
      passwordStrengthText
    );
  });

  // Login form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('edu-login-email').value;
    const password = document.getElementById('edu-login-password').value;
    const errorElement = document.getElementById('edu-login-error');
    
    // Add loading state
    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Signing in...';
    
    const result = await loginUser(email, password);
    
    // Reset button state
    submitButton.disabled = false;
    submitButton.textContent = 'Sign In';
    
    if (result.success) {
      errorElement.textContent = '';
      
      // Redirect to dashboard or homepage - uncomment when ready
      window.location.href = '/p/account.html';
    } else {
      errorElement.textContent = result.error;
    }
  });

  // Registration form submission
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('edu-register-username').value;
    const email = document.getElementById('edu-register-email').value;
    const password = document.getElementById('edu-register-password').value;
    const confirmPassword = document.getElementById('edu-register-confirm').value;
    const errorElement = document.getElementById('edu-register-error');
    
    // Add loading state
    const submitButton = registerForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Creating account...';
    
    // Validate passwords match
    if (password !== confirmPassword) {
      errorElement.textContent = 'Passwords do not match';
      submitButton.disabled = false;
      submitButton.textContent = 'Create Account';
      return;
    }
    
    const result = await registerUser(username, email, password);
    
    // Reset button state
    submitButton.disabled = false;
    submitButton.textContent = 'Create Account';
    
    if (result.success) {
      errorElement.textContent = '';
      
      // Redirect to dashboard or homepage - uncomment when ready
      window.location.href = '/p/account.html';
    } else {
      errorElement.textContent = result.error;
    }
  });

  // Reset password form submission
  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('edu-reset-email').value;
    const messageElement = document.getElementById('edu-reset-message');
    
    // Add loading state
    const submitButton = resetForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    
    const result = await resetPassword(email);
    
    // Reset button state
    submitButton.disabled = false;
    submitButton.textContent = 'Reset Password';
    
    if (result.success) {
      messageElement.textContent = 'Password reset email sent! Check your inbox.';
      messageElement.classList.add('edu-success');
    } else {
      messageElement.textContent = result.error;
      messageElement.classList.remove('edu-success');
    }
  });


  function checkIfLoggedIn() {
    checkAuthState((user) => {
      if (user) {
        // Uncomment the line below only when you're ready for auto-redirect
        window.location.href = '/p/account.html';
      } else {
        ;
      }
    });
  }
  
  // Helper functions
  function showLoginForm() {
    loginTab.classList.add('edu-active');
    registerTab.classList.remove('edu-active');
    loginForm.classList.remove('edu-hidden');
    registerForm.classList.add('edu-hidden');
    resetForm.classList.add('edu-hidden');
    heading.textContent = 'Welcome Back';
    subtitle.textContent = 'Login to continue your learning journey';
    checkIfLoggedIn();
  }

  function showRegisterForm() {
    registerTab.classList.add('edu-active');
    loginTab.classList.remove('edu-active');
    registerForm.classList.remove('edu-hidden');
    loginForm.classList.add('edu-hidden');
    resetForm.classList.add('edu-hidden');
    heading.textContent = 'Create Account';
    subtitle.textContent = 'Join our learning community today';
  }

  function showResetForm() {
    loginForm.classList.add('edu-hidden');
    resetForm.classList.remove('edu-hidden');
    heading.textContent = 'Reset Password';
    subtitle.textContent = 'We\'ll send you a link to reset your password';
  }

  function updatePasswordStrength(password, strengthBar, strengthText) {
    let strength = 0;
    let message = '';

    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
    if (password.match(/\d/)) strength += 1;
    if (password.match(/[^a-zA-Z\d]/)) strength += 1;
    
    switch (strength) {
      case 0:
        strengthBar.style.width = '0%';
        strengthBar.style.backgroundColor = '#f00';
        message = 'Very Weak';
        break;
      case 1:
        strengthBar.style.width = '25%';
        strengthBar.style.backgroundColor = '#f90';
        message = 'Weak';
        break;
      case 2:
        strengthBar.style.width = '50%';
        strengthBar.style.backgroundColor = '#fc0';
        message = 'Medium';
        break;
      case 3:
        strengthBar.style.width = '75%';
        strengthBar.style.backgroundColor = '#9c0';
        message = 'Strong';
        break;
      case 4:
        strengthBar.style.width = '100%';
        strengthBar.style.backgroundColor = '#0c0';
        message = 'Very Strong';
        break;
    }
    
    strengthText.textContent = message;
  }
});