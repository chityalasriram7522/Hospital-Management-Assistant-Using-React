import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { ArrowLeft, Stethoscope, Award, Shield } from 'lucide-react';

export default function AboutPage() {
    const { setActivePage } = useHospital();

    return (
        <div className="flex-1 bg-gradient-to-br from-zinc-900/90 via-black to-zinc-950/90 border border-white/10 p-6 md:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-xl overflow-y-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <span className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.3em]">
                        Institutional Profile
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight">
                        About <span className="text-cyan-400">CareConnect Hospital</span>
                    </h1>
                </div>

                <button
                    onClick={() => setActivePage("dashboard")}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                    <ArrowLeft size={14} /> Back
                </button>
            </div>

            {/* Intro text */}
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed max-w-3xl">
                <p>
                    <span className="text-blue-400 font-black">CareConnect Super Speciality Hospital</span> is a cutting-edge, AI-integrated healthcare system architected to streamline patient triage, clinical consultation scheduling, and automated pharmaceutical logistics.
                </p>
                <p>
                    Established in <span className="text-white font-bold">2026</span>, the clinical ecosystem is owned and directed by{" "}
                    <span className="text-emerald-400 font-bold">Dr. Sriram Chityala</span>, MBBS, MD (Cardiology), with the goal of bringing next-generation artificial intelligence directly to acute medical workflows.
                </p>
            </div>

            {/* Highlight Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-3">
                    <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl w-fit">
                        <Stethoscope size={22} />
                    </div>
                    <h3 className="text-base font-black uppercase text-white">AI-Assisted Triage</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        Multimodal speech synthesis and speech recognition parse patient symptoms in real time, determining triage urgency.
                    </p>
                </div>

                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-3">
                    <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl w-fit">
                        <Award size={22} />
                    </div>
                    <h3 className="text-base font-black uppercase text-white">Clinical Precision</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        Direct sync between doctor schedules, bed occupancy counters, and smart digital prescription token verification.
                    </p>
                </div>

                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-3">
                    <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl w-fit">
                        <Shield size={22} />
                    </div>
                    <h3 className="text-base font-black uppercase text-white">24/7 Logistics Hub</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        Automated medication allocation with both on-premises pickup and simulated rapid 15-minute home delivery.
                    </p>
                </div>
            </div>

            {/* Founder Profile */}
            <div className="p-8 bg-gradient-to-r from-blue-950/30 to-indigo-950/30 rounded-3xl border border-blue-500/20 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-blue-600/30 border-2 border-blue-400 flex items-center justify-center text-3xl font-black text-white shrink-0">
                    SC
                </div>
                <div>
                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                        Founder & Medical Superintendent
                    </span>
                    <h2 className="text-xl font-black text-white">Dr. Sriram Chityala</h2>
                    <p className="text-xs text-zinc-400 mt-1">
                        Cardiovascular Medicine & Healthcare Automation Specialist. Championing AI-driven triage protocols across Telangana and nationwide clinical centers.
                    </p>
                </div>
            </div>
        </div>
    );
}
