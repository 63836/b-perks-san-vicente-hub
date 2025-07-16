import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useOffline } from '@/hooks/useOffline';
import { offlineMapManager } from '@/utils/offlineMap';
import { 
  Download, 
  Trash2, 
  MapPin, 
  Wifi, 
  WifiOff, 
  Database,
  RefreshCw,
  Settings,
  Info
} from 'lucide-react';

export default function OfflineSettings() {
  const { isOnline, isOffline, storage } = useOffline();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [cacheStats, setCacheStats] = useState({
    tileCount: 0,
    sizeBytes: 0,
    sizeMB: '0.00'
  });
  const [pendingActions, setPendingActions] = useState(0);
  const [autoSync, setAutoSync] = useState(true);
  const [autoDownloadMaps, setAutoDownloadMaps] = useState(false);

  useEffect(() => {
    loadCacheStats();
    loadPendingActions();
  }, []);

  const loadCacheStats = async () => {
    try {
      const stats = await offlineMapManager.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  };

  const loadPendingActions = async () => {
    try {
      const count = await storage.getCacheSize();
      setPendingActions(count);
    } catch (error) {
      console.error('Failed to load pending actions:', error);
    }
  };

  const downloadMapData = async () => {
    if (isOffline) {
      toast({
        title: "Cannot Download",
        description: "Map download requires internet connection",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      toast({
        title: "Downloading Maps",
        description: "Caching Baguio City area for offline use..."
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      await offlineMapManager.initializeBaguioCache();
      
      clearInterval(progressInterval);
      setDownloadProgress(100);
      
      await loadCacheStats();
      
      toast({
        title: "Maps Downloaded",
        description: "Baguio City maps are now available offline"
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download map data",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const clearAllCache = async () => {
    try {
      await offlineMapManager.clearCache();
      await storage.clearCache();
      await loadCacheStats();
      await loadPendingActions();
      
      toast({
        title: "Cache Cleared",
        description: "All offline data has been removed"
      });
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "Failed to clear offline cache",
        variant: "destructive"
      });
    }
  };

  const syncNow = async () => {
    if (isOffline) {
      toast({
        title: "Cannot Sync",
        description: "Sync requires internet connection",
        variant: "destructive"
      });
      return;
    }

    try {
      await storage.syncOfflineActions();
      await loadPendingActions();
      
      toast({
        title: "Sync Complete",
        description: "All offline actions have been synchronized"
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync offline actions",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Offline Settings</h1>
        <Badge variant={isOnline ? "default" : "destructive"} className="ml-auto">
          {isOnline ? (
            <>
              <Wifi className="h-3 w-3 mr-1" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </>
          )}
        </Badge>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Connection Status
          </CardTitle>
          <CardDescription>
            Current network status and offline capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{isOnline ? 'Connected' : 'Offline'}</div>
              <div className="text-sm text-muted-foreground">Network Status</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{cacheStats.tileCount}</div>
              <div className="text-sm text-muted-foreground">Cached Map Tiles</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{pendingActions}</div>
              <div className="text-sm text-muted-foreground">Pending Actions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Offline Maps
          </CardTitle>
          <CardDescription>
            Download Baguio City maps for offline viewing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Map Cache Size</div>
              <div className="text-sm text-muted-foreground">
                {cacheStats.sizeMB} MB ({cacheStats.tileCount} tiles)
              </div>
            </div>
            <Badge variant="outline">
              {cacheStats.tileCount > 0 ? 'Downloaded' : 'Not Downloaded'}
            </Badge>
          </div>

          {isDownloading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Downloading maps...</span>
                <span>{Math.round(downloadProgress)}%</span>
              </div>
              <Progress value={downloadProgress} className="h-2" />
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={downloadMapData}
              disabled={isDownloading || isOffline}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download Maps'}
            </Button>
            <Button 
              variant="outline" 
              onClick={clearAllCache}
              disabled={cacheStats.tileCount === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Synchronization
          </CardTitle>
          <CardDescription>
            Manage how your data syncs between online and offline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Pending Actions</div>
              <div className="text-sm text-muted-foreground">
                Actions waiting to sync when online
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{pendingActions}</Badge>
              <Button 
                size="sm" 
                onClick={syncNow}
                disabled={isOffline || pendingActions === 0}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Sync Now
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-sync">Auto-sync when online</Label>
                <div className="text-sm text-muted-foreground">
                  Automatically sync data when connection is restored
                </div>
              </div>
              <Switch 
                id="auto-sync"
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-download">Auto-download maps</Label>
                <div className="text-sm text-muted-foreground">
                  Automatically cache maps when viewing new areas
                </div>
              </div>
              <Switch 
                id="auto-download"
                checked={autoDownloadMaps}
                onCheckedChange={setAutoDownloadMaps}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Features */}
      <Card>
        <CardHeader>
          <CardTitle>Available Offline Features</CardTitle>
          <CardDescription>
            What you can do when internet is not available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">✓ Available Offline</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• View cached events and rewards</li>
                <li>• Browse community map (cached tiles)</li>
                <li>• Submit reports (will sync when online)</li>
                <li>• View cached news and announcements</li>
                <li>• Access user dashboard</li>
                <li>• View notifications</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-orange-600">⚠ Limited Offline</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Event registration (queued for sync)</li>
                <li>• Reward redemption (queued for sync)</li>
                <li>• Profile updates (queued for sync)</li>
                <li>• New map areas (requires download)</li>
                <li>• Real-time notifications</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}