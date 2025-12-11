import { Injectable, signal, computed } from '@angular/core';
import { 
  StorageService, 
  ResumeData, 
  InterviewSession, 
  InterviewQuestion, 
  ChatMessage,
  AnswerRecord 
} from './storage.service';
import { GroqApiService } from './groq-api.service';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  // State signals
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  // Computed values
  session = computed(() => this.storage.currentSession());
  resume = computed(() => this.storage.currentResume());
  
  currentQuestion = computed(() => {
    const s = this.session();
    if (!s || s.currentQuestionIndex >= s.questions.length) return null;
    return s.questions[s.currentQuestionIndex];
  });

  progress = computed(() => {
    const s = this.session();
    if (!s) return { current: 0, total: 0, percentage: 0, answered: 0 };
    return {
      current: s.currentQuestionIndex + 1,
      total: s.questions.length,
      percentage: Math.round((s.answers.length / s.questions.length) * 100),
      answered: s.answers.length
    };
  });

  constructor(
    private storage: StorageService,
    private groqApi: GroqApiService
  ) {}

  async startSession(
    resumeData: ResumeData,
    questionType: string = 'all',
    numQuestions: number = 10,
    difficultyLevel: string = 'medium'
  ): Promise<InterviewSession> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Generate questions
      const questions = await this.groqApi.generateQuestions(
        resumeData,
        questionType,
        numQuestions,
        difficultyLevel
      );

      if (!questions.length) {
        throw new Error('Failed to generate interview questions');
      }

      // Create session
      const session: InterviewSession = {
        id: this.storage.generateId(),
        resumeId: resumeData.id,
        questions,
        currentQuestionIndex: 0,
        messages: [],
        answers: [],
        mode: questionType,
        createdAt: new Date(),
        status: 'active'
      };

      // Add welcome message
      const welcomeMessage = this.createWelcomeMessage(questions);
      session.messages.push(welcomeMessage);

      // Save session
      this.storage.saveResume(resumeData);
      this.storage.saveSession(session);

      return session;
    } catch (err: any) {
      this.error.set(err.message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  private createWelcomeMessage(questions: InterviewQuestion[]): ChatMessage {
    const firstQ = questions[0];
    
    return {
      role: 'assistant',
      content: `👋 **Welcome to your MockMate interview session!**

I've analyzed your resume and prepared **${questions.length} personalized questions** based on your experience and skills.

**How this works:**
- I'll ask you questions one at a time
- Type your answer and press Enter to submit
- I'll evaluate your answer and provide feedback
- Say "next question" to move to the next one
- Ask for "feedback" for detailed evaluation of your last answer

**Important:** Your answers will be evaluated for correctness, completeness, and clarity.

---

**Question 1 of ${questions.length}**
*Category: ${firstQ.category.charAt(0).toUpperCase() + firstQ.category.slice(1)}* | *Difficulty: ${firstQ.difficulty.charAt(0).toUpperCase() + firstQ.difficulty.slice(1)}*

${firstQ.question}`,
      timestamp: new Date(),
      type: 'question'
    };
  }

  async sendMessage(content: string): Promise<ChatMessage> {
    const session = this.session();
    const resume = this.resume();
    
    if (!session || !resume) {
      throw new Error('No active session');
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content,
        timestamp: new Date()
      };
      session.messages.push(userMessage);

      // Detect intent
      const intent = this.detectIntent(content, session);

      let responseContent: string;
      let responseType: string = 'response';

      if (intent === 'next') {
        // Move to next question (allow skipping)
        if (session.currentQuestionIndex < session.questions.length - 1) {
          // Move to next question
          session.currentQuestionIndex++;
          const nextQ = session.questions[session.currentQuestionIndex];
          
          responseContent = `**Question ${session.currentQuestionIndex + 1} of ${session.questions.length}**
*Category: ${nextQ.category.charAt(0).toUpperCase() + nextQ.category.slice(1)}* | *Difficulty: ${nextQ.difficulty.charAt(0).toUpperCase() + nextQ.difficulty.slice(1)}*

${nextQ.question}

Take your time to think about this.`;
          responseType = 'question';
        } else {
          responseContent = `🎉 **Congratulations!** You've completed all the interview questions!

**Questions Answered:** ${session.answers.length} out of ${session.questions.length}

Click "End Session" to see your detailed performance report.`;
          responseType = 'complete';
          session.status = 'completed';
        }
      } else if (intent === 'feedback') {
        // Get detailed feedback on last answer
        if (session.answers.length > 0) {
          const lastAnswer = session.answers[session.answers.length - 1];
          const evaluation = await this.groqApi.evaluateAnswer(
            lastAnswer.question,
            lastAnswer.answer,
            resume
          );
          responseContent = this.formatEvaluation(evaluation, lastAnswer);
          responseType = 'feedback';
        } else {
          responseContent = "❌ You haven't answered any questions yet. Please answer the current question first, then ask for feedback!";
        }
      } else {
        // This is an answer to the current question
        const currentQ = this.currentQuestion();
        
        if (currentQ) {
          // Check if already answered this question
          const alreadyAnswered = session.answers.some(
            a => a.questionIndex === session.currentQuestionIndex
          );

          if (alreadyAnswered) {
            // Update existing answer
            const existingIndex = session.answers.findIndex(
              a => a.questionIndex === session.currentQuestionIndex
            );
            session.answers[existingIndex].answer = content;
            session.answers[existingIndex].timestamp = new Date();
          } else {
            // Record new answer
            session.answers.push({
              questionIndex: session.currentQuestionIndex,
              question: currentQ,
              answer: content,
              timestamp: new Date()
            });
          }

          // Get immediate evaluation of the answer
          const evaluation = await this.groqApi.evaluateAnswer(
            currentQ,
            content,
            resume
          );

          responseContent = this.formatQuickFeedback(evaluation, session);
          responseType = 'answer_feedback';
        } else {
          // General chat - use AI
          responseContent = await this.groqApi.chat(
            session.messages,
            resume,
            undefined
          );
          responseType = 'response';
        }
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        type: responseType
      };
      session.messages.push(assistantMessage);

      // Save updated session
      this.storage.saveSession(session);

      return assistantMessage;
    } catch (err: any) {
      this.error.set(err.message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  private detectIntent(message: string, session: InterviewSession): string {
    const lower = message.toLowerCase().trim();

    // Check for "next" commands - flexible matching
    if (/\b(next|skip|move\s*on|continue)\b/i.test(lower)) {
      return 'next';
    }

    // Check for feedback requests
    if (/\b(feedback|how\s*did\s*i\s*do|rate\s*my|evaluate\s*my|score\s*my|review\s*my)\b/i.test(lower)) {
      return 'feedback';
    }

    // Check for summary requests
    if (/\b(summary|overall|final\s*score|results|show\s*summary|end\s*interview)\b/i.test(lower)) {
      return 'summary';
    }

    // Default: treat as an answer
    return 'answer';
  }

  private formatQuickFeedback(evaluation: any, session: InterviewSession): string {
    const score = evaluation.overall_score || 0;
    const verdict = evaluation.verdict || 'Not evaluated';
    const isCorrect = score >= 6;
    const icon = isCorrect ? '✅' : '⚠️';

    let feedback = `${icon} **Answer Recorded**

**Score:** ${score}/10 | **Verdict:** ${verdict}

`;

    if (evaluation.strengths?.length > 0) {
      feedback += `**Good:** ${evaluation.strengths[0]}\n`;
    }

    if (evaluation.weaknesses?.length > 0 && score < 8) {
      feedback += `**Improve:** ${evaluation.weaknesses[0]}\n`;
    }

    feedback += `
---
📊 *Say "feedback" for detailed evaluation*
➡️ *Say "next question" to continue (${session.answers.length}/${session.questions.length} answered)*`;

    return feedback;
  }

  private formatEvaluation(evaluation: any, answer: AnswerRecord): string {
    const score = evaluation.overall_score || 0;
    const verdict = evaluation.verdict || 'Not evaluated';
    const strengths = evaluation.strengths || [];
    const weaknesses = evaluation.weaknesses || [];
    const suggestions = evaluation.suggestions || [];
    const categoryScores = evaluation.category_scores || {};

    const isCorrect = score >= 6;
    const statusIcon = score >= 8 ? '🌟' : score >= 6 ? '✅' : score >= 4 ? '⚠️' : '❌';

    return `## 📊 Detailed Answer Evaluation

**Question:** ${answer.question.question}

**Your Answer:** ${answer.answer.substring(0, 200)}${answer.answer.length > 200 ? '...' : ''}

---

### ${statusIcon} Score: ${score}/10 - ${verdict}

${categoryScores.relevance ? `| Relevance | Depth | Clarity | Structure |
|:---------:|:-----:|:-------:|:---------:|
| ${categoryScores.relevance}/10 | ${categoryScores.depth}/10 | ${categoryScores.clarity}/10 | ${categoryScores.structure}/10 |` : ''}

### ✅ What You Did Well
${strengths.map((s: string) => `- ${s}`).join('\n') || '- Answer provided'}

### 🔧 Areas to Improve
${weaknesses.map((w: string) => `- ${w}`).join('\n') || '- Keep practicing!'}

### 💡 Suggestions
${suggestions.map((s: string) => `- ${s}`).join('\n') || '- Try to be more specific with examples'}

---
*Say "next question" to continue.*`;
  }

  async getSessionSummary(): Promise<any> {
    const session = this.session();
    const resume = this.resume();

    if (!session || !resume) {
      throw new Error('No session data available');
    }

    // Check if there are any answers
    if (session.answers.length === 0) {
      return {
        overall_score: 0,
        grade: 'N/A',
        summary: 'No questions were answered during this session. Please start a new interview and answer the questions to receive an evaluation.',
        strengths: [],
        improvement_areas: [{
          area: 'Participation',
          priority: 'high',
          suggestion: 'Make sure to answer each question before ending the session'
        }],
        category_performance: {},
        recommendations: [
          'Start a new interview session',
          'Answer each question thoroughly before moving to the next',
          'Take your time to provide complete answers'
        ],
        ready_for_interview: false,
        questions_answered: 0,
        total_questions: session.questions.length
      };
    }

    this.isLoading.set(true);

    try {
      const answersData = session.answers.map(a => ({
        question: a.question,
        answer: a.answer
      }));

      const evaluation = await this.groqApi.getSessionEvaluation(answersData, resume);
      
      // Add additional stats
      return {
        ...evaluation,
        questions_answered: session.answers.length,
        total_questions: session.questions.length,
        completion_rate: Math.round((session.answers.length / session.questions.length) * 100)
      };
    } finally {
      this.isLoading.set(false);
    }
  }

  endSession(): void {
    const session = this.session();
    if (session) {
      session.status = 'completed';
      this.storage.saveSession(session);
    }
  }

  clearSession(): void {
    this.storage.clearCurrentSession();
  }

  // Clear session but keep resume for quick restart
  clearSessionKeepResume(): void {
    this.storage.clearSessionKeepResume();
  }
}
