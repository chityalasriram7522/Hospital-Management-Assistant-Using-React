import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { UserCheck, X } from 'lucide-react';

export default function AssignDoctorModal() {
    const {
        showDoctorModal,
        setShowDoctorModal,
        patients,
        doctors,
        assignDoctorToPatient,
        addToast
    } = useHospital();

    const [selectedPatientId, setSelectedPatientId] = useState("");
    const [selectedDoctorId, setSelectedDoctorId] = useState("");

    if (!showDoctorModal) return null;

    const availableDoctors = doctors.filter(d => d.status === "Available");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedPatientId || !selectedDoctorId) {
            addToast("Please select both a patient and an available doctor.", "warning");
            return;
        }

        const success = assignDoctorToPatient(Number(selectedPatientId), Number(selectedDoctorId));
        if (success) {
            setSelectedPatientId("");
            setSelectedDoctorId("");
            setShowDoctorModal(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl text-emerald-400">
                            <UserCheck size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">
                                Clinical Staffing
                            </span>
                            <h2 className="text-xl font-black text-white uppercase italic">
                                Assign Doctor
                            </h2>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowDoctorModal(false)}
                        className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Patient Select */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-2">
                            Select Patient
                        </label>
                        <select
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-black/60 border border-white/10 text-white outline-none focus:border-emerald-500 transition-colors text-sm"
                            required
                        >
                            <option value="">-- Choose Patient --</option>
                            {patients.length > 0 ? (
                                patients.map(p => {
                                    const assignedDoc = doctors.find(d => d.id === p.doctorAssigned);
                                    return (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.priority}) {assignedDoc ? `[Assigned: ${assignedDoc.name}]` : '[Unassigned]'}
                                        </option>
                                    );
                                })
                            ) : (
                                <option disabled>No in-patients currently admitted</option>
                            )}
                        </select>
                    </div>

                    {/* Doctor Select */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-2">
                            Select Doctor
                        </label>
                        <select
                            value={selectedDoctorId}
                            onChange={(e) => setSelectedDoctorId(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-black/60 border border-white/10 text-white outline-none focus:border-emerald-500 transition-colors text-sm"
                            required
                        >
                            <option value="">-- Choose Available Doctor --</option>
                            {availableDoctors.length > 0 ? (
                                availableDoctors.map(d => (
                                    <option key={d.id} value={d.id}>
                                        {d.name} — {d.specialization} ({d.experience})
                                    </option>
                                ))
                            ) : (
                                <option disabled>⚠️ All doctors are currently busy</option>
                            )}
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowDoctorModal(false)}
                            className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={availableDoctors.length === 0 || patients.length === 0}
                            className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                        >
                            Confirm Assignment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
