// Initialize rating system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    class StarRating {
        constructor(container) {
            this.container = container;
            this.rating = 0;
            this.init();
        }

        init() {
            // Create stars container
            this.starsContainer = document.createElement('div');
            this.starsContainer.className = 'stars-container';
            
            // Create 5 stars
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('span');
                star.className = 'star';
                star.innerHTML = '★';
                this.starsContainer.appendChild(star);
            }

            // Create rating text
            this.ratingText = document.createElement('span');
            this.ratingText.className = 'rating-text';
            this.ratingText.textContent = '0.0';

            // Add elements to container
            this.container.appendChild(this.starsContainer);
            this.container.appendChild(this.ratingText);

            // Add event listeners
            this.starsContainer.addEventListener('mousemove', (e) => this.handleHover(e));
            this.starsContainer.addEventListener('mouseleave', () => this.handleMouseLeave());
            this.starsContainer.addEventListener('click', (e) => this.handleClick(e));
        }

        handleHover(e) {
            const rect = this.starsContainer.getBoundingClientRect();
            const starWidth = rect.width / 5;
            const x = e.clientX - rect.left;
            const starIndex = Math.floor(x / starWidth);
            const fraction = (x % starWidth) / starWidth;
            
            let rating = starIndex + (fraction > 0.5 ? 1 : 0.5);
            this.updateStars(rating);
        }

        handleMouseLeave() {
            this.updateStars(this.rating);
        }

        handleClick(e) {
            const rect = this.starsContainer.getBoundingClientRect();
            const starWidth = rect.width / 5;
            const x = e.clientX - rect.left;
            const starIndex = Math.floor(x / starWidth);
            const fraction = (x % starWidth) / starWidth;
            
            this.rating = starIndex + (fraction > 0.5 ? 1 : 0.5);
            this.updateStars(this.rating);
            
            // Animate the container
            this.container.classList.add('rating-selected');
            setTimeout(() => {
                this.container.classList.remove('rating-selected');
            }, 300);

            // Log the rating
            console.log(`Rating selected: ${this.rating} stars`);
        }

        updateStars(rating) {
            const stars = this.starsContainer.children;
            this.ratingText.textContent = rating.toFixed(1);

            for (let i = 0; i < stars.length; i++) {
                if (i < Math.floor(rating)) {
                    stars[i].className = 'star full';
                } else if (i === Math.floor(rating) && rating % 1 !== 0) {
                    stars[i].className = 'star half';
                } else {
                    stars[i].className = 'star';
                }
            }
        }
    }

    // Add styles
    const styles = `
        .rating-container {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            transition: transform 0.3s ease;
        }

        .stars-container {
            display: inline-flex;
            cursor: pointer;
        }

        .star {
            font-size: 24px;
            color: #ddd;
            transition: color 0.2s ease;
            position: relative;
        }

        .star.full {
            color: #ffd700;
        }

        .star.half {
            background: linear-gradient(90deg, #ffd700 50%, #ddd 50%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .rating-text {
            font-size: 16px;
            min-width: 36px;
        }

        .rating-selected {
            animation: pulse 0.3s ease;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Initialize all rating containers
    document.querySelectorAll('.rating-container').forEach(container => {
        new StarRating(container);
    });
});
