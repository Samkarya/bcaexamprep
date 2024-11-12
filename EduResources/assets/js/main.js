// assets/js/main.js
import firebaseData from 'https://samkarya.github.io/bcaexamprep/EduResources/assets/js/utils/mockData.js';
import Search from 'https://samkarya.github.io/bcaexamprep/EduResources/assets/js/components/search.js';
// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load initial data from Firebase
        await firebaseData.loadInitialData();
    // Initialize content cards
    ContentCard.init();

    // Initialize search
    new Search();

    // Load initial content
    loadInitialContent();

    // Initialize filters
    initializeFilters();
        setupLoadingIndicator();
} catch (error) {
        console.error('Error initializing application:', error);
        showToast('Error loading content. Please try again later.', 'error');
    }
});
async function loadInitialContent() {
 // Show loading states
    const trendingContent = document.getElementById('trendingContent');
    const recentContent = document.getElementById('recentContent');
    
    trendingContent.innerHTML = '<div class="loading-spinner">Loading trending content...</div>';
    recentContent.innerHTML = '<div class="loading-spinner">Loading recent content...</div>';
    
    try {
        // Load trending content
        const trendingItems = firebaseData.getTrendingContent();
        trendingContent.innerHTML = trendingItems
            .map(content => new ContentCard(content).render())
            .join('');

        // Load recent content
        const recentItems = firebaseData.getRecentContent();
        recentContent.innerHTML = recentItems
            .map(content => new ContentCard(content).render())
            .join('');
            
        // Update content count
        updateContentCount();
        
    } catch (error) {
        console.error('Error loading initial content:', error);
        showToast('Error loading content. Please try again later.', 'error');
    }
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
    let filteredContent = firebaseData.contents;
    if (selectedTypes.length > 0) {
        filteredContent = firebaseData.filterByType(selectedTypes);
    }
    filteredContent = firebaseData.filterByRating(minRating);
    
    // Update content grid
    const contentGrid = document.querySelector('.content-grid');
    contentGrid.innerHTML = filteredContent
        .map(content => new ContentCard(content).render())
        .join('');
        
    // Update filtered content count
    updateContentCount(filteredContent.length);
}
function setupLoadingIndicator() {
    // Add loading indicator to bottom of content
    const contentContainer = document.querySelector('.content-section');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator hidden';
    loadingIndicator.innerHTML = '<div class="loading-spinner">Loading more content...</div>';
    contentContainer.appendChild(loadingIndicator);
    
    // Setup intersection observer for infinite scroll
    const observer = new IntersectionObserver(async (entries) => {
        const status = firebaseData.getLoadingStatus();
        
        if (entries[0].isIntersecting && status.hasMoreData && !status.isLoading) {
            loadingIndicator.classList.remove('hidden');
            await loadMoreContent();
            loadingIndicator.classList.add('hidden');
        }
    }, { threshold: 0.5 });
    
    observer.observe(loadingIndicator);
}
async function loadMoreContent() {
    try {
        const newContent = await firebaseData.loadMoreData();
        if (newContent.length > 0) {
            // Append new content to grid
            const contentGrid = document.querySelector('.content-grid');
            const newElements = newContent
                .map(content => new ContentCard(content).render())
                .join('');
            contentGrid.insertAdjacentHTML('beforeend', newElements);
            
            // Update content count
            updateContentCount();
        }
    } catch (error) {
        console.error('Error loading more content:', error);
        showToast('Error loading more content. Please try again.', 'error');
    }
}

function updateContentCount(count = null) {
    const countElement = document.querySelector('.content-count');
    if (!countElement) return;
    
    const status = firebaseData.getLoadingStatus();
    const displayCount = count ?? status.loadedDocuments;
    const totalCount = status.totalDocuments;
    
    countElement.textContent = `Showing ${displayCount} of ${totalCount} resources`;
}

// Optional: Add loading progress bar
function addProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'loading-progress';
    document.body.appendChild(progressBar);
    
    // Update progress bar based on loaded content
    setInterval(() => {
        const status = firebaseData.getLoadingStatus();
        const progress = (status.loadedDocuments / status.totalDocuments) * 100;
        progressBar.style.width = `${progress}%`;
    }, 1000);
}
// Add authentication modal handlers
document.getElementById('loginBtn').addEventListener('click', () => {
    alert('Login functionality will be implemented with Firebase Auth');
});

document.getElementById('signupBtn').addEventListener('click', () => {
    alert('Signup functionality will be implemented with Firebase Auth');
});
