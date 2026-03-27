import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, User, Mail, Phone, Award, ShieldAlert, Activity, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Account = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-8">
      {/* Tactical Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 justify-between border-b border-gray-100 pb-12">
        <div className="flex items-center gap-6">
           <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
             <User size={36} />
           </div>
           <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">{user.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                 <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest">{user.role}</span>
                 <span className="text-[10px] font-mono text-gray-400">ID_REF: {user._id.slice(-8).toUpperCase()}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Identity Matrix */}
         <div className="md:col-span-2 space-y-8">
            <div className="industrial-card p-10 bg-white">
               <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                 <Activity className="text-blue-600" size={24} /> Identity Matrix
               </h3>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Mail size={14} /> Encrypted COMMS</p>
                     <p className="text-lg font-bold text-gray-900">{user.email}</p>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Phone size={14} /> Secure Line</p>
                     <p className="text-lg font-bold text-gray-900 font-mono">{user.phone || 'UNASSIGNED'}</p>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Clock size={14} /> Time in Service</p>
                     <p className="text-sm font-bold text-gray-900">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
               </div>
            </div>

            {/* Verification Status */}
            <div className={`industrial-card p-10 border-l-8 ${user.isVerified ? 'border-emerald-500 bg-emerald-50/50' : 'border-amber-500 bg-amber-50/50'}`}>
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="space-y-2">
                     <div className="flex items-center gap-3">
                        {user.isVerified ? <ShieldCheck className="text-emerald-600" size={24} /> : <ShieldAlert className="text-amber-600" size={24} />}
                        <h4 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">DigiLocker Status</h4>
                     </div>
                     <p className="text-sm font-medium text-gray-600 max-w-md">
                        {user.isVerified 
                          ? "Your identity has been cryptographically secured and verified by national systems." 
                          : "Your account is active but restricted. Verify with DigiLocker to unlock critical deployment areas."}
                     </p>
                  </div>
                  
                  {!user.isVerified && (
                     <Link to="/verify-digilocker" className="px-6 py-4 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl whitespace-nowrap">
                        Initiate Verification
                     </Link>
                  )}
                  {user.isVerified && (
                     <div className="px-6 py-4 bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase tracking-widest border border-emerald-200 flex items-center gap-2">
                        <CheckCircle size={14} /> Verified Matrix
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Trust Sidebar */}
         <div className="space-y-8">
            <div className="industrial-card p-8 bg-gray-900 text-white space-y-8">
               <h4 className="tactical-text text-gray-400">Clearance Level</h4>
               <div className="flex flex-col items-center justify-center p-8 border border-gray-800 bg-black/50">
                  <Award size={48} className={
                     user.trustLevel === 'gold' ? 'text-amber-400' : 
                     user.trustLevel === 'silver' ? 'text-gray-300' : 'text-blue-500'
                  } />
                  <span className="text-3xl font-black uppercase mt-4 tracking-tighter">{user.trustLevel || 'STANDARD'}</span>
                  <span className="text-[9px] font-mono text-gray-500 mt-2">OPERATIONAL_RANKING</span>
               </div>
               <p className="text-xs font-medium text-gray-400 leading-relaxed italic text-center">
                  Trust levels dictate operational boundaries. Higher ranks are assigned complex missions.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Account;
