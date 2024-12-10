// audioPlayer.js
class AudioPlayer {
    constructor() {
        this.audio = document.getElementById('audio-element');
        this.playPauseBtn = document.getElementById('play-pause');
        this.stopBtn = document.getElementById('stop');
        this.progressBar = document.getElementById('progress-bar');
        this.progress = document.getElementById('progress');
        this.timeDisplay = document.getElementById('time-display');
        this.volumeSlider = document.getElementById('volume');
        this.muteBtn = document.getElementById('mute');
        this.speedSelect = document.getElementById('playback-speed');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Play/Pause button
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        
        // Stop button
        this.stopBtn.addEventListener('click', () => this.stop());
        
        // Progress bar
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        
        // Time update
        this.audio.addEventListener('timeupdate', () => {
            this.updateProgress();
            this.updateTimeDisplay();
        });
        
        // Volume controls
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        
        // Playback speed
        this.speedSelect.addEventListener('change', (e) => this.setPlaybackSpeed(e.target.value));
        
        // Audio ended
        this.audio.addEventListener('ended', () => this.onEnded());
    }

    togglePlayPause() {
        if (this.audio.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    play() {
        this.audio.play();
        this.playPauseBtn.textContent = '⏸';
        this.playPauseBtn.setAttribute('aria-label', 'Pause');
    }

    pause() {
        this.audio.pause();
        this.playPauseBtn.textContent = '▶';
        this.playPauseBtn.setAttribute('aria-label', 'Play');
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.playPauseBtn.textContent = '▶';
        this.playPauseBtn.setAttribute('aria-label', 'Play');
    }

    seek(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.audio.currentTime = pos * this.audio.duration;
    }

    updateProgress() {
        if (this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.progress.style.width = `${progress}%`;
        }
    }

    updateTimeDisplay() {
        const current = this.formatTime(this.audio.currentTime);
        const duration = this.formatTime(this.audio.duration);
        this.timeDisplay.textContent = `${current} / ${duration}`;
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    setVolume(value) {
        this.audio.volume = value / 100;
        this.updateVolumeIcon();
    }

    toggleMute() {
        this.audio.muted = !this.audio.muted;
        this.updateVolumeIcon();
    }

    updateVolumeIcon() {
        const icon = this.audio.muted || this.audio.volume === 0 ? '🔇' : '🔊';
        this.muteBtn.textContent = icon;
    }

    setPlaybackSpeed(speed) {
        this.audio.playbackRate = parseFloat(speed);
    }

    onEnded() {
        this.playPauseBtn.textContent = '▶';
        this.playPauseBtn.setAttribute('aria-label', 'Play');
    }

    loadAudio(file) {
        const url = URL.createObjectURL(file);
        this.audio.src = url;
        this.audio.load();
    }
}

export default AudioPlayer;