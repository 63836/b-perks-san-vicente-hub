import { WifiOff } from 'lucide-react';

export function OfflineModeIndicator() {
  return (
    <div className="fixed top-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium bg-green-600 text-white">
      <WifiOff className="h-4 w-4" />
      <span>Local Storage Database</span>
      <span className="bg-white/20 px-2 py-1 rounded text-xs">
        Working Offline
      </span>
    </div>
  );
}