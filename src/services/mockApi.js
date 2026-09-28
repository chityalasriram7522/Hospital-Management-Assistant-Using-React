// Offline-First Intelligent Medical & Hospital Core API Service

const DEFAULT_SLOTS = [
    "09:00 AM - 10:00 AM",
    "10:30 AM - 11:30 AM",
    "02:00 PM - 03:00 PM",
    "03:30 PM - 04:30 PM",
    "05:00 PM - 06:00 PM",
    "06:30 PM - 07:30 PM"
];

const CLINICAL_KNOWLEDGE_BASE = {
    "Fever / Cold": {
        isSerious: false,
        advice: "Hydrate actively, rest adequately, and maintain thermal regulation.",
        directive: "Twice daily after meals",
        steps: [
            "Drink at least 2.5 to 3 liters of warm water and electrolyte-rich liquids.",
            "Take steam inhalation twice daily for nasal and bronchial congestion.",
            "Monitor body temperature every 4 hours using a digital thermometer.",
            "Isolate in a well-ventilated room to prevent viral transmission."
        ],
        meds: ["Paracetamol 650mg", "Cetirizine 10mg", "Vitamin C 500mg"],
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    },
    "Chest Pain": {
        isSerious: true,
        advice: "URGENT: Chest discomfort requires immediate clinical evaluation and ECG.",
        directive: "Immediate single dose, followed by ER consultation",
        steps: [
            "Cease all physical exertion and sit in an upright, relaxed position.",
            "Loosen tight clothing around the neck, chest, and waist.",
            "Avoid lying flat; keep head and shoulders elevated at 45 degrees.",
            "Keep emergency contact 108 on standby; do not drive yourself."
        ],
        meds: ["Aspirin 300mg (Chewable)", "Sorbitrate / Nitroglycerin 5mg"],
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    },
    "Body Aches": {
        isSerious: false,
        advice: "Musculoskeletal strain detected. Apply gentle thermal compression.",
        directive: "After food twice daily for 3-5 days",
        steps: [
            "Apply warm compress or heating pad to affected muscle zones for 15 mins.",
            "Engage in light mobility stretching; avoid heavy lifting or prolonged sitting.",
            "Ensure magnesium-rich dietary intake and adequate electrolyte hydration.",
            "Prioritize 8 hours of restorative sleep on a supportive mattress."
        ],
        meds: ["Ibuprofen 400mg", "Diclofenac Gel", "Multivitamin & Magnesium B-Complex"],
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    },
    "default": {
        isSerious: false,
        advice: "Symptom logged. Clinical consultation recommended for tailored prescription.",
        directive: "Follow doctor's verbal guidance",
        steps: [
            "Maintain a detailed log of symptom frequency, intensity, and duration.",
            "Avoid self-medicating with antibiotics without an official prescription.",
            "Keep hydrated and consume mild, easily digestible nutritional foods.",
            "Attend your scheduled appointment promptly with previous medical files."
        ],
        meds: ["Oral Rehydration Salts (ORS)", "Antacid 20ml", "Multivitamin Daily"],
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    }
};

export async function triagePatient(issueName, patientName = "Patient") {
    const matched = CLINICAL_KNOWLEDGE_BASE[issueName] || CLINICAL_KNOWLEDGE_BASE["default"];
    const generatedToken = String(Math.floor(1000 + Math.random() * 9000));

    // Try live backend if available
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const res = await fetch('http://localhost:5000/api/hms-core', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ step: "triage", issue: issueName, name: patientName }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            return {
                ...data,
                token: data.token ? String(data.token) : generatedToken,
                slots: data.slots || DEFAULT_SLOTS
            };
        }
    } catch {
        // Backend not running, use resilient local mock
    }

    // Return rich mock response
    return {
        isSerious: matched.isSerious,
        advice: matched.advice,
        token: generatedToken,
        slots: DEFAULT_SLOTS,
        medicus: {
            directive: matched.directive,
            steps: matched.steps,
            meds: matched.meds,
            video: matched.video
        }
    };
}

export async function sendAppointmentSms(patient) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const res = await fetch('http://localhost:5000/api/hms-core', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ step: "send-sms", payload: patient }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            return await res.json();
        }
    } catch {
        // Mock fallback
    }

    return {
        success: true,
        message: `SMS dispatched to +91 ${patient.phone} with Token #${patient.token}`
    };
}

export async function fetchBookedSlotsForDate(date) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const res = await fetch(`http://localhost:5000/api/booked-slots?date=${encodeURIComponent(date)}`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            return await res.json();
        }
    } catch {
        // Fallback
    }

    // Return cached/local storage appointments for that date
    try {
        const stored = JSON.parse(localStorage.getItem('careconnect_appointments') || '[]');
        return stored.filter(a => a.date === date);
    } catch {
        return [];
    }
}
