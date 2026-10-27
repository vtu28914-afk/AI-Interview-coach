'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Award, 
  Zap, 
  Target, 
  Mic2, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useInterviewStore } from '@/lib/store/useInterviewStore';
import { useUserStore } from '@/lib/store/useUserStore';
import { AnalyticsReportView } from '@/components/analytics/AnalyticsReportView';

export default function AnalyticsHubPage() {
  const { pastSessions } = useInterviewStore();
  const { profile } = useUserStore();

  const latestSession = pastSessions[0];
  const latestReport = latestSession?.feedback;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Performance & Speech Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track metrics across technical depth, STAR framework compliance, speaking cadence (WPM), and filler word counts.
          </p>
        </div>

        {latestReport && (
          <Link
            href={`/analytics/${latestReport.id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition"
          >
            <span>View Latest Session Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Aggregate Performance Trends Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Readiness</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{profile.averageScore}%</div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">Consistent L5 Senior Engineering Bar</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Technical Accuracy</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-400">88%</div>
          <p className="text-[11px] text-slate-400 mt-1">Strong in Caching & Architecture</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">STAR Compliance</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-400">82%</div>
          <p className="text-[11px] text-slate-400 mt-1">Well-defined Actions & Prototypes</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Vocal Pace</span>
            <Mic2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">142 <span className="text-xs font-normal text-slate-400">WPM</span></div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">Inside optimal conversational zone</p>
        </div>
      </div>

      {/* Featured Deep Dive of Most Recent Session */}
      {latestReport ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Latest Evaluated Session</h2>
            <span className="text-xs text-slate-400">Session ID: {latestSession.id}</span>
          </div>
          <AnalyticsReportView report={latestReport} session={latestSession} />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <BarChart3 className="w-10 h-10 mx-auto text-indigo-400" />
          <h3 className="text-base font-bold text-white">No Evaluation Reports Yet</h3>
          <p className="text-xs max-w-sm mx-auto">
            Complete your first AI mock interview session to unlock detailed metrics, comparative ideal answers, and speech analysis.
          </p>
          <Link
            href="/interview"
            className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Start Your First Mock
          </Link>
        </div>
      )}

      {/* All Past Sessions History List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white">All Evaluated Mock Sessions</h2>
        <div className="space-y-2.5">
          {pastSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {session.type.replace('_', ' ')}
                </span>
                <h4 className="text-xs font-semibold text-white mt-1">{session.title}</h4>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {new Date(session.startedAt).toLocaleDateString()} • {session.questions.length} questions • {session.mode} mode
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-emerald-400">{session.overallScore || 85}%</span>
                {session.feedback && (
                  <Link
                    href={`/analytics/${session.feedback.id}`}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
