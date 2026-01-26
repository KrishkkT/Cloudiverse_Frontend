import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import AuthProvider from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import CaptchaGate from './components/CaptchaGate';   // ✅ added

import './App.css';

// Lazy pages
const PremiumLogin = React.lazy(() => import('./pages/PremiumLogin'));
const PremiumSignup = React.lazy(() => import('./pages/PremiumSignup'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const WorkspaceSelector = React.lazy(() => import('./pages/WorkspaceSelector'));
const WorkspaceCanvas = React.lazy(() => import('./pages/WorkspaceCanvas'));
const CloudComparison = React.lazy(() => import('./pages/CloudComparison'));
const TerraformViewer = React.lazy(() => import('./pages/TerraformViewer'));
const CostEstimation = React.lazy(() => import('./pages/CostEstimation'));
const NewWorkspace = React.lazy(() => import('./pages/NewWorkspace'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));
const WorkspaceSettings = React.lazy(() => import('./pages/WorkspaceSettings'));
const ReportDownloadPage = React.lazy(() => import('./pages/ReportDownloadPage'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Docs = React.lazy(() => import('./pages/Docs'));

// Static
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Security = React.lazy(() => import('./pages/Security'));
const Compliance = React.lazy(() => import('./pages/Compliance'));
const Feedback = React.lazy(() => import('./pages/Feedback'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  const [captchaVerified, setCaptchaVerified] = useState(false);

  return (
    <AuthProvider>

      {/* Always-on captcha gate */}
      {!captchaVerified && (
        <CaptchaGate onVerified={() => setCaptchaVerified(true)} />
      )}

      {captchaVerified && (
        <>
          <ToastContainer position="top-right" autoClose={3000} theme="colored" />

          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<LoadingFallback />}>

              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/docs/:section?" element={<Docs />} />

                {/* Static Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/security" element={<Security />} />
                <Route path="/compliance" element={<Compliance />} />
                <Route path="/feedback" element={<Feedback />} />

                {/* Auth */}
                <Route path="/login" element={<AuthLayout><PremiumLogin /></AuthLayout>} />
                <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
                <Route path="/signup" element={<AuthLayout><PremiumSignup /></AuthLayout>} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected App */}
                <Route path="/workspaces" element={<ProtectedRoute><WorkspaceSelector /></ProtectedRoute>} />
                <Route path="/report-download/:workspaceId" element={<ProtectedRoute><ReportDownloadPage /></ProtectedRoute>} />
                <Route path="/workspace/new" element={<ProtectedRoute><NewWorkspace /></ProtectedRoute>} />
                <Route path="/workspace/:id" element={<WorkspaceCanvas />} />
                <Route path="/workspace/:id/settings" element={<WorkspaceSettings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />

                {/* Layout routes */}
                <Route path="/comparison/:projectId" element={
                  <div style={{ display: 'flex', width: '100%' }}>
                    <Sidebar />
                    <div className="app-main">
                      <Navbar />
                      <main className="app-content">
                        <CloudComparison />
                      </main>
                    </div>
                  </div>
                } />

                <Route path="/terraform/:projectId" element={
                  <div style={{ display: 'flex', width: '100%' }}>
                    <Sidebar />
                    <div className="app-main">
                      <Navbar />
                      <main className="app-content">
                        <TerraformViewer />
                      </main>
                    </div>
                  </div>
                } />

                <Route path="/cost/:projectId" element={
                  <div style={{ display: 'flex', width: '100%' }}>
                    <Sidebar />
                    <div className="app-main">
                      <Navbar />
                      <main className="app-content">
                        <CostEstimation />
                      </main>
                    </div>
                  </div>
                } />

              </Routes>

            </Suspense>
          </Router>
        </>
      )}

    </AuthProvider>
  );
}

export default App;
