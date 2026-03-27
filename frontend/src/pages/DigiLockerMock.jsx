import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, CheckCircle, Smartphone, ArrowRight, Database, Globe, Building2, Key, Info } from 'lucide-react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const DigiLockerMock = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = React.useContext(AuthContext);
  const navigate = useNavigate();

  // PRODUCTION GOVT REDIRECT FLOW
  const handleDigiLockerLogin = () => {
    setLoading(true);
    
    const clientId = import.meta.env.VITE_DIGILOCKER_CLIENT_ID || 'AIDSPHERE_HACKATHON_DEMO';
    // This MUST match the callback URI registered in DigiLocker Partner Portal exactly
    const redirectUri = encodeURIComponent(`${window.location.origin}/digilocker-sync`);
    
    // Redirect entirely away from AidSphere to Government Identity Portal
    const authUrl = `https://entity.digilocker.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${clientId}&state=UNIQUE_SESSION_${Date.now()}&redirect_uri=${redirectUri}`;
    
    window.location.href = authUrl;
  };

  // Safe fallback for presentation if DigiLocker keys aren't approved yet
  const handleBypassSimulation = () => {
    navigate('/digilocker-sync?code=HACKATHON_BYPASS_2026');
  };

  const finalizeSync = async () => {
    setLoading(true);
    try {
      // Backend should verify the OAuth code/token here
      const { data } = await API.put('/auth/verify-digilocker'); 
      updateUser({ isVerified: true, trustLevel: 'silver' });
      setStep(3);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <div className="industrial-card p-12 space-y-10 relative bg-white border-t-4 border-gray-900">
        
        <div className="flex justify-between items-start">
           <div className="space-y-1">
              <h1 className="text-3xl font-black uppercase tracking-tighter italic">Identity Gateway</h1>
              <p className="tactical-text text-gray-400">Step 2: Compulsory Government Trust Linking</p>
           </div>
           <Building2 size={32} className="text-gray-900" />
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-500">
             
             {/* Data Linking Visualizer */}
             <div className="p-6 bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div className="space-y-1">
                   <p className="text-[9px] font-black tracking-widest uppercase text-gray-400">AidSphere Registration Context</p>
                   <p className="text-lg font-black text-gray-900 uppercase tracking-tighter">{user?.name || 'SYNCING_IDENTITY...'}</p>
                   <p className="text-xs font-mono font-bold text-gray-500">{user?.phone || '+91-XXXXXXXXXX'} | {user?.email || 'N/A'}</p>
                </div>
                <Database size={24} className="text-gray-300" />
             </div>

            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-6 space-y-4">
               <div className="flex items-center gap-3">
                  <Key size={18} className="text-blue-600" />
                  <span className="tactical-text text-gray-900">Production Integration Requirements</span>
               </div>
               <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase tracking-widest">
                  To establish a REAL connection, register at <a href="https://partners.digitallocker.gov.in/" className="text-blue-600 border-b border-blue-200">partners.digitallocker.gov.in</a> and obtain your <span className="text-gray-900">DIGILOCKER_CLIENT_ID</span> and <span className="text-gray-900">SECRET_KEY</span>.
               </p>
            </div>
            
            <div className="p-8 border border-gray-100 flex flex-col items-center gap-6 text-center">
               <ShieldCheck size={48} className="text-gray-300" />
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                  Synchronize your National ID vault to unlock Responder-grade Mission Access.
               </p>
            </div>

            <div className="flex flex-col gap-4">
               <button 
                 onClick={handleDigiLockerLogin}
                 disabled={loading}
                 className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-xl"
               >
                 {loading ? 'Routing to Govt Gateway...' : 'Login via DigiLocker (Real)'} 
                 <ArrowRight size={18} />
               </button>
               
               <button 
                 onClick={handleBypassSimulation}
                 disabled={loading}
                 className="w-full py-4 bg-gray-900 border border-gray-100 hover:bg-black hover:border-gray-900 text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
               >
                 Use Hackathon Bypass Demo 
               </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="p-6 bg-emerald-50 border-l-4 border-emerald-600 space-y-2">
               <h3 className="tactical-text text-emerald-900">Gateway Response Received</h3>
               <p className="text-[9px] font-mono text-emerald-600 uppercase tracking-tighter italic">AUTH_CODE: 0x8A22F...SYNC_PENDING</p>
            </div>

            <div className="space-y-4">
               <p className="tactical-text text-gray-400">Synchronizing Vault Metadata:</p>
               <div className="p-4 border border-gray-100 space-y-3">
                  {['Aadhaar_ID_Primary', 'Volunteers_License_Cert'].map(doc => (
                    <div key={doc} className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-600">
                       <span>{doc}</span>
                       <span className="text-emerald-500 font-black tracking-widest">[OK]</span>
                    </div>
                  ))}
               </div>
            </div>

            <button 
              onClick={finalizeSync}
              className="w-full py-5 bg-gray-900 text-white font-black text-xs uppercase tracking-[0.4em] hover:bg-black transition-all"
            >
              {loading ? 'Finalizing Trust Link...' : 'Capture & Synchronize Data'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="py-12 text-center space-y-8 animate-in zoom-in-95">
             <div className="flex justify-center">
                <div className="p-6 border-4 border-gray-900">
                   <ShieldCheck size={80} className="text-gray-900" />
                </div>
             </div>
             <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tighter italic">Identity Established</h2>
                <div className="inline-block px-4 py-1 bg-gray-900 text-white tactical-text text-[8px]">Unit Trust: LEVEL_SILVER</div>
             </div>
          </div>
        )}

        <div className="pt-8 border-t border-gray-100 flex justify-between items-center tactical-text text-[9px] text-gray-300">
           <div className="flex items-center gap-2"><Lock size={12} /> Endpoint Security: Encrypted</div>
           <div>Ref: AD_2026_GATEWAY_V1</div>
        </div>
      </div>
    </div>
  );
};
export default DigiLockerMock;
