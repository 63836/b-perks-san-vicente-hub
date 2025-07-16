// PWA Installation utilities
let deferredPrompt: any;

export interface PWAInstallEvent extends Event {
  platforms: string[];
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt: () => Promise<void>;
}

export class PWAInstallManager {
  private static instance: PWAInstallManager;
  private installPrompt: PWAInstallEvent | null = null;
  private isInstallable = false;
  private isInstalled = false;
  private listeners: Set<(installable: boolean) => void> = new Set();

  private constructor() {
    this.setupInstallListeners();
    this.checkInstallStatus();
  }

  static getInstance(): PWAInstallManager {
    if (!PWAInstallManager.instance) {
      PWAInstallManager.instance = new PWAInstallManager();
    }
    return PWAInstallManager.instance;
  }

  private setupInstallListeners() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      
      this.installPrompt = e as PWAInstallEvent;
      this.isInstallable = true;
      this.notifyListeners();
    });

    // Listen for the appinstalled event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.isInstallable = false;
      this.installPrompt = null;
      this.notifyListeners();
    });
  }

  private checkInstallStatus() {
    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }

    // Check if running as TWA
    if (document.referrer.includes('android-app://')) {
      this.isInstalled = true;
    }

    // Check if running in fullscreen mode (iOS)
    if (window.navigator && (window.navigator as any).standalone) {
      this.isInstalled = true;
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isInstallable));
  }

  public onInstallabilityChange(callback: (installable: boolean) => void) {
    this.listeners.add(callback);
    // Call immediately with current state
    callback(this.isInstallable);

    return () => {
      this.listeners.delete(callback);
    };
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }

    try {
      // Show the install prompt
      await this.installPrompt.prompt();
      
      // Wait for the user to respond
      const { outcome } = await this.installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.isInstallable = false;
        this.installPrompt = null;
        this.notifyListeners();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error prompting install:', error);
      return false;
    }
  }

  public getInstallStatus() {
    return {
      isInstallable: this.isInstallable,
      isInstalled: this.isInstalled,
      canPrompt: !!this.installPrompt
    };
  }

  public async shareApp() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'B-Perks - Barangay Community Platform',
          text: 'Join the B-Perks community engagement platform for Barangay San Vicente',
          url: window.location.origin,
        });
        return true;
      } catch (error) {
        console.error('Error sharing:', error);
        return false;
      }
    }
    return false;
  }

  public async copyAppUrl(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      return true;
    } catch (error) {
      console.error('Error copying URL:', error);
      return false;
    }
  }
}

export const pwaInstallManager = PWAInstallManager.getInstance();