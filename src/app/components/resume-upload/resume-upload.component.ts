import { Component, output, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageService, ResumeData } from '../../services/storage.service';
import { ResumeParserService } from '../../services/resume-parser.service';
import { InterviewService } from '../../services/interview.service';
import { AuthService } from '../../services/auth.service';

type InputMode = 'upload' | 'manual';

@Component({
  selector: 'app-resume-upload',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="resume-upload">
      <div class="upload-header">
        <div class="header-icon">
          <img src="mockMateLogo.png" alt="MockMate" />
        </div>
        <h2>Start Your Mock Interview</h2>
        <p>Upload your resume or enter your details manually</p>
      </div>

      @if (!resumeData()) {
        <!-- Input Mode Toggle -->
        <div class="input-mode-toggle">
          <button 
            class="mode-btn" 
            [class.active]="inputMode() === 'upload'"
            (click)="inputMode.set('upload')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload Resume
          </button>
          <button 
            class="mode-btn" 
            [class.active]="inputMode() === 'manual'"
            (click)="inputMode.set('manual')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Enter Details Manually
          </button>
        </div>

        @if (inputMode() === 'upload') {
          <!-- Upload Resume Mode -->
          <div 
            class="upload-zone"
            [class.dragging]="isDragging()"
            [class.uploading]="isUploading()"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave()"
            (drop)="onDrop($event)"
            (click)="fileInput.click()"
          >
            <input
              #fileInput
              type="file"
              accept=".pdf,.docx,.txt"
              (change)="onFileSelect($event)"
              hidden
            />

            @if (isUploading()) {
              <div class="upload-loading">
                <div class="spinner large"></div>
                <p>Analyzing your resume...</p>
              </div>
            } @else {
              <div class="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <h3>Drop your resume here</h3>
              <p>or click to browse</p>
              <div class="supported-formats">
                <span class="format-badge">PDF</span>
                <span class="format-badge">DOCX</span>
                <span class="format-badge">TXT</span>
              </div>
            }
          </div>
        } @else {
          <!-- Manual Entry Mode -->
          <div class="manual-entry-form">
            <div class="form-intro">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <p>Fill in your details below. Fields marked with <span class="required">*</span> are required.</p>
            </div>

            <!-- Name Field -->
            <div class="form-group">
              <label for="fullName">
                Full Name <span class="required">*</span>
              </label>
              <input 
                type="text" 
                id="fullName"
                [(ngModel)]="manualForm.fullName"
                placeholder="e.g., John Doe"
                class="form-input"
              />
            </div>

            <!-- Job Title / Role -->
            <div class="form-group">
              <label for="jobTitle">
                Current/Target Job Title <span class="required">*</span>
              </label>
              <input 
                type="text" 
                id="jobTitle"
                [(ngModel)]="manualForm.jobTitle"
                placeholder="e.g., Frontend Developer, Data Analyst, Project Manager"
                class="form-input"
              />
            </div>

            <!-- Experience -->
            <div class="form-group">
              <label for="experience">
                Years of Experience <span class="required">*</span>
              </label>
              <select [(ngModel)]="manualForm.experienceYears" class="form-input">
                <option value="">Select experience level</option>
                <option value="0">Fresher (0 years)</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="4">4 years</option>
                <option value="5">5 years</option>
                <option value="6">6-8 years</option>
                <option value="10">10+ years</option>
                <option value="15">15+ years</option>
              </select>
            </div>

            <!-- Skills -->
            <div class="form-group">
              <label for="skills">
                Key Skills <span class="required">*</span>
                <span class="label-hint">(comma separated)</span>
              </label>
              <textarea 
                id="skills"
                [(ngModel)]="manualForm.skills"
                placeholder="e.g., JavaScript, React, Node.js, Python, SQL, Communication, Problem Solving"
                class="form-input textarea"
                rows="3"
              ></textarea>
              <div class="field-example">
                <strong>Examples:</strong> For a developer: JavaScript, React, TypeScript, REST APIs, Git | 
                For a manager: Leadership, Project Management, Agile, Stakeholder Management
              </div>
            </div>

            <!-- Work Experience Summary -->
            <div class="form-group">
              <label for="workExperience">
                Work Experience Summary
                <span class="label-hint">(optional but recommended)</span>
              </label>
              <textarea 
                id="workExperience"
                [(ngModel)]="manualForm.workExperience"
                placeholder="Briefly describe your work experience. Example:
- Software Developer at ABC Company (2021-Present): Built web applications using React and Node.js
- Junior Developer at XYZ Corp (2019-2021): Maintained and enhanced existing systems"
                class="form-input textarea"
                rows="5"
              ></textarea>
            </div>

            <!-- Education -->
            <div class="form-group">
              <label for="education">
                Education
                <span class="label-hint">(optional)</span>
              </label>
              <input 
                type="text" 
                id="education"
                [(ngModel)]="manualForm.education"
                placeholder="e.g., B.Tech in Computer Science from XYZ University, 2020"
                class="form-input"
              />
            </div>

            <!-- Projects / Achievements -->
            <div class="form-group">
              <label for="projects">
                Notable Projects / Achievements
                <span class="label-hint">(optional)</span>
              </label>
              <textarea 
                id="projects"
                [(ngModel)]="manualForm.projects"
                placeholder="Describe any significant projects or achievements. Example:
- Built an e-commerce platform handling 10K+ users
- Led a team of 5 developers to deliver project ahead of schedule
- Increased system performance by 40%"
                class="form-input textarea"
                rows="4"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <button 
              class="btn btn-primary submit-manual-btn"
              (click)="submitManualEntry()"
              [disabled]="!isManualFormValid()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Continue with These Details
            </button>
          </div>
        }
      } @else {
        <div class="resume-preview">
          <div class="preview-header">
            <div class="file-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="file-icon">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <div>
                <h4>{{ resumeData()!.filename }}</h4>
                <span class="success-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Resume analyzed successfully
                </span>
              </div>
            </div>
            <button class="btn btn-ghost" (click)="resetUpload()">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              Upload Different
            </button>
          </div>

          <div class="parsed-data">
            <div class="data-section">
              <h5>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                Skills Detected ({{ resumeData()!.skills.length }})
              </h5>
              <div class="skills-list">
                @for (skill of resumeData()!.skills.slice(0, 12); track skill) {
                  <span class="skill-tag">{{ skill }}</span>
                }
                @if (resumeData()!.skills.length > 12) {
                  <span class="skill-tag more">+{{ resumeData()!.skills.length - 12 }} more</span>
                }
              </div>
            </div>

            @if (resumeData()!.experienceYears) {
              <div class="data-section">
                <h5>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                  </svg>
                  Experience
                </h5>
                <p class="experience-text">{{ resumeData()!.experienceYears }} years</p>
              </div>
            }

            <div class="data-section">
              <h5>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                Sections Found
              </h5>
              <div class="sections-list">
                @for (section of getSectionKeys(); track section) {
                  <span class="section-badge">{{ section }}</span>
                }
              </div>
            </div>
          </div>

          <div class="session-options">
            <div class="option-group">
              <label>Question Focus</label>
              <select [(ngModel)]="questionType" class="select-input">
                <option value="all">All Types (Mix)</option>
                <option value="technical">Technical Only</option>
                <option value="behavioral">Behavioral Only</option>
                <option value="situational">Situational Only</option>
              </select>
            </div>

            <div class="option-group">
              <label>Difficulty Level</label>
              <select [(ngModel)]="difficultyLevel" class="select-input">
                <option value="easy">Easy (Beginner Friendly)</option>
                <option value="medium">Medium (Standard)</option>
                <option value="hard">Hard (Challenging)</option>
                <option value="mixed">Mixed (All Levels)</option>
              </select>
            </div>

            <div class="option-group">
              <label>Number of Questions</label>
              <select [(ngModel)]="numQuestions" class="select-input">
                <option [value]="5">5 Questions (Quick)</option>
                <option [value]="10">10 Questions (Standard)</option>
                <option [value]="15">15 Questions (Thorough)</option>
                <option [value]="20">20 Questions (Comprehensive)</option>
              </select>
            </div>
          </div>

          <button 
            class="btn btn-primary start-btn"
            (click)="startSession()"
            [disabled]="isStarting()"
          >
            @if (isStarting()) {
              <span class="spinner"></span>
              Generating Questions...
            } @else if (!authService.isAuthenticated()) {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Login to Start Interview
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Start Mock Interview
            }
          </button>
        </div>
      }

      @if (error()) {
        <div class="upload-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ error() }}</span>
        </div>
      }

      <!-- Features Section - How It Works -->
      <div class="features-section">
        <h3 class="features-title">How MockMate Works</h3>
        <div class="features-grid">
          <div class="feature-card" [class.active]="resumeData()">
            <div class="feature-step">Step 1</div>
            <div class="feature-icon">🎯</div>
            <h4>Personalized Questions</h4>
            <p>Upload your resume and AI will analyze your skills, experience, and education to generate tailored interview questions</p>
            @if (resumeData()) {
              <span class="feature-status done">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Resume Analyzed!
              </span>
            } @else {
              <span class="feature-status pending">Upload resume to start</span>
            }
          </div>
          <div class="feature-card">
            <div class="feature-step">Step 2</div>
            <div class="feature-icon">💬</div>
            <h4>Interactive Practice</h4>
            <p>Practice answering questions one-by-one in a realistic interview simulation. Ask follow-up questions anytime!</p>
            <span class="feature-status">Start interview to practice</span>
          </div>
          <div class="feature-card">
            <div class="feature-step">Step 3</div>
            <div class="feature-icon">📊</div>
            <h4>Instant Feedback</h4>
            <p>Get immediate scores and detailed feedback on each answer. See what you did well and how to improve</p>
            <span class="feature-status">Answer questions to get feedback</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './resume-upload.component.css'
})
export class ResumeUploadComponent implements OnInit {
  sessionStarted = output<void>();
  loginRequired = output<void>();

