// Local storage utilities for persistent data
export interface LocalStorageData {
  users: any[];
  events: any[];
  reports: any[];
  rewards: any[];
  rewardClaims: any[];
  newsAlerts: any[];
  transactions: any[];
}

const DEFAULT_DATA: LocalStorageData = {
  users: [],
  events: [],
  reports: [],
  rewards: [
    {
      id: 1,
      title: "Eco-Friendly Water Bottle",
      description: "BPA-free stainless steel water bottle with Barangay logo",
      pointsCost: 100,
      imageUrl: "/placeholder.svg",
      isAvailable: true,
      category: "Eco-friendly",
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: "Community Garden Seeds Pack",
      description: "Vegetable seeds for home gardening - tomato, lettuce, herbs",
      pointsCost: 75,
      imageUrl: "/placeholder.svg",
      isAvailable: true,
      category: "Gardening",
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      title: "Barangay T-Shirt",
      description: "Official Barangay San Vicente t-shirt, available in all sizes",
      pointsCost: 150,
      imageUrl: "/placeholder.svg",
      isAvailable: true,
      category: "Apparel",
      createdAt: new Date().toISOString()
    }
  ],
  rewardClaims: [],
  newsAlerts: [],
  transactions: []
};

export class LocalStorageManager {
  private static instance: LocalStorageManager;
  private readonly STORAGE_KEY = 'b-perks-data';

  private constructor() {}

  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }

  getData(): LocalStorageData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_DATA, ...JSON.parse(stored) };
      }
      return DEFAULT_DATA;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return DEFAULT_DATA;
    }
  }

  setData(data: LocalStorageData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  updateData(updates: Partial<LocalStorageData>): void {
    const current = this.getData();
    this.setData({ ...current, ...updates });
  }

  // Generic CRUD operations
  addItem<T extends keyof LocalStorageData>(collection: T, item: LocalStorageData[T][0]): void {
    const data = this.getData();
    data[collection].push(item);
    this.setData(data);
  }

  updateItem<T extends keyof LocalStorageData>(
    collection: T, 
    id: number, 
    updates: Partial<LocalStorageData[T][0]>
  ): void {
    const data = this.getData();
    const index = data[collection].findIndex((item: any) => item.id === id);
    if (index !== -1) {
      data[collection][index] = { ...data[collection][index], ...updates };
      this.setData(data);
    }
  }

  removeItem<T extends keyof LocalStorageData>(collection: T, id: number): void {
    const data = this.getData();
    data[collection] = data[collection].filter((item: any) => item.id !== id);
    this.setData(data);
  }

  getNextId<T extends keyof LocalStorageData>(collection: T): number {
    const data = this.getData();
    const items = data[collection] as any[];
    return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
  }

  // Initialize with default data if empty
  initialize(): void {
    const data = this.getData();
    if (data.users.length === 0) {
      // Add default admin user
      data.users.push({
        id: 1,
        username: "admin",
        name: "Administrator",
        age: 30,
        phoneNumber: "09123456789",
        password: "admin123",
        points: 1000,
        isAdmin: true,
        createdAt: new Date().toISOString()
      });
      this.setData(data);
    }
  }
}

export const localStorageManager = LocalStorageManager.getInstance();