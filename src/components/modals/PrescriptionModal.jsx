import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Printer, X, ShieldCheck, QrCode, ShoppingBag, ArrowRight } from 'lucide-react';

export default function PrescriptionModal() {
    const {
        showPrescriptionModal,
        setShowPrescriptionModal,
        patient,
        setPatient,
        selectedPrescriptionPatient,
        selectedTeleconsultPatient,
        doctors,
        results,
        setTokenVerified,
        setGridPhase,
        setSubStep,
        setActivePage,
        addToast
    } = useHospital();

    if (!showPrescriptionModal) return null;

    const printPrescription = () => {
        window.print();
    };

    // Prioritize active consultation patient
    const activePat = selectedPrescriptionPatient || selectedTeleconsultPatient || (patient?.name ? patient : null) || {
        name: "Rahul Verma",
        phone: "9876543210",
        issue: "Acute Fever & Severe Cough",
        days: 5,
        token: "9842",
        gender: "Male",
        doctorAssigned: 1
    };

    const assignedDoctor = doctors?.find(d => d.id === activePat.doctorAssigned) || doctors?.[0] || {
        name: "Dr. Sriram Chityala",
        specialization: "MD, Chief Cardiologist",
        experience: "14 yrs"
    };

    const baseMeds = results?.medicus?.meds || [
        "Paracetamol 650mg",
        "Cetirizine 10mg",
        "Multivitamin Zinc Supplement"
    ];

    const medsList = activePat.extraMedsAdded || parseInt(activePat.days) >= 10
        ? [
            ...baseMeds,
            "Pantoprazole 40mg (PPI Antacid - Before Breakfast)",
            "Vitamin C 500mg Chewable (Immune Booster)"
          ]
        : baseMeds;

    const handleProceedToPharmacy = () => {
        const targetPatient = {
            ...patient,
            ...activePat,
            name: activePat.name || patient.name || "Rahul Verma",
            phone: activePat.phone || patient.phone || "9876543210",
            issue: activePat.issue || patient.issue || "Acute Fever and Severe Cough",
            days: activePat.days || patient.days || 5,
            token: activePat.token || patient.token || "9842",
            doctorAssigned: assignedDoctor.id
        };

        setPatient(targetPatient);
        setTokenVerified(true);
        setGridPhase(3); // Navigate to Pharmacy module
        setSubStep(5.5); // Settle bill & choose pickup / home delivery
        setActivePage('dashboard');
        setShowPrescriptionModal(false);
        addToast(`Prescription for ${targetPatient.name} validated in Pharmacy. Proceed to pickup/delivery.`, "success");
    };

    return (
        <div className="fixed inset-0 z-[600] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-zinc-950 border border-white/20 rounded-[2.5rem] max-w-2xl w-full p-6 md:p-10 shadow-2xl relative text-zinc-300">
                {/* Close Button (Hidden in print) */}
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <span className="text-xs font-black uppercase text-blue-400 tracking-[0.3em]">
                        Official Digital Health Record
                    </span>
                    <button
                        onClick={() => setShowPrescriptionModal(false)}
                        className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Printable Rx Card Container */}
                <div id="printable-rx" className="bg-white text-black p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
                    {/* Hospital Letterhead */}
                    <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-5">
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight text-blue-900 leading-none">
                                CareConnect Super Speciality
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mt-1">
                                AI-Integrated Clinical Health & Pharmacy Network
                            </p>
                            <p className="text-[9px] text-zinc-500 mt-0.5">
                                Main Road, Near Central Hub, Adilabad - 504001 | Tel: +91 (08732) 234567
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 text-xs font-black rounded-lg uppercase">
                                Rx Token: #{activePat.token || "9842"}
                            </span>
                            <p className="text-[9px] text-zinc-500 mt-1">
                                Date: {activePat.date || "Today"} | Slot: {activePat.slot || "Regular"}
                            </p>
                        </div>
                    </div>

                    {/* Patient & Doctor Row */}
                    <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-100 p-4 rounded-2xl">
                        <div>
                            <p className="text-[10px] font-bold uppercase text-zinc-500">Patient Details</p>
                            <p className="font-black text-sm text-zinc-900 mt-0.5">{activePat.name || "Patient"}</p>
                            <p className="text-zinc-600 text-[11px]">Phone: +91 {activePat.phone || "9876543210"}</p>
                            <p className="text-zinc-600 text-[11px]">Gender: {activePat.gender || "Male"} | Age: {activePat.age || 28}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-zinc-500">Attending Physician</p>
                            <p className="font-black text-sm text-blue-900 mt-0.5">{assignedDoctor.name}</p>
                            <p className="text-zinc-600 text-[11px]">{assignedDoctor.specialization} (Reg: #MED-8849)</p>
                            <p className="text-emerald-700 font-bold text-[11px]">Department of Internal Care</p>
                        </div>
                    </div>

                    {/* Diagnosis */}
                    <div className="border border-zinc-200 p-4 rounded-2xl">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                                    Primary Symptom Assessment
                                </span>
                                <h3 className="text-lg font-black text-zinc-900 uppercase">
                                    {activePat.issue || "Acute Fever & Respiratory Infection"}
                                </h3>
                            </div>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                                Verified
                            </span>
                        </div>
                        {results?.advice ? (
                            <p className="text-xs text-zinc-700 italic mt-2">
                                "{results.advice}"
                            </p>
                        ) : (
                            <p className="text-xs text-zinc-700 italic mt-2">
                                "Prescribed {activePat.days || 5}-day antipyretic & antihistamine course. Maintain strict oral hydration and rest."
                            </p>
                        )}
                    </div>

                    {/* Medications Table */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-base font-black italic font-serif text-blue-900">Rx</span>
                            <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
                                Prescribed Pharmacological Schedule
                            </span>
                        </div>
                        <table className="w-full text-xs text-left border border-zinc-200 rounded-xl overflow-hidden">
                            <thead className="bg-zinc-100 text-[10px] font-black uppercase text-zinc-700 border-b border-zinc-200">
                                <tr>
                                    <th className="p-3">#</th>
                                    <th className="p-3">Medication</th>
                                    <th className="p-3">Dosage Instruction</th>
                                    <th className="p-3 text-right">Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200">
                                {medsList.map((med, index) => (
                                    <tr key={index} className="hover:bg-zinc-50">
                                        <td className="p-3 font-bold text-zinc-400">{index + 1}</td>
                                        <td className="p-3 font-bold text-zinc-900">{med}</td>
                                        <td className="p-3 text-emerald-700 font-semibold">
                                            {results?.medicus?.directive || "After Food with Warm Water"}
                                        </td>
                                        <td className="p-3 text-right font-mono font-bold">
                                            {activePat.days || "5"} Days
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Verification & QR */}
                    <div className="pt-4 border-t border-zinc-200 flex justify-between items-center text-[10px] text-zinc-500">
                        <div className="flex items-center gap-3">
                            <QrCode size={36} className="text-zinc-800" />
                            <div>
                                <p className="font-bold text-zinc-800">Scan to Verify in Hospital Cloud</p>
                                <p className="font-mono">HASH: CC-2026-{activePat.token || "9842"}-AUTH</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold mb-1">
                                <ShieldCheck size={12} /> Digitally Signed
                            </div>
                            <p className="font-bold text-zinc-800">{assignedDoctor.name}</p>
                            <p className="text-[9px]">Medical Superintendent</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons (Hidden when printing) */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3 print:hidden">
                    <button
                        onClick={printPrescription}
                        className="py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black uppercase text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                        <Printer size={16} /> Print / Save as PDF
                    </button>

                    <button
                        onClick={handleProceedToPharmacy}
                        className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black uppercase text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01] cursor-pointer"
                    >
                        <ShoppingBag size={16} /> Pick Up / Order Medicines at Pharmacy <ArrowRight size={15} />
                    </button>

                    <button
                        onClick={() => setShowPrescriptionModal(false)}
                        className="py-3 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
