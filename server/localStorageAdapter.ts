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

// Local storage adapter for client-side storage
export class LocalStorageAdapter implements IStorage {
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

    // Create sample rewards with images
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

    // Create sample events with images
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

    // Create sample news alerts with images
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
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      ...insertUser, 
      id: this.currentId++,
      points: 0,
      isAdmin: false,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserPoints(userId: number, points: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    
    user.points = points;
    this.users.set(userId, user);
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
      ...reward,
      id: this.currentId++,
      createdAt: new Date(),
    };
    this.rewards.set(newReward.id, newReward);
    return newReward;
  }

  async updateReward(id: number, reward: Partial<Reward>): Promise<Reward> {
    const existing = this.rewards.get(id);
    if (!existing) throw new Error('Reward not found');
    
    const updated = { ...existing, ...reward };
    this.rewards.set(id, updated);
    return updated;
  }

  async deleteReward(id: number): Promise<boolean> {
    return this.rewards.delete(id);
  }

  // Reward Claims methods
  async createRewardClaim(userId: number, rewardId: number): Promise<RewardClaim> {
    const claim: RewardClaim = {
      id: this.currentId++,
      userId,
      rewardId,
      claimCode: `CLAIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'unclaimed',
      claimedAt: new Date(),
      verifiedAt: null,
      verifiedBy: null,
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
    if (verifiedBy) {
      claim.verifiedBy = verifiedBy;
      claim.verifiedAt = new Date();
    }
    
    this.rewardClaims.set(claimId, claim);
    return claim;
  }

  async getRewardClaimByCode(claimCode: string): Promise<RewardClaim | undefined> {
    return Array.from(this.rewardClaims.values()).find(claim => claim.claimCode === claimCode);
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
      ...event,
      id: this.currentId++,
      createdAt: new Date(),
    };
    this.events.set(newEvent.id, newEvent);
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<Event>): Promise<Event> {
    const existing = this.events.get(id);
    if (!existing) throw new Error('Event not found');
    
    const updated = { ...existing, ...event };
    this.events.set(id, updated);
    return updated;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Event Participants methods
  async joinEvent(eventId: number, userId: number): Promise<EventParticipant> {
    const participant: EventParticipant = {
      id: this.currentId++,
      eventId,
      userId,
      joinedAt: new Date(),
      status: 'registered',
      proofSubmitted: null,
      pointsAwarded: null,
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
    const existing = this.eventParticipants.get(id);
    if (!existing) throw new Error('Participant not found');
    
    const updated = { ...existing, ...updates };
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
      ...report,
      id: this.currentId++,
      status: 'pending',
      createdAt: new Date(),
    };
    this.reports.set(newReport.id, newReport);
    return newReport;
  }

  async updateReport(id: number, report: Partial<Report>): Promise<Report> {
    const existing = this.reports.get(id);
    if (!existing) throw new Error('Report not found');
    
    const updated = { ...existing, ...report };
    this.reports.set(id, updated);
    return updated;
  }

  // News & Alerts methods
  async getAllNewsAlerts(): Promise<NewsAlert[]> {
    return Array.from(this.newsAlerts.values());
  }

  async createNewsAlert(newsAlert: InsertNewsAlert & { authorId: number }): Promise<NewsAlert> {
    const newAlert: NewsAlert = {
      ...newsAlert,
      id: this.currentId++,
      createdAt: new Date(),
    };
    this.newsAlerts.set(newAlert.id, newAlert);
    return newAlert;
  }

  // Transaction methods
  async createTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: this.currentId++,
      timestamp: new Date(),
    };
    this.transactions.set(newTransaction.id, newTransaction);
    return newTransaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.userId === userId);
  }
}