import localforage from 'localforage';

interface TileCache {
  blob: Blob;
  timestamp: number;
}

interface MapData {
  events: any[];
  reports: any[];
  lastUpdated: number;
}

class OfflineMapManager {
  private tileStore: LocalForage;
  private mapDataStore: LocalForage;
  private maxCacheSize = 100 * 1024 * 1024; // 100MB for better offline experience
  private tileExpiry = 30 * 24 * 60 * 60 * 1000; // 30 days - longer for better offline usage
  private mapDataExpiry = 24 * 60 * 60 * 1000; // 24 hours for map data

  constructor() {
    this.tileStore = localforage.createInstance({
      name: 'b-perks-offline-map',
      storeName: 'tiles'
    });

    this.mapDataStore = localforage.createInstance({
      name: 'b-perks-offline-map',
      storeName: 'mapdata'
    });
  }

  async cacheTile(url: string, blob: Blob): Promise<void> {
    try {
      const tileData: TileCache = {
        blob,
        timestamp: Date.now()
      };
      await this.tileStore.setItem(url, tileData);
    } catch (error) {
      console.error('Failed to cache tile:', error);
    }
  }

  async getTile(url: string): Promise<Blob | null> {
    try {
      const tileData = await this.tileStore.getItem<TileCache>(url);
      
      if (!tileData) return null;
      
      // Check if tile is expired
      if (Date.now() - tileData.timestamp > this.tileExpiry) {
        await this.tileStore.removeItem(url);
        return null;
      }
      
      return tileData.blob;
    } catch (error) {
      console.error('Failed to get cached tile:', error);
      return null;
    }
  }

  async cacheMapData(type: 'events' | 'reports', data: any[]): Promise<void> {
    try {
      const mapData: MapData = {
        [type]: data,
        lastUpdated: Date.now()
      } as MapData;
      
      await this.mapDataStore.setItem(type, mapData);
    } catch (error) {
      console.error(`Failed to cache ${type} data:`, error);
    }
  }

  async getCachedMapData(type: 'events' | 'reports'): Promise<any[] | null> {
    try {
      const mapData = await this.mapDataStore.getItem<MapData>(type);
      
      if (!mapData) return null;
      
      // Check if data is expired
      if (Date.now() - mapData.lastUpdated > this.mapDataExpiry) {
        await this.mapDataStore.removeItem(type);
        return null;
      }
      
      return mapData[type] || [];
    } catch (error) {
      console.error(`Failed to get cached ${type} data:`, error);
      return null;
    }
  }

  async getCacheStats(): Promise<{ tileCount: number; sizeBytes: number; sizeMB: string }> {
    try {
      const keys = await this.tileStore.keys();
      let totalSize = 0;
      
      for (const key of keys) {
        const tileData = await this.tileStore.getItem<TileCache>(key);
        if (tileData) {
          totalSize += tileData.blob.size;
        }
      }
      
      return {
        tileCount: keys.length,
        sizeBytes: totalSize,
        sizeMB: (totalSize / (1024 * 1024)).toFixed(2)
      };
    } catch (error) {
      return { tileCount: 0, sizeBytes: 0, sizeMB: '0.00' };
    }
  }

  async clearCache(): Promise<void> {
    try {
      await this.tileStore.clear();
      await this.mapDataStore.clear();
      console.log('All map cache cleared');
    } catch (error) {
      console.error('Failed to clear tile cache:', error);
    }
  }

  // Create a custom tile layer that uses ONLY cached tiles - NO NETWORK CALLS
  createOfflineTileLayer(urlTemplate: string) {
    return {
      getTileUrl: async (coords: { x: number; y: number; z: number }): Promise<string> => {
        const subdomains = ['a', 'b', 'c'];
        const subdomain = subdomains[Math.abs(coords.x + coords.y) % subdomains.length];
        
        const url = urlTemplate
          .replace('{s}', subdomain)
          .replace('{z}', coords.z.toString())
          .replace('{x}', coords.x.toString())
          .replace('{y}', coords.y.toString());

        // Only use cached tiles - NO NETWORK CALLS
        const cachedTile = await this.getTile(url);
        if (cachedTile) {
          return URL.createObjectURL(cachedTile);
        }

        // Always return offline placeholder - never fetch from network
        return this.createOfflinePlaceholderTile();
      }
    };
  }

  private createOfflinePlaceholderTile(): string {
    // Create a simple colored tile for offline mode
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Background
      ctx.fillStyle = '#f0f8f0';
      ctx.fillRect(0, 0, 256, 256);
      
      // Grid pattern
      ctx.strokeStyle = '#e0e8e0';
      ctx.lineWidth = 1;
      for (let i = 0; i < 256; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 256);
        ctx.moveTo(0, i);
        ctx.lineTo(256, i);
        ctx.stroke();
      }
      
      // Offline indicator
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Offline', 128, 120);
      ctx.fillText('B-Perks', 128, 140);
    }
    
    return canvas.toDataURL();
  }

  // No network initialization - purely offline
  async initializeBaguioCache(): Promise<void> {
    console.log('Offline mode: No network initialization. Using existing cache only.');
  }
}

export const offlineMapManager = new OfflineMapManager();