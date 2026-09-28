import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { PhoneCall, ArrowLeft, Siren, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function EmergencyCenter() {
    const {
        emergencyAlerts,
        setEmergencyAlerts,
        setActivePage,
        addToast
    } = useHospital();

    const [emergencyName, setEmergencyName] = useState("");
    const [emergencyPhone, setEmergencyPhone] = useState("");
    const [emergencyMessage, setEmergencyMessage] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const cleanPhone = emergencyPhone.replace(/\D/g, '');

        if (!emergencyName.trim() || cleanPhone.length < 10 || !emergencyMessage.trim()) {
            addToast("Please fill all emergency details including 10-digit phone.", "warning");
            return;
        }

        const newAlert = {
            id: Date.now(),
            name: emergencyName.trim(),
            phone: cleanPhone,
            message: emergencyMessage.trim(),
            status: "DISPATCHED",
            time: "Just now"
        };

        setEmergencyAlerts(prev => [newAlert, ...prev]);
        setSent(true);
        addToast("EMERGENCY SIGNAL BROADCASTED! Trauma response team notified.", "error");

        setEmergencyName("");
        setEmergencyPhone("");
        setEmergencyMessage("");

        setTimeout(() => setSent(false), 5000);
    };

    return (
        <div className="flex-1 bg-gradient-to-br from-zinc-900/90 via-black to-zinc-950/90 border border-white/10 p-6 md:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl overflow-y-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <span className="text-[10px] font-black uppercase text-red-500 tracking-[0.3em] flex items-center gap-1.5">
                        <Siren size={14} className="animate-ping" /> Code Red Network
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight">
                        Emergency Response <span className="text-red-500">Center</span>
                    </h1>
                </div>

                <button
                    onClick={() => setActivePage("dashboard")}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                    <ArrowLeft size={14} /> Back
                </button>
            </div>

            {/* Emergency Hotline Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-red-950/40 border border-red-500/40 rounded-3xl space-y-3">
                    <span className="text-[10px] font-black uppercase text-red-400 tracking-wider">
                        Govt. Ambulance
                    </span>
                    <h3 className="text-2xl font-black text-white">Dial 108</h3>
                    <p className="text-xs text-zinc-400">
                        24/7 National Emergency Medical Service with GPS triage
                    </p>
                    <a
                        href="tel:108"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
                    >
                        <PhoneCall size={14} /> Call 108 Now
                    </a>
                </div>

                <div className="p-6 bg-blue-950/40 border border-blue-500/40 rounded-3xl space-y-3">
                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                        Hospital ICU Trauma Line
                    </span>
                    <h3 className="text-xl font-black text-white font-mono">+91 (08732) 234999</h3>
                    <p className="text-xs text-zinc-400">
                        Direct bedside patch to Chief Emergency Medical Officer
                    </p>
                    <a
                        href="tel:08732234999"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
                    >
                        <PhoneCall size={14} /> Call ICU Hotline
                    </a>
                </div>

                <div className="p-6 bg-amber-950/40 border border-amber-500/40 rounded-3xl space-y-3">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                        General Help Desk
                    </span>
                    <h3 className="text-xl font-black text-white font-mono">+91 98765 43210</h3>
                    <p className="text-xs text-zinc-400">
                        OPD inquiries, doctor availability, and bed status
                    </p>
                    <a
                        href="tel:9876543210"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
                    >
                        <PhoneCall size={14} /> Call Help Desk
                    </a>
                </div>
            </div>

            {/* Emergency Alert Dispatch Form */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-5">
                    <h3 className="text-base font-black uppercase text-red-400 tracking-wide flex items-center gap-2">
                        <ShieldAlert size={18} /> Direct Emergency Alert Broadcast
                    </h3>

                    {sent ? (
                        <div className="p-8 text-center space-y-3 bg-red-950/30 border border-red-500/40 rounded-2xl animate-in zoom-in-95">
                            <CheckCircle2 size={40} className="mx-auto text-emerald-400" />
                            <h4 className="text-lg font-black text-white uppercase">Signal Dispatched</h4>
                            <p className="text-xs text-zinc-300">
                                The nearest trauma response unit and ambulance have been dispatched. Keep phone accessible.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                                    Contact Person Name *
                                </label>
                                <input
                                    type="text"
                                    value={emergencyName}
                                    onChange={(e) => setEmergencyName(e.target.value)}
                                    placeholder="Enter caller or patient name"
                                    className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-red-500 text-xs"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                                    Emergency Mobile Number *
                                </label>
                                <input
                                    type="tel"
                                    maxLength={10}
                                    value={emergencyPhone}
                                    onChange={(e) => setEmergencyPhone(e.target.value)}
                                    placeholder="10-digit contact number"
                                    className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-red-500 text-xs font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                                    Nature of Medical Emergency *
                                </label>
                                <textarea
                                    value={emergencyMessage}
                                    onChange={(e) => setEmergencyMessage(e.target.value)}
                                    placeholder="State symptoms, patient condition, and exact location landmark..."
                                    className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-red-500 text-xs resize-none h-24"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black uppercase text-xs tracking-wider shadow-lg shadow-red-600/40 transition-all hover:scale-[1.01] cursor-pointer mt-4"
                            >
                                Broadcast Critical Alert Now 🚨
                            </button>
                        </form>
                    )}
                </div>

                {/* Emergency Alert Log */}
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-base font-black uppercase text-white tracking-wide">
                            Active Emergency Dispatch Log ({emergencyAlerts.length})
                        </h3>
                        <span className="text-[10px] text-zinc-500 uppercase font-mono">Live Link</span>
                    </div>

                    {emergencyAlerts.length > 0 ? (
                        <div className="divide-y divide-white/5 max-h-[380px] overflow-y-auto scrollbar-hide">
                            {emergencyAlerts.map(alert => (
                                <div key={alert.id} className="py-3.5 space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-black text-white">{alert.name}</span>
                                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold text-[9px] uppercase border border-red-500/30">
                                            {alert.status}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-zinc-400 font-mono">+91 {alert.phone}</p>
                                    <p className="text-xs text-zinc-300 italic">"{alert.message}"</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-zinc-500 text-center py-10">
                            No critical emergency alerts currently broadcasted.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
