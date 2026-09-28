import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { FileText, Search, ArrowLeft, Calendar, Video, Receipt } from 'lucide-react';

export default function PatientRecords() {
    const {
        patients,
        appointments,
        setActivePage,
        setPatient,
        setResults,
        setShowPrescriptionModal,
        openTeleconsult,
        openBilling
    } = useHospital();

    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");

    // Unified records list from appointments and in-patients
    const allRecords = [
        ...patients.map(p => ({
            id: `PAT-${p.id}`,
            name: p.name,
            phone: "In-Ward",
            date: p.admittedAt || "Today",
            type: "In-Patient Admission",
            issue: p.priority === "Emergency" ? "Acute Trauma / Emergency" : "Routine Ward Care",
            token: `INP-${p.bedNumber || "01"}`,
            meds: ["Clinical IV Saline", "Vital Monitoring Protocol", "Ward Antibiotics"]
        })),
        ...appointments.map(a => ({
            id: `APT-${a.id}`,
            name: a.patientName,
            phone: a.phone,
            date: a.date,
            slot: a.slot,
            type: "OPD Appointment",
            issue: "Consultation & Prescription",
            token: a.token,
            meds: ["Paracetamol 650mg", "Cetirizine 10mg", "Vitamin C"]
        }))
    ];

    const filteredRecords = allRecords.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              r.phone.includes(searchTerm) ||
                              r.token.toLowerCase().includes(searchTerm.toLowerCase());
        if (filterCategory === "inpatient") return matchesSearch && r.type.includes("In-Patient");
        if (filterCategory === "opd") return matchesSearch && r.type.includes("OPD");
        return matchesSearch;
    });

    const handleViewPrescription = (record) => {
        setPatient({
            name: record.name,
            phone: record.phone,
            token: record.token,
            issue: record.issue,
            date: record.date,
            slot: record.slot || "Consultation",
            days: "5",
            gender: "Male"
        });
        setResults({
            advice: "Official clinical consultation records verified in cloud archives.",
            medicus: {
                directive: "Twice daily after meals",
                meds: record.meds
            }
        });
        setShowPrescriptionModal(true);
    };

    return (
        <div className="flex-1 bg-gradient-to-br from-zinc-900/90 via-black to-zinc-950/90 border border-white/10 p-6 md:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl overflow-y-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.3em]">
                        Clinical Cloud Archives
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight">
                        Electronic Health Records <span className="text-blue-500">(EHR)</span>
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                        Searchable directory of in-patient admissions, outpatient tokens, and prescriptions
                    </p>
                </div>

                <button
                    onClick={() => setActivePage("dashboard")}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                    <ArrowLeft size={14} /> Back
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-3.5 text-zinc-500 w-4 h-4" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by patient, phone, or token..."
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    {[
                        { id: "all", label: "All Records" },
                        { id: "opd", label: "OPD Appointments" },
                        { id: "inpatient", label: "Ward Admissions" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterCategory(tab.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                filterCategory === tab.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white/5 text-zinc-400 hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Records List Table / Cards */}
            <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                {filteredRecords.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {filteredRecords.map(record => (
                            <div
                                key={record.id}
                                className="p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/[0.02] transition-colors"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-white text-base">{record.name}</span>
                                        <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                                            record.type.includes("In-Patient")
                                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        }`}>
                                            {record.type}
                                        </span>
                                        <span className="text-[10px] font-mono text-zinc-500">
                                            Token: #{record.token}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={13} className="text-zinc-500" /> {record.date} {record.slot ? `(${record.slot})` : ''}
                                        </span>
                                        <span className="flex items-center gap-1 font-mono text-zinc-500">
                                            Phone: {record.phone}
                                        </span>
                                        <span className="text-blue-400 font-semibold">
                                            {record.issue}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openTeleconsult(record)}
                                        className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                                        title="Start Video Consultation"
                                    >
                                        <Video size={13} /> Consult
                                    </button>
                                    <button
                                        onClick={() => openBilling(record)}
                                        className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                                        title="View Hospital Bill & UPI Checkout"
                                    >
                                        <Receipt size={13} /> Bill
                                    </button>
                                    <button
                                        onClick={() => handleViewPrescription(record)}
                                        className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                                        title="View Official Digital Prescription"
                                    >
                                        <FileText size={13} /> Rx Card
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-zinc-500 space-y-2">
                        <FileText size={36} className="mx-auto text-zinc-600" />
                        <p className="text-xs font-bold uppercase tracking-wider">
                            No medical records found matching your filter criteria.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
