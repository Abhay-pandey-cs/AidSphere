import React, { useEffect, useState } from 'react';
import { CloudLightning, Thermometer, Wind, AlertTriangle, X, Activity, Bell } from 'lucide-react';
import API from '../api/axios';

const WeatherAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [latestAlert, setLatestAlert] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchAlerts = async () => {
      try {
        const { data } = await API.get('/weather/alerts');
        if (!mounted) return;
        setAlerts(prev => {
           // Trigger toast if initial load or new anomaly detected
           if (data.length > 0 && (!prev.length || prev[0].id !== data[0].id)) {
              setLatestAlert(data[0]);
              setTimeout(() => { if (mounted) setLatestAlert(null); }, 6000);
           }
           return data;
        });
      } catch (err) {
        console.error('Failed to fetch weather alerts:', err);
      }
    };
    
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000); // Live polling
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (alerts.length === 0) return null;

  return (
    <>
      {/* Animated Drop-Down Toast (Slides from top) */}
      <div 
        className={`fixed top-8 right-8 z-[1100] w-96 transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none ${
          latestAlert ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-95'
        }`}
      >
        {latestAlert && (
          <div className="bg-white border-2 border-red-100 text-slate-800 p-6 rounded-3xl shadow-[0_20px_50px_rgba(220,38,38,0.1)] relative overflow-hidden group pointer-events-auto">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-red-500">
               <Activity size={80} />
            </div>
            
            <button 
              onClick={() => setLatestAlert(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 p-1.5 rounded-full"
            >
              <X size={14} />
            </button>
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl animate-pulse">
                 <AlertTriangle size={24} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wide">Live Anomaly</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-red-100 text-red-700">
                    {latestAlert.severity}
                  </span>
                </div>
                <div>
                   <p className="text-xl font-bold tracking-tight text-slate-900">{latestAlert.type}</p>
                   <p className="font-semibold text-red-500 text-sm mt-1 flex items-center gap-1">
                      <CloudLightning size={14} />
                      {latestAlert.region}
                   </p>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{latestAlert.detail}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Notification Bell & History Panel */}
      <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-end gap-4">
         {/* History Popover */}
         <div className={`transition-all duration-300 origin-bottom-right ${showHistory ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>
           <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-96 flex flex-col overflow-hidden max-h-[500px]">
             <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex gap-2 items-center">
                   <Bell size={16} className="text-slate-500" />
                   <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Anomaly History</h3>
                </div>
                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">
                   <X size={16} />
                </button>
             </div>
             <div className="p-4 overflow-y-auto space-y-3">
               {alerts.map(alert => (
                 <div key={alert.id} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${alert.severity === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                         {alert.severity}
                       </span>
                       <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">{alert.type}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{alert.region}</p>
                 </div>
               ))}
             </div>
           </div>
         </div>
         
         {/* Floating Action Button (Bell) */}
         <button 
           onClick={() => setShowHistory(!showHistory)} 
           className="bg-slate-900 p-4 rounded-full shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all text-white border-4 border-white group relative"
         >
           <Bell size={24} className={latestAlert ? 'animate-bounce text-red-400' : 'group-hover:text-blue-400 transition-colors'} />
           {alerts.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 border-2 border-white text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold shadow-sm">
                 {alerts.length}
              </span>
           )}
         </button>
      </div>
    </>
  );
};

export default WeatherAlerts;
