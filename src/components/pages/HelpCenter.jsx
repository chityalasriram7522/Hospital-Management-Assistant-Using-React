import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { HelpCircle, ChevronDown, ChevronUp, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export default function HelpCenter() {
    const { setActivePage, addToast } = useHospital();

    const [openFaq, setOpenFaq] = useState(0);
    const [helpName, setHelpName] = useState("");
    const [helpEmail, setHelpEmail] = useState("");
    const [helpIssue, setHelpIssue] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const faqs = [
        {
            q: "How does the AI Voice Assistant work?",
            a: "Click 'AI Assisted' in the header to activate voice control. You can speak your full name, symptoms, appointment slots, and pharmacy tokens. The AI assistant automatically parses your speech and guides you with synthesized voice instructions."
        },
        {
            q: "How do I verify and collect my pharmacy token?",
            a: "When you book an appointment in Phase 02, a 4-digit token (e.g. #9842) is generated and dispatched. When entering Phase 03 Logistics, type this token or speak it digit-by-digit to unlock clinical prescriptions."
        },
        {
            q: "Can I choose between offline hospital pickup and doorstep delivery?",
            a: "Yes! In Phase 03, choose 'Offline Pickup' to collect medication from the ground-floor hospital pharmacy, or 'Online Delivery' with your address for express 15-minute dispatch."
        },
        {
            q: "How do doctors and beds get assigned in Hospital Ops?",
            a: "In the Hospital Ops & Ward Matrix page, click '+ Admit Patient' to log a new admission. The system automatically matches the patient with an available specialist, or staff can manually assign physicians."
        }
    ];

    const handleSubmitTicket = (e) => {
        e.preventDefault();
        if (!helpName.trim() || !helpEmail.trim() || !helpIssue.trim()) {
            addToast("Please fill all support ticket fields.", "warning");
            return;
        }

        setSubmitted(true);
        addToast("Support ticket logged successfully! Support ID: #TK-8842", "success");
        setHelpName("");
        setHelpEmail("");
        setHelpIssue("");

        setTimeout(() => setSubmitted(false), 4000);
    };

    return (
        <div className="flex-1 bg-gradient-to-br from-zinc-900/90 via-black to-zinc-950/90 border border-white/10 p-6 md:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl overflow-y-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-[0.3em]">
                        Support & Guidance
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight">
                        CareConnect <span className="text-amber-400">Help Desk</span>
                    </h1>
                </div>

                <button
                    onClick={() => setActivePage("dashboard")}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                    <ArrowLeft size={14} /> Back
                </button>
            </div>

            {/* System Status Banner */}
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs font-black uppercase text-emerald-400">
                        Operational Status: 100% Online
                    </span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-zinc-400 font-mono">
                    <span>WebSpeech: Active</span>
                    <span>Triage AI: Standby</span>
                    <span>Pharmacy Dispatch: Live</span>
                </div>
            </div>

            {/* 2-column layout: FAQ + Ticket Form */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* FAQs */}
                <div className="space-y-4">
                    <h3 className="text-base font-black uppercase text-white tracking-wide flex items-center gap-2">
                        <HelpCircle size={18} className="text-amber-400" /> Frequently Asked Questions
                    </h3>

                    <div className="space-y-3">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                                    className="w-full p-4 flex justify-between items-center text-left text-xs font-black uppercase text-white hover:text-amber-400 transition-colors"
                                >
                                    <span>{faq.q}</span>
                                    {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {openFaq === idx && (
                                    <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support Ticket Form */}
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-5">
                    <h3 className="text-base font-black uppercase text-amber-400 tracking-wide">
                        Submit a Help Ticket
                    </h3>

                    {submitted ? (
                        <div className="p-8 text-center space-y-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl animate-in zoom-in-95">
                            <CheckCircle2 size={40} className="mx-auto text-emerald-400" />
                            <h4 className="text-lg font-black text-white uppercase">Ticket Dispatched</h4>
                            <p className="text-xs text-zinc-300">
                                Ticket #TK-8842 logged. Our clinical technical lead will respond shortly.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitTicket} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                                    Your Name *
                                </label>
                                <input
                                    type="text"
                                    value={helpName}
                                    onChange={(e) => setHelpName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-amber-500 text-xs"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={helpEmail}
                                    onChange={(e) => setHelpEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-amber-500 text-xs"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                                    Describe Your Issue *
                                </label>
                                <textarea
                                    value={helpIssue}
                                    onChange={(e) => setHelpIssue(e.target.value)}
                                    placeholder="Describe any issues encountered with appointments, prescriptions, or voice recognition..."
                                    className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-amber-500 text-xs resize-none h-24"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-black uppercase text-xs tracking-wider shadow-lg shadow-amber-600/30 transition-all hover:scale-[1.01] cursor-pointer mt-4 flex items-center justify-center gap-2"
                            >
                                <Send size={14} /> Submit Support Ticket
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
