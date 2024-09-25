// Immediately Invoked Function Expression to hide hero section before page load if necessary
(function() {
    if (sessionStorage.getItem('homepageEntered') === 'true') {
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelector('.hero-section').style.display = 'none';
            document.getElementById('loading-indicator').style.display = 'block';
        });
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    const linkUrl = "https://bcaexamprep.blogspot.com/";
    const homeLinks = document.querySelectorAll('#homeurl');
    homeLinks.forEach(link => link.setAttribute("href", linkUrl));

    const linkUrl1 = linkUrl + "p/about-us.html";
    const aboutUrls = document.querySelectorAll('#aboutusurl');
    aboutUrls.forEach(link => link.setAttribute("href", linkUrl1));

    const linkUrl2 = linkUrl + "p/mcqs-links.html";
    const mcqUrls = document.querySelectorAll('#mcqurl');
    mcqUrls.forEach(link => link.setAttribute("href", linkUrl2));

    const linkUrl4 = linkUrl + "2024/07/ultimate-guide-to-bca-previous-year.html";
    const pyqUrls = document.querySelectorAll('#pyqurl');
    pyqUrls.forEach(link => link.setAttribute("href", linkUrl4));

    const linkUrl6 = linkUrl + "p/privacy-policy.html";
    const privacyUrls = document.querySelectorAll('#privacypolicyurl');
    privacyUrls.forEach(link => link.setAttribute("href", linkUrl6));

    const textElement = document.getElementById('animated-text');
    const texts = [
        { visibleText: 'MCQs', link: '<a href="https://bcaexamprep.blogspot.com/p/mcqs-links.html">MCQs</a>' },
        { visibleText: 'PYQs', link: '<a href="https://bcaexamprep.blogspot.com/2024/07/ultimate-guide-to-bca-previous-year.html">PYQs</a>' },
        { visibleText: 'Career Guide', link: '<a href="https://bcaexamprep.blogspot.com/search/label/Career%20Options">Career Guide</a>' }
    ];
    let index = 0;
    let charIndex = 0;
    let currentText = '';
    let isDeleting = false;
    let typingSpeed = 50;
    let deletingSpeed = 50;
    let pauseDuration = 1000;

    function type() {
        const { visibleText, link } = texts[index];
        
        if (isDeleting) {
            charIndex--;
            currentText = visibleText.substring(0, charIndex);
        } else {
            charIndex++;
            currentText = visibleText.substring(0, charIndex);
        }

        textElement.innerHTML = `<span class="typing">${currentText}</span>`;

        if (!isDeleting && charIndex === visibleText.length) {
            setTimeout(() => {
                textElement.innerHTML = link;
                isDeleting = true;
                setTimeout(() => {
                    requestAnimationFrame(type);
                }, pauseDuration);
            }, pauseDuration);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            index = (index + 1) % texts.length;
            requestAnimationFrame(type);
        } else {
            setTimeout(() => requestAnimationFrame(type), isDeleting ? deletingSpeed : typingSpeed);
        }
    }

    type();
    
    // Event listener for the "Enter Homepage" button
    document.getElementById('enterhomepage').addEventListener('click', function() {
        enterHomepage();
    });

    // Function to handle entering the homepage
    function enterHomepage() {
        // Show loading indicator
        document.getElementById('loading-indicator').style.display = 'block';

        // Hide the hero section
        document.querySelector('.hero-section').style.display = 'none';

        // Show the main content after a brief delay (simulate loading)
        setTimeout(function() {
            document.querySelector('#popular-post-section').style.display = 'block';
            document.querySelector('#footer-element').style.display = 'block';
            document.querySelector('#Blog-Post').style.display = 'block';
            document.querySelector('#blog-title').style.display = 'block';

            // Hide loading indicator
            document.getElementById('loading-indicator').style.display = 'none';

            // Store flag in sessionStorage to keep track of homepage entry
            sessionStorage.setItem('homepageEntered', 'true');
        }, 500); // Reduced delay for better responsiveness
    }

    // Check if homepage has been entered and call enterHomepage if true
    if (sessionStorage.getItem('homepageEntered') === 'true') {
        enterHomepage();
    }
});
