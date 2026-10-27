import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/backend/src/ai/engine';
import { InterviewType } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, candidateAnswer, role = 'Software Engineer', type = 'TECHNICAL', apiKey } = body;

    if (!question || !candidateAnswer) {
      return NextResponse.json({ success: false, error: 'Question and answer are required' }, { status: 400 });
    }

    const followUp = await AIService.generateFollowUp({
      question,
      candidateAnswer,
      role,
      type: type as InterviewType,
      apiKey
    });

    return NextResponse.json({ success: true, followUp });
  } catch (error: any) {
    console.error('Error generating follow-up:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
