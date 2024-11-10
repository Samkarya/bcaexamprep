// assets/js/main.js

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize content cards
    ContentCard.init();

    // Initialize search
    new Search();

    // Load initial content
    loadInitialContent();

    // Initialize filters
    initializeFilters();
});

function loadInitialContent() {
    // Load trending content
    const trendingContent = document.getElementById('trendingContent');
    trendingContent.innerHTML = mockData.getTrendingContent()
        .map(content => new ContentCard(content).render())
        .join('');

    // Load recent content
    const recentContent = document.getElementById('recentContent');
    recentContent.innerHTML = mockData.getRecentContent()
        .map(content => new ContentCard(content).render())
        .join('');
}

function initializeFilters() {
    // Get all filter checkboxes
    const typeFilters = document.querySelectorAll('.filter-group input[type="checkbox"]');
    const ratingSlider = document.querySelector('.rating-slider');
    
    // Add event listeners to filters
    typeFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });

    ratingSlider.addEventListener('input', (e) => {
        // Update rating display
        const ratingValue = document.querySelector('.rating-value');
        ratingValue.textContent = `${e.target.value}+ Stars`;
        
        // Apply filters
        applyFilters();
    });
}

function applyFilters() {
    // Get selected content types
    const selectedTypes = Array.from(
        document.querySelectorAll('.filter-group input[type="checkbox"]:checked')
    ).map(checkbox => checkbox.value);

    // Get minimum rating
    const minRating = parseFloat(
        document.querySelector('.rating-slider').value
    );

    // Filter content
    let filteredContent = mockData.contents;

    if (selectedTypes.length > 0) {
        filteredContent = mockData.filterByType(selectedTypes);
    }

    filteredContent = mockData.filterByRating(minRating);

    // Update content grid
    const contentGrid = document.querySelector('.content-grid');
    contentGrid.innerHTML = filteredContent
        .map(content => new ContentCard(content).render())
        .join('');
}

// Add authentication modal handlers
document.getElementById('loginBtn').addEventListener('click', () => {
    alert('Login functionality will be implemented with Firebase Auth');
});

document.getElementById('signupBtn').addEventListener('click', () => {
    alert('Signup functionality will be implemented with Firebase Auth');
});
