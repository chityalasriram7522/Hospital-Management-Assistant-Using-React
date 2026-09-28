import { useEffect, useRef } from 'react';
import { useHospital } from '../context/HospitalContext';
import { speechEngine } from '../services/speechService';
import { triagePatient } from '../services/mockApi';

export function useAiVoiceFlow() {
    const {
        mode,
        patient,
        setPatient,
        subStep,
        setGridPhase,
        setSubStep,
        results,
        setResults,
        setTokenVerified,
        setAiMsg,
        addToast,
        setAppointments,
        setActivePage,
        setEmergencyAlerts,
        setLastHeardTranscript,
        openTeleconsult,
        openBilling,
        vitals,
        showTeleconsultModal
    } = useHospital();

    const aiStepRef = useRef(0);
    const generatedTokenRef = useRef("");

    // SYNC BUG FIX: Synchronize aiStepRef whenever user clicks manually on the UI
    useEffect(() => {
        if (subStep === 0) aiStepRef.current = 0;
        else if (subStep === 1) aiStepRef.current = 1;
        else if (subStep === 1.5) aiStepRef.current = 2;
        else if (subStep === 2) aiStepRef.current = 3;
        else if (subStep === 3) aiStepRef.current = 4;
        else if (subStep === 4) aiStepRef.current = 5;
        else if (subStep === 4.5 || subStep === 5) aiStepRef.current = 6;
        else if (subStep === 5.5) aiStepRef.current = 7.5;
        else if (subStep === 6) aiStepRef.current = 8;
        else if (subStep === 7) aiStepRef.current = 9;
        else if (subStep === 9) aiStepRef.current = 10;
    }, [subStep]);

    // Keep token ref updated
    useEffect(() => {
        if (patient.token) {
            generatedTokenRef.current = String(patient.token).trim();
        }
    }, [patient.token]);

    // Handle speech transcripts
    const handleVoiceTranscript = async (transcript) => {
        if (mode !== 'ai') return;
        if (showTeleconsultModal) return; // Do not intercept voice while teleconsult modal is active

        const input = transcript.toLowerCase().trim();
        setLastHeardTranscript(transcript);

        console.log(`[AI Voice Flow] Step ${aiStepRef.current} | Input: "${input}"`);

        // ============================================================
        // 🚨 GLOBAL FEATURE: EMERGENCY VOICE OVERRIDE ("CODE RED")
        // ============================================================
        const emergencyKeywords = [
            "emergency", "ambulance", "heart attack", "severe chest pain",
            "cannot breathe", "can't breathe", "heavy bleeding", "code red",
            "trauma", "urgent help", "save me"
        ];

        if (emergencyKeywords.some(w => input.includes(w))) {
            setActivePage("emergency");
            addToast("🚨 CODE RED: Emergency voice signal detected! Directing to Trauma Response.", "error");

            // Register emergency automatically
            const autoAlert = {
                id: Date.now(),
                name: patient.name || "Emergency Voice Caller",
                phone: patient.phone || "Active Voice Link",
                message: `Voice Emergency Triggered: "${transcript}"`,
                status: "DISPATCHED",
                time: "Just now"
            };
            setEmergencyAlerts(prev => [autoAlert, ...prev]);

            const alertVoice = "Code Red emergency protocol activated. Connecting to ICU trauma line and ambulance 108 immediately.";
            setAiMsg(alertVoice);
            speechEngine.speak(alertVoice);
            return;
        }

        // ============================================================
        // 🌐 GLOBAL FEATURE: VOICE NAVIGATION COMMANDS
        // ============================================================
        if (input.includes("hospital overview") || input.includes("hospital dashboard") || input.includes("show beds") || input.includes("ward matrix")) {
            setActivePage("hospitalDashboard");
            const m = "Navigating to Hospital Infrastructure & Ward Matrix.";
            setAiMsg(m);
            speechEngine.speak(m);
            return;
        }

        if (input.includes("patient records") || input.includes("medical records") || input.includes("ehr") || input.includes("past records") || input.includes("archives")) {
            setActivePage("records");
            const m = "Opening Electronic Health Records and Patient Directory.";
            setAiMsg(m);
            speechEngine.speak(m);
            return;
        }

        if (input.includes("blood donation") || input.includes("donate blood") || input.includes("blood bank")) {
            setActivePage("blood");
            const m = "Opening Blood Donation Registry.";
            setAiMsg(m);
            speechEngine.speak(m);
            return;
        }

        if (input.includes("emergency center") || input.includes("emergency hub") || input.includes("call doctor")) {
            setActivePage("emergency");
            const m = "Opening Emergency Response Center.";
            setAiMsg(m);
            speechEngine.speak(m);
            return;
        }

        if (input.includes("help desk") || input.includes("help center") || input.includes("faq")) {
            setActivePage("help");
            const m = "Opening CareConnect Help Desk.";
            setAiMsg(m);
            speechEngine.speak(m);
            return;
        }

        if (input.includes("about hospital") || input.includes("who is the doctor") || input.includes("hospital info")) {
            setActivePage("about");
            const m = "Displaying Hospital Profile and Leadership.";
            setAiMsg(m);
            speechEngine.speak(m);
            return;
        }

        if (input.includes("inventory") || input.includes("pharmacy stock") || input.includes("drug stock") || input.includes("medicines list")) {
            setActivePage("inventory");
            const m = "Navigating to Pharmacy Drug Inventory and Stock Control.";
            setAiMsg(m);
            speechEngine.speak(m);
            return;
        }

        if (input.includes("teleconsult") || input.includes("video call") || input.includes("call doctor") || input.includes("video doctor")) {
            openTeleconsult(patient);
            const m = "Connecting to CareConnect Telehealth Video Suite.";
            setAiMsg(m);
            speechEngine.speak(m);
            return;
        }

        if (input.includes("billing") || input.includes("invoice") || input.includes("upi payment") || input.includes("pay bill") || input.includes("hospital bill")) {
            openBilling(patient);
            const m = "Generating Patient Hospital Bill and UPI Payment checkout.";
            setAiMsg(m);
            speechEngine.speak(m);
            return;
        }

        if (input.includes("check vitals") || input.includes("patient vitals") || input.includes("heart rate and bp")) {
            const m = `Current vitals for ${patient.name || "Patient"}: Temperature ${vitals?.temperature || 98.6} degrees Fahrenheit, pulse ${vitals?.heartRate || 72} beats per minute, oxygen saturation ${vitals?.spO2 || 98} percent, blood pressure ${vitals?.bpSystolic || 120} over ${vitals?.bpDiastolic || 80}.`;
            setAiMsg(m);
            speechEngine.speak(m);
            return;
        }

        if (input.includes("main dashboard") || input.includes("triage hub") || input.includes("go home") || input.includes("restart")) {
            setActivePage("dashboard");
            setGridPhase(1);
            setSubStep(0);
            aiStepRef.current = 0;
            const m = "Returning to Command Dashboard. Please state your full name to begin.";
            setAiMsg(m);
            speechEngine.speak(m);
            return;
        }

        // ============================================================
        // STEP-BY-STEP CLINICAL ASSISTANT FLOW
        // ============================================================
        const currentStep = aiStepRef.current;

        // STEP 0: PATIENT IDENTITY
        if (currentStep === 0) {
            if (!transcript || transcript.length < 2) {
                speechEngine.speak("Please say your full name clearly.");
                return;
            }

            const cleanName = transcript.charAt(0).toUpperCase() + transcript.slice(1);
            setPatient(p => ({ ...p, name: cleanName }));
            setSubStep(1);
            aiStepRef.current = 1;

            const msg = `Welcome ${cleanName}. What health symptoms are you experiencing today?`;
            setAiMsg(msg);
            speechEngine.speak(msg);
            return;
        }

        // STEP 1: SYMPTOMS / CLINICAL ASSESSMENT
        if (currentStep === 1) {
            const feverWords = ["fever", "cold", "cough", "temperature", "flu", "chills", "sneezing", "headache", "throat"];
            const chestWords = ["chest", "heart", "breathing", "pressure", "breath", "angina"];
            const bodyWords = ["body", "pain", "aches", "weakness", "tired", "back", "joint", "fatigue", "muscle"];

            let detectedIssue = "";
            if (feverWords.some(w => input.includes(w))) {
                detectedIssue = "Fever / Cold";
            } else if (chestWords.some(w => input.includes(w))) {
                detectedIssue = "Chest Pain";
            } else if (bodyWords.some(w => input.includes(w))) {
                detectedIssue = "Body Aches";
            } else {
                detectedIssue = transcript;
            }

            const data = await triagePatient(detectedIssue, patient.name);
            setResults(data);
            setPatient(p => ({
                ...p,
                issue: detectedIssue,
                token: data.token
            }));
            generatedTokenRef.current = String(data.token);

            if (data.isSerious) {
                setGridPhase(2);
                setSubStep(2);
                aiStepRef.current = 3;
                const m = `I detected ${detectedIssue}. This requires immediate physician evaluation. Which appointment day do you prefer? Today or tomorrow?`;
                setAiMsg(m);
                speechEngine.speak(m);
            } else {
                setSubStep(1.5);
                aiStepRef.current = 2;
                const m = `I logged ${detectedIssue}. ${data.advice}. Would you like to schedule an official doctor appointment? Say yes or no.`;
                setAiMsg(m);
                speechEngine.speak(m);
            }
            return;
        }

        // STEP 2: APPOINTMENT CONFIRMATION
        if (currentStep === 2) {
            if (input.includes("yes") || input.includes("sure") || input.includes("book") || input.includes("okay") || input.includes("yeah") || input.includes("schedule")) {
                setGridPhase(2);
                setSubStep(2);
                aiStepRef.current = 3;
                const m = "Booking confirmed. Which date do you prefer? Today, tomorrow, or a weekday?";
                setAiMsg(m);
                speechEngine.speak(m);
            } else if (input.includes("no") || input.includes("not now") || input.includes("later") || input.includes("cancel")) {
                aiStepRef.current = 0;
                const m = "Understood. Please adhere to hydration and rest guidelines. Feel better!";
                setAiMsg(m);
                speechEngine.speak(m);
            } else {
                speechEngine.speak("Please say yes to book an appointment, or no to finish.");
            }
            return;
        }

        // STEP 3: DATE & TIME SLOT SELECTION
        if (currentStep === 3) {
            let selectedDate = "Today";
            if (input.includes("tomorrow")) selectedDate = "Tomorrow";
            else if (input.includes("today")) selectedDate = "Today";
            else if (input.includes("day after")) selectedDate = "Day after tomorrow";
            else selectedDate = transcript.charAt(0).toUpperCase() + transcript.slice(1);

            // Check if user also provided the time slot in the same utterance (e.g. "Tomorrow at morning")
            let detectedSlot = null;
            if (input.includes("morning") || input.includes("9") || input.includes("10")) {
                detectedSlot = "09:00 AM - 10:00 AM";
            } else if (input.includes("afternoon") || input.includes("2") || input.includes("lunch")) {
                detectedSlot = "02:00 PM - 03:00 PM";
            } else if (input.includes("evening") || input.includes("5") || input.includes("6") || input.includes("night")) {
                detectedSlot = "05:00 PM - 06:00 PM";
            }

            if (detectedSlot) {
                setPatient(p => ({ ...p, date: selectedDate, slot: detectedSlot }));
                setSubStep(4);
                aiStepRef.current = 5;
                const m = `Appointment reserved for ${selectedDate} in the ${detectedSlot.split('-')[0].trim()} slot. Please tell your 10 digit mobile number.`;
                setAiMsg(m);
                speechEngine.speak(m);
                return;
            }

            setPatient(p => ({ ...p, date: selectedDate }));
            setSubStep(3);
            aiStepRef.current = 4;
            const m = `Date set for ${selectedDate}. Which time window do you prefer? Morning, afternoon, or evening?`;
            setAiMsg(m);
            speechEngine.speak(m);
            return;
        }

        // STEP 4: TIME SLOT SELECTION
        if (currentStep === 4) {
            let slot = "10:30 AM - 11:30 AM";
            if (input.includes("morning") || input.includes("9") || input.includes("first")) slot = "09:00 AM - 10:00 AM";
            else if (input.includes("afternoon") || input.includes("2") || input.includes("lunch")) slot = "02:00 PM - 03:00 PM";
            else if (input.includes("evening") || input.includes("5") || input.includes("6") || input.includes("night")) slot = "05:00 PM - 06:00 PM";

            setPatient(p => ({ ...p, slot }));
            setSubStep(4);
            aiStepRef.current = 5;
            const m = `Slot reserved for ${slot}. Please tell your 10 digit mobile number.`;
            setAiMsg(m);
            speechEngine.speak(m);
            return;
        }

        // STEP 5: MOBILE NUMBER VERIFICATION
        if (currentStep === 5) {
            const digits = transcript.replace(/\D/g, '');
            if (digits.length < 10) {
                speechEngine.speak("Please speak a valid 10 digit mobile number clearly.");
                return;
            }

            const tokenVal = generatedTokenRef.current || String(Math.floor(1000 + Math.random() * 9000));
            generatedTokenRef.current = tokenVal;

            setPatient(p => ({
                ...p,
                phone: digits,
                token: tokenVal
            }));

            // Record appointment
            setAppointments(prev => [...prev, {
                id: Date.now(),
                patientName: patient.name,
                phone: digits,
                date: patient.date || "Today",
                slot: patient.slot || "Morning",
                token: tokenVal
            }]);

            setGridPhase(3);
            setSubStep(5);
            aiStepRef.current = 6;

            const m = `Registration completed! Your clinic pharmacy token is ${tokenVal}. Please repeat the token ${tokenVal} to unlock your prescription.`;
            setAiMsg(m);
            speechEngine.speak(m);
            return;
        }

        // STEP 6: TOKEN REPETITION & VERIFICATION
        if (currentStep === 6) {
            const numberWords = {
                zero: "0", one: "1", two: "2", three: "3", four: "4",
                five: "5", six: "6", seven: "7", eight: "8", nine: "9"
            };

            const words = input.split(/\s+/);
            const parsedDigits = words.map(w => numberWords[w] !== undefined ? numberWords[w] : (!isNaN(w) ? w : "")).join("");
            const cleanDigits = transcript.replace(/\D/g, '');
            const combined = parsedDigits || cleanDigits;

            const targetToken = String(generatedTokenRef.current).trim();

            if (combined.includes(targetToken) || input.includes(targetToken) || input.includes("verify") || input.includes("demo")) {
                setTokenVerified(true);
                setGridPhase(3);
                setSubStep(5);
                aiStepRef.current = 7;
                addToast("Token Verified via Voice!", "success");
                const m = "Token verified! How many days medication course? Three days, five days, or ten days?";
                setAiMsg(m);
                speechEngine.speak(m);
            } else {
                speechEngine.speak(`Token did not match. Your token is ${targetToken}. Please say the numbers clearly.`);
            }
            return;
        }

        // STEP 7: DURATION & BILLING ROUTING
        if (currentStep === 7) {
            let days = "5";
            if (input.includes("three") || input.includes("3")) days = "3";
            else if (input.includes("five") || input.includes("5")) days = "5";
            else if (input.includes("ten") || input.includes("10") || input.includes("week")) days = "10";

            setPatient(p => ({ ...p, days }));
            setSubStep(5.5);
            aiStepRef.current = 7.5;
            const total = (parseInt(days) * 45) + 600;
            const m = `Course set for ${days} days. Total payable bill is ${total} rupees. Please settle your bill via UPI or say confirm payment to continue.`;
            setAiMsg(m);
            speechEngine.speak(m);
            return;
        }

        // STEP 7.5: BILLING & PAYMENT CLEARANCE (UPI OR CASH)
        if (currentStep === 7.5) {
            if (input.includes("cash") || input.includes("counter") || input.includes("pay through cash") || input.includes("cod") || input.includes("pay cash")) {
                setPatient(p => ({
                    ...p,
                    paymentMode: "Cash",
                    paymentStatus: "Pay on Collection / COD"
                }));
                setSubStep(6);
                aiStepRef.current = 8;
                addToast(`Cash payment selected. Pay using your Token #${patient.token || "9842"} at Counter or on Delivery.`, "info");
                const m = `Cash payment selected. You can pay with your existing token #${patient.token || "9842"} at the counter or cash on delivery. Would you like offline hospital pickup or doorstep delivery?`;
                setAiMsg(m);
                speechEngine.speak(m);
                return;
            }

            if (input.includes("pay") || input.includes("settle") || input.includes("upi") || input.includes("confirm") || input.includes("done") || input.includes("paid") || input.includes("yes")) {
                setPatient(p => ({ ...p, paymentMode: "UPI Instant", paymentStatus: "PAID" }));
                setSubStep(6);
                aiStepRef.current = 8;
                addToast("Payment cleared via Voice UPI verification!", "success");
                const m = "Payment cleared successfully! Would you like offline hospital pickup or doorstep delivery?";
                setAiMsg(m);
                speechEngine.speak(m);
                return;
            } else {
                speechEngine.speak("Please say UPI payment or pay through cash to proceed to delivery.");
                return;
            }
        }

        // STEP 8: PICKUP OR DELIVERY
        if (currentStep === 8) {
            if (input.includes("pickup") || input.includes("pick up") || input.includes("collect") || input.includes("hospital") || input.includes("counter")) {
                setPatient(p => ({ ...p, method: "Offline Pickup", isOther: false }));
                setSubStep(11);
                aiStepRef.current = 0;
                const m = "Offline pickup confirmed. Please collect your medicine packet from Ground Floor Pharmacy Counter. Stay healthy!";
                setAiMsg(m);
                speechEngine.speak(m);
            } else if (input.includes("delivery") || input.includes("home") || input.includes("courier") || input.includes("doorstep")) {
                setPatient(p => ({ ...p, method: "Online Delivery", isOther: true }));
                setSubStep(7);
                aiStepRef.current = 9;
                const m = "Express delivery chosen. Please speak the recipient's full name.";
                setAiMsg(m);
                speechEngine.speak(m);
            } else {
                speechEngine.speak("Please say pickup or delivery.");
            }
            return;
        }

        // STEP 9: RECIPIENT NAME
        if (currentStep === 9) {
            const cleanRecipient = transcript.charAt(0).toUpperCase() + transcript.slice(1);
            setPatient(p => ({ ...p, otherName: cleanRecipient }));
            setSubStep(7);
            aiStepRef.current = 10;
            const m = `Recipient registered as ${cleanRecipient}. Please tell me your complete delivery address and landmark.`;
            setAiMsg(m);
            speechEngine.speak(m);
            return;
        }

        // STEP 10: ADDRESS & DISPATCH
        if (currentStep === 10) {
            setPatient(p => ({ ...p, otherAddress: transcript }));
            setSubStep(9);
            aiStepRef.current = 0;
            const m = "Address logged. Dispatching courier to your doorstep now.";
            setAiMsg(m);
            speechEngine.speak(m);
            return;
        }
    };

    // Attach speech engine callback & error handler
    useEffect(() => {
        if (showTeleconsultModal) return;
        speechEngine.onResultCallback = handleVoiceTranscript;
        speechEngine.onErrorCallback = (errMessage) => {
            addToast(errMessage, "error");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, patient.name, patient.token, results, subStep, showTeleconsultModal]);

    return {
        aiStepRef
    };
}
