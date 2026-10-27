'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  Mic2, 
  MessageSquare, 
  TrendingUp, 
  CalendarPlus, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft,
  Zap,
  Target
} from 'lucide-react';
import { FeedbackReport, InterviewSession } from '@/types';
import { useCalendarStore } from '@/lib/store/useCalendarStore';
import confetti from 'canvas-confetti';

interface AnalyticsReportViewProps {
  report: FeedbackReport;
  session?: InterviewSession;
}

export function AnalyticsReportView({ report, session }: AnalyticsReportViewProps) {
  const { addActivity } = useCalendarStore();
  const [selectedQuestionTab, setSelectedQuestionTab] = useState<number>(0);
  const [isAddedToCalendar, setIsAddedToCalendar] = useState<boolean>(false);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';
    return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  };

  const getHireRecommendation = (score: number) => {
    if (score >= 88) return { label: 'STRONG HIRE (L5/Senior Bar)', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
    if (score >= 75) return { label: 'LEANING HIRE (Solid Mid-Level)', color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30' };
    if (score >= 60) return { label: 'BORDERLINE (Needs Practice)', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
    return { label: 'DO NOT HIRE (Significant Gaps)', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' };
  };

  const recommendation = getHireRecommendation(report.overallScore);

  const handleAddRecommendationsToPlanner = () => {
    report.keyTakeaways.forEach((item, idx) => {
      addActivity({
        title: `Practice Drill: ${item}`,
        category: 'Study & Drill',
        priority: idx === 0 ? 'HIGH' : 'MEDIUM',
        status: 'PLANNED',
        targetDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        estimatedMinutes: 30,
      });
    });

    setIsAddedToCalendar(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/analytics"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">AI Performance & Feedback Report</h1>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${recommendation.color}`}>
                {recommendation.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluated on {new Date(report.generatedAt).toLocaleDateString()} • {session?.title || 'Comprehensive Mock Session'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleAddRecommendationsToPlanner}
          disabled={isAddedToCalendar}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition ${
            isAddedToCalendar
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'
          }`}
        >
          <CalendarPlus className="w-4 h-4" />
          <span>{isAddedToCalendar ? 'Added to Daily Tasks!' : 'Add Action Items to Planner'}</span>
        </button>
      </div>

      {/* Top Level Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Score</span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">{report.overallScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${report.overallScore}%` }}
            />
          </div>
        </div>

        {/* Technical Accuracy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Technical Accuracy</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">{report.technicalAccuracyScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${report.technicalAccuracyScore}%` }}
            />
          </div>
        </div>

        {/* Behavioral & STAR Compliance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">STAR Compliance</span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">{report.starComplianceScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${report.starComplianceScore}%` }}
            />
          </div>
        </div>

        {/* Speech Clarity & Tone */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Speech & Delivery</span>
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Mic2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">{report.speechClarityScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Tone: <strong className="text-slate-200">{report.tone}</strong></span>
            <span>Confidence: <strong className="text-cyan-400">{report.confidenceScore}%</strong></span>
          </div>
        </div>
      </div>

      {/* Speech Metrics Deep Dive */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Mic2 className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Acoustic & Speech Delivery Analytics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Speaking Pace (WPM) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="text-xs text-slate-400 font-medium">Speaking Pace</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{report.wpmAvg}</span>
              <span className="text-xs text-slate-400">Words Per Minute</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {report.wpmAvg >= 130 && report.wpmAvg <= 160 ? (
                <span className="text-emerald-400 font-medium">✓ Optimal cadence (130-160 WPM sweet spot)</span>
              ) : report.wpmAvg < 130 ? (
                <span className="text-amber-400 font-medium">Deliberate pace; try picking up rhythm</span>
              ) : (
                <span className="text-amber-400 font-medium">Rapid pacing; slow down for clarity</span>
              )}
            </div>
          </div>

          {/* Filler Word Count */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="text-xs text-slate-400 font-medium">Filler Word Frequency</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{report.totalFillerCount}</span>
              <span className="text-xs text-slate-400">detected instances</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {report.fillerWords.map((item, idx) => (
                <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  &ldquo;{item.word}&rdquo;: {item.count}x
                </span>
              ))}
            </div>
          </div>

          {/* Vocal Confidence & Tone */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="text-xs text-slate-400 font-medium">Vocal Executive Presence</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">{report.tone}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Maintained steady posture and assertive delivery. Minimal nervous vocal fry detected.
            </p>
          </div>
        </div>
      </div>

      {/* Behavioral STAR Breakdown (if available) */}
      {report.starBreakdown && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">STAR Framework Breakdown</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Situation</div>
              <div className="text-xl font-bold text-indigo-400 mt-1">{report.starBreakdown.situationScore}%</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Task</div>
              <div className="text-xl font-bold text-indigo-400 mt-1">{report.starBreakdown.taskScore}%</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Action</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{report.starBreakdown.actionScore}%</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Result (Metrics)</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{report.starBreakdown.resultScore}%</div>
            </div>
          </div>
          <p className="text-xs text-slate-300 italic bg-purple-950/20 p-3 rounded-xl border border-purple-800/30">
            {report.starBreakdown.analysis}
          </p>
        </div>
      )}

      {/* Side-by-Side Comparative Ideal Response vs Candidate Response */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Comparative Answer Breakdown</h2>
          </div>

          {/* Question Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {report.comparativeAnalysis.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedQuestionTab(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedQuestionTab === idx
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Q{idx + 1} ({item.score}%)
              </button>
            ))}
          </div>
        </div>

        {/* Active Question Content */}
        {report.comparativeAnalysis[selectedQuestionTab] && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">Question Prompt</span>
              <p className="text-sm font-medium text-white mt-1">
                {report.comparativeAnalysis[selectedQuestionTab].questionText}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Candidate Response */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Your Transcribed Response</span>
                  <span className="text-xs font-bold text-indigo-400">
                    Score: {report.comparativeAnalysis[selectedQuestionTab].score}%
                  </span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed max-h-56 overflow-y-auto p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  {report.comparativeAnalysis[selectedQuestionTab].candidateAnswer || 'No response recorded.'}
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">AI Critique:</div>
                  <p className="text-xs text-slate-300">{report.comparativeAnalysis[selectedQuestionTab].feedback}</p>
                </div>
              </div>

              {/* Ideal Model Response */}
              <div className="bg-slate-950 border border-emerald-900/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Staff-Level Benchmark Response
                  </span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed max-h-56 overflow-y-auto p-3 bg-slate-900/60 rounded-lg border border-emerald-900/30">
                  {report.comparativeAnalysis[selectedQuestionTab].idealAnswer}
                </div>
                {report.comparativeAnalysis[selectedQuestionTab].keyOmissions?.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold text-amber-400 mb-1">Key Omitted Points to Add Next Time:</div>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                      {report.comparativeAnalysis[selectedQuestionTab].keyOmissions.map((omission, i) => (
                        <li key={i}>{omission}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Strengths & Actionable Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Observed Strengths</h3>
          </div>
          <ul className="space-y-2">
            {report.strengths.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Priority Growth Areas</h3>
          </div>
          <ul className="space-y-2">
            {report.improvements.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
