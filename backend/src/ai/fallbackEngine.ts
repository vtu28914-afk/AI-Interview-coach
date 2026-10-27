import { 
  InterviewType, 
  ExperienceLevel, 
  Question, 
  FollowUpQuestion, 
  FeedbackReport, 
  AISchedulePlanResponse,
  TargetRole
} from '../types';
import { countFillerWords, calculateWpm } from '../utils';

// High-caliber question bank for fallback mode
const QUESTION_REPOSITORY: Record<string, Partial<Question>[]> = {
  'Software Engineer_TECHNICAL': [
    {
      domain: 'Data Structures & Algorithms',
      text: 'Explain how you would design an in-memory Least Recently Used (LRU) Cache that achieves O(1) time complexity for both get and put operations. What data structures would you combine, and how would you handle concurrent reads and writes in a multithreaded environment?',
      contextHint: 'Focus on doubly linked lists + hash maps, synchronization locks vs read-write locks or concurrent skip lists.',
      idealAnswer: 'An optimal LRU Cache combines a Doubly Linked List with a Hash Map. The Hash Map stores keys mapping to node pointers in the linked list for O(1) lookup. The Doubly Linked List maintains access recency: moving a accessed node to the head, and evicting from the tail when capacity is exceeded in O(1). For multithreading, using a coarse-grained ReentrantLock is simplest but causes contention; a ReadWriteLock improves read throughput, while segmented locks (striped locking like ConcurrentHashMap) or Lock-Free eviction buffers (like Caffeine Cache) offer near-linear scalability.'
    },
    {
      domain: 'Distributed Systems & Trade-offs',
      text: 'Describe the CAP theorem and explain how you would design a globally distributed user session store. Would you favor consistency or availability during a network partition, and what consistency model would you choose?',
      contextHint: 'Address network partitions (P), eventual consistency vs strong consistency, and Redis Cluster or DynamoDB replication strategies.',
      idealAnswer: 'In distributed systems, network partitions (P) are unavoidable, forcing a tradeoff between Consistency (C) and Availability (A). For a user session store, session validation is on the critical path of every request. Usually, session stores prioritize High Availability (AP) with eventual consistency or session stickiness, using distributed key-value stores like DynamoDB or Redis Enterprise with CRDTs (Conflict-free Replicated Data Types). Token-based stateless sessions (JWT) with asymmetric signature verification eliminate cross-region DB lookups entirely, only checking a distributed revocation blacklist upon logout or privilege escalation.'
    },
    {
      domain: 'Database & Concurrency',
      text: 'What are database isolation levels, and how does Multi-Version Concurrency Control (MVCC) prevent dirty reads and non-repeatable reads without locking entire tables?',
      contextHint: 'Touch on Read Uncommitted, Read Committed, Repeatable Read, Serializable, and row version snapshots in PostgreSQL / MySQL InnoDB.',
      idealAnswer: 'Database isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) define how transaction integrity is preserved against phenomena like dirty reads, non-repeatable reads, and phantom reads. MVCC allows readers not to block writers and writers not to block readers. It achieves this by maintaining multiple versions of a row (with creation and deletion transaction IDs / timestamps). A transaction only sees row versions that were committed prior to its snapshot timestamp, effectively isolating concurrent mutations without global table locking.'
    }
  ],
  'Software Engineer_BEHAVIORAL': [
    {
      domain: 'Conflict Resolution & Technical Disagreements',
      text: 'Tell me about a time when you strongly disagreed with a senior engineer or engineering lead regarding an architectural decision. How did you handle the situation, and what was the outcome using the STAR framework?',
      contextHint: 'Structure using Situation, Task, Action, Result. Highlight data-driven persuasion, prototyping, and disagree-and-commit.',
      idealAnswer: 'Situation: Our team was migrating our monolithic notification service, and the lead wanted a pure synchronous REST approach while I advocated for an event-driven queue via Kafka/RabbitMQ. Task: I needed to evaluate both approaches without stalling sprint velocity or alienating team members. Action: I built a rapid benchmark prototype comparing both approaches under simulated 10x traffic bursts, showing that synchronous REST led to cascade timeouts while queues absorbed the spike with 0 dropped events. I presented the quantitative results to the lead objectively and proposed a hybrid rollout. Result: The lead agreed with the data, we adopted the message broker, and the service survived Black Friday without a single timeout while latency dropped by 42%.'
    },
    {
      domain: 'Failure Recovery & Ownership',
      text: 'Describe a situation where a code deployment or design decision you made led to a production incident. How did you triage the outage, communicate with stakeholders, and prevent recurrence?',
      contextHint: 'Emphasize radical ownership, blameless postmortem, mitigation first over finding fault, and automated guardrails.',
      idealAnswer: 'Situation: I pushed a migration modifying a database column index that inadvertently caused table locks under peak midday load, resulting in 504 Gateway Timeouts for 14 minutes. Task: Triage the root cause instantly, restore customer traffic, and mitigate customer impact. Action: I immediately triggered our automated rollback pipeline, monitored connection pools recovering, and drafted an incident announcement for our support team with real-time status updates. Following resolution, I led a blameless postmortem, discovered our migration linter lacked safe-DDL checks, and implemented automated zero-downtime migration linting in our CI/CD pipeline. Result: System uptime recovered to 99.99%, and the new CI linter prevented 4 subsequent lock-prone migrations across other teams that quarter.'
    }
  ],
  'Software Engineer_SYSTEM_DESIGN': [
    {
      domain: 'High-Throughput Distributed Systems',
      text: 'Design a distributed Rate Limiter for a high-traffic public API gateway receiving 100,000 requests per second. How do you choose between Token Bucket, Leaky Bucket, and Sliding Window Log, and how do you minimize redis latency and race conditions?',
      contextHint: 'Evaluate algorithms, Redis with Lua scripts, sliding window counter with memory optimization, and local node caching with sync.',
      idealAnswer: 'To handle 100k RPS with sub-millisecond overhead: I recommend a Sliding Window Counter algorithm or Token Bucket implemented via Redis with atomic Lua scripting. The Lua script evaluates the current window count and increments in a single atomic network roundtrip, preventing race conditions. To avoid hitting Redis on every single request, we use local in-memory token buffers at the API gateway tier (e.g. Envoy rate limit filter or local Guava cache) that periodically sync batches of tokens, reducing Redis traffic by up to 90%.'
    }
  ]
};

