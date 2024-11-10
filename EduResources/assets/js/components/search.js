// assets/js/components/search.js

class Search {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.init();
    }

    init() {
        // Add search input event listener with debounce
        this.searchInput.addEventListener('input', 
            helpers.debounce(() => this.handleSearch(), 300)
        );
    }

    handleSearch() {
        const query = this.searchInput.value.trim();
        
        if (query.length === 0) {
            // If search is empty, show default content
            this.resetContent();
            return;
        }

        // Search content using mock data
        const results = mockData.searchContent(query);
        
        // Update content grid with results
        this.updateResults(results);
    }

    updateResults(results) {
        const contentGrid = document.querySelector('.content-grid');
        
        if (results.length === 0) {
            contentGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found</p>
                </div>
            `;
            return;
        }

        contentGrid.innerHTML = results
            .map(content => new ContentCard(content).render())
            .join('');
    }

    resetContent() {
        // Reset to trending and recent sections
        const trendingContent = document.getElementById('trendingContent');
        const recentContent = document.getElementById('recentContent');

        trendingContent.innerHTML = mockData.getTrendingContent()
            .map(content => new ContentCard(content).render())
            .join('');

        recentContent.innerHTML = mockData.getRecentContent()
            .map(content => new ContentCard(content).render())
            .join('');
    }
}