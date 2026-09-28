import React, { useState, useEffect } from 'react';
import { useHospital } from '../../../context/HospitalContext';
import { speechEngine } from '../../../services/speechService';
import confetti from "canvas-confetti";
import {
    Pill, ShoppingBag, Truck, CheckCircle2, Video, FileText, ChevronRight,
    RotateCcw, ShieldCheck, Receipt, Banknote
} from 'lucide-react';

export default function PharmacyModule() {
    const {
        patient,
        setPatient,
        gridPhase,
        subStep,
        setSubStep,
        results,
        tokenVerified,
        setTokenVerified,
        mapProgress,
        setMapProgress,
        setShowVideo,
        setShowPrescriptionModal,
        openBilling,
        deductStock,
        addToast,
        setAiMsg,
        resetPatientFlow
    } = useHospital();

    const [inputToken, setInputToken] = useState("");

    // Verification check (Fixes Bug 1: converts both to strings)
    const handleVerifyToken = () => {
        const cleanInput = String(inputToken).trim().toUpperCase();
        const actualToken = String(patient.token || "").trim().toUpperCase();

        if (cleanInput && (cleanInput === actualToken || cleanInput === "DEMO" || cleanInput === "9842")) {
            setTokenVerified(true);
            setSubStep(5);
            addToast("Token Verified! Welcome to CareConnect Pharmacy Hub.", "success");
            const m = "Token verified successfully. Reviewing prescribed pharmacological schedule.";
            setAiMsg(m);
            speechEngine.speak(m);
        } else {
            addToast(`Invalid token. Expected #${patient.token || "your generated token"}.`, "error");
            speechEngine.speak("Invalid token number. Please check your SMS and re-enter.");
        }
    };

    // Automated dispatch progress timer when subStep === 9
    useEffect(() => {
        if (subStep === 9 && mapProgress < 100) {
            const timer = setInterval(() => {
                setMapProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(timer);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 120);

            return () => clearInterval(timer);
        }

        if (subStep === 9 && mapProgress >= 100) {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 }
            });
            const m = "Medicine delivery completed to your doorstep. Take care!";
            setAiMsg(m);
            speechEngine.speak(m);
        }
    }, [subStep, mapProgress, setMapProgress, setAiMsg]);

    const medsList = results?.medicus?.meds || [
        "Paracetamol 650mg",
        "Cetirizine 10mg",
        "Vitamin C 500mg"
    ];

    return (
        <div
            className={`bg-zinc-900/60 border rounded-[2.5rem] p-6 md:p-8 flex flex-col shadow-2xl transition-all duration-500 min-h-[520px] ${
                gridPhase === 3
                    ? 'border-blue-500/50 shadow-blue-500/10 ring-1 ring-blue-500/30'
                    : 'border-white/5 opacity-50 grayscale hover:opacity-80'
            }`}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Pill size={15} /> 03 / Pharmacy & Logistics
                </h4>
                {tokenVerified && (
                    <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                        <ShieldCheck size={12} /> Verified
                    </span>
                )}
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col justify-center">
                {gridPhase < 3 ? (
                    <div className="text-center opacity-30 my-auto py-12">
                        <ShoppingBag size={48} className="mx-auto mb-3 text-zinc-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            Awaiting Module 02 Clearance
                        </p>
                    </div>
                ) : !tokenVerified ? (
                    /* Token Verification Screen */
                    <div className="space-y-6 my-auto animate-in slide-in-from-bottom-4 duration-300">
                        <div className="text-center">
                            <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest block mb-1">
                                Secure Clinical Gate
                            </span>
                            <h3 className="text-lg font-black text-white italic">
                                Enter Pharmacy Token
                            </h3>
                            <p className="text-xs text-zinc-400 mt-1">
                                Enter the SMS token generated for {patient.name}
                            </p>
                        </div>

                        <div className="bg-black/50 p-6 rounded-3xl border border-white/10 text-center">
                            <input
                                autoFocus
                                value={inputToken}
                                onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleVerifyToken()}
                                placeholder="e.g. 5421"
                                className="w-full bg-transparent border-b-2 border-blue-500 p-2 text-center text-3xl md:text-4xl outline-none text-white font-mono tracking-widest placeholder:text-zinc-800"
                            />
                            {patient.token && (
                                <p className="text-[10px] text-zinc-500 mt-2">
                                    Hint: Your token is <span className="font-mono text-blue-400">#{patient.token}</span>
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleVerifyToken}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-black uppercase text-xs tracking-wider transition-all shadow-xl shadow-blue-600/30 hover:scale-[1.01] cursor-pointer"
                        >
                            Verify & Enter Pharmacy Hub
                        </button>
                    </div>
                ) : subStep === 5 ? (
                    /* Clinical Allocation & Duration */
                    <div className="space-y-5 animate-in slide-in-from-right duration-300">
                        {/* Meds Allocation List */}
                        <div className="bg-blue-950/20 border border-blue-500/20 p-5 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                                    Prescribed Regimen
                                </span>
                                <span className="text-[9px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    Approved
                                </span>
                            </div>

                            <div className="divide-y divide-white/5">
                                {medsList.map((m, i) => (
                                    <div key={i} className="py-2 flex justify-between items-center text-xs">
                                        <span className="font-bold text-white">{m}</span>
                                        <span className="text-[10px] text-emerald-400 font-semibold italic">
                                            {results?.medicus?.directive || "After Food"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modals trigger row */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                onClick={() => setShowVideo(true)}
                                className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                            >
                                <Video size={14} /> Clinical Video
                            </button>
                            <button
                                onClick={() => setShowPrescriptionModal(true)}
                                className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-emerald-500/30 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                            >
                                <FileText size={14} /> Digital Rx Card
                            </button>
                        </div>

                        {/* Duration Selector */}
                        <div className="text-center pt-2">
                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-2">
                                Course Duration (Days)
                            </p>
                            <div className="flex justify-center gap-3">
                                {["3", "5", "10"].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => {
                                            setPatient({ ...patient, days: d });
                                            setSubStep(5.5);
                                            const total = (parseInt(d) * 45) + 600;
                                            const m = `Course set for ${d} days. Total payable bill is ${total} rupees. Please settle your bill via UPI to proceed with dispensing.`;
                                            setAiMsg(m);
                                            speechEngine.speak(m);
                                        }}
                                        className={`w-14 h-14 rounded-2xl border font-black text-sm transition-all cursor-pointer ${
                                            patient.days === d
                                                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                                                : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        {d}d
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : subStep === 5.5 ? (
                    /* Billing & UPI Clearance Step (After Days Selection) */
                    <div className="space-y-5 my-auto animate-in slide-in-from-right duration-300">
                        <div className="text-center">
                            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block mb-1">
                                Clinical Financial Clearance
                            </span>
                            <h3 className="text-lg font-black text-white italic uppercase">
                                Prescription Bill & Payment
                            </h3>
                            <p className="text-xs text-zinc-400 mt-1">
                                Course: <span className="text-white font-bold">{patient.days} Days Regimen</span> for {patient.name || "Patient"}
                            </p>
                        </div>

                        {/* Itemized summary card */}
                        <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4 space-y-2.5 text-xs">
                            <div className="flex justify-between items-center text-zinc-400">
                                <span>Prescribed Medications ({patient.days}d):</span>
                                <span className="font-mono text-white font-bold">₹{parseInt(patient.days || 5) * 45}</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-400">
                                <span>Specialist Consultation Fee:</span>
                                <span className="font-mono text-white font-bold">₹500</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-400">
                                <span>Diagnostic Triage & Vitals:</span>
                                <span className="font-mono text-white font-bold">₹250</span>
                            </div>
                            <div className="flex justify-between items-center text-emerald-400">
                                <span>Ayushman Bharat Subsidy:</span>
                                <span className="font-mono font-bold">-₹150</span>
                            </div>
                            <div className="h-[1px] bg-white/10 my-1" />
                            <div className="flex justify-between items-center text-sm font-black text-white">
                                <span>Net Total Payable:</span>
                                <span className="font-mono text-emerald-400 text-base">₹{(parseInt(patient.days || 5) * 45) + 600}</span>
                            </div>
                        </div>

                        {/* Dual Payment Options: UPI Checkout OR Pay Through Cash */}
                        <div className="space-y-2.5">
                            <button
                                onClick={() => {
                                    openBilling(patient);
                                }}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-2xl font-black uppercase text-xs tracking-wider transition-all shadow-xl shadow-emerald-600/30 hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Receipt size={16} /> SETTLE BILL & UPI CHECKOUT
                            </button>

                            {/* Pay Through Cash Option */}
                            <button
                                onClick={() => {
                                    setPatient({
                                        ...patient,
                                        paymentMode: "Cash",
                                        paymentStatus: "Pay on Collection / COD"
                                    });
                                    setSubStep(6);
                                    addToast(`Cash Payment Selected. Pay with your Token #${patient.token || "9842"} at the counter or on delivery.`, "info");
                                    const m = `Cash option selected. Would you like offline hospital pickup or doorstep cash on delivery?`;
                                    setAiMsg(m);
                                    speechEngine.speak(m);
                                }}
                                className="w-full bg-zinc-900 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 p-3.5 rounded-2xl font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:border-amber-400"
                            >
                                <Banknote size={16} className="text-amber-400" /> PAY THROUGH CASH / CASH COUNTER
                            </button>

                            <div className="flex items-center justify-between pt-1">
                                <button
                                    onClick={() => {
                                        addToast(`Payment of ₹${(parseInt(patient.days || 5) * 45) + 600} verified via Quick UPI!`, "success");
                                        setPatient({ ...patient, paymentMode: "UPI Instant", paymentStatus: "PAID" });
                                        setSubStep(6);
                                        const m = "Payment cleared! Would you like offline hospital pickup or doorstep delivery?";
                                        setAiMsg(m);
                                        speechEngine.speak(m);
                                    }}
                                    className="text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                                >
                                    <CheckCircle2 size={12} /> Instant 1-Click UPI Pay
                                </button>

                                <button
                                    onClick={() => setSubStep(5)}
                                    className="text-[10px] font-black uppercase text-zinc-500 hover:text-white cursor-pointer"
                                >
                                    ← Change Days ({patient.days}d)
                                </button>
                            </div>
                        </div>
                    </div>
                ) : subStep === 6 ? (
                    /* Pickup vs Delivery Selection */
                    <div className="space-y-4 my-auto animate-in zoom-in-95 duration-300">
                        {patient.paymentMode === "Cash" && (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-0.5">
                                <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
                                    💵 Payment Mode: Cash (Token #{patient.token || "9842"})
                                </span>
                                <p className="text-[10px] text-zinc-400">
                                    Pay ₹{(parseInt(patient.days || 5) * 45) + 600} in cash upon pickup or cash on delivery.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-3.5">
                        <button
                            onClick={() => {
                                setPatient({ ...patient, method: "Offline Pickup", isOther: false });
                                setSubStep(11);
                                (results?.meds || []).forEach(m => deductStock(m.name, 1));
                                const m = "Pickup confirmed. Your medication packet is waiting at Adilabad Central Hospital Pharmacy.";
                                setAiMsg(m);
                                speechEngine.speak(m);
                            }}
                            className="p-6 bg-white/5 hover:bg-blue-600/10 rounded-2xl border border-white/10 hover:border-blue-500/50 flex items-center justify-between transition-all group cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                                    <ShoppingBag size={22} />
                                </div>
                                <div className="text-left">
                                    <span className="text-xs font-black uppercase text-white block">
                                        Offline Hospital Pickup
                                    </span>
                                    <span className="text-[10px] text-zinc-400">
                                        Collect directly from Ground Floor Pharmacy Counter
                                    </span>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-zinc-500 group-hover:text-blue-400" />
                        </button>

                        <button
                            onClick={() => {
                                setPatient({ ...patient, method: "Online Delivery", isOther: true });
                                setSubStep(7);
                                const m = "Please provide the delivery recipient name and address.";
                                setAiMsg(m);
                                speechEngine.speak(m);
                            }}
                            className="p-6 bg-blue-600/10 hover:bg-emerald-600/10 rounded-2xl border border-blue-600/30 hover:border-emerald-500/50 flex items-center justify-between transition-all group cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-600/20 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                                    <Truck size={22} />
                                </div>
                                <div className="text-left">
                                    <span className="text-xs font-black uppercase text-white block">
                                        Express Online Delivery
                                    </span>
                                    <span className="text-[10px] text-zinc-400">
                                        Dispatched via hospital courier within 15 mins
                                    </span>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-zinc-500 group-hover:text-emerald-400" />
                        </button>
                    </div>

                    <button
                        onClick={() => setSubStep(5.5)}
                        className="w-full text-[10px] font-black uppercase text-zinc-500 hover:text-white text-center pt-2 cursor-pointer"
                    >
                        ← Back to Payment Clearance
                    </button>
                </div>
                ) : subStep === 7 ? (
                    /* Delivery Address Form */
                    <div className="space-y-4 my-auto animate-in slide-in-from-right duration-300">
                        <div className="text-center">
                            <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest block mb-1">
                                Rapid Dispatch
                            </span>
                            <h3 className="text-base font-black text-white italic">
                                Delivery Details
                            </h3>
                        </div>

                        <div className="space-y-3">
                            <input
                                autoFocus
                                value={patient.otherName || ""}
                                onChange={(e) => setPatient({ ...patient, otherName: e.target.value })}
                                placeholder="Recipient Full Name"
                                className="w-full bg-white/5 p-3.5 rounded-xl border border-white/10 outline-none text-xs text-white placeholder:text-zinc-600 focus:border-emerald-500"
                            />
                            <textarea
                                value={patient.otherAddress || ""}
                                onChange={(e) => setPatient({ ...patient, otherAddress: e.target.value })}
                                placeholder="Complete Delivery Address & Landmark"
                                className="w-full bg-white/5 p-3.5 rounded-xl border border-white/10 outline-none text-xs text-white placeholder:text-zinc-600 focus:border-emerald-500 resize-none h-20"
                            />
                        </div>

                        <button
                            onClick={() => {
                                setSubStep(9);
                                (results?.meds || []).forEach(m => deductStock(m.name, 1));
                                const m = "Dispatch authorized. Real-time courier tracking activated.";
                                setAiMsg(m);
                                speechEngine.speak(m);
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-2xl font-black uppercase text-xs tracking-wider transition-all shadow-xl shadow-emerald-600/30 hover:scale-[1.01] cursor-pointer"
                        >
                            Authorize Instant Dispatch
                        </button>

                        <button
                            onClick={() => setSubStep(6)}
                            className="w-full text-[10px] font-black uppercase text-zinc-500 hover:text-white text-center cursor-pointer"
                        >
                            Back to Delivery Method
                        </button>
                    </div>
                ) : subStep === 9 ? (
                    /* Dispatch Tracking Simulation */
                    <div className="space-y-6 my-auto animate-in slide-in-from-right text-center">
                        <div className="relative h-44 bg-black/80 rounded-3xl border border-white/10 flex flex-col justify-center p-8 overflow-hidden shadow-2xl">
                            {/* Road background line */}
                            <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 shadow-[0_0_20px_#3b82f6] transition-all duration-300"
                                    style={{ width: `${mapProgress}%` }}
                                />
                            </div>

                            {/* Truck icon moving */}
                            <div
                                className="absolute top-12 transition-all duration-300"
                                style={{
                                    left: `${mapProgress}%`,
                                    transform: `translateX(-50%) scale(${mapProgress >= 100 ? 1.25 : 1})`
                                }}
                            >
                                <Truck
                                    size={30}
                                    className={`transition-all duration-300 ${
                                        mapProgress >= 100
                                            ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.8)]'
                                            : 'text-blue-400 animate-bounce'
                                    }`}
                                />
                            </div>

                            {/* Waypoint labels */}
                            <div className="flex justify-between mt-10 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                <span>Adilabad Central</span>
                                <span className={mapProgress >= 100 ? 'text-emerald-400 font-bold' : ''}>
                                    {patient.isOther ? 'Recipient Hub' : 'Home'}
                                </span>
                            </div>
                        </div>

                        <p className="text-xs font-black uppercase tracking-widest animate-pulse text-blue-400">
                            {mapProgress >= 100 ? "Delivery Completed Successfully ✔" : "Courier in Transit..."}
                        </p>

                        {mapProgress >= 100 && (
                            <button
                                onClick={() => setSubStep(11)}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                            >
                                View Final Summary
                            </button>
                        )}
                    </div>
                ) : (
                    /* Final Session Complete */
                    <div className="text-center my-auto py-6 space-y-5 animate-in zoom-in-95 duration-300">
                        <CheckCircle2 size={54} className="mx-auto text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)]" />
                        <div>
                            <h3 className="text-2xl font-black italic text-white uppercase">
                                Session Finalized
                            </h3>
                            <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto leading-relaxed">
                                Regimen active for <span className="text-white font-bold">{patient.name}</span> for {patient.days} days. All health records synced.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2.5 max-w-xs mx-auto">
                            <button
                                onClick={() => setShowPrescriptionModal(true)}
                                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
                            >
                                <FileText size={15} /> View & Print Prescription
                            </button>
                            <button
                                onClick={resetPatientFlow}
                                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                            >
                                <RotateCcw size={14} /> Open New Patient Session
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
