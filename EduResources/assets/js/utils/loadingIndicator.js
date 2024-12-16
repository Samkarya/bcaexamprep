// loadingIndicator.js

export class LoadingIndicator {
    constructor() {
        this.loadingIndicator = null;
        this.observer = null;
    }

    createLoadingIndicator(container) {
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.className = 'loading-indicator hidden';
        this.loadingIndicator.innerHTML = `
            <div class="loading-skeleton">
                <div class="skeleton-card">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-title"></div>
                        <div class="skeleton-tags">
                            <div class="skeleton-tag"></div>
                            <div class="skeleton-tag"></div>
                        </div>
                        <div class="skeleton-rating"></div>
                        <div class="skeleton-actions"></div>
                    </div>
                </div>
                <div class="skeleton-card">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-title"></div>
                        <div class="skeleton-tags">
                            <div class="skeleton-tag"></div>
                            <div class="skeleton-tag"></div>
                        </div>
                        <div class="skeleton-rating"></div>
                        <div class="skeleton-actions"></div>
                    </div>
                </div>
            </div>
            <div class="loading-spinner">Loading more content...</div>
        `;
        
        container.appendChild(this.loadingIndicator);
        this.addStyles();
    }

    addStyles() {
        const styles = `
            .loading-skeleton {
                display: grid;
                gap: 1rem;
                padding: 1rem;
            }

            .skeleton-card {
                display: flex;
                gap: 1rem;
                background: #fff;
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .skeleton-image {
                width: 120px;
                height: 120px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 4px;
            }

            .skeleton-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .skeleton-title {
                height: 24px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 4px;
            }

            .skeleton-tags {
                display: flex;
                gap: 0.5rem;
            }

            .skeleton-tag {
                width: 60px;
                height: 20px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 4px;
            }

            .skeleton-rating {
                height: 20px;
                width: 120px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 4px;
            }

            .skeleton-actions {
                height: 36px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 4px;
            }

            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            .loading-indicator.hidden {
                display: none;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    setupInfiniteScroll(callback) {
        this.observer = new IntersectionObserver(async (entries) => {
            if (entries[0].isIntersecting) {
                this.show();
                await callback();
                this.hide();
            }
        }, { threshold: 0.5 });

        this.observer.observe(this.loadingIndicator);
    }

    show() {
        this.loadingIndicator?.classList.remove('hidden');
    }

    hide() {
        this.loadingIndicator?.classList.add('hidden');
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.loadingIndicator?.remove();
    }
}
