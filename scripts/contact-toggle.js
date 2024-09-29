
import { showToast } from 'https://samkarya.github.io/bcaexamprep/firebase/common-utils.js';

document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('contact-popup-overlay');
    const closeButton = document.getElementById('closeForm');
    const submitButton = document.querySelector('.contact-form-button-submit');
    const form = document.querySelector('form[name="contact-form"]');

    // Open popup
    document.querySelectorAll('#contactusurl').forEach(element => {
        element.addEventListener('click', () => {
            overlay.style.display = 'flex';
            setTimeout(() => {
                overlay.classList.add('active');
            }, 10);
        });
    });

    // Close popup
    function closePopup() {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }

    closeButton.addEventListener('click', closePopup);

    // Close on outside click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closePopup();
        }
    });

    // Form submission
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Simulate form submission
            setTimeout(() => {
                showToast('Message sent successfully!', 'success');
                form.reset();
                closePopup();
            }, 1000);
        }
    });

    // Form validation
    function validateForm() {
        const name = document.getElementById('contact-form-name').value.trim();
        const email = document.getElementById('contact-form-email').value.trim();
        const message = document.getElementById('contact-form-email-message').value.trim();

        if (!name || !email || !message) {
            showToast('Please fill in all fields.', 'error');
            return false;
        }

        if (!isValidEmail(email)) {
            showToast('Please enter a valid email address.', 'error');
            return false;
        }

        return true;
    }

    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
});

