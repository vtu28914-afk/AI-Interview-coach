'use client';

import React from 'react';
import { Flame, Calendar, Sparkles } from 'lucide-react';
import { useUserStore } from '@/lib/store/useUserStore';

export function ActivityHeatmap() {
  const { profile } = useUserStore();

  // Generate 12 weeks of historical activity tiles
  const weeks = 12;
  const daysPerWeek = 7;
  const totalDays = weeks * daysPerWeek;

  // Mock consistent activity distribution
  const activityMatrix: { level: number; dateStr: string }[] = [];
  const now = new Date();

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dayOfWeek = d.getDay();
    // Simulate higher frequency towards recent days
    const rand = (Math.sin(i * 0.4) + 1) / 2;
    let level = 0;
    if (i < 10) level = Math.random() > 0.3 ? 3 : 2;
    else if (rand > 0.6) level = 2;
    else if (rand > 0.3) level = 1;

    activityMatrix.push({
      level,
      dateStr: d.toISOString().split('T')[0],
    });
  }

  const getCellColor = (level: number) => {
    switch (level) {
      case 3:
        return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]';
      case 2:
        return 'bg-emerald-600';
      case 1:
        return 'bg-emerald-900/70 border border-emerald-800/40';
      default:
        return 'bg-slate-900 border border-slate-800/80';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Interview Practice Consistency Heatmap</h2>
            <p className="text-xs text-slate-400">Past 84 days of mock simulations & time-blocked drills</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="font-bold text-emerald-400">{profile.currentStreak} Days</span>
            <span className="text-slate-400">Current</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="font-bold text-indigo-400">{profile.longestStreak} Days</span>
            <span className="text-slate-400">Longest</span>
          </div>
        </div>
      </div>

      {/* Grid Matrix */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1.5 min-w-[650px]">
          {Array.from({ length: weeks }).map((_, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {Array.from({ length: daysPerWeek }).map((_, dIdx) => {
                const cell = activityMatrix[wIdx * 7 + dIdx] || { level: 0, dateStr: '' };
                return (
                  <div
                    key={dIdx}
                    title={`${cell.dateStr}: ${cell.level > 0 ? `${cell.level} sessions` : 'Rest day'}`}
                    className={`w-3.5 h-3.5 rounded-sm transition hover:scale-125 cursor-pointer ${getCellColor(
                      cell.level
                    )}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] text-slate-500">
        <span>Less consistent</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-900 border border-slate-800" />
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-900/70" />
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
        </div>
        <span>High intensity</span>
      </div>
    </div>
  );
}
