import { 
  users, 
  rewards, 
  rewardClaims, 
  events, 
  eventParticipants, 
  reports, 
  newsAlerts, 
  transactions,
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

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Rewards
  getAllRewards(): Promise<Reward[]>;
  getReward(id: number): Promise<Reward | undefined>;
  createReward(reward: InsertReward): Promise<Reward>;
  updateReward(id: number, reward: Partial<Reward>): Promise<Reward>;
  deleteReward(id: number): Promise<boolean>;
  
  // Reward Claims
  createRewardClaim(userId: number, rewardId: number): Promise<RewardClaim>;
  getRewardClaims(): Promise<RewardClaim[]>;
  getUserRewardClaims(userId: number): Promise<RewardClaim[]>;
  updateRewardClaimStatus(claimId: number, status: string, verifiedBy?: number): Promise<RewardClaim>;
  getRewardClaimByCode(claimCode: string): Promise<RewardClaim | undefined>;
  
  // Events
  getAllEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Event Participants
  joinEvent(eventId: number, userId: number): Promise<EventParticipant>;
  getEventParticipants(eventId: number): Promise<EventParticipant[]>;
  getUserEventParticipations(userId: number): Promise<EventParticipant[]>;
  updateEventParticipant(id: number, updates: Partial<EventParticipant>): Promise<EventParticipant>;
  
  // Reports
  getAllReports(): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  createReport(report: InsertReport & { userId: number }): Promise<Report>;
  updateReport(id: number, report: Partial<Report>): Promise<Report>;
  
  // News & Alerts
  getAllNewsAlerts(): Promise<NewsAlert[]>;
  createNewsAlert(newsAlert: InsertNewsAlert & { authorId: number }): Promise<NewsAlert>;
  
  // Transactions
  createTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rewards: Map<number, Reward>;
  private rewardClaims: Map<number, RewardClaim>;
  private events: Map<number, Event>;
  private eventParticipants: Map<number, EventParticipant>;
  private reports: Map<number, Report>;
  private newsAlerts: Map<number, NewsAlert>;
  private transactions: Map<number, Transaction>;
  private currentId: number;

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
    
    // Initialize with sample data
    this.initializeSampleData();
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
      points: 0,
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

    // Create sample rewards
    const rewards = [
      {
        id: this.currentId++,
        title: "Eco-Friendly Water Bottle",
        description: "Reusable water bottle made from recycled materials",
        pointsCost: 100,
        imageUrl: null,
        isAvailable: true,
        category: "Environment",
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        title: "Community Garden Starter Kit",
        description: "Seeds and tools to start your own garden",
        pointsCost: 200,
        imageUrl: null,
        isAvailable: true,
        category: "Environment",
        createdAt: new Date(),
      },
    ];
    
    rewards.forEach(reward => this.rewards.set(reward.id, reward));
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      points: 0,
      isAdmin: false,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPoints(userId: number, points: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, points };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Rewards
  async getAllRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values());
  }

  async getReward(id: number): Promise<Reward | undefined> {
    return this.rewards.get(id);
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const id = this.currentId++;
    const newReward: Reward = {
      ...reward,
      id,
      isAvailable: true,
      createdAt: new Date(),
    };
    this.rewards.set(id, newReward);
    return newReward;
  }

  async updateReward(id: number, reward: Partial<Reward>): Promise<Reward> {
    const existing = this.rewards.get(id);
    if (!existing) throw new Error("Reward not found");
    
    const updated = { ...existing, ...reward };
    this.rewards.set(id, updated);
    return updated;
  }

  async deleteReward(id: number): Promise<boolean> {
    return this.rewards.delete(id);
  }

  // Reward Claims
  async createRewardClaim(userId: number, rewardId: number): Promise<RewardClaim> {
    const id = this.currentId++;
    const claimCode = `BP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const claim: RewardClaim = {
      id,
      userId,
      rewardId,
      claimCode,
      status: "unclaimed",
      claimedAt: new Date(),
      verifiedAt: null,
      verifiedBy: null,
    };
    
    this.rewardClaims.set(id, claim);
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
    if (!claim) throw new Error("Claim not found");
    
    const updated = {
      ...claim,
      status,
      verifiedAt: status === "claimed" ? new Date() : null,
      verifiedBy: verifiedBy || null,
    };
    
    this.rewardClaims.set(claimId, updated);
    return updated;
  }

  async getRewardClaimByCode(claimCode: string): Promise<RewardClaim | undefined> {
    return Array.from(this.rewardClaims.values()).find(claim => claim.claimCode === claimCode);
  }

  // Events
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.currentId++;
    const newEvent: Event = {
      ...event,
      id,
      isActive: true,
      createdAt: new Date(),
    };
    this.events.set(id, newEvent);
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<Event>): Promise<Event> {
    const existing = this.events.get(id);
    if (!existing) throw new Error("Event not found");
    
    const updated = { ...existing, ...event };
    this.events.set(id, updated);
    return updated;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Event Participants
  async joinEvent(eventId: number, userId: number): Promise<EventParticipant> {
    const id = this.currentId++;
    const participant: EventParticipant = {
      id,
      eventId,
      userId,
      joinedAt: new Date(),
      proofType: null,
      proofUrl: null,
      proofFileName: null,
      proofFileSize: null,
      submittedAt: null,
      status: "registered",
      pointsAwarded: null,
      reviewedAt: null,
      reviewedBy: null,
    };
    
    this.eventParticipants.set(id, participant);
    return participant;
  }

  async getEventParticipants(eventId: number): Promise<EventParticipant[]> {
    return Array.from(this.eventParticipants.values()).filter(p => p.eventId === eventId);
  }

  async getUserEventParticipations(userId: number): Promise<EventParticipant[]> {
    return Array.from(this.eventParticipants.values()).filter(p => p.userId === userId);
  }

  async updateEventParticipant(id: number, updates: Partial<EventParticipant>): Promise<EventParticipant> {
    const existing = this.eventParticipants.get(id);
    if (!existing) throw new Error("Participant not found");
    
    const updated = { ...existing, ...updates };
    this.eventParticipants.set(id, updated);
    return updated;
  }

  // Reports
  async getAllReports(): Promise<Report[]> {
    return Array.from(this.reports.values());
  }

  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async createReport(report: InsertReport & { userId: number }): Promise<Report> {
    const id = this.currentId++;
    const newReport: Report = {
      ...report,
      id,
      status: "pending",
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      resolvedAt: null,
    };
    this.reports.set(id, newReport);
    return newReport;
  }

  async updateReport(id: number, report: Partial<Report>): Promise<Report> {
    const existing = this.reports.get(id);
    if (!existing) throw new Error("Report not found");
    
    const updated = { ...existing, ...report };
    this.reports.set(id, updated);
    return updated;
  }

  // News & Alerts
  async getAllNewsAlerts(): Promise<NewsAlert[]> {
    return Array.from(this.newsAlerts.values());
  }

  async createNewsAlert(newsAlert: InsertNewsAlert & { authorId: number }): Promise<NewsAlert> {
    const id = this.currentId++;
    const newAlert: NewsAlert = {
      ...newsAlert,
      id,
      publishedAt: new Date(),
    };
    this.newsAlerts.set(id, newAlert);
    return newAlert;
  }

  // Transactions
  async createTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
    const id = this.currentId++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      timestamp: new Date(),
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.userId === userId);
  }
}

export const storage = new MemStorage();
