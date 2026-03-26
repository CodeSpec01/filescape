"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DashboardContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: "home" | "recent" | "starred";
  setActiveCategory: (category: "home" | "recent" | "starred") => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  isS3StatusOpen: boolean;
  setIsS3StatusOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  storageUsedGB: number;
  storageLimitGB: number;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"home" | "recent" | "starred">("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isS3StatusOpen, setIsS3StatusOpen] = useState(true);
  
  // Global storage values to sync across the app
  const storageUsedGB = 4.2;
  const storageLimitGB = 15;

  return (
    <DashboardContext.Provider value={{
      searchQuery, setSearchQuery,
      activeCategory, setActiveCategory,
      isSidebarOpen, setIsSidebarOpen,
      isRightPanelOpen, setIsRightPanelOpen,
      isS3StatusOpen, setIsS3StatusOpen,
      storageUsedGB, storageLimitGB
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within a DashboardProvider");
  return context;
}