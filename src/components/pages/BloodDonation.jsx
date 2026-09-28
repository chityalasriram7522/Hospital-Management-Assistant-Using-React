import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Droplet, ArrowLeft, CheckCircle2, ShieldCheck, Users } from 'lucide-react';

export default function BloodDonation() {
    const {
        donations,
        setDonations,
        setActivePage,
        addToast
    } = useHospital();

    const [donorName, setDonorName] = useState("");
    const [phone, setPhone] = useState("");
    const [bloodGroup, setBloodGroup] = useState("A+");
    const [amount, setAmount] = useState("350");
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const cleanPhone = phone.replace(/\D/g, '');

        if (!donorName.trim() || cleanPhone.length < 10) {
            addToast("Please provide valid donor name and 10-digit mobile number.", "warning");
            return;
        }

        const newDonor = {
            id: Date.now(),
            donorName: donorName.trim(),
            phone: cleanPhone,
            bloodGroup,
            amount: Number(amount) || 350,
            registeredAt: "Just now"
        };

        setDonations(prev => [newDonor, ...prev]);
        setSuccess(true);
        addToast(`Thank you ${donorName}! Your blood donation registration is confirmed.`, "success");

        // Clear form
        setDonorName("");
        setPhone("");
        setAmount("350");

        setTimeout(() => setSuccess(false), 4000);
    };

    return (
        <div className="flex-1 bg-gradient-to-br from-zinc-900/90 via-black to-zinc-950/90 border border-white/10 p-6 md:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl overflow-y-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <span className="text-[10px] font-black uppercase text-rose-500 tracking-[0.3em]">
                        Lifeline Network
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight">
                        Blood Donation <span className="text-rose-500">Registry</span>
                    </h1>
                </div>

                <button
                    onClick={() => setActivePage("dashboard")}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                    <ArrowLeft size={14} /> Back
                </button>
            </div>

            {/* Main 2-column layout */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Registration Form */}
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-5">
                    <h3 className="text-base font-black uppercase text-rose-400 tracking-wide flex items-center gap-2">
                        <Droplet size={18} fill="currentColor" /> Donor Enrollment Form
                    </h3>

                    {success ? (
                        <div className="p-8 text-center space-y-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl animate-in zoom-in-95">
                            <CheckCircle2 size={40} className="mx-auto text-emerald-400" />
                            <h4 className="text-lg font-black text-white uppercase">Donation Registered</h4>
                            <p className="text-xs text-zinc-300 max-w-xs mx-auto">
                                Thank you for your noble pledge. Our clinical transfusion unit will reach out.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                                    Donor Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={donorName}
                                    onChange={(e) => setDonorName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-rose-500 text-xs"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                                        Mobile Number *
                                    </label>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="10-digit number"
                                        className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-rose-500 text-xs font-mono"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                                        Blood Group
                                    </label>
                                    <select
                                        value={bloodGroup}
                                        onChange={(e) => setBloodGroup(e.target.value)}
                                        className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-rose-500 text-xs font-bold"
                                    >
                                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                                    Donation Target (ml)
                                </label>
                                <select
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-rose-500 text-xs font-bold"
                                >
                                    <option value="350">350 ml (Standard Whole Blood)</option>
                                    <option value="450">450 ml (Max Adult Capacity)</option>
                                    <option value="250">250 ml (Platelet Apheresis)</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black uppercase text-xs tracking-wider shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.01] cursor-pointer mt-4"
                            >
                                Submit Donor Registration
                            </button>
                        </form>
                    )}
                </div>

                {/* Guidelines and Recent Donors */}
                <div className="space-y-6">
                    {/* Guidelines Card */}
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                        <h3 className="text-base font-black uppercase text-rose-400 tracking-wide flex items-center gap-2">
                            <ShieldCheck size={18} /> Safety Guidelines
                        </h3>
                        <ul className="space-y-2.5 text-xs text-zinc-300">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                                Age between 18 and 65 years with weight &ge; 50 kg.
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                                Minimum 90 days interval since previous whole blood donation.
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                                Free from active viral, cardiovascular, or infectious conditions.
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                                Hydrate well with water and consume light food prior to donation.
                            </li>
                        </ul>
                    </div>

                    {/* Registered Donors List */}
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-black uppercase text-white tracking-wide flex items-center gap-2">
                                <Users size={16} /> Recent Donors ({donations.length})
                            </h3>
                            <span className="text-[10px] text-zinc-500 uppercase font-mono">Blood Bank Live</span>
                        </div>

                        {donations.length > 0 ? (
                            <div className="divide-y divide-white/5 max-h-48 overflow-y-auto scrollbar-hide">
                                {donations.map(d => (
                                    <div key={d.id} className="py-2.5 flex justify-between items-center text-xs">
                                        <div>
                                            <span className="font-bold text-white block">{d.donorName}</span>
                                            <span className="text-[10px] text-zinc-500">+91 {d.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 font-black text-xs border border-rose-500/30">
                                                {d.bloodGroup}
                                            </span>
                                            <span className="text-[10px] font-mono text-zinc-400">
                                                {d.amount}ml
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-zinc-500 text-center py-4">
                                No donors registered yet today. Be the first to donate!
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
