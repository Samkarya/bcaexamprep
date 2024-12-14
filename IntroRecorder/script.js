// Constants for configuration
const CONFIG = {
    VIDEO: {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000
    },
    AUDIO: {
        fftSize: 256,
        barCount: 50
    },
    SCROLL: {
        minSpeed: 50,
        maxSpeed: 150
    }
};

// Utility functions
const Utils = {
    formatTimestamp() {
        return new Date().toISOString().replace(/[:.]/g, '-');
    },

    createDownloadLink(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    },

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// MediaManager handles all media-related operations
class MediaManager {
    constructor() {
        this.stream = null;
        this.audioContext = null;
        this.analyser = null;
    }

    async checkDeviceAvailability() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const deviceStatus = {
            hasCamera: devices.some(device => device.kind === 'videoinput'),
            hasMicrophone: devices.some(device => device.kind === 'audioinput'),
            hasAudioOutput: devices.some(device => device.kind === 'audiooutput')
        };

        const missingDevices = Object.entries(deviceStatus)
            .filter(([_, has]) => !has)
            .map(([device]) => device.replace('has', '').toLowerCase());

        if (missingDevices.length > 0) {
            throw new Error(`Missing required devices: ${missingDevices.join(', ')}`);
        }

        return deviceStatus;
    }

    async requestMediaAccess() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            await this.initializeAudioContext();
            return this.stream;
        } catch (error) {
            throw new Error(`Failed to access media devices: ${error.message}`);
        }
    }

    async initializeAudioContext() {
        this.audioContext = new AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = CONFIG.AUDIO.fftSize;
        
        const source = this.audioContext.createMediaStreamSource(this.stream);
        source.connect(this.analyser);
    }

    createAudioVisualization(audioWaveElement, isActive) {
        if (!this.analyser) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVisualization = () => {
            if (!isActive()) return;

            this.analyser.getByteFrequencyData(dataArray);
            const bars = audioWaveElement.children;
            
            for (let i = 0; i < bars.length; i++) {
                const value = dataArray[i] || 0;
                bars[i].style.height = `${value * 0.3}px`;
            }

            requestAnimationFrame(updateVisualization);
        };

        updateVisualization();
    }
}

// UI Manager handles all DOM-related operations
class UIManager {
    constructor() {
        this.elements = this.initializeElements();
        this.setupDragAndDrop();
    }

