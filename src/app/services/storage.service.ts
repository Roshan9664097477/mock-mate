import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ResumeData {
  id: string;
  filename: string;
  rawText: string;
  skills: string[];
  experienceYears: number | null;
  sections: Record<string, string>;
  uploadedAt: Date;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: string;
}

export interface InterviewSession {
  id: string;
  resumeId: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  messages: ChatMessage[];
  answers: AnswerRecord[];
  mode: string;
  createdAt: Date;
  status: 'active' | 'completed';
}

export interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: string;
  skillFocus: string;
  expectedTopics: string[];
}

export interface AnswerRecord {
  questionIndex: number;
  question: InterviewQuestion;
  answer: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly KEYS = {
    RESUMES: 'mockmate_resumes',
    SESSIONS: 'mockmate_sessions',
    CURRENT_SESSION: 'mockmate_current_session'
  };

  // API key from environment
  private readonly apiKey = environment.groqApiKey;

  // Signals for reactive state
  apiKeyConfigured = signal<boolean>(true); // Always true since we use env
  currentResume = signal<ResumeData | null>(null);
  currentSession = signal<InterviewSession | null>(null);

  constructor() {
    this.loadCurrentSession();
  }

  // API Key Management - now uses environment
  getApiKey(): string {
    return this.apiKey;
  }

  // Resume Management
  saveResume(resume: ResumeData): void {
    const resumes = this.getAllResumes();
    resumes[resume.id] = resume;
    localStorage.setItem(this.KEYS.RESUMES, JSON.stringify(resumes));
    this.currentResume.set(resume);
  }

  getResume(id: string): ResumeData | null {
    const resumes = this.getAllResumes();
    return resumes[id] || null;
  }

  getAllResumes(): Record<string, ResumeData> {
    const data = localStorage.getItem(this.KEYS.RESUMES);
    return data ? JSON.parse(data) : {};
  }

  deleteResume(id: string): void {
    const resumes = this.getAllResumes();
    delete resumes[id];
    localStorage.setItem(this.KEYS.RESUMES, JSON.stringify(resumes));
    
    if (this.currentResume()?.id === id) {
      this.currentResume.set(null);
    }
  }

  // Session Management
  saveSession(session: InterviewSession): void {
    const sessions = this.getAllSessions();
    sessions[session.id] = session;
    localStorage.setItem(this.KEYS.SESSIONS, JSON.stringify(sessions));
    localStorage.setItem(this.KEYS.CURRENT_SESSION, session.id);
    this.currentSession.set(session);
  }

  getSession(id: string): InterviewSession | null {
    const sessions = this.getAllSessions();
    return sessions[id] || null;
  }

  getAllSessions(): Record<string, InterviewSession> {
    const data = localStorage.getItem(this.KEYS.SESSIONS);
    return data ? JSON.parse(data) : {};
  }

  deleteSession(id: string): void {
    const sessions = this.getAllSessions();
    delete sessions[id];
    localStorage.setItem(this.KEYS.SESSIONS, JSON.stringify(sessions));
    
    if (this.currentSession()?.id === id) {
      localStorage.removeItem(this.KEYS.CURRENT_SESSION);
      this.currentSession.set(null);
    }
  }

  private loadCurrentSession(): void {
    const sessionId = localStorage.getItem(this.KEYS.CURRENT_SESSION);
    if (sessionId) {
      const session = this.getSession(sessionId);
      if (session && session.status === 'active') {
        this.currentSession.set(session);
        const resume = this.getResume(session.resumeId);
        if (resume) {
          this.currentResume.set(resume);
        }
      }
    }
  }

  clearCurrentSession(keepResume: boolean = false): void {
    localStorage.removeItem(this.KEYS.CURRENT_SESSION);
    this.currentSession.set(null);
    if (!keepResume) {
      this.currentResume.set(null);
    }
  }

  // Clear only session, keep resume for new interview
  clearSessionKeepResume(): void {
    localStorage.removeItem(this.KEYS.CURRENT_SESSION);
    this.currentSession.set(null);
    // Resume data is preserved
  }

  // Utility
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  clearAll(): void {
    Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
    this.currentResume.set(null);
    this.currentSession.set(null);
  }
}
