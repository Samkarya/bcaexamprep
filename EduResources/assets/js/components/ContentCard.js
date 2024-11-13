import { getFirestore, doc, setDoc, deleteDoc, getDoc, updateDoc, increment } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';

class ContentCard {
    constructor(data) {
        this.data = data;
        this.db = getFirestore();
        this.auth = getAuth();
    }
    return true;
    /*async checkBookmarkStatus(contentId) {
        if (!this.auth.currentUser) return false;
        
        try {
            const bookmarkRef = doc(this.db, 'users', this.auth.currentUser.uid, 'bookmarks', contentId);
            const bookmarkDoc = await getDoc(bookmarkRef);
            return bookmarkDoc.exists();
        } catch (error) {
            console.error('Error checking bookmark status:', error);
            return false;
        }
    }

    async toggleBookmark(contentId) {
        if (!this.auth.currentUser) {
            this.showMessage('Please login to bookmark content', 'error');
            return false;
        }

        try {
            const bookmarkRef = doc(this.db, 'users', this.auth.currentUser.uid, 'bookmarks', contentId);
            const bookmarkExists = await this.checkBookmarkStatus(contentId);

            if (bookmarkExists) {
                await deleteDoc(bookmarkRef);
                this.showMessage('Bookmark removed', 'success');
                return false;
            } else {
                await setDoc(bookmarkRef, {
                    contentId: contentId,
                    dateAdded: new Date().toISOString(),
                    title: this.data.title,
                    type: this.data.type,
                    url: this.data.url
                });
                this.showMessage('Bookmark added', 'success');
                return true;
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            this.showMessage('Error updating bookmark', 'error');
            return null;
        }*/
    }

    async incrementViews(contentId) {
        if (!this.auth.currentUser) return;

        try {
            const viewsRef = doc(this.db, 'eduResources', contentId, 'views', 'counter');
            
            // Try to update existing counter
            try {
                await updateDoc(viewsRef, {
                    count: increment(1),
                    lastViewed: new Date().toISOString()
                });
            } catch (error) {
                // If document doesn't exist, create it
                await setDoc(viewsRef, {
                    count: 1,
                    lastViewed: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error updating view count:', error);
        }
    }

    showMessage(message, type = 'success') {
        const container = document.querySelector(`.content-card[data-id="${this.data.id}"]`);
        const messageElement = document.createElement('div');
        messageElement.className = `card-message ${type}`;
        messageElement.textContent = message;
        
        container.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.remove();
        }, 2000);
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
                        <a href="${url}" class="view-btn" data-id="${id}" target="_blank">
                            View Content
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    static addStyles() {
        const styles = `
            .content-card {
                position: relative;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: transform 0.2s ease;
            }

            .card-message {
                position: absolute;
                top: 8px;
                right: 8px;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 14px;
                animation: fadeOut 2s ease forwards;
                z-index: 100;
            }

            .card-message.success {
                background: rgba(0, 128, 0, 0.8);
                color: white;
            }

            .card-message.error {
                background: rgba(255, 0, 0, 0.8);
                color: white;
            }

            @keyframes fadeOut {
                0% { opacity: 1; }
                70% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    static init() {
        const card = new ContentCard({});
        
        // Add event listeners for bookmark buttons
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.bookmark-btn')) {
                const btn = e.target.closest('.bookmark-btn');
                const id = btn.dataset.id;
                const icon = btn.querySelector('i');
                
                const isBookmarked = await card.toggleBookmark(id);
                if (isBookmarked !== null) {
                    icon.classList.toggle('far', !isBookmarked);
                    icon.classList.toggle('fas', isBookmarked);
                }
            }
            
            if (e.target.closest('.view-btn')) {
                const btn = e.target.closest('.view-btn');
                const id = btn.dataset.id;
                
                await card.incrementViews(id);
            }
        });
    }
}

export default ContentCard;
