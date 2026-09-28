import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { LayoutDashboard, Activity, Heart, AlertOctagon, HelpCircle, Info, FileText, X, Pill } from 'lucide-react';

export default function Sidebar() {
    const {
        showSidebar,
        setShowSidebar,
        activePage,
        setActivePage,
        patients,
        emergencyAlerts,
        donations,
        appointments,
        inventory
    } = useHospital();

    if (!showSidebar) return null;

    const navItems = [
        {
            id: 'dashboard',
            label: 'Triage & Command Center',
            icon: LayoutDashboard,
            badge: null,
            color: 'hover:border-blue-500/50 hover:bg-blue-600/10 hover:text-blue-400'
        },
        {
            id: 'records',
            label: 'EHR & Medical Records',
            icon: FileText,
            badge: `${patients.length + appointments.length} Files`,
            color: 'hover:border-purple-500/50 hover:bg-purple-600/10 hover:text-purple-400'
        },
        {
            id: 'inventory',
            label: 'Pharmacy Drug Stock',
            icon: Pill,
            badge: `${inventory?.length || 8} SKUs`,
            color: 'hover:border-emerald-500/50 hover:bg-emerald-600/10 hover:text-emerald-400'
        },
        {
            id: 'hospitalDashboard',
            label: 'Hospital Ops & Ward Matrix',
            icon: Activity,
            badge: `${patients.length} In-Patients`,
            color: 'hover:border-emerald-500/50 hover:bg-emerald-600/10 hover:text-emerald-400'
        },
        {
            id: 'blood',
            label: 'Blood Donation Registry',
            icon: Heart,
            badge: donations.length > 0 ? `${donations.length} Donors` : null,
            color: 'hover:border-rose-500/50 hover:bg-rose-600/10 hover:text-rose-400'
        },
        {
            id: 'emergency',
            label: 'Emergency Response Hub',
            icon: AlertOctagon,
            badge: emergencyAlerts.length > 0 ? `${emergencyAlerts.length} Alerts` : '24/7 Live',
            color: 'hover:border-red-500/50 hover:bg-red-600/10 hover:text-red-400'
        },
        {
            id: 'help',
            label: 'Help Desk & Support Center',
            icon: HelpCircle,
            badge: null,
            color: 'hover:border-amber-500/50 hover:bg-amber-600/10 hover:text-amber-400'
        },
        {
            id: 'about',
            label: 'About Hospital & Leadership',
            icon: Info,
            badge: null,
            color: 'hover:border-cyan-500/50 hover:bg-cyan-600/10 hover:text-cyan-400'
        }
    ];

    return (
        <div className="fixed inset-0 z-[300] flex animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                onClick={() => setShowSidebar(false)}
            />

            {/* Sidebar panel */}
            <aside className="relative w-80 md:w-96 h-full bg-zinc-950/95 backdrop-blur-3xl border-r border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.2)] p-8 flex flex-col gap-6 animate-in slide-in-from-left duration-300 rounded-r-[2.5rem] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.3em]">
                            Navigation Hub
                        </span>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight italic">
                            CareConnect Menu
                        </h2>
                    </div>

                    <button
                        onClick={() => setShowSidebar(false)}
                        className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-600/80 rounded-2xl border border-white/10 text-zinc-300 hover:text-white transition-all duration-300"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

                {/* Nav Links */}
                <nav className="flex flex-col gap-3">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activePage === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActivePage(item.id);
                                    setShowSidebar(false);
                                }}
                                className={`flex items-center justify-between p-4 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all duration-300 text-left ${
                                    isActive
                                        ? 'bg-blue-600/20 border-blue-500/60 text-white shadow-lg shadow-blue-500/10'
                                        : `bg-white/5 border-white/5 text-zinc-300 ${item.color}`
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={18} className={isActive ? 'text-blue-400' : 'text-zinc-400'} />
                                    <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/10">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer system status */}
                <div className="mt-auto pt-6 border-t border-white/10">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                            <span className="text-xs font-bold text-emerald-400">All Systems Operational</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">v7.0</span>
                    </div>
                </div>
            </aside>
        </div>
    );
}
