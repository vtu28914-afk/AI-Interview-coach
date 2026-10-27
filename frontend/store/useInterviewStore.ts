import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  InterviewSession, 
  Question, 
  FollowUpQuestion, 
  FeedbackReport, 
  InterviewType, 
  InterviewMode, 
  TargetRole, 
  ExperienceLevel 
} from '@/types';

interface InterviewState {
  activeSession: InterviewSession | null;
  activeQuestionIndex: number;
  sessionDuration: number;
  candidateDraftAnswer: string;
  activeFollowUp: FollowUpQuestion | null;
  isGeneratingFollowUp: boolean;
  isAnalyzing: boolean;
  pastSessions: InterviewSession[];

  startSession: (session: InterviewSession) => void;
  updateSessionDuration: (secs: number) => void;
  setDraftAnswer: (text: string) => void;
  setActiveFollowUp: (followUp: FollowUpQuestion | null) => void;
  setIsGeneratingFollowUp: (val: boolean) => void;
  setIsAnalyzing: (val: boolean) => void;
  saveAnswerForCurrentQuestion: (answer: string, audioDuration?: number) => void;
  saveFollowUpAnswer: (followUpId: string, answer: string) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  completeSession: (report: FeedbackReport) => void;
  getSessionById: (id: string) => InterviewSession | undefined;
}

const PAST_MOCK_REPORT: FeedbackReport = {
  id: 'rep-seed-1',
  interviewId: 'int-past-1',
  overallScore: 86,
  technicalAccuracyScore: 88,
  starComplianceScore: 82,
  speechClarityScore: 89,
  confidenceScore: 85,
  tone: 'Confident',
  wpmAvg: 142,
  totalFillerCount: 4,
  fillerWords: [
    { word: 'like', count: 2 },
    { word: 'um', count: 1 },
    { word: 'you know', count: 1 },
  ],
  strengths: [
    'Articulated trade-offs between Redis Lua scripts and local in-memory buffering with clear precision.',
    'Structured behavioral responses naturally using the STAR framework, emphasizing concrete actions.',
    'Maintained consistent eye contact and an optimal vocal pace of 142 words per minute.',
  ],
  improvements: [
    'Explicitly state quantitative latency targets (e.g. p99 < 15ms) when discussing cache sizing.',
    'In the behavioral story, dive deeper into how you rallied cross-functional partners during the production outage.',
    'Address database deadlocks and replication lag earlier when asked about high-scale writes.',
  ],
  comparativeAnalysis: [
    {
      questionId: 'q-seed-1',
      questionText: 'Explain how you would design an in-memory Least Recently Used (LRU) Cache that achieves O(1) time complexity for both get and put operations.',
      candidateAnswer: 'I would use a HashMap for key-value pairs combined with a Doubly Linked List. When an item is accessed or added, we move it to the front of the list. When we reach capacity, we evict the last item from the tail. In multithreading, we can protect operations using locks or a ConcurrentHashMap with segmented locking.',
      idealAnswer: 'An optimal LRU Cache pairs a Doubly Linked List with a Hash Map. The Hash Map maps keys to ListNode references for O(1) lookup. The Doubly Linked List maintains access recency: moving an accessed node to the head in O(1) and evicting the tail in O(1) when capacity is hit. For concurrent workloads, a synchronized block or ReentrantReadWriteLock is standard, though modern high-throughput caches like Caffeine utilize ring buffers and lock-free eviction queues.',
      feedback: 'Strong foundational explanation with O(1) mechanics correctly identified. Adding details on ring buffers or lock stripping would elevate this to a Staff-level answer.',
      keyOmissions: ['Lock striping / ReadWriteLock distinction', 'Ring buffer lock-free approach'],
      score: 88,
    },
    {
      questionId: 'q-seed-2',
      questionText: 'Tell me about a time when you disagreed with a senior engineer on an architectural decision. How did you resolve it?',
      candidateAnswer: 'We were redesigning our messaging pipeline. The senior engineer wanted to stick with synchronous REST calls, while I pushed for an asynchronous message queue with RabbitMQ. I created a benchmark prototype under load and showed that REST failed at 5k RPS. I presented the metrics to the engineer and we agreed to go with RabbitMQ.',
      idealAnswer: 'Using the STAR framework: Situation: Our notification service faced scaling bottlenecks during flash sales. Task: Align the engineering team on an architecture without fracturing team trust. Action: Built an objective benchmark simulating 10x traffic bursts comparing synchronous REST against RabbitMQ, demonstrating REST cascade timeouts vs message absorption. Result: Senior engineer agreed based on empirical evidence, leading to 0 dropped messages during Black Friday and a 40% reduction in response latency.',
      feedback: 'Good narrative with proof-of-concept mentioned. Quantifying the end result with exact percentages and team consensus strengthens the STAR delivery.',
      keyOmissions: ['Quantified business impact percentage', 'Follow-up team reflection'],
      score: 84,
    },
  ],
  starBreakdown: {
    situationScore: 88,
    taskScore: 82,
    actionScore: 92,
    resultScore: 76,
    analysis: 'Action step was exceptionally strong with prototyping and benchmark data. Result step could include more business metrics.',
  },
  keyTakeaways: [
    'Review concurrency models in high-throughput caching.',
    'Quantify business value in behavioral endings.',
    'Keep vocal pacing around 140 WPM.',
  ],
  generatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};

