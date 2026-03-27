import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, MapPin, Clock, ArrowLeft, Target, Activity, CheckCircle, AlertTriangle, FileText, User } from 'lucide-react';

const SOSDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [sos, setSos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSOSDetail = async () => {
      try {
        const { data } = await API.get(`/sos/${id}`);
        setSos(data);
      } catch (err) {
        console.error("Failed to load intel:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSOSDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Activity size={40} className="animate-spin text-gray-300" />
        <p className="tactical-text text-gray-400">Decrypting Mission Node...</p>
      </div>
    );
  }

  if (!sos) {
    return (
      <div className="text-center py-24 space-y-4">
        <AlertTriangle size={60} className="text-red-500 mx-auto" />
        <h2 className="text-2xl font-black uppercase italic text-gray-900">Intel Corrupted / Not Found</h2>
        <Link to="/dashboard" className="text-blue-600 font-bold text-xs uppercase hover:underline">Return to Base</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-12">
      {/* Tactical Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-900/10 pb-8">
        <div className="space-y-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-gray-900 transition-all">
             <ArrowLeft size={14} /> Back to Matrix
          </Link>
          <div className="flex flex-wrap items-center gap-3">
             <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white ${
                sos.urgency === 'critical' ? 'bg-red-600' : 
                sos.urgency === 'high' ? 'bg-amber-500' : 'bg-blue-600'
             }`}>
                {sos.urgency} Priority
             </span>
             <span className="tactical-text text-gray-400">Node Ref: {sos._id.slice(-10).toUpperCase()}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 leading-none uppercase italic">
            {sos.type} Crisis
          </h1>
        </div>
        <div className={`px-8 py-6 text-xl font-black uppercase tracking-[0.3em] ${
          sos.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-500' : 
          sos.status === 'responding' ? 'bg-blue-50 text-blue-600 border-2 border-blue-500 animate-pulse' :
          'bg-gray-900 text-white'
        }`}>
          Status: {sos.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Briefing Column */}
        <div className="lg:col-span-2 space-y-8">
           {/* Payload Data */}
           <div className="p-10 border border-gray-200 bg-white relative group">
              <div className="absolute top-0 right-0 p-4 opacity-5 uppercase font-black text-6xl italic tracking-tighter pointer-events-none">
                 PAYLOAD
              </div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                 <img src={sos.images?.[0] || "https://img.freepik.com/free-vector/digital-technology-background-with-glowing-lines_1017-31365.jpg"} alt="Radar" className="w-16 h-16 object-cover grayscale opacity-50" />
                 <div>
                    <h3 className="text-lg font-black uppercase text-gray-900 tracking-tighter">Raw Distress Telemetry</h3>
                    <p className="tactical-text text-[9px] text-gray-400">Logged via System Node</p>
                 </div>
              </div>
              
              <div className="bg-gray-50 p-6 border-l-4 border-gray-900 text-gray-800 font-medium leading-relaxed whitespace-pre-wrap relative z-10 text-sm">
                 {sos.description}
              </div>
              
              {/* Media Vault (If image exists in description like the AI fallback, or in images array) */}
              {(sos.images && sos.images.length > 0) || sos.description.includes('http') ? (
                 <div className="mt-8 space-y-4">
                    <h4 className="tactical-text text-gray-400 flex items-center gap-2"><FileText size={14} /> Attached Visual Intel</h4>
                    <div className="grid grid-cols-2 gap-4">
                       {sos.images?.map((img, i) => (
                          <img key={i} src={img} alt="Evidence" className="w-full h-48 object-cover border-2 border-gray-200 hover:border-blue-500 transition-all cursor-crosshair" />
                       ))}
                       {/* Extremely basic regex to catch the Gemini Fallback image link for the presentation */}
                       {sos.description.match(/(https?:\/\/[^\s]+\.(?:jpg|png|jpeg|gif))/gi)?.map((img, i) => (
                           <img key={`desc-${i}`} src={img} alt="Extracted Evidence" className="w-full h-auto max-h-64 object-cover border-2 border-red-500 shadow-xl" />
                       ))}
                    </div>
                 </div>
              ) : null}
           </div>

           {/* AI Verification Stats (Mocked or pulled from desc if Neural Pipeline processed it) */}
           {sos.description.includes('AI_VERIFIED') || sos.description.includes('VISION_VERIFIED') ? (
             <div className="p-8 bg-gray-900 text-white space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-20 blur-3xl rounded-full" />
                <div className="flex items-center gap-3">
                   <Activity className="text-blue-400" />
                   <h3 className="text-xl font-black italic tracking-tighter uppercase">Neural Verification</h3>
                </div>
                <div className="p-4 border border-white/20 bg-white/5 font-mono text-xs text-blue-100 leading-relaxed uppercase tracking-wider">
                   {sos.description.match(/\[AI_.*_VERIFIED: (.*?)\]/)?.[0] || 'Strict semantic validation passed. Anomalies mapped.'}
                </div>
             </div>
           ) : null}

           {/* Tactical Timeline Logs */}
           <div className="space-y-6 pt-6">
              <h3 className="text-2xl font-black text-gray-900 italic uppercase flex items-center gap-3 tracking-tighter">
                <Clock size={20} className="text-blue-600" /> Operational Timeline
              </h3>
              
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                 {sos.logs?.map((log, index) => (
                   <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-blue-600 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                         {log.status === 'resolved' ? <CheckCircle size={16} /> : <Target size={16} />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 border border-gray-200 bg-white shadow-sm hover:border-gray-900 transition-all">
                         <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-black text-gray-900 uppercase text-xs tracking-widest">{log.status}</div>
                            <time className="font-mono text-[9px] text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</time>
                         </div>
                         <div className="text-gray-600 text-[10px] font-bold mt-2 bg-gray-50 p-2 italic border-l-2 border-blue-500">
                           {log.message}
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-6">
           <div className="industrial-card p-8 border-t-8 border-gray-900 bg-gray-50 space-y-6">
              <h4 className="tactical-text text-gray-900 border-b border-gray-200 pb-4">Target Intel</h4>
              
              <div className="space-y-4">
                 <div>
                    <p className="text-[9px] uppercase tracking-widest font-black text-gray-400">Geospatial Vector</p>
                    <div className="flex items-start gap-3 mt-2">
                       <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                       <div>
                          <p className="text-xs font-black text-gray-900 uppercase leading-snug">{sos.location?.address || 'Unknown Region'}</p>
                          <p className="text-[10px] font-mono text-gray-500 mt-1">{sos.location?.lat?.toFixed(4)}, {sos.location?.lng?.toFixed(4)}</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="pt-4 border-t border-gray-200">
                    <p className="text-[9px] uppercase tracking-widest font-black text-gray-400">Initiating Entity</p>
                    <div className="flex items-center gap-3 mt-2">
                       <User size={16} className="text-blue-500 shrink-0" />
                       <div>
                          <p className="text-xs font-black text-gray-900 uppercase">{sos.user?.name || 'Anonymous Civilian'}</p>
                          <p className="text-[10px] font-mono text-gray-500">Node: {sos.user?.role?.toUpperCase()}</p>
                       </div>
                    </div>
                 </div>

                 {sos.assignedTo && (
                    <div className="pt-4 border-t border-gray-200">
                       <p className="text-[9px] uppercase tracking-widest font-black text-emerald-600">Active Responder Linked</p>
                       <div className="flex items-center gap-3 mt-2 p-3 bg-emerald-50 border border-emerald-100">
                          <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                          <div>
                             <p className="text-xs font-black text-emerald-900 uppercase">{sos.assignedTo?.name || 'Assigned Agent'}</p>
                             <p className="text-[10px] font-mono text-emerald-700">Comms: {sos.assignedTo?.phone || 'Encrypted'}</p>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           </div>

           {/* ADMIN ONLY CONTROLS - Hardcoded check based on prompt: "only admin can manage them" */}
           {user?.role === 'admin' ? (
             <div className="p-8 border-l-4 border-red-600 bg-white shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                   <ShieldAlert size={18} className="text-red-600" />
                   <h4 className="tactical-text text-gray-900">Admin Override Console</h4>
                </div>
                <p className="text-[10px] font-bold text-gray-500 italic">Global authority recognized. Sub-responder protocols bypassed.</p>
                <div className="space-y-3 pt-4 border-t border-gray-100">
                   <button className="w-full py-4 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em]">
                      Force Assigned Status
                   </button>
                   <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white transition-all text-[10px] font-black uppercase tracking-[0.2em]">
                      Force Resolve & Archive
                   </button>
                </div>
             </div>
           ) : (
             <div className="p-6 bg-gray-100 border border-gray-200 text-center space-y-2">
                <Target size={24} className="text-gray-300 mx-auto" />
                <p className="tactical-text text-gray-400">Pristine Protocol Active</p>
                <p className="text-[9px] font-bold uppercase text-gray-400 italic">Read-Only Intel Access.<br/>Mission control restricted to Admins.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SOSDetail;
