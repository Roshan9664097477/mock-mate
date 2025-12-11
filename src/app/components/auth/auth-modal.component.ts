import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

type AuthMode = 'login' | 'signup';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="auth-card">
        <!-- Close button -->
        <button class="close-btn" (click)="close.emit()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Logo & Header -->
        <div class="auth-header">
          <div class="logo">
            <img src="mockMateLogo.png" alt="MockMate" />
          </div>
          <h2>Welcome to MockMate</h2>
          <p class="tagline">AI Coaching for Real Interviews</p>
        </div>

        <!-- Auth Tabs -->
        <div class="auth-tabs">
          <button 
            class="tab" 
            [class.active]="mode() === 'login'"
            (click)="mode.set('login')"
          >
            Login
          </button>
          <button 
            class="tab" 
            [class.active]="mode() === 'signup'"
            (click)="mode.set('signup')"
          >
            Sign Up
          </button>
        </div>

        <!-- Login Form -->
        @if (mode() === 'login') {
          <form class="auth-form" (ngSubmit)="handleLogin()">
            <div class="form-group">
              <label for="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                [(ngModel)]="loginEmail"
                name="email"
                placeholder="you@example.com"
                autocomplete="email"
                required
              />
            </div>

            <div class="form-group">
              <label for="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                [(ngModel)]="loginPassword"
                name="password"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
            </div>

            @if (error()) {
              <div class="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {{ error() }}
              </div>
            }

            <button type="submit" class="btn btn-primary" [disabled]="isLoading()">
              @if (isLoading()) {
                <span class="spinner"></span>
                Logging in...
              } @else {
                Login
              }
            </button>

            <p class="switch-text">
              Don't have an account? 
              <button type="button" class="link-btn" (click)="mode.set('signup')">Sign up</button>
            </p>
          </form>
        }

        <!-- Signup Form -->
        @if (mode() === 'signup') {
          <form class="auth-form" (ngSubmit)="handleSignup()">
            <div class="form-group">
              <label for="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                [(ngModel)]="signupName"
                name="name"
                placeholder="John Doe"
                autocomplete="name"
                required
              />
            </div>

            <div class="form-group">
              <label for="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                [(ngModel)]="signupEmail"
                name="email"
                placeholder="you@example.com"
                autocomplete="email"
                required
              />
            </div>

            <div class="form-group">
              <label for="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                [(ngModel)]="signupPassword"
                name="password"
                placeholder="At least 6 characters"
                autocomplete="new-password"
                required
              />
            </div>

            @if (error()) {
              <div class="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {{ error() }}
              </div>
            }

            <button type="submit" class="btn btn-primary" [disabled]="isLoading()">
              @if (isLoading()) {
                <span class="spinner"></span>
                Creating account...
              } @else {
                Create Account
              }
            </button>

            <p class="switch-text">
              Already have an account? 
              <button type="button" class="link-btn" (click)="mode.set('login')">Login</button>
            </p>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
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

    .auth-card {
      position: relative;
      width: 100%;
      max-width: 400px;
      background: #12121a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
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
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: #6b6b7b;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #f4f4f8;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .logo {
      width: 70px;
      height: 70px;
      margin: 0 auto 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      overflow: hidden;
    }

    .logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .auth-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
      color: #f4f4f8;
    }

    .tagline {
      color: #6b6b7b;
      font-size: 0.9rem;
      margin: 0;
    }

    .auth-tabs {
      display: flex;
      background: #0a0a0f;
      border-radius: 10px;
      padding: 4px;
      margin-bottom: 1.5rem;
    }

    .tab {
      flex: 1;
      padding: 0.625rem;
      background: transparent;
      border: none;
      color: #6b6b7b;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s;
      font-family: inherit;
    }

    .tab.active {
      background: linear-gradient(135deg, #5DADE2, #85C1E9);
      color: #0a0a0f;
      font-weight: 600;
    }

    .tab:not(.active):hover {
      color: #f4f4f8;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-size: 0.85rem;
      font-weight: 500;
      color: #a0a0b0;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: #0a0a0f;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #f4f4f8;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s;
      font-family: inherit;
    }

    .form-group input:focus {
      border-color: #5DADE2;
      box-shadow: 0 0 0 3px rgba(93, 173, 226, 0.2);
    }

    .form-group input::placeholder {
      color: #6b6b7b;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 10px;
      color: #ef4444;
      font-size: 0.85rem;
    }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      font-family: inherit;
      margin-top: 0.5rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #5DADE2, #85C1E9);
      color: #0a0a0f;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(93, 173, 226, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 30px rgba(93, 173, 226, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .switch-text {
      text-align: center;
      color: #6b6b7b;
      font-size: 0.85rem;
      margin: 0.5rem 0 0 0;
    }

    .link-btn {
      background: none;
      border: none;
      color: #5DADE2;
      font-size: 0.85rem;
      cursor: pointer;
      padding: 0;
      font-family: inherit;
    }

    .link-btn:hover {
      color: #85C1E9;
      text-decoration: underline;
    }
  `]
})
export class AuthModalComponent {
  close = output<void>();
  authenticated = output<void>();

  mode = signal<AuthMode>('login');
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Login form
  loginEmail = '';
  loginPassword = '';

  // Signup form
  signupName = '';
  signupEmail = '';
  signupPassword = '';

  constructor(private authService: AuthService) {}

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }

  async handleLogin() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const result = await this.authService.login(this.loginEmail, this.loginPassword);
      
      if (result.success) {
        this.authenticated.emit();
        this.close.emit();
      } else {
        this.error.set(result.error || 'Login failed');
      }
    } catch (err: any) {
      this.error.set(err.message || 'An error occurred');
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleSignup() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const result = await this.authService.signup(
        this.signupEmail,
        this.signupName,
        this.signupPassword
      );
      
      if (result.success) {
        this.authenticated.emit();
        this.close.emit();
      } else {
        this.error.set(result.error || 'Signup failed');
      }
    } catch (err: any) {
      this.error.set(err.message || 'An error occurred');
    } finally {
      this.isLoading.set(false);
    }
  }
}