  isDragging = signal(false);
  isUploading = signal(false);
  isStarting = signal(false);
  error = signal<string | null>(null);
  resumeData = signal<ResumeData | null>(null);
  inputMode = signal<InputMode>('upload');

  questionType = 'all';
  difficultyLevel = 'medium';
  numQuestions = 10;

  // Manual entry form
  manualForm = {
    fullName: '',
    jobTitle: '',
    experienceYears: '',
    skills: '',
    workExperience: '',
    education: '',
    projects: ''
  };

  constructor(
    public storage: StorageService,
    private resumeParser: ResumeParserService,
    private interviewService: InterviewService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    // Check if there's an existing resume from a previous session
    const existingResume = this.storage.currentResume();
    if (existingResume) {
      this.resumeData.set(existingResume);
    }
  }

  // Check if manual form has required fields
  isManualFormValid(): boolean {
    return !!(
      this.manualForm.fullName.trim() &&
      this.manualForm.jobTitle.trim() &&
      this.manualForm.experienceYears &&
      this.manualForm.skills.trim()
    );
  }

  // Submit manual entry and create ResumeData
  submitManualEntry() {
    if (!this.isManualFormValid()) {
      this.error.set('Please fill in all required fields (Name, Job Title, Experience, and Skills)');
      return;
    }

    this.error.set(null);

    // Parse skills from comma-separated string
    const skillsArray = this.manualForm.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Build raw text for AI context
    const rawText = this.buildRawText();

    // Create ResumeData object
    const resumeData: ResumeData = {
      id: this.storage.generateId(),
      filename: `${this.manualForm.fullName.trim()}'s Profile`,
      rawText: rawText,
      skills: skillsArray,
      experienceYears: parseInt(this.manualForm.experienceYears) || 0,
      sections: this.buildSections(),
      uploadedAt: new Date()
    };

    this.resumeData.set(resumeData);
  }

