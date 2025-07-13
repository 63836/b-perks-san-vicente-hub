export interface User {
  id: string;
  name: string;
  age: number;
  phoneNumber: string;
  username: string;
  password: string;
  points: number;
  isAdmin: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'earned' | 'redeemed';
  amount: number;
  description: string;
  eventId?: string;
  rewardId?: string;
  timestamp: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  pointsReward: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  imageUrl?: string;
  participants: EventParticipant[];
}

export interface EventParticipant {
  userId: string;
  userName: string;
  joinedAt: string;
  proofSubmitted?: {
    type: 'image' | 'video';
    url: string;
    submittedAt: string;
  };
  status: 'registered' | 'participated' | 'approved' | 'declined';
  pointsAwarded?: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  imageUrl?: string;
  isAvailable: boolean;
  category: string;
}

export interface NewsAlert {
  id: string;
  title: string;
  content: string;
  type: 'news' | 'alert' | 'announcement';
  imageUrl?: string;
  publishedAt: string;
  authorId: string;
}

export interface Report {
  id: string;
  userId: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  imageUrl?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  submittedAt: string;
}

export interface SafetyLevel {
  purokId: string;
  purokName: string;
  level: 'low' | 'medium' | 'high';
  description: string;
  lastUpdated: string;
}