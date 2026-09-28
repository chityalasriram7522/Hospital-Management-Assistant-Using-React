import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
    const { toasts, removeToast } = useHospital();

    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md w-full">
            {toasts.map(toast => {
                let bgStyle = "bg-zinc-900 border-zinc-700 text-white";
                let Icon = Info;
                let iconColor = "text-blue-400";

                if (toast.type === "success") {
                    bgStyle = "bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.25)]";
                    Icon = CheckCircle2;
                    iconColor = "text-emerald-400";
                } else if (toast.type === "error") {
                    bgStyle = "bg-red-950/90 border-red-500/40 text-red-100 shadow-[0_0_25px_rgba(239,68,68,0.25)]";
                    Icon = AlertCircle;
                    iconColor = "text-red-400";
                } else if (toast.type === "warning") {
                    bgStyle = "bg-amber-950/90 border-amber-500/40 text-amber-100 shadow-[0_0_25px_rgba(245,158,11,0.25)]";
                    Icon = AlertTriangle;
                    iconColor = "text-amber-400";
                }

                return (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4 ${bgStyle}`}
                    >
                        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
                        <div className="flex-1 text-xs font-semibold leading-relaxed tracking-wide">
                            {toast.message}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
