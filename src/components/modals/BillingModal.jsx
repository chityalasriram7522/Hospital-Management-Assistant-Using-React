import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
    QrCode,
    CheckCircle2,
    Printer,
    Receipt,
    Banknote,
    X
} from 'lucide-react';

export default function BillingModal() {
    const {
        showBillingModal,
        setShowBillingModal,
        selectedBillingPatient,
        patient,
        results,
        doctors,
        subStep,
        setSubStep,
        setAiMsg,
        addToast
    } = useHospital();

    const [paymentMethod, setPaymentMethod] = useState("upi"); // upi, card, cash
    const [isPaid, setIsPaid] = useState(false);
    const [paidTransactionId, setPaidTransactionId] = useState("");

    if (!showBillingModal) return null;

    const activePatient = selectedBillingPatient || patient || {
        name: "Sriram Chityala",
        token: "9842",
        issue: "Fever and severe cough",
        days: 5
    };

    const assignedDoc = doctors.find(d => d.id === activePatient.doctorAssigned) || doctors[0];
    const invoiceId = `INV-2026-${String(activePatient.token || "4892").padStart(4, '0')}`;
    const invoiceDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    // Itemized invoice calculation
    const consultationFee = 500;
    const pharmacyFee = results?.meds ? results.meds.length * 90 : 180;
    const diagnosticFee = activePatient.priority === "Emergency" ? 650 : 250;
    const subtotal = consultationFee + pharmacyFee + diagnosticFee;
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const insuranceDiscount = Math.round(subtotal * 0.15); // 15% Co-pay discount
    const grandTotal = subtotal + tax - insuranceDiscount;

    const handleSimulatePayment = () => {
        const txId = "TXN" + Math.floor(10000000 + Math.random() * 90000000);
        setIsPaid(true);
        setPaidTransactionId(txId);
        addToast(`Payment of ₹${grandTotal} verified successfully via UPI! Txn: ${txId}`, "success");
        if (subStep === 5.5) {
            setSubStep(6);
            const m = "Payment cleared successfully. Would you like offline hospital pickup or doorstep delivery?";
            setAiMsg(m);
        }
    };

    const handlePrintInvoice = () => {
        window.print();
        addToast("Printing official hospital invoice...", "info");
    };

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/85 backdrop-blur-xl"
                onClick={() => setShowBillingModal(false)}
            />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-3xl max-h-[92vh] bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-[0_0_90px_rgba(16,185,129,0.2)] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-white/10 bg-zinc-900/60 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                            <Receipt size={20} />
                        </span>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-black text-white uppercase italic tracking-wider">
                                    Patient Billing & Clinical Checkout
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                    isPaid
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}>
                                    {isPaid ? "PAID ✔" : "UNPAID"}
                                </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 font-mono">
                                Invoice #{invoiceId} • {invoiceDate}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowBillingModal(false)}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                    {/* Patient & Hospital Info Card */}
                    <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-zinc-900/40 border border-white/5 text-xs">
                        <div>
                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider block mb-1">
                                Patient Details
                            </span>
                            <div className="text-white font-bold text-sm">{activePatient.name || "Sriram Chityala"}</div>
                            <div className="text-zinc-400 text-[11px] mt-0.5">Token: #{activePatient.token || "9842"}</div>
                            <div className="text-zinc-400 text-[11px]">Attending: {assignedDoc.name}</div>
                        </div>

                        <div className="text-right">
                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider block mb-1">
                                Hospital Facility
                            </span>
                            <div className="text-white font-bold text-sm">CareConnect Medical Center</div>
                            <div className="text-zinc-400 text-[11px] mt-0.5">Adilabad Super-Speciality Hospital</div>
                            <div className="text-zinc-400 text-[11px]">GSTIN: 36AAACG1234F1Z8</div>
                        </div>
                    </div>

                    {/* Itemized Table */}
                    <div className="border border-white/10 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-white/5 text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-white/10">
                                <tr>
                                    <th className="p-3.5 pl-4">Service Description</th>
                                    <th className="p-3.5">Category</th>
                                    <th className="p-3.5 text-right pr-4">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-zinc-300">
                                <tr>
                                    <td className="p-3.5 pl-4">
                                        <div className="font-semibold text-white">Outpatient Consultation</div>
                                        <div className="text-[10px] text-zinc-500">Specialist: {assignedDoc.name}</div>
                                    </td>
                                    <td className="p-3.5 text-zinc-400">Clinical Review</td>
                                    <td className="p-3.5 text-right pr-4 font-mono font-bold text-white">₹{consultationFee}</td>
                                </tr>
                                <tr>
                                    <td className="p-3.5 pl-4">
                                        <div className="font-semibold text-white">Prescribed Pharmacological Supply</div>
                                        <div className="text-[10px] text-zinc-500">{activePatient.days || 5}-Day Regimen Course</div>
                                    </td>
                                    <td className="p-3.5 text-zinc-400">Pharmacy</td>
                                    <td className="p-3.5 text-right pr-4 font-mono font-bold text-white">₹{pharmacyFee}</td>
                                </tr>
                                <tr>
                                    <td className="p-3.5 pl-4">
                                        <div className="font-semibold text-white">Diagnostic & Triage Vitals Check</div>
                                        <div className="text-[10px] text-zinc-500">Automated NEWS2 / Risk Assessment</div>
                                    </td>
                                    <td className="p-3.5 text-zinc-400">Laboratory</td>
                                    <td className="p-3.5 text-right pr-4 font-mono font-bold text-white">₹{diagnosticFee}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Total Summary */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-white/10">
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between gap-6 text-zinc-400">
                                <span>Subtotal:</span>
                                <span className="font-mono text-white">₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between gap-6 text-zinc-400">
                                <span>Hospital GST (5%):</span>
                                <span className="font-mono text-white">+₹{tax}</span>
                            </div>
                            <div className="flex justify-between gap-6 text-emerald-400">
                                <span>Ayushman / Co-Pay Subsidy:</span>
                                <span className="font-mono">-₹{insuranceDiscount}</span>
                            </div>
                        </div>

                        <div className="text-right border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6 w-full md:w-auto">
                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider block">
                                Net Amount Due
                            </span>
                            <div className="text-3xl font-black text-emerald-400 font-mono">
                                ₹{grandTotal}
                            </div>
                            <span className="text-[10px] text-zinc-400">All applicable healthcare taxes included</span>
                        </div>
                    </div>

                    {/* Payment Simulator Section */}
                    {!isPaid ? (
                        <div className="p-5 rounded-2xl bg-zinc-900/30 border border-white/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-wider text-white">
                                    Select Payment Method
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPaymentMethod("upi")}
                                        className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                                            paymentMethod === "upi" ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-400'
                                        }`}
                                    >
                                        UPI QR Code
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod("card")}
                                        className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                                            paymentMethod === "card" ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-400'
                                        }`}
                                    >
                                        Card / Co-Pay
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod("cash")}
                                        className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                                            paymentMethod === "cash" ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-400'
                                        }`}
                                    >
                                        Cash Counter
                                    </button>
                                </div>
                            </div>

                            {paymentMethod === "upi" && (
                                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-black/60 border border-white/10">
                                    {/* Simulated QR Code Canvas */}
                                    <div className="w-32 h-32 bg-white p-2.5 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-lg">
                                        <div className="w-full h-full border-2 border-black border-dashed flex flex-col items-center justify-center">
                                            <QrCode size={52} className="text-black" />
                                            <span className="text-[8px] font-mono font-black text-black uppercase mt-1">Scan to Pay</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-center sm:text-left">
                                        <div className="text-sm font-bold text-white">
                                            Instant UPI Settlement
                                        </div>
                                        <p className="text-xs text-zinc-400">
                                            Scan via Google Pay, PhonePe, Paytm, or BHIM. VPA: <span className="font-mono text-blue-400">careconnect@hospital</span>
                                        </p>
                                        <button
                                            onClick={handleSimulatePayment}
                                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                                        >
                                            <CheckCircle2 size={15} /> Simulate UPI Payment (₹{grandTotal})
                                        </button>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === "cash" && (
                                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                                            <Banknote size={22} />
                                        </span>
                                        <div>
                                            <div className="text-sm font-black text-white uppercase tracking-wider">
                                                Ground Floor Cash Billing Desk (Counter 03)
                                            </div>
                                            <div className="text-[11px] text-zinc-400">
                                                Present Cash Voucher <span className="font-mono text-amber-400 font-bold">#{invoiceId}</span> to the hospital cashier.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-black/50 p-3.5 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-zinc-500">Payable in Cash</span>
                                            <div className="text-xl font-mono font-black text-amber-400">₹{grandTotal}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handlePrintInvoice}
                                                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <Printer size={13} /> Print Cash Slip
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const txId = "CASH-TOKEN-" + (activePatient.token || "9842");
                                                    setIsPaid(true);
                                                    setPaidTransactionId(txId);
                                                    addToast(`Cash payment selected for Token #${activePatient.token || "9842"}. Present at Counter 03 or on delivery.`, "success");
                                                    if (subStep === 5.5) {
                                                        setSubStep(6);
                                                        setAiMsg("Cash option registered. Would you like offline pickup or doorstep cash on delivery?");
                                                    }
                                                }}
                                                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-600/30 transition-all"
                                            >
                                                Confirm Cash Settlement
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === "card" && (
                                <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
                                    <div className="text-xs text-zinc-300">
                                        Ready to settle <span className="text-white font-bold">₹{grandTotal}</span> via Credit / Debit POS Terminal.
                                    </div>
                                    <button
                                        onClick={handleSimulatePayment}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                                    >
                                        Authorize Card Payment
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Paid Confirmation Box */
                        <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-3">
                                <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                                    <CheckCircle2 size={24} />
                                </span>
                                <div>
                                    <div className="text-sm font-black text-white uppercase tracking-wider">
                                        Payment Settled Successfully
                                    </div>
                                    <div className="text-[11px] text-zinc-400 font-mono">
                                        Ref ID: {paidTransactionId} • Mode: UPI Instant
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrintInvoice}
                                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                    <Printer size={15} /> Print Receipt
                                </button>
                                {subStep >= 5.5 && (
                                    <button
                                        onClick={() => {
                                            setShowBillingModal(false);
                                            setSubStep(6);
                                        }}
                                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30"
                                    >
                                        Proceed to Delivery →
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/10 bg-zinc-900/60 flex justify-between items-center">
                    <button
                        onClick={() => setShowBillingModal(false)}
                        className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-bold uppercase transition-colors cursor-pointer"
                    >
                        Close
                    </button>

                    <button
                        onClick={handlePrintInvoice}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                    >
                        <Printer size={15} /> Print Official Invoice
                    </button>
                </div>
            </div>
        </div>
    );
}
