// assets/js/components/contentCard.js
import { 
    getFirestore, 
    doc,
    updateDoc, 
    increment,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp,
    orderBy
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

import { 
    getAuth 
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';

import firebaseData from 'https://samkarya.github.io/bcaexamprep/EduResources/assets/js/utils/mockData.js';
import {showToast } from "https://samkarya.github.io/bcaexamprep/firebase/common-utils.js";
class ContentCard {
    constructor(data) {
        this.data = data;
    }

    render() {
        const {
            id,
            title,
            type,
            thumbnail,
            tags,
            rating,
            ratingCount,
            url,
            dateAdded,
            isBookmarked
        } = this.data;

        return `
            <article class="content-card" data-id="${id}">
                <img 
                    src="${thumbnail}" 
                    alt="${title}" 
                    class="content-card-image"
                    onerror="this.src='https://samkarya.github.io/bcaexamprep/EduResources/assets/img/placeholder.jpg'"
                >
                <div class="content-card-body">
                    <span class="content-type-badge content-type-${type}">
                        <i class="${helpers.getTypeIcon(type)}"></i>
                        ${type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                    
                    <h3 class="content-card-title">${title}</h3>
                    
                    <div class="content-card-tags">
                        ${tags.map(tag => `
                            <span class="content-tag">${tag}</span>
                        `).join('')}
                    </div>
                    
                    <div class="rating-container">
                     ${helpers.renderStars(rating)}
                        <span class="rating-count">
                            (${helpers.formatNumber(ratingCount)})
                        </span>
                    </div>
                    
                    <div class="content-card-actions">
                        <button class="bookmark-btn" data-id="${id}">
                            <i class="fa${isBookmarked ? 's' : 'r'} fa-bookmark"></i>
                        </button>
                        <a href="${url}" class="view-btn" data-id="${id}" target="_blank" rel="noopener">
                            View Content
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

static init() {

    const auth = getAuth();
    const db = getFirestore();
    const bookmarksRef = collection(db, 'bookmarks');
    // Add event listeners for bookmark buttons
    document.addEventListener('click', async (e) => {  // Marked as async
        if (e.target.closest('.bookmark-btn')) {
            const btn = e.target.closest('.bookmark-btn');
            const contentId = btn.dataset.id;
            const icon = btn.querySelector('i');
            
            try {
                const user = auth.currentUser;
                if (!user) {
                    //console.error('User must be logged in to bookmark content');
                    showToast("User must be logged in to bookmark content", "info");
                    return;
                }
                
                // Query existing bookmark
                const q = query(
                    bookmarksRef,
                    where('userId', '==', user.uid),
                    where('resourceId', '==', contentId)
                );
                
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.empty) {
                    // Create new bookmark
                    await addDoc(bookmarksRef, {
                        userId: user.uid,
                        resourceId: contentId,
                        isBookmarked: true,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                    
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                } else {
                    // Toggle existing bookmark
                    const bookmarkDoc = querySnapshot.docs[0];
                    const currentState = bookmarkDoc.data().isBookmarked;
                    
                    await updateDoc(bookmarkDoc.ref, {
                        isBookmarked: !currentState,
                        updatedAt: serverTimestamp()
                    });
                    
                    if (currentState) {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                    } else {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                    }
                }
            } catch (error) {
                console.error('Error updating bookmark:', error);
                // Revert UI change if operation failed
                icon.classList.toggle('far');
                icon.classList.toggle('fas');
            }
        }
       if (e.target.closest('.view-btn')) {
    const btn = e.target.closest('.view-btn');
    const id = btn.dataset.id;
    
    // No need to check for auth.currentUser anymore
    const resourceRef = doc(db, 'eduResources', id);
    
    try {
        await updateDoc(resourceRef, {
            views: increment(1)
        });
    } catch (error) {
        console.error('Error updating view count:', error);
    }
}
        
    });
}
    // Helper method to check if content is bookmarked
static async isContentBookmarked(db, userId, contentId) {
    const bookmarksRef = collection(db, 'bookmarks');
    const q = query(
        bookmarksRef,
        where('userId', '==', userId),
        where('resourceId', '==', contentId),
        where('isBookmarked', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

// Helper method to get all bookmarked content for a user
static async getUserBookmarks(db, userId) {
    const bookmarksRef = collection(db, 'bookmarks');
    const q = query(
        bookmarksRef,
        where('userId', '==', userId),
        where('isBookmarked', '==', true),
        orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}
}
export default ContentCard;
