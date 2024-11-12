// assets/js/components/contentCard.js
import firestoreService from 'https://samkarya.github.io/bcaexamprep/EduResources/assets/js/utils/firestoreService.js';

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
                        <a href="${url}" class="view-btn" data-id="${id}" target="_blank">
                            View Content
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    static async init() {
        // Add event listeners for bookmark buttons
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.bookmark-btn')) {
                try {
                    const btn = e.target.closest('.bookmark-btn');
                    const id = btn.dataset.id;
                    const icon = btn.querySelector('i');
                    
                    // Toggle bookmark in Firestore
                    const isBookmarked = await firestoreService.toggleBookmark(id);
                    
                    // Update UI
                    icon.classList.toggle('far', !isBookmarked);
                    icon.classList.toggle('fas', isBookmarked);
                } catch (error) {
                    console.error('Error handling bookmark:', error);
                    // You might want to show an error message to the user
                }
            }
            
            if (e.target.closest('.view-btn')) {
                try {
                    const btn = e.target.closest('.view-btn');
                    const id = btn.dataset.id;
                    
                    // Increment view count in Firestore
                    await firestoreService.incrementViews(id);
                } catch (error) {
                    console.error('Error handling view:', error);
                    // Silent fail for view counts
                }
            }
        });

        // Initialize bookmark states
        try {
            const bookmarkedIds = await firestoreService.getUserBookmarks();
            document.querySelectorAll('.bookmark-btn').forEach(btn => {
                const id = btn.dataset.id;
                const icon = btn.querySelector('i');
                if (bookmarkedIds.includes(id)) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                }
            });
        } catch (error) {
            console.error('Error initializing bookmark states:', error);
        }
    }
}

export default ContentCard;
