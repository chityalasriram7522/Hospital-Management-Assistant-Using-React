import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
    Bed, UserCheck, AlertTriangle, UserPlus, ArrowLeft
} from 'lucide-react';

export default function HospitalOverview() {
    const {
        TOTAL_BEDS,
        TOTAL_DOCTORS,
        TOTAL_LABS,
        TOTAL_LAB_STAFF,
        hospitalData,
        patients,
        doctors,
        labs,
        dischargePatient,
        toggleLab,
        setShowPatientModal,
        setShowDoctorModal,
        setActivePage
    } = useHospital();

    const occupancyRate = Math.round((hospitalData.occupiedBeds / TOTAL_BEDS) * 100);
    const isHighOccupancy = occupancyRate >= 80;

    return (
        <div className="flex-1 bg-gradient-to-br from-zinc-900/90 via-black to-zinc-950/90 border border-white/10 p-6 md:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl overflow-y-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.3em]">
                        Executive Hospital Operations
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight">
                        Hospital Infrastructure <span className="text-cyan-400">& Ward Matrix</span>
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                        Real-time clinical occupancy, bed tracking, and physician workloads
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        Live Telemetry
                    </div>
                    <button
                        onClick={() => setActivePage("dashboard")}
                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <ArrowLeft size={14} /> Back
                    </button>
                </div>
            </div>

            {/* High Occupancy Warning */}
            {isHighOccupancy && (
                <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/50 flex items-center gap-3 text-red-200 animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <div className="text-xs font-bold">
                        <span className="uppercase tracking-wider font-black">Warning: Critical Bed Occupancy Alert ({occupancyRate}%)!</span>{" "}
                        Prepare Auxiliary Recovery Wing 4 for non-critical transfers.
                    </div>
                </div>
            )}

            {/* KPI Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Bed Capacity</span>
                    <h3 className="text-3xl font-black text-white mt-1">{TOTAL_BEDS}</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">Across 4 In-Patient Wings</p>
                </div>

                <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Bed Usage %</span>
                    <h3 className={`text-3xl font-black mt-1 ${isHighOccupancy ? 'text-red-400' : 'text-cyan-400'}`}>
                        {occupancyRate}%
                    </h3>
                    <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                        <div
                            className={`h-full ${isHighOccupancy ? 'bg-red-500' : 'bg-cyan-500'}`}
                            style={{ width: `${occupancyRate}%` }}
                        />
                    </div>
                </div>

                <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Physicians On Duty</span>
                    <h3 className="text-3xl font-black text-emerald-400 mt-1">{hospitalData.doctorsAvailable}</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">{TOTAL_DOCTORS} credentialed doctors</p>
                </div>

                <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Diagnostic Labs</span>
                    <h3 className="text-3xl font-black text-purple-400 mt-1">{hospitalData.labsActive} / {TOTAL_LABS}</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">{TOTAL_LAB_STAFF} medical technologists</p>
                </div>
            </div>

            {/* Quick Action Floating Bar */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                    Administrative Quick Actions:
                </span>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPatientModal(true)}
                        className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <UserPlus size={14} /> + Admit Patient
                    </button>
                    <button
                        onClick={() => setShowDoctorModal(true)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <UserCheck size={14} /> Assign Doctor
                    </button>
                </div>
            </div>

            {/* NEW FEATURE: Visual Bed Ward Matrix (Grid Visualization) */}
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h3 className="text-lg font-black uppercase italic text-white flex items-center gap-2">
                            <Bed className="text-cyan-400" size={18} /> Interactive Bed Grid Matrix
                        </h3>
                        <p className="text-[11px] text-zinc-400">
                            Visual layout of Ward A, B, and ICU bed allocations
                        </p>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase">
                        <span className="flex items-center gap-1 text-emerald-400">
                            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Available
                        </span>
                        <span className="flex items-center gap-1 text-cyan-400">
                            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span> Occupied
                        </span>
                        <span className="flex items-center gap-1 text-red-400">
                            <span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span> ICU / Emergency
                        </span>
                    </div>
                </div>

                {/* Grid matrix of 60 beds */}
                <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2 p-4 bg-black/40 rounded-2xl border border-white/5">
                    {Array.from({ length: 60 }).map((_, index) => {
                        const bedNum = index + 1;
                        const patientInBed = patients.find(p => p.bedNumber === bedNum);
                        const isOccupied = bedNum <= hospitalData.occupiedBeds;
                        const isEmergency = patientInBed?.priority === "Emergency" || (isOccupied && bedNum % 7 === 0);

                        let colorClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-400";
                        if (isEmergency) {
                            colorClass = "bg-red-500/30 text-red-300 border-red-500/50";
                        } else if (isOccupied) {
                            colorClass = "bg-cyan-500/30 text-cyan-200 border-cyan-500/50";
                        }

                        return (
                            <div
                                key={bedNum}
                                title={patientInBed ? `Bed ${bedNum}: ${patientInBed.name} (${patientInBed.priority})` : `Bed ${bedNum}: Available`}
                                className={`p-2 rounded-lg border text-center text-[10px] font-mono font-bold transition-all cursor-default select-none ${colorClass}`}
                            >
                                B-{bedNum < 10 ? `0${bedNum}` : bedNum}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* In-Patient Roster */}
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-black uppercase italic text-white">
                            Current In-Patients ({patients.length})
                        </h3>
                        <p className="text-[11px] text-zinc-400">
                            Admitted patients currently under clinical observation
                        </p>
                    </div>
                </div>

                {patients.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {patients.map(p => {
                            const doctor = doctors.find(d => d.id === p.doctorAssigned);
                            return (
                                <div key={p.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-white text-sm">{p.name}</span>
                                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                p.priority === "Emergency"
                                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            }`}>
                                                {p.priority}
                                            </span>
                                            {p.bedNumber && (
                                                <span className="text-[9px] font-mono text-zinc-500">
                                                    Bed: B-{p.bedNumber}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-400 mt-1">
                                            Assigned Doctor:{" "}
                                            <span className="text-emerald-400 font-semibold">
                                                {doctor ? `${doctor.name} (${doctor.specialization})` : "Unassigned"}
                                            </span>
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => dischargePatient(p.id)}
                                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
                                    >
                                        Discharge Patient
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-zinc-500 text-center py-6">
                        No in-patients currently admitted in this ward.
                    </p>
                )}
            </div>

            {/* Doctor Workload & Laboratory Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Doctor Workload */}
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                    <h3 className="text-base font-black uppercase text-white tracking-wide">
                        Physician Workload
                    </h3>
                    <div className="space-y-3">
                        {doctors.map(d => {
                            const assignedCount = patients.filter(p => p.doctorAssigned === d.id).length;
                            return (
                                <div key={d.id} className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
                                    <div>
                                        <p className="font-black text-xs text-white">{d.name}</p>
                                        <p className="text-[10px] text-zinc-400">{d.specialization}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                            d.status === "Available"
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-amber-500/20 text-amber-400'
                                        }`}>
                                            {d.status}
                                        </span>
                                        <p className="text-[10px] text-zinc-500 mt-1">
                                            {assignedCount} Assigned
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Laboratory Control */}
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                    <h3 className="text-base font-black uppercase text-white tracking-wide">
                        Diagnostic Lab Control
                    </h3>
                    <div className="space-y-3">
                        {labs.map(l => (
                            <div key={l.id} className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
                                <div>
                                    <p className="font-black text-xs text-white">{l.name}</p>
                                    <p className="text-[10px] text-zinc-500">{l.room || "Central Wing"}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                        l.status === "Active"
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : 'bg-zinc-800 text-zinc-500'
                                    }`}>
                                        {l.status}
                                    </span>
                                    <button
                                        onClick={() => toggleLab(l.id)}
                                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-purple-600/30 text-[10px] font-bold text-zinc-300 transition-colors cursor-pointer"
                                    >
                                        Toggle
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
