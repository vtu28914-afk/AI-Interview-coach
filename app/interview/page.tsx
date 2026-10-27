'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Code2, 
  MessageSquareQuote, 
  Cpu, 
  Users2, 
  Sparkles, 
  Clock, 
  Award, 
  ArrowRight,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { useInterviewStore } from '@/lib/store/useInterviewStore';
import { useUserStore } from '@/lib/store/useUserStore';
import { MockSetupModal } from '@/components/interview/MockSetupModal';
import { InterviewType } from '@/types';

export default function InterviewHubPage() {
  const { pastSessions } = useInterviewStore();
  const { profile } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tracks = [
    {
      type: 'TECHNICAL',
      title: 'Technical & DSA Interview',
      description: 'Algorithm intuition, time/space complexity trade-offs, code architecture, and debugging.',
      icon: Code2,
      badge: 'High Signal',
      color: 'from-blue-600/20 to-indigo-600/20 border-indigo-500/30',
      iconColor: 'text-indigo-400',
    },
    {
      type: 'BEHAVIORAL',
      title: 'Behavioral & STAR Stories',
      description: 'Conflict resolution, leadership under pressure, failure ownership, and cross-functional influence.',
      icon: MessageSquareQuote,
      badge: 'STAR Framework',
      color: 'from-purple-600/20 to-pink-600/20 border-purple-500/30',
      iconColor: 'text-purple-400',
    },
    {
      type: 'SYSTEM_DESIGN',
      title: 'Distributed System Design',
      description: 'High-throughput architecture, microservices, database sharding, caching, and rate limiters.',
      icon: Cpu,
      badge: 'Senior/Staff Bar',
      color: 'from-amber-600/20 to-orange-600/20 border-amber-500/30',
      iconColor: 'text-amber-400',
    },
    {
      type: 'HR_CULTURE',
      title: 'HR & Executive Culture Fit',
      description: 'Company values alignment, salary negotiation scenarios, team motivation, and career trajectory.',
      icon: Users2,
      badge: 'Culture Fit',
      color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Mock Interview Studio</h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate high-pressure FAANG/Enterprise interviews with real-time speech recognition, webcam preview, and dynamic follow-up questioning.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Launch Custom Mock Session</span>
        </button>
      </div>

      {/* 4 Interactive Tracks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tracks.map((track) => {
          const Icon = track.icon;
          return (
            <div
              key={track.type}
              className={`p-6 rounded-2xl border bg-gradient-to-br ${track.color} bg-slate-900 shadow-xl space-y-4 relative overflow-hidden transition-all hover:border-slate-600`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 ${track.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{track.title}</h2>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-950/60 border border-slate-700 text-slate-300">
                      {track.badge}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{track.description}</p>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Target: <strong className="text-slate-200">{profile.targetRole}</strong>
                </span>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 text-white text-xs font-semibold border border-slate-700 transition"
                >
                  <span>Configure & Start</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Past Mock Interview Sessions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Interview Session History</h2>
          </div>
          <span className="text-xs text-slate-400">{pastSessions.length} total sessions recorded</span>
        </div>

        <div className="space-y-3">
          {pastSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {session.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(session.startedAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-slate-500">• {session.mode} Mode</span>
                </div>
                <h3 className="text-sm font-semibold text-white">{session.title}</h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-400">{session.overallScore || 85}%</div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Evaluation</span>
                </div>

                <Link
                  href={session.feedback ? `/analytics/${session.feedback.id}` : `/analytics`}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 transition"
                >
                  <span>View Feedback</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MockSetupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
