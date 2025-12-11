import { Component, output, signal, OnInit } from '@angular/core';
import { InterviewService } from '../../services/interview.service';
import { AuthService, InterviewHistoryRecord } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-session-summary',
  standalone: true,
  template: `
    <div class="summary-wrapper">
      <!-- Steps Progress - All Complete -->
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
        <div class="step-line completed"></div>
        <div class="step completed">
          <div class="step-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <span class="step-label">💬 Practice Complete</span>
        </div>
        <div class="step-line completed"></div>
        <div class="step active">
          <div class="step-icon">3</div>
          <span class="step-label">📊 Instant Feedback</span>
        </div>
      </div>

    <div class="session-summary">
      @if (isLoading()) {
        <div class="loading-state">
          <div class="spinner large"></div>
          <p>Analyzing your interview performance...</p>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <h3>Failed to Load Summary</h3>
          <p>{{ error() }}</p>
          <button class="btn btn-primary" (click)="newSession.emit()">
            Start New Session
          </button>
        </div>
      } @else if (evaluation()) {
        <!-- No Answers State -->
        @if (evaluation()!.questions_answered === 0) {
          <div class="no-answers-state">
            <div class="header-icon warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h2>No Answers Recorded</h2>
            <p>{{ evaluation()!.summary }}</p>
            
            <div class="no-answers-info">
              <h4>What happened?</h4>
              <ul>
                <li>You ended the session without answering any questions</li>
                <li>Questions skipped: {{ evaluation()!.total_questions }}</li>
              </ul>
              
              <h4>Next Steps</h4>
              <ul>
                @for (rec of evaluation()!.recommendations; track $index) {
                  <li>{{ rec }}</li>
                }
              </ul>
            </div>

            <button class="btn btn-primary" (click)="newSession.emit()">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              Start New Interview
            </button>
          </div>
        } @else {
          <!-- Header -->
          <div class="summary-header">
            <div class="header-icon" [class.success]="evaluation()!.overall_score >= 60" [class.warning]="evaluation()!.overall_score < 60">
              @if (evaluation()!.overall_score >= 60) {
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              }
            </div>
            <h2>Interview Complete!</h2>
            <p>You answered {{ evaluation()!.questions_answered }} of {{ evaluation()!.total_questions }} questions</p>
          </div>

          <!-- Score Card -->
          <div class="score-card">
            <div class="main-score">
              <div class="score-circle" [style.--score-color]="getScoreColor(evaluation()!.overall_score)">
                <span class="score-value">{{ evaluation()!.overall_score || 0 }}</span>
                <span class="score-max">/100</span>
              </div>
              <div class="grade-badge" [style.color]="getGradeColor(evaluation()!.grade)">
                Grade: {{ evaluation()!.grade || 'N/A' }}
              </div>
            </div>

            <div class="score-details">
              <p class="summary-text">{{ evaluation()!.summary }}</p>
              
              <div class="completion-rate">
                <span>Completion: {{ evaluation()!.completion_rate || 0 }}%</span>
                <div class="completion-bar">
                  <div class="completion-fill" [style.width.%]="evaluation()!.completion_rate || 0"></div>
                </div>
              </div>
              
              <div class="readiness-indicator">
                @if (evaluation()!.ready_for_interview) {
                  <div class="ready positive">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>You're ready for interviews!</span>
                  </div>
                } @else {
                  <div class="ready negative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <span>Keep practicing to improve</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Individual Answer Scores -->
          @if (evaluation()!.answers_evaluation?.length) {
            <div class="section answers-section">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                Your Answers
              </h3>
              <div class="answers-grid">
                @for (ans of evaluation()!.answers_evaluation; track ans.question_number) {
                  <div class="answer-card" [class.correct]="ans.is_correct" [class.incorrect]="!ans.is_correct">
                    <div class="answer-header">
                      <span class="q-number">Q{{ ans.question_number }}</span>
                      <span class="q-score" [style.color]="getScoreColor(ans.score * 10)">
                        {{ ans.score }}/10
                        @if (ans.is_correct) {
                          ✓
                        } @else {
                          ✗
                        }
                      </span>
                    </div>
                    <p class="q-feedback">{{ ans.brief_feedback }}</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Key Gaps -->
          @if (evaluation()!.key_gaps?.length) {
            <div class="section gaps-section">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Knowledge Gaps to Address
              </h3>
              <ul class="gaps-list">
                @for (gap of evaluation()!.key_gaps; track $index) {
                  <li>{{ gap }}</li>
                }
              </ul>
            </div>
          }

          <!-- Strengths -->
          @if (evaluation()!.strengths?.length) {
            <div class="section strengths-section">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                Your Strengths
              </h3>
              <div class="strengths-grid">
                @for (strength of evaluation()!.strengths; track $index) {
                  <div class="strength-card">
                    <div class="strength-area">{{ strength.area || strength }}</div>
                    @if (strength.score) {
                      <div class="strength-score">{{ strength.score }}/10</div>
                    }
                    @if (strength.note) {
                      <p class="strength-note">{{ strength.note }}</p>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- Improvements -->
          @if (evaluation()!.improvement_areas?.length) {
            <div class="section improvements-section">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                Areas for Improvement
              </h3>
              <div class="improvements-list">
                @for (item of evaluation()!.improvement_areas; track $index) {
                  <div class="improvement-item">
                    <div class="improvement-header">
                      <span class="improvement-area">{{ item.area }}</span>
                      <span class="priority-badge" [class]="item.priority">
                        {{ item.priority }} priority
                      </span>
                    </div>
                    <p class="improvement-suggestion">{{ item.suggestion }}</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Category Performance -->
          @if (evaluation()!.category_performance && getCategoryKeys().length > 0) {
            <div class="section category-section">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
                Performance by Category
              </h3>
              <div class="category-grid">
                @for (category of getCategoryKeys(); track category) {
                  <div class="category-card">
                    <div class="category-header">
                      <span class="category-name">{{ category }}</span>
                      <span class="category-score" [style.color]="getScoreColor(evaluation()!.category_performance[category].score * 10)">
                        {{ evaluation()!.category_performance[category].score }}/10
                      </span>
                    </div>
                    <div class="category-bar">
                      <div 
                        class="category-fill"
                        [style.width.%]="evaluation()!.category_performance[category].score * 10"
                        [style.background]="getScoreColor(evaluation()!.category_performance[category].score * 10)"
                      ></div>
                    </div>
                    @if (evaluation()!.category_performance[category].note) {
                      <p class="category-note">{{ evaluation()!.category_performance[category].note }}</p>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- Recommendations -->
          @if (evaluation()!.recommendations?.length) {
            <div class="section recommendations-section">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                Recommendations
              </h3>
              <ul class="recommendations-list">
                @for (rec of evaluation()!.recommendations; track $index) {
                  <li>{{ rec }}</li>
                }
              </ul>
            </div>
          }

          <!-- Actions -->
          <div class="summary-actions">
            <button class="btn btn-primary" (click)="newSession.emit()">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              Start New Interview
            </button>
          </div>
        }
      }
    </div>
    </div>
  `,
  styleUrl: './session-summary.component.css'
})
export class SessionSummaryComponent implements OnInit {
  newSession = output<void>();

