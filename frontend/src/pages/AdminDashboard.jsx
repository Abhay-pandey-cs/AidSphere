import React, { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { SocketContext } from '../context/SocketContext';
import { ShieldCheck, ShieldAlert, Users, CheckCircle, XCircle, Clock, ExternalLink, Share2, LayoutDashboard, ChevronRight, MessageSquare, MapPin, ArrowRight, Zap, Filter, Activity, BarChart3, Database, Globe, RefreshCw } from 'lucide-react';
import { MissionSkeleton } from '../components/Skeleton';
import { Link } from 'react-router-dom';
import SocialMonitor from './SocialMonitor';

const AdminDashboard = () => {
  const [sosRequests, setSosRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [filter, setFilter] = useState('all');
  const [volunteers, setVolunteers] = useState([]);
  const [activeTab, setActiveTab] = useState('missions'); // 'missions', 'force', 'signals'
  const socket = useContext(SocketContext);

  useEffect(() => {
    fetchSOS();
    if (socket) {
      socket.on('newSOS', (newSOS) => {
        setSosRequests((prev) => [newSOS, ...prev]);
      });
      socket.on('sosUpdated', (updatedSOS) => {
        setSosRequests((prev) => 
          prev.map(sos => sos._id === updatedSOS._id ? updatedSOS : sos)
        );
      });
    }
  }, [socket]);

  const fetchSOS = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/sos');
      setSosRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const { data } = await API.get('/users/volunteers');
      setVolunteers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'force') fetchVolunteers();
  }, [activeTab]);

  const handleVolunteerVerify = async (id, payload) => {
    try {
      await API.put(`/users/volunteers/${id}/verify`, typeof payload === 'object' ? payload : { isVerified: payload });
      fetchVolunteers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/sos/${id}/status`, { status });
      fetchSOS();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSOS = filter === 'all' 
    ? sosRequests 
    : sosRequests.filter(s => s.status === filter);

  return (
    <div className="flex bg-white min-h-screen">
      {/* Sidebar Navigation - Tactical */}
      <div className="w-20 lg:w-64 border-r border-gray-900/10 flex flex-col bg-gray-50/50">
        <div className="p-6 border-b border-gray-900/10">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-sm">
                <Database size={20} />
             </div>
             <span className="hidden lg:block font-bold text-sm tracking-tight text-slate-800">Admin Console</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-6">
           <div className="space-y-2">
              <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest pl-3">Deployment</span>
              {[
                { id: 'all', label: 'Global Feed', icon: <Globe size={20} /> },
                { id: 'pending', label: 'Action Needed', icon: <ShieldAlert size={20} /> },
                { id: 'dispatched', label: 'Active Deploy', icon: <Zap size={20} /> },
                { id: 'resolved', label: 'Archived / Closed', icon: <CheckCircle size={20} /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab('missions'); setFilter(item.id); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                    activeTab === 'missions' && filter === item.id 
                    ? 'bg-blue-50 text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {item.icon}
                  <span className="hidden lg:block text-xs">{item.label}</span>
                </button>
              ))}
           </div>

           <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider pl-4">Intelligence</span>
              <button
                onClick={() => setActiveTab('force')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                  activeTab === 'force' 
                  ? 'bg-blue-50 text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Users size={20} />
                <span className="hidden lg:block text-xs">Force Management</span>
              </button>
              <button
                onClick={() => setActiveTab('signals')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                  activeTab === 'signals' 
                  ? 'bg-blue-50 text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Activity size={20} />
                <span className="hidden lg:block text-xs">Signal Intelligence</span>
              </button>
           </div>
        </nav>

        <div className="p-4 border-t border-gray-900/10">
           <div className="hidden lg:block p-4 bg-gray-900/5 space-y-3">
              <div className="flex items-center gap-2">
                 <Activity size={12} className="text-emerald-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Node Sync: 100%</span>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-gray-200 min-h-full">
           
           {/* Deployment Matrix (List) */}
           <div className="bg-white p-8 space-y-8 h-screen overflow-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 p-6 rounded-3xl border border-slate-100 gap-4">
                 <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-800">Deployment Matrix</h2>
                    <p className="font-medium text-xs text-slate-500 mt-1">Total Synchronized Signals: {sosRequests.length}</p>
                 </div>
                 <div className="flex gap-3">
                    <button onClick={() => alert('Coming Soon!')} className="p-2.5 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"><Filter size={18} /></button>
                    <button onClick={fetchSOS} className="p-2.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all"><RefreshCw size={18} /></button>
                 </div>
              </div>

              <div className="space-y-3">
                 {loading ? (
                   <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map(i => <MissionSkeleton key={i} />)}
                   </div>
                 ) : filteredSOS.map(sos => (
                   <div 
                     key={sos._id}
                     onClick={() => setSelectedSOS(sos)}
                     className={`industrial-card p-4 cursor-pointer hover:border-gray-900 transition-all flex items-center gap-4 ${
                       selectedSOS?._id === sos._id ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900' : ''
                     }`}
                   >
                     <div className={`w-2 h-12 ${
                        sos.urgency === 'critical' ? 'bg-red-600' : 
                        sos.urgency === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                     }`} />
                     
                     <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                           <span className="tactical-text text-gray-400">MISSION_ID: <span className="text-gray-900 font-mono">{sos._id.slice(-8).toUpperCase()}</span></span>
                           <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                              sos.status === 'pending' ? 'border-red-200 text-red-600 bg-red-50' : 
                              sos.status === 'dispatched' ? 'border-blue-200 text-blue-600 bg-blue-50' : 
                              sos.status === 'resolved' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-gray-200 text-gray-600 bg-gray-50'
                           }`}>
                              {sos.status}
                           </span>
                        </div>
                        <p className="text-xs font-bold text-gray-700 truncate">{sos.description}</p>
                        <div className="flex items-center gap-3 text-[9px] font-mono text-gray-400">
                           <MapPin size={10} /> {sos.location?.address || 'UNKNOWN_COORD'}
                        </div>
                     </div>
                   </div>
                 ))}
              </div>
           </div>

           {activeTab === 'missions' && (
             <div className="bg-gray-50/50 p-8 h-screen overflow-auto w-full relative">
                {selectedSOS ? (
                  <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                     <div className="industrial-card bg-white p-8 space-y-8">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-8">
                           <div className="space-y-2">
                              <span className="tactical-text text-blue-600">Active Intelligence Signal</span>
                              <h3 className="text-4xl font-black uppercase tracking-tighter leading-none italic">{selectedSOS.type} REPORT</h3>
                              <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                                 <p className="flex items-center gap-2"><Clock size={14} /> T-STAMP: {new Date(selectedSOS.createdAt).toLocaleTimeString()}</p>
                                 <p className="flex items-center gap-2"><Users size={14} /> CATEGORY: {selectedSOS.category?.toUpperCase()}</p>
                              </div>
                           </div>
                           <div className={`p-6 border-4 flex flex-col items-center justify-center ${
                               selectedSOS.urgency === 'critical' ? 'border-red-600 text-red-600' : 'border-gray-900 text-gray-900'
                           }`}>
                              <span className="tactical-text text-[8px] mb-1">Impact Level</span>
                              <span className="text-2xl font-black">{selectedSOS.urgency?.toUpperCase()}</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <label className="tactical-text text-gray-400">Geo-Coordinates</label>
                              <div className="p-4 bg-gray-100 font-mono text-xs border border-gray-200 text-gray-600">
                                 Lat: {selectedSOS.location?.lat || '0.00'}<br />
                                 Lng: {selectedSOS.location?.lng || '0.00'}<br />
                                 Addr: {selectedSOS.location?.address || 'UNDEFINED'}
                              </div>
                           </div>
                           <div className="space-y-3">
                              <label className="tactical-text text-gray-400">Operational Status</label>
                              <div className="grid grid-cols-2 gap-2">
                                 <button onClick={() => handleStatusUpdate(selectedSOS._id, 'dispatched')} className="py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700">Dispatch Unit</button>
                                 <button onClick={() => handleStatusUpdate(selectedSOS._id, 'resolved')} className="py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700">Close Mission</button>
                              </div>
                              <Link to={`/sos/${selectedSOS._id}`} className="block w-full text-center py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all">
                                 View Deep Intel Briefing
                              </Link>
                           </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative">
                           <div className="absolute top-4 right-4 opacity-10 text-slate-400"><Activity size={40} /></div>
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 block">Incident Log (Signal Description)</label>
                           <p className="text-base text-slate-800 font-medium leading-relaxed">{selectedSOS.description}</p>
                        </div>

                        <div className="space-y-4">
                           <label className="tactical-text text-gray-400 font-black">Mission Timeline (Black Box)</label>
                           <div className="space-y-2">
                              <div className="text-[10px] font-mono text-gray-500 flex gap-4 border-l-2 border-emerald-500 pl-4 py-2 bg-emerald-50/30">
                                 <span className="font-bold text-emerald-600">[00:00:01]</span> Signal Broadcast Initiated from Mobile Node
                              </div>
                              <div className="text-[10px] font-mono text-gray-500 flex gap-4 border-l-2 border-gray-200 pl-4 py-2 opacity-50">
                                 <span className="font-bold text-gray-900">[{new Date().toLocaleTimeString()}]</span> Waiting for Secondary Validation...
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                     <div className="p-8 border-4 border-gray-900 rounded-full">
                        <LayoutDashboard size={80} className="text-gray-900" />
                     </div>
                     <div className="space-y-2">
                        <p className="text-3xl font-black uppercase italic tracking-tighter">Standby Mode</p>
                        <p className="tactical-text">Select a signal from the matrix for tactical monitoring</p>
                     </div>
                  </div>
                )}
             </div>
           )}

           {activeTab === 'force' && (
             <div className="bg-white p-8 space-y-8 h-screen overflow-auto w-full max-w-7xl">
                <div className="flex justify-between items-center border-b border-gray-200 pb-6">
                   <div>
                      <h2 className="text-2xl font-black uppercase tracking-tighter italic">Force Management</h2>
                      <p className="tactical-text text-gray-400">DigiLocker Verified Volunteer Matrix</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-black uppercase">
                         Trained: {volunteers.filter(v => v.volunteerType === 'trained').length}
                      </div>
                      <div className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 text-xs font-black uppercase">
                         Untrained: {volunteers.filter(v => v.volunteerType === 'untrained').length}
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   {volunteers.map(vol => (
                     <div key={vol._id} className="industrial-card p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 border border-gray-200">
                        <div className="flex items-center gap-6">
                           <div className={`w-14 h-14 flex flex-col items-center justify-center text-white font-black text-xs ${vol.isVerified ? 'bg-emerald-600' : 'bg-gray-400'}`}>
                              {vol.isVerified ? <ShieldCheck size={24} /> : 'UNV'}
                           </div>
                           <div>
                              <div className="flex items-center gap-3">
                                 <h4 className="text-lg font-black uppercase leading-none">{vol.name}</h4>
                                 {vol.trustLevel && vol.trustLevel !== 'none' && (
                                   <span className={`text-[9px] font-black uppercase px-2 py-0.5 border ${
                                     vol.trustLevel === 'gold' ? 'border-amber-400 text-amber-600 bg-amber-50' : 'border-gray-400 text-gray-600 bg-gray-50'
                                   }`}>
                                     {vol.trustLevel} Trust
                                   </span>
                                 )}
                              </div>
                              <p className="text-[10px] font-mono text-gray-500">{vol.phone} // {vol.email}</p>
                           </div>
                        </div>

                        <div className="flex flex-wrap md:flex-nowrap items-center gap-4 bg-gray-50 p-4 border border-gray-100">
                           <div className="space-y-2 flex-1 min-w-[140px]">
                              <span className="text-[8px] font-black uppercase text-gray-400 block">DigiLocker Auth</span>
                              <div className="flex gap-2">
                                 <button onClick={() => handleVolunteerVerify(vol._id, { isVerified: true })} className={`px-3 py-1.5 text-[9px] font-black uppercase transition-all ${vol.isVerified ? 'bg-emerald-600 text-white' : 'border border-gray-300 text-gray-400 hover:border-emerald-600 hover:text-emerald-600'}`}>Verify</button>
                                 <button onClick={() => handleVolunteerVerify(vol._id, { isVerified: false })} className={`px-3 py-1.5 text-[9px] font-black uppercase transition-all ${!vol.isVerified ? 'bg-red-600 text-white' : 'border border-gray-300 text-gray-400 hover:border-red-600 hover:text-red-600'}`}>Revoke</button>
                              </div>
                           </div>
                           
                           <div className="space-y-2 flex-1 min-w-[140px]">
                              <span className="text-[8px] font-black uppercase text-gray-400 block">Skill Classification</span>
                              <div className="flex gap-2">
                                 <button onClick={() => handleVolunteerVerify(vol._id, { volunteerType: 'trained' })} className={`px-3 py-1.5 text-[9px] font-black uppercase transition-all ${vol.volunteerType==='trained' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-400 hover:border-blue-600 hover:text-blue-600'}`}>Trained</button>
                                 <button onClick={() => handleVolunteerVerify(vol._id, { volunteerType: 'untrained' })} className={`px-3 py-1.5 text-[9px] font-black uppercase transition-all ${vol.volunteerType==='untrained' ? 'bg-orange-500 text-white' : 'border border-gray-300 text-gray-400 hover:border-orange-500 hover:text-orange-500'}`}>Untrained</button>
                              </div>
                           </div>

                           <div className="space-y-2 flex-1 min-w-[140px]">
                              <span className="text-[8px] font-black uppercase text-gray-400 block">Trust Level</span>
                              <div className="flex gap-2">
                                 <button onClick={() => handleVolunteerVerify(vol._id, { trustLevel: 'gold' })} className={`px-3 py-1.5 text-[9px] font-black uppercase transition-all ${vol.trustLevel==='gold' ? 'bg-amber-500 text-white' : 'border border-gray-300 text-gray-400 hover:border-amber-500'}`}>Gold</button>
                                 <button onClick={() => handleVolunteerVerify(vol._id, { trustLevel: 'silver' })} className={`px-3 py-1.5 text-[9px] font-black uppercase transition-all ${vol.trustLevel==='silver' ? 'bg-gray-400 text-white' : 'border border-gray-300 text-gray-400 hover:border-gray-500'}`}>Silver</button>
                                 <button onClick={() => handleVolunteerVerify(vol._id, { trustLevel: 'none' })} className={`px-3 py-1.5 text-[9px] font-black uppercase transition-all ${vol.trustLevel==='none' ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-400 hover:border-gray-900'}`}>None</button>
                              </div>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'signals' && (
             <div className="bg-gray-50/50 h-screen overflow-auto w-full relative">
                 <SocialMonitor />
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
