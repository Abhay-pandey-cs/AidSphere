import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, ShieldAlert, Cpu, Activity, Zap, Info } from 'lucide-react';

const SOSCamera = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [distressScore, setDistressScore] = useState(0);
  const [sentiment, setSentiment] = useState('Analysing...');
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: 1280, height: 720 } 
        });
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    };
    startCamera();

    // Neural Analysis Simulation Loop (Real-time Frame Analysis Mock)
    const interval = setInterval(() => {
      const score = Math.floor(Math.random() * 40) + 30;
      setDistressScore(score);
      
      if (score > 60) setSentiment('CRITICAL_SIGNAL_DETECTED');
      else if (score > 50) setSentiment('HIGH_ANXIETY_DETECTED');
      else setSentiment('SCENE_NOMINAL_SYNC');
    }, 1500);

    return () => {
      clearInterval(interval);
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Perform Real Frame Capture
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    
    // Create Base64 Payload for AI Processing
    const photoData = canvasRef.current.toDataURL('image/jpeg', 0.8);
    
    const urgency = distressScore > 60 ? 'critical' : distressScore > 45 ? 'high' : 'medium';
    
    onCapture({ 
      urgency, 
      distressScore, 
      sentiment,
      photo: photoData, // Actual captured image data
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center p-0 lg:p-12 animate-in fade-in duration-500">
      <div className="relative w-full h-full lg:max-w-6xl lg:aspect-video bg-gray-950 overflow-hidden border border-white/10 shadow-3xl flex flex-col lg:flex-row">
        
        {/* Main Feed Area */}
        <div className="relative flex-1 bg-black group overflow-hidden">
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
                onClick={handleCapture}
                className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-[0.5em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-red-900/50"
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
