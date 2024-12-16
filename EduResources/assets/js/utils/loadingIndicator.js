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
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-screen-overlay';
        
        const content = `
            <div class="loading-content">
                <svg class="loading-scene" viewBox="0 0 200 200">
                    <!-- Orbiting planets -->
                    <circle class="planet-orbit" cx="100" cy="100" r="70" fill="none" stroke="#ffffff20" stroke-width="1"/>
                    <circle class="planet-orbit" cx="100" cy="100" r="50" fill="none" stroke="#ffffff20" stroke-width="1"/>
                    <circle class="planet-orbit" cx="100" cy="100" r="30" fill="none" stroke="#ffffff20" stroke-width="1"/>
                    
                    <!-- Planets -->
                    <circle class="planet planet-1" cx="170" cy="100" r="8" fill="#64B5F6"/>
                    <circle class="planet planet-2" cx="150" cy="100" r="6" fill="#81C784"/>
                    <circle class="planet planet-3" cx="130" cy="100" r="4" fill="#FFB74D"/>
                    
                    <!-- Center sun with pulse effect -->
                    <circle class="sun-core" cx="100" cy="100" r="15" fill="#FDD835"/>
                    <circle class="sun-pulse" cx="100" cy="100" r="15" fill="#FDD835"/>
                </svg>
                
                <div class="progress-container">
                    <svg class="progress-ring" viewBox="0 0 120 120">
                        <circle class="progress-ring-bg" cx="60" cy="60" r="54" />
                        <circle class="progress-ring-fill" cx="60" cy="60" r="54" />
                    </svg>
                    <div class="progress-text">0%</div>
                </div>
                
                <div class="loading-text">Loading resources...</div>
                <div class="loading-tips">
                    <span class="tip-text">Did you know? You can filter resources by rating!</span>
                </div>
            </div>
        `;
        
        this.overlay.innerHTML = content;
        document.body.appendChild(this.overlay);
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
                background: linear-gradient(135deg, #1a1f35 0%, #0f172a 100%);
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

            .loading-scene {
                width: 200px;
                height: 200px;
                margin-bottom: 2rem;
            }

            /* Planet orbits and animations */
            .planet-orbit {
                stroke-dasharray: 4 4;
            }

            .planet {
                transform-origin: 100px 100px;
            }

            .planet-1 {
                animation: orbit 8s linear infinite;
            }

            .planet-2 {
                animation: orbit 6s linear infinite;
            }

            .planet-3 {
                animation: orbit 4s linear infinite;
            }

            @keyframes orbit {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            /* Sun animations */
            .sun-core {
                filter: drop-shadow(0 0 8px #FDD835);
            }

            .sun-pulse {
                animation: pulse 2s ease-in-out infinite;
                opacity: 0.4;
            }

            @keyframes pulse {
                0% { transform: scale(1); opacity: 0.4; }
                50% { transform: scale(1.5); opacity: 0; }
                100% { transform: scale(1); opacity: 0.4; }
            }

            /* Progress ring styles */
            .progress-container {
                position: relative;
                width: 120px;
                height: 120px;
                margin: 0 auto 1rem;
            }

            .progress-ring {
                transform: rotate(-90deg);
            }

            .progress-ring-bg {
                fill: none;
                stroke: #ffffff20;
                stroke-width: 8px;
            }

            .progress-ring-fill {
                fill: none;
                stroke: #FDD835;
                stroke-width: 8px;
                stroke-linecap: round;
                stroke-dasharray: 339.292;
                stroke-dashoffset: 339.292;
                transition: stroke-dashoffset 0.3s ease;
            }

            .progress-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 1.25rem;
                font-weight: bold;
            }

            .loading-text {
                font-size: 1.25rem;
                margin: 1rem 0;
                min-height: 2rem;
                background: linear-gradient(90deg, #FDD835, #FFB74D);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: bold;
            }

            .loading-tips {
                font-size: 0.875rem;
                opacity: 0.7;
                max-width: 300px;
                margin: 0 auto;
            }

            .tip-text {
                display: inline-block;
                animation: fadeInOut 5s ease-in-out infinite;
            }

            @keyframes fadeInOut {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 1; }
            }

            .fade-out {
                opacity: 0;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    updateProgress(progress) {
        this.progress = Math.min(Math.max(progress, 0), 100);
        
        // Update circular progress
        const progressRing = this.overlay.querySelector('.progress-ring-fill');
        const circumference = 2 * Math.PI * 54; // 54 is the radius
        const offset = circumference - (this.progress / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;
        
        // Update percentage text
        const progressText = this.overlay.querySelector('.progress-text');
        progressText.textContent = `${Math.round(this.progress)}%`;
        
        // Update loading text
        const loadingText = this.overlay.querySelector('.loading-text');
        const textIndex = Math.floor((this.progress / 100) * this.loadingTexts.length);
        loadingText.textContent = this.loadingTexts[Math.min(textIndex, this.loadingTexts.length - 1)];
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
