// assets/js/components/rating.js
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import firebaseData from 'https://samkarya.github.io/bcaexamprep/EduResources/assets/js/utils/mockData.js';
class Rating {
    constructor() {
        this.ratings = new Map(); // Store user ratings
        this.db = getFirestore();
        this.auth = getAuth();
        this.init();
    }

    init() {
        // Add event delegation for rating stars
        document.addEventListener('click', async (e) => {
            const ratingContainer = e.target.closest('.rating-container');
            if (!ratingContainer) return;

            const starElement = e.target.closest('.star-rating');
            if (!starElement) return;

            // Check if user is authenticated
            if (!this.auth.currentUser) {
                this.showMessage(ratingContainer, 'Please login to rate', 'error');
                return;
            }

            const contentId = ratingContainer.closest('.content-card').dataset.id;
            const rating = parseInt(starElement.dataset.rating);
            await this.handleRating(contentId, rating, ratingContainer);
        });
    }

    async handleRating(contentId, rating, container) {
        try {
            await firebaseData.rateResource(contentId, rating);
            this.updateRatingDisplay(container, rating);
            
            this.animateRating(container);
            this.showMessage(container, 'Thanks for rating!', 'success');
            await firebaseData.updateResourceRating(contentId);
            
        } catch (error) {
            console.error('Error saving rating:', error);
            this.showMessage(container, 'Error saving rating', 'error');
        }
    }

    updateRatingDisplay(container, rating) {
        container.querySelectorAll('.star-rating').forEach((star, index) => {
            const starRating = index + 1;
            
            if (starRating <= rating) {
                star.classList.add('active');
            } else if (starRating - 0.5 <= rating) {
                star.classList.add('half');
            } else {
                star.classList.remove('active', 'half');
            }
        });
    }

    animateRating(container) {
        container.classList.add('rating-updated');
        setTimeout(() => {
            container.classList.remove('rating-updated');
        }, 1000);
    }

    showMessage(container, message, type = 'success') {
        const messageElement = document.createElement('div');
        messageElement.className = `rating-message ${type}`;
        messageElement.textContent = message;
        
        container.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.remove();
        }, 2000);
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

            .rating-message {
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                animation: fadeOut 2s ease forwards;
            }

            .rating-message.success {
                background: rgba(0, 128, 0, 0.8);
                color: white;
            }

            .rating-message.error {
                background: rgba(255, 0, 0, 0.8);
                color: white;
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

export default Rating;
