import { 
  type User, 
  type InsertUser, 
  type Reward, 
  type InsertReward, 
  type RewardClaim, 
  type Event, 
  type InsertEvent, 
  type EventParticipant, 
  type Report, 
  type InsertReport, 
  type NewsAlert, 
  type InsertNewsAlert, 
  type Transaction 
} from "@shared/schema";
import { IStorage } from "./storage";
import * as fs from 'fs/promises';
import * as path from 'path';

// File-based storage adapter that persists to local text files
export class FileStorageAdapter implements IStorage {
  private users: Map<number, User>;
  private rewards: Map<number, Reward>;
  private rewardClaims: Map<number, RewardClaim>;
  private events: Map<number, Event>;
  private eventParticipants: Map<number, EventParticipant>;
  private reports: Map<number, Report>;
  private newsAlerts: Map<number, NewsAlert>;
  private transactions: Map<number, Transaction>;
  private currentId: number;
  private dataDir: string;

  constructor() {
    this.users = new Map();
    this.rewards = new Map();
    this.rewardClaims = new Map();
    this.events = new Map();
    this.eventParticipants = new Map();
    this.reports = new Map();
    this.newsAlerts = new Map();
    this.transactions = new Map();
    this.currentId = 1;
    this.dataDir = path.join(process.cwd(), 'data', 'local_database');
    
    this.initializeSampleData();
  }

  private async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  private async saveUsersToFile() {
    await this.ensureDataDir();
    const usersArray = Array.from(this.users.values());
    let content = "LOGIN CREDENTIALS - B-PERKS SYSTEM\n";
    content += "=======================================\n\n";
    
    const adminUsers = usersArray.filter(u => u.isAdmin);
    const regularUsers = usersArray.filter(u => !u.isAdmin);
    
    if (adminUsers.length > 0) {
      content += "ADMIN ACCOUNTS:\n";
      adminUsers.forEach(user => {
        content += `- Username: ${user.username}\n`;
        content += `- Password: ${user.password}\n`;
        content += `- Name: ${user.name}\n`;
        content += `- Age: ${user.age}\n`;
        content += `- Phone: ${user.phoneNumber}\n`;
        content += `- Points: ${user.points}\n`;
        content += `- Role: Admin\n`;
        content += `- User ID: ${user.id}\n\n`;
      });
    }
    
    if (regularUsers.length > 0) {
      content += "USER ACCOUNTS:\n";
      regularUsers.forEach(user => {
        content += `- Username: ${user.username}\n`;
        content += `- Password: ${user.password}\n`;
        content += `- Name: ${user.name}\n`;
        content += `- Age: ${user.age}\n`;
        content += `- Phone: ${user.phoneNumber}\n`;
        content += `- Points: ${user.points}\n`;
        content += `- Role: Resident\n`;
        content += `- User ID: ${user.id}\n\n`;
      });
    }
    
    content += `Total Users: ${usersArray.length}\n`;
    content += `Admin Users: ${adminUsers.length}\n`;
    content += `Regular Users: ${regularUsers.length}`;
    
    await fs.writeFile(path.join(this.dataDir, 'users.txt'), content);
  }

  private async saveEventsToFile() {
    await this.ensureDataDir();
    const eventsArray = Array.from(this.events.values());
    let content = "COMMUNITY EVENTS - B-PERKS SYSTEM\n";
    content += "==================================\n\n";
    
    eventsArray.forEach(event => {
      content += `EVENT ID: ${event.id}\n`;
      content += `Title: ${event.title}\n`;
      content += `Description: ${event.description}\n`;
      content += `Location: ${event.location}\n`;
      content += `Coordinates: ${event.lat}, ${event.lng}\n`;
      content += `Points Reward: ${event.pointsReward}\n`;
      content += `Start Date: ${event.startDate.toLocaleDateString()} at ${event.startDate.toLocaleTimeString()}\n`;
      content += `End Date: ${event.endDate.toLocaleDateString()} at ${event.endDate.toLocaleTimeString()}\n`;
      content += `Status: ${event.isActive ? 'Active' : 'Inactive'}\n`;
      content += `Max Participants: ${event.maxParticipants}\n`;
      content += `Image: ${event.imageUrl || '/placeholder.svg'}\n\n`;
    });
    
    const activeEvents = eventsArray.filter(e => e.isActive);
    content += `Total Events: ${eventsArray.length}\n`;
    content += `Active Events: ${activeEvents.length}`;
    
    await fs.writeFile(path.join(this.dataDir, 'events.txt'), content);
  }

