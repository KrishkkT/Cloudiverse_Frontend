import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PremiumLogin from './pages/PremiumLogin';
import PremiumSignup from './pages/PremiumSignup';
import Register from './pages/Register';
import WorkspaceSelector from './pages/WorkspaceSelector';
import MockWorkflowWorkspace from './pages/MockWorkflowWorkspace';
import CloudComparison from './pages/CloudComparison';
import TerraformViewer from './pages/TerraformViewer';
import CostEstimation from './pages/CostEstimation';
import NewWorkspace from './pages/NewWorkspace';
import Profile from './pages/Profile';
import WorkspaceSettings from './pages/WorkspaceSettings';
import LandingPage from './pages/LandingPage';
import Docs from './pages/Docs';
import Blog from './pages/Blog';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthProvider from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/blog" element={<Blog />} />
          
          {/* Authentication routes without sidebar */}
          <Route path="/login" element={<AuthLayout><PremiumLogin /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
          <Route path="/signup" element={<AuthLayout><PremiumSignup /></AuthLayout>} />
          
          {/* Application routes with sidebar */}
          <Route path="/workspaces" element={
            <div className="min-h-screen bg-background">
              <WorkspaceSelector />
            </div>
          } />
          <Route path="/workspace/new" element={<NewWorkspace />} />
          <Route path="/workspace/:id" element={<MockWorkflowWorkspace />} />
          <Route path="/workspace/:id/settings" element={<WorkspaceSettings />} />
          <Route path="/profile" element={<Profile />} />
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
      </Router>
    </AuthProvider>
  );
}

export default App;