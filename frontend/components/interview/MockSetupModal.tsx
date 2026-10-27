'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Mic, 
  Keyboard, 
  Sparkles, 
  Layers, 
  Code2, 
  MessageSquareQuote, 
  Users2, 
  Cpu,
  Loader2
} from 'lucide-react';
import { useUserStore } from '@/lib/store/useUserStore';
import { useInterviewStore } from '@/lib/store/useInterviewStore';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { InterviewType, InterviewMode, ExperienceLevel, TargetRole, InterviewSession } from '@/types';

interface MockSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MockSetupModal({ isOpen, onClose }: MockSetupModalProps) {
  const router = useRouter();
  const { profile } = useUserStore();
  const { startSession } = useInterviewStore();
  const { geminiApiKey, openaiApiKey } = useSettingsStore();

  const [role, setRole] = useState<TargetRole>(profile.targetRole);
  const [type, setType] = useState<InterviewType>('TECHNICAL');
  const [difficulty, setDifficulty] = useState<ExperienceLevel>(profile.experienceLevel);
  const [mode, setMode] = useState<InterviewMode>('VOICE');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStart = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch('/api/interview/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          type,
          difficulty,
          techStack: profile.techStack,
          count: questionCount,
          resumeSummary: profile.resumeSummary,
          apiKey: geminiApiKey || openaiApiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.questions) {
        throw new Error(data.error || 'Failed to generate interview questions');
      }

      const newSession: InterviewSession = {
        id: `int-${Date.now()}`,
        userId: profile.id,
        title: `${difficulty} ${role}: ${type.replace('_', ' ')} Simulation`,
        role,
        type,
        mode,
        status: 'IN_PROGRESS',
        startedAt: new Date().toISOString(),
        durationSeconds: 0,
        questions: data.questions,
      };

      startSession(newSession);
      onClose();
      router.push(`/interview/${newSession.id}`);
    } catch (err: any) {
      console.error('Failed to launch interview session:', err);
      setError(err.message || 'Error creating interview session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-base">Configure AI Mock Interview</h2>
              <p className="text-xs text-slate-400">Customized to your target role and resume context</p>
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
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Interview Type */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 block uppercase tracking-wider">
              Interview Track
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'TECHNICAL', label: 'Technical & DSA', desc: 'Code architecture & fundamentals', icon: Code2 },
                { id: 'BEHAVIORAL', label: 'Behavioral (STAR)', desc: 'Conflict, leadership, ownership', icon: MessageSquareQuote },
                { id: 'SYSTEM_DESIGN', label: 'System Design', desc: 'Scalability, microservices, caches', icon: Cpu },
                { id: 'HR_CULTURE', label: 'HR & Culture Fit', desc: 'Values, team fit, alignment', icon: Users2 },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as InterviewType)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-sm ring-1 ring-indigo-500/50'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span className="font-medium text-xs text-white">{item.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode: Voice vs Text */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 block uppercase tracking-wider">
              Interview Interaction Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('VOICE')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  mode === 'VOICE'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500/50'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${mode === 'VOICE' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Mic className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-white">Voice & Speech</div>
                  <div className="text-[11px] text-slate-400">Live speech recognition & audio wave</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('TEXT')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  mode === 'TEXT'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500/50'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${mode === 'TEXT' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Keyboard className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-white">Interactive Text</div>
                  <div className="text-[11px] text-slate-400">Type responses with live timer</div>
                </div>
              </button>
            </div>
          </div>

          {/* Difficulty & Question Count */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Seniority Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as ExperienceLevel)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="JUNIOR">Junior (0-2 years)</option>
                <option value="MID">Mid-Level (3-5 years)</option>
                <option value="SENIOR">Senior (5-8 years)</option>
                <option value="STAFF">Lead / Staff (8+ years)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Number of Questions</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value={2}>2 Questions (Quick 10m drill)</option>
                <option value={3}>3 Questions (Standard 20m)</option>
                <option value={5}>5 Questions (Comprehensive 40m)</option>
              </select>
            </div>
          </div>

          {/* Candidate Context Pill */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Context: <span className="text-slate-200 font-medium">{profile.targetRole}</span></span>
            <span className="text-slate-400">Tech: <span className="text-indigo-400 font-medium">{profile.techStack.slice(0, 3).join(', ')}...</span></span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleStart}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating AI Session...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Mock Session</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
