class AchievementWidgetPopup {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn('AchievementWidgetPopup: Container element not found');
            return;
        }

        this.config = {
            title: config.title || 'Achievement Unlocked! 🏆',
            score: {
                label: config.scoreLabel || 'Score',
                value: config.scoreValue || '0',
                unit: config.scoreUnit || ''
            },
            time: {
                show: config.showTime !== false,
                label: config.timeLabel || 'Time',
                value: config.timeValue || '0',
                unit: config.timeUnit || 's'
            },
            website: {
                name: config.websiteName || 'Our Website',
                url: config.websiteUrl || 'https://example.com'
            },
            colors: {
                primary: config.primaryColor || '#1a73e8',
                secondary: config.secondaryColor || '#34a853',
                background: config.backgroundColor || '#f0f2f5'
            },
            shareText: config.shareText || `Check out my achievement on ${config.websiteName || 'Our Website'}!`
        };

        this.render();
    }

    createStyles() {
        return `
            <style>
                .unique-widget-container {
                    font-family: 'Arial', sans-serif;
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 9999;
                    background-color: ${this.config.colors.background};
                    padding: 20px;
                    border-radius: 15px;
                    width: 100%;
                    max-width: 400px;
                    text-align: center;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                }
                .unique-widget-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 9998;
                }
                .unique-share-card h1 {
                    color: ${this.config.colors.primary};
                    margin-bottom: 10px;
                }
                .unique-achievement-value {
                    font-size: 48px;
                    font-weight: bold;
                    color: ${this.config.colors.secondary};
                    margin: 20px 0;
                }
                .unique-achievement-label {
                    font-size: 18px;
                    color: #5f6368;
                    margin-bottom: 5px;
                }
                .unique-time-value {
                    font-size: 24px;
                    color: #5f6368;
                    margin-bottom: 20px;
                }
                .unique-website-prompt {
                    font-size: 18px;
                    color: ${this.config.colors.primary};
                    margin-bottom: 20px;
                }
                .unique-share-btn {
                    background-color: ${this.config.colors.primary};
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                .unique-share-btn:hover {
                    opacity: 0.9;
                }
                @keyframes unique-confettiFall {
                    0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
                }
                .unique-confetti {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    opacity: 0;
                    animation: unique-confettiFall 3s linear forwards;
                }
            </style>
        `;
    }

    createConfetti() {
        const colors = [this.config.colors.primary, this.config.colors.secondary, '#fbbc05', '#ea4335'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'unique-confetti';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            document.body.appendChild(confetti);
            setTimeout(() => {
                if (confetti.parentNode) confetti.remove();
            }, 3000);
        }
    }

    shareAchievement() {
        this.createConfetti();
        const shareText = this.config.shareText;

        if (navigator.share) {
            navigator.share({
                title: this.config.title,
                text: shareText,
                url: this.config.website.url
            }).catch(err => {
                console.error('Sharing failed:', err);
                alert('Could not share achievement, please use the browser sharing options instead.');
            });
        } else {
            alert('Share this achievement:\n\n' + shareText);
        }
    }

    render() {
        if (!this.container) return;

        const timeSection = this.config.time.show ? `
            <div class="unique-time-value">
                ${this.config.time.label}: ${this.config.time.value}${this.config.time.unit}
            </div>
        ` : '';

        const widgetHTML = `
            ${this.createStyles()}
            <div class="unique-widget-overlay" onclick="widget.closePopup()"></div>
            <div class="unique-widget-container">
                <div class="unique-share-card">
                    <h1>${this.config.title}</h1>
                    <div class="unique-achievement-label">${this.config.score.label}</div>
                    <div class="unique-achievement-value">${this.config.score.value}${this.config.score.unit}</div>
                    ${timeSection}
                    <div class="unique-website-prompt">Try it yourself at ${this.config.website.name}!</div>
                </div>
                <button class="unique-share-btn" onclick="widget.shareAchievement()">Share Achievement! 🎉</button>
            </div>
        `;

        this.container.innerHTML = widgetHTML;
    }

    closePopup() {
        this.container.innerHTML = '';
    }
}