  private async saveRewardsToFile() {
    await this.ensureDataDir();
    const rewardsArray = Array.from(this.rewards.values());
    let content = "REWARDS CATALOG - B-PERKS SYSTEM\n";
    content += "=================================\n\n";
    
    rewardsArray.forEach(reward => {
      content += `REWARD ID: ${reward.id}\n`;
      content += `Title: ${reward.title}\n`;
      content += `Description: ${reward.description}\n`;
      content += `Points Cost: ${reward.pointsCost}\n`;
      content += `Category: ${reward.category}\n`;
      content += `Status: ${reward.isAvailable ? 'Available' : 'Unavailable'}\n`;
      content += `Image: ${reward.imageUrl || '/placeholder.svg'}\n\n`;
    });
    
    const availableRewards = rewardsArray.filter(r => r.isAvailable);
    const categories = [...new Set(rewardsArray.map(r => r.category))];
    content += `Total Rewards: ${rewardsArray.length}\n`;
    content += `Available Rewards: ${availableRewards.length}\n`;
    content += `Categories: ${categories.join(', ')}`;
    
    await fs.writeFile(path.join(this.dataDir, 'rewards.txt'), content);
  }

  private async saveReportsToFile() {
    await this.ensureDataDir();
    const reportsArray = Array.from(this.reports.values());
    let content = "COMMUNITY REPORTS - B-PERKS SYSTEM\n";
    content += "===================================\n\n";
    
    for (const report of reportsArray) {
      const user = this.users.get(report.userId);
      content += `REPORT ID: ${report.id}\n`;
      content += `User: ${user?.name || 'Unknown'} (ID: ${report.userId})\n`;
      content += `Title: ${report.title}\n`;
      content += `Description: ${report.description}\n`;
      content += `Location: ${report.location}\n`;
      content += `Coordinates: ${report.lat}, ${report.lng}\n`;
      content += `Status: ${report.status}\n`;
      content += `Image: ${report.imageUrl || '/placeholder.svg'}\n`;
      content += `Date Submitted: ${report.createdAt.toLocaleDateString()}\n\n`;
    }
    
    const pendingReports = reportsArray.filter(r => r.status === 'pending');
    const resolvedReports = reportsArray.filter(r => r.status === 'resolved');
    content += `Total Reports: ${reportsArray.length}\n`;
    content += `Pending Reports: ${pendingReports.length}\n`;
    content += `Resolved Reports: ${resolvedReports.length}`;
    
    await fs.writeFile(path.join(this.dataDir, 'reports.txt'), content);
  }

  private async saveNewsAlertsToFile() {
    await this.ensureDataDir();
    const newsArray = Array.from(this.newsAlerts.values());
    let content = "NEWS & ALERTS - B-PERKS SYSTEM\n";
    content += "===============================\n\n";
    
    for (const news of newsArray) {
      const author = this.users.get(news.authorId);
      content += `${news.type.toUpperCase()} ID: ${news.id}\n`;
      content += `Title: ${news.title}\n`;
      content += `Content: ${news.content}\n`;
      content += `Type: ${news.type.charAt(0).toUpperCase() + news.type.slice(1)}\n`;
      content += `Author: ${author?.name || 'Unknown'} (ID: ${news.authorId})\n`;
      content += `Image: ${news.imageUrl || '/placeholder.svg'}\n`;
      content += `Date Published: ${news.createdAt.toLocaleDateString()}\n\n`;
    }
    
    const announcements = newsArray.filter(n => n.type === 'announcement');
    const alerts = newsArray.filter(n => n.type === 'alert');
    const news = newsArray.filter(n => n.type === 'news');
    content += `Total Posts: ${newsArray.length}\n`;
    content += `Announcements: ${announcements.length}\n`;
    content += `Alerts: ${alerts.length}\n`;
    content += `News: ${news.length}`;
    
    await fs.writeFile(path.join(this.dataDir, 'news_alerts.txt'), content);
  }

