import { Component, signal, OnInit } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { AuthModalComponent } from './components/auth/auth-modal.component';
import { ResumeUploadComponent } from './components/resume-upload/resume-upload.component';
import { ChatInterfaceComponent } from './components/chat-interface/chat-interface.component';
import { SessionSummaryComponent } from './components/session-summary/session-summary.component';
import { SessionHistoryComponent } from './components/session-history/session-history.component';
import { StorageService } from './services/storage.service';
import { InterviewService } from './services/interview.service';
import { AuthService } from './services/auth.service';

type ViewState = 'upload' | 'chat' | 'summary' | 'history';

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    AuthModalComponent,
    ResumeUploadComponent,
    ChatInterfaceComponent,
    SessionSummaryComponent,
    SessionHistoryComponent
  ],
  template: `
    <!-- AI Animated Background -->
    <div class="ai-background"></div>
    <div class="ai-hex-grid"></div>
    <div class="ai-aurora"></div>
    
    <!-- Particles & Connections -->
    <div class="ai-particles">
      <div class="ai-particle"></div>
      <div class="ai-particle"></div>
      <div class="ai-particle"></div>
      <div class="ai-particle"></div>
      <div class="ai-particle"></div>
      <div class="ai-particle"></div>
      <div class="ai-particle"></div>
      <div class="ai-particle"></div>
    </div>
    <div class="ai-connections">
      <svg>
        <line x1="10%" y1="20%" x2="35%" y2="30%"></line>
        <line x1="35%" y1="30%" x2="50%" y2="70%"></line>
        <line x1="50%" y1="70%" x2="75%" y2="55%"></line>
        <line x1="75%" y1="55%" x2="90%" y2="40%"></line>
        <line x1="20%" y1="60%" x2="65%" y2="25%"></line>
        <line x1="65%" y1="25%" x2="85%" y2="80%"></line>
      </svg>
    </div>

    <!-- Glowing Corners & Pulse -->
    <div class="ai-glow-corner top-left"></div>
    <div class="ai-glow-corner bottom-right"></div>
    <div class="ai-glow-corner center"></div>
    <div class="ai-brain-pulse"></div>

    <!-- Floating Geometric Shapes -->
    <div class="ai-shapes">
      <div class="ai-shape circle"></div>
      <div class="ai-shape square"></div>
      <div class="ai-shape triangle"></div>
      <div class="ai-shape circle"></div>
      <div class="ai-shape square"></div>
      <div class="ai-shape triangle"></div>
    </div>

    <!-- Matrix Rain Effect -->
    <div class="ai-matrix-rain">
      <div class="ai-matrix-column">01001AI</div>
      <div class="ai-matrix-column">NEURAL</div>
      <div class="ai-matrix-column">10110ML</div>
      <div class="ai-matrix-column">MOCKMATE</div>
      <div class="ai-matrix-column">01AI01</div>
      <div class="ai-matrix-column">LEARN</div>
      <div class="ai-matrix-column">GPT•LLM</div>
      <div class="ai-matrix-column">INTERVIEW</div>
      <div class="ai-matrix-column">AI•BOT</div>
      <div class="ai-matrix-column">SUCCESS</div>
    </div>

    <!-- Floating Code Snippets -->
    <div class="ai-code-float">const ai = new MockMate();</div>
    <div class="ai-code-float">model.generate(questions)</div>
    <div class="ai-code-float">await interview.start()</div>
    <div class="ai-code-float">feedback.analyze(answer)</div>
    <div class="ai-code-float">score = evaluate(response)</div>

    <!-- AI Typing Indicator -->
    <div class="ai-typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>

    <!-- Data Stream -->
    <div class="ai-data-stream"></div>

    <!-- NEW CREATIVE ELEMENTS -->

    <!-- Morphing Blobs -->
    <div class="ai-blob ai-blob-1"></div>
    <div class="ai-blob ai-blob-2"></div>
    <div class="ai-blob ai-blob-3"></div>

    <!-- Orbiting Rings -->
    <div class="ai-orbit-container">
      <div class="ai-orbit-ring"><div class="ai-orbit-dot"></div></div>
      <div class="ai-orbit-ring"><div class="ai-orbit-dot"></div></div>
      <div class="ai-orbit-ring"><div class="ai-orbit-dot"></div></div>
    </div>

    <!-- Neon Light Trails -->
    <div class="ai-neon-trail"></div>
    <div class="ai-neon-trail"></div>
    <div class="ai-neon-trail"></div>

    <!-- Sound Wave Visualizer -->
    <div class="ai-sound-wave">
      <div class="ai-sound-bar"></div>
      <div class="ai-sound-bar"></div>
      <div class="ai-sound-bar"></div>
      <div class="ai-sound-bar"></div>
      <div class="ai-sound-bar"></div>
      <div class="ai-sound-bar"></div>
      <div class="ai-sound-bar"></div>
      <div class="ai-sound-bar"></div>
      <div class="ai-sound-bar"></div>
      <div class="ai-sound-bar"></div>
      <div class="ai-sound-bar"></div>
    </div>

    <!-- 3D Perspective Grid -->
    <div class="ai-perspective-grid"></div>

    <!-- Holographic Shimmer -->
    <div class="ai-holographic"></div>

    <!-- DNA Helix -->
    <div class="ai-dna-helix">
      <div class="ai-dna-strand">
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
      </div>
      <div class="ai-dna-strand">
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
        <div class="ai-dna-dot"></div>
      </div>
    </div>

    <!-- Floating Glass Cards -->
    <div class="ai-glass-card"></div>
    <div class="ai-glass-card"></div>
    <div class="ai-glass-card"></div>

    <!-- Cyber Circle -->
    <div class="ai-cyber-circle"></div>

    <!-- Sparkle Stars -->
    <div class="ai-sparkle"></div>
    <div class="ai-sparkle"></div>
    <div class="ai-sparkle"></div>
    <div class="ai-sparkle"></div>
    <div class="ai-sparkle"></div>
    <div class="ai-sparkle"></div>

    <div class="app">
      <app-header 
        (loginClick)="showAuthModal.set(true)" 
        (logoutClick)="onLogout()"
        (historyClick)="onHistoryClick()"
      />
      
      <main class="app-main">
        @switch (currentView()) {
          @case ('upload') {
            <app-resume-upload 
              (sessionStarted)="onSessionStarted()"
              (loginRequired)="showAuthModal.set(true)"
            />
          }
          @case ('chat') {
            <app-chat-interface (endSession)="onEndSession()" />
          }
          @case ('summary') {
            <app-session-summary (newSession)="onNewSession()" />
          }
          @case ('history') {
            <app-session-history (goBack)="onHistoryBack()" />
          }
        }
      </main>

      <!-- Auth Modal -->
      @if (showAuthModal()) {
        <app-auth-modal 
          (close)="showAuthModal.set(false)"
          (authenticated)="onAuthenticated()"
        />
      }

      <!-- Toast Notification -->
      @if (toast()) {
        <div class="toast-container" [class]="'toast-' + toast()!.type">
          <div class="toast">
            <div class="toast-icon">
              @if (toast()!.type === 'success') {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              }
              @if (toast()!.type === 'error') {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              }
              @if (toast()!.type === 'info') {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              }
            </div>
            <span class="toast-message">{{ toast()!.message }}</span>
            <button class="toast-close" (click)="toast.set(null)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-main {
      flex: 1;
      padding: 2rem 1.5rem;
      max-width: 1000px;
      margin: 0 auto;
      width: 100%;
    }

    /* Toast Notification Styles */
    .toast-container {
      position: fixed;
      top: 5rem;
      right: 1.5rem;
      z-index: 1100;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: #1a1a25;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
      min-width: 280px;
      max-width: 400px;
    }

    .toast-success .toast {
      border-color: rgba(34, 197, 94, 0.4);
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), #1a1a25);
    }

    .toast-success .toast-icon {
      color: #22c55e;
    }

    .toast-error .toast {
      border-color: rgba(239, 68, 68, 0.4);
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), #1a1a25);
    }

    .toast-error .toast-icon {
      color: #ef4444;
    }

    .toast-info .toast {
      border-color: rgba(93, 173, 226, 0.4);
      background: linear-gradient(135deg, rgba(93, 173, 226, 0.1), #1a1a25);
    }

    .toast-info .toast-icon {
      color: #5DADE2;
    }

    .toast-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast-message {
      flex: 1;
      font-size: 0.9rem;
      color: #f4f4f8;
      font-weight: 500;
    }

    .toast-close {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: #6b6b7b;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .toast-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #f4f4f8;
    }

    @media (max-width: 480px) {
      .toast-container {
        left: 1rem;
        right: 1rem;
      }

      .toast {
        min-width: auto;
        max-width: none;
      }
    }
  `]
})
export class App implements OnInit {
  currentView = signal<ViewState>('upload');
  showAuthModal = signal(false);
  toast = signal<ToastMessage | null>(null);
  private toastTimeout: any;

