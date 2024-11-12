// assets/js/components/contentCard.js

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
                        
                    </div>
                    
                    <div class="content-card-actions">
                        <button class="bookmark-btn" data-id="${id}">
                            <i class="fa${isBookmarked ? 's' : 'r'} fa-bookmark"></i>
                        </button>
                        <a href="${url}" class="view-btn" target="_blank">
                            View Content
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    static init() {
        // Add event listeners for bookmark buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.bookmark-btn')) {
                const btn = e.target.closest('.bookmark-btn');
                const id = btn.dataset.id;
                const icon = btn.querySelector('i');
                
                // Toggle bookmark state
                icon.classList.toggle('far');
                icon.classList.toggle('fas');
                
                // In real implementation, this would update the database
                console.log(`Toggled bookmark for content ID: ${id}`);
            }
        });
    }
}
