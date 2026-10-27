'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Award, 
  Flame, 
  Zap, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight
} from 'lucide-react';
import { useUserStore } from '@/lib/store/useUserStore';
import { useInterviewStore } from '@/lib/store/useInterviewStore';
import { useCalendarStore } from '@/lib/store/useCalendarStore';
import { ActivityChecklist } from '@/components/dashboard/ActivityChecklist';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { MockSetupModal } from '@/components/interview/MockSetupModal';
import { AIScheduleModal } from '@/components/calendar/AIScheduleModal';

export default function DashboardPage() {
  const { profile } = useUserStore();
  const { pastSessions } = useInterviewStore();
  const { events } = useCalendarStore();
  
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Filter upcoming planned events
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = events
    .filter((e) => e.date >= todayStr && e.status === 'PLANNED')
    .slice(0, 4);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Target Role: {profile.targetRole} ({profile.experienceLevel} Tier)</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {profile.name} 👋
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your current interview readiness index is <strong className="text-emerald-400 font-bold">{profile.averageScore}%</strong>. 
            You are on a <strong className="text-amber-400 font-bold">{profile.currentStreak}-day practice streak</strong>. 
            Keep the momentum going with today&apos;s scheduled drills!
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsMockModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Quick Mock</span>
            </button>

            <button
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Schedule Assistant</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
      </div>

      {/* 4 Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Readiness Index */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Readiness Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{profile.averageScore}%</span>
            <span className="text-xs text-emerald-400 font-semibold">+4.2% this wk</span>
          </div>
          <div className="mt-3 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${profile.averageScore}%` }} />
          </div>
        </div>

        {/* Completed Mocks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Mocks</span>
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{profile.totalInterviews}</span>
            <span className="text-xs text-slate-400">sessions</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            All scored with AI feedback
          </div>
        </div>

        {/* Current Daily Streak */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Streak</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400/20" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">{profile.currentStreak}</span>
            <span className="text-xs text-slate-400">Days Active 🔥</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Personal record: {profile.longestStreak} days
          </div>
        </div>

        {/* Resume Match & Target Date */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Interview</span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-white truncate">
            {profile.targetInterviewDate || 'Oct 5, 2026'}
          </div>
          <div className="text-[11px] text-purple-300 mt-2 truncate">
            {profile.resumeFileName || 'Resume parsed & active'}
          </div>
        </div>
      </div>

      {/* Main Grid: Activity Checklist (Left) & Upcoming Calendar Schedule (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Daily Activity Checklist (7 cols) */}
        <div className="lg:col-span-7">
          <ActivityChecklist />
        </div>

        {/* Right: Upcoming Sessions Time-Block Widget (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Upcoming Time-Blocks</h2>
            </div>
            <Link
              href="/calendar"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
            >
              <span>View Full Grid</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No upcoming sessions. Click to schedule a practice block.
              </div>
            ) : (
              upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between"
                >
                  <div className="overflow-hidden pr-2">
                    <span className="text-xs font-semibold text-white block truncate">{evt.title}</span>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                      <span>{evt.date}</span>
                      <span>•</span>
                      <span>{evt.startTime} - {evt.endTime}</span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 font-medium">
                    {evt.category.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* GitHub-style Consistency Activity Heatmap */}
      <ActivityHeatmap />

      {/* Recent Past Interview Evaluations */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Recent Interview Feedback Reports</h2>
          </div>
          <Link
            href="/analytics"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>All Reports</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pastSessions.slice(0, 2).map((session) => (
            <div
              key={session.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                    {session.type.replace('_', ' ')}
                  </span>
                  <h3 className="text-xs font-semibold text-white mt-1.5">{session.title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold text-emerald-400">{session.overallScore || 85}%</div>
                  <span className="text-[10px] text-slate-500">Score</span>
                </div>
              </div>

              {session.feedback && (
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {session.feedback.strengths[0]}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-500 text-[11px]">
                  {new Date(session.startedAt).toLocaleDateString()} • {Math.round(session.durationSeconds / 60)} min
                </span>
                <Link
                  href={session.feedback ? `/analytics/${session.feedback.id}` : `/analytics`}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs flex items-center gap-1"
                >
                  <span>Review Deep Dive</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <MockSetupModal isOpen={isMockModalOpen} onClose={() => setIsMockModalOpen(false)} />
      <AIScheduleModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
    </div>
  );
}
