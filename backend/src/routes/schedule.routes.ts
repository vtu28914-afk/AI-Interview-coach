import { Router, Request, Response } from 'express';
import { AIService } from '../ai/engine';
import { TargetRole } from '../types';

const router = Router();

// POST /api/schedule/generate-plan
router.post('/generate-plan', async (req: Request, res: Response) => {
  try {
    const { 
      role = 'Software Engineer', 
      targetDate = '', 
      targetCompany = 'Top Tech Co', 
      currentSkills = ['React', 'Node.js', 'System Design'],
      weaknesses = ['STAR method', 'Distributed Systems'],
      apiKey 
    } = req.body;

    const plan = await AIService.generateSchedulePlan({
      role: role as TargetRole,
      targetDate,
      targetCompany,
      currentSkills,
      weaknesses,
      apiKey
    });

    return res.json({ success: true, plan });
  } catch (error: any) {
    console.error('Error generating schedule plan in backend:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
