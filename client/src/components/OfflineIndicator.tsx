import { useOffline } from '@/hooks/useOffline';
import { Wifi, WifiOff, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const { isOnline, isOffline, storage } = useOffline();
  const [pendingActions, setPendingActions] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const checkPendingActions = async () => {
      try {
        const cacheSize = await storage.getCacheSize();
        setPendingActions(cacheSize);
      } catch (error) {
        console.error('Failed to check pending actions:', error);
      }
    };

    checkPendingActions();
    const interval = setInterval(checkPendingActions, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [storage]);

  useEffect(() => {
    if (isOnline && pendingActions > 0) {
      setIsSyncing(true);
      storage.syncOfflineActions().finally(() => {
        setIsSyncing(false);
      });
    }
  }, [isOnline, pendingActions, storage]);

  if (isOnline && pendingActions === 0) {
    return null; // Don't show indicator when online and no pending actions
  }

  return (
    <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
      isOffline 
        ? 'bg-red-500 text-white' 
        : isSyncing 
          ? 'bg-blue-500 text-white'
          : 'bg-green-500 text-white'
    }`}>
      {isOffline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Offline Mode</span>
        </>
      ) : isSyncing ? (
        <>
          <Upload className="h-4 w-4 animate-spin" />
          <span>Syncing...</span>
        </>
      ) : (
        <>
          <Wifi className="h-4 w-4" />
          <span>Online</span>
        </>
      )}
      
      {pendingActions > 0 && (
        <span className="bg-white/20 px-2 py-1 rounded text-xs">
          {pendingActions} pending
        </span>
      )}
    </div>
  );
}