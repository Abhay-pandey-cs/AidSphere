import React, { useState } from 'react';
import { Heart, MessageCircle, Phone, ShieldCheck, ArrowRight, Activity, Zap, Info } from 'lucide-react';

const MentalHealth = () => {
  const [comingSoon, setComingSoon] = useState(false);

  const handleAction = () => {
    setComingSoon(false); // Reset animation if clicked rapidly
    setTimeout(() => {
       setComingSoon(true);
    }, 50);
    setTimeout(() => setComingSoon(false), 4000);
  };

  const resources = [
    { title: 'Anxiety_Management_Protocol', type: 'Intel_File', time: '05 Min' },
    { title: 'Coping_with_Strategic_Loss', type: 'Guide', time: '10 Min' },
    { title: 'PTSD_Alert_Signatures', type: 'Data_Stream', time: '15 Min' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-16 relative">
      
      {/* Coming Soon Animated Toast Overlay */}
      <div 
        className={`fixed top-32 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          comingSoon ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-8 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-amber-50 border-x-4 border-amber-400 p-5 rounded-3xl shadow-2xl flex items-center gap-5 min-w-[350px]">
           <div className="p-3 bg-amber-100 text-amber-600 rounded-full animate-pulse shadow-sm">
              <Info size={24} />
           </div>
           <div>
              <h4 className="text-amber-900 font-extrabold uppercase tracking-widest text-sm">Deployment Pending</h4>
              <p className="text-amber-700 font-bold text-xs mt-1">This service is in development and is about to come online!</p>
           </div>
        </div>
      </div>

      {/* Tactical Support Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 border-b-2 border-slate-200 pb-12 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 text-white rounded-lg">
              <Heart size={16} fill="white" />
            </div>
            <span className="tactical-text text-slate-500 font-bold uppercase tracking-widest">Status: Psychological_Support_Active</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none uppercase italic border-l-8 border-l-blue-600 pl-4">
            Neural <br /> <span className="text-blue-600">Wellbeing</span>
          </h1>
        </div>
        <div className="flex flex-col items-end gap-6 text-right">
           <p className="text-slate-500 font-bold text-xs max-w-sm uppercase tracking-widest leading-relaxed">
             Consolidated psychological intelligence and trauma-recovery protocols for field units and civilians.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-12 border border-slate-200 rounded-3xl shadow-sm flex flex-col items-center text-center space-y-8 hover:shadow-2xl transition-all group">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
            <MessageCircle size={48} />
          </div>
          <div className="space-y-2">
             <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Tactical Counseling</h2>
             <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Secure 1-on-1 Intelligence Sync</p>
          </div>
          <p className="text-slate-500 font-bold text-[11px] leading-relaxed uppercase italic">
            Encrypted session link with certified trauma specialists for psychological stabilization.
          </p>
          <button 
            onClick={handleAction}
            className="w-full py-5 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.4em] hover:bg-blue-600 hover:scale-[1.02] hover:-translate-y-1 transition-all shadow-xl"
          >
            Initialize Chat Link
          </button>
        </div>

        <div className="bg-white p-12 border border-slate-200 rounded-3xl shadow-sm flex flex-col items-center text-center space-y-8 hover:shadow-2xl transition-all group">
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
            <Phone size={48} />
          </div>
          <div className="space-y-2">
             <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Crisis Uplink</h2>
             <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">24/7 Rapid Response Audio/Video</p>
          </div>
          <p className="text-slate-500 font-bold text-[11px] leading-relaxed uppercase italic">
            Immediate psychological stabilization via verified responders. Zero latency entry.
          </p>
          <button 
            onClick={handleAction}
            className="w-full py-5 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.4em] hover:bg-emerald-700 hover:scale-[1.02] hover:-translate-y-1 transition-all shadow-xl shadow-emerald-900/10"
          >
            Establish Audio Link
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl text-white p-12 border-l-[12px] border-l-blue-600 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-blue-500">
           <Activity size={180} />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 max-w-md">
             <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-blue-500" />
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Verified Intel Deposit</span>
             </div>
             <h2 className="text-4xl font-black uppercase italic tracking-tighter">Self-Stabilization Toolkit</h2>
             <p className="text-slate-400 font-bold text-xs leading-relaxed uppercase tracking-widest italic border-l-4 border-slate-800 pl-4">
                Distributed recovery protocols for decentralized psychological management.
             </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
             {resources.map((res, i) => (
               <div 
                  key={i} 
                  onClick={handleAction}
                  className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 hover:-translate-y-1 transition-all cursor-pointer group border border-white/5 hover:border-blue-500/30"
               >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{res.type} // {res.time}</span>
                    <Zap size={14} className="text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-xs text-white font-black uppercase flex items-center justify-between gap-4 tracking-tight">
                    {res.title}
                    <ArrowRight size={14} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
                  </h4>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalHealth;
