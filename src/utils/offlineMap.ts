import localforage from 'localforage';

interface TileData {
  url: string;
  blob: Blob;
  timestamp: number;
}

class OfflineMapManager {
  private tileStore: LocalForage;
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    this.tileStore = localforage.createInstance({
      name: 'b-perks-map-tiles',
      storeName: 'tiles'
    });
  }

  async cacheTilesForArea(
    bounds: { north: number; south: number; east: number; west: number },
    minZoom: number = 10,
    maxZoom: number = 18,
    tileUrlTemplate: string = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  ): Promise<void> {
    const tiles = this.generateTileList(bounds, minZoom, maxZoom);
    const totalTiles = tiles.length;
    let cachedTiles = 0;

    console.log(`Starting to cache ${totalTiles} tiles...`);

    for (const tile of tiles) {
      try {
        const url = this.buildTileUrl(tileUrlTemplate, tile.z, tile.x, tile.y);
        const response = await fetch(url);
        
        if (response.ok) {
          const blob = await response.blob();
          await this.storeTile(url, blob);
          cachedTiles++;
          
          // Log progress every 10 tiles
          if (cachedTiles % 10 === 0) {
            console.log(`Cached ${cachedTiles}/${totalTiles} tiles`);
          }
        }
      } catch (error) {
        console.warn(`Failed to cache tile ${tile.z}/${tile.x}/${tile.y}:`, error);
      }
    }

    console.log(`Finished caching ${cachedTiles}/${totalTiles} tiles`);
  }

  async getTile(url: string): Promise<Blob | null> {
    try {
      const tileData: TileData | null = await this.tileStore.getItem(url);
      
      if (!tileData) {
        return null;
      }

      // Check if tile is still valid (not expired)
      if (Date.now() - tileData.timestamp > this.CACHE_DURATION) {
        await this.tileStore.removeItem(url);
        return null;
      }

      return tileData.blob;
    } catch (error) {
      console.warn('Failed to get cached tile:', error);
      return null;
    }
  }

  private async storeTile(url: string, blob: Blob): Promise<void> {
    const tileData: TileData = {
      url,
      blob,
      timestamp: Date.now()
    };

    await this.tileStore.setItem(url, tileData);
  }

  private generateTileList(
    bounds: { north: number; south: number; east: number; west: number },
    minZoom: number,
    maxZoom: number
  ): Array<{ x: number; y: number; z: number }> {
    const tiles: Array<{ x: number; y: number; z: number }> = [];

    for (let z = minZoom; z <= maxZoom; z++) {
      const northWestTile = this.latLngToTile(bounds.north, bounds.west, z);
      const southEastTile = this.latLngToTile(bounds.south, bounds.east, z);

      for (let x = northWestTile.x; x <= southEastTile.x; x++) {
        for (let y = northWestTile.y; y <= southEastTile.y; y++) {
          tiles.push({ x, y, z });
        }
      }
    }

    return tiles;
  }

  private latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
    const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    
    return { x, y };
  }

  private buildTileUrl(template: string, z: number, x: number, y: number): string {
    const subdomains = ['a', 'b', 'c'];
    const subdomain = subdomains[Math.abs(x + y) % subdomains.length];
    
    return template
      .replace('{s}', subdomain)
      .replace('{z}', z.toString())
      .replace('{x}', x.toString())
      .replace('{y}', y.toString());
  }

  async getCacheSize(): Promise<number> {
    try {
      const keys = await this.tileStore.keys();
      return keys.length;
    } catch (error) {
      console.warn('Failed to get cache size:', error);
      return 0;
    }
  }

  async clearCache(): Promise<void> {
    try {
      await this.tileStore.clear();
      console.log('Map cache cleared');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
}

export const offlineMapManager = new OfflineMapManager();

// Barangay San Vicente bounds for caching
export const BARANGAY_BOUNDS = {
  north: 16.4050,
  south: 16.4000,
  east: 120.5980,
  west: 120.5940
};