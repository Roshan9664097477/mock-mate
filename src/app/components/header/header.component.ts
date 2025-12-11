import { Component, output, signal } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="header">
      <div class="header-content">
        <div class="brand">
          <div class="brand-logo">
            <img src="mockMateLogo.png" alt="MockMate Logo" />
          </div>
          <div class="brand-text">
            <h1>MockMate</h1>
            <span class="tagline">AI Coaching for Real Interviews</span>
          </div>
        </div>

        <div class="header-actions">
          <button class="nav-link" (click)="showAbout.set(true)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            <span>About Us</span>
          </button>

          @if (authService.currentUser(); as user) {
            <!-- History Button - Only for logged in users -->
            <button class="nav-link history-link" (click)="historyClick.emit()">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>History</span>
            </button>

            <!-- Logged in: Show user info -->
            <div class="user-menu">
              <div class="user-info">
                <div class="user-avatar">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
                <div class="user-details">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-stats">{{ user.interviewCount }} interviews</span>
                </div>
              </div>
              <button class="btn-logout" (click)="handleLogout()" title="Logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          } @else {
            <!-- Not logged in: Show login button -->
            <button class="btn-login" (click)="loginClick.emit()">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Login
            </button>
          }
        </div>
      </div>
    </header>

    <!-- About Modal -->
    @if (showAbout()) {
      <div class="modal-overlay" (click)="showAbout.set(false)">
        <div class="about-modal" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="showAbout.set(false)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div class="about-header">
            <div class="about-logo">
              <img src="mockMateLogo.png" alt="MockMate Logo" />
            </div>
            <h2>About MockMate</h2>
            <p class="about-tagline">AI Coaching for Real Interviews</p>
          </div>

          <div class="about-content">
            <section class="about-section">
              <h3>🎯 What is MockMate?</h3>
              <p>
                MockMate is an intelligent interview preparation platform that uses cutting-edge AI technology 
                to help job seekers practice and improve their interview skills. Simply upload your resume, 
                and our AI will generate personalized interview questions tailored to your experience, skills, 
                and career goals.
              </p>
            </section>

            <section class="about-section">
              <h3>🤖 Powered by Advanced AI</h3>
              <p>
                MockMate leverages the <strong>Llama 3.3 70B</strong> large language model through the Groq API, 
                one of the most advanced AI systems available. This enables us to:
              </p>
              <ul>
                <li>Analyze your resume and understand your unique background</li>
                <li>Generate relevant, industry-specific interview questions</li>
                <li>Evaluate your answers with detailed feedback</li>
                <li>Provide actionable tips to improve your responses</li>
              </ul>
            </section>

            <section class="about-section">
              <h3>✨ Key Features</h3>
              <div class="features-list">
                <div class="feature">
                  <span class="feature-icon">📄</span>
                  <div>
                    <strong>Smart Resume Analysis</strong>
                    <p>Upload PDF, DOCX, or TXT resumes for intelligent parsing</p>
                  </div>
                </div>
                <div class="feature">
                  <span class="feature-icon">💬</span>
                  <div>
                    <strong>Interactive Practice</strong>
                    <p>Real-time chat with AI interviewer, ask follow-up questions</p>
                  </div>
                </div>
                <div class="feature">
                  <span class="feature-icon">📊</span>
                  <div>
                    <strong>Instant Feedback</strong>
                    <p>Get scores, detailed evaluations, and improvement suggestions</p>
                  </div>
                </div>
                <div class="feature">
                  <span class="feature-icon">🔒</span>
                  <div>
                    <strong>Privacy First</strong>
                    <p>Your data stays in your browser, nothing stored on servers</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="about-section">
              <h3>🚀 About This Project</h3>
              <p>
                MockMate was built with modern web technologies including <strong>Angular 18</strong> 
                for a responsive, fast user interface. The project demonstrates the power of AI 
                in education and career development, making interview preparation accessible to everyone.
              </p>
              <p class="tech-stack">
                <span>Angular</span>
                <span>TypeScript</span>
                <span>Groq AI</span>
                <span>Llama 3.3</span>
              </p>
            </section>
          </div>

          <div class="about-footer">
            <p>Built with ❤️ to help you land your dream job</p>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .header {
      background: rgba(10, 10, 15, 0.9);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }

    .brand-logo {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      overflow: hidden;
    }

    .brand-logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .brand-text h1 {
      font-size: 1.375rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #f4f4f8, #85C1E9);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
    }

    .tagline {
      font-size: 0.75rem;
      color: #6b6b7b;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #a0a0b0;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    .nav-link:hover {
      background: rgba(93, 173, 226, 0.1);
      border-color: rgba(93, 173, 226, 0.3);
      color: #85C1E9;
    }

    .history-link {
      background: rgba(139, 92, 246, 0.1);
      border-color: rgba(139, 92, 246, 0.3);
      color: #a78bfa;
    }

    .history-link:hover {
      background: rgba(139, 92, 246, 0.2);
      border-color: rgba(139, 92, 246, 0.5);
      color: #c4b5fd;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-login {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: linear-gradient(135deg, #5DADE2, #85C1E9);
      color: #0a0a0f;
      font-weight: 600;
      border: none;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(93, 173, 226, 0.2);
    }

    .btn-login:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 30px rgba(93, 173, 226, 0.3);
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-left: 1rem;
      border-left: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #5DADE2, #85C1E9);
      border-radius: 50%;
      color: #0a0a0f;
      font-weight: 700;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.9rem;
      font-weight: 500;
      color: #f4f4f8;
    }

    .user-stats {
      font-size: 0.75rem;
      color: #6b6b7b;
    }

    .btn-logout {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #a0a0b0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-logout:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .about-modal {
      background: linear-gradient(135deg, #12121a, #1a1a25);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      max-width: 700px;
      width: 100%;
      max-height: 85vh;
      overflow-y: auto;
      position: relative;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }

    .close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #a0a0b0;
      cursor: pointer;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    .about-header {
      text-align: center;
      padding: 2.5rem 2rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .about-logo {
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      border-radius: 20px;
      overflow: hidden;
    }

    .about-logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .about-header h2 {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
      background: linear-gradient(135deg, #f4f4f8, #85C1E9);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .about-tagline {
      color: #6b6b7b;
      font-size: 1rem;
      margin: 0;
    }

    .about-content {
      padding: 2rem;
    }

    .about-section {
      margin-bottom: 2rem;
    }

    .about-section:last-child {
      margin-bottom: 0;
    }

    .about-section h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #f4f4f8;
      margin: 0 0 1rem;
    }

    .about-section p {
      color: #a0a0b0;
      line-height: 1.7;
      margin: 0 0 0.75rem;
    }

    .about-section ul {
      list-style: none;
      padding: 0;
      margin: 0.75rem 0 0;
    }

    .about-section ul li {
      color: #a0a0b0;
      padding: 0.5rem 0 0.5rem 1.5rem;
      position: relative;
    }

    .about-section ul li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: #5DADE2;
    }

    .features-list {
      display: grid;
      gap: 1rem;
    }

    .feature {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .feature-icon {
      font-size: 1.5rem;
    }

    .feature strong {
      color: #f4f4f8;
      display: block;
      margin-bottom: 0.25rem;
    }

    .feature p {
      font-size: 0.85rem;
      color: #6b6b7b;
      margin: 0;
    }

    .tech-stack {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem !important;
    }

    .tech-stack span {
      padding: 0.375rem 0.75rem;
      background: rgba(93, 173, 226, 0.1);
      border: 1px solid rgba(93, 173, 226, 0.3);
      border-radius: 20px;
      font-size: 0.8rem;
      color: #5DADE2;
    }

    .about-footer {
      text-align: center;
      padding: 1.5rem 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .about-footer p {
      color: #6b6b7b;
      font-size: 0.9rem;
      margin: 0;
    }

    @media (max-width: 640px) {
      .nav-link span {
        display: none;
      }

      .user-details {
        display: none;
      }

      .about-modal {
        max-height: 90vh;
        border-radius: 16px;
      }

      .about-header {
        padding: 2rem 1.5rem 1rem;
      }

      .about-content {
        padding: 1.5rem;
      }

      .feature {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
      }
    }
  `]
})
export class HeaderComponent {
  loginClick = output<void>();
  logoutClick = output<void>();
  historyClick = output<void>();
  
  showAbout = signal(false);

  constructor(
    public storage: StorageService,
    public authService: AuthService
  ) {}

  handleLogout() {
    this.authService.logout();
    this.logoutClick.emit();
  }
}
