import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { Heart, Plus, Target, Users, ArrowRight, Activity, ShieldCheck, Database, Zap, TrendingUp, Globe2, RefreshCw } from 'lucide-react';

const Fundraising = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donateMode, setDonateMode] = useState(null);
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

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

  const filteredCampaigns = selectedCategory === 'ALL' 
    ? campaigns 
    : campaigns.filter(c => c?.category?.toUpperCase() === selectedCategory);

  const categories = ['ALL', ...new Set(campaigns.map(c => c?.category?.toUpperCase()).filter(Boolean))];

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      
      {/* Immersive Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gray-950 p-12 md:p-20 shadow-2xl">
         {/* Background Dynamic Gradients */}
         <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-gray-900 to-blue-900/40 opacity-80 pointer-events-none" />
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/3 animate-pulse pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/20 blur-[100px] rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl space-y-6">
               <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                 <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">Global Relief Capital</span>
               </div>
               
               <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                 Fund the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Frontlines.</span>
               </h1>
               
               <p className="text-gray-400 text-lg leading-relaxed font-medium">
                 Deploy verified financial resources directly to critical disaster zones. Every transaction is transparently routed via immutable ledgers.
               </p>
               
               <div className="flex gap-4 pt-4">
                  <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-sm uppercase tracking-widest rounded-full transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center gap-3">
                    Induct Campaign <Plus size={18} />
                  </button>
                  <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-full transition-all border border-white/10 backdrop-blur-md flex items-center gap-3">
                     View Impact <Globe2 size={18} />
                  </button>
               </div>
            </div>
            
            {/* Live Stats Glass Widget */}
            <div className="hidden lg:flex w-80 flex-col gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
               <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Network Liquidity</span>
                  <Activity size={16} className="text-emerald-400" />
               </div>
               <div className="space-y-1">
                  <div className="text-4xl font-black text-white">
                     ₹{campaigns.reduce((acc, c) => acc + c.raisedAmount, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-emerald-400 font-medium tracking-wide flex items-center gap-2">
                     <TrendingUp size={12} /> Total Capital Deployed
                  </p>
               </div>
               <div className="mt-4 p-4 rounded-xl bg-gray-900/50 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                     <Users size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">{campaigns.length} Active Nodes</div>
                    <div className="text-xs text-gray-400">Verified extraction missions</div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Dynamic Filters */}
      <div className="flex flex-wrap gap-3 px-2">
         {categories.map(cat => (
           <button 
             key={cat}
             onClick={() => setSelectedCategory(cat)}
             className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
               selectedCategory === cat 
               ? 'bg-slate-900 text-white shadow-md scale-105' 
               : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400 hover:text-slate-800'
             }`}
           >
             {cat}
           </button>
         ))}
      </div>

      {/* Campaign Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-2">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-3xl h-[500px] border border-gray-100 flex items-center justify-center">
               <RefreshCw className="text-gray-300 animate-spin" size={40} />
            </div>
          ))
        ) : filteredCampaigns.map((camp) => {
          const progress = Math.min((camp.raisedAmount / camp.targetAmount) * 100, 100);
          const isFunded = progress >= 100;

          return (
            <div key={camp._id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden relative translate-y-0 hover:-translate-y-2">
              
              {/* Card Image Header */}
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10" />
                 
                 {/* Status Badge */}
                 <div className="absolute top-4 left-4 z-20">
                    <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-lg backdrop-blur-md ${isFunded ? 'bg-emerald-500/80 border-emerald-400/50' : 'bg-blue-600/80 border-blue-400/50'} border`}>
                       {isFunded ? <ShieldCheck size={12}/> : <Target size={12}/>}
                       {isFunded ? 'Objective Secured' : (camp?.category || 'General')}
                    </div>
                 </div>

                 {/* Decorative Background */}
                 <div className="absolute inset-0 opacity-20 group-hover:scale-110 transition-transform duration-700 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" style={{ backgroundSize: '10px' }} />
              </div>
              
              {/* Card Body */}
              <div className="p-8 flex-1 flex flex-col z-20 bg-white relative">
                <div className="space-y-3 mb-6">
                   <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-snug group-hover:text-emerald-600 transition-colors">{camp.title}</h3>
                   <p className="text-slate-500 font-medium text-sm line-clamp-2 leading-relaxed">{camp.description}</p>
                </div>
                
                {/* Progress Visualizer */}
                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Sync State</span>
                    <span className={`text-2xl font-black data-value ${isFunded ? 'text-emerald-500' : 'text-slate-900'}`}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shrink-0">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${isFunded ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                      style={{ width: `${progress}%` }}
                    >
                       <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Impacted</span>
                       <span className="text-lg font-black text-emerald-600">₹{camp.raisedAmount.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Target</span>
                       <span className="text-lg font-black text-slate-900">₹{camp.targetAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Donation Action Center */}
                <div className="pt-6 border-t border-slate-100 mt-auto">
                   {donateMode === camp._id ? (
                     <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-2 fade-in">
                       <input 
                         type="number" 
                         placeholder="Pledge Amount (₹)" 
                         className="p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm w-full font-mono font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                         value={amount}
                         onChange={(e) => setAmount(e.target.value)}
                         autoFocus
                       />
                       <div className="flex gap-2">
                         <button onClick={() => handleDonate(camp._id)} className="flex-1 px-4 py-4 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                           Deploy Now
                         </button>
                         <button onClick={() => setDonateMode(null)} className="px-6 py-4 bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-all font-black">
                           ✕
                         </button>
                       </div>
                     </div>
                   ) : (
                     <button 
                       onClick={() => { console.log('Fundraising: Trigger Pledge'); setDonateMode(camp?._id); }} 
                       className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative z-30 ${
                         isFunded 
                         ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                         : 'bg-slate-900 text-white hover:bg-black hover:shadow-xl hover:shadow-slate-900/20 active:scale-95'
                       }`}
                     >
                       {isFunded ? 'Fully Backed' : 'Pledge Capital'} 
                       {!isFunded && <ArrowRight size={16} />}
                     </button>
                   )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Fundraising;