    initializeElements() {
        const elements = {
            preview: document.getElementById('preview'),
            startButton: document.getElementById('startRecord'),
            stopButton: document.getElementById('stopRecord'),
            playButton: document.getElementById('playBack'),
            saveButton: document.getElementById('saveVideo'),
            discardButton: document.getElementById('discardVideo'),
            toggleScriptButton: document.getElementById('toggleScript'),
            scriptContainer: document.getElementById('scriptContainer'),
            scriptInput: document.getElementById('scriptInput'),
            scriptDisplay: document.getElementById('scriptDisplay'),
            scrollSpeed: document.getElementById('scrollSpeed'),
            countdownElement: document.getElementById('countdown'),
            countdownSelect: document.getElementById('countdownTime'),
            loadingElement: document.getElementById('loadingOverlay'),
            audioWave: document.getElementById('audioWave')
        };

        // Validate all elements exist
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) throw new Error(`Required element not found: ${key}`);
        });

        return elements;
    }

    setupDragAndDrop() {
        let dragState = null;

        const handleMouseMove = (e) => {
            if (!dragState) return;

            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;
            
            this.elements.scriptContainer.style.top = `${dragState.startTop + dy}px`;
            this.elements.scriptContainer.style.left = `${dragState.startLeft + dx}px`;
        };

        const handleMouseUp = () => {
            dragState = null;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        this.elements.scriptContainer.addEventListener('mousedown', (e) => {
            dragState = {
                startX: e.clientX,
                startY: e.clientY,
                startLeft: this.elements.scriptContainer.offsetLeft,
                startTop: this.elements.scriptContainer.offsetTop
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
    }

    updateUIState(state) {
        const states = {
            ready: { start: false, stop: true, play: true, save: true, discard: true },
            recording: { start: true, stop: false, play: true, save: true, discard: true },
            recorded: { start: false, stop: true, play: false, save: false, discard: false },
            error: { start: true, stop: true, play: true, save: true, discard: true }
        };

        const buttons = states[state];
        if (!buttons) return;

        Object.entries(buttons).forEach(([action, disabled]) => {
            const button = this.elements[`${action}Button`];
            if (button) button.disabled = disabled;
        });
    }

    showError(message) {
        console.error(message);
        let errorDisplay = document.getElementById('errorDisplay');
        
        if (!errorDisplay) {
            errorDisplay = document.createElement('div');
            errorDisplay.id = 'errorDisplay';
            errorDisplay.className = 'error-message';
            this.elements.preview.parentNode.insertBefore(errorDisplay, this.elements.preview);
        }
        
        errorDisplay.textContent = message;
    }

    createAudioBars() {
        this.elements.audioWave.innerHTML = '';
        for (let i = 0; i < CONFIG.AUDIO.barCount; i++) {
            const bar = document.createElement('div');
            bar.className = 'wave-bar';
            this.elements.audioWave.appendChild(bar);
        }
    }

    async startCountdown() {
        let time = parseInt(this.elements.countdownSelect.value);
        this.elements.countdownElement.style.display = 'block';
        
        while (time >= 0) {
            this.elements.countdownElement.textContent = time;
            await Utils.sleep(1000);
            time--;
        }
        
        this.elements.countdownElement.style.display = 'none';
    }
}

// RecordingManager handles recording-related operations
class RecordingManager {
    constructor(stream, uiManager) {
        this.stream = stream;
        this.ui = uiManager;
        this.recordedChunks = [];
        this.mediaRecorder = null;
        this.isRecording = false;
        this.isPlaying = false;
        this.recordingStartTime = null;
    }

    async startRecording() {
        await this.ui.startCountdown();

        this.mediaRecorder = new MediaRecorder(this.stream, CONFIG.VIDEO);
        this.recordedChunks = [];
        this.isRecording = true;
        this.recordingStartTime = new Date();

        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                this.recordedChunks.push(e.data);
            }
        };

        this.mediaRecorder.start();
        this.ui.updateUIState('recording');
    }

    stopRecording() {
        this.mediaRecorder.stop();
        this.isRecording = false;
        this.ui.updateUIState('recorded');
    }

    async playRecording() {
        if (this.recordedChunks.length === 0) {
            this.ui.showError('No recording available to play.');
            return;
        }

        const blob = new Blob(this.recordedChunks, { type: CONFIG.VIDEO.mimeType });
        const videoUrl = URL.createObjectURL(blob);
        
        this.ui.elements.preview.srcObject = null;
        this.ui.elements.preview.src = videoUrl;
        this.ui.elements.preview.muted = false;
        
        try {
            await this.ui.elements.preview.play();
            this.isPlaying = true;

            this.ui.elements.preview.onended = () => {
                this.isPlaying = false;
                this.ui.elements.preview.srcObject = this.stream;
                this.ui.elements.preview.muted = true;
            };
        } catch (error) {
            this.ui.showError(`Error playing recording: ${error.message}`);
        }
    }

    saveRecording() {
        const blob = new Blob(this.recordedChunks, { type: CONFIG.VIDEO.mimeType });
        const timestamp = Utils.formatTimestamp();

        const metadata = {
            title: 'Introduction Practice Recording',
            recordingDate: this.recordingStartTime.toISOString(),
            duration: (new Date() - this.recordingStartTime) / 1000,
            format: 'WebM (VP9/Opus)',
            resolution: `${this.ui.elements.preview.videoWidth}x${this.ui.elements.preview.videoHeight}`,
            scriptContent: this.ui.elements.scriptInput.value
        };

        const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { 
            type: 'application/json' 
        });

        Utils.createDownloadLink(blob, `introduction-practice-${timestamp}.webm`);
        Utils.createDownloadLink(metadataBlob, `introduction-practice-${timestamp}-metadata.json`);
    }

    discardRecording() {
        this.isPlaying = false;
        this.ui.elements.preview.srcObject = this.stream;
        this.recordedChunks = [];
        this.ui.updateUIState('ready');
    }
}

// ScriptManager handles script-related operations
class ScriptManager {
    constructor(uiManager) {
        this.ui = uiManager;
        this.scrollInterval = null;
    }

    toggleScript() {
        const isHidden = this.ui.elements.scriptContainer.style.display === 'none';
        this.ui.elements.scriptContainer.style.display = isHidden ? 'block' : 'none';
        this.ui.elements.toggleScriptButton.textContent = isHidden ? 'Hide Script' : 'Show Script';
    }

