class Rating {
    constructor() {
        this.ratings = new Map();
        this.init();
    }

    init() {
        // Add event listeners for both click and mousemove
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseleave', this.handleMouseLeave.bind(this), true);
        
        // Initialize all rating containers
        this.initializeRatingContainers();
    }

    initializeRatingContainers() {
        document.querySelectorAll('.rating-container').forEach(container => {
            const contentId = container.closest('.content-card')?.dataset.id || 'default';
            const currentRating = parseFloat(container.dataset.rating) || 0;
            
            // Clear existing content
            container.innerHTML = '';
            
            // Create stars container
            const starsContainer = document.createElement('div');
            starsContainer.className = 'stars-interactive';
            container.appendChild(starsContainer);

            // Create rating text
            const ratingText = document.createElement('span');
            ratingText.className = 'rating-text';
            container.appendChild(ratingText);

            // Create rating count
            const ratingCount = document.createElement('span');
            ratingCount.className = 'rating-count';
            ratingCount.textContent = `(${this.ratings.size})`;
            container.appendChild(ratingCount);

            this.renderStars(container, currentRating);
            this.updateRatingDisplay(container, currentRating);
        });
    }

    handleClick(e) {
        const ratingContainer = e.target.closest('.rating-container');
        if (!ratingContainer) return;

        const starsContainer = ratingContainer.querySelector('.stars-interactive');
        if (!starsContainer) return;

        const rect = starsContainer.getBoundingClientRect();
        const starWidth = rect.width / 5;
        const x = e.clientX - rect.left;
        
        // Calculate rating based on click position
        let rating = Math.ceil((x / starWidth) * 2) / 2; // Rounds to nearest 0.5
        rating = Math.max(0.5, Math.min(5, rating));

        const contentId = ratingContainer.closest('.content-card')?.dataset.id || 'default';
        this.handleRating(contentId, rating, ratingContainer);
    }

    handleMouseMove(e) {
        const ratingContainer = e.target.closest('.rating-container');
        if (!ratingContainer) return;

        const starsContainer = ratingContainer.querySelector('.stars-interactive');
        if (!starsContainer) return;

        const rect = starsContainer.getBoundingClientRect();
        const starWidth = rect.width / 5;
        const x = e.clientX - rect.left;
        
        // Calculate hover rating
        let hoverRating = Math.ceil((x / starWidth) * 2) / 2;
        hoverRating = Math.max(0.5, Math.min(5, hoverRating));

        this.updateRatingDisplay(ratingContainer, hoverRating, true);
    }

    handleMouseLeave(e) {
        const ratingContainer = e.target.closest('.rating-container');
        if (!ratingContainer) return;

        const contentId = ratingContainer.closest('.content-card')?.dataset.id || 'default';
        const currentRating = this.ratings.get(contentId) || 0;
        
        this.updateRatingDisplay(ratingContainer, currentRating);
    }

    handleRating(contentId, rating, container) {
        this.ratings.set(contentId, rating);
        this.updateRatingDisplay(container, rating);
        this.animateRating(container);
        this.showThankYouMessage(container);
        
        // Update rating count
        const ratingCount = container.querySelector('.rating-count');
        if (ratingCount) {
            ratingCount.textContent = `(${this.ratings.size})`;
        }

        // Log for demonstration (replace with actual API call)
        console.log(`Content ID: ${contentId} rated ${rating} stars`);
    }

    renderStars(container, rating) {
        const starsContainer = container.querySelector('.stars-interactive');
        if (!starsContainer) return;

        starsContainer.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Create left and right halves of the star
            const leftHalf = document.createElement('span');
            leftHalf.className = 'star-half left';
            leftHalf.innerHTML = '<i class="fas fa-star-half"></i>';
            
            const rightHalf = document.createElement('span');
            rightHalf.className = 'star-half right';
            rightHalf.innerHTML = '<i class="fas fa-star-half"></i>';
            
            star.appendChild(leftHalf);
            star.appendChild(rightHalf);
            starsContainer.appendChild(star);
        }
    }

    updateRatingDisplay(container, rating, isHover = false) {
        const stars = container.querySelectorAll('.star');
        const fullStars = Math.floor(rating);
        const hasHalfStar = (rating % 1) >= 0.5;

        stars.forEach((star, index) => {
            const leftHalf = star.querySelector('.left');
            const rightHalf = star.querySelector('.right');
            
            if (index < fullStars) {
                leftHalf.classList.add('active');
                rightHalf.classList.add('active');
            } else if (index === fullStars && hasHalfStar) {
                leftHalf.classList.add('active');
                rightHalf.classList.remove('active');
            } else {
                leftHalf.classList.remove('active');
                rightHalf.classList.remove('active');
            }
            
            if (isHover) {
                star.classList.add('hover');
            } else {
                star.classList.remove('hover');
            }
        });

        // Update rating text
        const ratingText = container.querySelector('.rating-text');
        if (ratingText) {
            ratingText.textContent = rating.toFixed(1);
        }
    }

    animateRating(container) {
        container.classList.add('rating-updated');
        setTimeout(() => {
            container.classList.remove('rating-updated');
        }, 1000);
    }

    showThankYouMessage(container) {
        const existingMessage = container.querySelector('.rating-thank-you');
        if (existingMessage) {
            existingMessage.remove();
        }

        const message = document.createElement('div');
        message.className = 'rating-thank-you';
        message.textContent = 'Thanks for rating!';
        
        container.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 2000);
    }

    static addStyles() {
        const styles = `
            .rating-container {
                position: relative;
                display: inline-flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                transition: transform 0.2s ease;
            }

            .stars-interactive {
                display: inline-flex;
                gap: 4px;
                cursor: pointer;
            }

            .star {
                position: relative;
                display: inline-flex;
                transition: transform 0.2s ease;
            }

            .star-half {
                position: relative;
                display: inline-block;
                color: #e4e5e9;
                transition: color 0.2s ease;
            }

            .star-half.active {
                color: #ffd700;
            }

            .star-half.right {
                transform: scaleX(-1);
            }

            .star:hover {
                transform: scale(1.1);
            }

            .rating-text {
                min-width: 36px;
                text-align: center;
                font-weight: bold;
            }

            .rating-count {
                color: #666;
                font-size: 0.9em;
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
                white-space: nowrap;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
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
