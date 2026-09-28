import React, { useEffect, useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { speechEngine } from '../services/speechService';
import { Activity, Mic, MicOff, Volume2, HelpCircle, User } from 'lucide-react';

export default function VoiceVisualizer() {
    const {
        mode,
        aiMsg,
        setAiMsg,
        lastHeardTranscript,
        setShowVoiceHelpModal
    } = useHospital();

    const [isListening, setIsListening] = useState(false);
    const [interimText, setInterimText] = useState("");

    useEffect(() => {
        speechEngine.onStatusChange = (status) => {
            setIsListening(status);
            if (!status) setInterimText("");
        };

        speechEngine.onInterimCallback = (text) => {
            setInterimText(text);
        };
    }, []);

    const toggleListening = () => {
        if (isListening) {
            speechEngine.stopListening();
            setAiMsg("Listening paused. Tap microphone to resume.");
        } else {
            speechEngine.startListening();
            setAiMsg("Listening for your voice input...");
        }
    };

    return (
        <div
            className={`relative p-5 md:p-6 rounded-[2.5rem] shadow-xl text-center flex flex-col md:flex-row items-center justify-between gap-5 overflow-hidden transition-all duration-700 shrink-0 ${
                mode === 'ai'
                    ? 'bg-gradient-to-r from-blue-950/70 via-indigo-950/80 to-blue-900/70 border border-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/30'
                    : 'bg-zinc-900/80 border border-white/10'
            }`}
        >
            {/* Left: Mic toggle & Waveform */}
            <div className="flex items-center gap-3.5">
                <div className="relative">
                    <button
                        onClick={toggleListening}
                        className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                            isListening
                                ? 'bg-red-600 border-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.6)] animate-pulse'
                                : mode === 'ai'
                                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30'
                                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                        }`}
                        title={isListening ? "Microphone active (click to pause)" : "Click to activate microphone"}
                    >
                        {isListening ? <Mic size={20} className="animate-bounce" /> : <MicOff size={20} />}
                    </button>

                    {isListening && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></span>
                    )}
                </div>

                {/* Animated Voice Equalizer */}
                {isListening ? (
                    <div className="flex items-end gap-1.5 h-8">
                        <div className="voice-bar bar-1 bg-blue-400 shadow-[0_0_10px_#60a5fa]"></div>
                        <div className="voice-bar bar-2 bg-indigo-400 shadow-[0_0_10px_#818cf8]"></div>
                        <div className="voice-bar bar-3 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
                        <div className="voice-bar bar-4 bg-emerald-400 shadow-[0_0_10px_#34d399]"></div>
                        <div className="voice-bar bar-5 bg-blue-400 shadow-[0_0_10px_#60a5fa]"></div>
                    </div>
                ) : (
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 uppercase">
                        <span>Standby</span>
                    </div>
                )}
            </div>

            {/* Center: Live Speech Transcript & AI Response */}
            <div className="flex-1 text-center md:text-left px-2 max-w-3xl space-y-1">
                {/* Real-time speech recognition preview (NEW FEATURE) */}
                {(interimText || lastHeardTranscript) && (
                    <div className="flex items-center justify-center md:justify-start gap-1.5 text-[11px] text-blue-300 font-mono">
                        <User size={12} className="text-blue-400 shrink-0" />
                        <span className="font-bold text-zinc-400">Heard:</span>{" "}
                        <span className="italic truncate text-white bg-white/5 px-2 py-0.5 rounded-md">
                            "{interimText || lastHeardTranscript}"
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-center md:justify-start gap-2">
                    <Activity size={13} className={mode === 'ai' ? 'text-blue-400 animate-pulse' : 'text-zinc-500'} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        {mode === 'ai' ? 'CareConnect AI Assistant' : 'Assistant Feed'}
                    </span>
                </div>

                <p className="text-sm md:text-base italic font-serif text-white tracking-wide leading-relaxed line-clamp-2">
                    "{aiMsg}"
                </p>
            </div>

            {/* Right: Audio repeat & Commands Guide trigger */}
            <div className="flex items-center gap-2.5">
                <button
                    onClick={() => speechEngine.speak(aiMsg)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
                    title="Repeat Audio Guidance"
                >
                    <Volume2 size={15} /> <span className="hidden sm:inline">Repeat</span>
                </button>

                <button
                    onClick={() => setShowVoiceHelpModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-blue-300 hover:text-white transition-all cursor-pointer"
                    title="Voice Commands Cheatsheet & Audio Settings"
                >
                    <HelpCircle size={15} /> <span className="hidden sm:inline">Voice Guide</span>
                </button>
            </div>
        </div>
    );
}