const INITIAL_PAST_SESSIONS: InterviewSession[] = [
  {
    id: 'int-past-1',
    userId: 'usr-default-1',
    title: 'Senior Software Engineer: Technical & Architecture Mock',
    role: 'Software Engineer',
    type: 'TECHNICAL',
    mode: 'VOICE',
    status: 'COMPLETED',
    startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(),
    durationSeconds: 1540,
    overallScore: 86,
    questions: [
      {
        id: 'q-seed-1',
        orderIndex: 1,
        text: 'Explain how you would design an in-memory Least Recently Used (LRU) Cache that achieves O(1) time complexity for both get and put operations.',
        type: 'TECHNICAL',
        difficulty: 'MID',
        domain: 'Data Structures & Algorithms',
        candidateAnswer: 'I would use a HashMap for key-value pairs combined with a Doubly Linked List...',
        idealAnswer: 'An optimal LRU Cache pairs a Doubly Linked List with a Hash Map...',
        audioDurationSeconds: 145,
        wpm: 140,
        fillerWordCount: 2,
        score: 88,
      },
      {
        id: 'q-seed-2',
        orderIndex: 2,
        text: 'Tell me about a time when you disagreed with a senior engineer on an architectural decision. How did you resolve it?',
        type: 'BEHAVIORAL',
        difficulty: 'MID',
        domain: 'Conflict Resolution',
        candidateAnswer: 'We were redesigning our messaging pipeline...',
        idealAnswer: 'Using the STAR framework: Situation: Our notification service faced scaling bottlenecks...',
        audioDurationSeconds: 180,
        wpm: 144,
        fillerWordCount: 2,
        score: 84,
      },
    ],
    feedback: PAST_MOCK_REPORT,
  },
];

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      activeSession: null,
      activeQuestionIndex: 0,
      sessionDuration: 0,
      candidateDraftAnswer: '',
      activeFollowUp: null,
      isGeneratingFollowUp: false,
      isAnalyzing: false,
      pastSessions: INITIAL_PAST_SESSIONS,

      startSession: (session) =>
        set({
          activeSession: session,
          activeQuestionIndex: 0,
          sessionDuration: 0,
          candidateDraftAnswer: '',
          activeFollowUp: null,
          isGeneratingFollowUp: false,
          isAnalyzing: false,
        }),

      updateSessionDuration: (secs) =>
        set((state) => ({ sessionDuration: state.sessionDuration + secs })),

      setDraftAnswer: (candidateDraftAnswer) => set({ candidateDraftAnswer }),

      setActiveFollowUp: (activeFollowUp) => set({ activeFollowUp }),

      setIsGeneratingFollowUp: (isGeneratingFollowUp) => set({ isGeneratingFollowUp }),

      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

      saveAnswerForCurrentQuestion: (answer, audioDuration = 60) =>
        set((state) => {
          if (!state.activeSession) return state;
          const currentQuestions = [...state.activeSession.questions];
          const currentQ = currentQuestions[state.activeQuestionIndex];

          if (currentQ) {
            currentQ.candidateAnswer = answer;
            currentQ.audioDurationSeconds = audioDuration;
          }

          return {
            activeSession: {
              ...state.activeSession,
              questions: currentQuestions,
            },
          };
        }),

      saveFollowUpAnswer: (followUpId, answer) =>
        set((state) => {
          if (!state.activeSession) return state;
          const currentQuestions = [...state.activeSession.questions];
          const currentQ = currentQuestions[state.activeQuestionIndex];

          if (currentQ && currentQ.followUps) {
            const fu = currentQ.followUps.find((f) => f.id === followUpId);
            if (fu) {
              fu.candidateAnswer = answer;
              fu.answeredAt = new Date().toISOString();
            }
          }

          return {
            activeSession: {
              ...state.activeSession,
              questions: currentQuestions,
            },
            activeFollowUp: null,
          };
        }),

      goToNextQuestion: () =>
        set((state) => {
          if (!state.activeSession) return state;
          const nextIndex = Math.min(
            state.activeSession.questions.length - 1,
            state.activeQuestionIndex + 1
          );
          const nextQ = state.activeSession.questions[nextIndex];
          return {
            activeQuestionIndex: nextIndex,
            candidateDraftAnswer: nextQ?.candidateAnswer || '',
            activeFollowUp: null,
          };
        }),

      goToPreviousQuestion: () =>
        set((state) => {
          if (!state.activeSession) return state;
          const prevIndex = Math.max(0, state.activeQuestionIndex - 1);
          const prevQ = state.activeSession.questions[prevIndex];
          return {
            activeQuestionIndex: prevIndex,
            candidateDraftAnswer: prevQ?.candidateAnswer || '',
            activeFollowUp: null,
          };
        }),

      completeSession: (report) =>
        set((state) => {
          if (!state.activeSession) return state;
          const completed: InterviewSession = {
            ...state.activeSession,
            status: 'COMPLETED',
            completedAt: new Date().toISOString(),
            overallScore: report.overallScore,
            feedback: report,
          };

          return {
            activeSession: completed,
            pastSessions: [completed, ...state.pastSessions],
            isAnalyzing: false,
          };
        }),

      getSessionById: (id: string) => {
        const state = get();
        if (state.activeSession && state.activeSession.id === id) {
          return state.activeSession;
        }
        return state.pastSessions.find((s) => s.id === id);
      },
    }),
    {
      name: 'preppulse-interview-storage',
    }
  )
);
