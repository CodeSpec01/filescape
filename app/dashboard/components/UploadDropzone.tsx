"use client";

import { useState } from "react";

export default function UploadDropzone() {
  const [isUploading, setIsUploading] = useState(false);

  // --- SKELETON FUNCTIONS ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log(`[UI] Selected file: ${file.name} (${file.size} bytes)`);
    triggerMockUpload();
  };

  const triggerMockUpload = () => {
    setIsUploading(true);
    console.log(`[AWS S3] Generating Presigned URL...`);
    console.log(`[AWS S3] Uploading file chunks...`);
    
    // Simulate a 2-second upload delay
    setTimeout(() => {
      console.log(`[DynamoDB] Saving file metadata...`);
      setIsUploading(false);
      alert("File uploaded successfully! (Mock)");
    }, 2000);
  };
  // --------------------------

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">Secure Upload</h2>
      
      <div className="flex-1 border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center p-6 text-center hover:bg-primary/5 hover:border-primary/50 transition-all relative group">
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
          onChange={handleFileChange}
          disabled={isUploading}
          id="file-upload-input"
        />

        {isUploading ? (
          <div className="flex flex-col items-center text-primary">
            <span className="material-symbols-outlined animate-spin mb-2 text-3xl">sync</span>
            <span className="text-sm font-bold tracking-widest uppercase">Encrypting...</span>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-surface-container-highest rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform group-hover:text-primary">
              <span className="material-symbols-outlined">cloud_upload</span>
            </div>
            <p className="text-sm text-secondary font-medium">Drag & drop files here</p>
            <p className="text-[10px] text-on-surface-variant mt-1">or click to browse local node</p>
          </>
        )}
      </div>
    </div>
  );
}