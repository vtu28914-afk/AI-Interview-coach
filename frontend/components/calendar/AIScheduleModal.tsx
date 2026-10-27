'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Target
} from 'lucide-react';
import { useUserStore } from '@/lib/store/useUserStore';
import { useCalendarStore } from '@/lib/store/useCalendarStore';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { AISchedulePlanResponse } from '@/types';
import confetti from 'canvas-confetti';

interface AIScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIScheduleModal({ isOpen, onClose }: AIScheduleModalProps) {
  const { profile, updateProfile } = useUserStore();
  const { applyAISchedulePlan } = useCalendarStore();
  const { geminiApiKey, openaiApiKey } = useSettingsStore();

  const [targetCompany, setTargetCompany] = useState<string>('Google');
  const [targetDate, setTargetDate] = useState<string>(
    profile.targetInterviewDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [weaknesses, setWeaknesses] = useState<string>('System Design, Behavioral STAR, Dynamic Programming');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<AISchedulePlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch('/api/schedule/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: profile.targetRole,
          targetDate,
          targetCompany,
          currentSkills: profile.techStack,
          weaknesses: weaknesses.split(',').map((s) => s.trim()),
          apiKey: geminiApiKey || openaiApiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.plan) {
        throw new Error(data.error || 'Failed to generate study schedule');
      }

      setGeneratedPlan(data.plan);
    } catch (err: any) {
      console.error('Error generating schedule plan:', err);
      setError(err.message || 'Error generating schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedPlan) return;
    applyAISchedulePlan(generatedPlan);
    updateProfile({ targetInterviewDate: targetDate });

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-base">AI Schedule & Preparation Assistant</h2>
              <p className="text-xs text-slate-400">Personalized daily study sprints tailored to your upcoming interview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {!generatedPlan ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Target Company</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      placeholder="e.g. Google, Amazon, Meta, Stripe"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Target Interview Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                  Priority Focus Areas / Weaknesses
                </label>
                <input
                  type="text"
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  placeholder="e.g. Distributed Caching, STAR stories, Graph algorithms"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Separate multiple topics with commas</p>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-800/30 text-xs text-indigo-300 space-y-1">
                <div className="font-semibold text-indigo-200 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>How the AI Assistant plans your schedule:</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  It calculates the days remaining, balances technical deep-dives, time-blocked mock interviews, and scheduled rest days to maximize retention and prevent burnout.
                </p>
              </div>
            </div>
          ) : (
            /* Generated Plan Preview */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{generatedPlan.planTitle}</span>
                  <span className="text-xs text-slate-400 font-medium">{generatedPlan.totalDays} Days Sprint</span>
                </div>
                <p className="text-xs text-slate-300">{generatedPlan.summary}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Scheduled Daily Blocks:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {generatedPlan.dailyPlans.map((day) => (
                    <div key={day.dayNumber} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">Day {day.dayNumber} ({day.date})</span>
                        <span className="text-indigo-400 text-[11px] font-medium">{day.focusArea}</span>
                      </div>
                      <div className="space-y-1">
                        {day.tasks.map((t, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300 px-2 py-1 rounded bg-slate-900/50">
                            <span>• {t.title}</span>
                            <span className="text-slate-500">{t.durationMinutes} min</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          {!generatedPlan ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGenerate}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Generate AI Study Sprint</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Apply Plan to Calendar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
