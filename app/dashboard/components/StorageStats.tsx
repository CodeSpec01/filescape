"use client";
import { useDashboard } from "../DashboardProvider";

export default function StorageStats() {
  const { storageUsedGB, storageLimitGB } = useDashboard();
  const percentageUsed = Math.round((storageUsedGB / storageLimitGB) * 100);

  const fileBreakdown = [
    { type: "Images", size: "2.1 GB", percent: 50, color: "bg-tertiary", icon: "image" },
    { type: "Documents", size: "1.5 GB", percent: 35, color: "bg-primary-fixed", icon: "description" },
    { type: "Code", size: "0.4 GB", percent: 10, color: "bg-primary", icon: "code" },
    { type: "Videos", size: "0.2 GB", percent: 5, color: "bg-error", icon: "movie" },
  ];

  return (
    <div className="w-full h-full flex flex-col relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-headline font-bold text-secondary tracking-tight">Storage</h2>
          <p className="text-xs text-on-surface-variant">Capacity: {storageLimitGB} GB</p>
        </div>
      </div>

      <div className="text-5xl font-black font-headline text-primary mb-2">
        {storageUsedGB}<span className="text-2xl"> GB</span>
      </div>
      <p className="text-sm text-secondary font-medium mb-6">Used Space ({percentageUsed}%)</p>
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-2" style={{scrollbarWidth: "none"}}>
        {fileBreakdown.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-on-surface-variant">{item.type}</span>
              <span className="text-secondary font-semibold">{item.size}</span>
            </div>
            <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <div className={`${item.color} h-full transition-all duration-1000`} style={{ width: `${item.percent}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}