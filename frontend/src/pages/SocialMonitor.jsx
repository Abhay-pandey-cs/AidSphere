import React, { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Share2, ShieldAlert, CheckCircle, ExternalLink, RefreshCw, Activity, Zap, Info, ArrowUp, XCircle, Trash2 } from 'lucide-react';
import { FeedSkeleton } from '../components/Skeleton';

const SocialMonitor = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/social-monitor/feed');
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(() => {
      fetchPosts();
    }, 30000); // 30s Industrial Sync
    return () => clearInterval(interval);
  }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      await API.post('/social-monitor/scrape');
      fetchPosts();
    } catch (err) {
      console.error('Sync Failed', err);
    } finally {
      setScanning(false);
    }
  };

  const handleUpvote = async (id) => {
    try {
      const { data } = await API.post(`/social-monitor/upvote/${id}`);
      setPosts(prev => prev.map(p => p._id === id ? data : p));
    } catch (err) {
      console.error('Upvote Failed', err);
    }
  };

  const handleConvertToSOS = async (post) => {
    try {
      await API.post(`/social-monitor/convert/${post._id}`);
      // Remove from pending intel feed with a visual flair if possible, but for now just filter
      setPosts(prev => prev.filter(p => p._id !== post._id));
    } catch (err) {
      console.error('Failed to convert signal to SOS:', err);
      alert(err.response?.data?.message || 'Error converting signal');
    }
  };

  const handleDismiss = async (id) => {
    if (!window.confirm("PERMANENT DATA PURGE: Are you sure you want to delete this signal from the database? This action is irreversible.")) return;
    try {
      await API.delete(`/social-monitor/${id}`);
      setPosts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error('Dismissal Failed:', err);
      alert('Error dismissing signal');
    }
  };

  const handlePurge = async () => {
    if (!window.confirm("CRITICAL PURGE: Permanently delete ALL intelligence records in this feed? This is irreversible.")) return;
    try {
       await API.delete('/social-monitor/purge');
       setPosts([]);
    } catch (err) {
       console.error('Purge Failed:', err);
       alert('Failed to purge neural feed');
    }
  };

  return (
    <div className="w-full py-8 px-6 space-y-8">
      {/* Tactical Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-1">
             <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                <Activity size={20} />
             </div>
             <h1 className="text-3xl font-bold tracking-tight text-slate-900">Neural Intelligence Feed</h1>
          </div>
          <p className="text-sm font-medium text-slate-500 pl-14">Deep-Stream Intelligence Feed &amp; Signal Analysis</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePurge}
            className="p-3.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full border border-slate-100 transition-all hover:scale-110"
            title="Terminal Purge (Hard Delete All)"
          >
             <Trash2 size={20} />
          </button>
          <button 
            onClick={handleScan}
            disabled={scanning}
            className="bg-blue-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {scanning ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
            {scanning ? 'Syncing Feeds...' : 'Initialize Deep Scan'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 xxl:grid-cols-4 gap-8">
        {/* Main Intelligence Feed */}
        <div className="xl:col-span-3 space-y-4">
          {loading ? (
            <div className="space-y-4">
               {[1, 2, 3].map(i => <FeedSkeleton key={i} />)}
            </div>
          ) : posts.map((post) => (
            <div key={post._id} className="industrial-card hover:border-blue-500 transition-all group relative overflow-hidden flex bg-white font-sans">
               {/* Left Sidebar Stat - Industrial Style */}
               <div className="w-20 flex flex-col items-center py-8 border-r border-gray-100 bg-gray-50/80">
                  <div className="flex flex-col items-center gap-1 mb-4">
                     <p className="text-[7px] font-black text-gray-400 uppercase">Neural</p>
                     <div className={`text-xl font-black data-value ${post.neuralScore > 80 ? 'text-red-600' : 'text-blue-600'}`}>
                        {post.neuralScore}
                     </div>
                  </div>
                  <div className="h-16 w-1 bg-gray-200 relative overflow-hidden flex flex-col-reverse">
                     <div className={`w-full transition-all duration-1000 ${post.neuralScore > 80 ? 'bg-red-600' : 'bg-blue-600'}`} style={{ height: `${post.neuralScore}%` }} />
                  </div>
               </div>
               
               {/* Post Body */}
               <div className="flex-1 p-8 space-y-6">
                  <div className="flex items-start justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-900 flex items-center justify-center text-white text-xs font-black shadow-lg">
                           {post.platform ? post.platform.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-gray-900 tracking-tight">{post.author}</span>
                           <span className="text-[10px] text-gray-500 font-bold uppercase">{post.platform || 'UNKNOWN_SOURCE'}</span>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${post.neuralScore > 80 ? 'bg-red-600 animate-pulse' : 'bg-blue-600'}`} />
                           <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${post.neuralScore > 80 ? 'text-red-600' : 'text-blue-600'}`}>
                              {post.neuralScore > 80 ? 'Distress_Critical' : 'Nominal_Signal'}
                           </span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 border border-gray-100 italic">
                           {new Date(post.timestamp).toLocaleString()}
                        </span>
                     </div>
                  </div>

                  <p className="text-base font-bold text-gray-800 leading-snug border-l-2 border-gray-100 pl-4 py-1 italic">
                     "{post.content}"
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-50">
                     <div className="space-y-1">
                        <p className="text-[8px] font-black text-gray-400 uppercase">Confidence</p>
                        <p className="text-xs font-mono font-bold text-gray-900">{post.confidence?.toFixed(2)}%</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[8px] font-black text-gray-400 uppercase">Impact_Radius</p>
                        <p className="text-xs font-mono font-bold text-blue-600">{post.impactRadius}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[8px] font-black text-gray-400 uppercase">Regional_Node</p>
                        <p className="text-xs font-mono font-bold text-gray-900">{post.location?.region?.toUpperCase() || 'GLOBAL'}</p>
                     </div>
                     <div className="space-y-1 text-right">
                        <p className="text-[8px] font-black text-gray-400 uppercase">Handled_By</p>
                        <p className="text-xs font-mono font-bold text-gray-900">NEURAL_V4</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-6 pt-4 border-t border-gray-100 justify-between">
                     <div className="flex gap-6 items-center">
                        <button 
                          onClick={() => handleUpvote(post._id)} 
                          className={`flex items-center gap-2 text-xs font-bold transition-colors uppercase tracking-widest px-4 py-2 rounded-full ${
                             post.upvotes?.includes(user?._id) ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                           <ArrowUp size={16} className={post.upvotes?.includes(user?._id) ? 'text-blue-600' : ''} />
                           Upvote ({post.upvotes?.length || 0})
                        </button>
                        
                        {user?.role === 'admin' && (
                          <div className="flex items-center gap-2">
                            <div className="w-px h-6 bg-slate-200" />
                            <button onClick={() => handleConvertToSOS(post)} className="flex items-center gap-2 text-[10px] font-black text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest bg-red-50 px-3 py-1.5 rounded-full">
                               <ShieldAlert size={14} /> Convert to SOS
                            </button>
                            <button 
                              onClick={() => handleDismiss(post._id)} 
                              title="Dismiss Signal" 
                              className="bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
                            >
                               <XCircle size={18} />
                            </button>
                          </div>
                        )}
                     </div>
                     <a 
                       href={post.link} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="flex items-center gap-2 text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest"
                     >
                        View on {post.platform?.replace('_', ' ') || 'Source'} <ExternalLink size={12} />
                     </a>
                  </div>
               </div>
            </div>
          ))}
        </div>

        {/* Tactical Intel Sidebar */}
        <div className="space-y-6">
           <div className="industrial-card p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                 <h3 className="text-lg font-bold text-slate-800">Neural Scanner</h3>
                 <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm" />
              </div>
              
              <div className="space-y-5">
                {[
                  { label: 'Scanned Signals', value: '42.9k', sub: 'Last 10m' },
                  { label: 'Positive Matches', value: '18', sub: 'Action Required' },
                  { label: 'Neural Latency', value: '0.04ms', sub: 'Peak Efficiency' }
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                     <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
                     <div className="flex items-end gap-3">
                        <span className="text-2xl font-bold tracking-tight text-slate-800">{stat.value}</span>
                        <span className="text-xs font-semibold text-emerald-600 tracking-wide mb-1.5">{stat.sub}</span>
                     </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                 <div className="flex items-center gap-2">
                    <Activity size={14} className="text-blue-600" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Live Activity</span>
                 </div>
                 <div className="space-y-2 opacity-90">
                    <p className="text-xs font-mono leading-relaxed border-l-2 border-blue-500 pl-3 text-slate-600">[SYNC] Global ID: 0x82... Connected</p>
                    <p className="text-xs font-mono leading-relaxed border-l-2 border-emerald-500 pl-3 text-slate-600">[INTEL] Distress signal analyzed</p>
                 </div>
              </div>
           </div>

           <div className="industrial-card p-6 space-y-4 border-l-4 border-l-blue-600">
              <div className="flex items-center gap-3">
                 <Info className="text-blue-600" size={20} />
                 <h4 className="text-xs font-black uppercase tracking-widest">Protocol Intelligence</h4>
              </div>
              <p className="text-[11px] font-medium text-gray-500 leading-relaxed italic">
                 AI Sentiment Scoring is derived from a 3-layer neural analysis of text, geo-spatial data, and historical distress patterns.
              </p>
              <div className="w-full h-1 bg-gray-100 overflow-hidden">
                 <div className="h-full bg-blue-600 w-2/3" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMonitor;
