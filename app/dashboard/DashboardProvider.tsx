"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getUserFiles } from "../../actions/fileActions";

export interface FileData {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  isStarred: boolean;
  s3Key: string;
  shareSettings?: {
    type: "private" | "public" | "restricted";
    expiresAt?: string | null;
    allowedEmails?: string[];
  };
  parentId?: string;
}

export interface BreakdownItem {
  type: string;
  size: string;
  percent: number;
  color: string;
  icon: string;
}

interface DashboardContextType {
  searchQuery: string; setSearchQuery: (q: string) => void;
  activeCategory: "home" | "recent" | "starred"; setActiveCategory: (c: "home" | "recent" | "starred") => void;
  isSidebarOpen: boolean; setIsSidebarOpen: (v: any) => void;
  isRightPanelOpen: boolean; setIsRightPanelOpen: (v: any) => void;
  isS3StatusOpen: boolean; setIsS3StatusOpen: (v: any) => void;

  // New Global Data State
  files: FileData[];
  setFiles: (files: FileData[]) => void;
  isLoadingFiles: boolean;
  isRefreshing: boolean;
  refreshFiles: () => Promise<void>;

  // Storage Math
  storageUsedGB: number;
  storageLimitGB: number;
  fileBreakdown: BreakdownItem[];

  // folder
  currentFolderId: string; setCurrentFolderId: (id: string) => void;
  folderHistory: { id: string, name: string }[]; setFolderHistory: (history: any) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Helper function for byte formatting
function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"home" | "recent" | "starred">("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isS3StatusOpen, setIsS3StatusOpen] = useState(true);

  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [currentFolderId, setCurrentFolderId] = useState("root");
  const [folderHistory, setFolderHistory] = useState<{ id: string, name: string }[]>([{ id: "root", name: "Home" }]);

  const refreshFiles = async () => {
    setIsRefreshing(true);
    const result = await getUserFiles();
    if (result.success && result.files) {
      setFiles(result.files as FileData[]);
    }
    setIsRefreshing(false);
    setIsLoadingFiles(false);
  };

  // Initial load
  useEffect(() => {
    refreshFiles();
  }, []);

  // --- DYNAMIC STORAGE MATH ---
  const storageLimitGB = 1;
  const totalBytes = files.reduce((acc, file) => acc + file.fileSize, 0);
  const storageUsedGB = totalBytes > 0 ? Number((totalBytes / (1024 ** 3)).toFixed(4)) : 0;

  // Categorize files dynamically based on MIME type or extension
  const breakdownMap = {
    Images: { size: 0, color: "bg-tertiary", icon: "image" },
    Documents: { size: 0, color: "bg-primary-fixed", icon: "description" },
    Code: { size: 0, color: "bg-primary", icon: "code" },
    Videos: { size: 0, color: "bg-error", icon: "movie" },
    Other: { size: 0, color: "bg-surface-variant", icon: "draft" }
  };

  files.forEach(file => {
    const type = file.fileType.toLowerCase();
    const name = file.fileName.toLowerCase();

    if (type.includes('image')) breakdownMap.Images.size += file.fileSize;
    else if (type.includes('pdf') || type.includes('document') || type.includes('sheet') || name.endsWith('.pdf')) breakdownMap.Documents.size += file.fileSize;
    else if (type.includes('video') || name.endsWith('.mp4')) breakdownMap.Videos.size += file.fileSize;
    else if (type.includes('json') || name.endsWith('.js') || name.endsWith('.cpp') || name.endsWith('.c') || name.endsWith('.h') || name.endsWith('.ts')) breakdownMap.Code.size += file.fileSize;
    else breakdownMap.Other.size += file.fileSize;
  });

  // Convert the map to an array, remove empty categories, and sort by largest first
  const fileBreakdown: BreakdownItem[] = Object.entries(breakdownMap)
    .filter(([_, data]) => data.size > 0)
    .map(([type, data]) => ({
      type,
      size: formatBytes(data.size),
      percent: totalBytes > 0 ? Math.round((data.size / totalBytes) * 100) : 0,
      color: data.color,
      icon: data.icon
    }))
    .sort((a, b) => b.percent - a.percent);

  return (
    <DashboardContext.Provider value={{
      searchQuery, setSearchQuery,
      activeCategory, setActiveCategory,
      isSidebarOpen, setIsSidebarOpen,
      isRightPanelOpen, setIsRightPanelOpen,
      isS3StatusOpen, setIsS3StatusOpen,
      files, setFiles, isLoadingFiles, isRefreshing, refreshFiles,
      storageUsedGB, storageLimitGB, fileBreakdown, currentFolderId, folderHistory, setCurrentFolderId, setFolderHistory
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