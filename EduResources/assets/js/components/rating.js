// assets/js/components/rating.js
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, runTransaction } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { showToast } from "https://samkarya.github.io/bcaexamprep/firebase/common-utils.js";

class Rating {
    constructor() {
        this.db = getFirestore();
        this.auth = getAuth();
        this.ratings = new Map(); // Store user ratings
        this.userRatings = new Map(); // Store current user's ratings
        this.init();
    }

    async init() {
        // Add event delegation for rating stars
        document.addEventListener('click', async (e) => {
            const ratingContainer = e.target.closest('.rating-container');
            if (!ratingContainer) return;

            const starElement = e.target.closest('.star-rating');
            if (!starElement) return;

            const contentId = ratingContainer.closest('.content-card').dataset.id;
            const rating = parseInt(starElement.dataset.rating);

            await this.handleRating(contentId, rating, ratingContainer);
        });

        // Initialize all rating containers and load user's existing ratings
        await this.loadUserRatings();
        this.initializeRatingContainers();
    }

    async loadUserRatings() {
        try {
            const user = this.auth.currentUser;
            if (!user) return;

            // Query all ratings by current user
            const ratingsRef = collection(this.db, 'eduResourcesRating');
            const q = query(ratingsRef, where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach(doc => {
                const ratingData = doc.data();
                this.userRatings.set(doc.id, ratingData.rating);
            });
        } catch (error) {
            console.error('Error loading user ratings:', error);
            showToast('Error loading your ratings', 'error');
        }
    }

    initializeRatingContainers() {
        document.querySelectorAll('.rating-container').forEach(container => {
            const contentId = container.closest('.content-card').dataset.id;
            const currentRating = parseFloat(container.dataset.rating) || 0;
            const userRating = this.userRatings.get(contentId);
            
            this.renderStars(container, currentRating, userRating);
            this.updateRatingDisplay(container, currentRating);
        });
    }

    async handleRating(contentId, rating, container) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                showToast('Please login to rate content', 'warning');
                return;
            }

            // Start loading state
            container.classList.add('rating-loading');

            // Update rating in Firestore using transaction
            await this.updateRatingInFirestore(contentId, rating, user.uid);

            // Update local state
            this.userRatings.set(contentId, rating);
            
            // Update visual display
            this.updateRatingDisplay(container, rating);
            
            // Animate the rating change
            this.animateRating(container);
            
            // Show thank you message
            this.showThankYouMessage(container);

            showToast('Rating updated successfully', 'success');
        } catch (error) {
            console.error('Error updating rating:', error);
            showToast('Error updating rating', 'error');
        } finally {
            container.classList.remove('rating-loading');
        }
    }

    async updateRatingInFirestore(contentId, rating, userId) {
        try {
            await runTransaction(this.db, async (transaction) => {
                // Get the resource document
                const resourceRef = doc(this.db, 'eduResources', contentId);
                const resourceDoc = await transaction.get(resourceRef);

                if (!resourceDoc.exists()) {
                    throw new Error('Resource not found');
                }

                // Get or create rating document
                const ratingRef = doc(this.db, 'eduResourcesRating', contentId);
                const ratingDoc = await transaction.get(ratingRef);

                let newRatingData;
                if (ratingDoc.exists()) {
                    const data = ratingDoc.data();
                    const ratings = data.ratings || {};
                    ratings[userId] = rating;

                    // Calculate new average
                    const ratingValues = Object.values(ratings);
                    const newAverage = ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length;

                    newRatingData = {
                        ratings,
                        averageRating: newAverage,
                        totalRatings: ratingValues.length,
                        updatedAt: new Date()
                    };
                } else {
                    newRatingData = {
                        ratings: { [userId]: rating },
                        averageRating: rating,
                        totalRatings: 1,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                }

                // Update the rating document
                transaction.set(ratingRef, newRatingData);

                // Update the resource document with new average rating
                transaction.update(resourceRef, {
                    rating: newRatingData.averageRating,
                    ratingCount: newRatingData.totalRatings
                });
            });
        } catch (error) {
            console.error('Error in rating transaction:', error);
            throw error; // Re-throw to be handled by caller
        }
    }

    renderStars(container, averageRating, userRating) {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-interactive';

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star-rating';
            if (userRating && i <= userRating) {
                star.className += ' user-rated';
            } else if (i <= averageRating) {
                star.className += ' active';
            }
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
    }

    updateRatingDisplay(container, rating) {
        // Update stars
        container.querySelectorAll('.star-rating').forEach((star, index) => {
            const starRating = index + 1;
            star.classList.toggle('active', starRating <= rating);
        });

        // Update rating text and count
        const ratingCount = container.querySelector('.rating-count');
        if (ratingCount) {
            const count = parseInt(ratingCount.textContent.match(/\d+/) || 0);
            ratingCount.textContent = `(${count})`;
        }

        const ratingText = container.querySelector('.rating-text');
        if (ratingText) {
            ratingText.textContent = rating.toFixed(1);
        }
    }

    // Add enhanced styles
    static addStyles() {
        const styles = `
            .rating-container {
                position: relative;
                transition: transform 0.2s ease;
            }

            .rating-loading {
                opacity: 0.6;
                pointer-events: none;
            }

            .stars-interactive {
                display: inline-flex;
                gap: 2px;
                position: relative;
            }

            .star-rating {
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
            }

            .star-rating:hover {
                transform: scale(1.2);
            }

            .star-rating i {
                transition: color 0.2s ease;
            }

            .star-rating.active i,
            .star-rating.user-rated i {
                color: #ffd700;
            }

            .star-rating:hover ~ .star-rating i {
                color: #e4e5e9;
            }

            .stars-interactive:hover .star-rating i {
                color: #ffd700;
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
                z-index: 100;
            }

            @keyframes fadeOut {
                0% { opacity: 1; transform: translate(-50%, 0); }
                70% { opacity: 1; transform: translate(-50%, 0); }
                100% { opacity: 0; transform: translate(-50%, -10px); }
            }

            .rating-updated {
                animation: pulse 0.5s ease;
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
    }
}

// Add rating styles to document
Rating.addStyles();

// Export the Rating class
export default Rating;