export class FallbackAIEngine {
  static generateQuestions(
    role: TargetRole,
    type: InterviewType,
    difficulty: ExperienceLevel,
    techStack: string[],
    count: number = 3,
    resumeSummary?: string
  ): Question[] {
    const key = `${role}_${type}`;
    const pool = QUESTION_REPOSITORY[key] || QUESTION_REPOSITORY['Software Engineer_TECHNICAL'];

    const questions: Question[] = [];
    for (let i = 0; i < count; i++) {
      const template = pool[i % pool.length];
      questions.push({
        id: `q-${Date.now()}-${i + 1}`,
        orderIndex: i + 1,
        text: template.text || `Explain your approach to designing scalable and reliable systems in ${techStack[0] || 'modern tech'}.`,
        type,
        difficulty,
        domain: template.domain || 'Core Engineering Fundamentals',
        contextHint: template.contextHint || 'Clarify assumptions, explain trade-offs, and quantify your results.',
        idealAnswer: template.idealAnswer || 'A structured response discussing key requirements, trade-offs, edge cases, and actionable solutions.',
        followUps: []
      });
    }

    return questions;
  }

  static generateFollowUp(
    question: string,
    candidateAnswer: string,
    role: string,
    type: InterviewType
  ): FollowUpQuestion {
    const lower = (candidateAnswer || '').toLowerCase();
    let text = "That's an interesting approach. Could you elaborate on how you would handle failure scenarios or data consistency if one of the underlying nodes crashed?";
    let triggerReason = "Probing for fault tolerance and edge case handling";

    if (type === 'BEHAVIORAL') {
      if (!lower.includes('result') && !lower.includes('percent') && !lower.includes('%') && !lower.includes('metric')) {
        text = "You explained the actions you took well, but what were the quantifiable business or engineering metrics that proved the initiative was a success?";
        triggerReason = "STAR framework: Missing quantifiable Result metric";
      } else {
        text = "Looking back at that scenario, what would you have done differently with the knowledge and experience you have today?";
        triggerReason = "Probing for self-reflection and continuous learning";
      }
    } else if (type === 'TECHNICAL' || type === 'SYSTEM_DESIGN') {
      if (lower.includes('cache') || lower.includes('redis')) {
        text = "You mentioned using caching. How would you prevent cache stampede (thundering herd) and cache penetration for non-existent keys?";
        triggerReason = "Drilling into cache invalidation and stampede mitigation";
      } else if (lower.includes('database') || lower.includes('sql') || lower.includes('nosql')) {
        text = "How would you handle database schema migrations and zero-downtime replication when the table has tens of millions of rows?";
        triggerReason = "Probing for production database operations";
      } else {
        text = "What is the primary bottleneck in this architecture when traffic scales from 1,000 to 100,000 concurrent requests per second?";
        triggerReason = "Testing system scalability limits and bottlenecks";
      }
    }

    return {
      id: `fu-${Date.now()}`,
      questionId: 'active',
      text,
      triggerReason
    };
  }

