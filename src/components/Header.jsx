import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { speechEngine } from '../services/speechService';
import { Zap, Settings, Activity, ArrowLeft } from 'lucide-react';

export default function Header() {
    const {
        gridPhase,
        mode,
        setMode,
        setShowSidebar,
        activePage,
        setActivePage,
        setAiMsg,
        addToast
    } = useHospital();

    const handleToggleMode = (newMode) => {
        setMode(newMode);
        speechEngine.setMode(newMode);

        if (newMode === 'ai') {
            setAiMsg("Welcome to CareConnect AI Assistant. Please state your full name to begin.");
            speechEngine.speak("Welcome to CareConnect AI Hospital Assistant. Please tell me your full name.");
            addToast("AI Voice Assistant Activated. Speak into your microphone.", "info");
        } else {
            speechEngine.cancelSpeech();
            speechEngine.stopListening();
            setAiMsg("Manual Control Active. Click options to proceed.");
            addToast("Switched to Manual Control Mode.", "info");
        }
    };

    return (
        <header className="flex justify-between items-center bg-zinc-900/90 border border-white/10 p-5 md:p-6 rounded-[2rem] shadow-2xl backdrop-blur-xl shrink-0">
            {/* Left: Hamburger & Brand */}
            <div className="flex items-center gap-4 md:gap-5">
                <button
                    onClick={() => setShowSidebar(true)}
                    className="p-3 bg-black/60 rounded-2xl border border-white/10 hover:border-blue-500/50 hover:bg-blue-600/20 transition-all cursor-pointer group"
                    title="Open Navigation Menu"
                >
                    <div className="flex flex-col gap-1.5 w-5">
                        <span className="w-5 h-[2px] bg-white group-hover:bg-blue-400 transition-colors"></span>
                        <span className="w-3.5 h-[2px] bg-white group-hover:bg-blue-400 transition-colors"></span>
                        <span className="w-5 h-[2px] bg-white group-hover:bg-blue-400 transition-colors"></span>
                    </div>
                </button>

                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25">
                    <Zap className="text-white w-5 h-5" fill="currentColor" />
                </div>

                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl md:text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                            CareConnect <span className="text-blue-500">v7.0</span>
                        </h1>
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            PRO CLINIC
                        </span>
                    </div>

                    {/* Progress indicators when on dashboard */}
                    {activePage === "dashboard" ? (
                        <div className="flex items-center gap-2 mt-2">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
                                        gridPhase >= i
                                            ? 'bg-blue-500 shadow-[0_0_12px_#3b82f6]'
                                            : 'bg-white/10'
                                    }`}
                                />
                            ))}
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">
                                Phase 0{gridPhase} / 03
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 mt-1.5">
                            <button
                                onClick={() => setActivePage("dashboard")}
                                className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                <ArrowLeft className="w-3 h-3" /> Back to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Manual vs AI switch */}
            <div className="flex items-center gap-3">
                <div className="flex bg-black/70 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                    <button
                        onClick={() => handleToggleMode('manual')}
                        className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 cursor-pointer ${
                            mode === 'manual'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <Settings size={13} />
                        <span className="hidden sm:inline">Manual</span>
                    </button>

                    <button
                        onClick={() => handleToggleMode('ai')}
                        className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 cursor-pointer ${
                            mode === 'ai'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 animate-pulse'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <Activity size={13} />
                        <span className="hidden sm:inline">AI Assisted</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
