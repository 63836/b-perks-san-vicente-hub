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

  signup(userData: Omit<User, 'id' | 'points' | 'isAdmin' | 'createdAt'>) {
    // Check if username already exists
    if (this.users.find(user => user.username === userData.username)) {
      throw new Error('Username already exists');
    }

    const newUser: User = {
      ...userData,
      id: Date.now(),
      points: 0,
      isAdmin: false,
      createdAt: new Date()
    };

    this.users.push(newUser);
    this.saveToStorage();
    return newUser;
  }

  login(username: string, password: string): User {
    const user = this.users.find(u => u.username === username && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    this.currentUser = user;
    this.saveToStorage();
    return user;
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