class IntroductionPractice {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.audioContext = null;
        this.analyser = null;
        this.requestMediaPermissions();
        
    }

    initializeElements() {
        // Video elements
        this.preview = document.getElementById('preview');
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.stream = null;

        // Buttons
        this.startButton = document.getElementById('startRecord');
        this.stopButton = document.getElementById('stopRecord');
        this.playButton = document.getElementById('playBack');
        this.saveButton = document.getElementById('saveVideo');
        this.discardButton = document.getElementById('discardVideo');
        this.toggleScriptButton = document.getElementById('toggleScript');

        // Script elements
        this.scriptContainer = document.getElementById('scriptContainer');
        this.scriptInput = document.getElementById('scriptInput');
        this.scriptDisplay = document.getElementById('scriptDisplay');
        this.scrollSpeed = document.getElementById('scrollSpeed');
        this.scrollInterval = null;

        // Countdown elements
        this.countdownElement = document.getElementById('countdown');
        this.countdownSelect = document.getElementById('countdownTime');

        //loading
        this.loadingElement = document.getElementById('loadingOverlay');

        // Audio visualization
        this.audioWave = document.getElementById('audioWave');
        
        this.createAudioBars();

        this.startButton.disabled = true;

    }

    async requestMediaPermissions() {
        try {
            this.loadingElement.style.display = 'flex'; // Changed from loadingOverlay to loadingElement
            
            // Request both video and audio permissions
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            // Set the stream to video preview
            this.preview.srcObject = this.stream;
            await this.preview.play(); // Add this to ensure video plays
            
            // Enable start button once we have permissions
            this.startButton.disabled = false;
            this.loadingElement.style.display = 'none';
        } catch (err) {
            console.error('Error accessing media devices:', err);
            // More specific error messages
            if (err.name === 'NotAllowedError') {
                alert('Permission denied. Please allow access to camera and microphone in your browser settings.');
            } else if (err.name === 'NotFoundError') {
                alert('No camera or microphone found. Please connect a device and try again.');
            } else {
                alert('Error accessing camera and microphone: ' + err.message);
            }
            this.loadingElement.style.display = 'none';
        }
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', async () => {
            if (this.stream) {
                await this.setupAudioContext();
                this.startRecording();
            } else {
                // If somehow we don't have stream, try requesting permissions again
                await this.requestMediaPermissions();
                if (this.stream) {
                    await this.setupAudioContext();
                    this.startRecording();
                }
            }
        });
        
        this.stopButton.addEventListener('click', () => this.stopRecording());
        this.playButton.addEventListener('click', () => this.playRecording());
        this.saveButton.addEventListener('click', () => this.saveRecording());
        this.discardButton.addEventListener('click', () => this.discardRecording());
        this.toggleScriptButton.addEventListener('click', () => this.toggleScript());
        this.scriptInput.addEventListener('input', () => this.updateScriptDisplay());
        this.scrollSpeed.addEventListener('input', () => this.updateScrollSpeed());
    }

    async initializeMediaStream() {
        try {
            this.loadingOverlay.style.display = 'flex';
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            this.preview.srcObject = this.stream;
            await this.setupAudioContext();
            this.loadingOverlay.style.display = 'none';
        } catch (err) {
            console.error('Error accessing media devices:', err);
            alert('Unable to access camera and microphone. Please ensure you have granted the necessary permissions.');
            this.loadingOverlay.style.display = 'none';
            throw err;
        }
    }
    async setupAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new AudioContext();
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.analyser = this.audioContext.createAnalyser();
            const source = this.audioContext.createMediaStreamSource(this.stream);
            source.connect(this.analyser);
            this.analyser.fftSize = 256;

            this.startAudioVisualization();
        }
    }
    startAudioVisualization() {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const updateWave = () => {
            if (!this.analyser) return; // Stop if analyser is removed

            this.analyser.getByteFrequencyData(dataArray);
            const bars = this.audioWave.children;
            
            for (let i = 0; i < bars.length; i++) {
                const value = dataArray[i] || 0;
                bars[i].style.height = `${value * 0.3}px`;
            }
            
            requestAnimationFrame(updateWave);
        };
        
        updateWave();
    }

    setupDragAndDrop() {
        let pos = { top: 0, left: 0, x: 0, y: 0 };

        const mouseMoveHandler = (e) => {
            const dx = e.clientX - pos.x;
            const dy = e.clientY - pos.y;
            this.scriptContainer.style.top = `${pos.top + dy}px`;
            this.scriptContainer.style.left = `${pos.left + dx}px`;
        };

        const mouseUpHandler = () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        this.scriptContainer.addEventListener('mousedown', (e) => {
            pos = {
                left: this.scriptContainer.offsetLeft,
                top: this.scriptContainer.offsetTop,
                x: e.clientX,
                y: e.clientY,
            };

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });
    }

    async setupMediaDevices() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            this.preview.srcObject = this.stream;
        } catch (err) {
            console.error('Error accessing media devices:', err);
            alert('Unable to access camera and microphone. Please ensure you have granted the necessary permissions.');
        }
    }

    setupAudioVisualization() {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(this.stream);
        
        source.connect(analyser);
        analyser.fftSize = 256;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const updateWave = () => {
            analyser.getByteFrequencyData(dataArray);
            const bars = this.audioWave.children;
            
            for (let i = 0; i < bars.length; i++) {
                const value = dataArray[i] || 0;
                bars[i].style.height = `${value * 0.3}px`;
            }
            
            requestAnimationFrame(updateWave);
        };
        
        updateWave();
    }

    createAudioBars() {
        for (let i = 0; i < 50; i++) {
            const bar = document.createElement('div');
            bar.className = 'wave-bar';
            this.audioWave.appendChild(bar);
        }
    }

    startCountdown() {
        return new Promise((resolve) => {
            let time = parseInt(this.countdownSelect.value);
            this.countdownElement.style.display = 'block';
            
            const countdown = setInterval(() => {
                this.countdownElement.textContent = time;
                if (time <= 0) {
                    clearInterval(countdown);
                    this.countdownElement.style.display = 'none';
                    resolve();
                }
                time--;
            }, 1000);
        });
    }

    async startRecording() {
        await this.startCountdown();
        
        this.mediaRecorder = new MediaRecorder(this.stream);
        this.recordedChunks = [];
        
        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                this.recordedChunks.push(e.data);
            }
        };
        
        this.mediaRecorder.start();
        this.startButton.disabled = true;
        this.stopButton.disabled = false;
        this.startScriptScroll();
    }

    stopRecording() {
        this.mediaRecorder.stop();
        this.stopButton.disabled = true;
        this.playButton.disabled = false;
        this.saveButton.disabled = false;
        this.discardButton.disabled = false;
        this.stopScriptScroll();
    }

    playRecording() {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.preview.srcObject = null;
        this.preview.src = URL.createObjectURL(blob);
        this.preview.load();
        this.preview.play();
    }

    saveRecording() {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'introduction-practice.webm';
        a.click();
    }

    discardRecording() {
        this.preview.srcObject = this.stream;
        this.startButton.disabled = false;
        this.playButton.disabled = true;
        this.saveButton.disabled = true;
        this.discardButton.disabled = true;
        this.recordedChunks = [];
    }

    toggleScript() {
        const isHidden = this.scriptContainer.style.display === 'none';
        this.scriptContainer.style.display = isHidden ? 'block' : 'none';
        this.toggleScriptButton.textContent = isHidden ? 'Hide Script' : 'Show Script';
    }

        
    
        startScriptScroll() {
            this.resetScriptScroll();
            const speed = this.getScrollSpeed();
            
            // Clear any existing interval first
            if (this.scrollInterval) {
                clearInterval(this.scrollInterval);
            }
            
            this.scrollInterval = setInterval(() => {
                // Check if scriptDisplay exists and has content
                if (this.scriptDisplay && this.scriptDisplay.scrollHeight > this.scriptDisplay.clientHeight) {
                    // Increase scroll increment for smoother scrolling
                    this.scriptDisplay.scrollTop += 1;
                    
                    // Reset when reaching the bottom
                    if (this.scriptDisplay.scrollTop >= (this.scriptDisplay.scrollHeight - this.scriptDisplay.clientHeight)) {
                        this.resetScriptScroll();
                    }
                }
            }, speed);
        }
        
        getScrollSpeed() {
            // Adjust speed range for smoother scrolling
            const minSpeed = 50;  // Fastest
            const maxSpeed = 150; // Slowest
            const range = maxSpeed - minSpeed;
            return maxSpeed - ((this.scrollSpeed.value / 10) * range);
        }
        
        updateScriptDisplay() {
            // Ensure content is updated and visible
            this.scriptDisplay.textContent = this.scriptInput.value;
            this.scriptDisplay.style.whiteSpace = 'pre-wrap'; // Preserve line breaks
            this.resetScriptScroll();
        }
    
        stopScriptScroll() {
            if (this.scrollInterval) {
                clearInterval(this.scrollInterval);
                this.scrollInterval = null;
            }
        }
    
        resetScriptScroll() {
            this.scriptDisplay.scrollTop = 0;
        }
    
        
        updateScrollSpeed() {
            if (this.scrollInterval) {
                this.stopScriptScroll();
                this.startScriptScroll();
            }
        }
    }

    
    // Initialize the application
    document.addEventListener('DOMContentLoaded', () => {
        new IntroductionPractice();
    });
