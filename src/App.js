import React from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { useAiVoiceFlow } from './hooks/useAiVoiceFlow';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VoiceVisualizer from './components/VoiceVisualizer';
import ToastContainer from './components/ToastContainer';

// Modals
import VideoModal from './components/modals/VideoModal';
import AddPatientModal from './components/modals/AddPatientModal';
import AssignDoctorModal from './components/modals/AssignDoctorModal';
import PrescriptionModal from './components/modals/PrescriptionModal';
import VoiceHelpModal from './components/modals/VoiceHelpModal';
import TeleconsultModal from './components/modals/TeleconsultModal';
import BillingModal from './components/modals/BillingModal';

// Pages
import TriageModule from './components/pages/Dashboard/TriageModule';
import SchedulerModule from './components/pages/Dashboard/SchedulerModule';
import PharmacyModule from './components/pages/Dashboard/PharmacyModule';
import HospitalOverview from './components/pages/HospitalOverview';
import BloodDonation from './components/pages/BloodDonation';
import EmergencyCenter from './components/pages/EmergencyCenter';
import HelpCenter from './components/pages/HelpCenter';
import AboutPage from './components/pages/AboutPage';
import PatientRecords from './components/pages/PatientRecords';
import PharmacyInventory from './components/pages/PharmacyInventory';

function MainAppContent() {
    const { activePage } = useHospital();

    // Activate voice recognition event routing
    useAiVoiceFlow();

    return (
        <div className="min-h-screen bg-[#030303] text-zinc-300 font-sans p-4 sm:p-6 md:p-8 flex flex-col gap-6 max-w-[1700px] mx-auto">
            {/* Notifications & System Toast System */}
            <ToastContainer />

            {/* Top Navigation Bar */}
            <Header />

            {/* Slide-out Navigation Drawer */}
            <Sidebar />

            {/* Active View Routing */}
            <main className="flex-1 flex flex-col">
                {activePage === "dashboard" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-stretch">
                        {/* Phase 01: Registry & Triage */}
                        <TriageModule />

                        {/* Phase 02: Appointment Scheduler */}
                        <SchedulerModule />

                        {/* Phase 03: Logistics & Pharmacy */}
                        <PharmacyModule />
                    </div>
                )}

                {activePage === "records" && <PatientRecords />}
                {activePage === "inventory" && <PharmacyInventory />}
                {activePage === "hospitalDashboard" && <HospitalOverview />}
                {activePage === "blood" && <BloodDonation />}
                {activePage === "emergency" && <EmergencyCenter />}
                {activePage === "help" && <HelpCenter />}
                {activePage === "about" && <AboutPage />}
            </main>

            {/* Global AI Voice Assistant Feedback Bar */}
            <VoiceVisualizer />

            {/* Overlay Dialogs & Modals */}
            <VideoModal />
            <AddPatientModal />
            <AssignDoctorModal />
            <PrescriptionModal />
            <VoiceHelpModal />
            <TeleconsultModal />
            <BillingModal />
        </div>
    );
}

export default function App() {
    return (
        <HospitalProvider>
            <MainAppContent />
        </HospitalProvider>
    );
}