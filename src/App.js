import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from "canvas-confetti";
import {
    Activity, ShieldAlert, MapPin, Bed, Zap, Clock, User, ChevronRight, ChevronLeft,
    CheckCircle, Video, Smartphone, FileText, Pill, Truck, X, ShoppingBag, Home, Calendar, Users, Send, Mic, MicOff, Settings
} from 'lucide-react';

export default function App() {

    const tokenRef = useRef(null);
    const [generatedToken, setGeneratedToken] = useState(null);

    const recognitionRef = useRef(null);
    const isRecognitionRunning = useRef(false);
    const [mode, setMode] = useState('manual');
    // const [mode, setMode] = useState("ai"); 
    const [isListening, setIsListening] = useState(false);
    const [aiStep, setAiStep] = useState(0);
    const [conversationStage, setConversationStage] = useState("start");
    const [gridPhase, setGridPhase] = useState(1);
    const [subStep, setSubStep] = useState(0);

    // NEW STATES FOR FEATURES
    // const [generatedToken, setGeneratedToken] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [inputToken, setInputToken] = useState("");
    const [tokenVerified, setTokenVerified] = useState(false);
    const [donorName, setDonorName] = useState("");
    const [phone, setPhone] = useState("");
    const [bloodGroup, setBloodGroup] = useState("A+");
    const [amount, setAmount] = useState("");
    const [donationSuccess, setDonationSuccess] = useState(false);
    const [emergencyName, setEmergencyName] = useState("");
    const [emergencyPhone, setEmergencyPhone] = useState("");
    const [emergencyMessage, setEmergencyMessage] = useState("");
    const [emergencySent, setEmergencySent] = useState(false);

    const [helpName, setHelpName] = useState("");
    const [helpEmail, setHelpEmail] = useState("");
    const [helpIssue, setHelpIssue] = useState("");
    const [helpSubmitted, setHelpSubmitted] = useState(false);

    const [patients, setPatients] = useState([]);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [notification, setNotification] = useState("");

    const [patientName, setPatientName] = useState("");
    const [priority, setPriority] = useState("Normal");

    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) return;

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognitionRef.current = recognition;

        recognition.onresult = (event) => {
            const transcript =
                event.results[event.results.length - 1][0].transcript.toLowerCase();

            console.log("User said:", transcript);

            handleAiLogic(transcript); // ONLY THIS
        };

        recognition.onend = () => {
            if (mode === 'ai' && isRecognitionRunning.current) {
                recognition.start();
            }
        };

    }, [mode]);

    const [doctors, setDoctors] = useState([
        { id: 1, name: "Dr. Smith", specialization: "Cardiology", status: "Available" },
        { id: 2, name: "Dr. John", specialization: "Neurology", status: "Available" },
        { id: 3, name: "Dr. Sarah", specialization: "Orthopedics", status: "Available" }
    ]);

    const [labs, setLabs] = useState([
        { id: 1, name: "Radiology", status: "Active" },
        { id: 2, name: "Pathology", status: "Inactive" },
        { id: 3, name: "MRI", status: "Maintenance" }
    ]);

    const [showDoctorModal, setShowDoctorModal] = useState(false);

    // MOVE THESE TO THE TOP (with your other states)
    const TOTAL_BEDS = 120;
    const TOTAL_DOCTORS = 40;
    const TOTAL_LABS = 10;
    const TOTAL_LAB_STAFF = 25;

    const [hospitalData, setHospitalData] = useState({
        occupiedBeds: 60,
        doctorsAvailable: 25,
        labsActive: 6
    });

    const generateHospitalData = () => {
        setHospitalData({
            occupiedBeds: Math.floor(Math.random() * TOTAL_BEDS),
            doctorsAvailable: Math.floor(Math.random() * TOTAL_DOCTORS),
            labsActive: Math.floor(Math.random() * TOTAL_LABS)
        });
    };



    const [patient, setPatient] = useState({
        name: "", phone: "", gender: "Male", issue: "", customIssue: "",
        date: "", slot: "", token: "", days: "5", address: "", method: "Self Pickup",
        isOther: false, otherName: "", otherAddress: ""
    });

    const [aiMsg, setAiMsg] = useState("System Standby. Please identify yourself to begin.");
    const [results, setResults] = useState(null);
    const [mapProgress, setMapProgress] = useState(0);
    const [showVideo, setShowVideo] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [activePage, setActivePage] = useState("dashboard");

    const voiceService = useRef(new SpeechSynthesisUtterance());

    const startListening = () => {
        if (!recognitionRef.current) return;

        if (!isRecognitionRunning.current) {
            try {
                recognitionRef.current.start();
                isRecognitionRunning.current = true;
                setIsListening(true);
            } catch (err) {
                console.log("Recognition already running");
            }
        }
    };

    const stopListening = () => {
        if (!recognitionRef.current) return;

        if (isRecognitionRunning.current) {
            recognitionRef.current.stop();
            isRecognitionRunning.current = false;
            setIsListening(false);
        }
    };

    const speak = useCallback((text) => {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;

        // STOP listening when AI starts speaking
        utterance.onstart = () => {
            stopListening();
        };

        // START listening again AFTER AI finishes speaking
        utterance.onend = () => {
            if (mode === 'ai') {
                setTimeout(() => {
                    startListening();
                }, 600);
            }
        };

        window.speechSynthesis.speak(utterance);
        setAiMsg(text);
    }, [mode]);
    useEffect(() => {

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech recognition not supported");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognitionRef.current = recognition;

        recognition.onresult = (event) => {

            const transcript =
                event.results[event.results.length - 1][0].transcript.trim();

            console.log("User said:", transcript);

            if (mode === "ai") {
                handleAiLogic(transcript);
            }
            else {
                handleVoiceInput(transcript); // manual flow
            }
        };
        recognition.onend = () => {
            isRecognitionRunning.current = false;

            if (mode === "ai") {
                startListening();
            }
        };

    }, [mode]);


    const handleAiLogic = (transcript) => {
        const input = transcript.toLowerCase();

        setAiStep(prevStep => {

            // STEP 0 — NAME
            if (prevStep === 0) {
                if (!transcript || transcript.length < 2) {
                    speak("Please say your full name clearly.");
                    return 0;
                }

                setPatient(p => ({ ...p, name: transcript }));
                setSubStep(1);
                speak(`Welcome ${transcript}. What is your health issue?`);
                return 1;
            }

            // STEP 1 — ISSUE
            if (prevStep === 1) {

                const feverWords = ["fever", "cold", "cough", "temperature", "flu"];
                const chestWords = ["chest", "heart", "breathing", "pressure"];
                const bodyWords = ["body", "pain", "aches", "weakness", "tired"];

                let issue = "";

                if (feverWords.some(word => input.includes(word))) {
                    issue = "Fever / Cold";
                }
                else if (chestWords.some(word => input.includes(word))) {
                    issue = "Chest Pain";
                }
                else if (bodyWords.some(word => input.includes(word))) {
                    issue = "Body Aches";
                }
                if (input.includes("other")) {

                    setPatient(p => ({ ...p, issue: "Other" }));

                    speak("For other issues I recommend consulting a doctor. Would you like to book an appointment?");

                    return 2;
                }


                setPatient(p => ({ ...p, issue }));

                // SHOW MEDICAL SUGGESTION PAGE
                setShowVideo(true);

                speak(`I detected ${issue}. Showing medical guidance.`);
                // setShowVideo(false);

                // After video, ask appointment
                setTimeout(() => {
                    speak("Would you like to book an appointment?");
                }, 5000);

                return 2;
            }

            // STEP 2 — YES OR NO
            if (prevStep === 2) {

                if (input.includes("yes")) {

                    setSubStep(2);
                    setGridPhase(2);
                    setShowVideo(false);

                    speak("Please tell appointment date.");
                    return 3;
                }

                if (input.includes("no")) {
                    speak("Okay. Take rest and stay hydrated.");
                    return 0;
                }

                speak("Please say yes or no.");
                return 2;
            }
            // STEP 3 — DATE
            if (prevStep === 3) {

                const days = [
                    "today", "tomorrow", "monday", "tuesday",
                    "wednesday", "thursday", "friday", "saturday", "sunday"
                ];

                if (!days.some(day => input.includes(day))) {
                    speak("Please say today, tomorrow, or a weekday.");
                    return 3;
                }
                setPatient(p => ({ ...p, date: transcript }));
                setSubStep(3);
                setGridPhase(2);
                speak("Which time slot do you prefer? Morning, afternoon, or evening?");
                return 4;
            }

            // STEP 4 — SLOT
            if (prevStep === 4) {

                let slot = "";

                if (input.includes("morning")) slot = "Morning";
                else if (input.includes("afternoon")) slot = "Afternoon";
                else if (input.includes("evening")) slot = "Evening";

                if (!slot) {
                    speak("Please say morning, afternoon, or evening.");
                    return 4;
                }

                setPatient(p => ({ ...p, slot }));
                setSubStep(4);
                speak("Please tell your 10 digit mobile number.");
                return 5;
            }
            // STEP 4 — PHONE
            if (prevStep === 5) {

                const numbers = transcript.replace(/\D/g, '');

                if (numbers.length !== 10) {
                    speak("Please repeat a valid 10 digit mobile number.");
                    return 5;
                }

                const token = Math.floor(1000 + Math.random() * 9000);

                tokenRef.current = token;
                setGeneratedToken(token);

                setPatient(p => ({
                    ...p,
                    phone: numbers,
                    token: token
                }));

                setSubStep(5);
                setGridPhase(3);
                speak(`Registration completed. Your pharmacy token is ${token}. Please repeat ${token} digit by digit.`);

                setTimeout(() => {
                    speak("Please say the token number to verify.");
                }, 10000);

                return 6;
            }    // STEP 5 — TOKEN

            if (prevStep === 6) {

                const numberWords = {
                    zero: "0",
                    one: "1",
                    two: "2",
                    three: "3",
                    four: "4",
                    five: "5",
                    six: "6",
                    seven: "7",
                    eight: "8",
                    nine: "9"
                };

                let words = transcript.toLowerCase().split(/\s+/);
                let digits = words.map(word => {
                    if (numberWords[word] !== undefined) return numberWords[word];

                    if (!isNaN(word)) return word;

                    return null;
                }).filter(Boolean);

                const spokenNumber = digits.join("");


                console.log("Generated Token:", tokenRef.current);
                console.log("User Said:", spokenNumber);

                if (spokenNumber.includes(String(tokenRef.current))) {

                    setTokenVerified(true);

                    setGridPhase(3);
                    speak("Token verified successfully. How many days medicine? Three days, five days or ten days.");

                    return 7;
                }

                speak("Invalid token number. Please repeat your pharmacy token.");
                return 6;
            }
            // STEP 6 — DAYS
            if (prevStep === 7) {

                if (input.includes("three") || input.includes("3")) {
                    setPatient(p => ({ ...p, days: "3" }));
                }
                else if (input.includes("five") || input.includes("5")) {
                    setPatient(p => ({ ...p, days: "5" }));
                }
                else if (input.includes("ten") || input.includes("10")) {
                    setPatient(p => ({ ...p, days: "10" }));
                }
                else {
                    speak("Please say three, five, or ten days.");
                    return 7;
                }

                setSubStep(6);
                speak("Pickup or delivery?");
                return 8;
            }
            // STEP 7 — METHOD
            if (prevStep === 8) {

                if (
                    input.includes("pickup") ||
                    input.includes("pick up") ||
                    input.includes("collect") ||
                    input.includes("take medicine")
                ) {

                    setPatient(p => ({ ...p, method: "Offline Pickup" }));

                    setSubStep(11);
                    speak("Pickup confirmed. Please collect your medicines from pharmacy.");
                    // Reset UI screens
                    setGridPhase(0);
                    setPatient({});
                    setTimeout(() => {
                        window.location.reload();
                    }, 4000);

                    return 0;

                }

                if (input.includes("delivery")) {
                    setPatient(p => ({ ...p, method: "Online Delivery" }));
                    setSubStep(7);
                    speak("Please say recipient name.");
                    return 9;
                }

                speak("Say pickup or delivery.");
                return 8;
            }

            // STEP 8 — RECIPIENT
            if (prevStep === 9) {
                setPatient(p => ({ ...p, otherName: transcript }));
                speak("Please say delivery address.");
                return 10;
            }

            // STEP 9 — ADDRESS
            if (prevStep === 10) {
                setPatient(p => ({ ...p, otherAddress: transcript }));
                setSubStep(9);
                speak("Order confirmed. Dispatching now.");

                return 10;
            }

            return prevStep;
        });
    };
    const handleTriage = async (selected) => {
        const issueToUse = selected === "Other" ? patient.customIssue : (selected || patient.issue);
        if (!patient.name) { speak("Patient name is mandatory."); return; }
        const res = await fetch('http://localhost:5000/api/hms-core', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ step: "triage", issue: issueToUse })
        });
        const data = await res.json();
        setResults(data);
        setPatient({ ...patient, issue: issueToUse, token: data.token });
        if (data.isSerious) {
            speak(`Condition ${issueToUse} is significant. Transitioning to Appointment Hub.`);
            setGridPhase(2); setSubStep(2);
        } else {
            speak(`I understand you have ${issueToUse}, ${patient.name}. ${data.advice}`);
            setSubStep(1.5);
        }
    };

    const processRegistry = async () => { const isStillAvailable = !appointments.some(a => a.date === patient.date && a.slot === patient.slot); if (!isStillAvailable) { speak("I'm sorry, this slot was just taken. Please select another time."); setSubStep(3); return; } if (patient.phone.length < 10) { speak("Valid mobile number required."); return; } setIsProcessing(true); try { const response = await fetch('http://localhost:5000/api/hms-core', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ step: "send-sms", payload: patient }) }); if (!response.ok) { throw new Error("SMS failed"); } setAppointments(prev => [...prev, { date: patient.date, slot: patient.slot }]); setTimeout(() => { setIsProcessing(false); setSubStep(4.5); speak("Appointment Confirmed. Your token is " + patient.token); }, 2000); } catch (error) { console.error(error); setIsProcessing(false); speak("Something went wrong. Please try again."); } };
    const toggleAiMode = (selectedMode) => {
        setMode(selectedMode);

        if (selectedMode === 'ai') {
            setAiStep(0);
            speak("Hello! I am your AI Assistant. What is your name?");
            setTimeout(() => {
                if (!isRecognitionRunning.current) {
                    startListening();
                }
            }, 800);
        } else {
            window.speechSynthesis.cancel();
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
            setAiMsg("Manual Control Active.");
        }
    };
    useEffect(() => {
        if (mode === 'ai') {
            setGridPhase(1);
            setSubStep(0);
            setAiStep(0);
            speak("Welcome to CareConnect AI Hospital. Please say your full name.");
        }
    }, [mode]);
    useEffect(() => {
        if (subStep === 9 && mapProgress < 100) {
            const timer = setInterval(() => {
                setMapProgress(prev => {
                    if (prev >= 100) return 100;
                    return prev + 2;
                });
            }, 200);

            return () => clearInterval(timer);
        }


        if (subStep === 9 && mapProgress >= 100) {

            // 🎉 CONFETTI BLAST
            confetti({
                particleCount: 200,
                spread: 120,
                origin: { y: 0.6 }
            });

            speak("Medicine delivered to your door in 15 minutes.");

            setTimeout(() => {
                setGridPhase(1);
                setSubStep(0);
                setTokenVerified(false);
                setMapProgress(0);
            }, 4000);
        }

    }, [subStep, mapProgress]);


    //BLOOD DONATION CODE 
    const handleRegisterDonation = () => {
        if (!donorName || !phone || !amount) {
            alert("Please fill all required fields");
            return;
        }

        console.log("Donor Registered:", {
            donorName,
            phone,
            bloodGroup,
            amount
        });

        setDonationSuccess(true);

        // Clear form
        setDonorName("");
        setPhone("");
        setBloodGroup("A+");
        setAmount("");

        // Hide success message after 3 seconds
        setTimeout(() => {
            setDonationSuccess(false);
        }, 3000);
    };
    // EMERGENCY ALERT CODE
    const handleEmergencyAlert = () => {
        if (!emergencyName || !emergencyPhone || !emergencyMessage) {
            alert("Please fill all emergency details");
            return;
        }

        console.log("Emergency Alert Sent:", {
            emergencyName,
            emergencyPhone,
            emergencyMessage
        });

        setEmergencySent(true);

        // clear form
        setEmergencyName("");
        setEmergencyPhone("");
        setEmergencyMessage("");
    };
    // HELP REQUEST CODE

    const handleHelpSubmit = () => {
        if (!helpName || !helpEmail || !helpIssue) {
            alert("Please fill all fields");
            return;
        }

        setHelpSubmitted(true);

        // Reset form after 3 seconds
        setTimeout(() => {
            setHelpSubmitted(false);
            setHelpName("");
            setHelpEmail("");
            setHelpIssue("");
        }, 3000);
    };
    // FOR ADD PATIENT 
    // ADD PATIENT
    const handleAddPatient = () => {

        if (!patientName) return;

        const doctorId = autoAssignDoctor();

        const newPatient = {
            id: Date.now(),
            name: patientName,
            priority,
            doctorAssigned: doctorId
        };

        setPatients(prev => [...prev, newPatient]);

        setHospitalData(prev => ({
            ...prev,
            occupiedBeds: prev.occupiedBeds + 1
        }));

        setPatientName("");
    };

    // ASSIGN DOCTOR
    const handleAssignDoctor = () => {
        if (hospitalData.doctorsAvailable > 0) {
            setHospitalData(prev => ({
                ...prev,
                doctorsAvailable: prev.doctorsAvailable - 1
            }));
        } else {
            alert("No doctors available!");
        }
    };

    // ACTIVATE LAB
    const handleActivateLab = () => {
        if (hospitalData.labsActive < TOTAL_LABS) {
            setHospitalData(prev => ({
                ...prev,
                labsActive: prev.labsActive + 1
            }));
        } else {
            alert("All labs already active!");
        }
    };

    //discharge patient
    const handleDischargePatient = (patientName) => {

        const patient = patients.find(p => p.name === patientName);

        if (!patient) return;

        // Free doctor
        if (patient.doctorAssigned) {
            setDoctors(prev =>
                prev.map(d =>
                    d.id === patient.doctorAssigned
                        ? { ...d, status: "Available" }
                        : d
                )
            );
        }

        // Remove patient
        setPatients(prev => prev.filter(p => p.name !== patientName));

        // Reduce bed
        setHospitalData(prev => ({
            ...prev,
            occupiedBeds: prev.occupiedBeds - 1
        }));

        setNotification("Patient discharged & doctor released!");
    };

    //smart-auto
    const autoAssignDoctor = () => {
        const availableDoctor = doctors.find(d => d.status === "Available");

        if (!availableDoctor) return null;

        setDoctors(prev =>
            prev.map(d =>
                d.id === availableDoctor.id
                    ? { ...d, status: "Busy" }
                    : d
            )
        );

        return availableDoctor.id;
    };



    const toggleLab = (id) => {
        setLabs(prev =>
            prev.map(l =>
                l.id === id
                    ? {
                        ...l,
                        status:
                            l.status === "Active" ? "Inactive" : "Active"
                    }
                    : l
            )
        );
    };

    //REALTIME DATE
    // Generate next 4 days dynamically
    const generateDates = () => {
        const dates = [];
        const today = new Date();

        for (let i = 0; i < 4; i++) {
            const nextDate = new Date();
            nextDate.setDate(today.getDate() + i);

            const formatted = nextDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short"
            });

            dates.push(formatted);
        }

        return dates;
    };
    const dynamicDates = React.useMemo(() => generateDates(), []);


    useEffect(() => {
        if (!patient.date) return;

        const fetchBookedSlots = async () => {
            const res = await fetch(`http://localhost:5000/api/booked-slots?date=${patient.date}`);
            const data = await res.json();
            setAppointments(data);
        };

        fetchBookedSlots();
    }, [patient.date]);


    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    // recognitionRef.current.continuous = false;
    // recognitionRef.current.interimResults = false;

    // recognitionRef.current.onend = () => {
    //     console.log("Recognition ended");

    //     // 🔥 If AI mode and should be listening → restart
    //     if (mode === 'ai' && !window.speechSynthesis.speaking) {
    //         try {
    //             recognitionRef.current.start();
    //             isRecognitionRunning.current = true;
    //             setIsListening(true);
    //             console.log("Recognition restarted");
    //         } catch (err) {
    //             console.log("Restart failed:", err);
    //         }
    //     }
    // };

    // recognitionRef.current.onerror = (event) => {
    //     console.log("Recognition error:", event.error);

    //     // 🔥 Auto-recover from common errors
    //     if (event.error === "no-speech" || event.error === "audio-capture") {
    //         try {
    //             recognitionRef.current.start();
    //             isRecognitionRunning.current = true;
    //             setIsListening(true);
    //         } catch (err) {}
    //     }
    // };


    // listing for results


    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        handleVoiceInput(transcript);
    };

    const handleVoiceInput = (text) => {

        // STEP 0 → NAME
        if (subStep === 0) {
            setPatient(prev => ({ ...prev, name: text }));
            setSubStep(1);
            speak(`Identify issues, ${text}`);
        }

        // STEP 1 → ISSUE
        else if (subStep === 1) {

            const cleanText = text.toLowerCase().trim();

            console.log("User said:", cleanText);

            if (cleanText.includes("fever") || cleanText.includes("cold")) {
                handleTriage("Fever / Cold");
            }

            else if (cleanText.includes("chest")) {
                handleTriage("Chest Pain");
            }

            else if (cleanText.includes("body")) {
                handleTriage("Body Aches");
            }

            else {
                setPatient(prev => ({
                    ...prev,
                    issue: "Other",
                    customIssue: cleanText
                }));
                handleTriage("Other");
            }
        }
        // STEP 2 → DATE
        else if (subStep === 2) {
            setPatient(prev => ({ ...prev, date: text }));
            setSubStep(3);
            speak("Pick a slot.");
        }

        // STEP 3 → SLOT
        else if (subStep === 3) {
            setPatient(prev => ({ ...prev, slot: text }));
            setSubStep(4);
            speak("Verify profile.");
        }

        // STEP 4 → PHONE
        else if (subStep === 4) {
            if (text.match(/\d{10}/)) {
                setPatient(prev => ({ ...prev, phone: text.match(/\d{10}/)[0] }));
                processRegistry();
            } else {
                speak("Please say a valid 10 digit mobile number.");
            }
        }

        // TOKEN VERIFY
        else if (gridPhase === 3 && !tokenVerified) {
            if (text.toUpperCase() === patient.token) {
                setTokenVerified(true);
                speak("Token verified. Welcome to Pharmacy Hub.");
            } else {
                speak("Invalid token. Please repeat your token number.");
            }
        }
    };

    return (
        <div className="h-screen bg-[#020202] text-zinc-300 font-sans p-6 flex flex-col gap-6 overflow-y-hidden">
            {/* HEADER */}
            {/* HEADER */}
            <div className="flex justify-between items-center bg-zinc-900 border border-white/5 p-6 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">

                {/* LEFT SIDE */}
                <div className="flex items-center gap-5">

                    {/* 🔥 HAMBURGER MENU BUTTON — ADD HERE */}
                    <button
                        onClick={() => setShowSidebar(true)}
                        className="p-3 bg-black rounded-2xl border border-white/10 hover:bg-blue-600 transition-all"
                    >
                        <div className="flex flex-col gap-1">
                            <span className="w-5 h-[2px] bg-white"></span>
                            <span className="w-5 h-[2px] bg-white"></span>
                            <span className="w-5 h-[2px] bg-white"></span>
                        </div>
                    </button>

                    {/* EXISTING ICON */}
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30">
                        <Zap className="text-white" fill="currentColor" />
                    </div>

                    {/* TITLE */}
                    <div>
                        <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                            CareConnect <span className="text-blue-500">v7.0</span>
                        </h1>
                        <div className="flex gap-2 mt-2">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className={`h-1 w-10 rounded-full transition-all duration-700 ${gridPhase >= i
                                        ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]'
                                        : 'bg-white/5'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE (UNCHANGED) */}
                <div className="flex bg-black p-1.5 rounded-2xl border border-white/5">
                    <button
                        onClick={() => toggleAiMode('manual')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'manual'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-zinc-500 hover:text-white'
                            }`}
                    >
                        <Settings size={14} /> Manual
                    </button>

                    <button
                        onClick={() => toggleAiMode('ai')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'ai'
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'text-zinc-500 hover:text-white'
                            }`}
                    >
                        <Activity size={14} /> AI Assisted
                    </button>

                </div>

            </div>

            {/* MAIN GRIDS */}
            {activePage === "dashboard" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 h-full overflow-hidden">

                    {/* GRID 01: TRIAGE */}
                    <div className={`bg-zinc-900/40 border border-white/5 rounded-[3.5rem] p-10 flex flex-col shadow-2xl transition-all duration-700 h-full overflow-hidden 
${gridPhase === 1
                            ? 'border-blue-500/50 scale-100 ring-1 ring-blue-500/20 brightness-100 opacity-100'
                            : 'opacity-40 brightness-75 pointer-events-none'}`}>
                        <h4 className="text-[10px] font-black text-blue-500 uppercase mb-10 tracking-[0.5em] flex items-center gap-2 font-serif"><User size={14} /> 01 / Registry</h4>
                        <div className="flex-1 flex flex-col justify-start space-y-10 overflow-y-auto scrollbar-hide">
                            {subStep === 0 && (
                                <div className="space-y-8 animate-in slide-in-from-bottom-5">
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center">Mandatory Patient Identity</p>
                                    <input autoFocus value={patient.name} className="w-full bg-transparent border-b-2 border-zinc-800 p-4 text-4xl outline-none text-white italic font-serif" placeholder="Enter Full Name" onChange={(e) => setPatient({ ...patient, name: e.target.value })} />
                                    <button onClick={() => { if (patient.name) { setSubStep(1); speak(`Identify issues, ${patient.name}.`); } }} className="w-full bg-white text-black p-6 rounded-3xl font-black uppercase text-xs hover:bg-blue-600 hover:text-white transition-all shadow-xl">Proceed to Diagnosis</button>
                                </div>
                            )}
                            {subStep === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-left">
                                    <div className="grid grid-cols-1 gap-2">
                                        {["Fever / Cold", "Chest Pain", "Body Aches", "Other"].map(opt => (
                                            <button key={opt} onClick={() => opt === "Other" ? setPatient({ ...patient, issue: "Other" }) : handleTriage(opt)} className="p-5 rounded-2xl border border-white/5 bg-white/5 text-left transition-all font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white">{opt}</button>
                                        ))}
                                    </div>
                                    {patient.issue === "Other" && (
                                        <div className="space-y-4 animate-in zoom-in p-6 bg-white/5 rounded-[2rem] border border-blue-500/20 overflow-hidden">
                                            <textarea className="w-full bg-transparent outline-none text-blue-400 font-bold italic" placeholder="Enter health concern..." onChange={(e) => setPatient({ ...patient, customIssue: e.target.value })} />
                                            <button onClick={() => handleTriage("Other")} className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase text-[10px]">Submit Case</button>
                                        </div>
                                    )}
                                    <button onClick={() => setSubStep(0)} className="w-full text-zinc-700 text-[10px] font-black uppercase flex items-center justify-center gap-1 hover:text-white transition-colors"><ChevronLeft size={14} /> Back</button>
                                </div>
                            )}
                            {subStep === 1.5 && (
                                <div className="text-center space-y-8 animate-in zoom-in overflow-y-auto max-h-[80vh] scrollbar-hide">
                                    <div className="bg-emerald-500/10 p-8 rounded-[3rem] border border-emerald-500/30">
                                        <p className="text-[10px] font-black text-emerald-500 uppercase mb-4 tracking-widest">Home Remedy Protocol</p>
                                        {/* FEATURE: Large font advice */}
                                        <p className="text-2xl italic font-serif leading-relaxed text-white mb-6">"{results?.advice}"</p>
                                        {/* FEATURE: Actionable steps */}
                                        <div className="text-left space-y-3 bg-black/40 p-5 rounded-2xl border border-white/5">
                                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Actionable Guide:</p>
                                            {results?.medicus?.steps?.map((step, i) => (
                                                <div key={i} className="flex gap-3 text-xs text-zinc-300">
                                                    <span className="text-blue-500 font-bold">{i + 1}.</span> {step}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* FEATURE: Booking Prompt */}
                                    <div className="p-6 bg-blue-600/5 border border-blue-500/20 rounded-3xl">
                                        <p className="text-xs text-blue-200 mb-4 font-bold uppercase tracking-tighter">Professional attention recommended.</p>
                                        <button onClick={() => { setGridPhase(2); setSubStep(2); speak("Transitioning to official booking."); }} className="w-full bg-blue-600 text-white p-5 rounded-2xl text-[10px] font-black uppercase hover:bg-blue-500 transition-all">Book Appointment</button>
                                    </div>
                                    <button onClick={() => setSubStep(1)} className="text-[9px] font-black uppercase text-zinc-700 underline block mx-auto">Back to list</button>
                                </div>
                            )}
                            {gridPhase > 1 && (
                                <div className="text-center animate-in zoom-in">
                                    <CheckCircle size={50} className="mx-auto text-emerald-500 mb-4" />
                                    <p className="text-2xl font-black italic text-white">{patient.name}</p>
                                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-2">{patient.issue} Verified</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* GRID 02: APPOINTMENT */}
                    <div className={`bg-zinc-900/40 border border-white/5 rounded-[3.5rem] p-10 flex flex-col shadow-2xl transition-all duration-700 
${gridPhase === 2 ? 'border-emerald-500/50 scale-100 ring-1 ring-emerald-500/20' : 'opacity-20 grayscale scale-95 pointer-events-none'}`}>
                        <h4 className="text-[10px] font-black text-emerald-500 uppercase mb-10 tracking-[0.5em] flex items-center gap-2 font-serif"><Calendar size={14} /> 02 / Schedular</h4>
                        <div className="flex-1 flex flex-col justify-center space-y-6">
                            {gridPhase < 2 ? (
                                <div className="text-center opacity-10 py-10"><Clock size={60} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-widest italic">Awaiting Registry Lock</p></div>
                            ) : subStep === 2 ? (
                                <div className="space-y-6 animate-in slide-in-from-bottom-5 text-center">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Select Available Date</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {dynamicDates.map(d => <button key={d} onClick={() => { setPatient({ ...patient, date: d }); setSubStep(3); speak("Pick a slot."); }} className={`p-5 rounded-2xl border text-[10px] font-black transition-all ${patient.date === d ? 'bg-emerald-600 border-emerald-400' : 'bg-white/5 hover:border-emerald-500'}`}>{d}</button>)}
                                    </div>
                                    <button onClick={() => { setGridPhase(1); setSubStep(1); }} className="w-full text-[9px] font-black uppercase text-zinc-700 flex justify-center items-center gap-1"><ChevronLeft size={16} /> Back to Triage</button>
                                </div>
                            ) : subStep === 3 ? (
                                <div className="space-y-6 animate-in zoom-in text-center">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Select Slot on {patient.date}</p>
                                    <div className="grid grid-cols-2 gap-3">

                                        {results?.slots.map(s => {
                                            // Check if this specific slot is already in the appointments array
                                            const isBooked = appointments.some(
                                                a => a.date === patient.date && a.slot === s
                                            );

                                            return (
                                                <button
                                                    key={s}
                                                    disabled={isBooked} // Prevents clicking if booked
                                                    onClick={() => {
                                                        setPatient({ ...patient, slot: s });
                                                        setSubStep(4);
                                                        speak("Verify profile.");
                                                    }}
                                                    className={`p-4 rounded-xl border text-[10px] font-black transition-all
          ${isBooked
                                                            ? "bg-black text-zinc-600 border-zinc-800 cursor-not-allowed opacity-50"
                                                            : patient.slot === s
                                                                ? "bg-emerald-600 border-emerald-400 text-white"
                                                                : "bg-white/5 border-white/5 hover:border-emerald-500 text-zinc-300"
                                                        }`}
                                                >
                                                    {s}
                                                    {isBooked && <span className="block text-[8px] mt-1 text-red-500/60 uppercase">Full</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button onClick={() => setSubStep(2)} className="w-full text-[9px] font-black uppercase text-zinc-700 block text-center">Back to Date</button>
                                </div>
                            ) : subStep === 4 ? (
                                <div className="space-y-6 animate-in slide-in-from-right">
                                    {/* FEATURE: Loading Delay logic */}
                                    {isProcessing ? (
                                        <div className="text-center py-10 animate-pulse text-blue-500">
                                            <Activity size={40} className="mx-auto animate-spin mb-4" />
                                            <p className="text-[10px] font-black uppercase">Simulating Data Sync...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-8 bg-black rounded-[2.5rem] border border-white/5 space-y-4">
                                                <input className="w-full bg-transparent border-b border-zinc-700 p-4 text-2xl text-center outline-none text-white italic font-serif" placeholder="Verify Mobile: +91" onChange={(e) => setPatient({ ...patient, phone: e.target.value })} />
                                                <select className="w-full bg-zinc-800 p-5 rounded-3xl border border-white/10 text-white font-black uppercase text-xs tracking-widest" onChange={(e) => setPatient({ ...patient, gender: e.target.value })}>
                                                    <option>Male</option><option>Female</option><option>Other</option>
                                                </select>
                                            </div>
                                            <button onClick={processRegistry} className="w-full bg-white text-black p-7 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 transition-all">Submit Registry & SMS</button>
                                            <button onClick={() => setSubStep(3)} className="w-full text-[9px] font-black text-zinc-700 uppercase">Back</button>
                                        </>
                                    )}
                                </div>
                            ) : subStep === 4.5 ? (
                                <div className="space-y-6 animate-in zoom-in text-center">
                                    <div className="p-8 bg-emerald-600/10 rounded-[2.5rem] border border-emerald-500/20">
                                        <p className="text-[10px] font-black text-emerald-500 uppercase mb-2">
                                            Registry Confirmed
                                        </p>
                                        <p className="text-5xl font-mono text-white mb-2 tracking-widest">
                                            {patient.token}
                                        </p>
                                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest">
                                            Copy this token for Pharmacy entry
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => { setGridPhase(3); setSubStep(5); }}
                                        className="w-full bg-blue-600 text-white p-7 rounded-[2rem] font-black uppercase text-xs flex items-center justify-center gap-3 hover:scale-105 transition-all"
                                    >
                                        Proceed to Pharmacy <ChevronRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center space-y-6 animate-in zoom-in">
                                    <div className="bg-emerald-600/10 p-10 rounded-[3.5rem] border border-emerald-500/20">
                                        <CheckCircle size={40} className="mx-auto text-emerald-500 mb-4 shadow-xl" />
                                        <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Verified.</h3>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase mt-4 animate-pulse italic tracking-[0.2em]">Please arrive 10 minutes early.</p>
                                    </div>

                                </div>
                            )}
                        </div>
                    </div>

                    {/* GRID 03: LOGISTICS (TOKEN SYSTEM) */}
                    <div className={`bg-zinc-900/40 border border-white/5 rounded-[3.5rem] p-10 flex flex-col shadow-2xl transition-all duration-700 
${gridPhase === 3 ? 'border-blue-500/50 scale-100 ring-1 ring-blue-500/20' : 'opacity-20 grayscale scale-95 pointer-events-none'}`}>
                        <h4 className="text-[10px] font-black text-blue-500 uppercase mb-10 tracking-[0.5em] flex items-center gap-2 font-serif"><Pill size={14} /> 03 / Logistics</h4>
                        <div className="flex-1 flex flex-col justify-center space-y-8">
                            {gridPhase < 3 ? (
                                <div className="text-center opacity-10 py-10"><ShoppingBag size={80} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-widest italic">Awaiting Module 02 Clearence</p></div>
                            ) : !tokenVerified ? (
                                /* FEATURE: Token-Based Entry */
                                <div className="space-y-6 animate-in slide-in-from-bottom-5">
                                    <p className="text-[10px] font-black text-blue-500 uppercase mb-4 tracking-widest text-center italic">"Thanks for choosing us! Please collect your "</p>
                                    <div className="bg-black/50 p-8 rounded-[2.5rem] border border-white/10">
                                        <input value={inputToken} className="w-full bg-transparent border-b-2 border-blue-500 p-4 text-center text-3xl outline-none text-white font-mono" placeholder="ENTER TOKEN" onChange={(e) => setInputToken(e.target.value.toUpperCase())} />
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (inputToken === patient.token) {
                                                setTokenVerified(true);
                                                speak("Token Verified. Welcome to Pharmacy Hub.");
                                            } else {
                                                speak("Invalid token. Please check your SMS.");
                                            }
                                        }}
                                        className="w-full bg-blue-600 text-white p-6 rounded-3xl font-black uppercase text-xs"
                                    >
                                        Verify & Enter
                                    </button>
                                </div>
                            ) : subStep === 5 ? (
                                <div className="space-y-4 animate-in slide-in-from-right">
                                    <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-3xl">
                                        <p className="text-[10px] font-black text-blue-500 uppercase mb-6 tracking-widest underline underline-offset-8">Clinical Allocation</p>

{mode === "ai" && gridPhase === 3 && (
  <>
    {patient.issue === "Fever / Cold" && (
      <ul>
        <li>
          Paracetamol
          <span style={{
            marginLeft: "10px",
            padding: "3px 8px",
            // background: "#28a745",
            color: "green",
            borderRadius: "10px",
            fontSize: "12px"
          }}>
            After Lunch
          </span>
        </li>

        <li>
          Cetirizine
          <span style={{
            marginLeft: "10px",
            padding: "3px 8px",
            // background: "#6f42c1",
            color: "green",
            borderRadius: "10px",
            fontSize: "12px"
          }}>
            Before Sleep
          </span>
        </li>
      </ul>
    )}

    {patient.issue === "Chest Pain" && (
      <ul>
        <li>
          Aspirin
          <span style={{
            marginLeft: "10px",
            padding: "3px 8px",
            // background: "#28a745",
            color: "green",
            borderRadius: "10px",
            fontSize: "12px"
          }}>
            After Food
          </span>
        </li>

        <li>
          Nitroglycerin
          <span style={{
            marginLeft: "10px",
            padding: "3px 8px",
            // background: "#dc3545",
            color: "green",
            borderRadius: "10px",
            fontSize: "12px"
          }}>
            When Needed
          </span>
        </li>
      </ul>
    )}

    {patient.issue === "Body Aches" && (
      <ul>
        <li>
          Ibuprofen
          <span style={{
            marginLeft: "10px",
            padding: "3px 8px",
            // background: "#28a745",
            color: "green",
            borderRadius: "10px",
            fontSize: "12px"
          }}>
            After Lunch
          </span>
        </li>

        <li>
          Diclofenac
          <span style={{
            marginLeft: "10px",
            padding: "3px 8px",
            // background: "#6f42c1",
            color: "green",``
            borderRadius: "10px",
            fontSize: "12px"
          }}>
            After Dinner
          </span>
        </li>
      </ul>
    )}
  </>
)}

                                        {results?.medicus.meds.map(m => (
                                            <div key={m} className="flex justify-between items-center mb-3 text-xs font-bold font-serif italic border-b border-white/5 pb-2">
                                                <span>{m}</span><span className="text-[9px] text-emerald-500 uppercase font-black">{results?.medicus.directive}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-4 text-center">
                                        <button
                                            onClick={() => setShowVideo(true)}
                                            className="w-full flex items-center justify-center gap-2 
             text-[9px] font-black text-blue-500 
             border border-blue-500/20 
             py-3 px-4 rounded-xl 
             hover:bg-blue-600/10 
             transition-all uppercase tracking-widest"
                                        >
                                            <Video size={14} /> Clinical Instructions
                                        </button>
                                        <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest italic">Course duration (Days)</p>
                                        <div className="flex justify-center gap-4">
                                            {["3", "5", "10"].map(d => <button key={d} onClick={() => { setPatient({ ...patient, days: d }); setSubStep(6); speak("Choose pickup or delivery."); }} className={`w-16 h-16 rounded-full border font-black transition-all ${patient.days === d ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/10' : 'bg-white/5 border-white/5'}`}>{d}</button>)}
                                        </div>
                                        <button onClick={() => setSubStep(4)} className="text-[9px] font-black uppercase text-zinc-700 block mx-auto underline mt-2 tracking-widest">Back</button>
                                    </div>
                                </div>
                        ) : subStep === 6 ? (
                        /* FEATURE: Pickup vs Delivery Selection */
                        <div className="grid grid-cols-1 gap-4 animate-in zoom-in">
                            <button onClick={() => { setPatient({ ...patient, method: "Offline Pickup", orderForOther: false }); setSubStep(11); speak("Protocol finalized. Safe travels."); }} className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-blue-500 flex flex-col items-center gap-3 transition-all group shadow-2xl">
                                <ShoppingBag className="text-blue-500 group-hover:scale-125 transition-transform" /><span className="text-[10px] font-black uppercase">Offline Pickup</span>
                            </button>
                            <button onClick={() => { setPatient({ ...patient, method: "Online Delivery", orderForOther: true }); setSubStep(7); speak("Enter delivery details."); }} className="p-8 bg-blue-600/5 rounded-3xl border border-blue-600/30 hover:border-emerald-500 flex flex-col items-center gap-3 transition-all group shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                                <Truck className="text-emerald-500 group-hover:scale-125 transition-transform" /><span className="text-[10px] font-black uppercase tracking-widest text-white">Online Delivery</span>
                            </button>
                            <button onClick={() => setSubStep(5)} className="text-[9px] font-black uppercase text-zinc-700 block text-center mt-4">Back</button>
                        </div>
                        ) : subStep === 7 ? (
                        <div className="space-y-6 animate-in slide-in-from-right">
                            <p className="text-[10px] font-black text-blue-500 uppercase mb-4 tracking-[0.5em] text-center">Dispatch Hub</p>
                            <div className="space-y-4">
                                <input className="w-full bg-white/5 p-5 rounded-3xl border border-white/5 outline-none text-sm text-white italic" placeholder="Recipient Full Name" onChange={(e) => setPatient({ ...patient, otherName: e.target.value })} />
                                <input className="w-full bg-white/5 p-5 rounded-3xl border border-white/5 outline-none text-sm text-white italic" placeholder="Delivery Landmark / Address" onChange={(e) => setPatient({ ...patient, otherAddress: e.target.value })} />
                            </div>
                            <button onClick={() => { setSubStep(9); speak("Pharmacist is validating order."); }} className="w-full bg-emerald-600 text-black p-6 rounded-3xl font-black uppercase text-xs shadow-2xl hover:scale-105 transition-all mt-6">Authorize Delivery</button>
                            <button onClick={() => setSubStep(6)} className="w-full text-[9px] font-black uppercase text-zinc-700 text-center tracking-widest">Back</button>
                        </div>
                        ) : subStep === 9 ? (
                        <div className="space-y-10 animate-in slide-in-from-right text-center">
                            <div className="relative h-48 bg-black rounded-[3rem] border border-white/10 flex flex-col justify-center p-10 overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                                <div className="relative h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 shadow-[0_0_30px_#3b82f6]" style={{ width: `${mapProgress}%` }} />
                                </div>
                                <div className="flex justify-between mt-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest italic leading-none">
                                    <span>Adilabad Central</span>
                                    <div
                                        className="absolute transition-all duration-500"
                                        style={{
                                            left: `${mapProgress}%`,
                                            transform: `
      translateX(-50%)
      perspective(600px)
      rotateY(${mapProgress < 50 ? 0 : 180}deg)
      scale(${mapProgress >= 100 ? 1.3 : 1})
    `
                                        }}
                                    >
                                        <Truck
                                            size={32}
                                            className={`text-blue-500 transition-all duration-500 ${mapProgress >= 100
                                                ? "text-green-400 drop-shadow-[0_0_25px_rgba(34,197,94,0.9)]"
                                                : "animate-bounce"
                                                }`}
                                        />
                                    </div>
                                    <span
                                        onClick={() => setSubStep(11)}
                                        className={`cursor-pointer uppercase tracking-widest transition-all duration-700 ${mapProgress >= 100
                                            ? "text-green-400 drop-shadow-[0_0_25px_rgba(34,197,94,0.9)] scale-125 animate-pulse"
                                            : "hover:text-white"
                                            }`}
                                    >
                                        {patient.isOther ? 'Recipient Hub' : 'Home'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[11px] font-black uppercase text-blue-500 animate-pulse italic tracking-[0.4em]">
                                {mapProgress >= 100 ? "Delivery Complete ✔" : "Medical Man: Dispatching Order..."}
                            </p>
                        </div>
                        ) : (
                        <div className="text-center animate-in zoom-in-50 py-10 space-y-10">
                            <CheckCircle size={80} className="mx-auto text-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.3)]" />
                            <h2 className="text-4xl font-black italic text-white uppercase leading-none">Session Complete.</h2>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed max-w-[250px] mx-auto tracking-widest italic text-center leading-loose">
                                Registry Finalized for {patient.name}. Follow timing {results?.medicus.directive} for {patient.days} days. Stay safe!
                            </p>
                            <button onClick={() => window.location.reload()} className="mt-12 text-blue-500 font-black text-[10px] underline uppercase tracking-[0.5em] block mx-auto">Open New Command Hub</button>
                        </div>
                            )}
                    </div>
                </div>
                </div>
    )
}
{
    activePage === "about" && (
        <div className="flex-1 mt-6 bg-zinc-900/70 backdrop-blur-xl border border-white/5 p-12 rounded-[3rem] shadow-2xl overflow-y-auto scrollbar-hide">

            <h1 className="text-3xl font-black text-white uppercase italic tracking-widest mb-8">
                About CareConnect Hospital
            </h1>

            <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">

                <p>
                    <span className="text-blue-400 font-bold">CareConnect Hospital</span>
                    is a modern AI-powered healthcare management system designed
                    to streamline patient care, clinical workflows, and hospital operations.
                </p>

                <p>
                    Founded in <span className="text-white font-bold">2026</span>,
                    the hospital is owned and operated by
                    <span className="text-emerald-400 font-bold"> Dr. Sriram Chityala</span>.
                </p>

                <p>
                    Our mission is to integrate artificial intelligence with
                    real-time hospital infrastructure to provide faster diagnosis,
                    efficient appointment booking, and seamless patient management.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-10">

                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                        <h3 className="text-blue-400 font-black uppercase mb-3">
                            Core Services
                        </h3>
                        <ul className="space-y-2">
                            <li>• AI Assisted Consultation</li>
                            <li>• Smart Appointment Booking</li>
                            <li>• Digital Medical Records</li>
                            <li>• Emergency Response System</li>
                        </ul>
                    </div>

                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                        <h3 className="text-emerald-400 font-black uppercase mb-3">
                            Vision
                        </h3>
                        <p>
                            To become India’s leading AI-integrated hospital
                            management ecosystem delivering precision healthcare.
                        </p>
                    </div>

                </div>

                <button
                    onClick={() => setActivePage("dashboard")}
                    className="mt-10 px-8 py-4 bg-blue-600 rounded-[2rem] font-black uppercase text-xs shadow-lg hover:scale-105 transition-all"
                >
                    Back to Dashboard
                </button>

            </div>
        </div>
    )
}
{
    activePage === "blood" && (
        <div className="flex-1 mt-6 bg-zinc-900/70 backdrop-blur-xl border border-white/5 p-12 rounded-[3rem] shadow-2xl overflow-y-auto scrollbar-hide">

            <h1 className="text-3xl font-black text-white uppercase italic tracking-widest mb-10">
                Blood Donation Registration
            </h1>

            <div className="grid md:grid-cols-2 gap-8">

                {/* LEFT SIDE - FORM */}
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                    {donationSuccess ? (

                        <div className="flex flex-col items-center justify-center text-center gap-6 w-full animate-fade-in">

                            <div className="text-8xl">🩸</div>

                            <h2 className="text-3xl font-black uppercase tracking-widest text-green-400">
                                Donation Registered Successfully
                            </h2>

                            <p className="text-sm text-zinc-300 max-w-sm">
                                Thank you for your contribution.
                                Our hospital team will contact you shortly.
                            </p>

                            <button
                                onClick={() => setDonationSuccess(false)}
                                className="px-6 py-3 bg-blue-600 rounded-2xl font-bold uppercase text-xs hover:scale-105 transition-all"
                            >
                                Register Another
                            </button>

                        </div>

                    ) : null}

                    <div>
                        <label className="text-sm text-rose-400 font-bold uppercase">Donor Name</label>
                        <input
                            type="text"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full mt-2 p-4 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-rose-500 text-white"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-rose-400 font-bold uppercase">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter phone number"
                            className="w-full mt-2 p-4 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-rose-500 text-white"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-rose-400 font-bold uppercase">Blood Group</label>
                        <select
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                            className="w-full mt-2 p-4 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-rose-500 text-white"
                        >
                            <option>A+</option>
                            <option>A-</option>
                            <option>B+</option>
                            <option>B-</option>
                            <option>O+</option>
                            <option>O-</option>
                            <option>AB+</option>
                            <option>AB-</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-rose-400 font-bold uppercase">Donation Amount (ml)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Example: 350"
                            className="w-full mt-2 p-4 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-rose-500 text-white"
                        />
                    </div>

                    <button
                        onClick={handleRegisterDonation}
                        className="w-full py-4 bg-rose-600 rounded-2xl font-black uppercase text-xs shadow-lg hover:scale-105 transition-all"
                    >
                        Register Donation
                    </button>

                </div>

                {/* RIGHT SIDE - INFO PANEL */}
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">

                    <h3 className="text-xl font-black text-rose-400 uppercase mb-6">
                        Donation Guidelines
                    </h3>

                    <ul className="space-y-4 text-sm text-zinc-300">
                        <li>• Minimum age: 18 years</li>
                        <li>• Minimum weight: 50kg</li>
                        <li>• No recent infections</li>
                        <li>• Gap of 3 months between donations</li>
                        <li>• Standard donation: 350ml – 450ml</li>
                    </ul>

                    <div className="mt-8 p-6 bg-rose-600/10 border border-rose-500/20 rounded-2xl">
                        <p className="text-sm text-rose-300">
                            Your blood donation can save up to 3 lives.
                            Our hospital ensures safe and sterile procedures.
                        </p>
                    </div>

                    <button
                        onClick={() => setActivePage("dashboard")}
                        className="mt-10 px-8 py-4 bg-blue-600 rounded-[2rem] font-black uppercase text-xs shadow-lg hover:scale-105 transition-all"
                    >
                        Back to Dashboard
                    </button>

                </div>

            </div>
        </div>
    )
}
{
    activePage === "emergency" && (
        <div className="flex-1 mt-6 bg-zinc-900/70 backdrop-blur-xl border border-white/5 p-12 rounded-[3rem] shadow-2xl overflow-y-auto scrollbar-hide">

            <h1 className="text-3xl font-black text-white uppercase italic tracking-widest mb-10">
                Emergency Contact Center
            </h1>

            <div className="grid md:grid-cols-2 gap-8">

                {/* LEFT SIDE - CONTACT CARDS */}
                <div className="space-y-6">

                    <div className="p-6 bg-red-600/10 border border-red-500/30 rounded-2xl">
                        <h3 className="text-xl font-black text-red-400 uppercase mb-2">
                            🚑 Ambulance Service
                        </h3>
                        <p className="text-zinc-300 text-sm mb-3">
                            Available 24/7 for emergency transport.
                        </p>
                        <a
                            href="tel:108"
                            className="inline-block px-6 py-3 bg-red-600 rounded-xl text-xs font-bold uppercase hover:scale-105 transition-all"
                        >
                            Call 108
                        </a>
                    </div>

                    <div className="p-6 bg-blue-600/10 border border-blue-500/30 rounded-2xl">
                        <h3 className="text-xl font-black text-blue-400 uppercase mb-2">
                            🏥 ICU Emergency
                        </h3>
                        <p className="text-zinc-300 text-sm mb-3">
                            Direct ICU emergency hotline.
                        </p>
                        <a
                            href="tel:+911234567890"
                            className="inline-block px-6 py-3 bg-blue-600 rounded-xl text-xs font-bold uppercase hover:scale-105 transition-all"
                        >
                            Call ICU
                        </a>
                    </div>

                    <div className="p-6 bg-yellow-600/10 border border-yellow-500/30 rounded-2xl">
                        <h3 className="text-xl font-black text-yellow-400 uppercase mb-2">
                            ☎ 24/7 Help Desk
                        </h3>
                        <p className="text-zinc-300 text-sm mb-3">
                            General hospital assistance.
                        </p>
                        <a
                            href="tel:+919876543210"
                            className="inline-block px-6 py-3 bg-yellow-600 rounded-xl text-xs font-bold uppercase hover:scale-105 transition-all"
                        >
                            Call Help Desk
                        </a>
                    </div>

                </div>

                {/* RIGHT SIDE - EMERGENCY FORM */}
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">

                    <h3 className="text-xl font-black text-red-400 uppercase mb-6">
                        Quick Emergency Request
                    </h3>

                    {!emergencySent ? (

                        <div className="space-y-5">

                            <input
                                type="text"
                                value={emergencyName}
                                onChange={(e) => setEmergencyName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full p-4 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-red-500 text-white"
                            />

                            <input
                                type="tel"
                                value={emergencyPhone}
                                onChange={(e) => setEmergencyPhone(e.target.value)}
                                placeholder="Phone Number"
                                className="w-full p-4 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-red-500 text-white"
                            />

                            <textarea
                                rows="4"
                                value={emergencyMessage}
                                onChange={(e) => setEmergencyMessage(e.target.value)}
                                placeholder="Describe emergency situation..."
                                className="w-full p-4 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-red-500 text-white"
                            ></textarea>

                            <button
                                onClick={handleEmergencyAlert}
                                className="w-full py-4 bg-red-600 rounded-2xl font-black uppercase text-xs shadow-lg hover:scale-105 transition-all"
                            >
                                Send Emergency Alert
                            </button>

                        </div>

                    ) : (

                        <div className="flex flex-col items-center justify-center text-center gap-6 py-12">

                            <div className="text-7xl">🚑</div>

                            <h2 className="text-2xl font-black uppercase tracking-widest text-green-400">
                                Emergency Alert Sent
                            </h2>

                            <p className="text-sm text-zinc-300 max-w-sm">
                                Our emergency response team has been notified.
                                Please stay reachable on your phone.
                            </p>

                            <button
                                onClick={() => setEmergencySent(false)}
                                className="px-6 py-3 bg-blue-600 rounded-2xl font-bold uppercase text-xs hover:scale-105 transition-all"
                            >
                                Send Another Alert
                            </button>

                        </div>

                    )}
                    <button
                        onClick={() => setActivePage("dashboard")}
                        className="mt-8 px-6 py-3 bg-blue-600 rounded-2xl font-bold uppercase text-xs hover:scale-105 transition-all"
                    >
                        Back to Dashboard
                    </button>

                </div>

            </div>
        </div>
    )
}

{
    activePage === "help" && (
        <div className="flex-1 mt-6 bg-zinc-900/70 backdrop-blur-xl border border-white/5 p-12 rounded-[3rem] shadow-2xl overflow-y-auto scrollbar-hide">

            <h1 className="text-3xl font-black text-white uppercase italic tracking-widest mb-10">
                Help Center
            </h1>

            <div className="grid md:grid-cols-2 gap-10">

                {/* LEFT SIDE - FAQ */}
                <div className="space-y-6">

                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                        <h3 className="font-bold text-blue-400 mb-2">
                            How to book appointment?
                        </h3>
                        <p className="text-zinc-300 text-sm">
                            Go to Appointment section → Fill form → Click Book.
                        </p>
                    </div>

                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                        <h3 className="font-bold text-green-400 mb-2">
                            How to donate blood?
                        </h3>
                        <p className="text-zinc-300 text-sm">
                            Open Blood Donation → Fill details → Register Donation.
                        </p>
                    </div>

                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                        <h3 className="font-bold text-red-400 mb-2">
                            How to send emergency alert?
                        </h3>
                        <p className="text-zinc-300 text-sm">
                            Go to Emergency → Fill emergency form → Send Alert.
                        </p>
                    </div>

                    <div className="p-6 bg-yellow-600/10 border border-yellow-500/30 rounded-2xl">
                        <h3 className="font-bold text-yellow-400 mb-2">
                            🟢 System Status
                        </h3>
                        <p className="text-zinc-300 text-sm">
                            All hospital services are running normally.
                        </p>
                    </div>

                </div>

                {/* RIGHT SIDE - SUPPORT FORM */}
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 relative">

                    <h3 className="text-xl font-black text-blue-400 uppercase mb-6">
                        Contact Support
                    </h3>

                    {!helpSubmitted ? (
                        <div className="space-y-5">

                            <input
                                type="text"
                                value={helpName}
                                onChange={(e) => setHelpName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full p-4 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                            />

                            <input
                                type="email"
                                value={helpEmail}
                                onChange={(e) => setHelpEmail(e.target.value)}
                                placeholder="Your Email"
                                className="w-full p-4 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                            />

                            <textarea
                                rows="4"
                                value={helpIssue}
                                onChange={(e) => setHelpIssue(e.target.value)}
                                placeholder="Describe your issue..."
                                className="w-full p-4 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                            ></textarea>

                            <button
                                onClick={handleHelpSubmit}
                                className="w-full py-4 bg-blue-600 rounded-2xl font-black uppercase text-xs shadow-lg hover:scale-105 transition-all"
                            >
                                Submit Ticket
                            </button>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-[2.5rem]">
                            <h2 className="text-3xl font-black text-green-400 animate-pulse text-center">
                                ✅ Support Request Submitted Successfully
                            </h2>
                        </div>
                    )}

                    <button
                        onClick={() => setActivePage("dashboard")}
                        className="mt-8 px-6 py-3 bg-green-600 rounded-2xl font-bold uppercase text-xs hover:scale-105 transition-all"
                    >
                        Back to Dashboard
                    </button>

                </div>

            </div>
        </div>
    )
}
{
    activePage === "hospitalDashboard" && (
        <div className="flex-1 mt-6 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border border-white/5 p-14 rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-y-auto scrollbar-hide">

            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase">
                        Hospital <span className="text-cyan-400">Overview</span>
                    </h1>
                    <p className="text-zinc-400 text-sm mt-2">
                        Real-time hospital system monitoring dashboard
                    </p>
                </div>

                <div className="px-6 py-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                    ● System Live
                </div>
            </div>

            {/* ================= ALERT ================= */}
            {hospitalData.occupiedBeds / TOTAL_BEDS > 0.8 && (
                <div className="mb-10 p-5 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 font-bold tracking-wide animate-pulse">
                    ⚠ Warning: Bed Occupancy Above 80%
                </div>
            )}

            {/* ================= TOP STATS ROW ================= */}
            <div className="grid md:grid-cols-4 gap-6 mb-14">

                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-zinc-400 text-xs uppercase">Total Capacity</p>
                    <h2 className="text-3xl font-black text-white mt-2">{TOTAL_BEDS}</h2>
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-zinc-400 text-xs uppercase">Bed Usage %</p>
                    <h2 className="text-3xl font-black text-cyan-400 mt-2">
                        {Math.round((hospitalData.occupiedBeds / TOTAL_BEDS) * 100)}%
                    </h2>
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-zinc-400 text-xs uppercase">Doctors Available</p>
                    <h2 className="text-3xl font-black text-emerald-400 mt-2">
                        {hospitalData.doctorsAvailable}
                    </h2>
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-zinc-400 text-xs uppercase">Active Labs</p>
                    <h2 className="text-3xl font-black text-purple-400 mt-2">
                        {hospitalData.labsActive}
                    </h2>
                </div>

            </div>

            {/* ================= MAIN GRID ================= */}
            <div className="grid md:grid-cols-3 gap-10">

                {/* BEDS */}
                <div className="group p-10 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-cyan-500/40 transition-all duration-500 hover:scale-[1.02]">

                    <h3 className="text-2xl font-black text-cyan-400 mb-6">
                        🛏 Bed Management
                    </h3>

                    <p className="text-zinc-400 text-sm">Occupied</p>
                    <p className="text-3xl font-bold text-red-400 mb-4">
                        {hospitalData.occupiedBeds}
                    </p>

                    <p className="text-zinc-400 text-sm">Available</p>
                    <p className="text-2xl font-bold text-emerald-400 mb-6">
                        {TOTAL_BEDS - hospitalData.occupiedBeds}
                    </p>

                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-700 ${hospitalData.occupiedBeds / TOTAL_BEDS > 0.8
                                ? "bg-red-500"
                                : "bg-cyan-500"
                                }`}
                            style={{
                                width: `${(hospitalData.occupiedBeds / TOTAL_BEDS) * 100}%`
                            }}
                        ></div>
                    </div>

                </div>

                {/* DOCTORS */}
                <div className="group p-10 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-emerald-500/40 transition-all duration-500 hover:scale-[1.02]">

                    <h3 className="text-2xl font-black text-emerald-400 mb-6">
                        👨‍⚕️ Doctors
                    </h3>

                    <p className="text-zinc-400 text-sm">Total Doctors</p>
                    <p className="text-3xl font-bold text-white mb-4">
                        {TOTAL_DOCTORS}
                    </p>

                    <p className="text-zinc-400 text-sm">Available</p>
                    <p className="text-2xl font-bold text-emerald-400 mb-6">
                        {hospitalData.doctorsAvailable}
                    </p>

                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-700"
                            style={{
                                width: `${(hospitalData.doctorsAvailable / TOTAL_DOCTORS) * 100}%`
                            }}
                        ></div>
                    </div>

                </div>

                {/* LABS */}
                <div className="group p-10 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-purple-500/40 transition-all duration-500 hover:scale-[1.02]">

                    <h3 className="text-2xl font-black text-purple-400 mb-6">
                        🧪 Laboratory
                    </h3>

                    <p className="text-zinc-400 text-sm">Total Labs</p>
                    <p className="text-3xl font-bold text-white mb-4">
                        {TOTAL_LABS}
                    </p>

                    <p className="text-zinc-400 text-sm">Active Labs</p>
                    <p className="text-2xl font-bold text-purple-400 mb-4">
                        {hospitalData.labsActive}
                    </p>

                    <p className="text-zinc-400 text-sm">Lab Staff</p>
                    <p className="text-lg font-bold text-white">
                        {TOTAL_LAB_STAFF}
                    </p>

                </div>

            </div>

            {/* ================= QUICK ACTIONS ================= */}
            <div className="mt-10 pt-5 border-t border-white/10">

                <h2 className="text-xl font-bold text-white mb-4 tracking-wide">
                    Quick Actions
                </h2>

                <div className="flex gap-6 flex-wrap">

                    <button
                        onClick={() => setShowPatientModal(true)}
                        className="px-8 py-3 bg-cyan-600 rounded-2xl font-bold text-sm hover:scale-105 transition-all"
                    >
                        + Add Patient
                    </button>

                    <button
                        onClick={() => setShowDoctorModal(true)}
                        className="px-8 py-3 bg-emerald-600 rounded-2xl font-bold text-sm hover:scale-105 transition-all"
                    >
                        Assign Doctor
                    </button>
                    <button
                        onClick={handleActivateLab}
                        className="px-8 py-3 bg-purple-600 rounded-2xl font-bold text-sm hover:scale-105 transition-all"
                    >
                        Activate Lab
                    </button>

                </div>
            </div>
            {notification && (
                <div className="fixed bottom-10 right-10 bg-emerald-600 px-6 py-3 rounded-2xl shadow-lg text-white animate-bounce">
                    {notification}
                </div>
            )}
            {showPatientModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

                    <div className="bg-zinc-900 p-10 rounded-3xl w-[400px] border border-white/10">

                        <h2 className="text-xl font-bold text-white mb-6">
                            Patient Admission
                        </h2>

                        <input
                            type="text"
                            placeholder="Patient Name"
                            className="w-full mb-4 p-3 rounded-xl bg-white/10 text-white outline-none"
                            id="patientName"
                        />

                        <select
                            className="w-full mb-6 p-3 rounded-xl bg-white/10 text-white outline-none"
                            id="priority"
                        >
                            <option className='w-full mb-4 p-3 rounded-xl bg-zinc-800 text-white border border-white/20 outline-none focus:border-blue-500'>Normal</option>
                            <option className='w-full mb-4 p-3 rounded-xl bg-zinc-800 text-white border border-white/20 outline-none focus:border-blue-500'>Emergency</option>
                        </select>

                        <div className="flex justify-between">

                            <button
                                onClick={() => setShowPatientModal(false)}
                                className="px-6 py-2 bg-red-600 rounded-xl"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    const name = document.getElementById("patientName").value;
                                    const priority = document.getElementById("priority").value;

                                    if (!name) return alert("Enter patient name");

                                    // Check bed availability
                                    if (hospitalData.occupiedBeds >= TOTAL_BEDS) {
                                        alert("No beds available!");
                                        return;
                                    }

                                    // Add patient
                                    setPatients(prev => [...prev, { name, priority }]);

                                    // Increase occupied beds
                                    setHospitalData(prev => ({
                                        ...prev,
                                        occupiedBeds: prev.occupiedBeds + 1
                                    }));

                                    setNotification("Patient admitted successfully!");
                                    setShowPatientModal(false);

                                    setTimeout(() => setNotification(""), 3000);
                                }}
                                className="px-6 py-2 bg-emerald-600 rounded-xl"
                            >
                                Admit
                            </button>

                        </div>

                    </div>
                </div>
            )}


            {showDoctorModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

                    <div className="bg-zinc-900 p-10 rounded-3xl w-[450px] border border-white/10">

                        <h2 className="text-xl font-bold text-white mb-6">
                            Assign Doctor
                        </h2>

                        {/* Select Patient */}
                        {/* Select Patient */}
                        {/* Select Patient */}
                        <select
                            id="selectPatient"
                            className="w-full mb-4 p-3 rounded-xl bg-zinc-800 text-white border border-white/20 outline-none focus:border-blue-500"
                        >
                            <option value="" className="bg-zinc-900 text-zinc-400">Select Patient</option>

                            {/* Add .filter(p => !p.doctorAssigned) before the .map() */}
                            {patients.filter(p => !p.doctorAssigned).length > 0 ? (
                                patients
                                    .filter(p => !p.doctorAssigned)
                                    .map((p, index) => (
                                        <option key={index} value={p.name} className="bg-zinc-900 text-white">
                                            {p.name}
                                        </option>
                                    ))
                            ) : (
                                <option disabled className="bg-zinc-900 text-yellow-500">
                                    ⚠️ All patients have been assigned!
                                </option>
                            )}
                        </select>

                        {/* Select Doctor */}
                        {/* Select Doctor */}
                        <select
                            id="selectDoctor"
                            className="w-full mb-6 p-3 rounded-xl bg-zinc-800 text-white border border-white/20 outline-none focus:border-emerald-500"
                        >
                            <option value="" className="bg-zinc-900">Select Doctor</option>
                            {doctors.filter(d => d.status === "Available").length > 0 ? (
                                doctors
                                    .filter(d => d.status === "Available")
                                    .map(d => (
                                        <option key={d.id} value={d.id} className="bg-zinc-900 text-white">
                                            {d.name} - {d.specialization}
                                        </option>
                                    ))
                            ) : (
                                <option disabled className="bg-zinc-900 text-red-400">
                                    ⚠️ No Doctors Available Currently
                                </option>
                            )}
                        </select>

                        <div className="flex justify-between">

                            <button
                                onClick={() => setShowDoctorModal(false)}
                                className="px-6 py-2 bg-red-600 rounded-xl"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    const pName = document.getElementById("selectPatient").value;
                                    const dId = parseInt(document.getElementById("selectDoctor").value);

                                    if (!pName || isNaN(dId)) {
                                        alert("Select patient and doctor");
                                        return;
                                    }

                                    // Update States
                                    setDoctors(prev => prev.map(d => d.id === dId ? { ...d, status: "Busy" } : d));
                                    setPatients(prev => prev.map(p => p.name === pName ? { ...p, doctorAssigned: dId } : p));

                                    setHospitalData(prev => ({
                                        ...prev,
                                        doctorsAvailable: prev.doctorsAvailable > 0 ? prev.doctorsAvailable - 1 : 0
                                    }));

                                    setNotification("Doctor assigned successfully!");
                                    setShowDoctorModal(false);
                                    setTimeout(() => setNotification(""), 3000);
                                }}
                                className="px-6 py-2 bg-emerald-600 rounded-xl"
                            >
                                Assign
                            </button>

                        </div>

                    </div>
                </div>
            )}
            {/* //assigned doctor modal end */}
            <div className="mt-16">
                <h2 className="text-xl font-bold text-white mb-6">
                    Current Patients
                </h2>

                <div className="space-y-4">
                    {patients.map((p, index) => {

                        const doctor = doctors.find(d => d.id === p.doctorAssigned);

                        return (
                            <div
                                key={index}
                                className="p-5 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center"
                            >
                                <div>
                                    <p className="text-white font-bold">{p.name}</p>
                                    <p className="text-zinc-400 text-sm">
                                        Priority: {p.priority}
                                    </p>
                                    <p className="text-emerald-400 text-sm">
                                        Doctor: {doctor ? doctor.name : "Not Assigned"}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleDischargePatient(p.name)}
                                    className="px-5 py-2 bg-red-600 rounded-xl text-sm"
                                >
                                    Discharge
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* work load */}
            {/* ================= DOCTOR WORKLOAD ================= */}
            <div className="mt-16">
                <h2 className="text-xl font-bold text-white mb-6">
                    Doctor Workload
                </h2>

                <div className="grid md:grid-cols-3 gap-6">

                    {doctors.map(d => {

                        const patientCount =
                            patients.filter(p => p.doctorAssigned === d.id).length;

                        return (
                            <div
                                key={d.id}
                                className="p-6 bg-white/5 rounded-2xl border border-white/10"
                            >
                                <p className="text-white font-bold">{d.name}</p>

                                <p className="text-zinc-400 text-sm">
                                    {d.specialization}
                                </p>

                                <p className={`mt-3 font-bold ${d.status === "Available"
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                    }`}>
                                    {d.status}
                                </p>

                                <p className="text-cyan-400 text-sm mt-2">
                                    Patients Assigned: {patientCount}
                                </p>
                            </div>
                        );
                    })}

                </div>
            </div>

            <div className="mt-16">
                <h2 className="text-xl font-bold text-white mb-6">
                    Laboratory Control
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                    {labs.map(l => (
                        <div
                            key={l.id}
                            className="p-6 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center"
                        >
                            <div>
                                <p className="text-white font-bold">{l.name}</p>
                                <p className={`text-sm ${l.status === "Active"
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                    }`}>
                                    {l.status}
                                </p>
                            </div>

                            <button
                                onClick={() => toggleLab(l.id)}
                                className="px-4 py-2 bg-purple-600 rounded-xl text-sm"
                            >
                                Toggle
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            {/* BACK BUTTON */}
            <div className="flex justify-center mt-20">
                <button
                    onClick={() => setActivePage("dashboard")}
                    className="px-12 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl font-bold uppercase text-sm tracking-widest shadow-lg hover:scale-110 transition-all duration-300"
                >
                    ← Back to Main Dashboard
                </button>
            </div>

        </div>
    )
}

{/* RESTORED: AI VOICE VISUALIZER HUB */ }
{
    activePage === "dashboard" && (
        <div className={`relative p-10 rounded-[3.5rem] shadow-xl text-center flex items-center justify-center gap-10 overflow-hidden transition-all duration-700 ${mode === 'ai' ? 'bg-blue-600 ring-4 ring-blue-400/20 shadow-blue-500/50' : 'bg-zinc-900 border border-white/10'}`}>
            {mode === 'ai' && isListening && (
                <div className="flex items-end gap-1.5 h-10">
                    <div className="voice-bar bar-1"></div><div className="voice-bar bar-2"></div><div className="voice-bar bar-3"></div><div className="voice-bar bar-4"></div><div className="voice-bar bar-5"></div>
                </div>
            )}
            <div className="relative">
                <Activity className={`${mode === 'ai' ? 'text-white' : 'text-blue-500'} ${isListening ? 'animate-pulse' : ''}`} size={32} />
                {isListening && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>}
            </div>
            <p className={`${mode === 'ai' ? 'text-white' : 'text-blue-100'} italic font-serif text-4xl leading-snug tracking-tighter`}>"{aiMsg}"</p>
        </div>
    )
}
{/* RESTORED: VIDEO MODAL */ }
{
    showVideo && (
        <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex flex-col p-8 animate-in zoom-in duration-300">
            <div className="max-w-5xl mx-auto flex-1 flex flex-col gap-10">
                <div className="flex justify-between items-center text-white">
                    <h2 className="text-2xl font-black italic tracking-[0.5em] uppercase flex items-center gap-5"><Video size={30} className="text-red-500 animate-pulse" /> Medical Hub: {patient.issue}</h2>
                    <button onClick={() => setShowVideo(false)} className="p-4 bg-red-600 rounded-full hover:scale-110 transition-transform shadow-xl"><X size={28} /></button>
                </div>
                <div className="flex-1 bg-zinc-900 rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl relative">
                    <video autoPlay loop muted className="w-full h-full object-cover">
                        <source src={results?.medicus?.video} type="video/mp4" />
                    </video>
                </div>
                <div className="bg-emerald-600/10 p-12 rounded-[4rem] border border-emerald-500/30 text-center font-black italic uppercase text-2xl text-emerald-50 tracking-widest leading-relaxed shadow-xl">
                    "Analyzing clinical history with Dr. Sravani. Please monitor this guidance loop for {patient.issue}."
                </div>
            </div>
        </div>
    )
}
{
    showSidebar && (
        <div className="fixed inset-0 z-[300] flex animate-in fade-in duration-300">

            {/* BACKDROP */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-xl"
                onClick={() => setShowSidebar(false)}
            />

            {/* SIDEBAR PANEL */}
            <div className="relative w-[340px] h-full bg-zinc-900/80 backdrop-blur-2xl border-r border-white/5 shadow-[0_0_80px_rgba(59,130,246,0.15)] p-10 flex flex-col gap-10 animate-in slide-in-from-left duration-500 rounded-r-[3rem]">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-black text-white uppercase tracking-[0.3em] italic">
                        CareConnect Menu
                    </h2>

                    <button
                        onClick={() => setShowSidebar(false)}
                        className="w-10 h-10 flex items-center justify-center bg-red-600/80 hover:bg-red-600 rounded-full shadow-lg transition-all hover:scale-110"
                    >
                        ✕
                    </button>
                </div>

                {/* DIVIDER */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

                {/* MENU ITEMS */}
                <div className="flex flex-col gap-6 text-xs font-black uppercase tracking-widest">
                    <button
                        onClick={() => {
                            generateHospitalData();
                            setActivePage("hospitalDashboard");
                            setShowSidebar(false);
                        }}
                        className="group p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-green-600/10 hover:border-green-500/30 transition-all duration-300 text-left"
                    >
                        📊 Hospital Dashboard
                    </button>
                    <button
                        onClick={() => {
                            setActivePage("about");
                            setShowSidebar(false);
                        }}
                        className="group p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-blue-600/10 hover:border-blue-500/30 transition-all duration-300 text-left flex items-center gap-3"
                    >
                        <span className="group-hover:scale-110 transition-transform">🏥</span>
                        <span className="group-hover:text-blue-400 transition-colors">
                            About Hospital
                        </span>
                    </button>

                    <button
                        onClick={() => {
                            setActivePage("blood");
                            setShowSidebar(false);
                        }}
                        className="group p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-rose-600/10 hover:border-rose-500/30 transition-all duration-300 text-left flex items-center gap-3"
                    >
                        <span className="group-hover:scale-110 transition-transform">🩸</span>
                        <span className="group-hover:text-rose-400 transition-colors">
                            Blood Donation
                        </span>
                    </button>

                    <button
                        onClick={() => {
                            setActivePage("emergency");
                            setShowSidebar(false);
                        }}
                        className="group p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-red-600/10 hover:border-red-500/30 transition-all duration-300 text-left flex items-center gap-3"
                    >
                        <span className="group-hover:scale-110 transition-transform">🚑</span>
                        <span className="group-hover:text-red-400 transition-colors">
                            Emergency Contact
                        </span>
                    </button>

                    <button
                        onClick={() => {
                            setShowSidebar(false);
                            setTimeout(() => {
                                setActivePage("help");
                            }, 200);
                        }}
                        className="group p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-yellow-600/10 hover:border-yellow-500/30 transition-all duration-300 text-left"
                    >
                        <span className="group-hover:text-yellow-400 transition-colors">
                            ❓ Help Center
                        </span>
                    </button>
                </div>

                {/* FOOTER GLOW LINE */}
                <div className="mt-auto h-[2px] w-full bg-blue-500/30 blur-sm rounded-full" />

            </div>
        </div>
    )
}
        </div >
    );
}