  isLoading = signal(true);
  error = signal<string | null>(null);
  evaluation = signal<any>(null);

  constructor(
    private interviewService: InterviewService,
    private authService: AuthService,
    private storage: StorageService
  ) {}

  async ngOnInit() {
    try {
      const result = await this.interviewService.getSessionSummary();
      this.evaluation.set(result);
      
      // Update user stats with the score
      if (result.overall_score > 0) {
        this.authService.updateUserStats(result.overall_score);
      }

      // Save detailed history record
      this.saveDetailedHistory(result);
    } catch (err: any) {
      this.error.set(err.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  private saveDetailedHistory(evaluation: any) {
    const session = this.storage.currentSession();
    if (!session) return;

    // Calculate duration from session start
    const startTime = new Date(session.createdAt).getTime();
    const endTime = Date.now();
    const durationMinutes = Math.round((endTime - startTime) / 60000);

    // Build detailed answers evaluation with questions and user's answers
    const answersEvaluation = (evaluation.answers_evaluation || []).map((ans: any, index: number) => {
      const sessionAnswer = session.answers[index];
      return {
        questionNumber: ans.question_number,
        question: sessionAnswer?.question?.question || `Question ${ans.question_number}`,
        answer: sessionAnswer?.answer || '',
        score: ans.score,
        isCorrect: ans.is_correct,
        feedback: ans.brief_feedback
      };
    });

    const historyRecord: Partial<InterviewHistoryRecord> = {
      mode: session.mode,
      questionsAnswered: evaluation.questions_answered || session.answers.length,
      totalQuestions: evaluation.total_questions || session.questions.length,
      overallScore: evaluation.overall_score || 0,
      grade: evaluation.grade || 'N/A',
      summary: evaluation.summary || '',
      readyForInterview: evaluation.ready_for_interview || false,
      duration: durationMinutes,
      strengths: evaluation.strengths || [],
      improvementAreas: evaluation.improvement_areas || [],
      keyGaps: evaluation.key_gaps || [],
      recommendations: evaluation.recommendations || [],
      answersEvaluation: answersEvaluation,
      categoryPerformance: evaluation.category_performance || {}
    };

    this.authService.saveToHistory(historyRecord);
  }

  getCategoryKeys(): string[] {
    const eval_ = this.evaluation();
    return eval_?.category_performance ? Object.keys(eval_.category_performance) : [];
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
