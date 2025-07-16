import localforage from 'localforage';

// Frontend-only storage using browser's IndexedDB
class FrontendStorageManager {
  private userStore: LocalForage;
  private eventStore: LocalForage;
  private rewardStore: LocalForage;
  private reportStore: LocalForage;
  private newsStore: LocalForage;
  private claimStore: LocalForage;
  private transactionStore: LocalForage;

  constructor() {
    // Initialize separate stores for different data types
    this.userStore = localforage.createInstance({
      name: 'b-perks',
      storeName: 'users'
    });

    this.eventStore = localforage.createInstance({
      name: 'b-perks',
      storeName: 'events'
    });

    this.rewardStore = localforage.createInstance({
      name: 'b-perks',
      storeName: 'rewards'
    });

    this.reportStore = localforage.createInstance({
      name: 'b-perks',
      storeName: 'reports'
    });

    this.newsStore = localforage.createInstance({
      name: 'b-perks',
      storeName: 'news'
    });

    this.claimStore = localforage.createInstance({
      name: 'b-perks',
      storeName: 'claims'
    });

    this.transactionStore = localforage.createInstance({
      name: 'b-perks',
      storeName: 'transactions'
    });

    this.initializeData();
  }

  private async initializeData() {
    // Check if data already exists
    const users = await this.userStore.getItem('all');
    if (!users) {
      await this.seedInitialData();
    }
  }

