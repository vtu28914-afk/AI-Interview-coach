import { CandidateProfile, InterviewType, ExperienceLevel, Question } from '../types';

export const PROMPTS = {
  SYSTEM_INTERVIEWER: `You are an elite, highly experienced Senior Engineering Director and Principal Interviewer at a top tier tech company (FAANG / Fortune 500).
Your mission is to conduct realistic, rigorous, yet constructive mock interviews.
You evaluate responses strictly based on industry standards, technical depth, architectural trade-offs, and structured communication (such as the STAR framework for behavioral questions).
Always respond with valid JSON matching the requested schema. Do not output markdown codeblocks around the JSON if JSON format is requested.`,

  generateQuestionsPrompt: (
    role: string,
    type: InterviewType,
    difficulty: ExperienceLevel,
    techStack: string[],
    count: number,
    resumeSummary?: string
  ) => `Generate ${count} distinct, realistic interview questions for a ${difficulty} level ${role}.
Interview Type: ${type}
Candidate Tech Stack: ${techStack.join(', ')}
${resumeSummary ? `Candidate Resume Context: "${resumeSummary}"` : ''}

Requirements:
- For TECHNICAL: Include high-signal architectural or code trade-off questions, algorithm/data structure intuition, or distributed systems problem solving tailored to their tech stack.
- For BEHAVIORAL: Formulate realistic scenario-based questions that test conflict resolution, leadership, failure recovery, or ambiguous requirement handling suitable for the STAR (Situation, Task, Action, Result) method.
- For HR_CULTURE: Focus on company values, collaboration, cross-functional impact, and motivation.
- For SYSTEM_DESIGN: Focus on scalability, latency vs throughput, fault tolerance, caching, and data modeling.

Return a JSON array of questions with this exact structure:
[
  {
    "orderIndex": 1,
    "text": "Detailed question text here",
    "type": "${type}",
    "difficulty": "${difficulty}",
    "domain": "e.g. Distributed Caching / Conflict Resolution / React State",
    "contextHint": "A short hint or tip to guide the candidate on what the interviewer is looking for",
    "idealAnswer": "Comprehensive model answer covering key points, structure, and trade-offs"
  }
]`,

  generateFollowUpPrompt: (
    question: string,
    candidateAnswer: string,
    role: string,
    type: string
  ) => `The candidate was asked:
"${question}"

The candidate provided the following answer:
"${candidateAnswer}"

As an elite interviewer for a ${role} position, formulate ONE sharp, realistic follow-up probing question.
- If their answer was too high-level, drill into edge cases, failure scenarios, or implementation details.
- If it's behavioral, probe for specific metrics, their personal individual contribution vs the team, or what they learned.
- If it's technical, probe for scalability limits, latency trade-offs, or race conditions.

Return JSON in this format:
{
  "text": "The follow-up question text",
  "triggerReason": "Why this follow-up is being asked based on what the candidate mentioned or omitted"
}`,

  generateReportPrompt: (
    role: string,
    type: InterviewType,
    questionsWithAnswers: { question: string; answer: string; ideal: string; followUps?: string[] }[]
  ) => `Analyze the completed interview session for a ${role} candidate (${type} interview).
Transcript & Questions:
${JSON.stringify(questionsWithAnswers, null, 2)}

Provide an in-depth, production-grade assessment.
Evaluate:
1. Technical Accuracy Score (0-100)
2. STAR Compliance Score (0-100)
3. Speech & Communication Clarity Score (0-100)
4. Overall Score (weighted average 0-100)
5. Tone ('Confident' | 'Neutral' | 'Hesitant' | 'Rushed' | 'Monotone')
6. Key Strengths (3-5 bullet points)
7. Concrete Areas for Improvement (3-5 bullet points)
8. Comparative Analysis for each question: Candidate's key points vs what was omitted from the ideal answer, specific feedback, and question score.
${type === 'BEHAVIORAL' ? '9. STAR Breakdown (situationScore, taskScore, actionScore, resultScore, and a summary of how well they structured their narrative).' : ''}
10. Key Takeaways / Next Steps for their practice plan.

Return strictly valid JSON matching this schema:
{
  "overallScore": 85,
  "technicalAccuracyScore": 88,
  "starComplianceScore": 82,
  "speechClarityScore": 86,
  "confidenceScore": 84,
  "tone": "Confident",
  "strengths": ["string", "string", "string"],
  "improvements": ["string", "string", "string"],
  "comparativeAnalysis": [
    {
      "questionText": "string",
      "candidateAnswer": "string",
      "idealAnswer": "string",
      "feedback": "string",
      "keyOmissions": ["point 1", "point 2"],
      "score": 85
    }
  ],
  "starBreakdown": {
    "situationScore": 85,
    "taskScore": 80,
    "actionScore": 90,
    "resultScore": 75,
    "analysis": "string"
  },
  "keyTakeaways": ["string", "string"]
}`,

  generateSchedulePlanPrompt: (
    role: string,
    targetDate: string,
    targetCompany: string,
    currentSkills: string[],
    weaknesses: string[]
  ) => `Create an optimal daily preparation schedule sprint leading up to an interview at ${targetCompany || 'Top Tech Company'} on ${targetDate}.
Candidate Target Role: ${role}
Current Tech Stack: ${currentSkills.join(', ')}
Identified Focus/Weakness Areas: ${weaknesses.join(', ') || 'System Design, DSA, STAR stories'}

Generate a structured daily practice schedule balancing:
- Mock Interviews (Technical, System Design, Behavioral)
- Deep-dive Study Blocks
- DSA / Problem Solving sessions
- Scheduled Rest & Recovery

Return valid JSON:
{
  "planTitle": "Sprint Title",
  "summary": "High-level summary of the preparation strategy",
  "targetCompany": "${targetCompany}",
  "totalDays": 7,
  "dailyPlans": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "focusArea": "e.g. Distributed Systems & Caching",
      "tasks": [
        {
          "title": "Practice 1 System Design Mock: Rate Limiter",
          "category": "SYSTEM_DESIGN",
          "durationMinutes": 45,
          "priority": "HIGH"
        }
      ]
    }
  ]
}`
};
