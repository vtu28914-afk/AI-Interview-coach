import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/backend/src/ai/engine';
import { InterviewType, ExperienceLevel, TargetRole } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      role = 'Software Engineer', 
      type = 'TECHNICAL', 
      difficulty = 'MID', 
      techStack = ['React', 'Node.js', 'PostgreSQL'], 
      count = 3, 
      resumeSummary = '',
      apiKey
    } = body;

    const questions = await AIService.generateQuestions({
      role: role as TargetRole,
      type: type as InterviewType,
      difficulty: difficulty as ExperienceLevel,
      techStack,
      count,
      resumeSummary,
      apiKey
    });

    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    console.error('Error generating questions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
