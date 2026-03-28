import React, { useEffect, useState, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { ShieldAlert, MapPin, User, Clock, Activity, Target, Filter } from 'lucide-react';

// Fix for default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const SOSMarker = ({ sos }) => {
  return (
    <Popup className="industrial-popup">
        <div className="p-4 min-w-[240px] space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <div className={`p-2 ${sos.urgency === 'critical' ? 'bg-red-600' : 'bg-amber-500'} text-white`}>
              <ShieldAlert size={16} />
            </div>
            <span className="text-sm font-black text-gray-900 uppercase italic tracking-tighter">{sos.type} SOS</span>
          </div>
          <p className="text-gray-600 text-[11px] font-bold leading-relaxed uppercase">"{sos.description}"</p>
          <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-3">
            <div className="space-y-1">
               <p className="text-[8px] font-black text-gray-400 uppercase">Deployed By</p>
               <p className="text-[10px] font-black text-blue-600 uppercase truncate">{sos.user?.name || 'Anonymous'}</p>
            </div>
            <div className="space-y-1 text-right">
               <p className="text-[8px] font-black text-gray-400 uppercase">Signal Time</p>
               <p className="text-[10px] font-mono font-bold text-gray-900">{new Date(sos.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </Popup>
  );
};

const HotspotMarker = ({ spot, isNearby }) => {
  return (
    <Popup className="industrial-popup">
        <div className="p-5 min-w-[300px] space-y-4 bg-gray-900 text-white border-l-4 border-blue-600">
          <div className="flex justify-between items-start border-b border-white/10 pb-4">
             <div className="space-y-1">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] italic">Neural_Intelligence_Node</span>
                <h3 className="text-sm font-black uppercase tracking-tighter">SIG-{spot._id.toUpperCase()}</h3>
             </div>
             <div className="bg-blue-600/20 p-2 border border-blue-500/30">
                <Target size={16} className="text-blue-400" />
             </div>
          </div>

          <div className="space-y-4">
             <div className="p-3 bg-white/5 border border-white/10 rounded-sm">
                <p className="text-[10px] font-medium leading-relaxed italic text-gray-400">"{spot.text}"</p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <div className="flex justify-between text-[8px] font-black uppercase text-gray-500">
                      <span>Neural_Distress</span>
                      <span className="text-blue-400">{spot.confidence}%</span>
                   </div>
                   <div className="h-1 bg-white/10 overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${spot.confidence}%` }} />
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[8px] font-black uppercase text-gray-500">
                      <span>Sentiment_Polarity</span>
                      <span className={spot.sentiment === 'negative' ? 'text-red-500' : 'text-emerald-500'}>{spot.sentiment.toUpperCase()}</span>
                   </div>
                   <div className="h-1 bg-white/10 overflow-hidden">
                      <div className={`h-full ${spot.sentiment === 'negative' ? 'bg-red-600' : 'bg-emerald-600'}`} style={{ width: '100%' }} />
                   </div>
                </div>
             </div>

             <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[9px] font-mono text-gray-500 uppercase italic">
                <div className="flex items-center gap-2">
                   <Clock size={12} /> {spot.timestamp}
                </div>
                <div className="flex items-center gap-2">
                   <Activity size={12} /> {spot.source}
                </div>
             </div>
          </div>
          
          <a 
            href={spot.link || '#'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`block text-center w-full py-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg border ${
              isNearby ? 'border-red-500 text-red-500 bg-red-900/20 hover:bg-red-900/40' : 'border-gray-600 text-gray-400 hover:text-gray-200 bg-gray-800'
            }`}
          >
             {isNearby ? 'NEARBY THREAT - VIEW SOURCE' : 'Review Source Origin'}
          </a>
          <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg">
             Convert to SOS Request
          </button>
        </div>
      </Popup>
  );
};

const DisasterMap = () => {
  const [sosRequests, setSosRequests] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [radiusFilter, setRadiusFilter] = useState('all'); // all, 10, 50, 100, 500
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return Infinity;
    const pt1 = L.latLng(lat1, lng1);
    const pt2 = L.latLng(lat2, lng2);
    return pt1.distanceTo(pt2) / 1000; // Return in kilometers
  };

  const withinRadius = (itemLoc) => {
    if (radiusFilter === 'all') return true;
    const centerLat = user?.location?.lat || 20.5937;
    const centerLng = user?.location?.lng || 78.9629;
    const distanceKm = calculateDistance(centerLat, centerLng, itemLoc?.lat, itemLoc?.lng);
    return distanceKm <= parseInt(radiusFilter);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sosData } = await API.get('/sos');
        setSosRequests(sosData);
        
        // Fetch Live Neural Hotspots
        const { data: intelData } = await API.get('/social-monitor/feed');
        
        // Map NASA EONET data to the Hotspot format
        const mappedHotspots = intelData.map(post => ({
          _id: post._id,
          text: post.content,
          location: post.location,
          confidence: post.confidence,
          sentiment: post.sentiment || 'warning',
          timestamp: new Date(post.timestamp).toLocaleTimeString() + ' (L-SYNC)',
          source: post.platform,
          link: post.link
        }));
        
        setHotspots(mappedHotspots);
      } catch (err) {
        console.error('Failed to fetch map data:', err);
      }
    };

    fetchData();

    if (socket) {
      socket.on('newSOS', (newSOS) => setSosRequests(prev => [newSOS, ...prev]));
      socket.on('updateSOS', (updated) => setSosRequests(prev => prev.map(s => s._id === updated._id ? updated : s)));
    }

    return () => {
      socket?.off('newSOS');
      socket?.off('updateSOS');
    };
  }, [socket]);

  return (
    <div className="h-[calc(100vh-200px)] w-full border border-gray-900/10 shadow-2xl relative group overflow-hidden">
      {/* Tactical UI Overlay */}
      <div className="absolute top-8 left-8 z-[1000] bg-white/95 backdrop-blur-md p-8 border border-gray-900/10 shadow-2xl space-y-6 max-w-xs">
        <div className="space-y-1 border-b border-gray-900 pb-4">
           <h2 className="text-xl font-black text-gray-900 tracking-tighter flex items-center gap-3 uppercase italic leading-none">
             <MapPin size={24} className="text-blue-600" />
             Intelligence <br /> Deployment Grid
           </h2>
           <p className="tactical-text text-gray-400">Regional Node: South_Asia_7</p>
        </div>
        
        <div className="space-y-3">
           <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 group hover:border-red-600 transition-all">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                   <div className="w-2 h-2 bg-red-600 animate-ping" /> Live SOS Signal
                </span>
                <p className="text-[9px] font-mono text-gray-400">URGENCY: CRITICAL</p>
             </div>
             <span className="data-value text-2xl text-gray-900">{sosRequests.length}</span>
           </div>
           
           <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 group hover:border-blue-600 transition-all">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                   <Activity size={12} /> Neural Hotspots
                </span>
                <p className="text-[9px] font-mono text-gray-400">CONFIDENCE: 80%+</p>
             </div>
             <span className="data-value text-2xl text-gray-900">{hotspots.filter(h => withinRadius(h.location)).length}</span>
           </div>
        </div>

        <div className="pt-4 border-t border-gray-900/10 space-y-3">
           <label className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 text-gray-500">
             <Filter size={12} /> Proximity Radius
           </label>
           <select 
             value={radiusFilter}
             onChange={(e) => setRadiusFilter(e.target.value)}
             className="w-full bg-gray-50 border border-gray-200 p-2 text-xs font-bold text-gray-700 outline-none hover:border-blue-400 transition-all"
           >
             <option value="all">Global Array (All)</option>
             <option value="10">10 km Radius</option>
             <option value="50">50 km Radius</option>
             <option value="100">100 km Radius</option>
             <option value="500">500 km Radius</option>
           </select>
        </div>

        <div className="pt-4 flex items-center gap-2 tactical-text text-[9px] text-gray-300">
           <div className="w-2 h-2 bg-gray-300" /> SYNC_NOMINAL // V8.2
        </div>
      </div>
      
      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }} className="z-0 border-y border-white/5 bg-[#0a0a0a]">
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {sosRequests.filter(sos => withinRadius(sos.location)).map((sos) => (
          <Marker 
            key={sos._id} 
            position={[sos.location.lat, sos.location.lng]}
            eventHandlers={{ click: () => setSelectedItem({ ...sos, type: 'SOS_SIGNAL' }) }}
          >
            <SOSMarker sos={sos} />
          </Marker>
        ))}
        {hotspots.filter(spot => withinRadius(spot.location)).map((spot) => {
          const centerLat = user?.location?.lat || 20.5937;
          const centerLng = user?.location?.lng || 78.9629;
          const distKm = calculateDistance(centerLat, centerLng, spot.location.lat, spot.location.lng);
          return (
          <Marker 
            key={spot._id} 
            position={[spot.location.lat, spot.location.lng]}
            eventHandlers={{ click: () => setSelectedItem({ ...spot, type: 'NEURAL_HOTSPOT' }) }}
          >
            <HotspotMarker spot={spot} isNearby={distKm < 20} />
          </Marker>
        )})}
      </MapContainer>

      {/* Strategic Intelligence Sidebar */}
      {selectedItem && (
        <div className="absolute top-8 right-8 z-[1000] w-80 bg-gray-900 border border-white/10 shadow-2xl animate-in slide-in-from-right-8">
           <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gray-800">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Signal_Analysis</span>
              <button onClick={() => setSelectedItem(null)} className="text-gray-500 hover:text-white">×</button>
           </div>
           
           <div className="p-6 space-y-6">
              <div className="space-y-1">
                 <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">
                   {selectedItem.type} // {selectedItem._id.slice(-6).toUpperCase()}
                 </h3>
                 <p className="text-[9px] font-mono text-gray-500">TIMESTAMP: {selectedItem.timestamp || (selectedItem.createdAt && !isNaN(new Date(selectedItem.createdAt)) ? new Date(selectedItem.createdAt).toISOString() : new Date().toISOString())}</p>
              </div>

              <div className="space-y-2">
                 <label className="text-[8px] font-black text-gray-400 uppercase">Raw_Payload</label>
                 <div className="p-4 bg-black/50 border border-white/5 font-mono text-[10px] text-emerald-500/80 leading-relaxed overflow-auto max-h-32">
                    {JSON.stringify(selectedItem, null, 2)}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-white/5">
                 <div className="p-3 bg-gray-900">
                    <p className="text-[7px] font-black text-gray-500 uppercase">Distress_Score</p>
                    <p className="text-sm font-black text-white">{selectedItem.confidence || 100}%</p>
                 </div>
                 <div className="p-3 bg-gray-900">
                    <p className="text-[7px] font-black text-gray-500 uppercase">Sector_ID</p>
                    <p className="text-sm font-black text-white">S-01-IND</p>
                 </div>
              </div>

              <div className="space-y-3">
                 <button 
                   onClick={async () => {
                     try {
                       const sosData = {
                         type: 'NEURAL_DISTRESS',
                         description: selectedItem.text,
                         location: selectedItem.location,
                         urgency: selectedItem.confidence > 80 ? 'critical' : 'high',
                         category: 'disaster'
                       };
                       await API.post('/sos', sosData);
                       setSelectedItem(null);
                       alert("SOS SIGNAL INITIALIZED FROM HOTSPOT");
                     } catch (err) {
                       alert("Uplink Failure: Could not convert signal.");
                     }
                   }}
                   className="w-full py-4 bg-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                 >
                    Convert to Official SOS
                 </button>
                 <button className="w-full py-4 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all">
                    Broadcast Advisory
                 </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .industrial-popup .leaflet-popup-content-wrapper {
          border-radius: 0 !important;
          padding: 0 !important;
          border: 1px solid rgba(0,0,0,0.1);
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
        }
        .industrial-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        .industrial-popup .leaflet-popup-tip {
          background: #fff;
        }
      `}</style>
    </div>
  );
};

export default DisasterMap;
