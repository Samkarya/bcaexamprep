// assets/js/components/rating.js
import { getFirestore, doc, collection, addDoc, updateDoc, query, where, getDocs, runTransaction } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { showToast } from "https://samkarya.github.io/bcaexamprep/firebase/common-utils.js";

class Rating {
    constructor() {
        this.db = getFirestore();
        this.auth = getAuth();
        this.ratings = new Map(); // Store user ratings
        this.userRatings = new Map(); // Store user's previous ratings
        this.init();
    }

    init() {
        // Add event delegation for rating stars
        document.addEventListener('click', (e) => {
            const ratingContainer = e.target.closest('.rating-container');
            if (!ratingContainer) return;

            const starElement = e.target.closest('.star-rating');
            if (!starElement) return;

            const contentId = ratingContainer.closest('.content-card').dataset.id;
            const rating = parseInt(starElement.dataset.rating);

            this.handleRating(contentId, rating, ratingContainer);
        });

        // Initialize all rating containers
        this.initializeRatingContainers();
         this.loadUserRatings();
    }
      async loadUserRatings() {
        if (!this.auth.currentUser) return;

        try {
            const userRatingsQuery = query(
                collection(this.db, 'eduResources'),
                where('userId', '==', this.auth.currentUser.uid)
            );
            
            const snapshot = await getDocs(userRatingsQuery);
            snapshot.forEach(doc => {
                this.userRatings.set(doc.id, doc.data().rating);
            });
        } catch (error) {
            console.error('Error loading user ratings:', error);
            showToast('Error loading your ratings', 'error');
        }
    }


     async handleRating(contentId, rating, container) {
        if (!this.auth.currentUser) {
            showToast('Please login to rate content', 'warning');
            return;
        }

        if (rating < 1 || rating > 5) {
            showToast('Invalid rating value', 'error');
            return;
        }

        try {
            // Start loading state
            container.classList.add('rating-loading');
            
            const resourceRef = doc(this.db, 'eduResources', contentId);
            const ratingRef = collection(resourceRef, 'ratings');
            
            // Use transaction to ensure atomic updates
            await runTransaction(this.db, async (transaction) => {
                // Check if user has already rated
                const userRatingQuery = query(
                    ratingRef,
                    where('userId', '==', this.auth.currentUser.uid)
                );
                const userRatingSnapshot = await getDocs(userRatingQuery);
                
                if (userRatingSnapshot.empty) {
                    // Create new rating
                    await addDoc(ratingRef, {
                        userId: this.auth.currentUser.uid,
                        rating: rating,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    // Update existing rating
                    const userRatingDoc = userRatingSnapshot.docs[0];
                    await updateDoc(doc(ratingRef, userRatingDoc.id), {
                        rating: rating,
                        timestamp: new Date().toISOString()
                    });
                }

                // Update average rating in resource document
                const ratingsSnapshot = await getDocs(ratingRef);
                const ratings = ratingsSnapshot.docs.map(doc => doc.data().rating);
                const averageRating = Rating.calculateAverageRating(ratings);
                
                await updateDoc(resourceRef, {
                    averageRating: averageRating,
                    totalRatings: ratingsSnapshot.size
                });

                // Store in local cache
                this.ratings.set(contentId, averageRating);
                this.userRatings.set(contentId, rating);

                // Update UI
                this.updateRatingDisplay(container, averageRating);
                this.animateRating(container);
                this.showThankYouMessage(container);

                // Show success message
                showToast('Rating submitted successfully', 'success');
            });

        } catch (error) {
            console.error('Error updating rating:', error);
            showToast('Error submitting rating', 'error');
        } finally {
            // Remove loading state
            container.classList.remove('rating-loading');
        }
    }

    
     async initializeRatingContainers() {
        const containers = document.querySelectorAll('.rating-container');
        
        for (const container of containers) {
            const contentId = container.closest('.content-card').dataset.id;
            
            try {
                const resourceRef = doc(this.db, 'eduResources', contentId);
                const ratingRef = collection(resourceRef, 'ratings');
                const ratingsSnapshot = await getDocs(ratingRef);
                
                const ratings = ratingsSnapshot.docs.map(doc => doc.data().rating);
                const averageRating = Rating.calculateAverageRating(ratings);
                
                // Store average rating
                this.ratings.set(contentId, averageRating);
                
                // Render initial state
                this.renderStars(container, averageRating);
                this.updateRatingDisplay(container, averageRating);
                
                // If user has rated, highlight their rating
                const userRating = this.userRatings.get(contentId);
                if (userRating) {
                    this.highlightUserRating(container, userRating);
                }
                
            } catch (error) {
                console.error('Error initializing rating container:', error);
                showToast('Error loading ratings', 'error');
            }
        }
    }
    renderStars(container, rating) {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-interactive';

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star-rating' + (i <= rating ? ' active' : '');
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

      highlightUserRating(container, rating) {
        container.querySelectorAll('.star-rating').forEach((star, index) => {
            if (index < rating) {
                star.classList.add('user-rated');
            }
        });
    }
    updateRatingDisplay(container, rating) {
        // Update stars
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
        
        // Remove message after animation
        setTimeout(() => {
            message.remove();
        }, 2000);
    }

    // Static method to calculate average rating
    static calculateAverageRating(ratings) {
        if (!ratings || ratings.length === 0) return 0;
        
        const sum = ratings.reduce((acc, curr) => acc + curr, 0);
        return (sum / ratings.length).toFixed(1);
    }

    // Add CSS styles for rating animations
    static addStyles() {
        const styles = `
        .rating-loading {
                opacity: 0.6;
                pointer-events: none;
            }

            .star-rating.user-rated i {
                color: #ffa500;
            }

            /* Add loading spinner */
            .rating-loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 20px;
                height: 20px;
                border: 2px solid #f3f3f3;
                border-top: 2px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
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
export default Rating;
