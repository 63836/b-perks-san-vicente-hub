class NotificationStore {
  private static instance: NotificationStore;
  private notificationCount: number = 0;
  private listeners: Array<(count: number) => void> = [];

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): NotificationStore {
    if (!NotificationStore.instance) {
      NotificationStore.instance = new NotificationStore();
    }
    return NotificationStore.instance;
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('notification_count');
      if (stored) {
        this.notificationCount = parseInt(stored);
      }
    } catch (error) {
      console.warn('Failed to load notification count from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('notification_count', this.notificationCount.toString());
    } catch (error) {
      console.warn('Failed to save notification count to storage:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notificationCount));
  }

  addNotification() {
    this.notificationCount++;
    this.saveToStorage();
    this.notifyListeners();
  }

  clearNotifications() {
    this.notificationCount = 0;
    this.saveToStorage();
    this.notifyListeners();
  }

  getCount(): number {
    return this.notificationCount;
  }

  subscribe(listener: (count: number) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const notificationStore = NotificationStore.getInstance();