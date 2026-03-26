"use client";

import { useState } from "react";
import { useDashboard } from "../DashboardProvider";
import { getDownloadUrl, deleteFile, toggleStarFile, createFolder } from "../../../actions/fileActions";
import ShareModal from "./ShareModal";
import toast from "react-hot-toast";

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function RecentFiles() {
  const {
    searchQuery, activeCategory,
    files, setFiles,
    isLoadingFiles, isRefreshing, refreshFiles,
    currentFolderId, setCurrentFolderId,
    folderHistory, setFolderHistory
  } = useDashboard();

  const [sharingFile, setSharingFile] = useState<any | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // FILTER LOGIC: Apply search, category, AND folder visibility
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    // If searching or viewing 'Starred'/'Recent', ignore folder structure and show everything
    if (searchQuery || activeCategory !== "home") {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const fileDate = new Date(file.createdAt).getTime();
      const matchesCategory = activeCategory === "recent" ? fileDate >= sevenDaysAgo :
        activeCategory === "starred" ? file.isStarred : true;
      return matchesSearch && matchesCategory && file.fileType !== 'folder';
    }

    // Otherwise, only show files in the CURRENT folder
    const fileParentId = file.parentId || "root";
    return matchesSearch && fileParentId === currentFolderId;
  });

  // FOLDER NAVIGATION LOGIC
  const handleEnterFolder = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setFolderHistory([...folderHistory, { id: folderId, name: folderName }]);
  };

  const handleGoBack = () => {
    if (folderHistory.length <= 1) return;
    const newHistory = [...folderHistory];
    newHistory.pop();
    const previousFolder = newHistory[newHistory.length - 1];
    setFolderHistory(newHistory);
    setCurrentFolderId(previousFolder.id);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    const response = await createFolder(newFolderName.trim(), currentFolderId);
    if (response.success) {
      toast.success("Folder created!");
      setNewFolderName("");
      await refreshFiles();
    } else {
      toast.error("Failed to create folder.");
    }
    setIsCreatingFolder(false);
  };

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
      } else {
        toast.error("Failed to securely fetch file.");
      }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (fileId: string, s3Key: string, fileType: string) => {
    
    // THE SAFETY CHECK: If it's a folder, ensure it has no children
    if (fileType === 'folder') {
      const hasChildren = files.some(f => f.parentId === fileId);
      if (hasChildren) {
        toast.error("Cannot delete: Folder is not empty.");
        return;
      }
    }

    const previousFiles = [...files];
    setFiles(files.filter(file => file.fileId !== fileId)); 
    
    try {
      const response = await deleteFile(fileId, s3Key);
      if (!response.success) throw new Error("Database deletion failed");
      toast.success(fileType === 'folder' ? "Folder deleted" : "File deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete. Reverting changes.");
      setFiles(previousFiles);
    }
  };

  const handleStarToggle = async (fileId: string, currentStatus: boolean) => {
    setFiles(files.map(f => f.fileId === fileId ? { ...f, isStarred: !currentStatus } : f));
    const response = await toggleStarFile(fileId, currentStatus);
    if (!response.success) {
      setFiles(files.map(f => f.fileId === fileId ? { ...f, isStarred: currentStatus } : f));
      toast.error("Failed to update star status.");
    }
  };


  return (
    <div className="p-6 flex flex-col h-full overflow-hidden relative">
      <div className="flex justify-between items-center mb-6 shrink-0">

        {/* BREADCRUMBS & TITLE */}
        <div className="flex items-center gap-2">
          {currentFolderId !== "root" && activeCategory === "home" && !searchQuery && (
            <button onClick={handleGoBack} className="p-1 mr-2 text-on-surface-variant hover:text-primary transition-colors bg-surface-container-lowest rounded-md">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
          )}
          <h2 className="text-xl font-headline font-bold text-secondary tracking-tight">
            {activeCategory === "home" ? (
              searchQuery ? "Search Results" : folderHistory[folderHistory.length - 1].name
            ) : activeCategory === "recent" ? "Recent Files" : "Starred Files"}
          </h2>
        </div>

        {/* HEADER CONTROLS */}
        <div className="flex items-center gap-3">
          {/* New Folder Input & Button (Only show in Home view) */}
          {activeCategory === "home" && !searchQuery && (
            <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/10 rounded-lg p-1 pr-2">
              <input
                type="text"
                placeholder="New folder..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                className="bg-transparent text-xs text-secondary px-2 outline-none w-24 focus:w-32 transition-all placeholder:text-on-surface-variant/50"
              />
              <button
                onClick={handleCreateFolder}
                disabled={isCreatingFolder || !newFolderName.trim()}
                className="text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">create_new_folder</span>
              </button>
            </div>
          )}

          <button onClick={refreshFiles} disabled={isRefreshing} className="p-2 text-on-surface-variant hover:text-primary transition-colors bg-surface-container-lowest border border-outline-variant/10 rounded-lg">
            <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin text-primary' : ''}`}>sync</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {isLoadingFiles ? (
          <div className="flex justify-center items-center h-full text-primary"><span className="material-symbols-outlined animate-spin text-3xl">sync</span></div>
        ) : filteredFiles.length === 0 ? (
          <p className="text-on-surface-variant text-sm text-center mt-10">This folder is empty.</p>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.fileId}
              // If it's a folder, double-click opens it!
              onDoubleClick={() => file.fileType === 'folder' && handleEnterFolder(file.fileId, file.fileName)}
              className={`group flex items-center gap-4 p-4 rounded-lg hover:bg-surface-container-highest transition-all ${file.fileType === 'folder' ? 'cursor-pointer hover:border-primary/30 border border-transparent' : ''}`}
            >

              {/* ICON */}
              <div className={`w-10 h-10 flex items-center justify-center rounded shrink-0 ${file.fileType === 'folder' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                <span className="material-symbols-outlined">
                  {file.fileType === 'folder' ? 'folder' :
                    file.fileType.includes('pdf') ? 'description' :
                      file.fileType.includes('image') ? 'image' :
                        file.fileType.includes('video') ? 'movie' :
                          file.fileType.includes('json') ? 'code' : 'draft'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-secondary truncate">{file.fileName}</h3>
                <p className="text-xs text-on-surface-variant">
                  {file.fileType === 'folder' ? 'Folder' : `${new Date(file.createdAt).toLocaleDateString()} • ${formatBytes(file.fileSize)}`}
                </p>
              </div>

              <div className="flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-all shrink-0">
                {file.fileType !== 'folder' && (
                  <>
                    <button onClick={() => setSharingFile(file)} className="p-2 text-on-surface-variant hover:text-primary transition-all bg-surface-container rounded-md"><span className="material-symbols-outlined text-[18px]">share</span></button>
                    <button onClick={() => handleStarToggle(file.fileId, file.isStarred)} className={`p-2 transition-all bg-surface-container rounded-md ${file.isStarred ? 'text-[#de8eff]' : 'text-on-surface-variant hover:text-primary'}`}><span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: file.isStarred ? "'FILL' 1" : "'FILL' 0" }}>star</span></button>
                    <button onClick={() => handleDownload(file.fileId, file.s3Key, file.fileName)} className="p-2 text-on-surface-variant hover:text-primary transition-all bg-surface-container rounded-md"><span className="material-symbols-outlined text-[18px]">download</span></button>
                  </>
                )}
                <button onClick={() => handleDelete(file.fileId, file.s3Key, file.fileType)} className="p-2 text-on-surface-variant hover:text-error transition-all bg-surface-container rounded-md"><span className="material-symbols-outlined text-[18px]">delete</span></button>
              </div>
            </div>
          ))
        )}
      </div>

      {sharingFile && <ShareModal file={sharingFile} onClose={() => setSharingFile(null)} />}
    </div>
  );
}