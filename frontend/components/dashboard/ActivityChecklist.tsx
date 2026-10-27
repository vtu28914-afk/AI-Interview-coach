'use client';

import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Flame, 
  Sparkles, 
  Clock, 
  Award,
  ListTodo
} from 'lucide-react';
import { useCalendarStore } from '@/lib/store/useCalendarStore';
import { useUserStore } from '@/lib/store/useUserStore';
import confetti from 'canvas-confetti';

export function ActivityChecklist() {
  const { activities, toggleActivityStatus, addActivity, deleteActivity } = useCalendarStore();
  const { profile, incrementStreak } = useUserStore();
  
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('DSA / Coding');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [isAdding, setIsAdding] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivities = activities.filter((a) => a.targetDate === todayStr || !a.targetDate);

  const completedCount = todayActivities.filter((a) => a.status === 'COMPLETED').length;
  const progressPercent = todayActivities.length > 0 ? Math.round((completedCount / todayActivities.length) * 100) : 0;

  const handleToggle = (id: string, currentStatus: string) => {
    toggleActivityStatus(id);
    if (currentStatus !== 'COMPLETED') {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
      });
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addActivity({
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'PLANNED',
      targetDate: todayStr,
      estimatedMinutes: 30,
    });

    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Daily Practice Checklist</h2>
            <p className="text-xs text-slate-400">Today&apos;s interview preparation targets</p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition"
          title="Add new daily task"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar & Counter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Daily Goal Progress</span>
          <span className="text-indigo-400 font-bold">{completedCount} of {todayActivities.length} Done ({progressPercent}%)</span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Add Task Form (collapsible) */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3 animate-in fade-in duration-200">
          <input
            type="text"
            required
            placeholder="e.g. Practice 1 System Design Mock: Distributed Cache"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />

          <div className="flex items-center justify-between gap-2">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300"
            >
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-lg"
              >
                Add Goal
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-2.5">
        {todayActivities.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No goals scheduled for today. Click + to add your first practice item.
          </div>
        ) : (
          todayActivities.map((act) => {
            const isCompleted = act.status === 'COMPLETED';

            return (
              <div
                key={act.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <button
                    onClick={() => handleToggle(act.id, act.status)}
                    className="text-indigo-400 hover:text-indigo-300 shrink-0 transition"
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                    )}
                  </button>

                  <div className="truncate">
                    <span className={`text-xs block truncate ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {act.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                      <span>{act.category}</span>
                      <span>•</span>
                      <span>{act.estimatedMinutes}m</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      act.priority === 'HIGH'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : act.priority === 'MEDIUM'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {act.priority}
                  </span>

                  <button
                    onClick={() => deleteActivity(act.id)}
                    className="text-slate-600 hover:text-rose-400 p-1 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
