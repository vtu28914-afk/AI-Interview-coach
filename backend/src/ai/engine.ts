import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  InterviewType, 
  ExperienceLevel, 
  Question, 
  FollowUpQuestion, 
  FeedbackReport, 
  AISchedulePlanResponse, 
  TargetRole 
} from '../types';
import { PROMPTS } from './prompts';
import { FallbackAIEngine } from './fallbackEngine';

export class AIService {
  private static getGeminiClient(customApiKey?: string): GoogleGenerativeAI | null {
    const key = customApiKey || process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenerativeAI(key);
  }

  static async generateQuestions(params: {
    role: TargetRole;
    type: InterviewType;
    difficulty: ExperienceLevel;
    techStack: string[];
    count?: number;
    resumeSummary?: string;
    apiKey?: string;
  }): Promise<Question[]> {
    const { role, type, difficulty, techStack, count = 3, resumeSummary, apiKey } = params;

    const gemini = this.getGeminiClient(apiKey);
    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: PROMPTS.SYSTEM_INTERVIEWER,
          generationConfig: { responseMimeType: 'application/json' }
        });

        const prompt = PROMPTS.generateQuestionsPrompt(role, type, difficulty, techStack, count, resumeSummary);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => ({
            id: `q-${Date.now()}-${idx + 1}`,
            orderIndex: idx + 1,
            text: item.text,
            type,
            difficulty,
            domain: item.domain || 'Core Engineering',
            contextHint: item.contextHint,
            idealAnswer: item.idealAnswer,
            followUps: []
          }));
        }
      } catch (err) {
        console.warn('Gemini API question generation failed or rate limited, falling back to local simulation engine:', err);
      }
    }

    return FallbackAIEngine.generateQuestions(role, type, difficulty, techStack, count, resumeSummary);
  }

  static async generateFollowUp(params: {
    question: string;
    candidateAnswer: string;
    role: string;
    type: InterviewType;
    apiKey?: string;
  }): Promise<FollowUpQuestion> {
    const { question, candidateAnswer, role, type, apiKey } = params;

    const gemini = this.getGeminiClient(apiKey);
    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: PROMPTS.SYSTEM_INTERVIEWER,
          generationConfig: { responseMimeType: 'application/json' }
        });

        const prompt = PROMPTS.generateFollowUpPrompt(question, candidateAnswer, role, type);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text);

        if (parsed.text) {
          return {
            id: `fu-${Date.now()}`,
            questionId: 'active',
            text: parsed.text,
            triggerReason: parsed.triggerReason || 'Probing deeper into technical details'
          };
        }
      } catch (err) {
        console.warn('Gemini API follow-up generation failed, falling back:', err);
      }
    }

    return FallbackAIEngine.generateFollowUp(question, candidateAnswer, role, type);
  }

  static async analyzeReport(params: {
    role: TargetRole;
    type: InterviewType;
    questions: Question[];
    totalDurationSeconds: number;
    apiKey?: string;
  }): Promise<FeedbackReport> {
    const { role, type, questions, totalDurationSeconds, apiKey } = params;

    const gemini = this.getGeminiClient(apiKey);
    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: PROMPTS.SYSTEM_INTERVIEWER,
          generationConfig: { responseMimeType: 'application/json' }
        });

        const formattedQuestions = questions.map(q => ({
          question: q.text,
          answer: q.candidateAnswer || '',
          ideal: q.idealAnswer || '',
          followUps: q.followUps?.map(f => `${f.text} -> ${f.candidateAnswer || ''}`)
        }));

        const prompt = PROMPTS.generateReportPrompt(role, type, formattedQuestions);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text);

        if (parsed.overallScore !== undefined) {
          // Merge with speech metrics computed from candidate answers
          const fullTranscript = questions.map(q => q.candidateAnswer || '').join(' ');
          const fallback = FallbackAIEngine.analyzeReport(role, type, questions, totalDurationSeconds);

          return {
            id: `rep-${Date.now()}`,
            interviewId: `int-${Date.now()}`,
            overallScore: parsed.overallScore,
            technicalAccuracyScore: parsed.technicalAccuracyScore ?? fallback.technicalAccuracyScore,
            starComplianceScore: parsed.starComplianceScore ?? fallback.starComplianceScore,
            speechClarityScore: parsed.speechClarityScore ?? fallback.speechClarityScore,
            confidenceScore: parsed.confidenceScore ?? fallback.confidenceScore,
            tone: parsed.tone || fallback.tone,
            wpmAvg: fallback.wpmAvg,
            fillerWords: fallback.fillerWords,
            totalFillerCount: fallback.totalFillerCount,
            strengths: parsed.strengths || fallback.strengths,
            improvements: parsed.improvements || fallback.improvements,
            comparativeAnalysis: (parsed.comparativeAnalysis && parsed.comparativeAnalysis.length > 0)
              ? parsed.comparativeAnalysis.map((c: any, idx: number) => ({
                  questionId: questions[idx]?.id || `q-${idx}`,
                  questionText: c.questionText || questions[idx]?.text || '',
                  candidateAnswer: c.candidateAnswer || questions[idx]?.candidateAnswer || '',
                  idealAnswer: c.idealAnswer || questions[idx]?.idealAnswer || '',
                  feedback: c.feedback || 'Good attempt.',
                  keyOmissions: c.keyOmissions || [],
                  score: c.score || 80
                }))
              : fallback.comparativeAnalysis,
            starBreakdown: parsed.starBreakdown || fallback.starBreakdown,
            keyTakeaways: parsed.keyTakeaways || fallback.keyTakeaways,
            generatedAt: new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn('Gemini report analysis failed, using fallback engine:', err);
      }
    }

    return FallbackAIEngine.analyzeReport(role, type, questions, totalDurationSeconds);
  }

  static async generateSchedulePlan(params: {
    role: TargetRole;
    targetDate: string;
    targetCompany: string;
    currentSkills: string[];
    weaknesses?: string[];
    apiKey?: string;
  }): Promise<AISchedulePlanResponse> {
    const { role, targetDate, targetCompany, currentSkills, weaknesses = [], apiKey } = params;

    const gemini = this.getGeminiClient(apiKey);
    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: PROMPTS.SYSTEM_INTERVIEWER,
          generationConfig: { responseMimeType: 'application/json' }
        });

        const prompt = PROMPTS.generateSchedulePlanPrompt(role, targetDate, targetCompany, currentSkills, weaknesses);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text);

        if (parsed.dailyPlans && Array.isArray(parsed.dailyPlans)) {
          return parsed;
        }
      } catch (err) {
        console.warn('Gemini schedule generation failed, using fallback engine:', err);
      }
    }

    return FallbackAIEngine.generateSchedulePlan(role, targetDate, targetCompany, currentSkills);
  }
}
