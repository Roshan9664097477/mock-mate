import { Component, output, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InterviewService } from '../../services/interview.service';
import { ChatMessage } from '../../services/storage.service';

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="chat-wrapper">
      <!-- Steps Progress -->
      <div class="steps-tracker">
        <div class="step completed">
          <div class="step-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <span class="step-label">🎯 Questions Generated</span>
        </div>
        <div class="step-line"></div>
        <div class="step active">
          <div class="step-icon">2</div>
          <span class="step-label">💬 Interactive Practice</span>
        </div>
        <div class="step-line"></div>
        <div class="step" [class.active]="hasAnsweredQuestions()">
          <div class="step-icon">3</div>
          <span class="step-label">📊 Instant Feedback</span>
        </div>
      </div>

      <div class="chat-interface">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Mock Interview Session</span>
          </div>

          @if (interviewService.progress(); as progress) {
            <div class="session-progress">
              <div class="progress-text">
                Question {{ progress.current }} of {{ progress.total }}
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="progress.percentage"></div>
              </div>
            </div>
          }

          <button class="btn btn-secondary end-btn" (click)="onEndSession()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <rect x="9" y="9" width="6" height="6"></rect>
            </svg>
            End Session
          </button>
        </div>

      <!-- Messages -->
      <div class="chat-messages" #messagesContainer>
        @for (message of messages(); track $index) {
          <div class="message" [class]="message.role" [style.animation-delay.ms]="$index * 50">
            <div class="message-avatar">
              @if (message.role === 'assistant') {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                  <circle cx="12" cy="5" r="2"></circle>
                  <path d="M12 7v4"></path>
                  <line x1="8" y1="16" x2="8" y2="16"></line>
                  <line x1="16" y1="16" x2="16" y2="16"></line>
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              }
            </div>
            <div class="message-content" [innerHTML]="formatMessage(message.content)"></div>
          </div>
        }

        @if (interviewService.isLoading()) {
          <div class="message assistant">
            <div class="message-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                <circle cx="12" cy="5" r="2"></circle>
                <path d="M12 7v4"></path>
              </svg>
            </div>
            <div class="message-content typing">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        }

        <div #messagesEnd></div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button 
          class="quick-action" 
          (click)="sendQuickAction('next')"
          [disabled]="interviewService.isLoading()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          Next Question
        </button>
        <button 
          class="quick-action" 
          (click)="sendQuickAction('feedback')"
          [disabled]="interviewService.isLoading()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          Get Feedback
        </button>
        <button 
          class="quick-action" 
          (click)="sendQuickAction('tips')"
          [disabled]="interviewService.isLoading()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="9" y1="18" x2="15" y2="18"></line>
            <line x1="10" y1="22" x2="14" y2="22"></line>
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
          </svg>
          Get Tips
        </button>
      </div>

      <!-- Input -->
      <form class="chat-input-form" (ngSubmit)="sendMessage()">
        <input
          type="text"
          [(ngModel)]="inputValue"
          name="message"
          placeholder="Type your answer or ask a question..."
          [disabled]="interviewService.isLoading()"
          autocomplete="off"
        />
        <button 
          type="submit" 
          class="btn btn-primary send-btn"
          [disabled]="!inputValue.trim() || interviewService.isLoading()"
        >
          @if (interviewService.isLoading()) {
            <span class="spinner"></span>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          }
        </button>
      </form>
      </div>
    </div>
  `,
  styleUrl: './chat-interface.component.css'
})
export class ChatInterfaceComponent implements AfterViewChecked {
  endSession = output<void>();

  @ViewChild('messagesEnd') messagesEnd!: ElementRef;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  inputValue = '';
  messages = signal<ChatMessage[]>([]);

  constructor(public interviewService: InterviewService) {
    this.loadMessages();
  }

  hasAnsweredQuestions(): boolean {
    const session = this.interviewService.session();
    if (!session) return false;
    // Check if any question has been answered
    return session.answers && session.answers.length > 0;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private loadMessages() {
    const session = this.interviewService.session();
    if (session) {
      this.messages.set([...session.messages]);
    }
  }

  private scrollToBottom() {
    try {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {}
  }

  async sendMessage() {
    if (!this.inputValue.trim() || this.interviewService.isLoading()) return;

    const content = this.inputValue.trim();
    this.inputValue = '';

    // Add user message immediately
    const userMsg: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    this.messages.update(msgs => [...msgs, userMsg]);

    try {
      const response = await this.interviewService.sendMessage(content);
      this.messages.update(msgs => [...msgs, response]);
    } catch (err: any) {
      this.messages.update(msgs => [...msgs, {
        role: 'assistant',
        content: `❌ Error: ${err.message}`,
        timestamp: new Date()
      }]);
    }
  }

  async sendQuickAction(action: string) {
    let message = '';
    switch (action) {
      case 'next':
        message = 'Next question please';
        break;
      case 'feedback':
        message = 'Can you give me detailed feedback on my answer?';
        break;
      case 'tips':
        message = 'What tips do you have for improving my answer?';
        break;
    }

    this.inputValue = message;
    await this.sendMessage();
  }

  onEndSession() {
    this.interviewService.endSession();
    this.endSession.emit();
  }

  formatMessage(content: string): string {
    // Convert markdown-like syntax to HTML
    let html = content
      // Escape HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^## (.*$)/gm, '<h3>$1</h3>')
      .replace(/^\*\*(.*?)\*\*/gm, '<strong>$1</strong>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Lists
      .replace(/^- (.*)<br>/gm, '<li>$1</li>')
      // Horizontal rule
      .replace(/---/g, '<hr>');

    return html;
  }
}

