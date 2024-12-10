// transcriptionManager.js
class TranscriptionManager {
    constructor(audioPlayer) {
        this.audioPlayer = audioPlayer;
        this.currentLineElement = document.getElementById('current-line');
        this.fullTranscriptionElement = document.getElementById('full-transcription');
        this.transcriptionData = [];
        this.currentIndex = 0;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.audioPlayer.audio.addEventListener('timeupdate', () => this.updateTranscription());
    }

    async loadTranscription(file) {
        try {
            const text = await file.text();
            const extension = file.name.split('.').pop().toLowerCase();
            
            switch (extension) {
                case 'json':
                    this.transcriptionData = this.parseJSON(text);
                    break;
                case 'vtt':
                    this.transcriptionData = this.parseVTT(text);
                    break;
                case 'srt':
                    this.transcriptionData = this.parseSRT(text);
                    break;
                default:
                    throw new Error('Unsupported file format');
            }

            this.renderFullTranscription();
        } catch (error) {
            console.error('Error loading transcription:', error);
        }
    }

    parseJSON(text) {
        const data = JSON.parse(text);
        return data.map(item => ({
            startTime: parseFloat(item.startTime),
            endTime: parseFloat(item.endTime),
            text: item.text
        }));
    }

    // transcriptionManager.js (continued)
    parseVTT(text) {
        const lines = text.trim().split('\n');
        const cues = [];
        let current = {};

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.includes('-->')) {
                const [start, end] = line.split('-->').map(timeStr => {
                    const [mins, secs] = timeStr.trim().split(':');
                    return parseFloat(mins) * 60 + parseFloat(secs);
                });
                
                current = { startTime: start, endTime: end, text: '' };
            } else if (line !== '' && current.startTime !== undefined) {
                current.text += (current.text ? ' ' : '') + line;
                
                if (lines[i + 1]?.trim() === '' || i === lines.length - 1) {
                    cues.push({ ...current });
                    current = {};
                }
            }
        }
        
        return cues;
    }

    parseSRT(text) {
        const segments = text.trim().split('\n\n');
        return segments.map(segment => {
            const lines = segment.split('\n');
            const times = lines[1].split('-->');
            const startTime = this.srtTimeToSeconds(times[0].trim());
            const endTime = this.srtTimeToSeconds(times[1].trim());
            const text = lines.slice(2).join(' ');
            
            return { startTime, endTime, text };
        });
    }

    srtTimeToSeconds(timeStr) {
        const [hours, minutes, seconds] = timeStr.split(':');
        const [secs, ms] = seconds.split(',');
        return parseFloat(hours) * 3600 + 
               parseFloat(minutes) * 60 + 
               parseFloat(secs) + 
               parseFloat(ms) / 1000;
    }

    updateTranscription() {
        const currentTime = this.audioPlayer.audio.currentTime;
        const currentCue = this.findCurrentCue(currentTime);

        if (currentCue && this.currentIndex !== this.transcriptionData.indexOf(currentCue)) {
            this.currentIndex = this.transcriptionData.indexOf(currentCue);
            this.updateCurrentLine(currentCue);
            this.highlightInFullView(currentCue);
        }
    }

    findCurrentCue(currentTime) {
        return this.transcriptionData.find(cue => 
            currentTime >= cue.startTime && currentTime <= cue.endTime
        );
    }

    updateCurrentLine(cue) {
        if (this.currentLineElement) {
            this.currentLineElement.textContent = cue.text;
        }
    }

    renderFullTranscription() {
        if (!this.fullTranscriptionElement) return;

        this.fullTranscriptionElement.innerHTML = this.transcriptionData
            .map((cue, index) => `
                <p class="transcription-line" data-index="${index}">
                    ${cue.text}
                </p>
            `).join('');
    }

    highlightInFullView(currentCue) {
        const allLines = this.fullTranscriptionElement.querySelectorAll('.transcription-line');
        allLines.forEach(line => line.classList.remove('highlighted-word'));

        const currentLine = this.fullTranscriptionElement
            .querySelector(`[data-index="${this.currentIndex}"]`);
        
        if (currentLine) {
            currentLine.classList.add('highlighted-word');
            currentLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    searchTranscription(searchTerm) {
        const regex = new RegExp(searchTerm, 'gi');
        const results = this.transcriptionData
            .map((cue, index) => ({ index, time: cue.startTime, match: cue.text.match(regex) }))
            .filter(result => result.match);
        
        return results;
    }

    jumpToTime(timeInSeconds) {
        if (this.audioPlayer.audio) {
            this.audioPlayer.audio.currentTime = timeInSeconds;
        }
    }

    downloadTranscription(format = 'txt') {
        let content = '';
        const filename = `transcription.${format}`;

        switch (format) {
            case 'txt':
                content = this.transcriptionData
                    .map(cue => cue.text)
                    .join('\n\n');
                break;
            case 'json':
                content = JSON.stringify(this.transcriptionData, null, 2);
                break;
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}

export default TranscriptionManager;