  constructor(
    public storage: StorageService,
    public authService: AuthService,
    private interviewService: InterviewService
  ) {}

  ngOnInit() {
    // Check for existing active session
    if (this.authService.isAuthenticated()) {
      const session = this.storage.currentSession();
      if (session && session.status === 'active') {
        this.currentView.set('chat');
      }
    }
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 4000) {
    // Clear any existing timeout
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    
    this.toast.set({ message, type });
    
    // Auto-hide after duration
    this.toastTimeout = setTimeout(() => {
      this.toast.set(null);
    }, duration);
  }

  onAuthenticated() {
    this.showAuthModal.set(false);
    
    // Show welcome message with user's name
    const user = this.authService.currentUser();
    const welcomeMessage = user 
      ? `Welcome back, ${user.name}! 👋` 
      : 'Successfully logged in!';
    
    this.showToast(welcomeMessage, 'success');
  }

  onLogout() {
    this.interviewService.clearSession();
    this.currentView.set('upload');
    this.showToast('You have been logged out', 'info');
  }

  onSessionStarted() {
    // Check if user is logged in before starting
    if (!this.authService.isAuthenticated()) {
      this.showAuthModal.set(true);
      return;
    }
    this.currentView.set('chat');
    this.showToast('Interview session started! Good luck! 🎯', 'success');
  }

  onEndSession() {
    // Navigate to summary - history will be saved there after evaluation
    this.currentView.set('summary');
    this.showToast('Session ended. Generating your performance report...', 'info');
  }

  onNewSession() {
    // Keep resume data for quick restart
    this.interviewService.clearSessionKeepResume();
    this.currentView.set('upload');
    this.showToast('Ready for a new interview! Your resume is saved.', 'info');
  }

  onHistoryClick() {
    if (!this.authService.isAuthenticated()) {
      this.showAuthModal.set(true);
      return;
    }
    this.previousView = this.currentView();
    this.currentView.set('history');
  }

  onHistoryBack() {
    this.currentView.set(this.previousView || 'upload');
  }

  private previousView: ViewState = 'upload';
}
