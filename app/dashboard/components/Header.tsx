"use client";

import { UserButton } from "@clerk/nextjs";
import { useDashboard } from "../DashboardProvider";

export default function Header() {
  const { searchQuery, setSearchQuery, isRightPanelOpen, setIsRightPanelOpen } = useDashboard();

  return (
    <header className="flex justify-between items-center mb-10">
      <div className="flex-1 mr-3">
        <div className="relative group hidden sm:block">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/10 outline-none focus:border-primary/50 text-secondary py-3 pl-12 pr-4 transition-all rounded-lg" 
            placeholder="Search files..." 
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        
        <div className="flex items-center gap-4 pl-4 border-l border-outline-variant/20">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-secondary">My Cloud</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Connected</p>
          </div>
          <div>
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}