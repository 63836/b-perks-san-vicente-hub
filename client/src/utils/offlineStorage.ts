import localforage from 'localforage';

// Configure localforage for offline storage
const offlineStore = localforage.createInstance({
  name: 'b-perks-offline',
  storeName: 'offline_data',
  version: 1.0,
  description: 'B-Perks offline data storage'
});

const syncQueue = localforage.createInstance({
  name: 'b-perks-sync',
  storeName: 'sync_queue',
  version: 1.0,
  description: 'B-Perks sync queue for offline actions'
});

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: number;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
}

export class OfflineStorageManager {
  private static instance: OfflineStorageManager;
  private isOnline: boolean = navigator.onLine;

  private constructor() {
    this.setupNetworkListeners();
  }

  static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager();
    }
    return OfflineStorageManager.instance;
  }

  private setupNetworkListeners() {
    // Force offline mode - never sync to network
    this.isOnline = false;
    console.log('Offline-only mode enabled');
  }

  // Cache data for offline access
  async cacheData(key: string, data: any): Promise<void> {
    try {
      await offlineStore.setItem(key, {
        data,
        timestamp: Date.now(),
        version: 1
      });
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  // Get cached data
  async getCachedData(key: string): Promise<any> {
    try {
      const cached = await offlineStore.getItem(key) as any;
      if (cached && cached.data) {
        return cached.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  // Save action locally in offline mode
  async queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): Promise<void> {
    // Always save locally - never attempt network calls
    const offlineAction: OfflineAction = {
      ...action,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    try {
      const existingQueue = await this.getSyncQueue();
      existingQueue.push(offlineAction);
      await syncQueue.setItem('actions', existingQueue);
      
      console.log('Action saved locally:', offlineAction);
    } catch (error) {
      console.error('Failed to save action locally:', error);
    }
  }

  // Get sync queue
  private async getSyncQueue(): Promise<OfflineAction[]> {
    try {
      const queue = await syncQueue.getItem('actions') as OfflineAction[];
      return queue || [];
    } catch (error) {
      console.error('Failed to get sync queue:', error);
      return [];
    }
  }

  // Offline-only mode - no network sync
  async syncOfflineActions(): Promise<void> {
    console.log('Offline-only mode: All actions saved locally, no network sync');
    // No network synchronization - pure offline mode
  }

  // Save action locally - no network execution
  private async executeAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): Promise<void> {
    console.log('Saving action locally:', action);
    // In offline mode, actions are just stored locally
    // No network requests are made
  }

  // Cache management
  async clearCache(): Promise<void> {
    try {
      await offlineStore.clear();
      await syncQueue.clear();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const keys = await offlineStore.keys();
      return keys.length;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }

  // Check if device is online
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  // Cache specific app data
  async cacheUserData(userId: number, userData: any): Promise<void> {
    await this.cacheData(`user_${userId}`, userData);
  }

  async cacheEvents(events: any[]): Promise<void> {
    await this.cacheData('events', events);
  }

  async cacheRewards(rewards: any[]): Promise<void> {
    await this.cacheData('rewards', rewards);
  }

  async cacheReports(reports: any[]): Promise<void> {
    await this.cacheData('reports', reports);
  }

  async cacheNews(news: any[]): Promise<void> {
    await this.cacheData('news', news);
  }

  // Get cached app data
  async getCachedUserData(userId: number): Promise<any> {
    return await this.getCachedData(`user_${userId}`);
  }

  async getCachedEvents(): Promise<any[]> {
    const cached = await this.getCachedData('events');
    return cached || [];
  }

  async getCachedRewards(): Promise<any[]> {
    const cached = await this.getCachedData('rewards');
    return cached || [];
  }

  async getCachedReports(): Promise<any[]> {
    const cached = await this.getCachedData('reports');
    return cached || [];
  }

  async getCachedNews(): Promise<any[]> {
    const cached = await this.getCachedData('news');
    return cached || [];
  }
}

export const offlineStorage = OfflineStorageManager.getInstance();