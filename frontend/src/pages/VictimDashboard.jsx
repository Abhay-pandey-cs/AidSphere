import React, { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, MapPin, Clock, CheckCircle, AlertCircle, ArrowRight, MessageSquare, Activity, Target, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import SocialMonitor from './SocialMonitor';

const VictimDashboard = () => {
  const { user } = useContext(AuthContext);
  const [mySOS, setMySOS] = useState([]);
  const [globalSOS, setGlobalSOS] = useState([]);
  const [activeTab, setActiveTab] = useState('mine');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMySOS = async () => {
      try {
        const { data } = await API.get('/sos');
        setMySOS(data.filter(s => s.user?._id === user?._id || s.user === user?._id));
        setGlobalSOS(data);
      } catch (err) {
        console.error('Failed to fetch SOS:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMySOS();
  }, [user]);

  return (
    <div className="space-y-12 pb-24">
      {/* Tactical SOS Header */}
      <div className="bg-red-600 p-12 border-4 border-gray-900 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-8">
              <div className="bg-white p-6 border-2 border-gray-900 shadow-xl animate-pulse">
                 <ShieldAlert className="text-red-600 w-12 h-12" />
              </div>
              <div className="text-center md:text-left space-y-2">
                 <p className="tactical-text text-white/70 italic uppercase">Emergency Protocol: Active</p>
                 <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Broadcast Distress</h2>
                 <p className="text-white/80 font-bold text-xs uppercase tracking-widest max-w-md">
                    Initialize immediate signal broadcast for priority extraction and resource allocation.
                 </p>
              </div>
           </div>
           <Link to="/raise-sos" className="px-12 py-6 bg-gray-900 text-white font-black text-xs uppercase tracking-[0.5em] hover:bg-black transition-all shadow-2xl flex items-center gap-3 decoration-none active:scale-95 border border-white/20">
              Launch SOS <AlertCircle size={20} />
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Signal Matrix */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-gray-900 pb-4 gap-4 px-2">
              <div className="flex gap-6">
                 <button 
                   onClick={() => setActiveTab('mine')}
                   className={`text-xl font-black flex items-center gap-3 italic uppercase tracking-tighter transition-all ${activeTab === 'mine' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   <Target size={20} /> My Broadcasts
                 </button>
                 <button 
                   onClick={() => setActiveTab('global')}
                   className={`text-xl font-black flex items-center gap-3 italic uppercase tracking-tighter transition-all ${activeTab === 'global' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   <Activity size={20} /> Global Threat Intel
                 </button>
                 <button 
                   onClick={() => setActiveTab('intel')}
                   className={`text-xl font-black flex items-center gap-3 italic uppercase tracking-tighter transition-all ${activeTab === 'intel' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   <Globe size={20} /> Live Intel
                 </button>
              </div>
              <div className="bg-gray-900 px-4 py-2 text-[10px] font-black text-white uppercase tracking-widest">
                Nodes active: {activeTab === 'mine' ? mySOS.length : activeTab === 'global' ? globalSOS.length : 'SYNC'}
              </div>
           </div>

           <div className="space-y-6">
              {loading ? (
                <div className="text-center py-24 space-y-4">
                   <Activity className="animate-spin text-gray-300 mx-auto" size={40} />
                   <p className="tactical-text text-gray-400">Synchronizing with Node...</p>
                </div>
              ) : activeTab === 'mine' ? (
                mySOS.length === 0 ? (
                  <div className="bg-gray-50 p-24 border border-gray-200 text-center">
                     <MessageSquare size={48} className="text-gray-200 mx-auto mb-6" />
                     <p className="tactical-text text-gray-400 uppercase tracking-widest">Zero active signals detected</p>
                     <p className="text-[9px] font-mono text-gray-300 mt-2 uppercase">Status: Nominal_Operational</p>
                  </div>
                ) : mySOS.map(sos => (
                  <div key={sos._id} className="industrial-card p-10 bg-white border-l-8 border-l-red-600 hover:shadow-2xl transition-all group overflow-hidden">
                     <div className="flex justify-between items-start mb-8">
                        <div className="space-y-4">
                           <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] ${
                                sos.status === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                              }`}>
                                 {sos.status}
                              </span>
                              <span className="tactical-text text-gray-400">Signal_Ref: {sos._id.slice(-8).toUpperCase()}</span>
                           </div>
                           <h4 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
                              {sos.type} SOS Deployment
                           </h4>
                        </div>
                        <div className="bg-gray-50 p-4 border border-gray-100">
                           <div className={`w-3 h-3 ${sos.status === 'pending' ? 'bg-amber-500 animate-ping' : 'bg-blue-500'} `} />
                        </div>
                     </div>

                     <div className="bg-gray-50 border border-gray-200 p-8 space-y-6 mb-8 relative">
                        <div className="absolute top-0 right-0 p-4 font-mono text-[8px] text-gray-300">LOG_V8.2</div>
                        <div className="flex items-start gap-5">
                           <div className="bg-white p-3 border border-gray-200 text-blue-600">
                              <Clock size={16} />
                           </div>
                           <div className="space-y-2">
                              <p className="text-xs font-black text-gray-700 leading-relaxed uppercase tracking-wide italic">
                                 &gt; {sos.logs?.[sos.logs.length - 1]?.message || 'Establishment of local responder link pending...'}
                              </p>
                              <p className="text-[9px] text-gray-400 font-mono uppercase tracking-tighter">
                                 Action_Recorded: {new Date(sos.logs?.[sos.logs.length - 1]?.timestamp || sos.createdAt).toLocaleString()}
                              </p>
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-4">
                        <Link to={`/sos/${sos._id}`} className="flex-1 py-5 bg-gray-900 text-white font-black text-xs uppercase tracking-[0.4em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl decoration-none">
                           View Tactical Timeline <ArrowRight size={16} />
                        </Link>
                        <button onClick={() => alert('Coming Soon!')} className="px-8 py-5 border border-gray-900 text-gray-900 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">
                           Validate Success
                        </button>
                     </div>
                  </div>
                ))
              ) : activeTab === 'global' ? (
                globalSOS.length === 0 ? (
                  <div className="bg-gray-50 p-24 border border-gray-200 text-center">
                     <MessageSquare size={48} className="text-gray-200 mx-auto mb-6" />
                     <p className="tactical-text text-gray-400 uppercase tracking-widest">Zero global signals detected</p>
                  </div>
                ) : globalSOS.map(sos => (
                  <div key={sos._id} className="industrial-card p-10 bg-white border-l-8 border-l-gray-900 hover:shadow-2xl transition-all group overflow-hidden">
                     <div className="flex justify-between items-start mb-8">
                        <div className="space-y-4">
                           <div className="flex items-center gap-3">
                              <span className="px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] bg-gray-900 text-white">
                                 Read Only Access
                              </span>
                              <span className="tactical-text text-gray-400">Signal_Ref: {sos._id.slice(-8).toUpperCase()}</span>
                           </div>
                           <h4 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
                              {sos.type} Crisis
                           </h4>
                        </div>
                     </div>

                     <div className="flex gap-4">
                        <Link to={`/sos/${sos._id}`} className="flex-1 py-5 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.4em] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl decoration-none">
                           View Intel Briefing <ArrowRight size={16} />
                        </Link>
                     </div>
                  </div>
                ))
              ) : activeTab === 'intel' ? (
                <div className="bg-gray-50/50 min-h-[500px] border border-gray-100 rounded-2xl relative">
                  <SocialMonitor />
                </div>
              ) : null}
           </div>
        </div>

        {/* Support Intelligence Sidebar */}
        <div className="space-y-8">
           <div className="industrial-card p-10 bg-gray-50 border-t-8 border-t-gray-900 space-y-8">
              <div className="space-y-1">
                 <h4 className="tactical-text text-gray-900">Resource Proximity</h4>
                 <p className="text-[9px] font-mono text-gray-400 uppercase">Detection Range: 5.0km</p>
              </div>
               <div className="space-y-4">
                 {[
                   { 
                     label: 'Tactical Shelters', 
                     count: globalSOS.filter(s => s.type === 'shelter' && s.status !== 'resolved').length.toString().padStart(2, '0'), 
                     icon: <MapPin size={14} />, 
                     color: 'text-blue-600' 
                   },
                   { 
                     label: 'Medical Extraction', 
                     count: globalSOS.filter(s => s.type === 'medical' && s.status !== 'resolved').length.toString().padStart(2, '0'), 
                     icon: <AlertCircle size={14} />, 
                     color: 'text-red-500' 
                   }
                 ].map(res => (
                   <div key={res.label} className="p-4 bg-white border border-gray-100 flex justify-between items-center group hover:border-gray-900 transition-all">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 bg-gray-50 ${res.color}`}>{res.icon}</div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{res.label}</span>
                      </div>
                      <span className="data-value text-gray-900 font-mono text-xl">{res.count}</span>
                   </div>
                 ))}
               </div>
              <Link to="/map" className="w-full py-5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-700 transition-all flex items-center justify-center decoration-none shadow-xl">
                 Launch Resource Map
              </Link>
           </div>

           <div className="p-10 bg-gray-900 text-white space-y-6 border-l-4 border-l-red-600">
              <div className="flex items-center gap-4">
                 <ShieldAlert size={20} className="text-red-500" />
                 <span className="tactical-text text-white">Security Intelligence</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed italic tracking-widest">
                 Maintain lockdown if perimeter is breeched. Avoid non-official communication channels. Responders are synced to your unique Signal_Ref.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VictimDashboard;
