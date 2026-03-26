"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { updateShareSettings } from "../../../actions/fileActions";
import { useDashboard } from "../DashboardProvider";

interface ShareModalProps {
  file: any; // Using any here temporarily for ease, or use your FileData interface
  onClose: () => void;
}

export default function ShareModal({ file, onClose }: ShareModalProps) {
  const { refreshFiles } = useDashboard();
  const [isSaving, setIsSaving] = useState(false);
  
  const currentSettings = file.shareSettings || {};
  
  // Calculate existing days or default to 7
  let initialDays = 7;
  if (currentSettings.expiresAt) {
    const diffTime = new Date(currentSettings.expiresAt).getTime() - Date.now();
    initialDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const [shareType, setShareType] = useState<"private" | "public" | "restricted">(currentSettings.type || "private");
  const [daysUntilExpire, setDaysUntilExpire] = useState<number>(initialDays);
  const [emailInput, setEmailInput] = useState(currentSettings.allowedEmails?.join(", ") || "");

  const shareLink = typeof window !== "undefined" ? `${window.location.origin}/share/${file.fileId}` : "";

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let expiresAt = null;
      if (shareType === "public") {
        const date = new Date();
        date.setDate(date.getDate() + daysUntilExpire);
        expiresAt = date.toISOString();
      }

      const allowedEmails = shareType === "restricted" 
        ? emailInput.split(',').map((e: string) => e.trim()).filter((e: string) => e) 
        : [];

      const response = await updateShareSettings(file.fileId, { type: shareType, expiresAt, allowedEmails });

      if (response.success) {
        toast.success("Share settings updated!");
        await refreshFiles(); // Refresh global state so the modal remembers next time!
      } else throw new Error(response.error);
    } catch (error) {
      toast.error("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-md rounded-xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2 className="text-xl font-bold text-secondary mb-1">Share File</h2>
        <p className="text-xs text-on-surface-variant mb-6 truncate">{file.fileName}</p>

        <div className="space-y-4 mb-6">
          <label className="text-sm font-medium text-secondary block">Access Type</label>
          <div className="flex gap-2 bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/10">
            {['private', 'public', 'restricted'].map((type) => (
              <button
                key={type}
                onClick={() => setShareType(type as any)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
                  shareType === type ? 'bg-primary text-black shadow-md' : 'text-on-surface-variant hover:text-secondary'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {shareType === "public" && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2">
            <label className="text-sm font-medium text-secondary block mb-2">
              Link Expires In (Days) {daysUntilExpire < 0 && <span className="text-error ml-2 text-xs font-bold">(EXPIRED)</span>}
            </label>
            <input 
              type="number" 
              value={daysUntilExpire} 
              onChange={(e) => setDaysUntilExpire(Number(e.target.value))}
              className={`w-full bg-surface-container-lowest border rounded-lg px-3 py-2 text-sm text-secondary focus:outline-none ${daysUntilExpire < 0 ? 'border-error/50 text-error' : 'border-outline-variant/20 focus:border-primary'}`}
            />
          </div>
        )}

        {shareType === "restricted" && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2">
            <label className="text-sm font-medium text-secondary block mb-2">Allowed Emails (comma separated)</label>
            <textarea 
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="alex@example.com"
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-secondary focus:outline-none focus:border-primary resize-none h-20"
            />
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-outline-variant/10">
          <label className="text-xs font-medium text-on-surface-variant block mb-2">Generated Link</label>
          <div className="flex gap-2">
            <input type="text" readOnly value={shareLink} className="flex-1 bg-surface-container-highest rounded-lg px-3 py-2 text-xs text-secondary outline-none opacity-70" />
            <button onClick={copyToClipboard} className="bg-surface-container-highest hover:bg-primary/20 hover:text-primary text-secondary px-3 py-2 rounded-lg transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
            </button>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 text-sm text-on-surface-variant hover:text-secondary font-medium transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
              {isSaving ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : null}
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}