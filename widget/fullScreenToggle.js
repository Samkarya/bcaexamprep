function toggleFullScreen() {
    const elem = document.getElementById('fullscreen-div');
    const btn = document.getElementById('fullscreen-btn');

    // Check if the element is already in full screen
    if (!document.fullscreenElement) {
        // Enter full-screen mode
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { // Firefox
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { // Safari
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE/Edge
            elem.msRequestFullscreen();
        }
        // Change the button text to 'Exit Full Screen'
        btn.textContent = 'Exit Full Screen';
    } else {
        // Exit full-screen mode
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        // Change the button text to 'Go Full Screen'
        btn.textContent = 'Go Full Screen';
    }
}

// Event listener to detect when full-screen mode changes
document.addEventListener('fullscreenchange', () => {
    const btn = document.getElementById('fullscreen-btn');
    // If there's no fullscreen element, change text to 'Go Full Screen'
    if (!document.fullscreenElement) {
        btn.textContent = 'Go Full Screen';
    } else {
        btn.textContent = 'Exit Full Screen';
    }
});
