import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Video, X } from 'lucide-react';

export default function VideoModal() {
    const { showVideo, setShowVideo, patient, results } = useHospital();

    if (!showVideo) return null;

    const videoSrc = results?.medicus?.video || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

    return (
        <div className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-2xl flex flex-col p-6 md:p-10 animate-in zoom-in-95 duration-200">
            <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-center text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-2xl">
                            <Video size={24} className="text-red-500 animate-pulse" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase text-red-400 tracking-[0.4em]">
                                Clinical Tutorial & Guidance Loop
                            </span>
                            <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tight">
                                Medical Advisory: {patient.issue || "General Care"}
                            </h2>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowVideo(false)}
                        className="p-3.5 bg-white/10 hover:bg-red-600 rounded-full transition-all text-white cursor-pointer shadow-xl hover:scale-105"
                        title="Close Video"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Video Player */}
                <div className="flex-1 bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative flex items-center justify-center">
                    <video
                        autoPlay
                        loop
                        controls
                        playsInline
                        className="w-full h-full object-cover max-h-[60vh] rounded-[2.5rem]"
                    >
                        <source src={videoSrc} type="video/mp4" />
                        Your browser does not support video playback.
                    </video>
                </div>

                {/* Advisory footer */}
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-6 rounded-[2rem] text-center shadow-xl">
                    <p className="text-sm md:text-base font-bold text-emerald-200 tracking-wide italic">
                        "Clinical advice validated by Dr. Sriram Chityala & Medical Board. Please review dosage precautions carefully."
                    </p>
                </div>
            </div>
        </div>
    );
}
