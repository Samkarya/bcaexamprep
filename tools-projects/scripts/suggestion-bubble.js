  // JavaScript to handle the bubble click event
document.querySelectorAll('.bubble').forEach(bubble => {
    bubble.addEventListener('click', function() {
        document.getElementById('equation').value = this.getAttribute('data-equation');
        document.getElementById('derivative').value = this.getAttribute('data-derivative');
        document.getElementById('initialGuess').value = this.getAttribute('data-initialGuess');
        document.getElementById('maxIterations').value = this.getAttribute('data-maxIterations');
const calculateButton = document.querySelector('.project-tool-container button[type="submit"]');

// Add the 'animate' class to the calculateButton
calculateButton.classList.add('animate');

// Remove the 'animate' class after 2 second (2000 milliseconds)
setTimeout(() => {
    calculateButton.classList.remove('animate');
}, 2000);

    });
});
