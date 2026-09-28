import React, { useState } from 'react';
import { useHospital } from '../../../context/HospitalContext';
import { triagePatient } from '../../../services/mockApi';
import { speechEngine } from '../../../services/speechService';
import {
    User,
    ChevronLeft,
    CheckCircle2,
    Stethoscope,
    ArrowRight,
    Activity,
    Heart,
    Thermometer,
    Wind,
    SlidersHorizontal
} from 'lucide-react';

export default function TriageModule() {
    const {
        patient,
        setPatient,
        gridPhase,
        setGridPhase,
        subStep,
        setSubStep,
        results,
        setResults,
        vitals,
        setVitals,
        updateVitals,
        addToast,
        setAiMsg
    } = useHospital();

    const [isLoading, setIsLoading] = useState(false);
    const [customConcern, setCustomConcern] = useState("");
    const [showVitalsPanel, setShowVitalsPanel] = useState(false);

    // Dynamic Clinical Risk Calculator (NEWS2 inspired)
    const calculateRiskScore = () => {
        let score = 0;
        const temp = parseFloat(vitals?.temperature) || 98.6;
        const hr = parseInt(vitals?.heartRate) || 72;
        const spo2 = parseInt(vitals?.spO2) || 98;
        const sys = parseInt(vitals?.bpSystolic) || 120;

        if (spo2 < 92) score += 3;
        else if (spo2 < 95) score += 1;

        if (temp >= 102.5 || temp <= 95) score += 2;
        else if (temp >= 100.4) score += 1;

        if (hr >= 115 || hr <= 45) score += 2;
        else if (hr >= 100) score += 1;

        if (sys >= 160 || sys <= 85) score += 2;
        else if (sys >= 140) score += 1;

        return score;
    };

    const riskScore = calculateRiskScore();
    const riskLevel = riskScore >= 4 ? "Critical" : riskScore >= 2 ? "Moderate" : "Low";

    const setPresetVitals = (preset) => {
        if (preset === "normal") {
            setVitals({ temperature: "98.6", heartRate: "72", bpSystolic: "120", bpDiastolic: "80", spO2: "99" });
            addToast("Applied Normal Clinical Vitals baseline.", "info");
        } else if (preset === "fever") {
            setVitals({ temperature: "101.4", heartRate: "96", bpSystolic: "128", bpDiastolic: "84", spO2: "96" });
            addToast("Applied Febrile / Elevated Vitals profile.", "warning");
        } else if (preset === "critical") {
            setVitals({ temperature: "103.2", heartRate: "124", bpSystolic: "168", bpDiastolic: "102", spO2: "89" });
            addToast("Applied Critical Emergency Vitals (High NEWS2 Risk)!", "error");
        }
    };

    const handleProceedToDiagnosis = () => {
        if (!patient.name.trim()) {
            addToast("Please enter your name to proceed.", "warning");
            speechEngine.speak("Please enter your full name first.");
            return;
        }
        setSubStep(1);
        const msg = `Welcome ${patient.name}. What is your primary health concern?`;
        setAiMsg(msg);
        speechEngine.speak(msg);
    };

    const handleSelectIssue = async (selected) => {
        const issueToUse = selected === "Other" ? (customConcern || "General Consultation") : selected;

        setIsLoading(true);
        try {
            const data = await triagePatient(issueToUse, patient.name);
            const isCriticalRisk = riskScore >= 4;

            const finalData = {
                ...data,
                isSerious: data.isSerious || isCriticalRisk,
                clinicalRisk: riskLevel,
                riskScore: riskScore,
                vitalsSnapshot: { ...vitals }
            };

            setResults(finalData);
            setPatient(prev => ({
                ...prev,
                issue: issueToUse,
                token: data.token,
                priority: isCriticalRisk ? "Emergency" : (data.isSerious ? "High" : "Normal")
            }));

            if (finalData.isSerious) {
                const alertMsg = isCriticalRisk
                    ? `Warning: Critical vitals detected with risk score ${riskScore}. Priority doctor assignment initiated.`
                    : `Condition ${issueToUse} requires doctor attention. Transitioning to scheduling.`;
                setAiMsg(alertMsg);
                speechEngine.speak(alertMsg);
                setGridPhase(2);
                setSubStep(2);
            } else {
                const adviceMsg = `Symptom logged: ${issueToUse}. ${data.advice}`;
                setAiMsg(adviceMsg);
                speechEngine.speak(adviceMsg);
                setSubStep(1.5);
            }
        } catch (error) {
            console.error("Triage error:", error);
            addToast("Diagnostic system offline, using default consultation protocol.", "info");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className={`bg-zinc-900/60 border rounded-[2.5rem] p-6 md:p-8 flex flex-col shadow-2xl transition-all duration-500 min-h-[520px] ${
                gridPhase === 1
                    ? 'border-blue-500/50 shadow-blue-500/10 ring-1 ring-blue-500/30'
                    : 'border-white/5 opacity-50 grayscale hover:opacity-80'
            }`}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <User size={15} /> 01 / Registry & Triage
                </h4>
                {gridPhase > 1 && (
                    <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Verified
                    </span>
                )}
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col justify-start">
                {subStep === 0 && (
                    <div className="space-y-6 my-auto animate-in slide-in-from-bottom-4">
                        <div className="text-center">
                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2">
                                Patient Identification
                            </span>
                            <h3 className="text-xl md:text-2xl font-black italic text-white">
                                Welcome to CareConnect
                            </h3>
                        </div>

                        <div className="bg-black/40 p-4 rounded-2xl border border-white/10 focus-within:border-blue-500 transition-colors">
                            <input
                                autoFocus
                                value={patient.name}
                                onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && handleProceedToDiagnosis()}
                                className="w-full bg-transparent p-2 text-2xl md:text-3xl outline-none text-white italic font-serif text-center placeholder:text-zinc-700"
                                placeholder="Enter Full Name"
                            />
                        </div>

                        <button
                            onClick={handleProceedToDiagnosis}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-5 rounded-2xl font-black uppercase text-xs tracking-wider transition-all duration-300 shadow-xl shadow-blue-600/20 hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
                        >
                            Proceed to Triage <ArrowRight size={16} />
                        </button>
                    </div>
                )}

                {subStep === 1 && (
                    <div className="space-y-5 animate-in slide-in-from-left duration-300">
                        <div className="flex justify-between items-center">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                Patient: <span className="text-blue-400">{patient.name}</span>
                            </p>
                            <button
                                onClick={() => setShowVitalsPanel(!showVitalsPanel)}
                                className="text-[10px] font-black uppercase tracking-wider text-blue-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/10 border border-blue-500/20 cursor-pointer"
                            >
                                <SlidersHorizontal size={12} /> {showVitalsPanel ? "Hide Vitals" : "Clinical Vitals"}
                            </button>
                        </div>

                        {/* Interactive Vitals & Risk Scorecard */}
                        {showVitalsPanel && (
                            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-blue-500/30 space-y-3 animate-in zoom-in-95 duration-200">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Activity size={15} className="text-blue-400" />
                                        <span className="text-[10px] font-black uppercase text-white tracking-wider">
                                            Real-Time Clinical Vitals
                                        </span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                        riskLevel === "Critical" ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                        riskLevel === "Moderate" ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    }`}>
                                        Risk: {riskLevel} ({riskScore})
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex items-center justify-center gap-1 text-zinc-400 text-[9px] uppercase font-bold mb-1">
                                            <Thermometer size={11} className="text-rose-400" /> Temp
                                        </div>
                                        <input
                                            value={vitals?.temperature || "98.6"}
                                            onChange={(e) => updateVitals("temperature", e.target.value)}
                                            className="w-full bg-transparent text-center font-mono font-bold text-white text-xs outline-none"
                                        />
                                        <span className="text-[8px] text-zinc-500">°F</span>
                                    </div>

                                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex items-center justify-center gap-1 text-zinc-400 text-[9px] uppercase font-bold mb-1">
                                            <Heart size={11} className="text-red-400" /> Pulse
                                        </div>
                                        <input
                                            value={vitals?.heartRate || "72"}
                                            onChange={(e) => updateVitals("heartRate", e.target.value)}
                                            className="w-full bg-transparent text-center font-mono font-bold text-white text-xs outline-none"
                                        />
                                        <span className="text-[8px] text-zinc-500">BPM</span>
                                    </div>

                                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex items-center justify-center gap-1 text-zinc-400 text-[9px] uppercase font-bold mb-1">
                                            <Wind size={11} className="text-cyan-400" /> SpO2
                                        </div>
                                        <input
                                            value={vitals?.spO2 || "98"}
                                            onChange={(e) => updateVitals("spO2", e.target.value)}
                                            className="w-full bg-transparent text-center font-mono font-bold text-white text-xs outline-none"
                                        />
                                        <span className="text-[8px] text-zinc-500">%</span>
                                    </div>

                                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex items-center justify-center gap-1 text-zinc-400 text-[9px] uppercase font-bold mb-1">
                                            <Activity size={11} className="text-emerald-400" /> BP
                                        </div>
                                        <div className="flex items-center justify-center gap-0.5">
                                            <input
                                                value={vitals?.bpSystolic || "120"}
                                                onChange={(e) => updateVitals("bpSystolic", e.target.value)}
                                                className="w-8 bg-transparent text-center font-mono font-bold text-white text-xs outline-none"
                                            />
                                            <span className="text-zinc-500">/</span>
                                            <input
                                                value={vitals?.bpDiastolic || "80"}
                                                onChange={(e) => updateVitals("bpDiastolic", e.target.value)}
                                                className="w-8 bg-transparent text-center font-mono font-bold text-white text-xs outline-none"
                                            />
                                        </div>
                                        <span className="text-[8px] text-zinc-500">mmHg</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-[9px] uppercase font-bold text-zinc-500">Quick Presets:</span>
                                    <div className="flex gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setPresetVitals("normal")}
                                            className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md hover:bg-emerald-500/20 cursor-pointer"
                                        >
                                            Normal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPresetVitals("fever")}
                                            className="text-[9px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-md hover:bg-amber-500/20 cursor-pointer"
                                        >
                                            Fever
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPresetVitals("critical")}
                                            className="text-[9px] font-bold px-2 py-0.5 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 cursor-pointer"
                                        >
                                            Critical
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-2.5">
                            {[
                                { label: "Fever / Cold", desc: "Temperature, chills, cough, or congestion" },
                                { label: "Chest Pain", desc: "Pressure, tightness, or shortness of breath" },
                                { label: "Body Aches", desc: "Joint soreness, fatigue, or muscle cramps" },
                                { label: "Other", desc: "Specialist consultation or custom concern" }
                            ].map(opt => (
                                <button
                                    key={opt.label}
                                    onClick={() => {
                                        if (opt.label === "Other") {
                                            setPatient({ ...patient, issue: "Other" });
                                        } else {
                                            handleSelectIssue(opt.label);
                                        }
                                    }}
                                    disabled={isLoading}
                                    className={`p-4 rounded-2xl border text-left transition-all group cursor-pointer ${
                                        patient.issue === opt.label
                                            ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                                            : 'bg-white/5 border-white/5 text-zinc-300 hover:border-blue-500/50 hover:bg-blue-600/10'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-black text-xs uppercase tracking-wide group-hover:text-blue-400 transition-colors">
                                            {opt.label}
                                        </span>
                                        <Stethoscope size={16} className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                    <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">
                                        {opt.desc}
                                    </p>
                                </button>
                            ))}
                        </div>

                        {patient.issue === "Other" && (
                            <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-blue-500/30 animate-in zoom-in-95">
                                <textarea
                                    value={customConcern}
                                    onChange={(e) => setCustomConcern(e.target.value)}
                                    placeholder="Describe your symptoms in detail..."
                                    className="w-full bg-black/50 p-3 rounded-xl border border-white/10 outline-none text-xs text-blue-300 placeholder:text-zinc-600 resize-none h-20"
                                />
                                <button
                                    onClick={() => handleSelectIssue("Other")}
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all"
                                >
                                    {isLoading ? "Analyzing..." : "Submit Clinical Case"}
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => setSubStep(0)}
                            className="w-full text-zinc-500 hover:text-white text-[10px] font-black uppercase flex items-center justify-center gap-1 transition-colors pt-2 cursor-pointer"
                        >
                            <ChevronLeft size={14} /> Back to Identity
                        </button>
                    </div>
                )}

                {subStep === 1.5 && (
                    <div className="space-y-5 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[380px] scrollbar-hide pr-1">
                        <div className="bg-emerald-950/30 p-5 rounded-2xl border border-emerald-500/30">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block">
                                    Clinical Home Protocol
                                </span>
                                {results?.clinicalRisk && (
                                    <span className="text-[9px] font-bold text-white px-2 py-0.5 bg-white/10 rounded-full">
                                        Risk: {results.clinicalRisk}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm italic font-serif text-white mb-4 leading-relaxed">
                                "{results?.advice}"
                            </p>

                            {results?.medicus?.steps && (
                                <div className="space-y-2 bg-black/40 p-4 rounded-xl border border-white/5">
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">
                                        Actionable Recovery Steps:
                                    </p>
                                    {results.medicus.steps.map((st, i) => (
                                        <div key={i} className="flex gap-2 text-xs text-zinc-300 leading-normal">
                                            <span className="text-blue-400 font-bold">{i + 1}.</span>
                                            <span>{st}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-center space-y-3">
                            <p className="text-xs text-blue-200 font-bold uppercase tracking-tight">
                                Official Doctor Consultation Advised
                            </p>
                            <button
                                onClick={() => {
                                    setGridPhase(2);
                                    setSubStep(2);
                                    const m = "Transitioning to Appointment Scheduler. Please pick a date.";
                                    setAiMsg(m);
                                    speechEngine.speak(m);
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
                            >
                                Book Appointment Slot →
                            </button>
                        </div>

                        <button
                            onClick={() => setSubStep(1)}
                            className="text-[10px] font-black uppercase text-zinc-500 hover:text-white underline block mx-auto cursor-pointer"
                        >
                            Change Symptoms
                        </button>
                    </div>
                )}

                {gridPhase > 1 && (
                    <div className="text-center my-auto py-6 animate-in zoom-in duration-300">
                        <CheckCircle2 size={46} className="mx-auto text-emerald-400 mb-3" />
                        <h3 className="text-xl font-black italic text-white">{patient.name}</h3>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">
                            {patient.issue} Verified
                        </p>
                        <p className="text-[9px] font-mono text-zinc-500 mt-2">
                            Token: #{patient.token}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