  static analyzeReport(
    role: TargetRole,
    type: InterviewType,
    questions: Question[],
    totalDurationSeconds: number
  ): FeedbackReport {
    // Combine answers to calculate speech and filler metrics
    const fullTranscript = questions.map(q => q.candidateAnswer || '').join(' ');
    const { total: totalFillers, breakdown: fillerBreakdown } = countFillerWords(fullTranscript);
    const avgWpm = calculateWpm(fullTranscript, totalDurationSeconds > 0 ? totalDurationSeconds : 180);

    // Compute scores based on answer depth, length, and keyword presence
    let technicalScore = 80;
    let starScore = 80;
    let clarityScore = 85;

    const totalWords = fullTranscript.trim().split(/\s+/).filter(Boolean).length;
    if (totalWords < 50) {
      technicalScore = 60;
      clarityScore = 65;
      starScore = 55;
    } else if (totalWords > 250) {
      technicalScore = 88;
      clarityScore = 90;
      starScore = 86;
    }

    // Penalize for excessive filler words
    if (totalFillers > 8) {
      clarityScore = Math.max(50, clarityScore - 12);
    }

    const overallScore = Math.round(
      type === 'BEHAVIORAL' 
        ? (starScore * 0.45 + clarityScore * 0.35 + technicalScore * 0.2)
        : (technicalScore * 0.5 + clarityScore * 0.3 + starScore * 0.2)
    );

    const comparative = questions.map(q => ({
      questionId: q.id,
      questionText: q.text,
      candidateAnswer: q.candidateAnswer || 'No answer recorded for this question.',
      idealAnswer: q.idealAnswer || 'Comprehensive answer covering architecture, trade-offs, and metrics.',
      feedback: (q.candidateAnswer && q.candidateAnswer.length > 80)
        ? 'Good foundational understanding demonstrated. To reach a senior/staff tier, explicitly quantify trade-offs and address edge cases.'
        : 'Answer was brief. Ensure you walk through step-by-step reasoning and clearly explain the underlying data structures.',
      keyOmissions: [
        'Detailed edge-case and failure mode discussion',
        'Specific quantitative performance metrics or SLAs'
      ],
      score: Math.min(95, Math.max(65, overallScore + (q.orderIndex % 2 === 0 ? 3 : -3)))
    }));

    return {
      id: `rep-${Date.now()}`,
      interviewId: `int-${Date.now()}`,
      overallScore,
      technicalAccuracyScore: technicalScore,
      starComplianceScore: starScore,
      speechClarityScore: clarityScore,
      confidenceScore: Math.min(92, Math.max(70, clarityScore - 2)),
      tone: avgWpm > 175 ? 'Rushed' : avgWpm < 110 ? 'Hesitant' : 'Confident',
      wpmAvg: avgWpm || 138,
      fillerWords: fillerBreakdown.length > 0 ? fillerBreakdown : [
        { word: 'like', count: 2 },
        { word: 'um', count: 1 }
      ],
      totalFillerCount: totalFillers,
      strengths: [
        'Structured communication with logical thought progression.',
        'Good grasp of fundamental engineering principles and core trade-offs.',
        'Maintained steady composure and engaged actively with follow-up questions.'
      ],
      improvements: [
        'Quantify results more concretely using specific metrics (latency, QPS, business impact).',
        'Watch filler word frequency when formulating initial thoughts under pressure.',
        'Address failure modes, data consistency, and race conditions earlier in the answer.'
      ],
      comparativeAnalysis: comparative,
      starBreakdown: type === 'BEHAVIORAL' ? {
        situationScore: 88,
        taskScore: 84,
        actionScore: 90,
        resultScore: 78,
        analysis: 'Excellent description of personal actions taken. The result section could be strengthened by citing exact percentage gains or team impact.'
      } : undefined,
      keyTakeaways: [
        'Review distributed caching patterns and lock contention strategies.',
        'Practice framing answers using the Situation -> Task -> Action -> Result format.',
        'Pace speaking rate closer to the optimal 130-150 words per minute sweet spot.'
      ],
      generatedAt: new Date().toISOString()
    };
  }

