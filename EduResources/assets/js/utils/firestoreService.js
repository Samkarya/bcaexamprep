// utils/firestoreService.js
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, increment, updateDoc } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';

class FirestoreService {
    constructor() {
        this.db = getFirestore();
        this.auth = getAuth();
    }

    async toggleBookmark(resourceId) {
        try {
            const userId = this.auth.currentUser?.uid;
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const bookmarkRef = doc(this.db, 'bookmarks', `${userId}_${resourceId}`);
            const bookmarkDoc = await getDoc(bookmarkRef);

            if (bookmarkDoc.exists()) {
                // Remove bookmark
                await setDoc(bookmarkRef, {
                    userId,
                    resourceId,
                    isBookmarked: false,
                    updatedAt: new Date().toISOString()
                });
                return false;
            } else {
                // Add bookmark
                await setDoc(bookmarkRef, {
                    userId,
                    resourceId,
                    isBookmarked: true,
                    updatedAt: new Date().toISOString()
                });
                return true;
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            throw error;
        }
    }

    async incrementViews(resourceId) {
        try {
            const resourceRef = doc(this.db, 'eduResources', resourceId);
            const viewsRef = doc(this.db, 'resourceViews', resourceId);
            
            // Update view count in the main resource document
            await updateDoc(resourceRef, {
                views: increment(1)
            });

            // Log view details
            const userId = this.auth.currentUser?.uid || 'anonymous';
            await setDoc(doc(this.db, 'resourceViews', `${resourceId}_${Date.now()}`), {
                resourceId,
                userId,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error incrementing views:', error);
            throw error;
        }
    }

    async isBookmarked(resourceId) {
        try {
            const userId = this.auth.currentUser?.uid;
            if (!userId) return false;

            const bookmarkRef = doc(this.db, 'bookmarks', `${userId}_${resourceId}`);
            const bookmarkDoc = await getDoc(bookmarkRef);
            
            return bookmarkDoc.exists() && bookmarkDoc.data().isBookmarked;
        } catch (error) {
            console.error('Error checking bookmark status:', error);
            return false;
        }
    }

    async getUserBookmarks() {
        try {
            const userId = this.auth.currentUser?.uid;
            if (!userId) return [];

            const bookmarksQuery = query(
                collection(this.db, 'bookmarks'),
                where('userId', '==', userId),
                where('isBookmarked', '==', true)
            );

            const querySnapshot = await getDocs(bookmarksQuery);
            return querySnapshot.docs.map(doc => doc.data().resourceId);
        } catch (error) {
            console.error('Error fetching user bookmarks:', error);
            return [];
        }
    }
}

export default new FirestoreService();
