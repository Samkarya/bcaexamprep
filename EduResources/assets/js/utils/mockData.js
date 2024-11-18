// assets/js/utils/mockData.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    getDocs,
    query, 
    orderBy, 
    limit, 
    startAfter,
    where,
    getCountFromServer,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-check.js";
import { firebaseConfig, showToast } from "https://samkarya.github.io/bcaexamprep/firebase/common-utils.js";

class FirebaseDataService {
    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.db = getFirestore(this.app);
        this.contents = [];
        this.lastDoc = null;
        this.isLoading = false;
        this.BATCH_SIZE = 50;
        this.totalDocuments = 0;
        this.hasMoreData = true;
        this.autoLoadingInterval = null;
        
        // Initialize App Check
        this.appCheck = initializeAppCheck(this.app, {
            provider: new ReCaptchaV3Provider('6LeER1AqAAAAABaic_YKxvN30vuPQPlMJfpS9e1L'),
            isTokenAutoRefreshEnabled: true
        });
    }

    async checkAuthStatus() {
        return new Promise((resolve) => {
            onAuthStateChanged(this.auth, (user) => {
                if (user) {
                    showToast("Authentication successful", "success");
                    resolve(true);
                } else {
                    showToast("Please Login To Access", "warning");
                    resolve(false);
                }
            });
        });
    }

    async getTotalDocuments() {
        try {
            const contentRef = collection(this.db, 'eduResources');
            const snapshot = await getCountFromServer(contentRef);
            this.totalDocuments = snapshot.data().count;
            return this.totalDocuments;
        } catch (error) {
            console.error('Error getting total documents:', error);
            return 0;
        }
    }

    async loadInitialData() {
        if (!(await this.checkAuthStatus())) return;

        try {
            // Get total document count first
            await this.getTotalDocuments();
            
            if (this.totalDocuments === 0) {
                showToast("No content available", "info");
                this.hasMoreData = false;
                return [];
            }

            const contentRef = collection(this.db, 'eduResources');
            const batchSize = Math.min(this.BATCH_SIZE, this.totalDocuments);
            const q = query(contentRef, orderBy('dateAdded', 'desc'), limit(batchSize));
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                this.hasMoreData = false;
                return [];
            }

// Get current user's bookmarks
            const userId = this.auth.currentUser.uid;
            const bookmarksRef = collection(this.db, 'bookmarks');
            const bookmarksQuery = query(bookmarksRef, where('userId', '==', userId));
            const bookmarksSnapshot = await getDocs(bookmarksQuery);
            // Create a map of bookmarked resource IDs
const bookmarkedResources = new Map();
bookmarksSnapshot.docs.forEach(doc => {
    if (doc.data().isBookmarked) {
        const resourceId = doc.data().resourceId;
        bookmarkedResources.set(resourceId, true);
        console.log(`Bookmarked resource added: ${resourceId}`); // Log each bookmarked resource ID added
    }
});

this.contents = snapshot.docs.map(doc => {
    const isBookmarked = bookmarkedResources.has(doc.id);
    console.log(`Processing content: ${doc.id}, isBookmarked: ${isBookmarked}`); // Log each content ID with its bookmark status
    return {
        id: doc.id,
        ...doc.data(),
        isBookmarked: isBookmarked
    };
});

            
            this.lastDoc = snapshot.docs[snapshot.docs.length - 1];
            
            // Check if we have more data to load
            this.hasMoreData = this.contents.length < this.totalDocuments;

            // Start auto-loading if we have more data
            if (this.hasMoreData) {
                this.setupAutoLoading();
            }

            return this.contents;
        } catch (error) {
            console.error('Error loading initial data:', error);
            showToast("Error loading data", "error");
            return [];
        }
    }

    async loadMoreData() {
        if (this.isLoading || !this.hasMoreData || !this.lastDoc) return;
        
        try {
            this.isLoading = true;
            const contentRef = collection(this.db, 'eduResources');
            
            // Calculate remaining documents
            const remainingDocs = this.totalDocuments - this.contents.length;
            
            if (remainingDocs <= 0) {
                this.hasMoreData = false;
                this.stopAutoLoading();
                return [];
            }

            // Adjust batch size for the last batch
            const adjustedBatchSize = Math.min(this.BATCH_SIZE, remainingDocs);
            
            const q = query(
                contentRef,
                orderBy('dateAdded', 'desc'),
                startAfter(this.lastDoc),
                limit(adjustedBatchSize)
            );
            
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                this.hasMoreData = false;
                this.stopAutoLoading();
                return [];
            }

            const newContents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.contents = [...this.contents, ...newContents];
            this.lastDoc = snapshot.docs[snapshot.docs.length - 1];
            
            // Update hasMoreData flag
            this.hasMoreData = this.contents.length < this.totalDocuments;
            
            if (!this.hasMoreData) {
                this.stopAutoLoading();
            }

            return newContents;
        } catch (error) {
            console.error('Error loading more data:', error);
            showToast("Error loading more data", "error");
            return [];
        } finally {
            this.isLoading = false;
        }
    }



    setupAutoLoading() {
        // Clear any existing interval
        this.stopAutoLoading();
        
        this.autoLoadingInterval = setInterval(async () => {
            if (document.visibilityState === 'visible' && this.hasMoreData) {
                await this.loadMoreData();
            }
        }, 60000); // 1 minute
    }

    stopAutoLoading() {
        if (this.autoLoadingInterval) {
            clearInterval(this.autoLoadingInterval);
            this.autoLoadingInterval = null;
        }
    }

    // Helper methods for content manipulation remain the same
    getTrendingContent() {
        return [...this.contents]
            .sort((a, b) => b.views - a.views)
            .slice(0, 6);
    }

    getPopularContent() {
        return [...this.contents]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 6);
    }

    getRecentContent() {
        return [...this.contents]
            .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
            .slice(0, 3);
    }

    async searchContent(query) {
        if (!query) return [];
        
        query = query.toLowerCase();
        return this.contents.filter(content => 
            content.title.toLowerCase().includes(query) ||
            content.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }

    filterByType(types) {
        return this.contents.filter(content => 
            types.includes(content.type)
        );
    }

    filterByTags(tags) {
        return this.contents.filter(content =>
            content.tags.some(tag => tags.includes(tag))
        );
    }

    filterByRating(minRating) {
        return this.contents.filter(content =>
            content.rating >= minRating
        );
    }

    // New helper methods for pagination status
    getLoadingStatus() {
        return {
            isLoading: this.isLoading,
            hasMoreData: this.hasMoreData,
            totalDocuments: this.totalDocuments,
            loadedDocuments: this.contents.length
        };
    }
    // New methods for rating system
    async rateResource(resourceId, rating) {
        try {
            if (!this.auth.currentUser) {
                showToast("Please login to rate", "warning");
                return false;
            }

            const userId = this.auth.currentUser.uid;
            const ratingRef = doc(this.db, 'eduResourcesRating', `${resourceId}_${userId}`);
            
            // Save the rating
            await setDoc(ratingRef, {
                resourceId,
                userId,
                rating,
                timestamp: serverTimestamp()
            });

            // Update the average rating and rating count
            await this.updateResourceRating(resourceId);
            
            showToast("Rating submitted successfully", "success");
            return true;
        } catch (error) {
            console.error('Error rating resource:', error);
            showToast("Error submitting rating", "error");
            return false;
        }
    }

    async updateResourceRating(resourceId) {
        try {
            // Get all ratings for this resource
            const ratingsRef = collection(this.db, 'eduResourcesRating');
            const q = query(ratingsRef, where('resourceId', '==', resourceId));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                // No ratings yet
                await updateDoc(doc(this.db, 'eduResources', resourceId), {
                    rating: 0,
                    ratingCount: 0
                });
                return;
            }

            // Calculate average rating
            let totalRating = 0;
            snapshot.docs.forEach(doc => {
                totalRating += doc.data().rating;
            });
            
            const averageRating = totalRating / snapshot.docs.length;
            const ratingCount = snapshot.docs.length;

            // Update the resource document
            await updateDoc(doc(this.db, 'eduResources', resourceId), {
                rating: averageRating,
                ratingCount: ratingCount
            });

            // Update local content if it exists
            const contentIndex = this.contents.findIndex(content => content.id === resourceId);
            if (contentIndex !== -1) {
                this.contents[contentIndex].rating = averageRating;
                this.contents[contentIndex].ratingCount = ratingCount;
            }
        } catch (error) {
            console.error('Error updating resource rating:', error);
            throw error;
        }
    }

    // Bookmark management
    async toggleBookmark(resourceId) {
        try {
            if (!this.auth.currentUser) {
                showToast("Please login to bookmark", "warning");
                return false;
            }

            const userId = this.auth.currentUser.uid;
            const bookmarkRef = doc(this.db, 'bookmarks', `${resourceId}_${userId}`);
            const bookmarkDoc = await getDoc(bookmarkRef);

            const isCurrentlyBookmarked = bookmarkDoc.exists() && bookmarkDoc.data().isBookmarked;
            
            await setDoc(bookmarkRef, {
                resourceId,
                userId,
                isBookmarked: !isCurrentlyBookmarked,
                updatedAt: serverTimestamp(),
                createdAt: bookmarkDoc.exists() ? bookmarkDoc.data().createdAt : serverTimestamp()
            });

            // Update local content
            const contentIndex = this.contents.findIndex(content => content.id === resourceId);
            if (contentIndex !== -1) {
                this.contents[contentIndex].isBookmarked = !isCurrentlyBookmarked;
            }

            showToast(
                !isCurrentlyBookmarked ? "Bookmark added" : "Bookmark removed",
                "success"
            );
            return true;
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            showToast("Error updating bookmark", "error");
            return false;
        }
    }

    async getUserRating(resourceId) {
        try {
            if (!this.auth.currentUser) return null;

            const userId = this.auth.currentUser.uid;
            const ratingRef = doc(this.db, 'eduResourcesRating', `${resourceId}_${userId}`);
            const ratingDoc = await getDoc(ratingRef);

            return ratingDoc.exists() ? ratingDoc.data().rating : null;
        } catch (error) {
            console.error('Error getting user rating:', error);
            return null;
        }
    }
}


const firebaseData = new FirebaseDataService();
export default firebaseData;
