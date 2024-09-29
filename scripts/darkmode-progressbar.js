document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.getElementById('menu');
  const menuClose = document.getElementById('menu-close');
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const interactiveMCQButton = document.getElementById('toggle-interactive-mcq');

  // Function to open sidebar
  function openSidebar() {
      sidebar.classList.add('active');
  }

  // Function to close sidebar
  function closeSidebar() {
      sidebar.classList.remove('active');
  }

  // Event listener for sidebar close
  menuClose.addEventListener('click', closeSidebar);

  // Close sidebar when clicking outside
  document.addEventListener('click', function(event) {
      if (!sidebar.contains(event.target) && !event.target.matches('#menu-open')) {
          closeSidebar();
      }
  });
  // Dark mode toggle
  if (localStorage.getItem('darkMode') === 'enabled') {
      document.body.classList.add('dark-mode');
      darkModeToggle.checked = true;
  }

  darkModeToggle.addEventListener('change', function() {
      document.body.classList.toggle('dark-mode', this.checked);
      localStorage.setItem('darkMode', this.checked ? 'enabled' : 'disabled');
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