  private buildRawText(): string {
    let text = '';
    
    text += `Name: ${this.manualForm.fullName}\n`;
    text += `Job Title: ${this.manualForm.jobTitle}\n`;
    text += `Experience: ${this.manualForm.experienceYears} years\n`;
    text += `Skills: ${this.manualForm.skills}\n\n`;
    
    if (this.manualForm.workExperience) {
      text += `Work Experience:\n${this.manualForm.workExperience}\n\n`;
    }
    
    if (this.manualForm.education) {
      text += `Education: ${this.manualForm.education}\n\n`;
    }
    
    if (this.manualForm.projects) {
      text += `Projects/Achievements:\n${this.manualForm.projects}\n`;
    }

    return text;
  }

  private buildSections(): Record<string, string> {
    const sections: Record<string, string> = {};
    
    sections['summary'] = `${this.manualForm.fullName} - ${this.manualForm.jobTitle} with ${this.manualForm.experienceYears} years of experience. Key skills: ${this.manualForm.skills}`;
    
    if (this.manualForm.workExperience) {
      sections['experience'] = this.manualForm.workExperience;
    }
    
    if (this.manualForm.education) {
      sections['education'] = this.manualForm.education;
    }
    
    if (this.manualForm.projects) {
      sections['projects'] = this.manualForm.projects;
    }

    return sections;
  }

  // Reset manual form
  resetManualForm() {
    this.manualForm = {
      fullName: '',
      jobTitle: '',
      experienceYears: '',
      skills: '',
      workExperience: '',
      education: '',
      projects: ''
    };
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.uploadFile(file);
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.uploadFile(file);
  }

  async uploadFile(file: File) {
    this.isUploading.set(true);
    this.error.set(null);

    try {
      const data = await this.resumeParser.parseFile(file);
      this.resumeData.set(data);
    } catch (err: any) {
      this.error.set(err.message);
    } finally {
      this.isUploading.set(false);
    }
  }

  resetUpload() {
    this.resumeData.set(null);
    this.error.set(null);
    this.resetManualForm();
  }

  getSectionKeys(): string[] {
    const data = this.resumeData();
    return data ? Object.keys(data.sections) : [];
  }

  async startSession() {
    const data = this.resumeData();
    if (!data) return;

    // Check if user is logged in
    if (!this.authService.isAuthenticated()) {
      this.loginRequired.emit();
      return;
    }

    this.isStarting.set(true);
    this.error.set(null);

    try {
      await this.interviewService.startSession(
        data,
        this.questionType,
        this.numQuestions,
        this.difficultyLevel
      );
      this.sessionStarted.emit();
    } catch (err: any) {
      this.error.set(err.message);
    } finally {
      this.isStarting.set(false);
    }
  }
}

