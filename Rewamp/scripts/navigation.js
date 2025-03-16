document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const menuToggle = document.getElementById('menu-toggle');
    const mainMenu = document.getElementById('main-menu');
    const searchToggle = document.getElementById('search-toggle');
    const searchArea = document.getElementById('search-area');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const footerDarkModeToggle = document.getElementById('footer-dark-mode-toggle');
    const backToTopBtn = document.querySelector('.back-to-top a');
    const body = document.body;

    // Mobile Menu Toggle
    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', function() {
            mainMenu.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', 
                menuToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
            );
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mainMenu.contains(event.target) && !menuToggle.contains(event.target) && mainMenu.classList.contains('active')) {
                mainMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Search Toggle
    if (searchToggle && searchArea) {
        searchToggle.addEventListener('click', function() {
            searchArea.classList.toggle('active');
            searchToggle.setAttribute('aria-expanded', 
                searchToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
            );
            
            // Focus on search input when opened
            if (searchArea.classList.contains('active')) {
                document.getElementById('search-query').focus();
            }
        });

        // Close search when clicking outside
        document.addEventListener('click', function(event) {
            if (!searchArea.contains(event.target) && !searchToggle.contains(event.target) && searchArea.classList.contains('active')) {
                searchArea.classList.remove('active');
                searchToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Dark Mode Functionality
    function setDarkMode(isDark) {
        if (isDark) {
            body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
            if (darkModeToggle) darkModeToggle.checked = true;
            if (footerDarkModeToggle) footerDarkModeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
            if (darkModeToggle) darkModeToggle.checked = false;
            if (footerDarkModeToggle) footerDarkModeToggle.checked = false;
        }
    }

    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'enabled') {
        setDarkMode(true);
    } else if (savedDarkMode === null) {
        // Check system preference if no saved preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDarkMode);
    }

    // Dark mode toggle event listeners
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            setDarkMode(this.checked);
        });
    }

    if (footerDarkModeToggle) {
        footerDarkModeToggle.addEventListener('change', function() {
            setDarkMode(this.checked);
        });
    }

    // Back to top button
    if (backToTopBtn) {
        // Show/hide back to top button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.parentElement.classList.add('visible');
            } else {
                backToTopBtn.parentElement.classList.remove('visible');
            }
        });

        // Smooth scroll to top
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Search Form Functionality
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const query = document.getElementById('search-query').value.trim();
            const subject = document.getElementById('subject-filter').value;
            const contentType = document.getElementById('content-filter').value;
            
            if (query === '' && subject === '' && contentType === '') {
                // Show error or notification
                alert('Please enter a search term or select a filter');
                return;
            }
            
            // Build search URL
            let searchUrl = '/search?q=' + encodeURIComponent(query);
            if (subject) searchUrl += '&subject=' + encodeURIComponent(subject);
            if (contentType) searchUrl += '&type=' + encodeURIComponent(contentType);
            
            // Redirect to search results
            window.location.href = searchUrl;
        });
    }

    // Newsletter Form Validation
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Here you would typically send the form data to your server
            // For demonstration, show success message
            alert('Thank you for subscribing to our newsletter!');
            emailInput.value = '';
        });
    }

    // Active navigation link highlighting
    function highlightCurrentPage() {
        const currentPath = window.location.pathname;
        
        // Header nav links
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
        
        // Footer quick links
        const footerLinks = document.querySelectorAll('.quick-links a');
        footerLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }
    
    highlightCurrentPage();
});