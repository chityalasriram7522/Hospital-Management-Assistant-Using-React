import React, { createContext, useContext, useState, useEffect } from 'react';

const HospitalContext = createContext(null);

const TOTAL_BEDS = 120;
const TOTAL_DOCTORS = 40;
const TOTAL_LABS = 10;
const TOTAL_LAB_STAFF = 25;

const INITIAL_DOCTORS = [
    { id: 1, name: "Dr. Sriram Chityala", specialization: "Chief Cardiology Specialist", status: "Available", experience: "14 yrs" },
    { id: 2, name: "Dr. Sarah Jenkins", specialization: "Senior Neurology Consultant", status: "Available", experience: "11 yrs" },
    { id: 3, name: "Dr. Vikram Patel", specialization: "Orthopedic Surgeon", status: "Available", experience: "9 yrs" },
    { id: 4, name: "Dr. Aisha Khan", specialization: "Emergency Medicine Specialist", status: "Available", experience: "8 yrs" },
    { id: 5, name: "Dr. David Chen", specialization: "General Internal Medicine", status: "Available", experience: "12 yrs" }
];

const INITIAL_LABS = [
    { id: 1, name: "Digital Radiology & X-Ray", status: "Active", room: "Wing A - 102", queue: 4 },
    { id: 2, name: "Hematology & Pathology", status: "Active", room: "Wing B - 204", queue: 7 },
    { id: 3, name: "3T High-Res MRI & CT Suite", status: "Maintenance", room: "Basement 01", queue: 0 },
    { id: 4, name: "Microbiology & Viral Lab", status: "Active", room: "Wing C - 301", queue: 2 }
];

const INITIAL_INVENTORY = [
    { id: 1, name: "Paracetamol 650mg", category: "Analgesic / Antipyretic", stock: 450, unitPrice: 35, unit: "Strips", batch: "PCT-2026-A", expiry: "12/2028", status: "In Stock" },
    { id: 2, name: "Cetirizine 10mg", category: "Antihistamine", stock: 180, unitPrice: 28, unit: "Strips", batch: "CTZ-2026-B", expiry: "09/2027", status: "In Stock" },
    { id: 3, name: "Aspirin 300mg Chewable", category: "Cardiovascular / Antiplatelet", stock: 38, unitPrice: 45, unit: "Strips", batch: "ASP-2026-C", expiry: "05/2027", status: "Low Stock" },
    { id: 4, name: "Sorbitrate 5mg", category: "Cardiovascular / Nitrate", stock: 24, unitPrice: 60, unit: "Strips", batch: "SBT-2026-D", expiry: "08/2027", status: "Low Stock" },
    { id: 5, name: "Ibuprofen 400mg", category: "NSAID / Anti-inflammatory", stock: 290, unitPrice: 40, unit: "Strips", batch: "IBU-2026-E", expiry: "11/2028", status: "In Stock" },
    { id: 6, name: "Oral Rehydration Salts (ORS)", category: "Electrolytes", stock: 520, unitPrice: 22, unit: "Sachets", batch: "ORS-2026-F", expiry: "04/2029", status: "In Stock" },
    { id: 7, name: "Amoxicillin 500mg", category: "Antibiotic", stock: 140, unitPrice: 85, unit: "Strips", batch: "AMX-2026-G", expiry: "02/2028", status: "In Stock" },
    { id: 8, name: "Pantoprazole 40mg", category: "Antacid / PPI", stock: 310, unitPrice: 65, unit: "Strips", batch: "PAN-2026-H", expiry: "06/2028", status: "In Stock" }
];

const INITIAL_VITALS = {
    temperature: "98.6",
    heartRate: "72",
    bpSystolic: "120",
    bpDiastolic: "80",
    spO2: "98"
};

const INITIAL_PATIENT_FLOW = {
    name: "",
    phone: "",
    gender: "Male",
    issue: "",
    customIssue: "",
    date: "",
    slot: "",
    token: "",
    days: "5",
    address: "",
    method: "Offline Pickup",
    isOther: false,
    otherName: "",
    otherAddress: ""
};

