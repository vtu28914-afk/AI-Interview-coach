'use client';

import React, { useState } from 'react';
import { Sparkles, Play, Calendar, Bell, ShieldCheck } from 'lucide-react';
import { useUserStore } from '@/lib/store/useUserStore';
import { MockSetupModal } from '@/components/interview/MockSetupModal';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { profile } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <>
      <header className="h-16 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
        <div>
          {title ? (
            <div>
              <h1 className="text-lg font-semibold text-white tracking-tight">{title}</h1>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                AI Interview System Active
              </span>
              <span className="text-xs text-slate-400">Target Role: <strong className="text-slate-200">{profile.targetRole}</strong></span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Target Interview Date Countdown */}
          {profile.targetInterviewDate && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target: <strong className="text-white">{profile.targetInterviewDate}</strong></span>
            </div>
          )}

          {/* Quick Action CTA */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Quick Mock</span>
          </button>
        </div>
      </header>

      {/* Global Setup Modal */}
      <MockSetupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
