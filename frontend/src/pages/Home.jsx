import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Users, Activity, Zap, Globe, ShieldCheck, BarChart3, CheckCircle } from 'lucide-react';
import API from '../api/axios';

const Home = () => {
  const [stats, setStats] = React.useState({
    activeMissions: 0,
    verifiedResponders: 0,
    neuralSignals: 0,
    trustIndex: '99.9%'
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/stats');
        setStats({
          activeMissions: data.activeMissions,
          verifiedResponders: data.verifiedResponders,
          neuralSignals: data.neuralSignals,
          trustIndex: data.verifiedResponders > 0 ? '99.4%' : '100.0%'
        });
      } catch (err) {
        console.error('Stats Sync Error:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-12 py-8 px-6 max-w-7xl mx-auto">
      {/* Tactical Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-900/10 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 text-blue-600 rounded-full">
              <Globe size={20} />
            </div>
            <span className="font-semibold text-sm text-slate-500 tracking-wide uppercase">System Status: Interlinked</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Global <br /> <span className="text-blue-600">Response</span> <br /> Network
          </h1>
        </div>
        <div className="flex flex-col items-start md:items-end gap-5 mt-4 md:mt-0">
          <p className="text-left md:text-right text-slate-500 font-medium text-sm max-w-sm leading-relaxed">
            Consolidated intelligence and real-time tactical deployment for global disaster synchronization.
          </p>
          <div className="flex gap-4">
            <Link 
              to="/social-monitor" 
              className="bg-blue-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all flex items-center gap-3"
            >
              Monitor Intelligence <Activity size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Missions', value: stats.activeMissions, icon: <Zap size={20} />, status: 'Real-time' },
          { label: 'Verified Responders', value: stats.verifiedResponders, icon: <Users size={20} />, status: 'Online' },
          { label: 'Neural Signals', value: stats.neuralSignals, icon: <Activity size={20} />, status: 'Processed' },
          { label: 'Trust Index', value: stats.trustIndex, icon: <ShieldCheck size={20} />, status: 'Nominal' },
        ].map((stat, i) => (
          <div key={i} className="industrial-card p-8 space-y-4 group">
            <div className="flex justify-between items-start">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {stat.icon}
               </div>
               <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{stat.status}</span>
            </div>
            <div className="space-y-1">
               <p className="tactical-text">{stat.label}</p>
               <p className="text-4xl data-value group-hover:text-blue-600 transition-colors">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tactical Capabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 industrial-card p-10 space-y-6 relative overflow-hidden group border-slate-200/60">
           <div className="absolute top-0 right-0 p-8 origin-center opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none text-blue-900">
              <ShieldAlert size={240} strokeWidth={1} />
           </div>
           <div className="relative space-y-5 z-10">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">Critical Response Protocol</h2>
              <p className="text-slate-500 font-medium leading-relaxed max-w-xl text-lg">
                 Launch instantaneous SOS signals with embedded AI scene analysis. Our neural network categorizes distress levels in real-time.
              </p>
              <div className="pt-4">
                 <Link 
                   to="/raise-sos" 
                   className="inline-flex items-center gap-3 py-4 px-8 rounded-full bg-red-500 text-white font-bold hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all"
                 >
                   Initialize SOS Request <ShieldAlert size={18} />
                 </Link>
              </div>
           </div>
        </div>

        <div className="industrial-card p-10 bg-slate-800 border-none text-white space-y-8 relative overflow-hidden">
           <div className="space-y-2 relative z-10">
              <h3 className="text-2xl font-bold tracking-tight text-white">Console Access</h3>
              <p className="text-slate-400 font-medium text-sm leading-relaxed">
                 Mission Control interface for verified administrators and relief coordinators.
              </p>
           </div>
           <ul className="space-y-5 relative z-10">
              {['Live Deployment Mapping', 'Resource Heatmaps', 'Volunteer Trust Scoring'].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-sm font-semibold text-slate-300">
                   <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-blue-400">
                     <CheckCircle size={14} />
                   </div> 
                   {item}
                </li>
              ))}
           </ul>
           <div className="pt-2 relative z-10">
              <Link 
                to="/admin" 
                className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-3"
              >
                Launch Console <BarChart3 size={18} />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
