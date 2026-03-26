"use client";

import Header from "./components/Header";
import RecentFiles from "./components/RecentFiles";
import UploadDropzone from "./components/UploadDropzone";
import StorageStats from "./components/StorageStats";
import S3Status from "./components/S3Status";
import { useDashboard } from "./DashboardProvider";

export default function DashboardPage() {
  const { isRightPanelOpen, setIsRightPanelOpen, isS3StatusOpen } = useDashboard();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header />
      
      {/* Changed to flex-1 min-h-0 so it perfectly fills the remaining space */}
      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 w-full">
        
        {/* LEFT/CENTER AREA */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden min-w-0">
          <div className="flex-1 glass-panel rounded-lg flex flex-col overflow-hidden border border-outline-variant/10">
            <RecentFiles />
          </div>

          <div className={`glass-panel rounded-lg border border-outline-variant/10 transition-all duration-500 overflow-hidden ${isS3StatusOpen ? 'h-48' : 'h-14'}`}>
            <S3Status />
          </div>
        </div>

        {/* RIGHT PANEL AREA */}
        <div className={`glass-panel rounded-lg border border-outline-variant/10 flex flex-col transition-all duration-500 overflow-hidden relative shrink-0 ${isRightPanelOpen ? 'w-full md:w-87.5 lg:w-100' : 'w-full md:w-16'}`}>
          
          <div className="absolute top-4 right-3 z-50">
            <button 
              onClick={() => setIsRightPanelOpen(prev => !prev)}
              className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors bg-surface-container rounded-lg"
            >
              <span className="material-symbols-outlined">{isRightPanelOpen ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'}</span>
            </button>
          </div>

          <div className={`flex flex-col gap-6 p-6 h-full transition-opacity duration-300 ${isRightPanelOpen ? 'opacity-100 w-87.5 lg:w-100' : 'opacity-0 invisible w-87.5 lg:w-100'}`}>
            <div className="flex-1 flex flex-col overflow-hidden">
               <StorageStats />
            </div>
            <div className="h-62.5 shrink-0">
               <UploadDropzone />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}