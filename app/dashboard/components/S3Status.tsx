"use client";
import { useEffect, useState } from "react";
import { useDashboard } from "../DashboardProvider";

export default function S3Status() {
  const [latency, setLatency] = useState(14);
  const { isS3StatusOpen, setIsS3StatusOpen } = useDashboard();

  useEffect(() => {
    const interval = setInterval(() => setLatency(Math.floor(Math.random() * (25 - 12 + 1) + 12)), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col relative z-10 overflow-hidden">
      
      {/* Background Orbs: Pushed to the back (-z-10) and positioned as distinct glowing circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Top-Left Orb */}
        <div className="absolute top-[-10%] left-[5%] w-64 h-64 bg-primary/10 rounded-full blur-[60px] animate-pulse"></div>
        {/* Bottom-Right Orb */}
        <div className="absolute bottom-0 right-[5%] w-48 h-48 bg-tertiary/10 rounded-full blur-[50px] animate-pulse" style={{ animationDuration: '4s' }}></div>
      </div>

      <div className="h-14 flex justify-between items-center px-6 shrink-0 border-b border-outline-variant/5 z-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#de8eff]"></div>
          <h3 className="text-sm font-headline font-bold text-on-surface tracking-tight">
            {isS3StatusOpen ? 'Active S3 Connection' : 'S3 Node: ap-south-1 • Connected'}
          </h3>
        </div>
        
        <button 
          onClick={() => setIsS3StatusOpen(prev => !prev)}
          className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors bg-surface-container rounded-lg"
        >
          <span className="material-symbols-outlined text-sm">{isS3StatusOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}</span>
        </button>
      </div>

      <div className={`flex-1 p-6 relative transition-opacity duration-300 z-10 ${isS3StatusOpen ? 'opacity-100' : 'opacity-0 invisible'}`}>
        <span className="px-2 py-1 bg-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.2em] rounded">
          AWS Region: ap-south-1 (Mumbai)
        </span>
        
        <div className="flex items-center gap-3 mt-4">
          <p className="text-xs text-on-surface-variant font-medium tracking-wide">API Latency: {latency}ms</p>
        </div>

        <div className="absolute -bottom-2.5 right-2.5 opacity-10 pointer-events-none transition-transform hover:scale-110 duration-500">
          <span className="material-symbols-outlined text-[100px]">hub</span>
        </div>
      </div>
      
    </div>
  );
}