  private async updateDatabaseSummary() {
    await this.ensureDataDir();
    const now = new Date();
    let content = "B-PERKS LOCAL DATABASE SUMMARY\n";
    content += "==============================\n";
    content += `Last Updated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}\n`;
    content += "System: Barangay San Vicente Community Engagement Platform\n\n";
    
    const activeEvents = Array.from(this.events.values()).filter(e => e.isActive);
    const availableRewards = Array.from(this.rewards.values()).filter(r => r.isAvailable);
    const pendingReports = Array.from(this.reports.values()).filter(r => r.status === 'pending');
    const adminUsers = Array.from(this.users.values()).filter(u => u.isAdmin);
    const regularUsers = Array.from(this.users.values()).filter(u => !u.isAdmin);
    
    content += "DATABASE STATISTICS:\n";
    content += `- Total Users: ${this.users.size} (${adminUsers.length} Admin, ${regularUsers.length} Residents)\n`;
    content += `- Active Events: ${activeEvents.length}\n`;
    content += `- Available Rewards: ${availableRewards.length}\n`;
    content += `- Pending Reports: ${pendingReports.length}\n`;
    content += `- News & Alerts: ${this.newsAlerts.size}\n\n`;
    
    content += "SYSTEM STATUS:\n";
    content += "- All data persisted to local text files\n";
    content += "- Primary database using file storage\n";
    content += "- Files stored in: data/local_database/\n\n";
    
    content += "FILES MAINTAINED:\n";
    content += "1. users.txt - Login credentials and user accounts\n";
    content += "2. events.txt - Community events and activities\n";
    content += "3. rewards.txt - Reward catalog and points system\n";
    content += "4. reports.txt - Community issue reports\n";
    content += "5. news_alerts.txt - News, alerts, and announcements\n";
    content += "6. database_summary.txt - This summary file\n\n";
    
    content += "RECENT ACTIVITY:\n";
    content += "- File-based storage system activated\n";
    content += "- All new data automatically saved to files\n";
    content += "- Real-time persistence enabled";
    
    await fs.writeFile(path.join(this.dataDir, 'database_summary.txt'), content);
  }