export function HospitalProvider({ children }) {
    // Persistent records
    const [patients, setPatients] = useState(() => {
        try {
            const saved = localStorage.getItem('careconnect_patients');
            return saved ? JSON.parse(saved) : [
                { id: 101, name: "Rahul Verma", priority: "Emergency", doctorAssigned: 1, bedNumber: 12, admittedAt: "Today, 10:15 AM" },
                { id: 102, name: "Anita Sharma", priority: "Normal", doctorAssigned: 2, bedNumber: 34, admittedAt: "Today, 11:40 AM" }
            ];
        } catch {
            return [];
        }
    });

    const [appointments, setAppointments] = useState(() => {
        try {
            const saved = localStorage.getItem('careconnect_appointments');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [donations, setDonations] = useState(() => {
        try {
            const saved = localStorage.getItem('careconnect_donations');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [emergencyAlerts, setEmergencyAlerts] = useState(() => {
        try {
            const saved = localStorage.getItem('careconnect_emergencies');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [doctors, setDoctors] = useState(() => {
        try {
            const saved = localStorage.getItem('careconnect_doctors');
            return saved ? JSON.parse(saved) : INITIAL_DOCTORS;
        } catch {
            return INITIAL_DOCTORS;
        }
    });

    const [labs, setLabs] = useState(() => {
        try {
            const saved = localStorage.getItem('careconnect_labs');
            return saved ? JSON.parse(saved) : INITIAL_LABS;
        } catch {
            return INITIAL_LABS;
        }
    });

    const [hospitalData, setHospitalData] = useState({
        occupiedBeds: 58,
        doctorsAvailable: 24,
        labsActive: 3
    });

    // Pharmacy Drug Inventory with LocalStorage Persistence
    const [inventory, setInventory] = useState(() => {
        try {
            const saved = localStorage.getItem('careconnect_inventory');
            return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
        } catch {
            return INITIAL_INVENTORY;
        }
    });

    // Clinical Vitals for Active Patient / Triage
    const [vitals, setVitals] = useState(INITIAL_VITALS);

    // Navigation and Modals
    const [activePage, setActivePage] = useState("dashboard"); // dashboard, records, inventory, hospitalDashboard, about, blood, emergency, help
    const [showSidebar, setShowSidebar] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [showDoctorModal, setShowDoctorModal] = useState(false);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

    // Upgraded Clinical Modals: Teleconsultation & Patient Billing
    const [showTeleconsultModal, setShowTeleconsultModal] = useState(false);
    const [selectedTeleconsultPatient, setSelectedTeleconsultPatient] = useState(null);
    const [showBillingModal, setShowBillingModal] = useState(false);
    const [selectedBillingPatient, setSelectedBillingPatient] = useState(null);
    const [selectedPrescriptionPatient, setSelectedPrescriptionPatient] = useState(null);

    // Active Triage / Scheduler / Pharmacy Flow State
    const [patient, setPatient] = useState(INITIAL_PATIENT_FLOW);
    const [gridPhase, setGridPhase] = useState(1); // 1: Triage, 2: Scheduler, 3: Pharmacy
    const [subStep, setSubStep] = useState(0);
    const [mode, setMode] = useState("manual"); // manual, ai
    const [aiMsg, setAiMsg] = useState("System Standby. Please identify yourself to begin.");
    const [results, setResults] = useState(null);
    const [tokenVerified, setTokenVerified] = useState(false);
    const [mapProgress, setMapProgress] = useState(0);
    const [lastHeardTranscript, setLastHeardTranscript] = useState("");
    const [showVoiceHelpModal, setShowVoiceHelpModal] = useState(false);

    // Toasts
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = "info") => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Sync to local storage
    useEffect(() => {
        localStorage.setItem('careconnect_patients', JSON.stringify(patients));
    }, [patients]);

    useEffect(() => {
        localStorage.setItem('careconnect_appointments', JSON.stringify(appointments));
    }, [appointments]);

    useEffect(() => {
        localStorage.setItem('careconnect_donations', JSON.stringify(donations));
    }, [donations]);

    useEffect(() => {
        localStorage.setItem('careconnect_emergencies', JSON.stringify(emergencyAlerts));
    }, [emergencyAlerts]);

    useEffect(() => {
        localStorage.setItem('careconnect_doctors', JSON.stringify(doctors));
    }, [doctors]);

    useEffect(() => {
        localStorage.setItem('careconnect_labs', JSON.stringify(labs));
    }, [labs]);

    // Recalculate available doctors based on current assignments
    useEffect(() => {
        const busyCount = doctors.filter(d => d.status === "Busy").length;
        setHospitalData(prev => ({
            ...prev,
            doctorsAvailable: Math.max(0, TOTAL_DOCTORS - busyCount),
            labsActive: labs.filter(l => l.status === "Active").length,
            occupiedBeds: Math.min(TOTAL_BEDS, 50 + patients.length)
        }));
    }, [doctors, labs, patients.length]);

    // Patient admission
    const admitPatient = (name, priority) => {
        if (!name.trim()) {
            addToast("Please provide patient name.", "warning");
            return false;
        }

        if (hospitalData.occupiedBeds >= TOTAL_BEDS) {
            addToast("Alert: All hospital beds are currently occupied!", "error");
            return false;
        }

        // Auto assign available doctor if possible
        const availableDoctor = doctors.find(d => d.status === "Available");
        let assignedId = null;

        if (availableDoctor) {
            assignedId = availableDoctor.id;
            setDoctors(prev => prev.map(d => d.id === availableDoctor.id ? { ...d, status: "Busy" } : d));
        }

        const newPatient = {
            id: Date.now(),
            name: name.trim(),
            priority,
            doctorAssigned: assignedId,
            bedNumber: Math.floor(Math.random() * 80) + 1,
            admittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setPatients(prev => [newPatient, ...prev]);
        addToast(
            assignedId
                ? `Patient ${name} admitted and assigned to ${availableDoctor.name}!`
                : `Patient ${name} admitted to Ward. Doctor assignment pending.`,
            "success"
        );
        return true;
    };

    // Discharge patient
    const dischargePatient = (id) => {
        const p = patients.find(pat => pat.id === id);
        if (!p) return;

        // Release doctor if assigned
        if (p.doctorAssigned) {
            setDoctors(prev => prev.map(d => d.id === p.doctorAssigned ? { ...d, status: "Available" } : d));
        }

        setPatients(prev => prev.filter(pat => pat.id !== id));
        addToast(`Patient ${p.name} successfully discharged. Bed released.`, "info");
    };

    // Assign doctor manually
    const assignDoctorToPatient = (patientId, doctorId) => {
        const doc = doctors.find(d => d.id === doctorId);
        const pat = patients.find(p => p.id === patientId);

        if (!doc || !pat) return false;

        setDoctors(prev => prev.map(d => d.id === doctorId ? { ...d, status: "Busy" } : d));
        setPatients(prev => prev.map(p => p.id === patientId ? { ...p, doctorAssigned: doctorId } : p));

        addToast(`${doc.name} assigned to patient ${pat.name}.`, "success");
        return true;
    };

    useEffect(() => {
        localStorage.setItem('careconnect_inventory', JSON.stringify(inventory));
    }, [inventory]);

    // Pharmacy Inventory helpers
    const restockMedicine = (id, amount = 50) => {
        setInventory(prev => prev.map(item => {
            if (item.id === id) {
                const nextStock = item.stock + amount;
                const nextStatus = nextStock > 40 ? "In Stock" : "Low Stock";
                addToast(`Restocked +${amount} units of ${item.name}. (Total: ${nextStock})`, "success");
                return { ...item, stock: nextStock, status: nextStatus };
            }
            return item;
        }));
    };

    const deductStock = (medName, amount = 1) => {
        let deducted = false;
        setInventory(prev => prev.map(item => {
            if (item.name.toLowerCase().includes(medName.toLowerCase()) || medName.toLowerCase().includes(item.name.toLowerCase())) {
                const nextStock = Math.max(0, item.stock - amount);
                const nextStatus = nextStock === 0 ? "Out of Stock" : nextStock < 40 ? "Low Stock" : "In Stock";
                deducted = true;
                return { ...item, stock: nextStock, status: nextStatus };
            }
            return item;
        }));
        return deducted;
    };

    // Vitals helper
    const updateVitals = (key, value) => {
        setVitals(prev => ({ ...prev, [key]: value }));
    };

    // Teleconsultation & Billing trigger helpers
    const openTeleconsult = (pat = null) => {
        setSelectedTeleconsultPatient(pat || patient);
        setShowTeleconsultModal(true);
    };

    const openBilling = (pat = null) => {
        setSelectedBillingPatient(pat || patient);
        setShowBillingModal(true);
    };

    const openPrescription = (pat = null) => {
        setSelectedPrescriptionPatient(pat || selectedTeleconsultPatient || patient);
        setShowPrescriptionModal(true);
    };

    // Toggle lab status
    const toggleLab = (id) => {
        setLabs(prev => prev.map(l => {
            if (l.id === id) {
                const nextStatus = l.status === "Active" ? "Inactive" : "Active";
                addToast(`${l.name} is now ${nextStatus}.`, "info");
                return { ...l, status: nextStatus };
            }
            return l;
        }));
    };

    // Reset flow
    const resetPatientFlow = () => {
        setPatient(INITIAL_PATIENT_FLOW);
        setGridPhase(1);
        setSubStep(0);
        setTokenVerified(false);
        setMapProgress(0);
        setResults(null);
    };

    return (
        <HospitalContext.Provider value={{
            TOTAL_BEDS,
            TOTAL_DOCTORS,
            TOTAL_LABS,
            TOTAL_LAB_STAFF,
            hospitalData,
            setHospitalData,
            patients,
            admitPatient,
            dischargePatient,
            doctors,
            assignDoctorToPatient,
            labs,
            toggleLab,
            appointments,
            setAppointments,
            donations,
            setDonations,
            emergencyAlerts,
            setEmergencyAlerts,
            activePage,
            setActivePage,
            showSidebar,
            setShowSidebar,
            showVideo,
            setShowVideo,
            showPatientModal,
            setShowPatientModal,
            showDoctorModal,
            setShowDoctorModal,
            showPrescriptionModal,
            setShowPrescriptionModal,
            // Upgraded clinical features
            inventory,
            setInventory,
            restockMedicine,
            deductStock,
            vitals,
            setVitals,
            updateVitals,
            showTeleconsultModal,
            setShowTeleconsultModal,
            selectedTeleconsultPatient,
            setSelectedTeleconsultPatient,
            openTeleconsult,
            showBillingModal,
            setShowBillingModal,
            selectedBillingPatient,
            setSelectedBillingPatient,
            openBilling,
            selectedPrescriptionPatient,
            setSelectedPrescriptionPatient,
            openPrescription,
            // Active flow
            patient,
            setPatient,
            gridPhase,
            setGridPhase,
            subStep,
            setSubStep,
            mode,
            setMode,
            aiMsg,
            setAiMsg,
            results,
            setResults,
            tokenVerified,
            setTokenVerified,
            mapProgress,
            setMapProgress,
            toasts,
            addToast,
            removeToast,
            resetPatientFlow,
            lastHeardTranscript,
            setLastHeardTranscript,
            showVoiceHelpModal,
            setShowVoiceHelpModal
        }}>
            {children}
        </HospitalContext.Provider>
    );
}

export function useHospital() {
    const context = useContext(HospitalContext);
    if (!context) {
        throw new Error("useHospital must be used within a HospitalProvider");
    }
    return context;
}
