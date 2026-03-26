"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "../DashboardProvider";
// 1. Import the new toggleStarFile action
import { getUserFiles, getDownloadUrl, deleteFile, toggleStarFile } from "../../../actions/fileActions";

interface FileData {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  isStarred: boolean;
  s3Key: string;
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function RecentFiles() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // Track manual refreshes
  
  const { searchQuery, activeCategory } = useDashboard();

  // 2. Extract load logic so it can be called by the refresh button
  const loadData = async () => {
    setIsRefreshing(true);
    const result = await getUserFiles();
    if (result.success && result.files) {
      setFiles(result.files as FileData[]);
    }
    setIsRefreshing(false);
    setIsLoading(false);
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = 
      activeCategory === "home" ? true : 
      activeCategory === "recent" ? true : 
      activeCategory === "starred" ? file.isStarred : true;

    return matchesSearch && matchesCategory;
  });

  const handleDownload = async (fileId: string, s3Key: string, fileName: string) => {
    try {
      const response = await getDownloadUrl(s3Key, fileName);
      if (response.success && response.downloadUrl) {
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else alert("Failed to securely fetch file.");
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (fileId: string, s3Key: string) => {
    const previousFiles = [...files];
    setFiles(files.filter(file => file.fileId !== fileId)); 
    try {
      const response = await deleteFile(fileId, s3Key);
      if (!response.success) throw new Error("Database deletion failed");
    } catch (error) {
      console.error(error);
      alert("Failed to delete file. Reverting changes.");
      setFiles(previousFiles);
    }
  };

  // 3. The Star Toggle Logic
  const handleStarToggle = async (fileId: string, currentStatus: boolean) => {
    // Optimistic UI update: Flip the star instantly
    setFiles(files.map(f => f.fileId === fileId ? { ...f, isStarred: !currentStatus } : f));
    
    // Tell DynamoDB to update the record
    const response = await toggleStarFile(fileId, currentStatus);
    if (!response.success) {
      // If it fails, revert the UI back
      setFiles(files.map(f => f.fileId === fileId ? { ...f, isStarred: currentStatus } : f));
      alert("Failed to update star status.");
    }
  };

  return (
    <div className="p-6 flex flex-col h-full overflow-hidden">
      {/* Header with new Refresh Button */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-xl font-headline font-bold text-secondary tracking-tight">
          {activeCategory === "home" ? "All Files" : activeCategory === "recent" ? "Recent Files" : "Starred Files"}
        </h2>
        
        {/* Refresh Button */}
        <button 
          onClick={loadData}
          disabled={isRefreshing}
          className="p-2 text-on-surface-variant hover:text-primary transition-colors bg-surface-container-lowest border border-outline-variant/10 rounded-lg flex items-center justify-center disabled:opacity-50"
          title="Refresh Files"
        >
          <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin text-primary' : ''}`}>
            sync
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full text-primary">
            <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
          </div>
        ) : filteredFiles.length === 0 ? (
          <p className="text-on-surface-variant text-sm text-center mt-10">No files found.</p>
        ) : (
          filteredFiles.map((file) => (
            <div key={file.fileId} className="group flex items-center gap-4 p-4 rounded-lg hover:bg-surface-container-highest transition-all">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded text-primary shrink-0">
                <span className="material-symbols-outlined">
                  {file.fileType.includes('pdf') ? 'description' : 
                   file.fileType.includes('image') ? 'image' : 
                   file.fileType.includes('video') ? 'movie' : 
                   file.fileType.includes('json') ? 'code' : 'table_chart'}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-secondary truncate">{file.fileName}</h3>
                <p className="text-xs text-on-surface-variant">
                  Uploaded {new Date(file.createdAt).toLocaleDateString()} • {formatBytes(file.fileSize)}
                </p>
              </div>
              
              <div className="flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-all shrink-0">
                
                {/* 4. The New Star Button */}
                <button 
                  onClick={() => handleStarToggle(file.fileId, file.isStarred)} 
                  className={`p-2 transition-all bg-surface-container rounded-md ${file.isStarred ? 'text-[#de8eff] hover:text-[#de8eff]/80' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: file.isStarred ? "'FILL' 1" : "'FILL' 0" }}>
                    star
                  </span>
                </button>

                <button onClick={() => handleDownload(file.fileId, file.s3Key, file.fileName)} className="p-2 text-on-surface-variant hover:text-primary transition-all bg-surface-container rounded-md">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                </button>
                <button onClick={() => handleDelete(file.fileId, file.s3Key)} className="p-2 text-on-surface-variant hover:text-error transition-all bg-surface-container rounded-md">
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