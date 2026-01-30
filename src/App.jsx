import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import AuthProvider from './context/AuthContext'; // Fixed: Default import

// Components
import CaptchaGate from './components/CaptchaGate'; // Restoring Turnstile
import AuthGuard from './components/AuthGuard'; // New: Protects routes

// Layouts
import AuthLayout from './layouts/AuthLayout';

// Pages
import LandingPage from './pages/LandingPage';
import PremiumLogin from './pages/PremiumLogin';
import PremiumSignup from './pages/PremiumSignup';
import ForgotPassword from './pages/ForgotPassword';

// Workspace / Dashboard
import WorkspaceSelector from './pages/WorkspaceSelector';
import NewWorkspace from './pages/NewWorkspace';
import WorkspaceCanvas from './pages/WorkspaceCanvas';
import Settings from './pages/Settings';
import CostEstimation from './pages/CostEstimation';
import TerraformViewer from './pages/TerraformViewer';
import ReportDownloadPage from './pages/ReportDownloadPage';
import CloudComparison from './pages/CloudComparison';
import WorkspaceSettings from './pages/WorkspaceSettings';

// Static Pages
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Compliance from './pages/Compliance';
import Security from './pages/Security';
import ServicePolicy from './pages/ServicePolicy';
import CancellationRefunds from './pages/CancellationRefunds';
import Docs from './pages/Docs';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';

function App() {
    const [isHuman, setIsHuman] = useState(false);

    const handleVerified = (token) => {
        // Verified
        setIsHuman(true);
        sessionStorage.setItem('captcha-verified', 'true');
    };

    // Only show Captcha on Homepage
    const isHomePage = window.location.pathname === '/';

    if (!isHuman && isHomePage) {
        return <CaptchaGate onVerified={handleVerified} />;
    }

    return (
        <Router>
            <AuthProvider>
                <ToastContainer position="top-right" autoClose={3000} theme="dark" />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Auth Routes */}
                    <Route path="/login" element={<AuthLayout><PremiumLogin /></AuthLayout>} />
                    <Route path="/signup" element={<AuthLayout><PremiumSignup /></AuthLayout>} />
                    <Route path="/register" element={<AuthLayout><PremiumSignup /></AuthLayout>} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* Workspace Routes */}
                    <Route path="/workspaces" element={<AuthGuard><WorkspaceSelector /></AuthGuard>} />
                    <Route path="/workspaces/new" element={<AuthGuard><NewWorkspace /></AuthGuard>} />
                    <Route path="/workspaces/:id" element={<AuthGuard><WorkspaceCanvas /></AuthGuard>} />

                    {/* Workspace Specific Feature Routes */}
                    <Route path="/workspaces/:id/cost" element={<AuthGuard><CostEstimation /></AuthGuard>} />
                    <Route path="/workspaces/:id/terraform" element={<AuthGuard><TerraformViewer /></AuthGuard>} />
                    <Route path="/workspaces/:id/report" element={<AuthGuard><ReportDownloadPage /></AuthGuard>} />
                    <Route path="/workspaces/:id/settings" element={<AuthGuard><WorkspaceSettings /></AuthGuard>} />

                    {/* User Settings */}
                    <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
                    <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />

                    {/* Static Pages */}
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/compliance" element={<Compliance />} />
                    <Route path="/security" element={<Security />} />
                    <Route path="/service-policy" element={<ServicePolicy />} />
                    <Route path="/cancellation-refunds" element={<CancellationRefunds />} />
                    <Route path="/docs" element={<Docs />} />
                    <Route path="/feedback" element={<AuthGuard><Feedback /></AuthGuard>} />
                    <Route path="/cloud-comparison" element={<CloudComparison />} />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
