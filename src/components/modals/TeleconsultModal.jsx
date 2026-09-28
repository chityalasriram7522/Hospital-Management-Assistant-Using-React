import React, { useState, useEffect, useRef } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { speechEngine } from '../../services/speechService';
import {
    fetchLiveDoctorConsultation,
    isTeluguInput,
    generateDeepClinicalSynthesizer,
    getSavedAiConfig,
    saveAiConfig
} from '../../services/aiConsultantService';
import {
    Video,
    Mic,
    MicOff,
    VideoOff,
    PhoneOff,
    Share2,
    FileText,
    Sparkles,
    Activity,
    UserCheck,
    Volume2,
    Camera,
    RefreshCw,
    Send,
    Radio,
    Headphones,
    ShoppingBag,
    Languages
} from 'lucide-react';

export default function TeleconsultModal() {
    const {
        showTeleconsultModal,
        setShowTeleconsultModal,
        selectedTeleconsultPatient,
        patient,
        setPatient,
        doctors,
        setShowPrescriptionModal,
        setSelectedPrescriptionPatient,
        setGridPhase,
        setSubStep,
        setTokenVerified,
        setActivePage,
        addToast
    } = useHospital();

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [callDuration, setCallDuration] = useState(0); // seconds
    const [hasCamera, setHasCamera] = useState(false);
    const [cameraError, setCameraError] = useState("");
    const [swapView, setSwapView] = useState(false); // false: Doctor main, true: Patient main
    const [doctorSpeaking, setDoctorSpeaking] = useState(false);
    const [isDoctorThinking, setIsDoctorThinking] = useState(false);
    const [isDoctorListening, setIsDoctorListening] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState("");
    const [lastSpokenText, setLastSpokenText] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [customQuestion, setCustomQuestion] = useState("");
    const [selectedLang, setSelectedLang] = useState("te"); // Default to Telugu ('te') for native local accessibility
    const [showAiSettings, setShowAiSettings] = useState(false);
    const [aiConfig, setAiConfig] = useState(() => getSavedAiConfig());
    const [customApiKey, setCustomApiKey] = useState(() => getSavedAiConfig().apiKey || "");
    const [selectedAiProvider, setSelectedAiProvider] = useState(() => getSavedAiConfig().provider || "cloud_free");

    const handleSaveAiSettings = () => {
        const updated = {
            provider: selectedAiProvider,
            apiKey: customApiKey.trim(),
            model: selectedAiProvider === 'groq' ? 'llama-3.3-70b-versatile' : selectedAiProvider === 'gemini' ? 'gemini-1.5-flash' : 'openai'
        };
        saveAiConfig(updated);
        setAiConfig(updated);
        setShowAiSettings(false);
        addToast(
            selectedLang === 'te'
                ? "AI మోడల్ సెట్టింగ్‌లు విజయవంతంగా భద్రపరచబడ్డాయి!"
                : "AI Model preferences updated successfully!",
            "success"
        );
    };

    const patientVideoRef = useRef(null);
    const doctorVideoRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const recognitionRef = useRef(null);
    const isDoctorSpeakingRef = useRef(false);
    const isDoctorThinkingRef = useRef(false);
    const isMutedRef = useRef(false);
    const isCallActiveRef = useRef(false);
    const selectedLangRef = useRef("te");
    const chatEndRef = useRef(null);
    const silenceTimeoutRef = useRef(null);
    const latestInterimRef = useRef("");

    const activePatient = {
        name: selectedTeleconsultPatient?.name || patient?.name || "Rahul Verma",
        phone: selectedTeleconsultPatient?.phone || patient?.phone || "9876543210",
        issue: selectedTeleconsultPatient?.issue || patient?.issue || "Acute Fever and Severe Cough",
        priority: selectedTeleconsultPatient?.priority || patient?.priority || "Emergency",
        days: selectedTeleconsultPatient?.days || patient?.days || 5,
        token: selectedTeleconsultPatient?.token || patient?.token || "9842",
        doctorAssigned: selectedTeleconsultPatient?.doctorAssigned || patient?.doctorAssigned || 1,
        gender: selectedTeleconsultPatient?.gender || patient?.gender || "Male"
    };

    const assignedDoc = doctors.find(d => d.id === activePatient.doctorAssigned) || doctors[0];

    // Keep ref values in sync with state
    useEffect(() => {
        isMutedRef.current = isMuted;
    }, [isMuted]);

    useEffect(() => {
        isDoctorSpeakingRef.current = doctorSpeaking;
    }, [doctorSpeaking]);

    useEffect(() => {
        isDoctorThinkingRef.current = isDoctorThinking;
    }, [isDoctorThinking]);

    useEffect(() => {
        selectedLangRef.current = selectedLang;
    }, [selectedLang]);

    // Scroll chat to bottom on new messages
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, interimTranscript]);

    // Check if user spoke a command to end or cut the call
    const isEndCallCommand = (t) => {
        const lower = t.toLowerCase().trim();
        const enKeywords = [
            "end call", "cut call", "cut the call", "disconnect call",
            "disconnect", "close call", "stop call", "bye doctor",
            "finish call", "end the call", "call end", "call over",
            "terminate call", "leave call", "hang up", "exit call"
        ];
        const teKeywords = [
            "కాల్ ఎండ్", "కాల్ కట్", "కాల్ ముగించు", "కాల్ ఆపు", "కాల్ ఆపేయి",
            "ఫోన్ పెట్టు", "ఫోన్ కట్", "కట్ చేయి", "ముగించు", "కాల్ చాలు",
            "సెలవు", "ఆపేయండి", "ఆపండి", "ముగింపు",
            "call cut", "call end", "end chey", "cut chey", "cut cheyyi", "end cheyyi", "phone pettu", "bye"
        ];
        return enKeywords.some(k => lower.includes(k)) || teKeywords.some(k => lower.includes(k));
    };

    // Deep Clinical Medical Intelligence & Consultation Brain (Telugu & English)
    const generateDoctorResponse = (input) => {
        const isTelugu = selectedLangRef.current === 'te' || isTeluguInput(input, selectedLangRef.current);
        if (isTelugu && selectedLangRef.current !== 'te') {
            setSelectedLang('te');
            selectedLangRef.current = 'te';
            setupSpeechRecognition('te-IN');
        }
        return generateDeepClinicalSynthesizer(input, activePatient, isTelugu);
    };

    // Robust Real-Time Speech Recognition Engine with Silence Debounce
    const setupSpeechRecognition = (langCode) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        // Cleanly close previous instance
        if (recognitionRef.current) {
            try {
                recognitionRef.current.onend = null;
                recognitionRef.current.onerror = null;
                recognitionRef.current.stop();
            } catch {
                // Ignore
            }
            recognitionRef.current = null;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = langCode || (selectedLangRef.current === 'te' ? 'te-IN' : 'en-IN');

            recognition.onstart = () => {
                setIsDoctorListening(true);
            };

            recognition.onresult = (event) => {
                if (!event.results || event.results.length === 0) return;

                let interim = '';
                let final = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final += event.results[i][0].transcript;
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }

                if (interim) {
                    latestInterimRef.current = interim;
                    setInterimTranscript(interim);

                    // Silence debounce: If user speaks Telugu and pauses for 1300ms without final flag
                    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
                    silenceTimeoutRef.current = setTimeout(() => {
                        if (latestInterimRef.current && isCallActiveRef.current && !isDoctorSpeakingRef.current) {
                            const captured = latestInterimRef.current.trim();
                            latestInterimRef.current = "";
                            setInterimTranscript("");
                            handlePatientSpokenWords(captured);
                        }
                    }, 1300);
                }

                if (final) {
                    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
                    latestInterimRef.current = "";
                    const cleanFinal = final.trim();
                    setInterimTranscript("");
                    handlePatientSpokenWords(cleanFinal);
                }
            };

            recognition.onerror = (event) => {
                if (event.error === 'no-speech' || event.error === 'aborted') {
                    return;
                }
                console.warn("[Teleconsult Voice Engine] Notice:", event.error);
            };

            recognition.onend = () => {
                setIsDoctorListening(false);
                if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

                // Commit any leftover interim utterance on silence end
                if (latestInterimRef.current && isCallActiveRef.current && !isDoctorSpeakingRef.current) {
                    const captured = latestInterimRef.current.trim();
                    latestInterimRef.current = "";
                    setInterimTranscript("");
                    handlePatientSpokenWords(captured);
                }

                // Seamless auto-restart if call active, unmuted, and doctor not speaking
                if (isCallActiveRef.current && !isMutedRef.current && !isDoctorSpeakingRef.current) {
                    setTimeout(() => {
                        startListening();
                    }, 400);
                }
            };

            recognitionRef.current = recognition;
        } catch (err) {
            console.error("Speech Recognition setup error in teleconsult:", err);
        }
    };

    // Start Doctor-Patient Speech Listener
    const startListening = () => {
        if (!recognitionRef.current || isMutedRef.current || isDoctorSpeakingRef.current || !isCallActiveRef.current) {
            return;
        }

        try {
            recognitionRef.current.start();
            setIsDoctorListening(true);
        } catch {
            // Already started or busy - safely ignore
        }
    };

    // Stop Doctor-Patient Speech Listener
    const stopListening = () => {
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        if (!recognitionRef.current) return;
        try {
            recognitionRef.current.stop();
        } catch {
            // Safely ignore
        }
        setIsDoctorListening(false);
    };

    // Doctor speaks clinical response aloud and logs dialogue
    const doctorReply = (patientQuestion, doctorAnswer) => {
        // Add to dialogue stream
        setChatMessages(prev => [
            ...prev,
            { sender: activePatient.name || "You", text: patientQuestion, time: "Just now", isPatient: true },
            { sender: assignedDoc.name, text: doctorAnswer, time: "Just now", isDoctor: true }
        ]);

        setLastSpokenText(patientQuestion);
        setInterimTranscript("");
        setDoctorSpeaking(true);
        isDoctorSpeakingRef.current = true;

        // Stop microphone recognition while doctor is talking to prevent acoustic feedback loop
        stopListening();

        const langCode = selectedLangRef.current === 'te' || /[\u0C00-\u0C7F]/.test(doctorAnswer) ? 'te-IN' : 'en-IN';

        // Speak aloud through speaker
        speechEngine.speak(doctorAnswer, () => {
            setDoctorSpeaking(false);
            isDoctorSpeakingRef.current = false;
            // Seamlessly resume listening for patient's reply
            if (isCallActiveRef.current && !isMutedRef.current) {
                setTimeout(() => {
                    startListening();
                }, 400);
            }
        }, langCode);
    };

    // Handle patient spoken words from Speech Recognition with Real-Time AI Model
    const handlePatientSpokenWords = async (transcript) => {
        const clean = transcript.trim();
        if (!clean || clean.length < 2) return;

        console.log(`[Teleconsult Live Audio] Patient Said: "${clean}"`);

        // Check if patient said "end call", "cut call", "call cut chey", etc.
        if (isEndCallCommand(clean)) {
            const isTelugu = selectedLangRef.current === 'te' || /[\u0C00-\u0C7F]/.test(clean);
            const farewell = isTelugu
                ? `సరే ${activePatient.name} గారు, కాల్ ముగిస్తున్నాను. మందులు సమయానికి వేసుకోండి, త్వరగా కోలుకోండి!`
                : `Understood ${activePatient.name}. Ending the consultation now. Take good care and get well soon!`;

            setChatMessages(prev => [
                ...prev,
                { sender: activePatient.name || "You", text: clean, time: "Just now", isPatient: true },
                { sender: assignedDoc.name, text: farewell, time: "Just now", isDoctor: true }
            ]);

            setDoctorSpeaking(true);
            isDoctorSpeakingRef.current = true;
            stopListening();

            speechEngine.speak(farewell, () => {
                setDoctorSpeaking(false);
                isDoctorSpeakingRef.current = false;
                handleEndCall();
            }, isTelugu ? 'te-IN' : 'en-IN');

            // Safety fallback to guarantee call ends cleanly
            setTimeout(() => {
                handleEndCall();
            }, 2600);
            return;
        }

        // Auto-detect if patient spoke Telugu and synchronize recognition
        if (isTeluguInput(clean, selectedLangRef.current) && selectedLangRef.current !== 'te') {
            setSelectedLang('te');
            selectedLangRef.current = 'te';
            setupSpeechRecognition('te-IN');
        }

        // Activate real-time AI doctor reasoning
        setIsDoctorThinking(true);
        isDoctorThinkingRef.current = true;
        setLastSpokenText(clean);
        stopListening();

        try {
            const answer = await fetchLiveDoctorConsultation(
                clean,
                chatMessages,
                activePatient,
                selectedLangRef.current
            );
            setIsDoctorThinking(false);
            isDoctorThinkingRef.current = false;
            doctorReply(clean, answer);
        } catch (err) {
            console.warn("[Teleconsult AI Fallback]:", err);
            setIsDoctorThinking(false);
            isDoctorThinkingRef.current = false;
            const answer = generateDoctorResponse(clean);
            doctorReply(clean, answer);
        }
    };

    // Language change handler (English <-> Telugu)
    const handleLanguageChange = (lang) => {
        if (lang === selectedLang) return;
        setSelectedLang(lang);
        selectedLangRef.current = lang;

        const langCode = lang === 'te' ? 'te-IN' : 'en-IN';
        speechEngine.setLanguage(langCode);

        // Completely re-instantiate recognition with new acoustic model
        setupSpeechRecognition(langCode);

        const notify = lang === 'te'
            ? "నమస్కారం! నేను తెలుగులో మాట్లాడుతున్నాను. మీ సమస్య చెప్పండి, నేను వింటున్నాను."
            : "Switched to English. I am listening to your symptoms, please speak.";

        setChatMessages(prev => [
            ...prev,
            { sender: assignedDoc.name, text: notify, time: "Just now", isDoctor: true }
        ]);

        setDoctorSpeaking(true);
        isDoctorSpeakingRef.current = true;
        stopListening();

        speechEngine.speak(notify, () => {
            setDoctorSpeaking(false);
            isDoctorSpeakingRef.current = false;
            if (isCallActiveRef.current && !isMutedRef.current) {
                setTimeout(() => startListening(), 400);
            }
        }, langCode);

        addToast(lang === 'te' ? "తెలుగు భాష ప్రారంభించబడింది (Telugu Active)" : "Switched to English language", "info");
    };

    // Initialize Real Camera, Hardware Audio, and Live Speech Recognition
    useEffect(() => {
        if (!showTeleconsultModal) return;

        isCallActiveRef.current = true;
        setCallDuration(0);
        setCameraError("");
        setInterimTranscript("");
        setLastSpokenText("");

        const isTelugu = selectedLangRef.current === 'te';

        // Initial welcome message in chat
        setChatMessages([
            {
                sender: assignedDoc.name,
                text: isTelugu
                    ? `నమస్కారం ${activePatient.name} గారు. నేను డాక్టర్ శ్రీరామ్ చిత్యాల. మీ సమస్యను వివరించండి, నేను వింటున్నాను.`
                    : `Welcome ${activePatient.name}. I am Dr. Sriram Chityala. Please speak your symptoms into your microphone—I am listening.`,
                time: "Just now",
                isDoctor: true
            }
        ]);

        let activeStream = null;

        // Request real user camera & microphone
        const enableWebcamAndMic = async () => {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
                        audio: true
                    });
                    activeStream = stream;
                    mediaStreamRef.current = stream;

                    if (patientVideoRef.current) {
                        patientVideoRef.current.srcObject = stream;
                    }
                    setHasCamera(true);
                    addToast("Live webcam & microphone hardware connected!", "success");
                } else {
                    setCameraError("Camera device not supported by this browser.");
                }
            } catch (err) {
                console.warn("Camera/Mic access denied or device not found:", err);
                setCameraError("Camera not detected or permission denied. Running in voice-audio mode.");
                setHasCamera(false);
            }
        };

        enableWebcamAndMic();

        // Initialize Speech Recognition for Live Consultation
        setupSpeechRecognition(isTelugu ? 'te-IN' : 'en-IN');

        // Doctor voice greeting aloud in selected language
        const greeting = isTelugu
            ? `నమస్కారం ${activePatient.name || ''} గారు, నేను డాక్టర్ శ్రీరామ్ చిత్యాల. మీకు ఎలా ఉంది, చెప్పండి?`
            : `Hello ${activePatient.name || ''}, this is Dr. Sriram. How are you feeling right now?`;

        setDoctorSpeaking(true);
        isDoctorSpeakingRef.current = true;

        setTimeout(() => {
            speechEngine.speak(greeting, () => {
                setDoctorSpeaking(false);
                isDoctorSpeakingRef.current = false;
                startListening();
            }, isTelugu ? 'te-IN' : 'en-IN');
        }, 500);

        // Call Timer
        const timer = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        return () => {
            isCallActiveRef.current = false;
            clearInterval(timer);
            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

            // Clean up recognition
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.onend = null;
                    recognitionRef.current.onerror = null;
                    recognitionRef.current.stop();
                } catch {
                    // Ignore
                }
                recognitionRef.current = null;
            }

            // Cancel any ongoing synthesized speech
            speechEngine.cancelSpeech();

            // Turn off camera and mic hardware immediately
            if (activeStream) {
                activeStream.getTracks().forEach(t => t.stop());
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(t => t.stop());
                mediaStreamRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showTeleconsultModal]);

    // Reconnect video ref if swapView changes
    useEffect(() => {
        if (patientVideoRef.current && mediaStreamRef.current) {
            patientVideoRef.current.srcObject = mediaStreamRef.current;
        }
    }, [swapView, showTeleconsultModal]);

    if (!showTeleconsultModal) return null;

    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const remSecs = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
    };

    const handleEndCall = () => {
        isCallActiveRef.current = false;
        // Stop hardware camera & mic tracks
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
            mediaStreamRef.current = null;
        }
        // Stop recognition
        if (recognitionRef.current) {
            try {
                recognitionRef.current.onend = null;
                recognitionRef.current.stop();
            } catch {
                // Ignore
            }
        }
        speechEngine.cancelSpeech();
        setShowTeleconsultModal(false);
        addToast(
            selectedLang === 'te'
                ? `డాక్టర్ శ్రీరామ్‌తో టెలికన్సల్టేషన్ ముగిసింది (${formatTime(callDuration)}). సారాంశం EHRలో భద్రపరచబడింది.`
                : `Teleconsultation with ${assignedDoc.name} ended (${formatTime(callDuration)}). Clinical transcript synced to EHR.`,
            "info"
        );
    };

    // Toggle Real Microphone
    const toggleMic = () => {
        const nextMuted = !isMuted;
        if (mediaStreamRef.current) {
            const audioTracks = mediaStreamRef.current.getAudioTracks();
            audioTracks.forEach(t => {
                t.enabled = !nextMuted;
            });
        }
        setIsMuted(nextMuted);
        isMutedRef.current = nextMuted;

        if (nextMuted) {
            stopListening();
            addToast(selectedLang === 'te' ? "మైక్రోఫోన్ మ్యూట్ చేయబడింది" : "Microphone Muted - Doctor will not hear you.", "info");
        } else {
            addToast(selectedLang === 'te' ? "మైక్రోఫోన్ ఆన్ చేయబడింది - డాక్టర్ వింటున్నారు" : "Microphone Unmuted - Dr. Sriram is listening to you.", "success");
            startListening();
        }
    };

    // Toggle Real Camera
    const toggleVideo = () => {
        const nextVideoOff = !isVideoOff;
        if (mediaStreamRef.current) {
            const videoTracks = mediaStreamRef.current.getVideoTracks();
            videoTracks.forEach(t => {
                t.enabled = !nextVideoOff;
            });
        }
        setIsVideoOff(nextVideoOff);
        addToast(nextVideoOff ? "Camera Turned Off" : "Camera Re-enabled", "info");
    };

    // Quick one-tap inquiry handler with real-time AI consultant
    const handleQuickInquiry = async (q) => {
        if (isDoctorThinking || doctorSpeaking) return;

        if (isTeluguInput(q, selectedLangRef.current) && selectedLangRef.current !== 'te') {
            setSelectedLang('te');
            selectedLangRef.current = 'te';
            setupSpeechRecognition('te-IN');
        }

        setIsDoctorThinking(true);
        isDoctorThinkingRef.current = true;
        setLastSpokenText(q);
        stopListening();

        try {
            const answer = await fetchLiveDoctorConsultation(
                q,
                chatMessages,
                activePatient,
                selectedLangRef.current
            );
            setIsDoctorThinking(false);
            isDoctorThinkingRef.current = false;
            doctorReply(q, answer);
        } catch {
            setIsDoctorThinking(false);
            isDoctorThinkingRef.current = false;
            const answer = generateDoctorResponse(q);
            doctorReply(q, answer);
        }
    };

    // Manual text fallback question with real-time AI consultant
    const handleSendCustomQuestion = async (e) => {
        e.preventDefault();
        if (!customQuestion.trim() || isDoctorThinking || doctorSpeaking) return;

        const q = customQuestion.trim();
        setCustomQuestion("");

        if (isEndCallCommand(q)) {
            handlePatientSpokenWords(q);
            return;
        }

        if (isTeluguInput(q, selectedLangRef.current) && selectedLangRef.current !== 'te') {
            setSelectedLang('te');
            selectedLangRef.current = 'te';
            setupSpeechRecognition('te-IN');
        }

        setIsDoctorThinking(true);
        isDoctorThinkingRef.current = true;
        setLastSpokenText(q);
        stopListening();

        try {
            const answer = await fetchLiveDoctorConsultation(
                q,
                chatMessages,
                activePatient,
                selectedLangRef.current
            );
            setIsDoctorThinking(false);
            isDoctorThinkingRef.current = false;
            doctorReply(q, answer);
        } catch {
            setIsDoctorThinking(false);
            isDoctorThinkingRef.current = false;
            const answer = generateDoctorResponse(q);
            doctorReply(q, answer);
        }
    };

    const isTelugu = selectedLang === 'te';

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                onClick={handleEndCall}
            />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-6xl h-[94vh] bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-[0_0_120px_rgba(59,130,246,0.3)] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-center px-6 py-4 border-b border-white/10 bg-zinc-900/60 backdrop-blur-md gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_14px_#10b981]" />
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black text-white uppercase italic tracking-wider">
                                    CareConnect Live Telehealth Suite
                                </h3>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                                    <Video size={10} /> Live Call Active
                                </span>
                            </div>
                            <p className="text-[11px] text-zinc-400">
                                Attending: <span className="text-white font-bold">{assignedDoc.name}</span> • Patient: <span className="text-white">{activePatient.name}</span> (Token #{activePatient.token || "9842"})
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {/* Language Selector: 🇮🇳 తెలుగు (Telugu Active by default) | 🇬🇧 English */}
                        <div className="flex items-center bg-black/70 border border-white/15 rounded-full p-0.5 text-[11px] font-bold shadow-inner">
                            <button
                                onClick={() => handleLanguageChange('te')}
                                className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                                    selectedLang === 'te'
                                        ? 'bg-emerald-600 text-white shadow-md font-black ring-1 ring-emerald-400/50'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                                title="తెలుగు భాషలో మాట్లాడండి"
                            >
                                <Languages size={12} /> 🇮🇳 తెలుగు
                            </button>
                            <button
                                onClick={() => handleLanguageChange('en')}
                                className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                                    selectedLang === 'en'
                                        ? 'bg-blue-600 text-white shadow-md font-black ring-1 ring-blue-400/50'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                                title="Switch to English"
                            >
                                <Languages size={12} /> 🇬🇧 English
                            </button>
                        </div>

                        {/* AI Engine Status & Settings Button */}
                        <button
                            onClick={() => setShowAiSettings(true)}
                            className="px-2.5 py-1.5 rounded-full bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/35 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                            title="Configure AI Model Engine (Free Groq / Gemini / Cloud AI)"
                        >
                            <Sparkles size={11} className="text-purple-400" />
                            <span className="hidden md:inline">AI:</span>
                            <span className="text-white font-extrabold">
                                {aiConfig.provider === 'groq' ? 'Groq Llama 3' : aiConfig.provider === 'gemini' ? 'Gemini Flash' : 'Cloud AI'}
                            </span>
                        </button>

                        <div className="bg-black/60 border border-white/10 px-3 py-1.5 rounded-full text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 shadow-inner">
                            <Activity size={13} className="text-emerald-400 animate-pulse" />
                            {formatTime(callDuration)}
                        </div>

                        <button
                            onClick={handleEndCall}
                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                            title="End Call"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Main Video Call & Clinical Scribe Area */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden">
                    {/* Video Canvas (2 cols) */}
                    <div className="lg:col-span-2 relative bg-zinc-950 flex flex-col justify-between p-4 md:p-6 overflow-hidden">
                        {/* Main Screen Stream */}
                        <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 border border-white/10 flex flex-col items-center justify-center shadow-2xl">
                            {/* IF PATIENT IS MAIN VIEW */}
                            {swapView ? (
                                hasCamera && !isVideoOff ? (
                                    <video
                                        ref={patientVideoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover rounded-3xl scale-x-[-1]"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                                        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                            <Camera size={36} className="text-zinc-500 animate-pulse" />
                                        </div>
                                        <p className="text-xs text-zinc-400 max-w-xs">{cameraError || "Camera feed turned off."}</p>
                                    </div>
                                )
                            ) : (
                                /* DOCTOR MAIN VIEW */
                                <div className="relative w-full h-full flex flex-col items-center justify-center">
                                    {/* Medical Consultation Clip / Doctor Live Simulation */}
                                    <video
                                        ref={doctorVideoRef}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="absolute inset-0 w-full h-full object-cover opacity-70 filter brightness-90 contrast-105"
                                        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                                    />

                                    {/* Doctor Live Overlay Card */}
                                    <div className="relative z-10 text-center space-y-3 bg-black/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl max-w-sm">
                                        <div className="relative inline-block">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-1 shadow-[0_0_40px_rgba(59,130,246,0.5)]">
                                                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-3xl font-black text-white italic">
                                                    {assignedDoc.name.replace("Dr. ", "").charAt(0)}
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 right-1 p-1 bg-emerald-500 rounded-full border-2 border-zinc-900 shadow-[0_0_8px_#10b981]">
                                                <UserCheck size={14} className="text-zinc-950" />
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-lg font-black text-white italic">
                                                {assignedDoc.name}
                                            </h4>
                                            <p className="text-xs text-blue-400 font-semibold">
                                                {assignedDoc.specialization} ({assignedDoc.experience})
                                            </p>
                                        </div>

                                        {/* Audio waveform */}
                                        <div className="flex items-center justify-center gap-1 pt-1">
                                            {[40, 75, 50, 90, 60, 30, 80, 55, 45].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1 rounded-full transition-all duration-300 ${
                                                        doctorSpeaking
                                                            ? 'bg-blue-400 animate-pulse'
                                                            : isDoctorThinking
                                                            ? 'bg-purple-400 animate-bounce'
                                                            : isDoctorListening
                                                            ? 'bg-emerald-400 animate-pulse'
                                                            : 'bg-zinc-600'
                                                    }`}
                                                    style={{
                                                        height: doctorSpeaking
                                                            ? `${h * 0.35}px`
                                                            : isDoctorThinking
                                                            ? `${(h * 0.28) + 4}px`
                                                            : isDoctorListening
                                                            ? `${(h % 30) + 6}px`
                                                            : '4px',
                                                        animationDuration: `${0.3 + (i * 0.1)}s`
                                                    }}
                                                />
                                            ))}
                                            <span className="text-[10px] font-bold uppercase ml-2 tracking-wider">
                                                {doctorSpeaking ? (
                                                    <span className="text-blue-400 animate-pulse">
                                                        {isTelugu ? "సమాధానం చెబుతున్నారు..." : "Doctor Speaking..."}
                                                    </span>
                                                ) : isDoctorThinking ? (
                                                    <span className="text-purple-400 animate-pulse flex items-center gap-1">
                                                        <Sparkles size={11} className="animate-spin text-purple-400" />
                                                        {isTelugu ? "సమాధానం ఆలోచిస్తున్నారు..." : "AI Consulting..."}
                                                    </span>
                                                ) : isMuted ? (
                                                    <span className="text-red-400">{isTelugu ? "మ్యూట్" : "Mic Muted"}</span>
                                                ) : isDoctorListening ? (
                                                    <span className="text-emerald-400 flex items-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                                                        {isTelugu ? "వింటున్నారు..." : "Doctor Listening"}
                                                    </span>
                                                ) : (
                                                    <span className="text-zinc-400">Ready</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PIP Mini Window (Shows other participant) */}
                            <div className="absolute bottom-4 right-4 w-36 md:w-48 h-28 md:h-36 rounded-2xl bg-zinc-900/90 border border-white/20 backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col items-center justify-center z-20">
                                {swapView ? (
                                    /* Doctor Mini view */
                                    <div className="relative w-full h-full flex flex-col items-center justify-center p-2 text-center bg-black/80">
                                        <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-sm font-bold border border-blue-500/30">
                                            {assignedDoc.name.charAt(4)}
                                        </div>
                                        <span className="text-[10px] font-bold text-white mt-1 line-clamp-1">{assignedDoc.name}</span>
                                        <span className="text-[8px] text-emerald-400 font-mono">Attending MD</span>
                                    </div>
                                ) : (
                                    /* Real Patient Webcam Mini Feed */
                                    hasCamera && !isVideoOff ? (
                                        <div className="relative w-full h-full">
                                            <video
                                                ref={patientVideoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover scale-x-[-1]"
                                            />
                                            <div className="absolute bottom-1 left-2 text-[8px] bg-black/60 px-1.5 py-0.5 rounded font-bold text-white">
                                                You (Live HD)
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-full flex flex-col items-center justify-center bg-zinc-900 p-2 text-center">
                                            <VideoOff size={18} className="text-zinc-500 mb-1" />
                                            <span className="text-[9px] text-zinc-400 font-bold uppercase">
                                                {isVideoOff ? "Camera Off" : "No Camera"}
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Swap Screen Button */}
                            <button
                                onClick={() => setSwapView(!swapView)}
                                className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold uppercase tracking-wider border border-white/10 flex items-center gap-1.5 cursor-pointer backdrop-blur-md transition-all"
                            >
                                <RefreshCw size={12} /> Swap Views
                            </button>
                        </div>

                        {/* Interactive Call Controls Bar */}
                        <div className="flex items-center justify-center gap-3 pt-4">
                            <button
                                onClick={toggleMic}
                                className={`h-12 px-4 rounded-2xl flex items-center gap-2 border font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                                    isMuted
                                        ? 'bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-500/20'
                                        : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                                }`}
                                title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                            >
                                {isMuted ? <MicOff size={18} /> : <Mic size={18} className="animate-pulse" />}
                                <span>{isMuted ? (isTelugu ? "మ్యూట్" : "Mic Muted") : (isTelugu ? "మైక్ ఆన్" : "Mic Active")}</span>
                            </button>

                            <button
                                onClick={toggleVideo}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
                                    isVideoOff
                                        ? 'bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-500/20'
                                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                }`}
                                title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                            >
                                {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
                            </button>

                            <button
                                onClick={() => {
                                    setIsScreenSharing(!isScreenSharing);
                                    addToast(isScreenSharing ? "Screen sharing ended." : "Sharing diagnostic vitals screen.", "info");
                                }}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
                                    isScreenSharing
                                        ? 'bg-blue-600 border-blue-400 text-white'
                                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                }`}
                                title="Share Screen / Diagnostics"
                            >
                                <Share2 size={18} />
                            </button>

                            <button
                                onClick={handleEndCall}
                                className="px-6 h-12 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase text-xs tracking-wider flex items-center gap-2 shadow-xl shadow-red-600/30 transition-all cursor-pointer hover:scale-[1.02]"
                                title="Click or speak 'End Call' / 'కాల్ కట్ చేయి'"
                            >
                                <PhoneOff size={18} /> {isTelugu ? "కాల్ ముగించండి" : "End Consultation"}
                            </button>
                        </div>
                    </div>

                    {/* AI Clinical Scribe, Real-time Speech Hub & Consultation Dialogue Panel */}
                    <div className="bg-zinc-900/40 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col p-5 overflow-y-auto space-y-3.5">
                        {/* Status bar */}
                        <div className="flex justify-between items-center pb-1 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-purple-400 animate-spin" />
                                <span className="text-[11px] font-black uppercase text-purple-400 tracking-wider">
                                    AI Clinical Voice Scribe
                                </span>
                            </div>
                            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                                isDoctorThinking
                                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/40 animate-pulse'
                                    : isDoctorListening
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                    : doctorSpeaking
                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}>
                                <Radio size={10} className={isDoctorListening || isDoctorThinking ? "animate-pulse" : ""} />
                                {doctorSpeaking
                                    ? (isTelugu ? "సమాధానం ఇస్తున్నారు" : "Doctor Speaking")
                                    : isDoctorThinking
                                    ? (isTelugu ? "AI ఆలోచిస్తున్నారు" : "AI Thinking")
                                    : isDoctorListening
                                    ? (isTelugu ? "వింటున్నారు" : "Doctor Listening")
                                    : "Audio Connected"}
                            </span>
                        </div>

                        {/* LIVE DOCTOR LISTENING BANNER & INTERIM TRANSCRIPTION */}
                        <div className={`p-3.5 rounded-2xl border transition-all duration-300 shadow-lg ${
                            doctorSpeaking
                                ? 'bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border-blue-500/40 shadow-blue-500/10'
                                : isDoctorThinking
                                ? 'bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-blue-950/60 border-purple-500/50 shadow-purple-500/20 ring-1 ring-purple-500/30'
                                : isDoctorListening
                                ? 'bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border-emerald-500/40 shadow-emerald-500/10'
                                : 'bg-zinc-900/60 border-white/10'
                        }`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {doctorSpeaking ? (
                                        <>
                                            <Volume2 size={16} className="text-blue-400 animate-bounce" />
                                            <span className="text-xs font-black text-blue-300 uppercase tracking-wide">
                                                {isTelugu ? "డాక్టర్ శ్రీరామ్ సమాధానం ఇస్తున్నారు..." : "Dr. Sriram is Speaking Aloud..."}
                                            </span>
                                        </>
                                    ) : isDoctorThinking ? (
                                        <>
                                            <Sparkles size={16} className="text-purple-400 animate-spin" />
                                            <span className="text-xs font-black text-purple-300 uppercase tracking-wide flex items-center gap-1.5">
                                                {isTelugu ? "✨ AI డాక్టర్ సమాధానం సిద్ధం చేస్తున్నారు..." : "✨ AI Doctor Analyzing in Real-Time..."}
                                            </span>
                                        </>
                                    ) : isDoctorListening ? (
                                        <>
                                            <div className="relative">
                                                <Mic size={16} className="text-emerald-400" />
                                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                            </div>
                                            <span className="text-xs font-black text-emerald-300 uppercase tracking-wide">
                                                {isTelugu ? "డాక్టర్ శ్రీరామ్ మీ మాటలు వింటున్నారు" : "Dr. Sriram is Listening to You"}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <MicOff size={16} className="text-red-400" />
                                            <span className="text-xs font-black text-red-300 uppercase tracking-wide">
                                                {isTelugu ? "మైక్రోఫోన్ మ్యూట్ చేయబడింది" : "Microphone Muted"}
                                            </span>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={toggleMic}
                                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer transition-colors"
                                >
                                    {isMuted ? (isTelugu ? "అన్‌మ్యూట్" : "Click to Unmute") : (isTelugu ? "మ్యూట్" : "Mute Mic")}
                                </button>
                            </div>

                            {/* Live Speech Feedback Box */}
                            <div className="min-h-[44px] bg-black/50 rounded-xl p-2.5 border border-white/5 flex items-center">
                                {isDoctorThinking ? (
                                    <div className="flex items-center gap-2 text-purple-300 w-full">
                                        <Sparkles size={14} className="animate-spin text-purple-400 shrink-0" />
                                        <p className="text-xs italic font-medium animate-pulse truncate">
                                            {isTelugu
                                                ? `"${lastSpokenText}" కు ప్రత్యేక వైద్య సలహాను రూపొందిస్తున్నారు...`
                                                : `Formulating personalized clinical advice for "${lastSpokenText}"...`}
                                        </p>
                                    </div>
                                ) : interimTranscript ? (
                                    <div className="space-y-0.5">
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                                            {isTelugu ? "వింటున్నాము:" : "Hearing you right now:"}
                                        </span>
                                        <p className="text-xs text-white italic font-medium">
                                            "{interimTranscript}..."
                                        </p>
                                    </div>
                                ) : doctorSpeaking ? (
                                    <p className="text-xs text-blue-200 italic font-mono">
                                        {isTelugu ? "వైద్య సలహా వివరిస్తున్నారు..." : "Dr. Sriram explaining clinical advice..."}
                                    </p>
                                ) : lastSpokenText ? (
                                    <div className="space-y-0.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                                                {isTelugu ? "చివరగా విన్నది:" : "Listening for your next question:"}
                                            </span>
                                            <span className="text-[9px] text-zinc-500 font-mono">Logged</span>
                                        </div>
                                        <p className="text-xs text-emerald-300 italic font-medium line-clamp-1">
                                            "{lastSpokenText}"
                                        </p>
                                    </div>
                                ) : isDoctorListening ? (
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <p className="text-xs text-emerald-400/90 font-medium">
                                            {isTelugu
                                                ? "మీ సమస్య చెప్పండి, లేదా 'కాల్ ఎండ్' అనండి..."
                                                : "Speak your question, or say 'End Call' to finish..."}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-zinc-500 italic">
                                        {isTelugu ? "డాక్టర్‌తో మాట్లాడటానికి మైక్ ఆన్ చేయండి." : "Unmute your microphone to speak directly to Dr. Sriram."}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Quick One-Tap Clinical Inquiries in English or Telugu */}
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <Headphones size={11} className="text-zinc-400" />
                                    {isTelugu ? "రియల్ టైమ్ AI ప్రశ్నలు:" : "Real-Time AI Questions:"}
                                </span>
                                <span className="text-[9px] text-zinc-600 font-mono">
                                    {isTelugu ? "లేదా మైక్‌లో ఏదైనా అడగండి" : "or speak anything into mic"}
                                </span>
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {isTelugu ? (
                                    <>
                                        <button
                                            onClick={() => handleQuickInquiry("మందులు ఎప్పుడు వేసుకోవాలి?")}
                                            disabled={isDoctorThinking || doctorSpeaking}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-emerald-600/20 hover:border-emerald-500/40 border border-white/5 text-left text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer line-clamp-1 disabled:opacity-50"
                                        >
                                            💬 "మందులు ఎప్పుడు వేసుకోవాలి?"
                                        </button>
                                        <button
                                            onClick={() => handleQuickInquiry("ఎన్ని రోజుల్లో జ్వరం తగ్గుతుంది?")}
                                            disabled={isDoctorThinking || doctorSpeaking}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-emerald-600/20 hover:border-emerald-500/40 border border-white/5 text-left text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer line-clamp-1 disabled:opacity-50"
                                        >
                                            💬 "ఎన్ని రోజుల్లో తగ్గుతుంది?"
                                        </button>
                                        <button
                                            onClick={() => handleQuickInquiry("కడుపు నొప్పి మరియు వాంతులు అవుతున్నాయి")}
                                            disabled={isDoctorThinking || doctorSpeaking}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-emerald-600/20 hover:border-emerald-500/40 border border-white/5 text-left text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer line-clamp-1 disabled:opacity-50"
                                        >
                                            💬 "కడుపు నొప్పి / వాంతులు"
                                        </button>
                                        <button
                                            onClick={() => handleQuickInquiry("ఆహారంలో ఏమి తినాలి, మజ్జిగ తాగవచ్చా?")}
                                            disabled={isDoctorThinking || doctorSpeaking}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-emerald-600/20 hover:border-emerald-500/40 border border-white/5 text-left text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer line-clamp-1 disabled:opacity-50"
                                        >
                                            💬 "ఏమి తినాలి, మజ్జిగ తాగవచ్చా?"
                                        </button>
                                        <button
                                            onClick={() => handleQuickInquiry("రక్త పరీక్షలు ఏమైనా చేయించాలా?")}
                                            disabled={isDoctorThinking || doctorSpeaking}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-emerald-600/20 hover:border-emerald-500/40 border border-white/5 text-left text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer line-clamp-1 disabled:opacity-50"
                                        >
                                            💬 "బ్లడ్ టెస్టులు అవసరమా?"
                                        </button>
                                        <button
                                            onClick={() => handleQuickInquiry("ఆఫీస్‌కి వెళ్లవచ్చా లేదా రెస్ట్ తీసుకోవాలా?")}
                                            disabled={isDoctorThinking || doctorSpeaking}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-emerald-600/20 hover:border-emerald-500/40 border border-white/5 text-left text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer line-clamp-1 disabled:opacity-50"
                                        >
                                            💬 "ఆఫీస్‌కు వెళ్లవచ్చా?"
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleQuickInquiry("Doctor, how should I take my medications?")}
                                            disabled={isDoctorThinking || doctorSpeaking}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/40 border border-white/5 text-left text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer line-clamp-1 disabled:opacity-50"
                                        >
                                            💬 "How to take medicines?"
                                        </button>
                                        <button
                                            onClick={() => handleQuickInquiry("When should I expect symptoms to improve?")}
                                            disabled={isDoctorThinking || doctorSpeaking}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/40 border border-white/5 text-left text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer line-clamp-1 disabled:opacity-50"
                                        >
                                            💬 "When will I recover?"
                                        </button>
                                        <button
                                            onClick={() => handleQuickInquiry("I have stomach pain and nausea")}
                                            disabled={isDoctorThinking || doctorSpeaking}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/40 border border-white/5 text-left text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer line-clamp-1 disabled:opacity-50"
                                        >
                                            💬 "Stomach pain & nausea?"
                                        </button>
                                        <button
                                            onClick={() => handleQuickInquiry("Are there any dietary or food restrictions?")}
                                            disabled={isDoctorThinking || doctorSpeaking}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/40 border border-white/5 text-left text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer line-clamp-1 disabled:opacity-50"
                                        >
                                            💬 "Any food restrictions?"
                                        </button>
                                        <button
                                            onClick={() => handleQuickInquiry("Do I need to take any blood tests?")}
                                            disabled={isDoctorThinking || doctorSpeaking}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/40 border border-white/5 text-left text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer line-clamp-1 disabled:opacity-50"
                                        >
                                            💬 "Do I need blood tests?"
                                        </button>
                                        <button
                                            onClick={() => handleQuickInquiry("Can I go to office or work?")}
                                            disabled={isDoctorThinking || doctorSpeaking}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/40 border border-white/5 text-left text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer line-clamp-1 disabled:opacity-50"
                                        >
                                            💬 "Can I go to work?"
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Live Conversation Stream */}
                        <div className="flex-1 bg-black/50 border border-white/10 rounded-2xl p-3.5 space-y-2.5 overflow-y-auto max-h-56 scrollbar-thin">
                            {chatMessages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`p-2.5 rounded-xl text-xs space-y-1 ${
                                        msg.isDoctor
                                            ? 'bg-blue-950/40 border border-blue-500/30 text-blue-200'
                                            : 'bg-white/5 border border-white/10 text-zinc-300 ml-4'
                                    }`}
                                >
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className={msg.isDoctor ? 'text-blue-400 font-black' : 'text-emerald-400'}>
                                            {msg.sender}
                                        </span>
                                        <span className="font-mono text-[9px] text-zinc-500">{msg.time}</span>
                                    </div>
                                    <p className="leading-relaxed">{msg.text}</p>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Secondary text input for noisy environment */}
                        <form onSubmit={handleSendCustomQuestion} className="space-y-1">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                                {isTelugu ? "⌨️ ఇక్కడ టైప్ చేయవచ్చు లేదా మైక్‌లో మాట్లాడండి:" : "⌨️ Quiet environment? You can also type below:"}
                            </span>
                            <div className="flex gap-2">
                                <input
                                    value={customQuestion}
                                    onChange={(e) => setCustomQuestion(e.target.value)}
                                    placeholder={isTelugu ? "ప్రశ్నను ఇక్కడ టైప్ చేయండి లేదా 'కాల్ ఎండ్' అనండి..." : "Type a question or 'end call'..."}
                                    className="flex-1 bg-black/60 border border-white/10 px-3.5 py-2 rounded-xl text-xs text-white placeholder:text-zinc-600 outline-none focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl cursor-pointer transition-colors"
                                    title="Send Question"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </form>

                        {/* Digital Rx & Pharmacy Fulfillment Row */}
                        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-purple-950/30 to-emerald-950/30 border border-blue-500/30 space-y-2">
                            <span className="text-[10px] font-black uppercase text-white tracking-wider flex items-center justify-between">
                                <span>{isTelugu ? "డిజిటల్ ప్రిస్క్రిప్షన్" : "Consultation Prescription"}</span>
                                <span className="text-emerald-400 font-mono text-[9px]">Token #{activePatient.token}</span>
                            </span>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => {
                                        const targetPatient = {
                                            ...patient,
                                            ...activePatient,
                                            name: activePatient.name,
                                            phone: activePatient.phone,
                                            issue: activePatient.issue,
                                            days: activePatient.days,
                                            token: activePatient.token,
                                            doctorAssigned: assignedDoc.id
                                        };
                                        if (setSelectedPrescriptionPatient) {
                                            setSelectedPrescriptionPatient(targetPatient);
                                        }
                                        setPatient(targetPatient);
                                        handleEndCall();
                                        setShowPrescriptionModal(true);
                                    }}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                                >
                                    <FileText size={14} /> {isTelugu ? "డిజిటల్ ప్రిస్క్రిప్షన్ తెరవండి" : "Open Digital Prescription Slip"}
                                </button>

                                <button
                                    onClick={() => {
                                        const targetPatient = {
                                            ...patient,
                                            ...activePatient,
                                            name: activePatient.name,
                                            phone: activePatient.phone,
                                            issue: activePatient.issue,
                                            days: activePatient.days,
                                            token: activePatient.token,
                                            doctorAssigned: assignedDoc.id
                                        };
                                        setPatient(targetPatient);
                                        if (setSelectedPrescriptionPatient) {
                                            setSelectedPrescriptionPatient(targetPatient);
                                        }
                                        setTokenVerified(true);
                                        setGridPhase(3);
                                        setSubStep(5.5);
                                        setActivePage('dashboard');
                                        handleEndCall();
                                        addToast(
                                            isTelugu
                                                ? `${targetPatient.name} కొరకు ఫార్మసీ ప్రారంభించబడింది. పికప్ లేదా డెలివరీ ఎంచుకోండి.`
                                                : `Prescription for ${targetPatient.name} routed to Pharmacy. Choose Pickup or Delivery.`,
                                            "success"
                                        );
                                    }}
                                    className="w-full py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                                >
                                    <ShoppingBag size={13} /> {isTelugu ? "మరిన్ని మందులు కావాలి" : "Need More Medicine"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Model Configuration Modal */}
                {showAiSettings && (
                    <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-zinc-900 border border-purple-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="text-purple-400" size={18} />
                                    <h4 className="text-sm font-black text-white uppercase tracking-wider">
                                        {isTelugu ? "AI డాక్టర్ మోడల్ సెట్టింగ్‌లు" : "AI Consultant Engine Settings"}
                                    </h4>
                                </div>
                                <button
                                    onClick={() => setShowAiSettings(false)}
                                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <p className="text-xs text-zinc-400 leading-relaxed">
                                {isTelugu
                                    ? "కేర్ కనెక్ట్ రియల్-టైమ్ జనరేటివ్ AI మోడల్‌తో రోగి అడిగే ప్రతి ప్రశ్నకు విభిన్నంగా, సరైన సమాధానం ఇస్తుంది. అత్యంత వేగవంతమైన రెస్పాన్స్ (0.3s) కొరకు ఉచిత Groq లేదా Gemini కీని జోడించవచ్చు."
                                    : "CareConnect uses real-time Generative AI to understand unique medical phrasing. For sub-second (0.3s) voice responses, you can optionally provide a free Groq or Gemini API key."}
                            </p>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-300">
                                    {isTelugu ? "AI ప్రొవైడర్ ఎంచుకోండి:" : "Select AI Provider:"}
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedAiProvider('cloud_free')}
                                        className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                                            selectedAiProvider === 'cloud_free'
                                                ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                                                : 'bg-zinc-800/60 border-white/10 text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        🌐 Cloud AI
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedAiProvider('groq')}
                                        className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                                            selectedAiProvider === 'groq'
                                                ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                                                : 'bg-zinc-800/60 border-white/10 text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        ⚡ Groq (0.3s)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedAiProvider('gemini')}
                                        className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                                            selectedAiProvider === 'gemini'
                                                ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                                                : 'bg-zinc-800/60 border-white/10 text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        ✨ Gemini
                                    </button>
                                </div>
                            </div>

                            {selectedAiProvider !== 'cloud_free' && (
                                <div className="space-y-1.5 animate-in fade-in">
                                    <label className="text-xs font-bold text-zinc-300">
                                        {selectedAiProvider === 'groq' ? 'Groq API Key (starts with gsk_):' : 'Google Gemini API Key (starts with AIza):'}
                                    </label>
                                    <input
                                        type="password"
                                        value={customApiKey}
                                        onChange={(e) => setCustomApiKey(e.target.value)}
                                        placeholder={selectedAiProvider === 'groq' ? "gsk_..." : "AIzaSy..."}
                                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                                    />
                                    <p className="text-[10px] text-zinc-500">
                                        {selectedAiProvider === 'groq'
                                            ? "Get a free key at console.groq.com (no credit card required)"
                                            : "Get a free key at aistudio.google.com"}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAiSettings(false)}
                                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-bold cursor-pointer"
                                >
                                    {isTelugu ? "రద్దు" : "Cancel"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveAiSettings}
                                    className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 cursor-pointer"
                                >
                                    {isTelugu ? "సేవ్ చేయండి" : "Save & Apply"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
