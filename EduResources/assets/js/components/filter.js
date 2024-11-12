// assets/js/components/filter.js
import firebaseData from 'https://samkarya.github.io/bcaexamprep/EduResources/assets/js/utils/mockData.js';
class Filter {
    constructor() {
        this.filterGroups = {
            type: {
                selector: '.filter-group input[type="checkbox"][value]',
                values: new Set()
            },
            category: {
                selector: '.filter-group input[type="checkbox"][data-category]',
                values: new Set()
            },
            rating: {
                value: 0,
                selector: '.rating-slider'
            },
            bookmarked: {
                value: false,
                selector: '.bookmark-filter input[type="checkbox"]'
            }
        };

        this.contentGrid = document.querySelector('.content-grid');
        this.activeFilters = new Map();
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.totalPages = 1;
        this.init();
    }

    init() {
        // Initialize type filters
        const typeFilters = document.querySelectorAll(this.filterGroups.type.selector);
        typeFilters.forEach(filter => {
            filter.addEventListener('change', () => this.handleTypeFilter(filter));
        });

        // Initialize category filters
        const categoryFilters = document.querySelectorAll(this.filterGroups.category.selector);
        categoryFilters.forEach(filter => {
            filter.addEventListener('change', () => this.handleCategoryFilter(filter));
        });

        // Initialize rating filter
        const ratingSlider = document.querySelector(this.filterGroups.rating.selector);
        ratingSlider.addEventListener('input', (e) => this.handleRatingFilter(e));

         // Initialize bookmark filter
         const bookmarkFilter = document.querySelector(this.filterGroups.bookmarked.selector);
         if (bookmarkFilter) {
             bookmarkFilter.addEventListener('change', () => this.handleBookmarkFilter(bookmarkFilter));
         }

        this.clearAllFilters();
        this.initializePaginationControls();

        // Add clear filters button
        this.addClearFiltersButton();
    }

    handleTypeFilter(filter) {
        const filterType = 'type';
        const value = filter.value;

        if (filter.checked) {
            this.filterGroups[filterType].values.add(value);
        } else {
            this.filterGroups[filterType].values.delete(value);
        }

        this.applyFilters();
        //this.updateFilterBadges();
    }

    handleCategoryFilter(filter) {
        const filterType = 'category';
        const value = filter.dataset.category;

        if (filter.checked) {
            this.filterGroups[filterType].values.add(value);
        } else {
            this.filterGroups[filterType].values.delete(value);
        }
        
        this.applyFilters();
        //this.updateFilterBadges();
    }

    handleRatingFilter(event) {
        const value = parseFloat(event.target.value);
        this.filterGroups.rating.value = value;

        // Update rating display
        const ratingDisplay = document.querySelector('.rating-value');
        if (ratingDisplay) {
            ratingDisplay.textContent = `${value}+ Stars`;
        }

        this.applyFilters();
        //this.updateFilterBadges();
    }

    handleBookmarkFilter(filter) {
        this.filterGroups.bookmarked.value = filter.checked;
        this.applyFilters();
    }

    applyFilters() {
        let filteredContent = firebaseData.contents;
        // Apply type filters
        if (this.filterGroups.type.values.size > 0) {
            filteredContent = filteredContent.filter(content =>
                this.filterGroups.type.values.has(content.type)
            );            
        }

        // Apply category filters
        if (this.filterGroups.category.values.size > 0) {
            filteredContent = filteredContent.filter(content =>
                content.tags.some(tag => 
                    this.filterGroups.category.values.has(tag.toLowerCase())
                )
            );
        }

        // Apply rating filter
        if (this.filterGroups.rating.value > 0) {
            filteredContent = filteredContent.filter(content =>
                content.rating >= this.filterGroups.rating.value
            );
        }        

        // Apply bookmark filter
        if (this.filterGroups.bookmarked.value) {
            filteredContent = filteredContent.filter(content => content.isBookmarked);
        }

        this.updateContentDisplay(filteredContent);
    }

