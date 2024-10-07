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

    shareAchievement() {
    const shareText = this.config.shareText;
    const shareUrl = this.config.websiteUrl;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: this.config.title,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.error('Sharing failed:', err);
        this.fallbackToClipboard(shareText, shareUrl);
      }
    } else {
      this.fallbackToClipboard(shareText, shareUrl);
    }
  }

  fallbackToClipboard(shareText, shareUrl) {
    const fullText = `${shareText}\n${shareUrl}`;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(fullText)
        .then(() => {
          this.showCopiedMessage();
        })
        .catch(err => {
          console.error('Clipboard write failed:', err);
          this.showManualCopyMessage(fullText);
        });
    } else {
      this.fallbackCopyToClipboard(fullText);
    }
  }

  fallbackCopyToClipboard(text) {
    // Create temporary textarea
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      textArea.remove();
      this.showCopiedMessage();
    } catch (err) {
      console.error('Fallback clipboard copy failed:', err);
      textArea.remove();
      this.showManualCopyMessage(text);
    }
  }

  showCopiedMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.backgroundColor = '#4CAF50';
    messageDiv.style.color = 'white';
    messageDiv.style.padding = '10px 20px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.zIndex = '10000';
    messageDiv.textContent = 'Achievement copied to clipboard!';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }

  showManualCopyMessage(text) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '20px';
    modal.style.borderRadius = '5px';
    modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    modal.style.zIndex = '10000';
    
    modal.innerHTML = `
      <h3>Copy this text:</h3>
      <textarea readonly style="width: 100%; min-height: 100px; margin: 10px 0;">${text}</textarea>
      <button onclick="this.parentElement.remove()" style="padding: 5px 10px;">Close</button>
    `;
    
    document.body.appendChild(modal);
  }
}

