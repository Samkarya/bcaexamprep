// app.js
import AudioPlayer from './audioPlayer.js';
import TranscriptionManager from './transcriptionManager.js';
import ViewManager from './viewManager.js';
import FileHandler from './fileHandler.js';

class App {
    constructor() {
        // Initialize components
        this.audioPlayer = new AudioPlayer();
        this.transcriptionManager = new TranscriptionManager(this.audioPlayer);
        this.viewManager = new ViewManager();
        this.fileHandler = new FileHandler(this.audioPlayer, this.transcriptionManager);

        // Initialize search functionality
        this.searchInput = document.getElementById('search-input');
        this.searchButton = document.getElementById('search-button');
        
        this.initializeSearch();
    }

    initializeSearch() {
        const handleSearch = () => {
            const searchTerm = this.searchInput.value.trim();
            if (searchTerm) {
                const results = this.transcriptionManager.searchTranscription(searchTerm);
                if (results.length > 0) {
                    // Jump to first result
                    this.transcriptionManager.jumpToTime(results[0].time);
                    // Switch to full article view to show context
                    this.viewManager.setView('full');
                } else {
                    alert('No matches found');
                }
            }
        };

        this.searchButton.addEventListener('click', handleSearch);
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new App();
});