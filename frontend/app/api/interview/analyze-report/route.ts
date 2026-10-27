import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/backend/src/ai/engine';
import { InterviewType, TargetRole, Question } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      role = 'Software Engineer', 
      type = 'TECHNICAL', 
      questions = [] as Question[], 
      totalDurationSeconds = 180,
      apiKey 
    } = body;

    const report = await AIService.analyzeReport({
      role: role as TargetRole,
      type: type as InterviewType,
      questions,
      totalDurationSeconds,
      apiKey
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('Error analyzing interview report:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