  private async seedInitialData() {
    // Initial users
    const users = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        name: 'Administrator',
        age: 30,
        phoneNumber: '09123456789',
        points: 1000,
        isAdmin: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        username: 'user1',
        password: 'user123',
        name: 'Juan Dela Cruz',
        age: 25,
        phoneNumber: '09987654321',
        points: 200,
        isAdmin: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        username: 'maria',
        password: 'maria123',
        name: 'Maria Santos',
        age: 28,
        phoneNumber: '09876543210',
        points: 75,
        isAdmin: false,
        createdAt: new Date().toISOString()
      }
    ];

    // Initial events
    const events = [
      {
        id: 1,
        title: 'Community Clean-Up Drive',
        description: 'Join us for a neighborhood cleanup to keep our barangay beautiful and earn points!',
        location: 'Barangay San Vicente Plaza',
        lat: 16.3954,
        lng: 120.5968,
        pointsReward: 50,
        startDate: new Date('2025-07-20T08:00:00').toISOString(),
        endDate: new Date('2025-07-20T12:00:00').toISOString(),
        isActive: true,
        imageUrl: '/placeholder.svg',
        maxParticipants: 50,
        createdAt: new Date().toISOString()
      }
    ];

    // Initial rewards
    const rewards = [
      {
        id: 1,
        title: 'Eco-Friendly Water Bottle',
        description: 'BPA-free stainless steel water bottle with Barangay San Vicente logo',
        pointsCost: 100,
        imageUrl: '/placeholder.svg',
        isAvailable: true,
        category: 'Environment',
        totalQuantity: 20,
        availableQuantity: 20,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Community Garden Seeds Pack',
        description: 'Vegetable seeds for home gardening - tomato, lettuce, herbs',
        pointsCost: 75,
        imageUrl: '/placeholder.svg',
        isAvailable: true,
        category: 'Gardening',
        totalQuantity: 15,
        availableQuantity: 15,
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        title: 'Barangay T-Shirt',
        description: 'Official Barangay San Vicente t-shirt, available in all sizes',
        pointsCost: 150,
        imageUrl: '/placeholder.svg',
        isAvailable: true,
        category: 'Apparel',
        totalQuantity: 30,
        availableQuantity: 30,
        createdAt: new Date().toISOString()
      }
    ];

    // Save initial data
    await this.userStore.setItem('all', users);
    await this.eventStore.setItem('all', events);
    await this.rewardStore.setItem('all', rewards);
    await this.reportStore.setItem('all', []);
    await this.newsStore.setItem('all', []);
    await this.claimStore.setItem('all', []);
    await this.transactionStore.setItem('all', []);
  }

  // User operations
  async getUsers() {
    return await this.userStore.getItem('all') || [];
  }

  async getUserByUsername(username: string) {
    const users = await this.getUsers() as any[];
    return users.find(user => user.username === username);
  }

  async getUserById(id: number) {
    const users = await this.getUsers() as any[];
    return users.find(user => user.id === id);
  }

  async createUser(userData: any) {
    const users = await this.getUsers() as any[];
    const newUser = {
      ...userData,
      id: Math.max(...users.map(u => u.id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    await this.userStore.setItem('all', users);
    return newUser;
  }

  async updateUser(id: number, updates: any) {
    const users = await this.getUsers() as any[];
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      await this.userStore.setItem('all', users);
      return users[index];
    }
    return null;
  }

  // Event operations
  async getEvents() {
    return await this.eventStore.getItem('all') || [];
  }

  async createEvent(eventData: any) {
    const events = await this.getEvents() as any[];
    const newEvent = {
      ...eventData,
      id: Math.max(...events.map(e => e.id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    events.push(newEvent);
    await this.eventStore.setItem('all', events);
    return newEvent;
  }

  async updateEvent(id: number, updates: any) {
    const events = await this.getEvents() as any[];
    const index = events.findIndex(event => event.id === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...updates };
      await this.eventStore.setItem('all', events);
      return events[index];
    }
    return null;
  }

  // Reward operations
  async getRewards() {
    return await this.rewardStore.getItem('all') || [];
  }

  async createReward(rewardData: any) {
    const rewards = await this.getRewards() as any[];
    const newReward = {
      ...rewardData,
      id: Math.max(...rewards.map(r => r.id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    rewards.push(newReward);
    await this.rewardStore.setItem('all', rewards);
    return newReward;
  }

  async updateReward(id: number, updates: any) {
    const rewards = await this.getRewards() as any[];
    const index = rewards.findIndex(reward => reward.id === id);
    if (index !== -1) {
      rewards[index] = { ...rewards[index], ...updates };
      await this.rewardStore.setItem('all', rewards);
      return rewards[index];
    }
    return null;
  }

  // Report operations
  async getReports() {
    return await this.reportStore.getItem('all') || [];
  }

  async createReport(reportData: any) {
    const reports = await this.getReports() as any[];
    const newReport = {
      ...reportData,
      id: Math.max(...reports.map(r => r.id), 0) + 1,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    reports.push(newReport);
    await this.reportStore.setItem('all', reports);
    return newReport;
  }

  async updateReport(id: number, updates: any) {
    const reports = await this.getReports() as any[];
    const index = reports.findIndex(report => report.id === id);
    if (index !== -1) {
      reports[index] = { ...reports[index], ...updates };
      await this.reportStore.setItem('all', reports);
      return reports[index];
    }
    return null;
  }

  // News operations
  async getNews() {
    return await this.newsStore.getItem('all') || [];
  }

  async createNews(newsData: any) {
    const news = await this.getNews() as any[];
    const newNews = {
      ...newsData,
      id: Math.max(...news.map(n => n.id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    news.push(newNews);
    await this.newsStore.setItem('all', news);
    return newNews;
  }

  // Reward claims
  async getClaims() {
    return await this.claimStore.getItem('all') || [];
  }

  async createClaim(claimData: any) {
    const claims = await this.getClaims() as any[];
    const newClaim = {
      ...claimData,
      id: Math.max(...claims.map(c => c.id), 0) + 1,
      claimCode: `CLAIM-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    claims.push(newClaim);
    await this.claimStore.setItem('all', claims);
    return newClaim;
  }

  async updateClaim(id: number, updates: any) {
    const claims = await this.getClaims() as any[];
    const index = claims.findIndex(claim => claim.id === id);
    if (index !== -1) {
      claims[index] = { ...claims[index], ...updates };
      await this.claimStore.setItem('all', claims);
      return claims[index];
    }
    return null;
  }

  // Transactions
  async getTransactions() {
    return await this.transactionStore.getItem('all') || [];
  }

  async createTransaction(transactionData: any) {
    const transactions = await this.getTransactions() as any[];
    const newTransaction = {
      ...transactionData,
      id: Math.max(...transactions.map(t => t.id), 0) + 1,
      timestamp: new Date().toISOString()
    };
    transactions.push(newTransaction);
    await this.transactionStore.setItem('all', transactions);
    return newTransaction;
  }

  // Authentication
  async login(username: string, password: string) {
    const user = await this.getUserByUsername(username);
    if (user && user.password === password) {
      // Store current user in session storage
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    throw new Error('Invalid credentials');
  }

  logout() {
    sessionStorage.removeItem('currentUser');
  }

  getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const frontendStorage = new FrontendStorageManager();