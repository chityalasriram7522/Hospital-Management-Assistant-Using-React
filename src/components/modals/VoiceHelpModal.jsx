import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { speechEngine } from '../../services/speechService';
import { Mic, X, Siren, Compass, Stethoscope, Sliders } from 'lucide-react';

export default function VoiceHelpModal() {
    const { showVoiceHelpModal, setShowVoiceHelpModal, addToast } = useHospital();
    const [speed, setSpeed] = useState(1.0);
    const [language, setLanguage] = useState("en-IN");

    if (!showVoiceHelpModal) return null;

    const handleSpeedChange = (newSpeed) => {
        setSpeed(newSpeed);
        speechEngine.rate = newSpeed;
        addToast(`Voice speed set to ${newSpeed}x`, "info");
    };

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        speechEngine.setLanguage(lang);
        addToast(`Voice accent set to ${lang === 'en-IN' ? 'Indian English' : 'US English'}`, "info");
    };

    return (
        <div className="fixed inset-0 z-[600] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-6 md:p-8 max-w-xl w-full shadow-2xl text-zinc-300 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-blue-400">
                            <Mic size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">
                                Assistant Guide & Audio Controls
                            </span>
                            <h2 className="text-xl font-black text-white uppercase italic">
                                AI Voice Capabilities
                            </h2>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowVoiceHelpModal(false)}
                        className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Voice Controls: Speed & Accent */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                        <Sliders size={12} /> Audio Configuration
                    </span>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1.5">
                                Speech Rate
                            </label>
                            <div className="flex gap-2">
                                {[0.8, 1.0, 1.2].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleSpeedChange(s)}
                                        className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
                                            speed === s
                                                ? 'bg-blue-600 border-blue-400 text-white'
                                                : 'bg-black/40 border-white/5 text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        {s}x
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1.5">
                                Accent Model
                            </label>
                            <div className="flex gap-2">
                                {[
                                    { code: "en-IN", label: "Indian" },
                                    { code: "en-US", label: "US" }
                                ].map(l => (
                                    <button
                                        key={l.code}
                                        onClick={() => handleLanguageChange(l.code)}
                                        className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
                                            language === l.code
                                                ? 'bg-blue-600 border-blue-400 text-white'
                                                : 'bg-black/40 border-white/5 text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Command Cheatsheet Categories */}
                <div className="space-y-4 max-h-[340px] overflow-y-auto scrollbar-hide pr-1">
                    {/* Emergency Category */}
                    <div className="p-4 bg-red-950/30 border border-red-500/40 rounded-2xl space-y-2">
                        <span className="text-[10px] font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                            <Siren size={13} className="animate-pulse" /> Emergency Voice Override ("Code Red")
                        </span>
                        <p className="text-xs text-zinc-300">
                            Say anytime: <span className="font-mono text-red-300 font-bold">"Emergency!"</span>,{" "}
                            <span className="font-mono text-red-300 font-bold">"Call Ambulance"</span>,{" "}
                            <span className="font-mono text-red-300 font-bold">"Severe chest pain"</span>, or{" "}
                            <span className="font-mono text-red-300 font-bold">"Code Red"</span> to immediately trigger trauma broadcast!
                        </p>
                    </div>

                    {/* Navigation Category */}
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                        <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                            <Compass size={13} /> Global Voice Navigation
                        </span>
                        <ul className="text-xs text-zinc-300 space-y-1">
                            <li>• <span className="font-mono text-white">"Open patient records"</span> — EHR cloud archives</li>
                            <li>• <span className="font-mono text-white">"Open hospital overview"</span> — view bed matrix & staff</li>
                            <li>• <span className="font-mono text-white">"Open blood donation"</span> — donor registration</li>
                            <li>• <span className="font-mono text-white">"Open help desk"</span> — FAQs & support tickets</li>
                            <li>• <span className="font-mono text-white">"Go back to dashboard"</span> — restart triage</li>
                        </ul>
                    </div>

                    {/* Clinical Triage & Booking */}
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                            <Stethoscope size={13} /> Clinical Triage & Token Flow
                        </span>
                        <ul className="text-xs text-zinc-300 space-y-1.5">
                            <li>• <strong>Step 1 (Name):</strong> <span className="font-mono text-white">"Sriram Chityala"</span></li>
                            <li>• <strong>Step 2 (Symptoms):</strong> <span className="font-mono text-white">"Fever and severe cough"</span></li>
                            <li>• <strong>Step 3 (Booking):</strong> <span className="font-mono text-white">"Yes, book appointment"</span></li>
                            <li>• <strong>Step 4 (Date & Slot):</strong> <span className="font-mono text-white">"Tomorrow at morning"</span> (or say <span className="font-mono text-white">"Tomorrow"</span>, then <span className="font-mono text-white">"Morning"</span>)</li>
                            <li>• <strong>Step 5 (Phone):</strong> <span className="font-mono text-white">"9876543210"</span> (10 digits)</li>
                            <li>• <strong>Step 6 (Verify Token):</strong> <span className="font-mono text-white">"9842"</span> (or repeat digit by digit)</li>
                            <li>• <strong>Step 7 (Course Days):</strong> <span className="font-mono text-white">"5 days"</span> (or <span className="font-mono text-white">"3 days"</span> / <span className="font-mono text-white">"10 days"</span>)</li>
                            <li>• <strong>Step 8 (Method):</strong> <span className="font-mono text-white">"Pickup"</span> (Ground Floor) or <span className="font-mono text-white">"Home Delivery"</span></li>
                            <li>• <strong>Step 9 (If Delivery):</strong> Recipient: <span className="font-mono text-white">"Sriram Chityala"</span> &bull; Address: <span className="font-mono text-white">"Flat 402, Adilabad Central"</span></li>
                        </ul>
                    </div>
                </div>

                <button
                    onClick={() => setShowVoiceHelpModal(false)}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                    Close Guide
                </button>
            </div>
        </div>
    );
}
