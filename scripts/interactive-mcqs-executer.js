document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('.interactivemcq-button');

    if (window.location.href.includes('mcqs.h')) {
        button.style.display = 'block';
        if (interactiveEnabled) {
            enableInteractiveMCQs();
            button.textContent = 'Deactivate Interactive MCQs';
        } else {
            button.textContent = 'Activate Interactive MCQs';
        }
    } else {
        disableInteractiveMCQs();
        button.style.display = 'none';
    }

    document.querySelectorAll('#contactusurl').forEach(element => {
        element.addEventListener('click', () => {
            document.getElementById('contact-popup-overlay').style.display = 'flex';
        });
    });

    document.getElementById('closeForm').addEventListener('click', () => {
        document.getElementById('contact-popup-overlay').style.display = 'none';
    });
});
