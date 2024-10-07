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
                .unique-widget-popup {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 1000;
                    font-family: 'Arial', sans-serif;
                    background-color: ${this.config.colors.background};
                    border-radius: 10px;
                    padding: 20px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    display: none;
                }
                .unique-share-card-popup {
                    position: relative;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    margin-bottom: 20px;
                    width: 100%;
                    max-width: 400px;
                }
                .unique-close-button-popup {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    font-size: 24px;
                    color: #5f6368;
                    cursor: pointer;
                    background: none;
                    border: none;
                    padding: 0;
                    line-height: 1;
                }
                .unique-close-button-popup:hover {
                    color: #000;
                }
                .unique-achievement-title-popup {
                    font-size: 24px;
                    color: ${this.config.colors.primary};
                    margin-bottom: 10px;
                }
                .unique-achievement-value-popup {
                    font-size: 48px;
                    font-weight: bold;
                    color: ${this.config.colors.secondary};
                    margin: 20px 0;
                }
                .unique-achievement-label-popup {
                    font-size: 18px;
                    color: #5f6368;
                }
                .unique-time-value-popup {
                    font-size: 24px;
                    color: #5f6368;
                    margin-bottom: 20px;
                }
                .unique-website-prompt-popup {
                    font-size: 18px;
                    color: ${this.config.colors.primary};
                    margin-bottom: 20px;
                }
                .unique-share-btn-popup {
                    background-color: ${this.config.colors.primary};
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    font-size: 16px;
                    cursor: pointer;
                }
            </style>
        `;
    }

    showPopup() {
        this.container.style.display = 'block';
    }

    hidePopup() {
        this.container.style.display = 'none';
    }

    render() {
        const timeSection = this.config.time.show ? `
            <div class="unique-time-value-popup">
                ${this.config.time.label}: ${this.config.time.value}${this.config.time.unit}
            </div>
        ` : '';

        const widgetHTML = `
            ${this.createStyles()}
            <div class="unique-share-card-popup">
                <button class="unique-close-button-popup" onclick="widgetPopup.hidePopup()">×</button>
                <h1 class="unique-achievement-title-popup">${this.config.title}</h1>
                <div class="unique-achievement-label-popup">${this.config.score.label}</div>
                <div class="unique-achievement-value-popup">${this.config.score.value}${this.config.score.unit}</div>
                ${timeSection}
                <div class="unique-website-prompt-popup">Check it out at ${this.config.website.name}!</div>
                <button class="unique-share-btn-popup" onclick="widgetPopup.shareAchievement()">Share Achievement! 🎉</button>
            </div>
        `;

        this.container.innerHTML = widgetHTML;
    }

        isMobileDevice() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    shareAchievement() {
      const shareText = this.config.shareText;
      const shareUrl = this.config.websiteUrl;

      if (this.isMobileDevice() && navigator.share) {
        try {
          navigator.share({
            title: this.config.title,
            text: shareText,
            url: shareUrl
          });
        } catch (error) {
          console.warn('Native sharing failed, falling back to clipboard:', error);
          this.fallbackToClipboard(shareText, url);
        }
      } else {
        this.fallbackToClipboard(shareText, url);
      }
    }

    fallbackToClipboard(text, url) {
        const combinedText = `${text}\n${url}`;
      const textArea = document.createElement('textarea');
      textArea.value = combinedText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        const msg = successful ? 'Achievement copied to clipboard!' : 'Failed to copy achievement';
        alert(msg);
      } catch (err) {
        console.error('Failed to copy text:', err);
        alert('Could not copy achievement. Text:\n\n' + text);
      }

      document.body.removeChild(textArea);
    }
  }


