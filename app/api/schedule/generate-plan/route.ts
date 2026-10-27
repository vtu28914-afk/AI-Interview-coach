import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/backend/src/ai/engine';
import { TargetRole } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      role = 'Software Engineer', 
      targetDate = '', 
      targetCompany = 'Top Tech Co', 
      currentSkills = ['React', 'Node.js', 'System Design'],
      weaknesses = ['STAR method', 'Distributed Systems'],
      apiKey 
    } = body;

    const plan = await AIService.generateSchedulePlan({
      role: role as TargetRole,
      targetDate,
      targetCompany,
      currentSkills,
      weaknesses,
      apiKey
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error('Error generating schedule plan:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
