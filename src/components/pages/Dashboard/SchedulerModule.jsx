import React, { useState, useMemo, useEffect } from 'react';
import { useHospital } from '../../../context/HospitalContext';
import { sendAppointmentSms, fetchBookedSlotsForDate } from '../../../services/mockApi';
import { speechEngine } from '../../../services/speechService';
import { Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

export default function SchedulerModule() {
    const {
        patient,
        setPatient,
        gridPhase,
        setGridPhase,
        subStep,
        setSubStep,
        results,
        appointments,
        setAppointments,
        addToast,
        setAiMsg
    } = useHospital();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookedForDay, setBookedForDay] = useState([]);

    // Generate dynamic dates (today + 3 upcoming days)
    const dynamicDates = useMemo(() => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 4; i++) {
            const next = new Date();
            next.setDate(today.getDate() + i);
            dates.push(next.toLocaleDateString("en-IN", {
                weekday: i === 0 ? undefined : "short",
                day: "2-digit",
                month: "short"
            }) + (i === 0 ? " (Today)" : ""));
        }
        return dates;
    }, []);

    // Fetch booked slots for the selected date
    useEffect(() => {
        if (!patient.date) return;
        let isMounted = true;
        fetchBookedSlotsForDate(patient.date).then(data => {
            if (isMounted) setBookedForDay(data);
        });
        return () => { isMounted = false; };
    }, [patient.date]);

    const handleSelectDate = (d) => {
        setPatient(prev => ({ ...prev, date: d }));
        setSubStep(3);
        const m = `Date set for ${d}. Please pick your preferred consultation time slot.`;
        setAiMsg(m);
        speechEngine.speak(m);
    };

    const handleSelectSlot = (s) => {
        setPatient(prev => ({ ...prev, slot: s }));
        setSubStep(4);
        const m = "Time slot secured. Please verify your contact mobile number.";
        setAiMsg(m);
        speechEngine.speak(m);
    };

    const handleConfirmBooking = async (e) => {
        e.preventDefault();
        const cleanPhone = (patient.phone || "").replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            addToast("Please provide a valid 10-digit mobile number.", "warning");
            speechEngine.speak("Please enter a valid 10 digit mobile number.");
            return;
        }

        setIsSubmitting(true);
        try {
            await sendAppointmentSms({ ...patient, phone: cleanPhone });

            // Record appointment into state & localStorage
            const newAppt = {
                id: Date.now(),
                patientName: patient.name,
                phone: cleanPhone,
                date: patient.date,
                slot: patient.slot,
                token: String(patient.token)
            };
            setAppointments(prev => [...prev, newAppt]);

            setSubStep(4.5);
            addToast(`Appointment Confirmed! Token #${patient.token} dispatched via SMS.`, "success");
            const m = `Appointment confirmed. Your official clinic token is ${patient.token}. Please save it for pharmacy entry.`;
            setAiMsg(m);
            speechEngine.speak(m);
        } catch {
            addToast("Notice: Local appointment confirmed offline.", "info");
            setSubStep(4.5);
        } finally {
            setIsSubmitting(false);
        }
    };

    const slotsList = results?.slots || [
        "09:00 AM - 10:00 AM",
        "10:30 AM - 11:30 AM",
        "02:00 PM - 03:00 PM",
        "03:30 PM - 04:30 PM",
        "05:00 PM - 06:00 PM",
        "06:30 PM - 07:30 PM"
    ];

    return (
        <div
            className={`bg-zinc-900/60 border rounded-[2.5rem] p-6 md:p-8 flex flex-col shadow-2xl transition-all duration-500 min-h-[520px] ${
                gridPhase === 2
                    ? 'border-emerald-500/50 shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                    : 'border-white/5 opacity-50 grayscale hover:opacity-80'
            }`}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Calendar size={15} /> 02 / Appointment Scheduler
                </h4>
                {gridPhase > 2 && (
                    <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle size={12} /> Booked
                    </span>
                )}
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col justify-center">
                {gridPhase < 2 ? (
                    <div className="text-center opacity-30 my-auto py-12">
                        <Clock size={48} className="mx-auto mb-3 text-zinc-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            Awaiting Registry Lock (Phase 01)
                        </p>
                    </div>
                ) : subStep === 2 ? (
                    <div className="space-y-6 my-auto animate-in slide-in-from-bottom-4 duration-300">
                        <div className="text-center">
                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-1">
                                Available Consulting Dates
                            </span>
                            <h3 className="text-lg font-black text-white italic">
                                Choose Consultation Day
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {dynamicDates.map(d => (
                                <button
                                    key={d}
                                    onClick={() => handleSelectDate(d)}
                                    className={`p-4 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                                        patient.date === d
                                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                                            : 'bg-white/5 border-white/5 text-zinc-300 hover:border-emerald-500/50 hover:bg-emerald-600/10'
                                    }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => { setGridPhase(1); setSubStep(1); }}
                            className="w-full text-[10px] font-black uppercase text-zinc-500 hover:text-white flex justify-center items-center gap-1 transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={14} /> Back to Symptoms
                        </button>
                    </div>
                ) : subStep === 3 ? (
                    <div className="space-y-5 animate-in zoom-in-95 duration-300">
                        <div className="text-center">
                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-1">
                                Slots on {patient.date}
                            </span>
                            <h3 className="text-base font-black text-white italic">
                                Select Consultation Window
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto scrollbar-hide pr-1">
                            {slotsList.map(s => {
                                const isBooked = appointments.some(a => a.date === patient.date && a.slot === s) ||
                                                 bookedForDay.some(a => a.slot === s);

                                return (
                                    <button
                                        key={s}
                                        disabled={isBooked}
                                        onClick={() => handleSelectSlot(s)}
                                        className={`p-3.5 rounded-xl border text-[11px] font-black transition-all text-center cursor-pointer ${
                                            isBooked
                                                ? 'bg-black/60 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                                                : patient.slot === s
                                                ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                                                : 'bg-white/5 border-white/5 text-zinc-300 hover:border-emerald-500/40 hover:bg-emerald-600/10'
                                        }`}
                                    >
                                        <div>{s}</div>
                                        {isBooked && (
                                            <span className="block text-[8px] text-red-400 font-bold uppercase mt-0.5">
                                                Slot Full
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setSubStep(2)}
                            className="w-full text-[10px] font-black uppercase text-zinc-500 hover:text-white block text-center cursor-pointer pt-2"
                        >
                            <ChevronLeft size={14} className="inline mr-1" /> Change Date
                        </button>
                    </div>
                ) : subStep === 4 ? (
                    <form onSubmit={handleConfirmBooking} className="space-y-5 animate-in slide-in-from-right duration-300">
                        <div className="text-center">
                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-1">
                                Secure Token Generation
                            </span>
                            <h3 className="text-base font-black text-white italic">
                                Confirm Patient Contact
                            </h3>
                        </div>

                        <div className="p-5 bg-black/50 rounded-2xl border border-white/10 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                                    Mobile Number (+91)
                                </label>
                                <input
                                    type="tel"
                                    autoFocus
                                    maxLength={10}
                                    value={patient.phone}
                                    onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
                                    placeholder="Enter 10-digit number"
                                    className="w-full bg-transparent border-b border-zinc-700 p-2 text-xl text-center outline-none text-white font-mono placeholder:text-zinc-700 focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                                    Gender
                                </label>
                                <select
                                    value={patient.gender}
                                    onChange={(e) => setPatient({ ...patient, gender: e.target.value })}
                                    className="w-full bg-zinc-800 p-3 rounded-xl border border-white/10 text-white font-bold text-xs"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-4 rounded-2xl font-black uppercase text-xs tracking-wider transition-all shadow-xl shadow-emerald-600/20 hover:scale-[1.01] cursor-pointer"
                        >
                            {isSubmitting ? "Generating Token..." : "Confirm & Send SMS Token"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setSubStep(3)}
                            className="w-full text-[10px] font-black text-zinc-500 hover:text-white uppercase block text-center cursor-pointer"
                        >
                            Back to Slots
                        </button>
                    </form>
                ) : subStep === 4.5 ? (
                    <div className="space-y-6 animate-in zoom-in-95 duration-300 text-center my-auto">
                        <div className="p-6 bg-emerald-950/30 rounded-3xl border border-emerald-500/30 space-y-2">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                Appointment Confirmed
                            </span>
                            <p className="text-4xl font-mono font-black text-white tracking-widest">
                                #{patient.token}
                            </p>
                            <p className="text-[11px] text-zinc-400">
                                {patient.date} at {patient.slot}
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setGridPhase(3);
                                setSubStep(5);
                                const m = "Transitioning to Logistics. Please verify your pharmacy token.";
                                setAiMsg(m);
                                speechEngine.speak(m);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] cursor-pointer"
                        >
                            Proceed to Pharmacy Hub <ChevronRight size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="text-center my-auto py-6 animate-in zoom-in duration-300">
                        <CheckCircle size={46} className="mx-auto text-emerald-400 mb-3" />
                        <h3 className="text-xl font-black italic text-white">Booking Verified</h3>
                        <p className="text-xs text-zinc-400 mt-1">
                            {patient.date} — {patient.slot}
                        </p>
                        <p className="text-[10px] font-mono text-emerald-400 mt-2">
                            Token: #{patient.token}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
