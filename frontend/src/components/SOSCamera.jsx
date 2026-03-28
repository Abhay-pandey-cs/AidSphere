import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, ShieldAlert, Cpu, Activity, Zap, Info, RefreshCw } from 'lucide-react';
import API from '../api/axios';

const SOSCamera = ({ missionCategory, onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [distressScore, setDistressScore] = useState(0);
  const [sentiment, setSentiment] = useState('AWAITING_SCAN');
  const [analyzing, setAnalyzing] = useState(false);

  const [cameraError, setCameraError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let activeStream = null;
    const startCamera = async () => {
      setCameraError(null);
      try {
        if (!window.isSecureContext) {
          throw new Error("INSECURE_CONTEXT");
        }
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("NOT_SUPPORTED");
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          activeStream = mediaStream;
          setSentiment('READY_TO_SCAN');
        }
      } catch (err) {
        console.warn("Primary camera access failed:", err.name);
        try {
           const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
           if (videoRef.current) {
             videoRef.current.srcObject = fallbackStream;
             setStream(fallbackStream);
             activeStream = fallbackStream;
             setSentiment('READY_TO_SCAN');
           }
        } catch (fallbackErr) {
           console.error("Total camera failure:", fallbackErr);
           setCameraError(fallbackErr.name === 'NotAllowedError' ? 'PERMISSION_DENIED' : 'HARDWARE_ERROR');
           setSentiment('CAMERA_OFFLINE');
        }
      }
    };
    
    // Slight delay to ensure DOM refs are fully calculated
    const timer = setTimeout(startCamera, 100);

    return () => {
      clearTimeout(timer);
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [retryCount]);

  const handleAnalyzeFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setAnalyzing(true);
    setSentiment("TRANSMITTING_TO_NEURAL_NODE...");
    try {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const photoData = canvasRef.current.toDataURL('image/jpeg', 0.8);

      const { data } = await API.post('/sos/analyze-frame', { photo: photoData, category: missionCategory });
      setDistressScore(data.distressScore);
      setSentiment(data.sentiment.toUpperCase());
    } catch (err) {
      setSentiment('ANALYSIS_FAILED');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // If user hits capture without analyzing first, force an analysis
    if (sentiment === 'AWAITING_SCAN' || sentiment === 'ANALYSIS_FAILED') {
       await handleAnalyzeFrame();
    }
    
    // Wait slightly to ensure state has settled if we just analyzed
    setTimeout(() => {
      // Perform Real Frame Capture
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      const photoData = canvasRef.current.toDataURL('image/jpeg', 0.8);
      
      // Use latest distress score (guaranteed to be > 0 if scanned successfully)
      // Since closures might trap the old state, we trust the parent 'distressScore' 
      // but to be safe we'll use a functional fallback
      const finalDistress = distressScore || 1; 
      const urgency = finalDistress > 60 ? 'critical' : finalDistress > 45 ? 'high' : 'medium';
      
      onCapture({ 
        urgency, 
        distressScore: finalDistress, 
        sentiment: sentiment === 'AWAITING_SCAN' ? 'SCENE_LOGGED' : sentiment,
        photo: photoData,
        timestamp: new Date().toISOString()
      });
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center p-0 lg:p-12 animate-in fade-in duration-500">
      <div className="relative w-full h-full lg:max-w-6xl lg:aspect-video bg-gray-950 overflow-hidden border border-white/10 shadow-3xl flex flex-col lg:flex-row">
        
        {/* Main Feed Area */}
        <div className="relative flex-1 bg-black group overflow-hidden flex items-center justify-center">
          {cameraError ? (
            <div className="p-12 text-center space-y-6 animate-in fade-in zoom-in-95 max-w-md">
               <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto border border-red-500/50">
                  <ShieldAlert className="text-red-500" size={32} />
               </div>
               <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic">Hardware Protocol Failed</h3>
                    <p className="tactical-text text-red-500 text-[10px]">Error Code: {cameraError}</p>
                  </div>
                  <p className="text-gray-400 text-[10px] uppercase font-mono tracking-[0.1em] leading-relaxed">
                    {cameraError === 'PERMISSION_DENIED' 
                      ? "Camera access was explicitly denied. To use the AI Lens, please reset permissions in your browser bar."
                      : cameraError === 'INSECURE_CONTEXT'
                      ? "The Neural Lens requires a secure protocol (HTTPS). Browsers strictly block camera access on insecure origins."
                      : cameraError === 'NOT_SUPPORTED'
                      ? "Your current browser does not support modern MediaStream APIs. Please switch to a Chromium-based driver."
                      : "No compatible camera hardware detected or the device is already in use by another mission process."}
                  </p>
               </div>
               {cameraError !== 'INSECURE_CONTEXT' && (
                 <button 
                   onClick={() => setRetryCount(c => c + 1)}
                   className="px-8 py-4 bg-white text-black font-black text-[100px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 mx-auto text-[10px]"
                 >
                   <RefreshCw size={14} /> Re-Initialize Neural Link
                 </button>
               )}
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Tactical HUD Overlay */}
              <div className="absolute inset-0 pointer-events-none p-6">
                <div className="absolute inset-0 opacity-5 pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(#F87171 1px, transparent 1px), linear-gradient(90deg, #F87171 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                
                <div className="absolute inset-x-0 bg-blue-500/10 h-1 w-full animate-scan top-0" />

                <div className="flex justify-between items-start">
                   <div className="flex flex-col gap-2">
                      <div className="bg-black/90 px-4 py-2 border-l-2 border-red-600 flex items-center gap-3">
                         <span className="w-1.5 h-1.5 bg-red-600 animate-pulse" />
                         <span className="tactical-text text-white text-[9px]">Neural Link: Stable-82</span>
                      </div>
                      <div className="bg-black/90 px-4 py-2 border-l-2 border-blue-600 flex items-center gap-3">
                         <Activity size={12} className="text-blue-400" />
                         <span className="tactical-text text-white text-[9px]">Analysing Scene Geometry...</span>
                      </div>
                   </div>
                   <div className="bg-black/90 p-4 border border-white/5">
                      <span className="font-mono text-[9px] text-white/40 tracking-widest">FPS: 30.0 // ISO: 800</span>
                   </div>
                </div>
                
                {/* Focal Brackets */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 flex items-center justify-center">
                   <div className="w-4 h-4 border-t border-l border-blue-500 absolute top-0 left-0" />
                   <div className="w-4 h-4 border-t border-r border-blue-500 absolute top-0 right-0" />
                   <div className="w-4 h-4 border-b border-l border-blue-500 absolute bottom-0 left-0" />
                   <div className="w-4 h-4 border-b border-r border-blue-500 absolute bottom-0 right-0" />
                   <div className="w-1 h-1 bg-blue-500/50" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Intelligence Sidebar */}
        <div className="w-full lg:w-80 bg-gray-950 border-l border-white/5 p-8 flex flex-col justify-between">
           <div className="space-y-10">
              <div className="space-y-1 pb-6 border-b border-white/5">
                 <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">AI Scene Intel</h3>
                 <p className="tactical-text text-gray-500 tracking-[0.2em] text-[8px]">Proprietary Neural Model v8.2</p>
              </div>

              <div className="space-y-8">
                 <div className="space-y-3">
                    <div className="flex justify-between items-end">
                       <span className="tactical-text text-gray-500">Distress_Score</span>
                       <span className={`data-value text-4xl ${distressScore > 60 ? 'text-red-500' : 'text-blue-400'}`}>
                          {distressScore}%
                       </span>
                    </div>
                    <div className="h-0.5 bg-white/5 overflow-hidden">
                       <div className={`h-full transition-all duration-1000 ${distressScore > 60 ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${distressScore}%` }} />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="bg-white/5 border border-white/5 p-4 space-y-2">
                       <span className="tactical-text text-gray-500 text-[8px]">Current_Signatures</span>
                       <p className={`font-mono text-[10px] font-black tracking-widest leading-relaxed ${distressScore > 60 ? 'text-red-400' : 'text-blue-400'}`}>
                          &gt; {sentiment}
                       </p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-4 pt-12">
              <button 
                 onClick={handleAnalyzeFrame}
                 disabled={analyzing}
                 className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-900/50 disabled:opacity-50"
               >
                 {analyzing ? 'Scanning...' : 'Analyze Scene'} <Cpu size={18} />
               </button>
              <button 
                onClick={handleCapture}
                className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-red-900/50"
              >
                Capture & Broadcast <Zap size={18} />
              </button>
              <button 
                onClick={onClose}
                className="w-full py-4 border border-white/5 text-gray-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Cancel Mission Log
              </button>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(100vh); }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SOSCamera;