    startScroll() {
        this.resetScroll();
        const speed = this.calculateScrollSpeed();
        
        this.stopScroll();
        
        this.scrollInterval = setInterval(() => {
            const { scriptDisplay } = this.ui.elements;
            if (scriptDisplay.scrollHeight > scriptDisplay.clientHeight) {
                scriptDisplay.scrollTop += 1;
                
                if (scriptDisplay.scrollTop >= 
                    (scriptDisplay.scrollHeight - scriptDisplay.clientHeight)) {
                    this.resetScroll();
                }
            }
        }, speed);
    }

    calculateScrollSpeed() {
        const { minSpeed, maxSpeed } = CONFIG.SCROLL;
        const range = maxSpeed - minSpeed;
        return maxSpeed - ((this.ui.elements.scrollSpeed.value / 10) * range);
    }

    stopScroll() {
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
        }
    }

    resetScroll() {
        this.ui.elements.scriptDisplay.scrollTop = 0;
    }

    updateScriptDisplay() {
        this.ui.elements.scriptDisplay.textContent = this.ui.elements.scriptInput.value;
        this.ui.elements.scriptDisplay.style.whiteSpace = 'pre-wrap';
        this.resetScroll();
    }
}

// Main application class
class IntroductionPractice {
    constructor() {
        this.ui = new UIManager();
        this.mediaManager = new MediaManager();
        this.scriptManager = new ScriptManager(this.ui);
        this.recordingManager = null;

        this.initialize();
    }

    async initialize() {
        try {
            this.ui.elements.loadingElement.style.display = 'flex';
            
            await this.mediaManager.checkDeviceAvailability();
            const stream = await this.mediaManager.requestMediaAccess();
            
            this.recordingManager = new RecordingManager(stream, this.ui);
            
            await this.setupPreview(stream);
            this.ui.createAudioBars();
            this.setupEventListeners();
            
            this.ui.updateUIState('ready');
        } catch (error) {
            this.ui.showError(error.message);
            this.ui.updateUIState('error');
        } finally {
            this.ui.elements.loadingElement.style.display = 'none';
        }
    }

    async setupPreview(stream) {
        this.ui.elements.preview.srcObject = stream;
        try {
            await this.ui.elements.preview.play();
        } catch (error) {
            throw new Error(`Failed to start video preview: ${error.message}`);
        }
    }

    setupEventListeners() {
        const { elements } = this.ui;
        
        elements.startButton.addEventListener('click', () => {
            this.recordingManager.startRecording();
            this.scriptManager.startScroll();
            this.mediaManager.createAudioVisualization(
                elements.audioWave,
                () => this.recordingManager.isRecording || this.recordingManager.isPlaying
            );
        });

        elements.stopButton.addEventListener('click', () => {
            this.recordingManager.stopRecording();
            this.scriptManager.stopScroll();
        });

        elements.playButton.addEventListener('click', () => this.recordingManager.playRecording());
        elements.saveButton.addEventListener('click', () => this.recordingManager.saveRecording());
        elements.discardButton.addEventListener('click', () => this.recordingManager.discardRecording());
        elements.toggleScriptButton.addEventListener('click', () => this.scriptManager.toggleScript());
        elements.scriptInput.addEventListener('input', () => this.scriptManager.updateScriptDisplay());
        elements.scrollSpeed.addEventListener('input', () => {
            if (this.recordingManager.isRecording) {
                this.scriptManager.stopScroll();
                this.scriptManager.startScroll();
            }
        });

        // Handle visibility change to properly manage resources
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.recordingManager.isRecording) {
                this.recordingManager.stopRecording();
                this.scriptManager.stopScroll();
                this.ui.showError('Recording stopped due to page visibility change');
            }
        });

        // Handle before unload to warn user if recording is in progress
        window.addEventListener('beforeunload', (event) => {
            if (this.recordingManager.isRecording) {
                event.preventDefault();
                event.returnValue = 'Recording is still in progress. Are you sure you want to leave?';
                return event.returnValue;
            }
        });
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        new IntroductionPractice();
    } catch (error) {
        console.error('Failed to initialize Introduction Practice:', error);
        // Show error in UI if possible
        const errorDisplay = document.createElement('div');
        errorDisplay.className = 'error-message';
        errorDisplay.textContent = `Failed to initialize: ${error.message}`;
        document.body.prepend(errorDisplay);
    }
});
