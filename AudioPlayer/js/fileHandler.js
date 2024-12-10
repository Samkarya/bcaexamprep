// fileHandler.js
class FileHandler {
    constructor(audioPlayer, transcriptionManager) {
        this.audioPlayer = audioPlayer;
        this.transcriptionManager = transcriptionManager;
        
        this.audioInput = document.getElementById('audio-upload');
        this.transcriptionInput = document.getElementById('transcription-upload');
        this.downloadBtn = document.getElementById('download-transcription');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.audioInput.addEventListener('change', (e) => this.handleAudioUpload(e));
        this.transcriptionInput.addEventListener('change', (e) => this.handleTranscriptionUpload(e));
        this.downloadBtn.addEventListener('click', () => this.handleDownload());
    }

    handleAudioUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('audio/')) {
            this.audioPlayer.loadAudio(file);
        } else {
            alert('Please upload a valid audio file');
        }
    }

    handleTranscriptionUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const extension = file.name.split('.').pop().toLowerCase();
            if (['json', 'vtt', 'srt'].includes(extension)) {
                this.transcriptionManager.loadTranscription(file);
            } else {
                alert('Please upload a valid transcription file (JSON, VTT, or SRT)');
            }
        }
    }

    handleDownload() {
        const format = 'txt'; // Could be made configurable
        this.transcriptionManager.downloadTranscription(format);
    }
}

export default FileHandler;