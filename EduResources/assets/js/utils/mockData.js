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
    
    // JavaScript/TypeScript
async checkAuthStatus() {
    return new Promise((resolve) => {
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                showToast("Authentication successful", "success");
                resolve(true);
            } else {
                showToast("Please Login To Access", "warning");
                /*// Show login message in trending section
                const trendingSection = document.querySelector('.trending-section');
                if (trendingSection) {
                    const loginMessage = document.createElement('div');
                    loginMessage.className = 'login-message';
                    loginMessage.innerHTML = `
                        <div class="auth-warning">
                            <p>Please login to access content</p>
                            <a href="https://bcaexamprep.blogspot.com/p/bca-exam-prep-account.html" 
                               class="signup-btn">Sign Up</a>
                        </div>
                    `;
                    trendingSection.insertBefore(loginMessage, trendingSection.firstChild);
                }*/
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
    try {
        // Get total document count first
        await this.getTotalDocuments();
        
        if (this.totalDocuments === 0) {
            showToast("No content available", "info");
            this.hasMoreData = false;
            return [];
        }

        // Load educational resources (available to all users)
        const contentRef = collection(this.db, 'eduResources');
        const batchSize = Math.min(this.BATCH_SIZE, this.totalDocuments);
        const q = query(contentRef, orderBy('dateAdded', 'desc'), limit(batchSize));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            this.hasMoreData = false;
            return [];
        }

        // Initialize contents with educational resources
        this.contents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            isBookmarked: false  // Default to false, will update if user is authenticated
        }));

        // Check if user is authenticated before fetching bookmarks
        const isAuthenticated = await this.checkAuthStatus();
        
        if (isAuthenticated && this.auth.currentUser) {
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
                }
            });

            // Update contents with bookmark information
            this.contents = this.contents.map(content => ({
                ...content,
                isBookmarked: bookmarkedResources.has(content.id)
            }));
        }
        
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
    
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    if (searchTerms.length === 0) return [];

    // Helper function to calculate term frequency
    const calculateTermFrequency = (text, term) => {
        const regex = new RegExp(term, 'gi');
        const matches = text.match(regex);
        return matches ? matches.length : 0;
    };

    // Helper function to calculate word similarity
    const calculateSimilarity = (str1, str2) => {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));

        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }

        return 1 - (matrix[len1][len2] / Math.max(len1, len2));
    };

    // Search results with scoring
    const searchResults = this.contents.map(content => {
        let score = 0;
        const matchDetails = {
            titleMatches: [],
            tagMatches: [],
            descriptionMatches: [],
            partialMatches: []
        };

        // Convert content fields to searchable text
        const contentText = {
            title: content.title.toLowerCase(),
            tags: content.tags.map(tag => tag.toLowerCase())
        };

        // Score exact matches in title (highest weight)
        searchTerms.forEach(term => {
            if (contentText.title.includes(term)) {
                score += 10;
                matchDetails.titleMatches.push(term);
            }
            
            // Score tag matches (high weight)
            const matchingTags = contentText.tags.filter(tag => tag.includes(term));
            if (matchingTags.length > 0) {
                score += 5 * matchingTags.length;
                matchDetails.tagMatches.push(...matchingTags);
            }

            // Score partial matches using similarity (lower weight)
            const words = [...contentText.title.split(/\s+/), ...contentText.tags];
            words.forEach(word => {
                const similarity = calculateSimilarity(term, word);
                if (similarity > 0.8 && similarity < 1) {  // High similarity but not exact match
                    score += similarity * 2;
                    matchDetails.partialMatches.push({ term, match: word, similarity });
                }
            });

            // Add term frequency bonus
            score += calculateTermFrequency(contentText.title, term) * 0.5;
            score += calculateTermFrequency(contentText.description || '', term) * 0.2;
        });

        // Boost score based on content metadata
        if (content.rating) score *= (1 + content.rating / 10);  // Boost highly rated content
        if (content.views) score *= (1 + Math.log10(content.views) / 10);  // Boost popular content

        return {
            content,
            score,
            matchDetails
        };
    });

    // Filter out zero-score results and sort by score
    const filteredResults = searchResults
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score);

    // Return the top results with their contents
    return filteredResults.map(result => ({
        ...result.content,
        searchScore: result.score,
        matchDetails: result.matchDetails
    }));
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
