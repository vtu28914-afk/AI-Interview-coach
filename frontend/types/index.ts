export type ExperienceLevel = 'JUNIOR' | 'MID' | 'SENIOR' | 'STAFF';

export type TargetRole = 
  | 'Software Engineer'
  | 'Full Stack Engineer'
  | 'Frontend Engineer'
  | 'Backend Engineer'
  | 'Data Scientist'
  | 'ML/AI Engineer'
  | 'Product Manager'
  | 'DevOps / SRE'
  | 'System Architect';

export type InterviewType = 'TECHNICAL' | 'BEHAVIORAL' | 'HR_CULTURE' | 'SYSTEM_DESIGN';
export type InterviewMode = 'VOICE' | 'TEXT';
export type InterviewStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  targetRole: TargetRole;
  experienceLevel: ExperienceLevel;
  techStack: string[];
  resumeSummary?: string;
  resumeFileName?: string;
  currentStreak: number;
  longestStreak: number;
  totalInterviews: number;
  averageScore: number;
  targetInterviewDate?: string;
}

export interface FollowUpQuestion {
  id: string;
  questionId: string;
  text: string;
  triggerReason: string;
  candidateAnswer?: string;
  answeredAt?: string;
}

export interface Question {
  id: string;
  orderIndex: number;
  text: string;
  type: InterviewType;
  difficulty: ExperienceLevel;
  domain: string;
  contextHint?: string;
  candidateAnswer?: string;
  idealAnswer?: string;
  audioDurationSeconds?: number;
  wpm?: number;
  fillerWordCount?: number;
  followUps?: FollowUpQuestion[];
  score?: number;
}

export interface StarBreakdown {
  situationScore: number; // 0-100
  taskScore: number;      // 0-100
  actionScore: number;    // 0-100
  resultScore: number;    // 0-100
  analysis: string;
}

export interface ComparativeAnalysis {
  questionId: string;
  questionText: string;
  candidateAnswer: string;
  idealAnswer: string;
  feedback: string;
  keyOmissions: string[];
  score: number;
}

export interface FillerWordMetric {
  word: string;
  count: number;
}

export interface FeedbackReport {
  id: string;
  interviewId: string;
  overallScore: number; // 0-100
  technicalAccuracyScore: number; // 0-100
  starComplianceScore: number; // 0-100
  speechClarityScore: number; // 0-100
  confidenceScore: number; // 0-100
  tone: 'Confident' | 'Neutral' | 'Hesitant' | 'Rushed' | 'Monotone';
  wpmAvg: number; // words per minute
  fillerWords: FillerWordMetric[];
  totalFillerCount: number;
  strengths: string[];
  improvements: string[];
  comparativeAnalysis: ComparativeAnalysis[];
  starBreakdown?: StarBreakdown;
  keyTakeaways: string[];
  generatedAt: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  title: string;
  role: TargetRole;
  type: InterviewType;
  mode: InterviewMode;
  status: InterviewStatus;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  overallScore?: number;
  questions: Question[];
  feedback?: FeedbackReport;
}

export type EventCategory = 'INTERVIEW' | 'STUDY' | 'DSA' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'REST';
export type EventStatus = 'PLANNED' | 'COMPLETED' | 'MISSED';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  status: EventStatus;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
}

export interface DailyActivity {
  id: string;
  title: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: EventStatus;
  targetDate: string; // YYYY-MM-DD
  estimatedMinutes: number;
  completedAt?: string;
}

export interface AISchedulePlanItem {
  dayNumber: number;
  date: string;
  focusArea: string;
  tasks: {
    title: string;
    category: EventCategory;
    durationMinutes: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
}

export interface AISchedulePlanResponse {
  planTitle: string;
  summary: string;
  targetCompany?: string;
  totalDays: number;
  dailyPlans: AISchedulePlanItem[];
}
