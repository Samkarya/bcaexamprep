// assets/js/main.js
import firebaseData from './utils/mockData.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize components
    ContentCard.init();
    new Search();
    await initializeApp();
});

async function initializeApp() {
    try {
        // Check authentication status
        const isAuthenticated = await firebaseData.checkAuthStatus();
        if (!isAuthenticated) {
            // Handle unauthenticated state
            handleUnauthenticated();
            return;
        }

        // Load initial data
        await loadInitialContent();
        
        // Initialize filters after data is loaded
        initializeFilters();
        
        // Add scroll listener for infinite loading
        setupInfiniteScroll();
    } catch (error) {
        console.error('Error initializing app:', error);
        showToast("Error initializing application", "error");
    }
}

async function loadInitialContent() {
    // Show loading state
    showLoadingState();
    
    try {
        // Load initial data from Firebase
        await firebaseData.loadInitialData();
        
        // Update trending content
        const trendingContent = document.getElementById('trendingContent');
        if (trendingContent) {
            trendingContent.innerHTML = firebaseData.getTrendingContent()
                .map(content => new ContentCard(content).render())
                .join('');
        }

        // Update recent content
        const recentContent = document.getElementById('recentContent');
        if (recentContent) {
            recentContent.innerHTML = firebaseData.getRecentContent()
                .map(content => new ContentCard(content).render())
                .join('');
        }

        updateLoadingStatus();
    } catch (error) {
        console.error('Error loading initial content:', error);
        showToast("Error loading content", "error");
    } finally {
        hideLoadingState();
    }
}

function initializeFilters() {
    const filter = new Filter();
    window.filter = filter; // Make filter globally accessible
}

function setupInfiniteScroll() {
    const loadMoreThreshold = 800; // pixels from bottom
    
    window.addEventListener('scroll', async () => {
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - loadMoreThreshold) {
            const { isLoading, hasMoreData } = firebaseData.getLoadingStatus();
            
            if (!isLoading && hasMoreData) {
                await loadMoreContent();
            }
        }
    });
}

async function loadMoreContent() {
    try {
        const newContent = await firebaseData.loadMoreData();
        if (newContent.length > 0) {
            appendNewContent(newContent);
        }
        updateLoadingStatus();
    } catch (error) {
        console.error('Error loading more content:', error);
        showToast("Error loading more content", "error");
    }
}

function appendNewContent(newContent) {
    const contentGrid = document.querySelector('.content-grid');
    if (contentGrid) {
        const newElements = newContent
            .map(content => new ContentCard(content).render())
            .join('');
        contentGrid.insertAdjacentHTML('beforeend', newElements);
    }
}

function updateLoadingStatus() {
    const status = firebaseData.getLoadingStatus();
    const statusElement = document.querySelector('.loading-status');
    
    if (statusElement) {
        statusElement.textContent = `Loaded ${status.loadedDocuments} of ${status.totalDocuments} items`;
    }
}

function handleUnauthenticated() {
    const contentAreas = document.querySelectorAll('#trendingContent, #recentContent, .content-grid');
    contentAreas.forEach(area => {
        area.innerHTML = `
            <div class="auth-required">
                <i class="fas fa-lock"></i>
                <h3>Authentication Required</h3>
                <p>Please log in to view content</p>
                <button onclick="document.getElementById('loginBtn').click()">
                    Log In
                </button>
            </div>
        `;
    });
}

function showLoadingState() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    document.body.appendChild(loadingIndicator);
}

function hideLoadingState() {
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}
