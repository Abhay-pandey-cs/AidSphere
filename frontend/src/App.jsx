import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ShieldAlert, Heart, MapPin, ShieldCheck, Award, AlertCircle, ArrowRight, User, Users, LayoutDashboard, RefreshCw } from 'lucide-react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RaiseSOS from './pages/RaiseSOS';
import DisasterMap from './pages/DisasterMap';
import AdminDashboard from './pages/AdminDashboard';
import Fundraising from './pages/Fundraising';
import MentalHealth from './pages/MentalHealth';
import AdoptFamily from './pages/AdoptFamily';
import SocialMonitor from './pages/SocialMonitor';
import SOSDetail from './pages/SOSDetail';
import DigiLockerMock from './pages/DigiLockerMock';
import DigiLockerSync from './pages/DigiLockerSync';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4 z-50">
       <RefreshCw className="animate-spin text-blue-600" size={32} />
       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Synchronizing Operation Link...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/raise-sos" element={<ProtectedRoute><RaiseSOS /></ProtectedRoute>} />
              <Route path="/sos/:id" element={<ProtectedRoute><SOSDetail /></ProtectedRoute>} />
              <Route path="/map" element={<ProtectedRoute><DisasterMap /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/fundraising" element={<ProtectedRoute><Fundraising /></ProtectedRoute>} />
              <Route path="/mental-health" element={<ProtectedRoute><MentalHealth /></ProtectedRoute>} />
              <Route path="/adopt-family" element={<ProtectedRoute><AdoptFamily /></ProtectedRoute>} />
              <Route path="/social-monitor" element={<ProtectedRoute><SocialMonitor /></ProtectedRoute>} />
              <Route path="/verify-digilocker" element={<ProtectedRoute><DigiLockerMock /></ProtectedRoute>} />
              <Route path="/digilocker-sync" element={<DigiLockerSync />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/account" 
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Layout>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
