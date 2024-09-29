document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        document.getElementById('dark-mode-toggle').checked = true;
    }

    document.getElementById('dark-mode-toggle').addEventListener('change', function() {
        document.body.classList.toggle('dark-mode', this.checked);
        localStorage.setItem('darkMode', this.checked ? 'enabled' : 'disabled');
        location.reload();
    });

    const progressBar = document.querySelector('#progress-bar');
    const section = document.querySelector('#Blog-Post');
    let hasScrolledToEnd = false;

    function updateProgressBar() {
        let scrollDistance = -(section.getBoundingClientRect().top);
        let progressPercentage = (scrollDistance / (section.getBoundingClientRect().height - document.documentElement.clientHeight)) * 100;
        progressBar.style.width = Math.max(0, Math.min(100, Math.floor(progressPercentage))) + '%';

        if (progressPercentage >= 100 && !hasScrolledToEnd) {
            hasScrolledToEnd = true;
            sendScrollEventToAnalytics();
        }
    }

    function sendScrollEventToAnalytics() {
        gtag('event', 'page_scroll', {
            'event_category': 'engagement',
            'event_label': 'User scrolled 100% of the page',
            'value': 100
        });
    }

    updateProgressBar();
    document.addEventListener('scroll', updateProgressBar);
});