  private initializeSampleData() {
    // Create admin user
    const admin: User = {
      id: this.currentId++,
      username: "admin",
      password: "admin123",
      name: "Administrator",
      age: 30,
      phoneNumber: "09123456789",
      points: 1000,
      isAdmin: true,
      createdAt: new Date(),
    };
    this.users.set(admin.id, admin);

    // Create sample user
    const user: User = {
      id: this.currentId++,
      username: "user1",
      password: "user123",
      name: "Juan Dela Cruz",
      age: 25,
      phoneNumber: "09987654321",
      points: 150,
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);

    // Create sample user 2
    const user2: User = {
      id: this.currentId++,
      username: "maria",
      password: "maria123",
      name: "Maria Santos",
      age: 28,
      phoneNumber: "09876543210",
      points: 75,
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(user2.id, user2);

    // Create sample rewards
    const rewards = [
      {
        id: this.currentId++,
        title: "Eco-Friendly Water Bottle",
        description: "BPA-free stainless steel water bottle with Barangay San Vicente logo",
        pointsCost: 100,
        imageUrl: "/placeholder.svg",
        isAvailable: true,
        category: "Environment",
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        title: "Community Garden Seeds Pack",
        description: "Vegetable seeds for home gardening - tomato, lettuce, herbs",
        pointsCost: 75,
        imageUrl: "/placeholder.svg",
        isAvailable: true,
        category: "Gardening",
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        title: "Barangay T-Shirt",
        description: "Official Barangay San Vicente t-shirt, available in all sizes",
        pointsCost: 150,
        imageUrl: "/placeholder.svg",
        isAvailable: true,
        category: "Apparel",
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        title: "Emergency Flashlight",
        description: "LED flashlight with hand crank for emergencies",
        pointsCost: 200,
        imageUrl: "/placeholder.svg",
        isAvailable: true,
        category: "Safety",
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        title: "Reusable Shopping Bag",
        description: "Durable canvas shopping bag to reduce plastic use",
        pointsCost: 50,
        imageUrl: "/placeholder.svg",
        isAvailable: true,
        category: "Environment",
        createdAt: new Date(),
      }
    ];

    rewards.forEach(reward => {
      this.rewards.set(reward.id, reward as Reward);
    });

    // Create sample events
    const events = [
      {
        id: this.currentId++,
        title: "Community Clean-Up Drive",
        description: "Join us for a neighborhood cleanup to keep our barangay beautiful and earn points!",
        location: "Barangay San Vicente Plaza",
        lat: 16.4023,
        lng: 120.5960,
        pointsReward: 50,
        startDate: new Date('2025-07-20T08:00:00'),
        endDate: new Date('2025-07-20T12:00:00'),
        isActive: true,
        imageUrl: "/placeholder.svg",
        maxParticipants: 50,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        title: "Disaster Preparedness Seminar",
        description: "Learn essential emergency preparedness skills and earn points for attending",
        location: "Barangay Hall Conference Room",
        lat: 16.4020,
        lng: 120.5955,
        pointsReward: 75,
        startDate: new Date('2025-07-25T14:00:00'),
        endDate: new Date('2025-07-25T17:00:00'),
        isActive: true,
        imageUrl: "/placeholder.svg",
        maxParticipants: 30,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        title: "Tree Planting Activity",
        description: "Help restore our environment by planting trees in the community park",
        location: "San Vicente Community Park",
        lat: 16.4025,
        lng: 120.5965,
        pointsReward: 100,
        startDate: new Date('2025-07-30T07:00:00'),
        endDate: new Date('2025-07-30T11:00:00'),
        isActive: true,
        imageUrl: "/placeholder.svg",
        maxParticipants: 40,
        createdAt: new Date(),
      }
    ];

    events.forEach(event => {
      this.events.set(event.id, event as Event);
    });

    // Create sample reports
    const reports = [
      {
        id: this.currentId++,
        userId: user.id,
        title: "Broken Street Light",
        description: "The street light on Main Street has been broken for 3 days. It's dangerous at night.",
        location: "Main Street near Sari-sari store",
        lat: 16.4018,
        lng: 120.5950,
        imageUrl: "/placeholder.svg",
        status: 'pending',
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        userId: user2.id,
        title: "Clogged Drainage",
        description: "The drainage system is clogged and causing flooding during heavy rains.",
        location: "Purok 2 near basketball court",
        lat: 16.4030,
        lng: 120.5970,
        imageUrl: "/placeholder.svg",
        status: 'pending',
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        userId: user.id,
        title: "Stray Dogs Issue",
        description: "There are several stray dogs in the area that might pose a health risk.",
        location: "Near elementary school",
        lat: 16.4015,
        lng: 120.5945,
        imageUrl: "/placeholder.svg",
        status: 'pending',
        createdAt: new Date(),
      }
    ];

    reports.forEach(report => {
      this.reports.set(report.id, report as Report);
    });

    // Create sample news alerts
    const newsAlerts = [
      {
        id: this.currentId++,
        title: "Barangay Assembly Meeting",
        content: "Monthly barangay assembly meeting scheduled for July 28, 2025 at 7:00 PM. All residents are encouraged to attend.",
        type: 'announcement',
        imageUrl: "/placeholder.svg",
        authorId: admin.id,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        title: "Water Interruption Notice",
        content: "Water service will be temporarily interrupted on July 22, 2025 from 8:00 AM to 4:00 PM for maintenance.",
        type: 'alert',
        imageUrl: "/placeholder.svg",
        authorId: admin.id,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        title: "New Health Center Services",
        content: "The barangay health center now offers free blood pressure monitoring every Tuesday and Thursday from 8:00 AM to 12:00 PM.",
        type: 'news',
        imageUrl: "/placeholder.svg",
        authorId: admin.id,
        createdAt: new Date(),
      }
    ];

    newsAlerts.forEach(alert => {
      this.newsAlerts.set(alert.id, alert as NewsAlert);
    });

    // Save initial data to files
    this.saveAllData();
  }

  private async saveAllData() {
    try {
      await Promise.all([
        this.saveUsersToFile(),
        this.saveEventsToFile(),
        this.saveRewardsToFile(),
        this.saveReportsToFile(),
        this.saveNewsAlertsToFile(),
        this.updateDatabaseSummary()
      ]);
    } catch (error) {
      console.error('Error saving data to files:', error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      id: this.currentId++,
      points: 0,
      isAdmin: false,
      createdAt: new Date(),
      ...insertUser 
    };
    this.users.set(user.id, user);
    await this.saveUsersToFile();
    await this.updateDatabaseSummary();
    return user;
  }

  async updateUserPoints(userId: number, points: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    user.points = points;
    this.users.set(userId, user);
    await this.saveUsersToFile();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Reward methods
  async getAllRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values());
  }

  async getReward(id: number): Promise<Reward | undefined> {
    return this.rewards.get(id);
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const newReward: Reward = {
      id: this.currentId++,
      createdAt: new Date(),
      ...reward
    };
    this.rewards.set(newReward.id, newReward);
    await this.saveRewardsToFile();
    await this.updateDatabaseSummary();
    return newReward;
  }

  async updateReward(id: number, reward: Partial<Reward>): Promise<Reward> {
    const existing = this.rewards.get(id);
    if (!existing) throw new Error('Reward not found');
    const updated = { ...existing, ...reward };
    this.rewards.set(id, updated);
    await this.saveRewardsToFile();
    return updated;
  }

  async deleteReward(id: number): Promise<boolean> {
    const deleted = this.rewards.delete(id);
    if (deleted) {
      await this.saveRewardsToFile();
      await this.updateDatabaseSummary();
    }
    return deleted;
  }

  // Reward claim methods
  async createRewardClaim(userId: number, rewardId: number): Promise<RewardClaim> {
    const claim: RewardClaim = {
      id: this.currentId++,
      userId,
      rewardId,
      claimCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      status: 'unclaimed',
      claimedAt: new Date(),
    };
    this.rewardClaims.set(claim.id, claim);
    return claim;
  }

  async getRewardClaims(): Promise<RewardClaim[]> {
    return Array.from(this.rewardClaims.values());
  }

  async getUserRewardClaims(userId: number): Promise<RewardClaim[]> {
    return Array.from(this.rewardClaims.values()).filter(claim => claim.userId === userId);
  }

  async updateRewardClaimStatus(claimId: number, status: string, verifiedBy?: number): Promise<RewardClaim> {
    const claim = this.rewardClaims.get(claimId);
    if (!claim) throw new Error('Claim not found');
    claim.status = status as any;
    if (verifiedBy) claim.verifiedBy = verifiedBy;
    if (status === 'claimed') claim.verifiedAt = new Date();
    this.rewardClaims.set(claimId, claim);
    return claim;
  }

  async getRewardClaimByCode(claimCode: string): Promise<RewardClaim | undefined> {
    for (const claim of this.rewardClaims.values()) {
      if (claim.claimCode === claimCode) {
        return claim;
      }
    }
    return undefined;
  }

  // Event methods
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const newEvent: Event = {
      id: this.currentId++,
      createdAt: new Date(),
      ...event
    };
    this.events.set(newEvent.id, newEvent);
    await this.saveEventsToFile();
    await this.updateDatabaseSummary();
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<Event>): Promise<Event> {
    const existing = this.events.get(id);
    if (!existing) throw new Error('Event not found');
    const updated = { ...existing, ...event };
    this.events.set(id, updated);
    await this.saveEventsToFile();
    return updated;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const deleted = this.events.delete(id);
    if (deleted) {
      await this.saveEventsToFile();
      await this.updateDatabaseSummary();
    }
    return deleted;
  }

