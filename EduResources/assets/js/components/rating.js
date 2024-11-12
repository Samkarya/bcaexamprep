class Rating {
    constructor() {
        this.ratings = new Map(); // Store user ratings
        console.log('Rating system initialized with an empty ratings map.');
        this.init();
    }

    init() {
        console.log('Initializing event listeners and setting up initial rating displays.');

        // Add event delegation for rating stars
        document.addEventListener('click', (e) => {
            console.log('Click event detected on document.');
            const ratingContainer = e.target.closest('.rating-container');
            if (!ratingContainer) {
                console.log('Click is outside a .rating-container, ignoring.');
                return;
            }

            const starElement = e.target.closest('.star');
            if (!starElement) {
                console.log('Click is outside a .star element, ignoring.');
                return;
            }

            const contentId = ratingContainer.closest('.content-card').dataset.id;
            const rating = parseInt(starElement.dataset.rating);
            console.log(`Star clicked: contentId=${contentId}, rating=${rating}`);

            this.handleRating(contentId, rating, ratingContainer);
        });

        // Initialize all rating containers
        this.initializeRatingContainers();
    }

    initializeRatingContainers() {
        console.log('Initializing rating containers...');
        document.querySelectorAll('.rating-container').forEach(container => {
            const contentId = container.closest('.content-card').dataset.id;
            const currentRating = parseFloat(container.dataset.rating) || 0;
            console.log(`Setting up rating for contentId=${contentId} with initial rating=${currentRating}`);

            this.renderStars(container, currentRating);
            this.updateRatingDisplay(container, currentRating);
        });
    }

    handleRating(contentId, rating, container) {
        console.log(`Handling new rating: contentId=${contentId}, rating=${rating}`);
        
        // In a real implementation, this would make an API call to update the rating
        this.ratings.set(contentId, rating);
        console.log(`Updated internal ratings map:`, this.ratings);

        // Update visual display
        this.updateRatingDisplay(container, rating);

        // Animate the rating change
        this.animateRating(container);

        // Log for demonstration (replace with actual API call)
        console.log(`Content ID: ${contentId} rated ${rating} stars`);

        // Show thank you message
        this.showThankYouMessage(container);
    }

    renderStars(container, rating) {
        console.log(`Rendering stars for container with rating=${rating}`);
        const starsContainer = document.querySelector('.stars');

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star-rating' + (i <= rating ? ' active' : '');
            star.dataset.rating = i;
            star.innerHTML = '<i class="fas fa-star"></i>';
            starsContainer.appendChild(star);
            console.log(`Star created: rating=${i}, active=${i <= rating}`);
        }

        // Replace existing stars if any
        const existingStars = container.querySelector('.stars');
        if (existingStars) {
            console.log('Replacing existing stars with new stars.');
            container.replaceChild(starsContainer, existingStars);
        } else {
            console.log('Adding new stars to the container.');
            container.appendChild(starsContainer);
        }
    }

    updateRatingDisplay(container, rating) {
        console.log(`Updating rating display for container: rating=${rating}`);
        
        // Update stars
        container.querySelectorAll('.star-rating').forEach((star, index) => {
            const starRating = index + 1;
            if (starRating <= rating) {
                star.classList.add('active');
                console.log(`Star ${starRating} set to active.`);
            } else if (starRating - 0.5 <= rating) {
                star.classList.add('half');
                console.log(`Star ${starRating} set to half-active.`);
            } else {
                star.classList.remove('active', 'half');
                console.log(`Star ${starRating} set to inactive.`);
            }
        });

        // Update rating number
        let ratingText = container.querySelector('.rating-text');
        if (!ratingText) {
            ratingText = document.createElement('span');
            ratingText.className = 'rating-text';
            container.appendChild(ratingText);
            console.log('Created new .rating-text element.');
        }
        ratingText.textContent = rating.toFixed(1);
        console.log(`Rating text updated to ${rating.toFixed(1)}.`);
    }

    animateRating(container) {
        console.log('Animating rating change...');
        container.classList.add('rating-updated');
        setTimeout(() => {
            container.classList.remove('rating-updated');
            console.log('Rating animation completed.');
        }, 1000);
    }

    showThankYouMessage(container) {
        console.log('Displaying thank you message...');
        const message = document.createElement('div');
        message.className = 'rating-thank-you';
        message.textContent = 'Thanks for rating!';
        
        container.appendChild(message);
        
        // Remove message after animation
        setTimeout(() => {
            message.remove();
            console.log('Thank you message removed.');
        }, 2000);
    }

    static calculateAverageRating(ratings) {
        console.log('Calculating average rating...');
        if (!ratings || ratings.length === 0) {
            console.log('No ratings available, returning 0.');
            return 0;
        }
        
        const sum = ratings.reduce((acc, curr) => acc + curr, 0);
        const average = (sum / ratings.length).toFixed(1);
        console.log(`Calculated average rating: ${average}`);
        return average;
    }

    static addStyles() {
        console.log('Adding CSS styles for rating animations...');
        const styles = `
            .rating-container {
                position: relative;
                transition: transform 0.2s ease;
            }

            .stars{
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

            .star-rating.active i {
                color: #ffd700;
            }

            .star-rating.half i {
                background: linear-gradient(90deg, #ffd700 50%, #e4e5e9 50%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
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
        console.log('CSS styles added to document head.');
    }
}

// Add rating styles to document
Rating.addStyles();

// Initialize rating system
const rating = new Rating();
console.log('Rating system initialized and ready for interaction.');
