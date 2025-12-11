import { Injectable } from '@angular/core';
import { StorageService, ResumeData, InterviewQuestion, ChatMessage } from './storage.service';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class GroqApiService {
  private readonly API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly MODEL = 'llama-3.3-70b-versatile';

  constructor(private storage: StorageService) {}

  private getApiKey(): string {
    const key = this.storage.getApiKey();
    if (!key) {
      throw new Error('API key not configured. Please set your Groq API key.');
    }
    return key;
  }

  async generateQuestions(
    resumeData: ResumeData,
    questionType: string = 'all',
    numQuestions: number = 10,
    difficultyLevel: string = 'medium'
  ): Promise<InterviewQuestion[]> {
    const prompt = this.buildQuestionPrompt(resumeData, questionType, numQuestions, difficultyLevel);
    const response = await this.callApi(prompt);
    return this.parseQuestionsResponse(response);
  }

  async chat(
    messages: ChatMessage[],
    resumeData: ResumeData,
    currentQuestion?: InterviewQuestion
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(resumeData, currentQuestion);
    
    const groqMessages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ];

    return this.callApiWithMessages(groqMessages);
  }

  async evaluateAnswer(
    question: InterviewQuestion,
    answer: string,
    resumeData: ResumeData
  ): Promise<any> {
    const prompt = `You are an expert technical interviewer. Evaluate this interview answer STRICTLY and ACCURATELY.

QUESTION DETAILS:
- Question: ${question.question}
- Category: ${question.category}
- Difficulty: ${question.difficulty}
- Skill Focus: ${question.skillFocus}
- Expected Topics to Cover: ${question.expectedTopics.join(', ')}

CANDIDATE'S ANSWER:
"${answer}"

CANDIDATE'S CLAIMED SKILLS: ${resumeData.skills.join(', ')}

EVALUATION INSTRUCTIONS:
1. Check if the answer is FACTUALLY CORRECT
2. Check if the answer ADDRESSES the question directly
3. Check if the answer demonstrates REAL understanding or is just generic
4. Check if expected topics are covered
5. Be STRICT - don't give high scores for vague or incorrect answers
6. Score 1-3 for wrong/irrelevant answers
7. Score 4-5 for partially correct but incomplete answers  
8. Score 6-7 for correct but could be better answers
9. Score 8-10 for excellent, comprehensive answers

Return your evaluation as JSON:
{
  "overall_score": <1-10>,
  "is_correct": <true/false>,
  "category_scores": {
    "relevance": <1-10 - does it answer the question?>,
    "depth": <1-10 - how thorough is it?>,
    "clarity": <1-10 - how clear is the explanation?>,
    "structure": <1-10 - is it well organized?>
  },
  "strengths": ["specific strength 1", "specific strength 2"],
  "weaknesses": ["specific issue 1", "specific issue 2"],
  "missing_topics": ["topic not covered 1", "topic not covered 2"],
  "factual_errors": ["error 1 if any"],
  "suggestions": ["specific improvement 1", "specific improvement 2"],
  "verdict": "Excellent|Good|Satisfactory|Needs Improvement|Poor",
  "correct_answer_hint": "Brief hint of what a good answer should include"
}

Be honest and critical. Return ONLY the JSON.`;

    const response = await this.callApi(prompt);
    return this.parseJsonResponse(response);
  }

  async getSessionEvaluation(
    answers: { question: InterviewQuestion; answer: string }[],
    resumeData: ResumeData
  ): Promise<any> {
    if (answers.length === 0) {
      return {
        overall_score: 0,
        grade: 'N/A',
        summary: 'No questions were answered.',
        strengths: [],
        improvement_areas: [],
        category_performance: {},
        recommendations: ['Answer questions to receive evaluation'],
        ready_for_interview: false
      };
    }

    const answersText = answers.map((a, i) => 
      `Q${i + 1} [${a.question.category}]: ${a.question.question}
A${i + 1}: ${a.answer}
Expected Topics: ${a.question.expectedTopics.join(', ')}`
    ).join('\n\n---\n\n');

    const prompt = `You are an expert interview evaluator. Evaluate this complete interview session STRICTLY and HONESTLY.

CANDIDATE SKILLS: ${resumeData.skills.join(', ')}
EXPERIENCE: ${resumeData.experienceYears || 'Not specified'} years
QUESTIONS ANSWERED: ${answers.length}

INTERVIEW Q&A:
${answersText}

EVALUATION INSTRUCTIONS:
1. Evaluate EACH answer for correctness and completeness
2. Consider if answers demonstrate real knowledge or are generic
3. Be STRICT - real interviews are tough
4. Score based on actual performance, not potential
5. Identify specific factual errors or misconceptions
6. A score of 60+ means generally ready, below 50 needs significant work

Provide overall evaluation in JSON:
{
  "overall_score": <0-100 based on actual performance>,
  "grade": "<A+/A/A-/B+/B/B-/C+/C/C-/D/F>",
  "summary": "<Honest 2-3 sentence assessment of their interview performance>",
  "answers_evaluation": [
    {
      "question_number": 1,
      "score": <1-10>,
      "is_correct": <true/false>,
      "brief_feedback": "<one line feedback>"
    }
  ],
  "strengths": [
    {"area": "<specific area>", "score": <1-10>, "note": "<specific observation>"}
  ],
  "improvement_areas": [
    {"area": "<specific area>", "priority": "<high/medium/low>", "suggestion": "<actionable advice>"}
  ],
  "category_performance": {
    "technical": {"score": <1-10>, "note": "<assessment>"},
    "behavioral": {"score": <1-10>, "note": "<assessment>"},
    "communication": {"score": <1-10>, "note": "<assessment>"}
  },
  "recommendations": [
    "<specific actionable recommendation 1>",
    "<specific actionable recommendation 2>",
    "<specific actionable recommendation 3>"
  ],
  "ready_for_interview": <true if score >= 60, false otherwise>,
  "key_gaps": ["<knowledge gap 1>", "<knowledge gap 2>"]
}

Be honest and constructive. Return ONLY the JSON.`;

    const response = await this.callApi(prompt);
    return this.parseJsonResponse(response);
  }

  private buildQuestionPrompt(
    resumeData: ResumeData,
    questionType: string,
    numQuestions: number,
    difficultyLevel: string = 'medium'
  ): string {
    const skills = resumeData.skills.join(', ');
    const experience = resumeData.experienceYears;
    const sections = resumeData.sections;

    let typeInstruction = '';
    switch (questionType) {
      case 'technical':
        typeInstruction = 'Focus only on technical questions related to their skills and technologies.';
        break;
      case 'behavioral':
        typeInstruction = 'Focus only on behavioral questions (STAR format) based on their experience.';
        break;
      case 'situational':
        typeInstruction = 'Focus only on situational/hypothetical questions relevant to their role.';
        break;
      default:
        typeInstruction = 'Include a mix of technical, behavioral, and situational questions.';
    }

    let difficultyInstruction = '';
    switch (difficultyLevel) {
      case 'easy':
        difficultyInstruction = `DIFFICULTY LEVEL: EASY
- Generate beginner-friendly questions
- Focus on fundamental concepts and basic knowledge
- Questions should be straightforward and clear
- Avoid complex scenarios or deep technical details
- Suitable for entry-level candidates or those new to the field
- ALL questions should have difficulty "easy"`;
        break;
      case 'hard':
        difficultyInstruction = `DIFFICULTY LEVEL: HARD
- Generate challenging, advanced-level questions
- Include complex scenarios requiring deep expertise
- Ask about edge cases, performance optimization, and architectural decisions
- Test advanced problem-solving and critical thinking
- Suitable for senior-level or expert candidates
- ALL questions should have difficulty "hard"`;
        break;
      case 'mixed':
        difficultyInstruction = `DIFFICULTY LEVEL: MIXED
- Generate a balanced mix of easy, medium, and hard questions
- Include approximately 30% easy, 40% medium, and 30% hard questions
- Progress from easier to harder questions`;
        break;
      default: // medium
        difficultyInstruction = `DIFFICULTY LEVEL: MEDIUM (Standard)
- Generate moderate difficulty questions
- Balance between fundamental concepts and practical application
- Include some scenario-based questions
- Suitable for mid-level candidates with some experience
- ALL questions should have difficulty "medium"`;
    }

    return `You are an expert interviewer. Based on the following resume information, generate ${numQuestions} personalized interview questions.

CANDIDATE PROFILE:
- Skills: ${skills}
- Years of Experience: ${experience || 'Not specified'}

SUMMARY:
${(sections['summary'] || '').substring(0, 500) || 'Not provided'}

WORK EXPERIENCE:
${(sections['experience'] || '').substring(0, 1000) || 'Not provided'}

EDUCATION:
${(sections['education'] || '').substring(0, 500) || 'Not provided'}

PROJECTS:
${(sections['projects'] || '').substring(0, 500) || 'Not provided'}

QUESTION TYPE INSTRUCTIONS:
${typeInstruction}

${difficultyInstruction}

Generate questions that:
1. Are specific to the candidate's actual experience and skills
2. Have clear correct/expected answers
3. Match the specified difficulty level exactly
4. Test real understanding, not just memorization

Return the questions in this exact JSON format:
[
  {
    "question": "Your question here",
    "category": "technical|behavioral|situational",
    "difficulty": "easy|medium|hard",
    "skillFocus": "The skill this question targets",
    "expectedTopics": ["key concept 1", "key concept 2", "key concept 3"]
  }
]

Return ONLY the JSON array, no additional text.`;
  }

  private buildSystemPrompt(resumeData: ResumeData, currentQuestion?: InterviewQuestion): string {
    const skills = resumeData.skills.join(', ');
    const experience = resumeData.experienceYears;

    return `You are MockMate, an expert AI interviewer helping candidates prepare for job interviews.

CANDIDATE PROFILE:
- Skills: ${skills}
- Years of Experience: ${experience || 'Not specified'}
- Background: ${(resumeData.sections['summary'] || '').substring(0, 300)}

${currentQuestion ? `CURRENT QUESTION:
- Question: ${currentQuestion.question}
- Category: ${currentQuestion.category}
- Expected Topics: ${currentQuestion.expectedTopics.join(', ')}` : ''}

YOUR ROLE:
- Conduct a realistic but supportive mock interview
- Provide constructive feedback on answers
- Be encouraging while maintaining professional standards
- Answer follow-up questions helpfully
- Offer tips to improve interview performance

GUIDELINES:
1. Acknowledge responses before providing feedback
2. Keep feedback concise but actionable (2-3 key points)
3. If they ask questions, answer as an interview coach
4. Be conversational and supportive
5. Use markdown for formatting when helpful`;
  }

  private async callApi(prompt: string): Promise<string> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: 'You are an expert technical interviewer. Always respond with valid JSON when requested. Be strict but fair in evaluations.'
      },
      { role: 'user', content: prompt }
    ];

    return this.callApiWithMessages(messages);
  }

  private async callApiWithMessages(messages: GroqMessage[]): Promise<string> {
    const apiKey = this.getApiKey();

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data: GroqResponse = await response.json();
    return data.choices[0].message.content;
  }

  private parseQuestionsResponse(response: string): InterviewQuestion[] {
    try {
      let cleaned = response.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
      if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);

      const questions = JSON.parse(cleaned.trim());

      return questions.map((q: any) => ({
        question: q.question || '',
        category: q.category || 'general',
        difficulty: q.difficulty || 'medium',
        skillFocus: q.skillFocus || q.skill_focus || '',
        expectedTopics: q.expectedTopics || q.expected_topics || []
      }));
    } catch {
      // Fallback: extract questions from text
      return this.extractQuestionsFromText(response);
    }
  }

  private extractQuestionsFromText(text: string): InterviewQuestion[] {
    const questions: InterviewQuestion[] = [];
    const matches = text.match(/[^.!?]*\?/g) || [];

    for (const match of matches.slice(0, 10)) {
      const question = match.trim();
      if (question.length > 20) {
        questions.push({
          question,
          category: 'general',
          difficulty: 'medium',
          skillFocus: '',
          expectedTopics: []
        });
      }
    }

    return questions;
  }

  private parseJsonResponse(response: string): any {
    try {
      let cleaned = response.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
      if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);

      return JSON.parse(cleaned.trim());
    } catch {
      return {
        overall_score: 0,
        is_correct: false,
        strengths: [],
        weaknesses: ['Could not evaluate answer'],
        suggestions: ['Please try again with a clearer answer'],
        verdict: 'Not Evaluated'
      };
    }
  }
}
