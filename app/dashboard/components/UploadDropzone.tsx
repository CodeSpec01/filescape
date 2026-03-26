"use client";

import { useState } from "react";
import { getPresignedUploadUrl } from "../../../actions/fileActions"; 
import { useDashboard } from "../DashboardProvider";

export default function UploadDropzone() {
  const [isUploading, setIsUploading] = useState(false);
  const { refreshFiles } = useDashboard();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // 1. Call your Next.js Server Action to log the file in DynamoDB 
      //    and get the temporary secure S3 upload ticket.
      const response = await getPresignedUploadUrl(file.name, file.type, file.size);

      if (!response.success || !response.uploadUrl) {
        throw new Error(response.error || "Failed to generate secure upload URL");
      }

      // 2. Perform the actual file upload directly to AWS S3!
      //    This bypasses Vercel/Next.js entirely, saving you bandwidth and preventing timeouts.
      const uploadResponse = await fetch(response.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (uploadResponse.ok) {
        await refreshFiles();
        // TODO: Soon, we will trigger the UI to refresh the file list here.
      } else {
        throw new Error("AWS S3 rejected the upload.");
      }
      
    } catch (error) {
      console.error("[Upload Error]:", error);
      alert("Upload failed. Check the console for details.");
    } finally {
      setIsUploading(false);
      // Reset the hidden input so the user can select the exact same file again if they want
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">Secure Upload</h2>
      
      <div className="flex-1 border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center p-6 text-center hover:bg-primary/5 hover:border-primary/50 transition-all relative group">
        
        {/* Hidden File Input */}
        <input 
          id="file-upload-input"
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center text-primary">
            <span className="material-symbols-outlined animate-spin mb-2 text-3xl">sync</span>
            <span className="text-sm font-bold tracking-widest uppercase">Transmitting...</span>
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