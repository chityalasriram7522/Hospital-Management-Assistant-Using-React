import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { UserPlus, X, Bed } from 'lucide-react';

export default function AddPatientModal() {
    const {
        showPatientModal,
        setShowPatientModal,
        admitPatient,
        hospitalData,
        TOTAL_BEDS
    } = useHospital();

    const [patientName, setPatientName] = useState("");
    const [priority, setPriority] = useState("Normal");

    if (!showPatientModal) return null;

    const availableBeds = TOTAL_BEDS - hospitalData.occupiedBeds;

    const handleSubmit = (e) => {
        e.preventDefault();
        const success = admitPatient(patientName, priority);
        if (success) {
            setPatientName("");
            setPriority("Normal");
            setShowPatientModal(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-cyan-600/20 border border-cyan-500/30 rounded-2xl text-cyan-400">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">
                                In-Patient Services
                            </span>
                            <h2 className="text-xl font-black text-white uppercase italic">
                                Admit Patient
                            </h2>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowPatientModal(false)}
                        className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Bed status pill */}
                <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                        <Bed size={16} className="text-cyan-400" />
                        <span>Available Beds:</span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${availableBeds > 10 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {availableBeds} / {TOTAL_BEDS}
                    </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-2">
                            Patient Full Name *
                        </label>
                        <input
                            type="text"
                            autoFocus
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            placeholder="e.g. Sriram Chityala"
                            className="w-full p-4 rounded-2xl bg-black/60 border border-white/10 text-white outline-none focus:border-cyan-500 transition-colors text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-2">
                            Triage Priority
                        </label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-black/60 border border-white/10 text-white outline-none focus:border-cyan-500 transition-colors text-sm"
                        >
                            <option value="Normal">Normal (Routine Ward Admission)</option>
                            <option value="Emergency">Emergency (Immediate ICU Bed Allocation)</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowPatientModal(false)}
                            className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition-all hover:scale-[1.02]"
                        >
                            Confirm Admission
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
