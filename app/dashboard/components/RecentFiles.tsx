"use client";

import { useState } from "react";
import { useDashboard } from "../DashboardProvider";

interface FileData {
  id: string;
  name: string;
  size: string;
  updatedAt: string;
  type: "pdf" | "image" | "video" | "code" | "document";
}

const MOCK_FILES: FileData[] = [
  { id: "1", name: "Q3_Strategic_Report.pdf", size: "4.2 MB", updatedAt: "2 hours ago", type: "pdf" },
  { id: "2", name: "Campaign_Visuals_V2.zip", size: "128 MB", updatedAt: "5 hours ago", type: "image" },
  { id: "3", name: "Global_Config_API.json", size: "14 KB", updatedAt: "2 days ago", type: "code" },
  { id: "4", name: "Brand_Guidelines.mp4", size: "840 MB", updatedAt: "1 day ago", type: "video" },
  { id: "5", name: "Revenue_Forecast.xlsx", size: "1.2 MB", updatedAt: "3 days ago", type: "document" },
];

export default function RecentFiles() {
  const [files, setFiles] = useState<FileData[]>(MOCK_FILES);
  
  // Pull the global state to filter files
  const { searchQuery, activeCategory } = useDashboard();

  // --- FILTER LOGIC ---
  const filteredFiles = files.filter(file => {
    // 1. Check Search Query
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Check Category (Mock Logic)
    const matchesCategory = 
      activeCategory === "home" ? true : 
      activeCategory === "recent" ? file.updatedAt.includes("hours") : 
      file.id === "1" || file.id === "2"; // Pretend IDs 1 and 2 are starred

    return matchesSearch && matchesCategory;
  });
  // --------------------

  const handleDownload = (fileId: string) => {
    console.log(`[AWS S3] Fetching download URL for file ID: ${fileId}`);
    alert(`Triggered download for file ${fileId}`);
  };

  const handleDelete = (fileId: string) => {
    console.log(`[DynamoDB] Deleting record for file ID: ${fileId}`);
    setFiles(files.filter(file => file.id !== fileId)); 
  };

  return (
    <div className="p-6 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-xl font-headline font-bold text-secondary tracking-tight">
          {activeCategory === "home" ? "All Files" : activeCategory === "recent" ? "Recent Files" : "Starred Files"}
        </h2>
      </div>

      {/* Replaced 'files.map' with 'filteredFiles.map' */}
      {/* Scrollable area with the scrollbar visually hidden */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {filteredFiles.length === 0 ? (
          <p className="text-on-surface-variant text-sm text-center mt-10">No files found.</p>
        ) : (
          filteredFiles.map((file) => (
            <div key={file.id} className="group flex items-center gap-4 p-4 rounded-lg hover:bg-surface-container-highest transition-all">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded text-primary shrink-0">
                <span className="material-symbols-outlined">
                  {file.type === 'pdf' ? 'description' : file.type === 'image' ? 'image' : file.type === 'video' ? 'movie' : file.type === 'code' ? 'code' : 'table_chart'}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-secondary truncate">{file.name}</h3>
                <p className="text-xs text-on-surface-variant">Modified {file.updatedAt} • {file.size}</p>
              </div>
              
              <div className="flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-all shrink-0">
                <button onClick={() => handleDownload(file.id)} className="p-2 text-on-surface-variant hover:text-primary transition-all bg-surface-container rounded-md">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                </button>
                <button onClick={() => handleDelete(file.id)} className="p-2 text-on-surface-variant hover:text-error transition-all bg-surface-container rounded-md">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}