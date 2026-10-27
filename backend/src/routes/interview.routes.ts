import { Router, Request, Response } from 'express';
import { AIService } from '../ai/engine';
import { InterviewType, ExperienceLevel, TargetRole } from '../types';

const router = Router();

// POST /api/interview/generate-questions
router.post('/generate-questions', async (req: Request, res: Response) => {
  try {
    const { 
      role = 'Software Engineer', 
      type = 'TECHNICAL', 
      difficulty = 'MID', 
      techStack = ['React', 'Node.js', 'PostgreSQL'], 
      count = 3, 
      resumeSummary = '',
      apiKey
    } = req.body;

    const questions = await AIService.generateQuestions({
      role: role as TargetRole,
      type: type as InterviewType,
      difficulty: difficulty as ExperienceLevel,
      techStack,
      count,
      resumeSummary,
      apiKey
    });

    return res.json({ success: true, questions });
  } catch (error: any) {
    console.error('Error generating questions in backend:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/interview/follow-up
router.post('/follow-up', async (req: Request, res: Response) => {
  try {
    const { question, candidateAnswer, role = 'Software Engineer', type = 'TECHNICAL', apiKey } = req.body;

    if (!question || !candidateAnswer) {
      return res.status(400).json({ success: false, error: 'Question and answer are required' });
    }

    const followUp = await AIService.generateFollowUp({
      question,
      candidateAnswer,
      role,
      type: type as InterviewType,
      apiKey
    });

    return res.json({ success: true, followUp });
  } catch (error: any) {
    console.error('Error generating follow-up in backend:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/interview/analyze-report
router.post('/analyze-report', async (req: Request, res: Response) => {
  try {
    const { 
      role = 'Software Engineer', 
      type = 'TECHNICAL', 
      questions = [], 
      totalDurationSeconds = 180,
      apiKey 
    } = req.body;

    const report = await AIService.analyzeReport({
      role: role as TargetRole,
      type: type as InterviewType,
      questions,
      totalDurationSeconds,
      apiKey
    });

    return res.json({ success: true, report });
  } catch (error: any) {
    console.error('Error analyzing interview report in backend:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
