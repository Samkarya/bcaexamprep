// assets/js/utils/loadingScreen.js
export class LoadingScreen {
    constructor() {
        this.overlay = null;
        this.progress = 0;
        this.loadingTexts = [
            "Preparing your resources...",
            "Loading content...",
            "Almost there...",
            "Setting things up...",
            "Just a moment..."
        ];
        this.init();
    }

    init() {
        // Create overlay container
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-screen-overlay';
        
        // Create loading content
        const content = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="loading-text">Loading resources...</div>
                <div class="loading-tips">Did you know? You can filter resources by rating!</div>
            </div>
        `;
        
        this.overlay.innerHTML = content;
        document.body.appendChild(this.overlay);
        
        // Add styles
        this.addStyles();
    }

    addStyles() {
        const styles = `
            .loading-screen-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(15, 23, 42, 0.98);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .loading-content {
                text-align: center;
                color: white;
                padding: 2rem;
            }

            .loading-spinner {
                width: 60px;
                height: 60px;
                border: 5px solid #ffffff33;
                border-top: 5px solid #fff;
                border-radius: 50%;
                margin: 0 auto 2rem;
                animation: spin 1s linear infinite;
            }

            .loading-progress-bar {
                width: 300px;
                height: 4px;
                background: #ffffff33;
                border-radius: 4px;
                margin: 1rem auto;
                overflow: hidden;
            }

            .progress-fill {
                width: 0%;
                height: 100%;
                background: #fff;
                border-radius: 4px;
                transition: width 0.3s ease;
            }

            .loading-text {
                font-size: 1.25rem;
                margin-bottom: 1rem;
                min-height: 2rem;
            }

            .loading-tips {
                font-size: 0.875rem;
                opacity: 0.7;
                max-width: 300px;
                margin: 0 auto;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .fade-out {
                opacity: 0;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    show() {
        this.overlay.style.opacity = '1';
        this.startLoadingAnimation();
    }

    hide() {
        this.overlay.classList.add('fade-out');
        setTimeout(() => {
            this.overlay.remove();
        }, 300);
    }

    updateProgress(progress) {
        this.progress = Math.min(Math.max(progress, 0), 100);
        const progressBar = this.overlay.querySelector('.progress-fill');
        progressBar.style.width = `${this.progress}%`;
        
        // Update loading text based on progress
        const loadingText = this.overlay.querySelector('.loading-text');
        const textIndex = Math.floor((this.progress / 100) * this.loadingTexts.length);
        loadingText.textContent = this.loadingTexts[Math.min(textIndex, this.loadingTexts.length - 1)];
    }

    startLoadingAnimation() {
        let progress = 0;
        const animate = () => {
            if (progress < 90) {
                progress += Math.random() * 15;
                this.updateProgress(progress);
                this.animationFrame = requestAnimationFrame(animate);
            }
        };
        animate();
    }

    completeLoading() {
        this.updateProgress(100);
        setTimeout(() => this.hide(), 500);
    }
}
