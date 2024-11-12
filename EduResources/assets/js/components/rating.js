class Rating {
    constructor() {
        this.ratings = new Map(); // Store user ratings
        this.init();
    }

    init() {
        // Add event delegation for rating stars and hover effects
        document.addEventListener('mousemove', (e) => {
            const ratingContainer = e.target.closest('.rating-container');
            if (!ratingContainer) return;

            const starElement = e.target.closest('.star-rating');
            if (!starElement) return;

            this.handleHover(e, starElement, ratingContainer);
        });

        document.addEventListener('mouseleave', (e) => {
            const ratingContainer = e.target.closest('.rating-container');
            if (!ratingContainer) return;

            // Reset to actual rating when mouse leaves
            const contentId = ratingContainer.closest('.content-card')?.dataset.id;
            const currentRating = this.ratings.get(contentId) || parseFloat(ratingContainer.dataset.rating) || 0;
            this.updateRatingDisplay(ratingContainer, currentRating);
        }, true);

        document.addEventListener('click', (e) => {
            const ratingContainer = e.target.closest('.rating-container');
            if (!ratingContainer) return;

            const starElement = e.target.closest('.star-rating');
            if (!starElement) return;

            const contentId = ratingContainer.closest('.content-card')?.dataset.id;
            const rating = this.calculateRating(e, starElement);

            this.handleRating(contentId, rating, ratingContainer);
        });

        // Initialize all rating containers
        this.initializeRatingContainers();
    }

    calculateRating(e, starElement) {
        const rect = starElement.getBoundingClientRect();
        const starWidth = rect.width;
        const clickPosition = e.clientX - rect.left;
        const baseRating = parseInt(starElement.dataset.rating);
        
        // If click is on the left half of the star, make it a half star
        return clickPosition < starWidth / 2 ? baseRating - 0.5 : baseRating;
    }

    handleHover(e, starElement, container) {
        const rating = this.calculateRating(e, starElement);
        this.updateRatingDisplay(container, rating, true);
    }

    initializeRatingContainers() {
        document.querySelectorAll('.rating-container').forEach(container => {
            const contentId = container.closest('.content-card')?.dataset.id;
            const currentRating = parseFloat(container.dataset.rating) || 0;
            
            this.renderStars(container, currentRating);
            this.updateRatingDisplay(container, currentRating);
        });
    }

    handleRating(contentId, rating, container) {
        this.ratings.set(contentId, rating);
        this.updateRatingDisplay(container, rating);
        this.animateRating(container);
        console.log(`Content ID: ${contentId || 'undefined'} rated ${rating} stars`);
        this.showThankYouMessage(container);
    }

    renderStars(container, rating) {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-interactive';

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star-rating';
            star.dataset.rating = i;
            star.innerHTML = '<i class="fas fa-star"></i>';
            starsContainer.appendChild(star);
        }

        // Replace existing stars if any
        const existingStars = container.querySelector('.stars-interactive');
        if (existingStars) {
            container.replaceChild(starsContainer, existingStars);
        } else {
            container.appendChild(starsContainer);
        }

        this.updateRatingDisplay(container, rating);
    }

    updateRatingDisplay(container, rating, isHover = false) {
        container.querySelectorAll('.star-rating').forEach((star, index) => {
            const starRating = index + 1;
            star.classList.remove('active', 'half', 'hover', 'hover-half');
            
            if (starRating <= rating) {
                star.classList.add(isHover ? 'hover' : 'active');
            } else if (starRating - 0.5 <= rating) {
                star.classList.add(isHover ? 'hover-half' : 'half');
            }
        });

        // Update rating number
        let ratingText = container.querySelector('.rating-text');
        if (!ratingText) {
            ratingText = document.createElement('span');
            ratingText.className = 'rating-text';
            container.appendChild(ratingText);
        }
        ratingText.textContent = rating.toFixed(1);
    }

    animateRating(container) {
        container.classList.add('rating-updated');
        setTimeout(() => {
            container.classList.remove('rating-updated');
        }, 1000);
    }

    showThankYouMessage(container) {
        const message = document.createElement('div');
        message.className = 'rating-thank-you';
        message.textContent = 'Thanks for rating!';
        
        container.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 2000);
    }

    static calculateAverageRating(ratings) {
        if (!ratings || ratings.length === 0) return 0;
        const sum = ratings.reduce((acc, curr) => acc + curr, 0);
        return (sum / ratings.length).toFixed(1);
    }

    static addStyles() {
        const styles = `
            .rating-container {
                position: relative;
                transition: transform 0.2s ease;
            }

            .stars-interactive {
                display: inline-flex;
                gap: 2px;
            }

            .star-rating {
                cursor: pointer;
                transition: transform 0.1s ease, color 0.2s ease;
            }

            .star-rating:hover {
                transform: scale(1.2);
            }

            .star-rating i {
                transition: color 0.2s ease, background 0.2s ease;
                font-size: 24px;
            }

            .star-rating.active i,
            .star-rating.hover i {
                color: #ffd700;
            }

            .star-rating.half i,
            .star-rating.hover-half i {
                background: linear-gradient(90deg, #ffd700 50%, #e4e5e9 50%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .rating-text {
                margin-left: 8px;
                font-size: 14px;
                color: #666;
            }

            .rating-updated {
                animation: pulse 1s ease;
            }

            .rating-thank-you {
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                animation: fadeOut 2s ease forwards;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            @keyframes fadeOut {
                0% { opacity: 1; transform: translate(-50%, 0); }
                70% { opacity: 1; transform: translate(-50%, 0); }
                100% { opacity: 0; transform: translate(-50%, -10px); }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}

// Add rating styles to document
Rating.addStyles();

// Initialize rating system
const rating = new Rating();
