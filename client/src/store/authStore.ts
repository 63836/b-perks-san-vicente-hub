import { User } from '@shared/schema';
import { localStorageManager } from '@/utils/localStorage';

class AuthStore {
  private static instance: AuthStore;
  private currentUser: User | null = null;
  private users: User[] = [];

  private constructor() {
    localStorageManager.initialize();
    this.loadFromStorage();
  }

  static getInstance(): AuthStore {
    if (!AuthStore.instance) {
      AuthStore.instance = new AuthStore();
    }
    return AuthStore.instance;
  }

  private loadFromStorage() {
    try {
      const usersData = localStorage.getItem('b-perks-users');
      const currentUserData = localStorage.getItem('b-perks-current-user');
      
      if (usersData) {
        this.users = JSON.parse(usersData);
      }
      
      if (currentUserData) {
        this.currentUser = JSON.parse(currentUserData);
      }

      // Initialize with default admin if no users exist
      if (this.users.length === 0) {
        this.users = [{
          id: 1,
          name: 'Barangay Admin',
          age: 35,
          phoneNumber: '+639123456789',
          username: 'admin',
          password: 'admin123',
          points: 0,
          isAdmin: true,
          createdAt: new Date()
        }];
        this.saveToStorage();
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('b-perks-users', JSON.stringify(this.users));
      if (this.currentUser) {
        localStorage.setItem('b-perks-current-user', JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem('b-perks-current-user');
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  async signup(userData: Omit<User, 'id' | 'points' | 'isAdmin' | 'createdAt'>): Promise<User> {
    // Always use backend API for signup
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        const user = await response.json();
        console.log('Backend signup successful, user ID:', user.id);
        return user;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Backend signup failed:', error);
      throw error;
    }
  }

  async login(username: string, password: string): Promise<User> {
    // Always try backend API first
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        const user = data.user || data;
        this.currentUser = user;
        this.saveToStorage();
        console.log('Backend login successful, user ID:', user.id);
        return user;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Backend login failed:', error);
      throw new Error('Login failed');
    }
  }

  setCurrentUser(user: User) {
    this.currentUser = user;
    this.saveToStorage();
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('b-perks-current-user');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  updateUserPoints(userId: string, points: number) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex].points = points;
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser.points = points;
      }
      this.saveToStorage();
    }
  }

  getAllUsers(): User[] {
    return this.users;
  }
}

export const authStore = AuthStore.getInstance();