"use client";

import { ReactNode } from "react";
import { DashboardProvider, useDashboard } from "./DashboardProvider";
import { Toaster } from "react-hot-toast";

// We separate the Sidebar content so it can consume the Context
function Sidebar() {
  const {
    isSidebarOpen, setIsSidebarOpen,
    activeCategory, setActiveCategory,
    storageUsedGB, storageLimitGB
  } = useDashboard();

  const storagePercent = Math.round((storageUsedGB / storageLimitGB) * 100);

  return (
    <aside className={`hidden md:flex fixed left-0 top-0 h-full ${isSidebarOpen ? 'w-64' : 'w-20'} z-50 bg-[#0e0e0f] border-r border-outline-variant/10 flex-col py-6 transition-all duration-300 shadow-2xl`}>
      <div className={`flex items-center ${isSidebarOpen ? 'px-6 gap-3' : 'justify-center'} mb-8 transition-all`}>
        <div className="w-10 h-10 bg-primary-container/20 flex items-center justify-center rounded-lg shrink-0">
          <span className="material-symbols-outlined text-primary">cloud</span>
        </div>
        {isSidebarOpen && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="text-lg font-black text-[#de8eff] font-headline tracking-widest">FILESCAPE</h1>
          </div>
        )}
      </div>

      <div className="px-4 mb-6">
        <button
          onClick={() => document.getElementById('file-upload-input')?.click()}
          className={`w-full py-3 bg-linear-to-br from-primary to-primary-container text-on-primary-fixed font-semibold flex items-center ${isSidebarOpen ? 'justify-center gap-2 px-4' : 'justify-center px-0'} rounded-lg hover:scale-95 transition-all`}
        >
          <span className="material-symbols-outlined">add</span>
          {isSidebarOpen && <span>New Upload</span>}
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-4">
        {[
          { id: 'home', icon: 'home', label: 'Home' },
          { id: 'recent', icon: 'schedule', label: 'Recent' },
          { id: 'starred', icon: 'star', label: 'Starred' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveCategory(item.id as any)}
            className={`flex items-center ${isSidebarOpen ? 'justify-start gap-3 px-4' : 'justify-center px-0'} py-3 rounded-lg font-medium transition-all ${activeCategory === item.id ? 'text-[#de8eff] bg-[#de8eff]/10 translate-x-1' : 'text-on-surface-variant hover:text-[#e4e1e6] hover:bg-surface-container'}`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {isSidebarOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-outline-variant/10 flex flex-col w-full">
        {/* Minimize Button - Statically Pinned to the Left */}
        <div className="w-full px-4 mb-4 flex justify-start">
          <button
            //@ts-ignore
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors bg-surface-container rounded-lg shrink-0"
          >
            <span className="material-symbols-outlined">{isSidebarOpen ? 'keyboard_double_arrow_left' : 'keyboard_double_arrow_right'}</span>
          </button>
        </div>

        {/* Global Storage Sync */}
        <div className={`flex items-center gap-3 w-full ${isSidebarOpen ? 'px-6' : 'justify-center px-0'}`}>
          <span className="material-symbols-outlined text-on-surface-variant shrink-0">cloud</span>
          {isSidebarOpen && (
            <div className="flex-1">
              <div className="flex justify-between text-[10px] mb-1 uppercase font-bold text-on-surface-variant">
                <span>Storage</span>
                <span>{storagePercent}%</span>
              </div>
              <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${storagePercent}%` }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-surface flex text-on-surface font-body overflow-x-hidden relative">
        <div className="fixed top-0 right-0 w-150 h-150 light-leak pointer-events-none -z-10"></div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#5C555C', // surface-container
              color: '#e4e1e6', // secondary text
              border: '1px solid rgba(72, 72, 73, 0.2)', // outline-variant/20
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#de8eff', // primary
                secondary: '#5C555C', // surface-container
              },
            },
            error: {
              iconTheme: {
                primary: '#ff6e84', // error
                secondary: '#5C555C', // surface-container
              },
            },
          }}
        />
        <Sidebar />

        {/* The DashboardProvider context makes this wrapper dynamic */}
        <DashboardContentWrapper>{children}</DashboardContentWrapper>
      </div>
    </DashboardProvider>
  );
}

// Wrapper to adjust margin based on sidebar state
function DashboardContentWrapper({ children }: { children: ReactNode }) {
  const { isSidebarOpen } = useDashboard();
  return (
    // Changed to strictly h-screen with overflow-hidden and flex
    <main className={`flex-1 p-4 md:p-8 h-screen overflow-hidden flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
      {children}
    </main>
  );
}