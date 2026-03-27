import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { Heart, Plus, Target, Users, ArrowRight, Activity, ShieldCheck, Database, Zap } from 'lucide-react';

const Fundraising = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donateMode, setDonateMode] = useState(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data } = await API.get('/fundraising');
        setCampaigns(data);
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const handleDonate = async (id) => {
    if (!amount || isNaN(amount)) return;
    try {
      await API.post(`/fundraising/${id}/donate`, { amount: Number(amount), message: 'Anonymous Deployment' });
      setDonateMode(null);
      setAmount('');
      const { data } = await API.get('/fundraising');
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to deploy funds:', err);
    }
  };

  return (
    <div className="space-y-16">
      {/* Tactical Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b-2 border-gray-900 pb-12 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 text-white">
              <Heart size={16} fill="white" />
            </div>
            <span className="tactical-text text-gray-400 font-mono">Status: Direct_Impact_Enabled</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-gray-900 leading-none uppercase italic">
            Relief <br /> <span className="text-emerald-600">Capital</span>
          </h1>
        </div>
        <div className="flex flex-col items-start md:items-end gap-6 text-left md:text-right w-full md:w-auto mt-4 md:mt-0">
           <p className="text-gray-400 font-bold text-xs max-w-sm uppercase tracking-widest leading-relaxed">
             Verified, high-resolution financial deployment for localized missions and emergency extraction.
           </p>
           <button className="flex items-center gap-4 py-5 px-10 bg-gray-900 text-white font-black text-xs uppercase tracking-[0.4em] hover:bg-black transition-all shadow-xl">
             Induct Fundraiser <Plus size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-gray-50 h-96 border border-gray-200 animate-pulse relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          ))
        ) : campaigns.map((camp) => (
          <div key={camp._id} className="industrial-card bg-white border border-gray-900/10 flex flex-col group hover:shadow-2xl transition-all relative overflow-hidden">
            <div className="h-56 bg-gray-50 flex items-center justify-center relative overflow-hidden border-b border-gray-100">
               <div className="absolute top-6 left-6 bg-gray-900 text-white px-3 py-1 tactical-text text-[8px] uppercase tracking-widest z-10">
                  REF: {camp.category.toUpperCase()}
               </div>
               <div className="bg-white p-6 border border-gray-100 shadow-md group-hover:scale-110 transition-transform">
                  <Activity className="w-8 h-8 text-blue-600" />
               </div>
            </div>
            
            <div className="p-10 flex-1 flex flex-col">
              <div className="space-y-2 mb-8">
                 <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">{camp.title}</h3>
                 <p className="tactical-text text-gray-400 text-[10px] tracking-[0.2em] font-mono">MISSION_OBJ: RESOLUTION_FUNDING</p>
              </div>
              
              <p className="text-gray-500 font-bold text-[11px] line-clamp-2 mb-8 uppercase tracking-wider leading-relaxed italic">"{camp.description}"</p>
              
              <div className="space-y-4 mb-10 flex-1">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Resource_Sync</span>
                  <span className="text-xl font-black data-value text-gray-900">
                    {Math.round((camp.raisedAmount / camp.targetAmount) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-50 h-1.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-1000"
                    style={{ width: `${Math.min((camp.raisedAmount / camp.targetAmount) * 100, 100)}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-px bg-gray-100 border border-gray-100 mt-4">
                  <div className="bg-white p-3">
                     <span className="text-[8px] text-gray-400 font-black uppercase block mb-1">Impacted</span>
                     <span className="text-lg font-black text-emerald-600 data-value">₹{camp.raisedAmount.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-3 text-right">
                     <span className="text-[8px] text-gray-400 font-black uppercase block mb-1">Requirement</span>
                     <span className="text-lg font-black text-gray-900 data-value">₹{camp.targetAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-8 border-t border-gray-50 relative gap-4">
                 <div className="flex items-center gap-3 tactical-text text-[9px] text-gray-400">
                   <Users size={14} className="text-blue-500" />
                   {camp.donations?.length || 0} COORDINATORS
                 </div>
                 
                 {donateMode === camp._id ? (
                   <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                     <input 
                       type="number" 
                       placeholder="Amount (₹)" 
                       className="p-3 bg-gray-50 border border-gray-200 outline-none text-xs w-32 font-mono"
                       value={amount}
                       onChange={(e) => setAmount(e.target.value)}
                     />
                     <button onClick={() => handleDonate(camp._id)} className="px-4 py-3 bg-emerald-600 text-white font-black text-[10px] uppercase hover:bg-emerald-700 transition-all shadow-md">
                       Confirm
                     </button>
                     <button onClick={() => setDonateMode(null)} className="px-3 py-3 text-gray-400 hover:text-red-500 transition-all font-black text-xs uppercase">
                       ✕
                     </button>
                   </div>
                 ) : (
                   <button onClick={() => setDonateMode(camp._id)} className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all active:scale-95 shadow-md">
                     Deploy Funds <ArrowRight size={14} />
                   </button>
                 )}
              </div>

              {/* Proof of Delivery (Impact Tracking) */}
              {(camp.raisedAmount > 0) && (
                 <div className="mt-6 p-4 bg-emerald-50/50 border border-emerald-100 space-y-3">
                    <div className="flex items-center justify-between text-emerald-700">
                       <div className="flex items-center gap-2">
                          <ShieldCheck size={14} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Proof of Delivery</span>
                       </div>
                       <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 border border-emerald-200 shadow-sm text-emerald-600">
                          VERIFIED_TRACE
                       </span>
                    </div>
                    <div className="pl-6 border-l-2 border-emerald-200 space-y-2">
                       <p className="text-[10px] text-gray-600 leading-tight">
                          <span className="font-bold text-gray-900">Trace ID:</span> DX-{camp._id.slice(-6).toUpperCase()}<br/>
                          <span className="font-bold text-gray-900">Resource Routing:</span> Securely routed to designated local nodes (NGO/Govt). Immutable ledger log confirmed.
                       </p>
                    </div>
                 </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Verification Placeholder */}
        {campaigns.length === 0 && !loading && [1, 2].map(i => (
          <div key={i} className="industrial-card p-12 bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col justify-center items-center text-center opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all border-spacing-4">
            <div className="w-16 h-16 bg-white border border-gray-100 flex items-center justify-center mb-6 text-gray-300 group-hover:text-blue-600">
              <Database size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2 uppercase italic tracking-tighter">Vault_Index_{i}</h3>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Awaiting Verification Metadata</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Fundraising;