  // Event participant methods
  async joinEvent(eventId: number, userId: number): Promise<EventParticipant> {
    const participant: EventParticipant = {
      id: this.currentId++,
      eventId,
      userId,
      joinedAt: new Date(),
      status: 'registered'
    };
    this.eventParticipants.set(participant.id, participant);
    return participant;
  }

  async getEventParticipants(eventId: number): Promise<EventParticipant[]> {
    return Array.from(this.eventParticipants.values()).filter(p => p.eventId === eventId);
  }

  async getUserEventParticipations(userId: number): Promise<EventParticipant[]> {
    return Array.from(this.eventParticipants.values()).filter(p => p.userId === userId);
  }

  async updateEventParticipant(id: number, updates: Partial<EventParticipant>): Promise<EventParticipant> {
    const participant = this.eventParticipants.get(id);
    if (!participant) throw new Error('Participant not found');
    const updated = { ...participant, ...updates };
    this.eventParticipants.set(id, updated);
    return updated;
  }

  // Report methods
  async getAllReports(): Promise<Report[]> {
    return Array.from(this.reports.values());
  }

  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async createReport(report: InsertReport & { userId: number }): Promise<Report> {
    const newReport: Report = {
      id: this.currentId++,
      status: 'pending',
      createdAt: new Date(),
      ...report
    };
    this.reports.set(newReport.id, newReport);
    await this.saveReportsToFile();
    await this.updateDatabaseSummary();
    return newReport;
  }

  async updateReport(id: number, report: Partial<Report>): Promise<Report> {
    const existing = this.reports.get(id);
    if (!existing) throw new Error('Report not found');
    const updated = { ...existing, ...report };
    this.reports.set(id, updated);
    await this.saveReportsToFile();
    return updated;
  }

  // News and alerts methods
  async getAllNewsAlerts(): Promise<NewsAlert[]> {
    return Array.from(this.newsAlerts.values());
  }

  async createNewsAlert(newsAlert: InsertNewsAlert & { authorId: number }): Promise<NewsAlert> {
    const newAlert: NewsAlert = {
      id: this.currentId++,
      createdAt: new Date(),
      ...newsAlert
    };
    this.newsAlerts.set(newAlert.id, newAlert);
    await this.saveNewsAlertsToFile();
    await this.updateDatabaseSummary();
    return newAlert;
  }

  // Transaction methods
  async createTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: this.currentId++,
      timestamp: new Date(),
      ...transaction
    };
    this.transactions.set(newTransaction.id, newTransaction);
    return newTransaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.userId === userId);
  }
}