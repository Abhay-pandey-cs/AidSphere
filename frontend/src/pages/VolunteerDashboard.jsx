import React, { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, Clock, MapPin, CheckCircle, ArrowRight, Award, Activity, Zap, Navigation, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import SocialMonitor from './SocialMonitor';

const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const VolunteerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [assignedMissions, setAssignedMissions] = useState([]);
  const [regionalMissions, setRegionalMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned', 'regional'
  const [userLoc, setUserLoc] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState('global');
  const [scanLoading, setScanLoading] = useState(false);

  const fetchMissions = async () => {
    try {
      const { data } = await API.get('/sos');
      setAssignedMissions(data.filter(m => m.assignedTo?._id === user?._id || m.assignedTo === user?._id));
      setRegionalMissions(data.filter(m => m.status === 'pending' && m.assignedTo == null));
    } catch (err) {
      console.error('Failed to fetch missions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMissions();
  }, [user]);

  const handleGetLocation = () => {
    setLocLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocLoading(false);
        },
        (err) => {
          alert('Failed to get location. Please enable browser location permissions.');
          setLocLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setLocLoading(false);
    }
  };

  const handleLocalScan = async () => {
    if (!userLoc) return alert("Please Sync GPS first before triggering a local scan!");
    setScanLoading(true);
    try {
      await API.post('/social-monitor/scrape', { lat: userLoc.lat, lng: userLoc.lng });
      await fetchMissions(); // Refresh to catch any AI-injections directly in UI
    } catch (err) {
      console.error('Scan failed:', err);
      alert('Failed to trigger scan.');
    } finally {
      setScanLoading(false);
    }
  };

  const filteredRegional = regionalMissions.filter(m => {
    if (distanceFilter === 'global') return true;
    if (!userLoc || !m.location?.lat || !m.location?.lng) return false;
    const dist = getDistance(userLoc.lat, userLoc.lng, m.location.lat, m.location.lng);
    return dist !== null && dist <= parseInt(distanceFilter);
  }).sort((a,b) => {
    if (!userLoc || !a.location?.lat || !b.location?.lat) return 0;
    return getDistance(userLoc.lat, userLoc.lng, a.location.lat, a.location.lng) - getDistance(userLoc.lat, userLoc.lng, b.location.lat, b.location.lng);
  });

  const handleUpdateMission = async (id, status, logMessage) => {
    try {
      const { data } = await API.put(`/sos/${id}`, { status, logMessage });
      // Remove from regional, add/update in assigned
      setRegionalMissions(prev => prev.filter(m => m._id !== id));
      
      const exists = assignedMissions.find(m => m._id === id);
      if (exists) {
        setAssignedMissions(prev => prev.map(m => m._id === id ? data : m));
      } else {
        setAssignedMissions(prev => [data, ...prev]);
        setActiveTab('assigned');
      }
    } catch (err) {
      alert('Update failed');
    }
  };

  const resolvedMissions = assignedMissions.filter(m => m.status === 'resolved');
  const impactCount = resolvedMissions.length;
  const reputationPoints = resolvedMissions.reduce((acc, m) => {
    return acc + (m.urgency === 'critical' ? 50 : m.urgency === 'high' ? 30 : 10);
  }, 0);
  const nextTierPoints = 100 - (reputationPoints % 100);
  const currentTier = Math.floor(reputationPoints / 100) + 1;

  return (
    <div className="space-y-12 pb-24">
      {/* Tactical Status Banner */}
      <div className={`p-12 border-4 shadow-2xl relative overflow-hidden group ${
        user?.isVerified ? 'bg-gray-900 border-gray-900' : 'bg-blue-600 border-gray-900'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-8">
              <div className="bg-white p-6 border-2 border-gray-900 shadow-xl">
                 {user?.isVerified ? <Award className="text-amber-500 w-12 h-12" /> : <ShieldCheck className="text-blue-600 w-12 h-12" />}
              </div>
              <div className="text-center md:text-left space-y-2">
                 <p className="tactical-text text-white/70 uppercase italic tracking-widest">{user?.role?.toUpperCase()} IDENTITY PROFILE</p>
                 <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                   {user?.trustLevel?.toUpperCase() || 'NO'} TIER STATUS
                 </h2>
                 <p className="text-white/80 font-bold text-xs uppercase tracking-widest max-w-md">
                    {user?.isVerified 
                      ? "Full mission clearance granted. Operational access at peak levels." 
                      : "Identity synchronization required for critical-tier mission access."}
                 </p>
              </div>
           </div>
           {!user?.isVerified && (
             <Link to="/verify-digilocker" className="px-12 py-6 bg-white text-blue-600 font-black text-xs uppercase tracking-[0.5em] hover:bg-gray-50 transition-all shadow-2xl flex items-center gap-3 decoration-none">
                Induct via DigiLocker <ArrowRight size={20} />
             </Link>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Mission Matrix */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between border-b-2 border-slate-200 pb-4 gap-4">
              <div className="flex gap-4 xl:gap-6 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
                 <button 
                   onClick={() => setActiveTab('assigned')}
                   className={`text-lg xl:text-xl font-bold transition-all whitespace-nowrap ${activeTab === 'assigned' ? 'text-slate-900 border-b-2 border-slate-900 pb-1' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    Assigned ({assignedMissions.length})
                 </button>
                 <button 
                   onClick={() => setActiveTab('regional')}
                   className={`text-lg xl:text-xl font-bold transition-all whitespace-nowrap ${activeTab === 'regional' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    Regional Open SOS ({filteredRegional.length})
                 </button>
                 <button 
                   onClick={() => setActiveTab('intel')}
                   className={`text-lg xl:text-xl font-bold transition-all whitespace-nowrap ${activeTab === 'intel' ? 'text-slate-900 border-b-2 border-slate-900 pb-1' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    Signal Intel
                 </button>
              </div>
              
              {activeTab === 'regional' && (
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                   <select 
                     value={distanceFilter}
                     onChange={(e) => setDistanceFilter(e.target.value)}
                     className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-600 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 xl:flex-none"
                   >
                     <option value="global">Global Intel</option>
                     <option value="5">&lt; 5km Radius</option>
                     <option value="20">&lt; 20km Radius</option>
                     <option value="50">&lt; 50km Radius</option>
                   </select>
                   <button 
                     onClick={handleGetLocation} disabled={locLoading}
                     className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-full text-xs font-bold hover:bg-slate-200 transition-all shadow-sm flex-1 xl:flex-none whitespace-nowrap"
                   >
                     {locLoading ? <Activity size={14} className="animate-spin" /> : <Navigation size={14} />}
                     {userLoc ? 'Synced' : 'Sync GPS'}
                   </button>
                   {userLoc && (
                     <button 
                       onClick={handleLocalScan} disabled={scanLoading}
                       className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-bold hover:bg-blue-700 transition-all shadow-md flex-1 xl:flex-none whitespace-nowrap"
                     >
                       {scanLoading ? <Activity size={14} className="animate-spin" /> : <Zap size={14} />}
                       {scanLoading ? 'Scanning...' : 'Local Threat Scan'}
                     </button>
                   )}
                </div>
              )}
           </div>

           <div className="space-y-6">
              {loading ? (
                 <div className="text-center py-24">
                    <Activity className="animate-spin text-gray-300 mx-auto" size={40} />
                 </div>
              ) : activeTab === 'assigned' && assignedMissions.length === 0 ? (
                <div className="bg-slate-50 rounded-3xl p-24 border border-slate-100 text-center">
                   <ShieldAlert size={48} className="text-slate-300 mx-auto mb-6" />
                   <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No Active Assignments</p>
                   <button onClick={() => setActiveTab('regional')} className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition-all">Scan Regional Anomalies <ArrowRight size={14} /></button>
                </div>
              ) : activeTab === 'regional' && filteredRegional.length === 0 ? (
                <div className="bg-slate-50 rounded-3xl p-24 border border-slate-100 text-center">
                   <Globe size={48} className="text-slate-300 mx-auto mb-6" />
                   <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No Open SOS Signals</p>
                   <p className="text-xs font-medium text-slate-400 mt-2 hover:underline cursor-pointer" onClick={() => setDistanceFilter('global')}>Expand Search Radius</p>
                </div>
              ) : activeTab === 'intel' ? (
                 <div className="bg-slate-50/50 min-h-[500px] border border-slate-200 rounded-3xl overflow-hidden relative">
                    <SocialMonitor />
                 </div>
              ) : (activeTab === 'assigned' ? assignedMissions : filteredRegional).map(m => {
                 const dist = userLoc && m.location?.lat ? getDistance(userLoc.lat, userLoc.lng, m.location.lat, m.location.lng) : null;
                 return (
                <div key={m._id} className="industrial-card p-10 bg-white border-l-8 border-l-blue-600 hover:shadow-2xl transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none uppercase font-black text-5xl italic tracking-tighter">MISSION</div>
                   
                   <div className="flex flex-col sm:flex-row justify-between items-start mb-8 relative z-10 gap-4 sm:gap-0">
                      <div className="space-y-4">
                         <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] ${
                              m.urgency === 'critical' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                            }`}>
                               {m.urgency}
                            </span>
                            <span className="tactical-text text-gray-400 font-mono">NODE_REF: {m._id.slice(-8).toUpperCase()}</span>
                            {dist !== null && (
                                <span className="bg-emerald-50 text-emerald-600 px-2 py-1 text-[10px] font-bold border border-emerald-100 uppercase">
                                    {dist.toFixed(1)} km away
                                </span>
                            )}
                         </div>
                         <h4 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase italic tracking-tighter">{m.type} Relief Operation</h4>
                      </div>
                      <div className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border border-gray-900/10 ${
                        m.status === 'responding' ? 'text-emerald-500 animate-pulse' : 'text-blue-500'
                      }`}>
                        {m.status}
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="p-4 bg-gray-50 border border-gray-100 flex items-center gap-4">
                         <MapPin size={18} className="text-gray-400 shrink-0" />
                         <div className="space-y-1 truncate">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Target Location</p>
                            <p className="text-xs font-black text-gray-900 uppercase truncate">{m.location?.address || 'GPS_COORDINATES_SYNCED'}</p>
                         </div>
                      </div>
                      <div className="p-4 bg-gray-50 border border-gray-100 flex items-center gap-4">
                         <Clock size={18} className="text-gray-400 shrink-0" />
                         <div className="space-y-1">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Deployment Time</p>
                            <p className="text-xs font-black text-gray-900 uppercase">{new Date(m.createdAt).toLocaleTimeString()}</p>
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-4">
                      {m.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateMission(m._id, 'assigned', 'Volunteer responder drafted manually via geospatial matrix.')}
                          className="flex-1 py-4 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          Mobilize For Rescue <Zap size={16} />
                        </button>
                      )}
                      {m.status === 'assigned' && (
                        <button 
                          onClick={() => handleUpdateMission(m._id, 'responding', 'Responder initialized tactical movement...')}
                          className="flex-1 py-4 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          Initialize Response <Zap size={16} />
                        </button>
                      )}
                      {m.status === 'responding' && (
                        <button 
                          onClick={() => handleUpdateMission(m._id, 'resolved', 'Mission objective achieved and verified on-site.')}
                          className="flex-1 py-4 rounded-full bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          Mark as Resolved <CheckCircle size={18} />
                        </button>
                      )}
                      <Link to={`/sos/${m._id}`} className="px-8 py-4 rounded-full border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center whitespace-nowrap decoration-none">
                         View Intel
                      </Link>
                   </div>
                </div>
              )
              })}
           </div>
        </div>

        {/* Tactical Performance Sidebar */}
        <div className="space-y-8">
           <div className="industrial-card p-10 bg-white border-t-8 border-t-gray-900 space-y-10">
              <h4 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">Responder Analytics</h4>
              <div className="space-y-8">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center">
                       <span className="text-2xl font-black text-emerald-600 leading-none">{impactCount.toString().padStart(2, '0')}</span>
                       <span className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter">Impact</span>
                    </div>
                    <div className="flex-1 space-y-2">
                       <div className="flex justify-between tactical-text text-[9px] text-gray-400">
                          <span>Verified Extractions</span>
                          <span>LEVEL_{currentTier}</span>
                       </div>
                       <div className="h-1 bg-gray-50 overflow-hidden">
                          <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min((reputationPoints % 100), 100)}%` }} />
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 border border-blue-100 flex flex-col items-center justify-center">
                       <span className="text-2xl font-black text-blue-600 leading-none">{reputationPoints.toString().padStart(2, '0')}</span>
                       <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">Points</span>
                    </div>
                    <div className="flex-1 space-y-1">
                       <p className="text-xs font-black text-gray-900 uppercase">Merit Sync Progress</p>
                       <p className="text-[9px] font-mono text-gray-400 uppercase">Tier_Update: Ready_in_{nextTierPoints}pts</p>
                    </div>
                 </div>
              </div>
              
              <div className="space-y-3">
                <button onClick={() => alert('Coming Soon!')} className="w-full py-4 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-700 transition-all shadow-md">
                   Claim E-Certificate
                </button>
                <button onClick={() => alert('Coming Soon!')} className="w-full py-4 bg-gray-100 border border-gray-200 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-gray-200 transition-all">
                   Global Leaderboard
                </button>
              </div>
           </div>

           <div className="p-10 bg-gray-900 text-white space-y-8 border-l-4 border-l-blue-600">
              <div className="flex items-center gap-4">
                 <Activity size={20} className="text-blue-500" />
                 <span className="tactical-text text-white">Consolidated Intel</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed tracking-widest italic">
                 Intelligence feeds are prioritized by your responder tier. Maintain high-resolution response logs for merit allocation.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
