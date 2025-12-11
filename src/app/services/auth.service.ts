import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  lastLogin: Date;
  interviewCount: number;
  averageScore: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// Detailed interview history record
export interface InterviewHistoryRecord {
  id: string;
  date: Date;
  mode: string;
  questionsAnswered: number;
  totalQuestions: number;
  overallScore: number;
  grade: string;
  summary: string;
  readyForInterview: boolean;
  duration?: number; // in minutes
  strengths: Array<{ area: string; score?: number; note?: string }>;
  improvementAreas: Array<{ area: string; priority: string; suggestion: string }>;
  keyGaps: string[];
  recommendations: string[];
  answersEvaluation: Array<{
    questionNumber: number;
    question: string;
    answer: string;
    score: number;
    isCorrect: boolean;
    feedback: string;
  }>;
  categoryPerformance: Record<string, { score: number; note: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly KEYS = {
    USERS: 'mockmate_users',
    CURRENT_USER: 'mockmate_current_user',
    USER_STATS: 'mockmate_user_stats'
  };

  // Reactive state
  private authState = signal<AuthState>({
    isAuthenticated: false,
    user: null
  });

  // Public computed values
  isAuthenticated = computed(() => this.authState().isAuthenticated);
  currentUser = computed(() => this.authState().user);

  constructor() {
    this.checkExistingSession();
  }

  private checkExistingSession(): void {
    const userId = localStorage.getItem(this.KEYS.CURRENT_USER);
    if (userId) {
      const users = this.getAllUsers();
      const user = users[userId];
      if (user) {
        this.authState.set({
          isAuthenticated: true,
          user: user
        });
      }
    }
  }

  private getAllUsers(): Record<string, User> {
    const data = localStorage.getItem(this.KEYS.USERS);
    return data ? JSON.parse(data) : {};
  }

  private saveUsers(users: Record<string, User>): void {
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async signup(email: string, name: string, password: string): Promise<{ success: boolean; error?: string }> {
    // Validate email
    if (!this.isValidEmail(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    // Validate name
    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Please enter your name (at least 2 characters)' };
    }

    // Validate password
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const users = this.getAllUsers();
    
    // Check if email already exists
    const existingUser = Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Create new user
    const userId = this.generateId();
    const newUser: User = {
      id: userId,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      createdAt: new Date(),
      lastLogin: new Date(),
      interviewCount: 0,
      averageScore: 0
    };

    // Store user
    users[userId] = newUser;
    this.saveUsers(users);

    // Store password hash (simple encoding for demo - in production use proper hashing)
    const passwords = this.getPasswords();
    passwords[userId] = btoa(password); // Base64 encoding (not secure, just for demo)
    localStorage.setItem('mockmate_passwords', JSON.stringify(passwords));

    // Log in the user
    localStorage.setItem(this.KEYS.CURRENT_USER, userId);
    this.authState.set({
      isAuthenticated: true,
      user: newUser
    });

    return { success: true };
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    // Validate email
    if (!this.isValidEmail(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    if (!password) {
      return { success: false, error: 'Please enter your password' };
    }

    const users = this.getAllUsers();
    const user = Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, error: 'No account found with this email' };
    }

    // Check password
    const passwords = this.getPasswords();
    const storedPassword = passwords[user.id];
    
    if (!storedPassword || btoa(password) !== storedPassword) {
      return { success: false, error: 'Incorrect password' };
    }

    // Update last login
    user.lastLogin = new Date();
    users[user.id] = user;
    this.saveUsers(users);

    // Set current user
    localStorage.setItem(this.KEYS.CURRENT_USER, user.id);
    this.authState.set({
      isAuthenticated: true,
      user: user
    });

    return { success: true };
  }

  logout(): void {
    localStorage.removeItem(this.KEYS.CURRENT_USER);
    this.authState.set({
      isAuthenticated: false,
      user: null
    });
  }

  private getPasswords(): Record<string, string> {
    const data = localStorage.getItem('mockmate_passwords');
    return data ? JSON.parse(data) : {};
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Update user stats after interview
  updateUserStats(score: number): void {
    const user = this.currentUser();
    if (!user) return;

    const users = this.getAllUsers();
    const currentUser = users[user.id];
    
    if (currentUser) {
      const totalScore = currentUser.averageScore * currentUser.interviewCount;
      currentUser.interviewCount++;
      currentUser.averageScore = Math.round((totalScore + score) / currentUser.interviewCount);
      
      users[user.id] = currentUser;
      this.saveUsers(users);
      
      this.authState.set({
        isAuthenticated: true,
        user: currentUser
      });
    }
  }

  // Get user's interview history
  getUserHistory(): InterviewHistoryRecord[] {
    const user = this.currentUser();
    if (!user) return [];

    const historyKey = `mockmate_history_${user.id}`;
    const data = localStorage.getItem(historyKey);
    return data ? JSON.parse(data) : [];
  }

  // Save interview to history with full details
  saveToHistory(historyRecord: Partial<InterviewHistoryRecord>): void {
    const user = this.currentUser();
    if (!user) return;

    const historyKey = `mockmate_history_${user.id}`;
    const history = this.getUserHistory();
    
    const record: InterviewHistoryRecord = {
      id: this.generateId(),
      date: new Date(),
      mode: historyRecord.mode || 'all',
      questionsAnswered: historyRecord.questionsAnswered || 0,
      totalQuestions: historyRecord.totalQuestions || 0,
      overallScore: historyRecord.overallScore || 0,
      grade: historyRecord.grade || 'N/A',
      summary: historyRecord.summary || '',
      readyForInterview: historyRecord.readyForInterview || false,
      duration: historyRecord.duration,
      strengths: historyRecord.strengths || [],
      improvementAreas: historyRecord.improvementAreas || [],
      keyGaps: historyRecord.keyGaps || [],
      recommendations: historyRecord.recommendations || [],
      answersEvaluation: historyRecord.answersEvaluation || [],
      categoryPerformance: historyRecord.categoryPerformance || {}
    };

    history.unshift(record);

    // Keep only last 50 interviews
    if (history.length > 50) {
      history.pop();
    }

    localStorage.setItem(historyKey, JSON.stringify(history));
  }

  // Delete a specific history record
  deleteHistoryRecord(recordId: string): void {
    const user = this.currentUser();
    if (!user) return;

    const historyKey = `mockmate_history_${user.id}`;
    let history = this.getUserHistory();
    history = history.filter(record => record.id !== recordId);
    localStorage.setItem(historyKey, JSON.stringify(history));
  }

  // Clear all history
  clearHistory(): void {
    const user = this.currentUser();
    if (!user) return;

    const historyKey = `mockmate_history_${user.id}`;
    localStorage.removeItem(historyKey);
  }
}

