import React from 'react';
import { LiveInterviewRoom } from '@/components/interview/LiveInterviewRoom';

interface PageProps {
  params: {
    id: string;
  };
}

export default function InterviewSessionPage({ params }: PageProps) {
  return <LiveInterviewRoom sessionId={params.id} />;
}
