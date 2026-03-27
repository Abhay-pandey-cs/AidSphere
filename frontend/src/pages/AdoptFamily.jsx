import React from 'react';
import { Home, Users, Calendar, Award, ArrowRight, Heart, Activity, ShieldCheck, Database } from 'lucide-react';

const AdoptFamily = () => {
  const families = [
    { 
      id: 1, 
      name: 'The Sharma Family', 
      location: 'Chamoli, Uttarakhand',
      members: 4, 
      status: 'Flood_Affected',
      story: 'Recently lost their home and livelihood in the flash floods. Need support for children\'s education and basic sustenance.'
    },
    { 
      id: 2, 
      name: 'The Das Family', 
      location: 'Sundarbans, WB',
      members: 5, 
      status: 'Cyclone_Affected',
      story: 'Traditional fishers who lost their boat and home. Looking for long-term support to rebuild their life.'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Tactical Adoption Header */}
      <div className="bg-gray-900 p-16 border-l-[12px] border-l-blue-600 shadow-3xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
           <Activity size={180} />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
             <Heart size={20} className="text-blue-500 fill-blue-500" />
             <span className="tactical-text text-gray-400 uppercase tracking-widest">Mission: Long-term_Stability</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">
            Adopt-A-Family <br /> <span className="text-blue-600">Sync Link</span>
          </h1>
          <p className="tactical-text text-gray-400 max-w-2xl font-black uppercase tracking-widest leading-relaxed">
            Establishing persistent support channels for disaster-displaced residential units. Establish trust through resource allocation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {families.map((fam) => (
          <div key={fam.id} className="industrial-card bg-white border border-gray-900/10 overflow-hidden flex flex-col md:flex-row hover:shadow-2xl transition-all group">
            <div className="md:w-2/5 bg-gray-50 flex flex-col items-center justify-center p-10 border-b md:border-b-0 md:border-r border-gray-900/10">
               <div className="bg-white p-6 border border-gray-100 shadow-md mb-6 group-hover:scale-110 transition-transform">
                  <Home size={40} className="text-blue-600" />
               </div>
               <h3 className="text-2xl font-black text-gray-900 text-center uppercase italic tracking-tighter">{fam.name}</h3>
               <p className="tactical-text text-gray-400 text-[9px] mt-2 mb-6 flex items-center gap-2 uppercase font-mono">
                 <Calendar size={12} /> Registered_2d_ago
               </p>
               <div className="flex gap-2">
                 <span className="bg-emerald-600 text-white text-[8px] font-black uppercase px-2 py-1 tracking-widest">Verified</span>
                 <span className="bg-gray-900 text-white text-[8px] font-black uppercase px-2 py-1 tracking-widest">Priority</span>
               </div>
            </div>

            <div className="flex-1 p-10 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 tactical-text text-[9px] text-gray-500 font-mono">
                     <Users size={14} className="text-blue-500" /> {fam.members} UNIT_MEMBERS
                   </div>
                   <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100 px-3 py-1">[{fam.status}]</div>
                </div>
                <p className="text-gray-500 font-bold text-[11px] leading-relaxed uppercase italic tracking-wider">"{fam.story}"</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 tactical-text text-[9px] text-gray-400 uppercase tracking-widest font-black leading-none">
                  <Award size={16} className="text-amber-500" /> Monthly_Allocation_Tier
                </div>
                <div className="grid grid-cols-2 gap-px bg-gray-100 border border-gray-100">
                  <button className="py-4 bg-white text-gray-900 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">₹5,000 /mo</button>
                  <button className="py-4 bg-white text-gray-900 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">₹10,000 /mo</button>
                </div>
                <button className="w-full py-5 bg-gray-900 text-white font-black text-xs uppercase tracking-[0.4em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl">
                  Pledge Resource Link <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Global Impact Grid */}
      <div className="bg-white border-t-8 border-t-gray-900 shadow-3xl">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100 border border-gray-100">
            <div className="bg-white p-12 text-center group hover:bg-gray-50 transition-all">
               <p className="text-5xl font-black text-gray-900 mb-2 data-value uppercase">00</p>
               <p className="tactical-text text-gray-400 uppercase tracking-[0.2em] text-[10px]">Identities Synchronized</p>
            </div>
            <div className="bg-white p-12 text-center group hover:bg-gray-50 transition-all">
               <p className="text-5xl font-black text-gray-900 mb-2 data-value uppercase">₹0.0M</p>
               <p className="tactical-text text-gray-400 uppercase tracking-[0.2em] text-[10px]">Monthly Resource Flow</p>
            </div>
            <div className="bg-white p-12 text-center group hover:bg-gray-50 transition-all">
               <p className="text-5xl font-black text-gray-900 mb-2 data-value uppercase">00</p>
               <p className="tactical-text text-gray-400 uppercase tracking-[0.2em] text-[10px]">Operational Districts</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdoptFamily;
