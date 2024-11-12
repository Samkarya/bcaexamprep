class Rating {
    constructor() {
        this.ratings = new Map(); // Store user ratings
        this.init();
    }

    init() {
        // Add event delegation for rating stars
        document.addEventListener('click', (e) => {
            console.log('Click event detected on document.');
            const ratingContainer = e.target.closest('.rating-container');
            if (!ratingContainer) {
                return;
            }
            
        });

        // Initialize all rating containers
        this.initializeRatingContainers();
    }

    initializeRatingContainers() {
        document.querySelectorAll('.rating-container').forEach(container => {
            const contentId = container.closest('.content-card').dataset.id;

            const stars = document.querySelectorAll('.stars i');

stars.forEach((star, index) => {
  star.addEventListener('mouseover', () => {
    // Add the 'fas' class to change the star to a filled star
    for (let i = 0; i <= index; i++) {
      stars[i].classList.add('fas');
      stars[i].classList.remove('far');
    }

    // Remove the 'fas' class from the remaining stars to make them blank
    for (let i = index + 1; i < stars.length; i++) {
      stars[i].classList.add('far');
      stars[i].classList.remove('fas');
    }

    // Log the rating to the console
    const rating = index + 1;
    console.log(`Rating: ${rating} star${rating > 1 ? 's' : ''}`); 
    this.showThankYouMessage(container);
  });

  star.addEventListener('mouseout', () => {
    // Reset all stars to blank
    stars.forEach(star => {
      star.classList.add('far');
      star.classList.remove('fas');
    });
  });
});
        });
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

    static addStyles() {
        console.log('Adding CSS styles for rating animations...');
        const styles = `
            .rating-container {
                position: relative;
                transition: transform 0.2s ease;
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



// Wait for the DOM to fully load before initializing the rating system
document.addEventListener('DOMContentLoaded', async () => {
    // Add rating styles to document
Rating.addStyles();
    const rating = new Rating();
    console.log('Rating system initialized and ready for interaction.');
});
