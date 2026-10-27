'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  Download, 
  Plus, 
  CheckCircle, 
  Circle, 
  AlertCircle,
  Trash2,
  Filter
} from 'lucide-react';
import { useCalendarStore } from '@/lib/store/useCalendarStore';
import { CalendarEvent, EventCategory, EventStatus } from '@/types';
import { AIScheduleModal } from './AIScheduleModal';

const CATEGORY_COLORS: Record<EventCategory, { border: string; bg: string; text: string; dot: string }> = {
  INTERVIEW: { border: 'border-indigo-500/40', bg: 'bg-indigo-500/10', text: 'text-indigo-300', dot: 'bg-indigo-400' },
  STUDY: { border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-300', dot: 'bg-purple-400' },
  DSA: { border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', text: 'text-cyan-300', dot: 'bg-cyan-400' },
  SYSTEM_DESIGN: { border: 'border-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-300', dot: 'bg-amber-400' },
  BEHAVIORAL: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  REST: { border: 'border-slate-500/40', bg: 'bg-slate-500/10', text: 'text-slate-300', dot: 'bg-slate-400' },
};

export function CalendarView() {
  const { 
    events, 
    selectedDate, 
    setSelectedDate, 
    viewMode, 
    setViewMode, 
    filterCategory, 
    setFilterCategory,
    updateEventStatus,
    deleteEvent,
    addEvent,
    exportToICS 
  } = useCalendarStore();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState<boolean>(false);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EventCategory>('INTERVIEW');
  const [newStartTime, setNewStartTime] = useState('10:00');
  const [newEndTime, setNewEndTime] = useState('11:00');
  const [newDescription, setNewDescription] = useState('');

  // Month navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const prevMonthDate = new Date(year, month - 1, day);
    days.push({
      dateStr: prevMonthDate.toISOString().split('T')[0],
      dayNum: day,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    days.push({
      dateStr: dStr,
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // Next month padding to fill 35 or 42 slots
  const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(year, month + 1, d);
    days.push({
      dateStr: nextDate.toISOString().split('T')[0],
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (filterCategory !== 'ALL' && e.category !== filterCategory) return false;
    return true;
  });

  const selectedDayEvents = filteredEvents.filter((e) => e.date === selectedDate);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addEvent({
      title: newTitle.trim(),
      description: newDescription,
      category: newCategory,
      status: 'PLANNED',
      date: selectedDate,
      startTime: newStartTime,
      endTime: newEndTime,
      durationMinutes: 60,
    });

    setNewTitle('');
    setNewDescription('');
    setIsNewEventModalOpen(false);
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Interview & Daily Preparation Calendar</h1>
          <p className="text-xs text-slate-400">Schedule mock interviews, time-blocked study sprints, and track consistency</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Assistant CTA */}
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Schedule Assistant</span>
          </button>

          {/* New Event Button */}
          <button
            onClick={() => setIsNewEventModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold hover:border-slate-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>

          {/* Export to ICS */}
          <button
            onClick={exportToICS}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold hover:border-slate-700 transition"
            title="Export calendar to Google Calendar / Outlook .ics"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export .ICS</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills & View Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'INTERVIEW', 'DSA', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'REST'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat as any)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'All Events' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* View mode buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['month', 'week', 'day'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${
                viewMode === m ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Main Calendar Layout: 2 Columns on desktop (Calendar Grid on left, Day Time-Blocking on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          {/* Month Header with Prev/Next */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">{monthName}</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 pb-2 border-b border-slate-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((dayItem, idx) => {
              const dayEvents = filteredEvents.filter((e) => e.date === dayItem.dateStr);
              const isSelected = selectedDate === dayItem.dateStr;
              const isToday = dayItem.dateStr === new Date().toISOString().split('T')[0];

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(dayItem.dateStr)}
                  className={`min-h-[85px] p-2 rounded-xl text-left flex flex-col justify-between transition-all border ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50'
                      : isToday
                      ? 'bg-slate-950/90 border-slate-700'
                      : dayItem.isCurrentMonth
                      ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-950/20 border-transparent opacity-40 hover:opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-semibold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]'
                          : dayItem.isCurrentMonth
                          ? 'text-slate-200'
                          : 'text-slate-500'
                      }`}
                    >
                      {dayItem.dayNum}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event Chips */}
                  <div className="space-y-1 mt-1 w-full overflow-hidden">
                    {dayEvents.slice(0, 2).map((evt) => {
                      const color = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.INTERVIEW;
                      return (
                        <div
                          key={evt.id}
                          className={`text-[10px] truncate px-1.5 py-0.5 rounded border ${color.border} ${color.bg} ${color.text} flex items-center gap-1`}
                        >
                          <span className={`w-1 h-1 rounded-full ${color.dot} shrink-0`} />
                          <span className="truncate">{evt.title}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-slate-500 font-medium px-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Time-Blocking & Details (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Time-Blocking</span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </h3>
            </div>

            <button
              onClick={() => setIsNewEventModalOpen(true)}
              className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition"
              title="Add event for this day"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Day's Event Slots */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">No time-blocked sessions for this day.</p>
                <button
                  onClick={() => setIsNewEventModalOpen(true)}
                  className="text-xs text-indigo-400 hover:underline font-medium"
                >
                  Schedule a practice block
                </button>
              </div>
            ) : (
              selectedDayEvents.map((evt) => {
                const color = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.INTERVIEW;
                const isCompleted = evt.status === 'COMPLETED';

                return (
                  <div
                    key={evt.id}
                    className={`p-3.5 rounded-xl border ${color.border} ${color.bg} transition-all space-y-2`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${color.text} border ${color.border}`}>
                            {evt.category.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-semibold text-white">{evt.title}</span>
                        </div>
                        {evt.description && (
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{evt.description}</p>
                        )}
                      </div>

                      <button
                        onClick={() => deleteEvent(evt.id)}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{evt.startTime} - {evt.endTime} ({evt.durationMinutes}m)</span>
                      </div>

                      {/* Status Toggle */}
                      <button
                        onClick={() => {
                          const nextStatus: EventStatus =
                            evt.status === 'PLANNED' ? 'COMPLETED' : evt.status === 'COMPLETED' ? 'MISSED' : 'PLANNED';
                          updateEventStatus(evt.id, nextStatus);
                        }}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition ${
                          evt.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : evt.status === 'MISSED'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {evt.status}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* AI Schedule Generator Modal */}
      <AIScheduleModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />

      {/* Manual New Event Modal */}
      {isNewEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleCreateEvent} className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Schedule Time-Block Event</h3>
            
            <div>
              <label className="text-xs text-slate-400 block mb-1">Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. System Design Mock: Redis Architecture"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as EventCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="INTERVIEW">Interview Mock</option>
                  <option value="DSA">DSA / LeetCode</option>
                  <option value="SYSTEM_DESIGN">System Design</option>
                  <option value="BEHAVIORAL">Behavioral STAR</option>
                  <option value="STUDY">Study Block</option>
                  <option value="REST">Rest & Recovery</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Start Time</label>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">End Time</label>
                <input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Description (Optional)</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Key goals or topics to cover during this slot"
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNewEventModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Create Time-Block
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