  static generateSchedulePlan(
    role: TargetRole,
    targetDate: string,
    targetCompany: string,
    currentSkills: string[]
  ): AISchedulePlanResponse {
    const today = new Date();
    const plans = [
      {
        dayNumber: 1,
        date: new Date(today.getTime() + 86400000 * 1).toISOString().split('T')[0],
        focusArea: 'Data Structures & Algorithmic Intuition',
        tasks: [
          { title: 'Practice 2 Medium LeetCode DP & Graph problems', category: 'DSA' as const, durationMinutes: 60, priority: 'HIGH' as const },
          { title: 'Review Time/Space Complexity trade-offs', category: 'STUDY' as const, durationMinutes: 30, priority: 'MEDIUM' as const }
        ]
      },
      {
        dayNumber: 2,
        date: new Date(today.getTime() + 86400000 * 2).toISOString().split('T')[0],
        focusArea: 'Distributed Systems & System Design',
        tasks: [
          { title: 'Live AI Mock: System Design (Rate Limiter / URL Shortener)', category: 'SYSTEM_DESIGN' as const, durationMinutes: 45, priority: 'HIGH' as const },
          { title: 'Study Caching strategies (Write-through vs Write-back, Cache Stampede)', category: 'STUDY' as const, durationMinutes: 40, priority: 'MEDIUM' as const }
        ]
      },
      {
        dayNumber: 3,
        date: new Date(today.getTime() + 86400000 * 3).toISOString().split('T')[0],
        focusArea: 'Behavioral & Leadership Stories (STAR)',
        tasks: [
          { title: 'Prepare 3 STAR stories: Conflict resolution, Production outage, Cross-functional alignment', category: 'BEHAVIORAL' as const, durationMinutes: 45, priority: 'HIGH' as const },
          { title: 'Live AI Mock: Behavioral & Culture Fit Session', category: 'INTERVIEW' as const, durationMinutes: 30, priority: 'HIGH' as const }
        ]
      },
      {
        dayNumber: 4,
        date: new Date(today.getTime() + 86400000 * 4).toISOString().split('T')[0],
        focusArea: 'Active Recovery & Flashcard Review',
        tasks: [
          { title: 'Review Weakness Takeaways from previous mock feedback', category: 'STUDY' as const, durationMinutes: 30, priority: 'LOW' as const },
          { title: 'Light mental recovery & rest day', category: 'REST' as const, durationMinutes: 0, priority: 'LOW' as const }
        ]
      },
      {
        dayNumber: 5,
        date: new Date(today.getTime() + 86400000 * 5).toISOString().split('T')[0],
        focusArea: 'Full Simulation Dry-Run',
        tasks: [
          { title: 'Comprehensive 45-min Voice Mock Interview under realistic time pressure', category: 'INTERVIEW' as const, durationMinutes: 45, priority: 'HIGH' as const },
          { title: 'In-depth Analytics & Speech metric review', category: 'STUDY' as const, durationMinutes: 20, priority: 'MEDIUM' as const }
        ]
      }
    ];

    return {
      planTitle: `${targetCompany || 'Elite Tech'} Preparation Sprint for ${role}`,
      summary: `Targeted 5-day mastery sprint calibrated for ${role} interviews, balancing DSA, high-scale system design, and STAR behavioral narratives.`,
      targetCompany: targetCompany || 'Target Company',
      totalDays: 5,
      dailyPlans: plans
    };
  }
}
