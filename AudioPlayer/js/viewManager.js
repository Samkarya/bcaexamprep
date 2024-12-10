// viewManager.js
class ViewManager {
    constructor() {
        this.singleLineView = document.getElementById('single-line-view');
        this.fullArticleView = document.getElementById('full-article-view');
        this.toggleViewBtn = document.getElementById('toggle-view');
        this.toggleThemeBtn = document.getElementById('toggle-theme');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.toggleViewBtn.addEventListener('click', () => this.toggleView());
        this.toggleThemeBtn.addEventListener('click', () => this.toggleTheme());
    }

    toggleView() {
        this.singleLineView.classList.toggle('active');
        this.fullArticleView.classList.toggle('active');
        
        const isFullView = this.fullArticleView.classList.contains('active');
        this.toggleViewBtn.textContent = isFullView ? 'Show Single Line' : 'Show Full Article';
    }

    toggleTheme() {
        const body = document.body;
        const isDark = body.getAttribute('data-theme') === 'dark';
        
        body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        this.toggleThemeBtn.textContent = isDark ? 'Dark Mode' : 'Light Mode';
    }

    setView(view) {
        const isSingleLine = view === 'single';
        this.singleLineView.classList.toggle('active', isSingleLine);
        this.fullArticleView.classList.toggle('active', !isSingleLine);
        this.toggleViewBtn.textContent = isSingleLine ? 'Show Full Article' : 'Show Single Line';
    }
}

export default ViewManager;