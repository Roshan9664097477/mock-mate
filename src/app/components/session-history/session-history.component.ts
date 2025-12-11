import { Component, output, signal, computed, OnInit } from '@angular/core';
import { AuthService, InterviewHistoryRecord } from '../../services/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-session-history',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="history-wrapper">
      <div class="history-header">
        <div class="header-content">
          <button class="back-btn" (click)="goBack.emit()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back
          </button>
          <div class="title-section">
            <h1>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Interview History
            </h1>
            <p>Review your past mock interview sessions</p>
          </div>
        </div>
        
        @if (history().length > 0) {
          <div class="stats-bar">
            <div class="stat">
              <span class="stat-value">{{ history().length }}</span>
              <span class="stat-label">Total Sessions</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ getAverageScore() }}</span>
              <span class="stat-label">Avg Score</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ getTotalQuestions() }}</span>
              <span class="stat-label">Questions Practiced</span>
            </div>
          </div>
        }
      </div>

      @if (history().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h2>No Interview Sessions Yet</h2>
          <p>Complete your first mock interview to see your history here</p>
          <button class="btn btn-primary" (click)="goBack.emit()">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Start Your First Interview
          </button>
        </div>
      } @else {
        <!-- History List -->
        <div class="history-list">
          @for (record of paginatedHistory(); track record.id) {
            <div class="history-card" [class.expanded]="expandedId() === record.id">
              <!-- Card Header - Always visible -->
              <div class="card-header" (click)="toggleExpand(record.id)">
                <div class="card-main">
                  <div class="date-badge">
                    <span class="day">{{ record.date | date:'dd' }}</span>
                    <span class="month">{{ record.date | date:'MMM' }}</span>
                    <span class="year">{{ record.date | date:'yyyy' }}</span>
                  </div>
                  <div class="session-info">
                    <div class="session-title">
                      <span class="mode-badge" [class]="record.mode">{{ getModeLabel(record.mode) }}</span>
                      <span class="time">{{ record.date | date:'h:mm a' }}</span>
                    </div>
                    <div class="session-stats">
                      <span>{{ record.questionsAnswered }}/{{ record.totalQuestions }} questions</span>
                      @if (record.duration) {
                        <span>• {{ record.duration }} min</span>
                      }
                    </div>
                  </div>
                </div>
                <div class="card-score">
                  <div class="score-circle" [style.--score-color]="getScoreColor(record.overallScore)">
                    <span class="score-value">{{ record.overallScore }}</span>
                  </div>
                  <span class="grade" [style.color]="getGradeColor(record.grade)">{{ record.grade }}</span>
                </div>
                <button class="expand-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>

              <!-- Expanded Details -->
              @if (expandedId() === record.id) {
                <div class="card-details">
                  <!-- Summary -->
                  @if (record.summary) {
                    <div class="detail-section summary-section">
                      <p class="summary-text">{{ record.summary }}</p>
                      <div class="readiness" [class.ready]="record.readyForInterview" [class.not-ready]="!record.readyForInterview">
                        @if (record.readyForInterview) {
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          Ready for Interviews
                        } @else {
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                          </svg>
                          Needs More Practice
                        }
                      </div>
                    </div>
                  }

                  <!-- Q&A Details -->
                  @if (record.answersEvaluation.length) {
                    <div class="detail-section">
                      <h4>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M9 11l3 3L22 4"></path>
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                        Questions & Answers
                      </h4>
                      <div class="qa-list">
                        @for (qa of record.answersEvaluation; track qa.questionNumber) {
                          <div class="qa-item" [class.correct]="qa.isCorrect" [class.incorrect]="!qa.isCorrect">
                            <div class="qa-header">
                              <span class="q-num">Q{{ qa.questionNumber }}</span>
                              <span class="q-score" [style.color]="getScoreColor(qa.score * 10)">
                                {{ qa.score }}/10
                                @if (qa.isCorrect) { ✓ } @else { ✗ }
                              </span>
                            </div>
                            <p class="question">{{ qa.question }}</p>
                            <p class="answer">
                              <strong>Your Answer:</strong> {{ qa.answer }}
                            </p>
                            <p class="feedback">{{ qa.feedback }}</p>
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <!-- Category Performance -->
                  @if (getCategoryKeys(record).length > 0) {
                    <div class="detail-section">
                      <h4>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <circle cx="12" cy="12" r="6"></circle>
                          <circle cx="12" cy="12" r="2"></circle>
                        </svg>
                        Performance by Category
                      </h4>
                      <div class="categories">
                        @for (cat of getCategoryKeys(record); track cat) {
                          <div class="category-item">
                            <div class="cat-header">
                              <span>{{ cat }}</span>
                              <span [style.color]="getScoreColor(record.categoryPerformance[cat].score * 10)">
                                {{ record.categoryPerformance[cat].score }}/10
                              </span>
                            </div>
                            <div class="cat-bar">
                              <div 
                                class="cat-fill" 
                                [style.width.%]="record.categoryPerformance[cat].score * 10"
                                [style.background]="getScoreColor(record.categoryPerformance[cat].score * 10)"
                              ></div>
                            </div>
                            @if (record.categoryPerformance[cat].note) {
                              <p class="cat-note">{{ record.categoryPerformance[cat].note }}</p>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <!-- Strengths -->
                  @if (record.strengths.length) {
                    <div class="detail-section">
                      <h4>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        Strengths
                      </h4>
                      <div class="strengths-list">
                        @for (s of record.strengths; track $index) {
                          <div class="strength-item">
                            <span class="s-area">{{ s.area || s }}</span>
                            @if (s.score) {
                              <span class="s-score">{{ s.score }}/10</span>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <!-- Key Gaps -->
                  @if (record.keyGaps.length) {
                    <div class="detail-section">
                      <h4>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        Knowledge Gaps
                      </h4>
                      <ul class="gaps-list">
                        @for (gap of record.keyGaps; track $index) {
                          <li>{{ gap }}</li>
                        }
                      </ul>
                    </div>
                  }

                  <!-- Recommendations -->
                  @if (record.recommendations.length) {
                    <div class="detail-section">
                      <h4>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                        Recommendations
                      </h4>
                      <ul class="recommendations-list">
                        @for (rec of record.recommendations; track $index) {
                          <li>{{ rec }}</li>
                        }
                      </ul>
                    </div>
                  }

                  <!-- Delete Button -->
                  <div class="card-actions">
                    <button class="btn-delete" (click)="deleteRecord(record.id); $event.stopPropagation()">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      Delete Record
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Pagination Controls -->
        @if (totalPages() > 1) {
          <div class="pagination">
            <button 
              class="page-btn" 
              [disabled]="currentPage() === 1"
              (click)="goToPage(1)"
              title="First page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="11 17 6 12 11 7"></polyline>
                <polyline points="18 17 13 12 18 7"></polyline>
              </svg>
            </button>
            <button 
              class="page-btn" 
              [disabled]="currentPage() === 1"
              (click)="previousPage()"
              title="Previous page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div class="page-numbers">
              @for (page of getVisiblePages(); track page) {
                @if (page === '...') {
                  <span class="page-ellipsis">...</span>
                } @else {
                  <button 
                    class="page-num" 
                    [class.active]="currentPage() === page"
                    (click)="goToPage(+page)"
                  >
                    {{ page }}
                  </button>
                }
              }
            </div>

            <button 
              class="page-btn" 
              [disabled]="currentPage() === totalPages()"
              (click)="nextPage()"
              title="Next page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <button 
              class="page-btn" 
              [disabled]="currentPage() === totalPages()"
              (click)="goToPage(totalPages())"
              title="Last page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
            </button>

            <span class="page-info">
              Showing {{ startIndex() + 1 }}-{{ endIndex() }} of {{ history().length }}
            </span>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .history-wrapper {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .history-header {
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #a0a0b0;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    .back-btn:hover {
      background: rgba(93, 173, 226, 0.1);
      border-color: rgba(93, 173, 226, 0.3);
      color: #5DADE2;
    }

    .title-section {
      flex: 1;
    }

    .title-section h1 {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.75rem;
      font-weight: 700;
      color: #f4f4f8;
      margin: 0 0 0.5rem 0;
    }

    .title-section h1 svg {
      color: #5DADE2;
    }

    .title-section p {
      color: #6b6b7b;
      margin: 0;
    }

    .stats-bar {
      display: flex;
      gap: 1.5rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, rgba(93, 173, 226, 0.1), rgba(133, 193, 233, 0.05));
      border: 1px solid rgba(93, 173, 226, 0.2);
      border-radius: 16px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      padding: 0 1rem;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .stat:last-child {
      border-right: none;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #5DADE2;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #6b6b7b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px dashed rgba(255, 255, 255, 0.1);
      border-radius: 20px;
    }

    .empty-icon {
      color: #6b6b7b;
      margin-bottom: 1.5rem;
    }

    .empty-state h2 {
      font-size: 1.5rem;
      color: #f4f4f8;
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      color: #6b6b7b;
      margin: 0 0 1.5rem 0;
    }

    /* History List */
    .history-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .history-card {
      background: #12121a;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.2s;
    }

    .history-card:hover {
      border-color: rgba(93, 173, 226, 0.3);
    }

    .history-card.expanded {
      border-color: rgba(93, 173, 226, 0.4);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .card-header:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .card-main {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .date-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.75rem;
      background: rgba(93, 173, 226, 0.1);
      border-radius: 10px;
      min-width: 60px;
    }

    .date-badge .day {
      font-size: 1.25rem;
      font-weight: 700;
      color: #5DADE2;
      line-height: 1;
    }

    .date-badge .month {
      font-size: 0.7rem;
      color: #85C1E9;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .date-badge .year {
      font-size: 0.65rem;
      color: #6b6b7b;
    }

    .session-info {
      flex: 1;
    }

    .session-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.25rem;
    }

    .mode-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .mode-badge.all {
      background: rgba(139, 92, 246, 0.2);
      color: #a78bfa;
    }

    .mode-badge.technical {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }

    .mode-badge.behavioral {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
    }

    .mode-badge.situational {
      background: rgba(251, 146, 60, 0.2);
      color: #fb923c;
    }

    .time {
      font-size: 0.85rem;
      color: #6b6b7b;
    }

    .session-stats {
      font-size: 0.85rem;
      color: #a0a0b0;
    }

    .card-score {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .score-circle {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border: 3px solid var(--score-color, #5DADE2);
    }

    .score-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: #f4f4f8;
    }

    .grade {
      font-size: 0.8rem;
      font-weight: 600;
    }

    .expand-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #6b6b7b;
      cursor: pointer;
      transition: all 0.2s;
    }

    .expand-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #f4f4f8;
    }

    .expanded .expand-btn {
      transform: rotate(180deg);
    }

    /* Card Details */
    .card-details {
      padding: 0 1.25rem 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; max-height: 0; }
      to { opacity: 1; max-height: 2000px; }
    }

    .detail-section {
      padding: 1.25rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .detail-section:last-of-type {
      border-bottom: none;
    }

    .detail-section h4 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      color: #f4f4f8;
      margin: 0 0 1rem 0;
    }

    .detail-section h4 svg {
      color: #5DADE2;
    }

    /* Summary Section */
    .summary-section {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
      padding: 1.25rem !important;
      margin-top: 1rem;
    }

    .summary-text {
      color: #a0a0b0;
      line-height: 1.6;
      margin: 0 0 1rem 0;
    }

    .readiness {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .readiness.ready {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .readiness.not-ready {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    /* Q&A List */
    .qa-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .qa-item {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 10px;
      border-left: 3px solid #6b6b7b;
    }

    .qa-item.correct {
      border-left-color: #22c55e;
    }

    .qa-item.incorrect {
      border-left-color: #ef4444;
    }

    .qa-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .q-num {
      font-size: 0.8rem;
      font-weight: 600;
      color: #5DADE2;
      padding: 0.25rem 0.5rem;
      background: rgba(93, 173, 226, 0.1);
      border-radius: 4px;
    }

    .q-score {
      font-size: 0.85rem;
      font-weight: 600;
    }

    .qa-item .question {
      font-weight: 500;
      color: #f4f4f8;
      margin: 0 0 0.75rem 0;
    }

    .qa-item .answer {
      font-size: 0.9rem;
      color: #a0a0b0;
      margin: 0 0 0.75rem 0;
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
    }

    .qa-item .feedback {
      font-size: 0.85rem;
      color: #6b6b7b;
      font-style: italic;
      margin: 0;
    }

    /* Categories */
    .categories {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .category-item {
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 8px;
    }

    .cat-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .cat-header span:first-child {
      color: #f4f4f8;
      text-transform: capitalize;
    }

    .cat-bar {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
    }

    .cat-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .cat-note {
      font-size: 0.8rem;
      color: #6b6b7b;
      margin: 0.5rem 0 0 0;
    }

    /* Strengths */
    .strengths-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .strength-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.2);
      border-radius: 8px;
    }

    .s-area {
      font-size: 0.85rem;
      color: #22c55e;
    }

    .s-score {
      font-size: 0.75rem;
      color: #4ade80;
      opacity: 0.8;
    }

    /* Gaps List */
    .gaps-list, .recommendations-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .gaps-list li, .recommendations-list li {
      position: relative;
      padding: 0.5rem 0 0.5rem 1.5rem;
      color: #a0a0b0;
      font-size: 0.9rem;
    }

    .gaps-list li::before {
      content: '⚠';
      position: absolute;
      left: 0;
      color: #f59e0b;
    }

    .recommendations-list li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: #5DADE2;
    }

    /* Card Actions */
    .card-actions {
      padding-top: 1rem;
      display: flex;
      justify-content: flex-end;
    }

    .btn-delete {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      color: #ef4444;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    .btn-delete:hover {
      background: rgba(239, 68, 68, 0.1);
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      font-family: inherit;
    }

    .btn-primary {
      background: linear-gradient(135deg, #5DADE2, #85C1E9);
      color: #0a0a0f;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(93, 173, 226, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 30px rgba(93, 173, 226, 0.4);
    }

    /* Pagination */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 2rem;
      padding: 1.25rem;
      background: #12121a;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
    }

    .page-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #a0a0b0;
      cursor: pointer;
      transition: all 0.2s;
    }

    .page-btn:hover:not(:disabled) {
      background: rgba(93, 173, 226, 0.1);
      border-color: rgba(93, 173, 226, 0.3);
      color: #5DADE2;
    }

    .page-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .page-numbers {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin: 0 0.5rem;
    }

    .page-num {
      min-width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 8px;
      color: #a0a0b0;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    .page-num:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #f4f4f8;
    }

    .page-num.active {
      background: linear-gradient(135deg, #5DADE2, #85C1E9);
      color: #0a0a0f;
      font-weight: 600;
    }

    .page-ellipsis {
      color: #6b6b7b;
      padding: 0 0.5rem;
    }

    .page-info {
      margin-left: 1rem;
      padding-left: 1rem;
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 0.85rem;
      color: #6b6b7b;
    }

    @media (max-width: 640px) {
      .header-content {
        flex-direction: column;
      }

      .stats-bar {
        flex-direction: column;
        gap: 1rem;
      }

      .stat {
        border-right: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0.75rem 0;
      }

      .stat:last-child {
        border-bottom: none;
      }

      .card-header {
        flex-wrap: wrap;
      }

      .card-main {
        width: 100%;
      }

      .card-score {
        margin-left: auto;
      }

      .pagination {
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .page-info {
        width: 100%;
        text-align: center;
        margin-left: 0;
        padding-left: 0;
        border-left: none;
        padding-top: 0.75rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
    }
  `]
})
export class SessionHistoryComponent implements OnInit {
  goBack = output<void>();
  
  history = signal<InterviewHistoryRecord[]>([]);
  expandedId = signal<string | null>(null);
  currentPage = signal(1);
  readonly itemsPerPage = 5;

  // Computed values for pagination
  totalPages = computed(() => Math.ceil(this.history().length / this.itemsPerPage));
  
  startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage);
  
  endIndex = computed(() => Math.min(this.startIndex() + this.itemsPerPage, this.history().length));
  
  paginatedHistory = computed(() => {
    const start = this.startIndex();
    const end = this.endIndex();
    return this.history().slice(start, end);
  });

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    const records = this.authService.getUserHistory();
    this.history.set(records);
    // Reset to first page when data changes
    this.currentPage.set(1);
  }

  toggleExpand(id: string) {
    if (this.expandedId() === id) {
      this.expandedId.set(null);
    } else {
      this.expandedId.set(id);
    }
  }

  deleteRecord(id: string) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.authService.deleteHistoryRecord(id);
      this.loadHistory();
      // Adjust current page if needed
      if (this.currentPage() > this.totalPages() && this.totalPages() > 0) {
        this.currentPage.set(this.totalPages());
      }
    }
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.expandedId.set(null); // Collapse expanded cards when changing page
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  getVisiblePages(): (number | string)[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push('...');
      }

      // Show pages around current
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(total);
    }

    return pages;
  }

  getModeLabel(mode: string): string {
    const labels: Record<string, string> = {
      'all': 'Mixed',
      'technical': 'Technical',
      'behavioral': 'Behavioral',
      'situational': 'Situational'
    };
    return labels[mode] || mode;
  }

  getAverageScore(): number {
    const records = this.history();
    if (records.length === 0) return 0;
    const sum = records.reduce((acc, r) => acc + (r.overallScore || 0), 0);
    return Math.round(sum / records.length);
  }

  getTotalQuestions(): number {
    return this.history().reduce((acc, r) => acc + (r.questionsAnswered || 0), 0);
  }

  getCategoryKeys(record: InterviewHistoryRecord): string[] {
    return record.categoryPerformance ? Object.keys(record.categoryPerformance) : [];
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  }

  getGradeColor(grade: string): string {
    if (!grade) return '#6b6b7b';
    const g = grade.charAt(0);
    switch (g) {
      case 'A': return '#22c55e';
      case 'B': return '#3b82f6';
      case 'C': return '#f59e0b';
      default: return '#ef4444';
    }
  }
}

