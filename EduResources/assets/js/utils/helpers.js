// assets/js/utils/helpers.js

const helpers = {
    // Format date to readable string
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    },

    // Generate star rating HTML
    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHTML = '';
        
        // Add full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }
        
        // Add half star if needed
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Add empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }
        
        return starsHTML;
    },
    renderStars(rating) {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-interactive';
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star-rating' + (i <= rating ? ' active' : '');
            star.dataset.rating = i;
            star.innerHTML = '<i class="fas fa-star"></i>';
            starsContainer.appendChild(star);
        }
    }

    // Format number with K/M suffix
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    // Debounce function for search input
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Get type-specific icon class
    getTypeIcon(type) {
        const icons = {
            video: 'fas fa-play-circle',
            pdf: 'fas fa-file-pdf',
            article: 'fas fa-newspaper',
            interactive: 'fas fa-laptop-code'
        };
        return icons[type] || 'fas fa-file';
    }
};
