import React, { useState, useEffect } from 'react';
import { ShieldAlert, MapPin, Activity, CheckCircle, Smartphone, Info, ChevronRight, Zap, Target, Database, Camera, AlertTriangle } from 'lucide-react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import SOSCamera from '../components/SOSCamera';

const SOS_CATEGORIES = [
  { id: 'medical', label: 'Medical Emergency', severity: 'critical', icon: 'M', type: 'medical', category: 'disaster' },
  { id: 'fire', label: 'Structural Fire', severity: 'critical', icon: 'F', type: 'fire_safety', category: 'disaster' },
  { id: 'flood', label: 'Water Discharge/Flood', severity: 'high', icon: 'W', type: 'hazard', category: 'disaster' },
  { id: 'security', label: 'Public Security', severity: 'high', icon: 'S', type: 'rescue', category: 'community' },
  { id: 'community', label: 'Civic Malfunction', severity: 'medium', icon: 'C', type: 'utility', category: 'community' },
  { id: 'other', label: 'Other Anomaly', severity: 'low', icon: 'O', type: 'other', category: 'other' }
];

const RaiseSOS = () => {
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [manualAddress, setManualAddress] = useState('');
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: 'Gps_Resolved_Location'
        });
      });
    }
  }, []);

  const handleAiCapture = (data) => {
    setAiData(data);
    setShowCamera(false);
    // Auto-select category if appropriate or just update urgency
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !description) return;
    setLoading(true);
    try {
      let finalLocation = location;

      // Forcefully bypass and take location from manual Address via OpenStreetMap
      if (!finalLocation && manualAddress) {
         try {
            const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}`);
            const nomData = await nomRes.json();
            if (nomData && nomData.length > 0) {
               finalLocation = {
                  lat: parseFloat(nomData[0].lat),
                  lng: parseFloat(nomData[0].lon),
                  address: manualAddress
               };
            }
         } catch (geoErr) {
            console.error("Geocoding failed", geoErr);
         }
      }

      // If absolutely no location could be derived, fallback to approximate
      if (!finalLocation) {
         finalLocation = {
           lat: 31.2560 + (Math.random() * 0.05), // Approximate coordinate fallback
           lng: 75.7050 + (Math.random() * 0.05),
           address: manualAddress || 'Unknown GPS / Manual Override'
         };
      }

      await API.post('/sos', {
        type: selectedCategory.type,
        category: selectedCategory.category,
        description: `${description} \n\n[Location Note: ${manualAddress}]`,
        location: finalLocation,
        urgency: aiData?.urgency || selectedCategory.severity,
        aiDistressScore: aiData?.distressScore,
        aiSentiment: aiData?.sentiment,
        photo: aiData?.photo
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Database validation failed. Ensure categories are correct.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-6 text-center space-y-8 animate-in zoom-in-95 duration-700">
        <div className="flex justify-center">
           <div className="bg-red-600 p-8 text-white shadow-2xl border-4 border-white animate-pulse">
              <CheckCircle size={80} />
           </div>
        </div>
        <div className="space-y-2">
           <h2 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">Signal Broad-cast</h2>
           <p className="tactical-text text-red-600">Transmission Successful // Responders Notified</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 space-y-12">
      {/* Tactical Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-900/10 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="bg-red-600 p-2 text-white">
                <Target size={20} />
             </div>
             <span className="tactical-text text-gray-400">Emergency Protocol: SOP-82</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-gray-900 leading-none uppercase">
            Initialize <br /> <span className="text-red-600">SOS Signal</span>
          </h1>
        </div>
        <div className="flex flex-col items-start md:items-end gap-4 w-full md:w-auto mt-6 md:mt-0">
           <button 
             onClick={() => setShowCamera(true)}
             className="bg-gray-900 text-white px-8 py-5 text-xs font-black uppercase tracking-[0.3em] hover:bg-black transition-all flex items-center gap-4 shadow-xl shadow-gray-200"
           >
             Launch AI Scanning Lens <Camera size={18} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Form Matrix */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-10">
          <div className="space-y-4">
             <label className="tactical-text text-gray-400 font-black flex items-center gap-2">
                <Database size={14} /> Mission Category
             </label>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SOS_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`p-6 border transition-all text-left relative group ${
                      selectedCategory?.id === cat.id 
                      ? 'border-gray-900 bg-gray-900 text-white' 
                      : 'border-gray-200 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <span className="absolute top-2 right-4 text-[40px] font-black opacity-10 group-hover:opacity-20 transition-opacity">{cat.icon}</span>
                    <p className="font-black text-[10px] uppercase tracking-widest relative z-10">{cat.label}</p>
                    <p className={`text-[8px] font-mono mt-2 ${selectedCategory?.id === cat.id ? 'text-gray-400' : 'text-gray-400'}`}>BASE_LEVEL: {cat.severity.toUpperCase()}</p>
                  </button>
                ))}
            </div>
          </div>

          <div className="space-y-4">
             <label className="tactical-text text-gray-400 font-black flex items-center gap-2">
                <Smartphone size={14} /> Incident Telemetry (Description)
             </label>
             <textarea 
               required
               placeholder="Describe the anomaly/emergency in detail..."
               className="w-full bg-gray-50 border border-gray-200 p-6 h-40 outline-none focus:border-gray-900 focus:bg-white font-medium text-sm transition-all"
               value={description}
               onChange={(e) => setDescription(e.target.value)}
             />
          </div>

          <div className="space-y-4">
             <label className="tactical-text text-gray-400 font-black flex items-center gap-2">
                <MapPin size={14} /> Explicit Target Address
             </label>
             <input 
               type="text" 
               required={!location}
               placeholder="If GPS is unavailable, explicitly type the exact name (e.g., LPU Boys Hostel 4)..."
               className="w-full bg-gray-50 border border-gray-200 p-4 outline-none focus:border-gray-900 focus:bg-white font-medium text-sm transition-all"
               value={manualAddress}
               onChange={(e) => setManualAddress(e.target.value)}
             />
          </div>

          {formError && (
             <div className="p-4 bg-red-50 border border-red-200 text-red-600 font-bold text-xs uppercase tracking-wider">
                System Error: {formError}
             </div>
          )}

          <div className="flex gap-4 pt-4">
             <button 
               type="submit"
               disabled={loading || !selectedCategory}
               className="flex-1 py-6 bg-red-600 text-white font-black text-xs uppercase tracking-[0.5em] hover:bg-red-700 transition-all disabled:opacity-30 shadow-2xl shadow-red-100 flex items-center justify-center gap-3"
             >
               {loading ? 'Initializing Sync...' : 'Broadcast SOS Signal'} <Zap size={18} />
             </button>
          </div>
        </form>

        {/* Tactical Intel Sidebar */}
        <div className="lg:col-span-2 space-y-8">
           <div className="industrial-card p-8 bg-gray-50 space-y-8 border-l-4 border-l-gray-900">
              <div className="space-y-1">
                 <h3 className="tactical-text text-gray-900">Signal Intelligence</h3>
                 <p className="text-[9px] font-mono text-gray-400">Node: Local_User_Client_82</p>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">Operational Location</label>
                    <div className="flex items-center gap-3 p-4 bg-white border border-gray-200">
                       <MapPin size={18} className="text-gray-400" />
                       <span className="text-xs font-mono font-bold text-gray-700">{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'ACQUIRING_GPS...'}</span>
                    </div>
                 </div>

                 {aiData && (
                   <div className="p-6 bg-gray-900 text-white border-l-4 border-l-blue-600 animate-in slide-in-from-right-4">
                      <div className="flex items-center gap-3 mb-4">
                         <Activity size={18} className="text-blue-400" />
                         <span className="tactical-text text-white">Neural Scene Analysis</span>
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Distress_Impact</span>
                            <span className="text-2xl font-black data-value text-blue-400">{aiData.distressScore}%</span>
                         </div>
                         <div className="h-1 bg-white/10 overflow-hidden">
                            <div className="h-full bg-blue-500 w-full" style={{ width: `${aiData.distressScore}%` }} />
                         </div>
                         <p className="text-[9px] font-mono text-blue-300">SENTIMENT: {aiData.sentiment}</p>
                      </div>
                   </div>
                 )}

                 <div className="p-4 border border-red-100 bg-red-50 space-y-3">
                    <div className="flex items-center gap-2 text-red-600">
                       <AlertTriangle size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Protocol Warning</span>
                    </div>
                    <p className="text-[11px] font-medium text-red-800 leading-relaxed italic">
                       Avoid false broadcasts. All signals are encrypted and logged for post-operational auditing.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {showCamera && (
        <SOSCamera 
          onCapture={handleAiCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}
    </div>
  );
};

export default RaiseSOS;
