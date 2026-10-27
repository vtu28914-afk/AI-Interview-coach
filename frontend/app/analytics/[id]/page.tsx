'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useInterviewStore } from '@/lib/store/useInterviewStore';
import { AnalyticsReportView } from '@/components/analytics/AnalyticsReportView';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: {
    id: string;
  };
}

export default function DetailedReportPage({ params }: PageProps) {
  const { pastSessions, activeSession } = useInterviewStore();

  // Find report across past sessions or current active session
  let matchedReport = null;
  let matchedSession = null;

  if (activeSession && activeSession.feedback?.id === params.id) {
    matchedReport = activeSession.feedback;
    matchedSession = activeSession;
  } else {
    for (const session of pastSessions) {
      if (session.feedback && (session.feedback.id === params.id || session.id === params.id)) {
        matchedReport = session.feedback;
        matchedSession = session;
        break;
      }
    }
  }

  // Fallback to first available report if ID not exact
  if (!matchedReport && pastSessions.length > 0 && pastSessions[0].feedback) {
    matchedReport = pastSessions[0].feedback;
    matchedSession = pastSessions[0];
  }

  if (!matchedReport) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 min-h-[60vh] flex flex-col justify-center items-center">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <h2 className="text-xl font-bold text-white">Evaluation Report Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested evaluation report could not be found or has not been generated yet.
        </p>
        <Link
          href="/analytics"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          Return to Analytics Hub
        </Link>
      </div>
    );
  }

  return <AnalyticsReportView report={matchedReport} session={matchedSession || undefined} />;
}
