# CareConnect AI v7.0 — Hospital Management & Assistant System

> **Advanced AI-Integrated Hospital Operations, Voice Triage, Smart Appointment Scheduling, and Pharmaceutical Logistics Ecosystem**

Founded and directed by **Dr. Sriram Chityala**, CareConnect AI merges real-time hospital ward telemetry with multimodal speech-guided clinical triage.

---

## 🌟 Key Features

### 1. 🎙️ Multimodal AI Voice & Manual Assistant
- **Dual Operating Modes**: Switch effortlessly between **Manual Control** and **AI Assisted** voice navigation.
- **Hands-Free Clinical Triage**: Speak symptoms naturally. The Web Speech API and text-to-speech engine automatically identify conditions, analyze urgency, and guide the patient.
- **Voice Token Verification**: Repeat your 4-digit token aloud to unlock pharmacy orders.

### 2. 🏥 3-Phase Patient Journey
- **Phase 01 — Identity & Triage Hub**:
  - Full-name registration.
  - Symptom analysis for **Fever / Cold**, **Chest Pain**, **Body Aches**, or custom complaints.
  - Immediate home remedy guidance and emergency escalations.
- **Phase 02 — Appointment Scheduler**:
  - Dynamic calendar (Today and upcoming 3 days).
  - Real-time time slot conflict detection preventing double-booking.
  - Mobile verification and automated SMS token dispatch.
- **Phase 03 — Logistics & Pharmacy Dispatch**:
  - Secure token verification gate.
  - Prescribed medication dosage schedules with food directives.
  - Interactive clinical tutorial video player.
  - Course duration selection (3, 5, or 10 days).
  - **Offline Hospital Pickup** vs. **Express Online Doorstep Delivery** with animated courier transit tracker and celebratory confetti.

### 3. 📄 Official Digital Prescription & Token Card (NEW)
- Generate a hospital-branded, printable/downloadable PDF prescription containing:
  - Hospital letterhead & Dr. Sriram Chityala's credentials.
  - Patient diagnosis, token number, and phone number.
  - Pharmacological schedule table with exact dosage times.
  - QR Code and digital verification signature.

### 4. 🛏️ Hospital Operations & Ward Matrix (NEW)
- **Live Ward Occupancy Telemetry**: Real-time bed usage counter with automatic >80% critical warnings.
- **Interactive Bed Matrix Visualizer**: Visual floor grid color-coding available, occupied, and emergency ICU beds.
- **Physician Workload Management**: Real-time doctor tracking, experience ratings, and active patient assignment count.
- **Diagnostic Laboratory Controls**: Active/inactive toggles for Radiology, Hematology, MRI, and Microbiology.
- **Patient Admission & Discharge**: Modal-based in-patient intake with automatic doctor allocation and bed release.

### 5. 🩸 Blood Donation Registry
- Donor registration form with blood group selector and ml dosage target.
- Live database of registered donors with timestamped logs.
- Clinical donor safety eligibility guidelines.

### 6. 🚨 Emergency Response Center
- Quick-dial hotlines for **Ambulance (108)**, **ICU Trauma (+91 08732 234999)**, and **Help Desk**.
- Code Red emergency alert broadcast system dispatching immediate trauma alerts.

### 7. ❓ Help Desk & Support Center
- Interactive accordion FAQ answers common user questions.
- Live system status indicators across Speech Engines, Triage AI, and Pharmacy networks.
- Direct support ticket submission.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19 (`react`, `react-dom`)
- **Styling**: Tailwind CSS & Glassmorphic Vanilla CSS (`index.css`)
- **Icons**: `lucide-react`
- **Effects**: `canvas-confetti`
- **Audio & Speech**: HTML5 Web Speech Recognition & SpeechSynthesis API
- **State Management**: React Context API (`HospitalContext`) with **LocalStorage Data Persistence**
- **Networking**: Offline-first resilient mock architecture (`src/services/mockApi.js`) with automatic Express backend fallback

---

## 📂 Project Structure

```
src/
├── components/
│   ├── Header.jsx                 # Top bar, Mode switch, Hamburger, Phase indicators
│   ├── Sidebar.jsx                # Navigation drawer for all hospital modules
│   ├── VoiceVisualizer.jsx        # Dynamic sound wave equalizer & mic controls
│   ├── ToastContainer.jsx         # Custom floating system notifications
│   ├── modals/
│   │   ├── VideoModal.jsx         # Clinical tutorial video player
│   │   ├── AddPatientModal.jsx    # Patient admission dialog
│   │   ├── AssignDoctorModal.jsx  # Doctor staffing dialog
│   │   └── PrescriptionModal.jsx  # Printable digital Rx card
│   └── pages/
│       ├── Dashboard/
│       │   ├── TriageModule.jsx       # Phase 01: Registry & Triage
│       │   ├── SchedulerModule.jsx    # Phase 02: Appointment Scheduler
│       │   └── PharmacyModule.jsx     # Phase 03: Pharmacy Logistics & Dispatch
│       ├── HospitalOverview.jsx   # Bed grid matrix, doctor workloads, lab toggles
│       ├── BloodDonation.jsx      # Donor registration & live donor board
│       ├── EmergencyCenter.jsx    # Hotlines & Code Red broadcast
│       ├── HelpCenter.jsx         # Interactive FAQ & ticket submission
│       └── AboutPage.jsx          # Hospital vision & leadership profile
├── context/
│   └── HospitalContext.jsx        # Centralized state with LocalStorage sync
├── hooks/
│   └── useAiVoiceFlow.js          # Speech recognition event routing
├── services/
│   ├── mockApi.js                 # Resilient offline-first clinical engine
│   └── speechService.js           # Single-instance Speech Recognition & TTS engine
├── App.js                         # Root layout and view coordinator
├── index.css                      # Global styles, fonts, and scrollbars
└── index.js                       # React 19 DOM root mount
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Start the Development Server
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 👨‍⚕️ Author & Leadership
- **Chief Medical Officer & Founder**: Dr. Sriram Chityala
- **Platform**: CareConnect v7.0 (Adilabad Central Hospital / Hyderabad)
