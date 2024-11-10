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
    getCountFromServer 
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
            const contentRef = collection(this.db, 'contents');
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

            const contentRef = collection(this.db, 'contents');
            const batchSize = Math.min(this.BATCH_SIZE, this.totalDocuments);
            const q = query(contentRef, orderBy('dateAdded', 'desc'), limit(batchSize));
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                this.hasMoreData = false;
                return [];
            }

            this.contents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
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
            const contentRef = collection(this.db, 'contents');
            
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
}


const mockData = new FirebaseDataService();
//export default firebaseData;
