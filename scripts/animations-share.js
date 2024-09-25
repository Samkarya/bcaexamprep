document.addEventListener('DOMContentLoaded', function() {
    function fadeInOnScroll() {
        const boxes = document.querySelectorAll('.fade-in');
        boxes.forEach(box => {
            const boxTop = box.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (boxTop < windowHeight * 0.90) {
                box.classList.add('show');
            } else {
                box.classList.remove('show');
            }
        });
    }

    document.addEventListener('scroll', fadeInOnScroll);
    fadeInOnScroll();

    document.getElementById('shareButton').addEventListener('click', async () => {
        if (isMobileDevice()) {
            if (navigator.share) {
                try {
                    await navigator.share({
                        text: 'Check out this post!',
                        url: window.location.href
                    });
                } catch (error) {
                    fallbackShare();
                }
            } else {
                fallbackShare();
            }
        } else {
            fallbackShare();
        }
    });

    function isMobileDevice() {
        return /Mobi|Android/i.test(navigator.userAgent);
    }

    function fallbackShare() {
        const dummy = document.createElement('input');
        const text = window.location.href;
        document.body.appendChild(dummy);
        dummy.value = text;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        alert('URL copied to clipboard!');
    }
});
