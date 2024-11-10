// assets/js/main.js
// Firebase App Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-check.js";
import {firebaseConfig, showToast} from "https://samkarya.github.io/bcaexamprep/firebase/common-utils.js";
// Firebase configuration

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize App Check
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LeER1AqAAAAABaic_YKxvN30vuPQPlMJfpS9e1L'),
    isTokenAutoRefreshEnabled: true
});
// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize content cards
    ContentCard.init();

    // Initialize search
    new Search();
    initializeApp1();
    // Load initial content
    //loadInitialContent();

    // Initialize filters
    initializeFilters();
});
async function initializeApp1() {
    await checkAuthStatus();
    await loadResources();
}
function checkAuthStatus() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                showToast("Authentication successful", "success");
                loadRE
                resolve(true);
            } else {
                
                showToast("Please Login To Aceess", "warning");
                resolve(false);
            }
        });
    });
}
// Load Resources
async function loadResources() {
    try {
        const resourcesCollection = collection(db, 'eduResources');
        const snapshot = await getDocs(resourcesCollection);
        resources = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderResources(resources);
    } catch (error) {
        console.error('Error loading resources:', error);
        showToast('Error loading resources', 'error');
    }
}

async function renderResources(resources) {
    try {
        // Get container elements
        const trendingContent = document.getElementById('trendingContent');
        const recentContent = document.getElementById('recentContent');
        
        if (!resources || !resources.length) {
            const noContentMessage = '<p class="no-content">No resources available</p>';
            if (trendingContent) trendingContent.innerHTML = noContentMessage;
            if (recentContent) recentContent.innerHTML = noContentMessage;
            return;
        }

        // Sort resources by date for recent content
        const sortedByDate = [...resources].sort((a, b) => 
            new Date(b.dateAdded) - new Date(a.dateAdded)
        );

        // Sort resources by rating for trending content
        const sortedByRating = [...resources].sort((a, b) => 
            (b.rating || 0) - (a.rating || 0)
        );

        // Take top 6 items for each section
        const recentResources = sortedByDate.slice(0, 3);
        const trendingResources = sortedByRating.slice(0, 6);

        // Render recent resources
        if (recentContent) {
            recentContent.innerHTML = recentResources
                .map(resource => new ContentCard(resource).render())
                .join('');
        }

        // Render all resources (or trending, depending on your needs)
        if (trendingContent) {
            trendingContent.innerHTML = trendingResources
                .map(resource => new ContentCard(resource).render())
                .join('');
        }

        // Initialize event listeners
        ResourceCard.init();

    } catch (error) {
        console.error('Error rendering resources:', error);
        showToast('Error displaying resources', 'error');
    }
}


function loadInitialContent() {
    // Load trending content
    const trendingContent = document.getElementById('trendingContent');
    trendingContent.innerHTML = mockData.getTrendingContent()
        .map(content => new ContentCard(content).render())
        .join('');

    // Load recent content
    const recentContent = document.getElementById('recentContent');
    recentContent.innerHTML = mockData.getRecentContent()
        .map(content => new ContentCard(content).render())
        .join('');
}

function initializeFilters() {
    // Get all filter checkboxes
    const typeFilters = document.querySelectorAll('.filter-group input[type="checkbox"]');
    const ratingSlider = document.querySelector('.rating-slider');
    
    // Add event listeners to filters
    typeFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });

    ratingSlider.addEventListener('input', (e) => {
        // Update rating display
        const ratingValue = document.querySelector('.rating-value');
        ratingValue.textContent = `${e.target.value}+ Stars`;
        
        // Apply filters
        applyFilters();
    });
}

function applyFilters() {
    // Get selected content types
    const selectedTypes = Array.from(
        document.querySelectorAll('.filter-group input[type="checkbox"]:checked')
    ).map(checkbox => checkbox.value);

    // Get minimum rating
    const minRating = parseFloat(
        document.querySelector('.rating-slider').value
    );

    // Filter content
    let filteredContent = mockData.contents;

    if (selectedTypes.length > 0) {
        filteredContent = mockData.filterByType(selectedTypes);
    }

    filteredContent = mockData.filterByRating(minRating);

    // Update content grid
    const contentGrid = document.querySelector('.content-grid');
    contentGrid.innerHTML = filteredContent
        .map(content => new ContentCard(content).render())
        .join('');
}

// Add authentication modal handlers
document.getElementById('loginBtn').addEventListener('click', () => {
    alert('Login functionality will be implemented with Firebase Auth');
});

document.getElementById('signupBtn').addEventListener('click', () => {
    alert('Signup functionality will be implemented with Firebase Auth');
});