    updateContentDisplay(filteredContent) {
        requestAnimationFrame(() => {
            const totalItems = filteredContent.length;
            this.totalPages = this.calculateTotalPages(totalItems);

            // Ensure current page is valid
            if (this.currentPage > this.totalPages) {
                this.currentPage = Math.max(1, this.totalPages);
            }

            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            const paginatedContent = filteredContent.slice(startIndex, endIndex);

            if (paginatedContent.length === 0) {
                this.contentGrid.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-filter"></i>
                        <p>No content matches your filters</p>
                        <button class="clear-filters-btn" onclick="filter.clearAllFilters()">Clear Filters</button>
                    </div>
                `;
            } else {
                this.contentGrid.innerHTML = paginatedContent
                    .map(content => new ContentCard(content).render())
                    .join('');
            }

            this.updatePaginationControls(totalItems);
        });
    }
    
    initializePaginationControls() {
        const paginationContainer = document.querySelector('.pagination-controls');
        if (!paginationContainer) return;

        const prevButton = paginationContainer.querySelector('.prev-page');
        const nextButton = paginationContainer.querySelector('.next-page');
        
        prevButton.addEventListener ('click', () => this.handlePageNavigation('prev'));
        nextButton.addEventListener('click', () => this.handlePageNavigation('next'));
    }

    handlePageNavigation(direction) {
        if (direction === 'prev' && this.currentPage > 1) {
            this.currentPage--;
        } else if (direction === 'next' && this.currentPage < this.totalPages) {
            this.currentPage++;
        }
        this.applyFilters();
    }

    calculateTotalPages(totalItems) {
        return Math.ceil(totalItems / this.itemsPerPage);
    }

    updatePaginationControls(totalItems) {
        const paginationContainer = document.querySelector('.pagination-controls');
        if (!paginationContainer) return;

        const prevButton = paginationContainer.querySelector('.prev-page');
        const nextButton = paginationContainer.querySelector('.next-page');
        const paginationInfo = paginationContainer.querySelector('.pagination-info');

        // Update pagination info display
        if (paginationInfo) {
            paginationInfo.innerHTML = `
                <span class="current-page">${this.currentPage}</span> of 
                <span class="total-pages">${this.totalPages}</span>
                <span class="total-items">(${totalItems} items)</span>
            `;
        }

        // Update button states
        prevButton.disabled = this.currentPage <= 1;
        nextButton.disabled = this.currentPage >= this.totalPages;

        // Add/remove disabled class for styling
        prevButton.classList.toggle('disabled', this.currentPage <= 1);
        nextButton.classList.toggle('disabled', this.currentPage >= this.totalPages);
    }

    navigateToPage(pageNumber) {
        this.currentPage = pageNumber;
        this.applyFilters();
    }

    updateFilterBadges() {
        const filterBadgesContainer = document.querySelector('.active-filters');
        if (!filterBadgesContainer) {
            this.createFilterBadgesContainer();
            return;
        }

        let badgesHTML = '';

        // Add type filters
        this.filterGroups.type.values.forEach(type => {
            badgesHTML += this.createFilterBadge('type', type);
        });

        // Add category filters
        this.filterGroups.category.values.forEach(category => {
            badgesHTML += this.createFilterBadge('category', category);
        });

        // Add rating filter if active
        if (this.filterGroups.rating.value > 0) {
            badgesHTML += this.createFilterBadge('rating', 
                `${this.filterGroups.rating.value}+ Stars`);
        }

        filterBadgesContainer.innerHTML = badgesHTML || 'No active filters';
    }

    createFilterBadgesContainer() {
        const container = document.createElement('div');
        container.className = 'active-filters';
        container.innerHTML = 'No active filters';

        const filtersSection = document.querySelector('.filters-section');
        filtersSection.insertBefore(container, filtersSection.firstChild);
    }

    createFilterBadge(type, value) {
        return `
            <span class="filter-badge" data-type="${type}" data-value="${value}">
                ${value}
                <button class="remove-filter" onclick="filter.removeFilter('${type}', '${value}')">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `;
    }

    removeFilter(type, value) {
        if (type === 'rating') {
            this.filterGroups.rating.value = 0;
            const slider = document.querySelector(this.filterGroups.rating.selector);
            if (slider) slider.value = 0;
        } else {
            this.filterGroups[type].values.delete(value);
            const checkbox = document.querySelector(
                `input[type="checkbox"][${type === 'category' ? 'data-category' : 'value'}="${value}"]`
            );
            if (checkbox) checkbox.checked = false;
        }

        this.applyFilters();
        //this.updateFilterBadges();
    }

    addClearFiltersButton() {
        const clearButton = document.createElement('button');
        clearButton.className = 'clear-all-filters-btn';
        clearButton.innerHTML = 'Clear All Filters';
        clearButton.addEventListener('click', () => this.clearAllFilters());

        const filtersSection = document.querySelector('.filters-section');
        filtersSection.appendChild(clearButton);
    }

    clearAllFilters() {
        // Reset all checkboxes
        document.querySelectorAll('.filter-group input[type="checkbox"]')
            .forEach(checkbox => checkbox.checked = false);

        // Reset rating slider
        const ratingSlider = document.querySelector(this.filterGroups.rating.selector);
        if (ratingSlider) {
            ratingSlider.value = 0;
            const ratingDisplay = document.querySelector('.rating-value');
            if (ratingDisplay) ratingDisplay.textContent = '0+ Stars';
        }

        // Clear filter groups
        this.filterGroups.type.values.clear();
        this.filterGroups.category.values.clear();
        this.filterGroups.rating.value = 0;
        this.filterGroups.bookmarked.value = false;

        // Reset content and badges
        this.applyFilters();
        //this.updateFilterBadges();
    }
}

// Create global filter instance
export default Filter;
