"use client";

import { useState, useRef } from "react";
import { getPresignedUploadUrl } from "../../../actions/fileActions"; 
import { useDashboard } from "../DashboardProvider";
import toast from "react-hot-toast";

export default function UploadDropzone() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const { refreshFiles, currentFolderId } = useDashboard();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const response = await getPresignedUploadUrl(file.name, file.type, file.size, currentFolderId);
      if (!response.success || !response.uploadUrl) {
        throw new Error(response.error || "Failed to generate secure upload URL");
      }

      const uploadResponse = await fetch(response.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (uploadResponse.ok) {
        toast.success("File securely uploaded to your vault!");
        await refreshFiles();
      } else {
        throw new Error("AWS S3 rejected the upload.");
      }
    } catch (error) {
      console.error("[Upload Error]:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFileUpload(file);
  };

  // --- DRAG & DROP EVENT HANDLERS ---
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) processFileUpload(file);
  };

  // Programmatically trigger the hidden input on click
  const handleClick = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">Secure Upload</h2>
      
      <div 
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300 relative group cursor-pointer
          ${isDragging 
            ? 'border-primary bg-primary/10 scale-[1.02] shadow-[0_0_30px_rgba(222,142,255,0.15)]' 
            : 'border-outline-variant/30 hover:bg-primary/5 hover:border-primary/50'
          }`}
      >
        
        <input 
          id="file-upload-input"
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center text-primary z-20 pointer-events-none">
            <span className="material-symbols-outlined animate-spin mb-2 text-3xl">sync</span>
            <span className="text-sm font-bold tracking-widest uppercase">Transmitting...</span>
          </div>
        ) : (
          <div className="z-20 pointer-events-none flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform duration-300
              ${isDragging ? 'bg-primary text-black scale-110' : 'bg-surface-container-highest group-hover:text-primary'}`}>
              <span className="material-symbols-outlined">cloud_upload</span>
            </div>
            <p className={`text-sm font-medium transition-colors ${isDragging ? 'text-primary' : 'text-secondary'}`}>
              {isDragging ? 'Drop file to upload' : 'Drag & drop files here'}
            </p>
            <p className="text-[10px] text-on-surface-variant mt-1">or click to browse local node</p>
          </div>
        )}
      </div>
    </div>
  );
}