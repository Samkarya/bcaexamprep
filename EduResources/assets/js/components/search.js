// assets/js/components/search.js
import firebaseData from 'https://samkarya.github.io/bcaexamprep/EduResources/assets/js/utils/mockData.js';
//import { debounce } from 'https://samkarya.github.io/bcaexamprep/EduResources/assets/js/utils/helpers.js';

class Search {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.contentGrid = document.querySelector('.content-grid');
        this.isSearching = false;
        this.init();
    }

    init() {
        if (!this.searchInput) {
            console.error('Search input element not found');
            showToast('Search input element not found',info);
            return;
        }

        // Add search input event listener with debounce
        this.searchInput.addEventListener('input', 
            helpers.debounce(() => this.handleSearch(), 300)
        );

        // Add clear search button handler
        const clearButton = document.getElementById('clearSearch');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearSearch());
        }
    }

    async handleSearch() {
        const query = this.searchInput.value.trim();
        
        if (query.length === 0) {
            this.clearSearch();
            return;
        }

        if (query.length < 2) {
            return; // Don't search for single characters
        }

        try {
            this.showLoadingState();
            
            // Perform search
            const results = await firebaseData.searchContent(query);
            
            // Update URL with search query
            const searchParams = new URLSearchParams(window.location.search);
            searchParams.set('q', query);
            window.history.replaceState({}, '', `${window.location.pathname}?${searchParams}`);
            
            this.updateResults(results, query);
        } catch (error) {
            console.error('Search error:', error);
            this.showError('An error occurred while searching. Please try again.');
        } finally {
            this.hideLoadingState();
        }
    }

    updateResults(results, query) {
        if (!this.contentGrid) return;

        if (results.length === 0) {
            this.showNoResults(query);
            return;
        }

        // Update content count
        this.updateSearchCount(results.length);

        // Render results with highlight
        this.contentGrid.innerHTML = results
            .map(content => {
                const highlightedTitle = this.highlightMatch(content.title, query);
                return `
                    <div class="content-card">
                        <h3>${highlightedTitle}</h3>
                        <div class="content-meta">
                            <span class="type">${content.type}</span>
                            <span class="rating">★ ${content.rating.toFixed(1)}</span>
                        </div>
                        <div class="tags">
                            ${content.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                `;
            })
            .join('');
    }

    showNoResults(query) {
        this.contentGrid.innerHTML = `
            <div class="no-results">
                <svg class="search-icon" viewBox="0 0 24 24" width="48" height="48">
                    <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <p>No results found for "${query}"</p>
                <button class="clear-search" onclick="this.clearSearch()">Clear Search</button>
            </div>
        `;
        this.updateSearchCount(0);
    }

    highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    showLoadingState() {
        this.isSearching = true;
        this.searchInput.classList.add('loading');
        this.contentGrid.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Searching...</p>
            </div>
        `;
    }

    hideLoadingState() {
        this.isSearching = false;
        this.searchInput.classList.remove('loading');
    }

    showError(message) {
        this.contentGrid.innerHTML = `
            <div class="search-error">
                <p>${message}</p>
                <button onclick="this.clearSearch()">Try Again</button>
            </div>
        `;
    }

    updateSearchCount(count) {
        const countElement = document.querySelector('.content-count');
        if (countElement) {
            countElement.textContent = `Found ${count} result${count !== 1 ? 's' : ''}`;
        }
    }

    clearSearch() {
        this.searchInput.value = '';
        this.hideLoadingState();
        
        // Remove search query from URL
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.delete('q');
        window.history.replaceState({}, '', window.location.pathname);
        
        // Reset content to default view
        this.resetContent();
    }

    resetContent() {
        if (!this.contentGrid) return;

        // Show loading state
        this.showLoadingState();

        try {
            // Reset to default content sections
            const trendingContent = document.getElementById('trendingContent');
            const recentContent = document.getElementById('recentContent');

            if (trendingContent) {
                trendingContent.innerHTML = firebaseData.getTrendingContent()
                    .map(content => new ContentCard(content).render())
                    .join('');
            }

            if (recentContent) {
                recentContent.innerHTML = firebaseData.getRecentContent()
                    .map(content => new ContentCard(content).render())
                    .join('');
            }

            // Reset content count
            this.updateSearchCount(firebaseData.contents.length);
        } catch (error) {
            console.error('Error resetting content:', error);
            this.showError('Error resetting content. Please refresh the page.');
        } finally {
            this.hideLoadingState();
        }
    }
}

export default Search;
