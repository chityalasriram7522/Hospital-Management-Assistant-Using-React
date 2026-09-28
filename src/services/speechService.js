// Advanced Voice AI Engine — Speech Recognition, Synthesis, & Intent Routing

class SpeechEngine {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isSpeaking = false;
        this.onResultCallback = null;
        this.onInterimCallback = null;
        this.onStatusChange = null;
        this.onErrorCallback = null;
        this.enabled = false;
        this.restartTimeout = null;
        this.currentUtterance = null;
        this.rate = 1.0;
        this.pitch = 1.0;
        this.selectedVoice = null;
        this.lang = 'en-IN'; // Optimized for Indian accent & international English

        this.initVoices();
        this.initRecognition();
    }

    initVoices() {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        const updateVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            // Prioritize pleasant English voices (Indian English or natural Google/Microsoft voices)
            this.selectedVoice = voices.find(v => v.lang === 'en-IN') ||
                                 voices.find(v => v.name.includes('Natural') && v.lang.startsWith('en')) ||
                                 voices.find(v => v.lang.startsWith('en')) ||
                                 voices[0] || null;
        };

        updateVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }
    }

    initRecognition() {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API not supported in this browser.");
            return;
        }

        try {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true; // Real-time feedback
            this.recognition.lang = this.lang;

            this.recognition.onstart = () => {
                this.isListening = true;
                if (this.onStatusChange) this.onStatusChange(true);
            };

            this.recognition.onresult = (event) => {
                if (!event.results || event.results.length === 0) return;

                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (interimTranscript && this.onInterimCallback) {
                    this.onInterimCallback(interimTranscript);
                }

                if (finalTranscript) {
                    const cleanTranscript = finalTranscript.trim();
                    console.log("[Voice Engine] Final transcript:", cleanTranscript);
                    if (this.onResultCallback) {
                        this.onResultCallback(cleanTranscript);
                    }
                }
            };

            this.recognition.onerror = (event) => {
                // Ignore silent 'no-speech' or 'aborted'
                if (event.error === 'no-speech' || event.error === 'aborted') {
                    return;
                }

                console.warn("[Voice Engine] Notice:", event.error);
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    this.enabled = false;
                    this.isListening = false;
                    if (this.onStatusChange) this.onStatusChange(false);
                    if (this.onErrorCallback) {
                        this.onErrorCallback("Microphone permission denied. Please allow microphone access.");
                    }
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
                if (this.onStatusChange) this.onStatusChange(false);

                // Auto restart smoothly if AI mode is still enabled and not speaking
                if (this.enabled && !this.isSpeaking) {
                    clearTimeout(this.restartTimeout);
                    this.restartTimeout = setTimeout(() => {
                        this.startListening();
                    }, 500);
                }
            };
        } catch (err) {
            console.error("Speech Recognition initialization error:", err);
        }
    }

    setLanguage(langCode) {
        this.lang = langCode;
        if (this.recognition) {
            this.recognition.lang = langCode;
        }
    }

    playChime(type = 'start') {
        if (typeof window === 'undefined') return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'start') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
                gain.gain.setValueAtTime(0.04, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.2);
            } else if (type === 'stop') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.12);
                gain.gain.setValueAtTime(0.03, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.18);
            }
        } catch {
            // Audio context restricted before user interaction
        }
    }

    startListening() {
        if (!this.recognition || this.isListening || this.isSpeaking) return;
        try {
            this.recognition.start();
            this.playChime('start');
        } catch {
            // Already started or busy
        }
    }

    stopListening() {
        clearTimeout(this.restartTimeout);
        if (!this.recognition || !this.isListening) return;
        try {
            this.recognition.stop();
            this.playChime('stop');
        } catch {
            // Ignore
        }
        this.isListening = false;
        if (this.onStatusChange) this.onStatusChange(false);
    }

    speak(text, onComplete, lang = null) {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            if (onComplete) onComplete();
            return;
        }

        // Cancel previous speech
        try {
            window.speechSynthesis.cancel();
        } catch {
            // Ignore
        }
        this.stopListening();
        this.isSpeaking = true;

        const isTelugu = (lang && lang.startsWith('te')) || (!lang && this.lang.startsWith('te')) || /[\u0C00-\u0C7F]/.test(text);
        const targetLang = isTelugu ? 'te-IN' : (lang || this.lang || 'en-IN');

        const utterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance = utterance; // Prevent garbage collection bug in Chrome
        utterance.rate = isTelugu ? 0.95 : this.rate;
        utterance.pitch = this.pitch;
        utterance.lang = targetLang;

        let hasCompleted = false;
        const finishSpeaking = () => {
            if (hasCompleted) return;
            hasCompleted = true;
            this.isSpeaking = false;
            this.currentUtterance = null;
            if (onComplete) onComplete();
            if (this.enabled) {
                clearTimeout(this.restartTimeout);
                this.restartTimeout = setTimeout(() => {
                    this.startListening();
                }, 500);
            }
        };

        if (window.speechSynthesis.getVoices) {
            const voices = window.speechSynthesis.getVoices();
            if (isTelugu) {
                const teluguVoice = voices.find(v =>
                    v.lang === 'te-IN' ||
                    (v.lang && v.lang.toLowerCase().startsWith('te')) ||
                    (v.name && v.name.toLowerCase().includes('telugu')) ||
                    (v.name && v.name.toLowerCase().includes('mohan'))
                );
                if (teluguVoice) {
                    utterance.voice = teluguVoice;
                }
            } else if (this.selectedVoice) {
                utterance.voice = this.selectedVoice;
            }
        }

        utterance.onend = finishSpeaking;
        utterance.onerror = (e) => {
            console.warn("[Voice Engine] Speech synthesis error/interrupted:", e);
            finishSpeaking();
        };

        // Safety timeout in case browser TTS stalls on long utterances
        const estimatedDurationMs = Math.max(2000, (text.length * 90) + 1200);
        setTimeout(() => {
            if (!hasCompleted && this.isSpeaking) {
                console.log("[Voice Engine] Safety timeout triggered for utterance");
                finishSpeaking();
            }
        }, estimatedDurationMs);

        try {
            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.warn("[Voice Engine] Speak failed:", err);
            finishSpeaking();
        }
    }

    cancelSpeech() {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        this.isSpeaking = false;
        this.currentUtterance = null;
    }

    setMode(mode) {
        this.enabled = mode === 'ai';
        if (!this.enabled) {
            this.cancelSpeech();
            this.stopListening();
        } else {
            this.startListening();
        }
    }
}

export const speechEngine = new SpeechEngine();
