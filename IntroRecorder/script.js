class IntroductionPractice {
    constructor() {
        this.state = {
            isRecording: false,
            isPlaying: false,
            recordedChunks: [],
            stream: null,
            audioContext: null,
            analyser: null,
            mediaRecorder: null,
            scrollInterval: null,
            recordingStartTime:null,
            deviceStatus:{
                hasCamera:false,
                hasMicrophone: false,
                hasAudioOutput: false
            }
        };

        this.elements = this.initializeElements();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.checkDeviceAvailability().then(() => this.requestMediaPermissions())
            .catch(error => this.handleDeviceError(error));
    }

async checkDeviceAvailability() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            
            this.state.deviceStatus = {
                hasCamera: devices.some(device => device.kind === 'videoinput'),
                hasMicrophone: devices.some(device => device.kind === 'audioinput'),
                hasAudioOutput: devices.some(device => device.kind === 'audiooutput')
            };

            // Create custom error if required devices are missing
            const missingDevices = [];
            if (!this.state.deviceStatus.hasCamera) missingDevices.push('camera');
            if (!this.state.deviceStatus.hasMicrophone) missingDevices.push('microphone');
            
            if (missingDevices.length > 0) {
                throw new Error(`Missing required devices: ${missingDevices.join(', ')}`);
            }

        } catch (error) {
            if (error.name === 'NotAllowedError') {
                throw new Error('Permission to access devices was denied. Please allow access in your browser settings.');
            }
            throw error;
        }
    }

    initializeElements() {
        return {
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
    }

    async requestMediaPermissions() {
        try {
            this.elements.loadingElement.style.display = 'flex';

            const constraints = {
                video: this.state.deviceStatus.hasCamera,
                audio: this.state.deviceStatus.hasMicrophone
            };
            
            this.state.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Verify stream has both audio and video tracks
            const hasVideoTrack = this.state.stream.getVideoTracks().length > 0;
            const hasAudioTrack = this.state.stream.getAudioTracks().length > 0;

            if (!hasVideoTrack || !hasAudioTrack) {
                throw new Error('Failed to get both audio and video tracks');
            }

            await this.setupPreview();
            await this.initializeAudioContext();
            
            this.elements.startButton.disabled = false;
            this.updateUIState('ready');
            
        } catch (error) {
            this.handleMediaError(error);
        } finally {
            this.elements.loadingElement.style.display = 'none';
        }
    }

    async setupPreview() {
        this.elements.preview.srcObject = this.state.stream;
        try {
            await this.elements.preview.play();
        } catch (error) {
            throw new Error('Failed to start video preview: ' + error.message);
        }
    }


    async initializeAudioContext() {
        try {
            this.state.audioContext = new AudioContext();
            this.state.analyser = this.state.audioContext.createAnalyser();
            this.state.analyser.fftSize = 256;
            
            const source = this.state.audioContext.createMediaStreamSource(this.state.stream);
            source.connect(this.state.analyser);
            
            this.createAudioBars();
        } catch (error) {
            throw new Error('Failed to initialize audio context: ' + error.message);
        }
    }

handleDeviceError(error) {
        console.error('Device error:', error);
        
        const errorMessages = {
            NotFoundError: 'Required devices not found. Please connect a camera and microphone.',
            NotAllowedError: 'Permission denied. Please allow access to camera and microphone.',
            NotReadableError: 'Could not access your devices. Please ensure they are not being used by another application.',
            OverconstrainedError: 'Your devices do not meet the required constraints.',
            default: 'An error occurred while accessing your devices.'
        };

        const message = errorMessages[error.name] || errorMessages.default;
        this.showError(message);
        this.updateUIState('error');
    }

    handleMediaError(error) {
        console.error('Media error:', error);
        
        const errorMessages = {
            AbortError: 'The operation was aborted.',
            NotSupportedError: 'Your browser does not support the required media features.',
            default: 'An error occurred while setting up media devices.'
        };

        const message = errorMessages[error.name] || errorMessages.default;
        this.showError(message);
        this.updateUIState('error');
    }

    showError(message) {
        // Create or update error display element
        let errorDisplay = document.getElementById('errorDisplay');
        if (!errorDisplay) {
            errorDisplay = document.createElement('div');
            errorDisplay.id = 'errorDisplay';
            errorDisplay.className = 'error-message';
            this.elements.preview.parentNode.insertBefore(errorDisplay, this.elements.preview);
        }
        errorDisplay.textContent = message;
    }

    updateUIState(state) {
        switch (state) {
            case 'ready':
                this.elements.startButton.disabled = false;
                this.elements.stopButton.disabled = true;
                this.elements.playButton.disabled = true;
                this.elements.saveButton.disabled = true;
                this.elements.discardButton.disabled = true;
                break;
            case 'recording':
                this.elements.startButton.disabled = true;
                this.elements.stopButton.disabled = false;
                this.elements.playButton.disabled = true;
                this.elements.saveButton.disabled = true;
                this.elements.discardButton.disabled = true;
                break;
            case 'error':
                this.elements.startButton.disabled = true;
                this.elements.stopButton.disabled = true;
                this.elements.playButton.disabled = true;
                this.elements.saveButton.disabled = true;
                this.elements.discardButton.disabled = true;
                break;
            // Add more states as needed
        }
    }

    setupEventListeners() {
        this.elements.startButton.addEventListener('click', () => this.startRecording());
        this.elements.stopButton.addEventListener('click', () => this.stopRecording());
        this.elements.playButton.addEventListener('click', () => this.playRecording());
        this.elements.saveButton.addEventListener('click', () => this.saveRecording());
        this.elements.discardButton.addEventListener('click', () => this.discardRecording());
        this.elements.toggleScriptButton.addEventListener('click', () => this.toggleScript());
        this.elements.scriptInput.addEventListener('input', () => this.updateScriptDisplay());
        this.elements.scrollSpeed.addEventListener('input', () => this.updateScrollSpeed());
    }

    handleMediaError(err) {
        console.error('Error accessing media devices:', err);
        const errorMessages = {
            NotAllowedError: 'Permission denied. Please allow access to camera and microphone in your browser settings.',
            NotFoundError: 'No camera or microphone found. Please connect a device and try again.',
            default: `Error accessing camera and microphone: ${err.message}`
        };
        alert(errorMessages[err.name] || errorMessages.default);
        this.elements.loadingElement.style.display = 'none';
    }

    setupAudioVisualization() {
        if (!this.state.analyser) return;

        const source = this.state.audioContext.createMediaStreamSource(this.state.stream);
        source.connect(this.state.analyser);
        
        const bufferLength = this.state.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const updateWave = () => {
            if (!this.state.isRecording && !this.state.isPlaying) return;
            
            this.state.analyser.getByteFrequencyData(dataArray);
            const bars = this.elements.audioWave.children;
            
            for (let i = 0; i < bars.length; i++) {
                const value = dataArray[i] || 0;
                bars[i].style.height = `${value * 0.3}px`;
            }
            
            if (this.state.isRecording || this.state.isPlaying) {
                requestAnimationFrame(updateWave);
            }
        };
        
        updateWave();
    }

    createAudioBars() {
        this.elements.audioWave.innerHTML = '';
        for (let i = 0; i < 50; i++) {
            const bar = document.createElement('div');
            bar.className = 'wave-bar';
            this.elements.audioWave.appendChild(bar);
        }
    }

    setupDragAndDrop() {
        let pos = { top: 0, left: 0, x: 0, y: 0 };
        
        const mouseMoveHandler = (e) => {
            const dx = e.clientX - pos.x;
            const dy = e.clientY - pos.y;
            this.elements.scriptContainer.style.top = `${pos.top + dy}px`;
            this.elements.scriptContainer.style.left = `${pos.left + dx}px`;
        };

        const mouseUpHandler = () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        this.elements.scriptContainer.addEventListener('mousedown', (e) => {
            pos = {
                left: this.elements.scriptContainer.offsetLeft,
                top: this.elements.scriptContainer.offsetTop,
                x: e.clientX,
                y: e.clientY,
            };
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });
    }

    startCountdown() {
        return new Promise((resolve) => {
            let time = parseInt(this.elements.countdownSelect.value);
            this.elements.countdownElement.style.display = 'block';
            
            const countdown = setInterval(() => {
                this.elements.countdownElement.textContent = time;
                if (time <= 0) {
                    clearInterval(countdown);
                    this.elements.countdownElement.style.display = 'none';
                    resolve();
                }
                time--;
            }, 1000);
        });
    }

    async startRecording() {
        await this.startCountdown();

        const options = {
            mimeType: 'video/webm;codecs=vp9,opus',
            videoBitsPerSecond: 2500000, //2.5 Mbps
            audioBitsPerSecond: 128000 //128kbps
        };
        
        this.state.mediaRecorder = new MediaRecorder(this.state.stream, options);
        this.state.recordedChunks = [];
        this.state.isRecording = true;
        this.state.recordingStartTime = new Date();
        
        this.state.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                this.state.recordedChunks.push(e.data);
            }
        };
        
        this.state.mediaRecorder.start();
        this.elements.startButton.disabled = true;
        this.elements.stopButton.disabled = false;
        this.setupAudioVisualization();
        this.startScriptScroll();
    }

    stopRecording() {
        this.state.mediaRecorder.stop();
        this.state.isRecording = false;
        this.elements.stopButton.disabled = true;
        this.elements.playButton.disabled = false;
        this.elements.saveButton.disabled = false;
        this.elements.discardButton.disabled = false;
        this.stopScriptScroll();
    }

    async playRecording() {
    if (this.state.recordedChunks.length === 0) {
        alert('No recording available to play.');
        return;
    }

    const blob = new Blob(this.state.recordedChunks, { type: 'video/webm;codecs=vp9,opus' });
    const videoUrl = URL.createObjectURL(blob);
    this.elements.preview.srcObject = null;
    this.elements.preview.src = videoUrl;
    this.elements.preview.muted = false;
    this.elements.preview.volume = 1.0;

    try {
        await this.elements.preview.play();
        this.state.isPlaying = true;

        // Create and connect AudioContext
        const audioContext = new AudioContext();
        const source = audioContext.createMediaElementSource(this.elements.preview);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        // Visualization
        this.state.analyser = analyser;
        this.setupAudioVisualization();

        this.elements.preview.onended = () => {
            this.state.isPlaying = false;
            source.disconnect();
            analyser.disconnect();
            audioContext.close(); // Ensure cleanup

            // Reset preview to live stream
            this.elements.preview.srcObject = this.state.stream;
            this.elements.preview.muted = true;
        };
    } catch (error) {
        console.error('Error playing recording:', error);
    }
}


     saveRecording() {
        const blob = new Blob(this.state.recordedChunks, { 
            type: 'video/webm;codecs=vp9,opus'
        });

        // Create metadata
        const metadata = {
            title: 'Introduction Practice Recording',
            recordingDate: this.state.recordingStartTime.toISOString(),
            duration: (new Date() - this.state.recordingStartTime) / 1000, // in seconds
            format: 'WebM (VP9/Opus)',
            resolution: `${this.elements.preview.videoWidth}x${this.elements.preview.videoHeight}`,
            scriptContent: this.elements.scriptInput.value
        };

        // Create a text file with metadata
        const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
        
        // Save video with metadata
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Save video
        const videoUrl = URL.createObjectURL(blob);
        const videoLink = document.createElement('a');
        videoLink.href = videoUrl;
        videoLink.download = `introduction-practice-${timestamp}.webm`;
        videoLink.click();
        URL.revokeObjectURL(videoUrl);

        // Save metadata
        const metadataUrl = URL.createObjectURL(metadataBlob);
        const metadataLink = document.createElement('a');
        metadataLink.href = metadataUrl;
        metadataLink.download = `introduction-practice-${timestamp}-metadata.json`;
        metadataLink.click();
        URL.revokeObjectURL(metadataUrl);
    }

    discardRecording() {
        this.state.isPlaying = false;
        this.elements.preview.srcObject = this.state.stream;
        this.elements.startButton.disabled = false;
        this.elements.playButton.disabled = true;
        this.elements.saveButton.disabled = true;
        this.elements.discardButton.disabled = true;
        this.state.recordedChunks = [];
    }

    toggleScript() {
        const isHidden = this.elements.scriptContainer.style.display === 'none';
        this.elements.scriptContainer.style.display = isHidden ? 'block' : 'none';
        this.elements.toggleScriptButton.textContent = isHidden ? 'Hide Script' : 'Show Script';
    }

    startScriptScroll() {
        this.resetScriptScroll();
        const speed = this.getScrollSpeed();
        
        if (this.state.scrollInterval) {
            clearInterval(this.state.scrollInterval);
        }
        
        this.state.scrollInterval = setInterval(() => {
            if (this.elements.scriptDisplay.scrollHeight > this.elements.scriptDisplay.clientHeight) {
                this.elements.scriptDisplay.scrollTop += 1;
                
                if (this.elements.scriptDisplay.scrollTop >= 
                    (this.elements.scriptDisplay.scrollHeight - this.elements.scriptDisplay.clientHeight)) {
                    this.resetScriptScroll();
                }
            }
        }, speed);
    }

    getScrollSpeed() {
        const minSpeed = 50;
        const maxSpeed = 150;
        const range = maxSpeed - minSpeed;
        return maxSpeed - ((this.elements.scrollSpeed.value / 10) * range);
    }

    updateScriptDisplay() {
        this.elements.scriptDisplay.textContent = this.elements.scriptInput.value;
        this.elements.scriptDisplay.style.whiteSpace = 'pre-wrap';
        this.resetScriptScroll();
    }

    stopScriptScroll() {
        if (this.state.scrollInterval) {
            clearInterval(this.state.scrollInterval);
            this.state.scrollInterval = null;
        }
    }

    resetScriptScroll() {
        this.elements.scriptDisplay.scrollTop = 0;
    }

    updateScrollSpeed() {
        if (this.state.scrollInterval) {
            this.stopScriptScroll();
            this.startScriptScroll();
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new IntroductionPractice();
});
