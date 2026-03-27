import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';

const DigiLockerSync = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState('');
  const { updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      syncIdentity(code);
    } else {
      setStatus('error');
      setError('Uplink Code Missing');
    }
  }, [searchParams]);

  const syncIdentity = async (code) => {
    setStatus('syncing');
    try {
      // Exchange code for user details via backend verification endpoint
      await API.put('/auth/verify-digilocker', { code });
      
      setStatus('verified');
      // Force state sync
      await updateUser({ isVerified: true, trustLevel: 'silver' });
      
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError(err.response?.data?.message || 'DigiLocker Node Refused Connection');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
      <div className="industrial-card p-12 max-w-lg w-full bg-white space-y-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
        
        {status === 'initializing' || status === 'syncing' ? (
          <>
            <div className="bg-blue-50 w-20 h-20 flex items-center justify-center mx-auto rounded-full border-2 border-dashed border-blue-400">
               <RefreshCw className="text-blue-600 animate-spin" size={32} />
            </div>
            <div className="space-y-2">
               <h2 className="text-2xl font-black uppercase tracking-tighter italic">Identity Handshake</h2>
               <p className="tactical-text text-gray-400">Exchanging Credentials with NeGD Gateway...</p>
            </div>
          </>
        ) : status === 'verified' ? (
          <>
            <div className="bg-emerald-600 w-20 h-20 flex items-center justify-center mx-auto shadow-xl shadow-emerald-100">
               <ShieldCheck className="text-white" size={32} />
            </div>
            <div className="space-y-2">
               <h2 className="text-2xl font-black uppercase tracking-tighter italic text-emerald-600">Verified & Inducted</h2>
               <p className="tactical-text text-gray-400">Redirecting to Mission Control...</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-red-50 w-20 h-20 flex items-center justify-center mx-auto rounded-full">
               <AlertCircle className="text-red-600" size={32} />
            </div>
            <div className="space-y-2">
               <h2 className="text-2xl font-black uppercase tracking-tighter italic text-red-600">Uplink Terminated</h2>
               <p className="tactical-text text-gray-400">{error}</p>
            </div>
            <button 
              onClick={() => navigate('/signup')}
              className="mt-6 px-8 py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
            >
              Back to Induction
            </button>
          </>
        )}
        
        <div className="pt-8 border-t border-gray-100 mt-8">
           <div className="flex justify-center gap-6 opacity-30 grayscale">
              <img src="https://www.digilocker.gov.in/assets/img/logo.png" alt="DigiLocker" className="h-4" />
              <img src="https://upload.wikimedia.org/wikipedia/en/thumb/f/ff/Digital_India_logo.svg/1200px-Digital_India_logo.svg.png" alt="Digital India" className="h-4" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default DigiLockerSync;
