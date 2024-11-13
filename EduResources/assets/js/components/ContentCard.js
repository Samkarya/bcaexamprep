// assets/js/components/contentCard.js
import { getFirestore, doc,updateDoc, increment } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
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
                        <a href="${url}" class="view-btn" data-id="${id}">
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
    // Add event listeners for bookmark buttons
    document.addEventListener('click', async (e) => {  // Marked as async
        if (e.target.closest('.bookmark-btn')) {
            const btn = e.target.closest('.bookmark-btn');
            const contentId = btn.dataset.id;
            const icon = btn.querySelector('i');
            
            try {
                const user = auth.currentUser;
                if (!user) {
                    console.error('User must be logged in to bookmark content');
                    return;
                }
                
                // Query existing bookmark
                const q = query(
                    bookmarksRef,
                    where('userId', '==', user.uid),
                    where('contentId', '==', contentId)
                );
                
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.empty) {
                    // Create new bookmark
                    await addDoc(bookmarksRef, {
                        userId: user.uid,
                        contentId: contentId,
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

           if (auth.currentUser) {
  const resourceRef = doc(db, 'eduResources', id);
  await updateDoc(resourceRef, { views: increment(1) }); 
}
             console.log(`View content ID: ${id}`);
        }
        
    });
}
}
export default ContentCard;
