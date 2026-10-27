import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CalendarEvent, DailyActivity, EventCategory, EventStatus, AISchedulePlanResponse } from '@/types';

interface CalendarState {
  events: CalendarEvent[];
  activities: DailyActivity[];
  selectedDate: string; // YYYY-MM-DD
  viewMode: 'month' | 'week' | 'day';
  filterCategory: EventCategory | 'ALL';
  setViewMode: (mode: 'month' | 'week' | 'day') => void;
  setSelectedDate: (date: string) => void;
  setFilterCategory: (category: EventCategory | 'ALL') => void;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEventStatus: (id: string, status: EventStatus) => void;
  deleteEvent: (id: string) => void;
  addActivity: (activity: Omit<DailyActivity, 'id'>) => void;
  toggleActivityStatus: (id: string) => void;
  deleteActivity: (id: string) => void;
  applyAISchedulePlan: (plan: AISchedulePlanResponse) => void;
  exportToICS: () => void;
}

const getTodayStr = () => new Date().toISOString().split('T')[0];

const getFutureDateStr = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const INITIAL_ACTIVITIES: DailyActivity[] = [
  {
    id: 'act-1',
    title: 'Complete 1 System Design Mock: Distributed Rate Limiter',
    category: 'Mock Interview',
    priority: 'HIGH',
    status: 'COMPLETED',
    targetDate: getTodayStr(),
    estimatedMinutes: 45,
    completedAt: new Date().toISOString(),
  },
  {
    id: 'act-2',
    title: 'Review LeetCode Top 50 Dynamic Programming Patterns',
    category: 'Coding / DSA',
    priority: 'HIGH',
    status: 'PLANNED',
    targetDate: getTodayStr(),
    estimatedMinutes: 60,
  },
  {
    id: 'act-3',
    title: 'Practice 2 STAR stories: Handling conflict & Production Outage',
    category: 'Behavioral',
    priority: 'MEDIUM',
    status: 'PLANNED',
    targetDate: getTodayStr(),
    estimatedMinutes: 30,
  },
  {
    id: 'act-4',
    title: 'Review Cache Invalidation & CAP Theorem Flashcards',
    category: 'System Design',
    priority: 'LOW',
    status: 'COMPLETED',
    targetDate: getTodayStr(),
    estimatedMinutes: 20,
    completedAt: new Date().toISOString(),
  },
];

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Live AI Mock: Full-Stack Architecture',
    description: '45-minute technical simulation with live audio waveform & follow-ups',
    category: 'INTERVIEW',
    status: 'COMPLETED',
    date: getTodayStr(),
    startTime: '10:00',
    endTime: '11:00',
    durationMinutes: 60,
  },
  {
    id: 'evt-2',
    title: 'DSA Time-Block: Graph BFS/DFS & Dijkstra',
    description: 'Deep dive into graph traversal questions and cycle detection',
    category: 'DSA',
    status: 'PLANNED',
    date: getTodayStr(),
    startTime: '14:30',
    endTime: '16:00',
    durationMinutes: 90,
  },
  {
    id: 'evt-3',
    title: 'Behavioral Mock: STAR Story Drill',
    description: 'Focus on quantifying results and pacing under 150 WPM',
    category: 'BEHAVIORAL',
    status: 'PLANNED',
    date: getFutureDateStr(1),
    startTime: '11:00',
    endTime: '12:00',
    durationMinutes: 60,
  },
  {
    id: 'evt-4',
    title: 'System Design: Design WhatsApp / Messaging Queue',
    description: 'WebSocket connections, message ordering, and presence service',
    category: 'SYSTEM_DESIGN',
    status: 'PLANNED',
    date: getFutureDateStr(2),
    startTime: '15:00',
    endTime: '16:30',
    durationMinutes: 90,
  },
  {
    id: 'evt-5',
    title: 'Target Company Screening Call',
    description: 'Real-world 30-min recruiter phone interview',
    category: 'INTERVIEW',
    status: 'PLANNED',
    date: getFutureDateStr(4),
    startTime: '16:00',
    endTime: '16:45',
    durationMinutes: 45,
  },
  {
    id: 'evt-6',
    title: 'Active Recovery & Mindful Rest',
    description: 'Zero screen time, light walk, mental replenishment',
    category: 'REST',
    status: 'PLANNED',
    date: getFutureDateStr(5),
    startTime: '09:00',
    endTime: '18:00',
    durationMinutes: 540,
  }
];

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: INITIAL_EVENTS,
      activities: INITIAL_ACTIVITIES,
      selectedDate: getTodayStr(),
      viewMode: 'month',
      filterCategory: 'ALL',

      setViewMode: (viewMode) => set({ viewMode }),
      setSelectedDate: (selectedDate) => set({ selectedDate }),
      setFilterCategory: (filterCategory) => set({ filterCategory }),

      addEvent: (eventData) =>
        set((state) => ({
          events: [
            ...state.events,
            { ...eventData, id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` },
          ],
        })),

      updateEventStatus: (id, status) =>
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, status } : e)),
        })),

      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),

      addActivity: (activityData) =>
        set((state) => ({
          activities: [
            ...state.activities,
            { ...activityData, id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` },
          ],
        })),

      toggleActivityStatus: (id) =>
        set((state) => ({
          activities: state.activities.map((a) => {
            if (a.id !== id) return a;
            const newStatus: EventStatus = a.status === 'COMPLETED' ? 'PLANNED' : 'COMPLETED';
            return {
              ...a,
              status: newStatus,
              completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
            };
          }),
        })),

      deleteActivity: (id) =>
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
        })),

      applyAISchedulePlan: (plan) =>
        set((state) => {
          const newEvents: CalendarEvent[] = [];
          const newActivities: DailyActivity[] = [];

          plan.dailyPlans.forEach((day) => {
            day.tasks.forEach((task, idx) => {
              const startHour = 10 + idx * 2;
              const startTime = `${startHour.toString().padStart(2, '0')}:00`;
              const endTime = `${(startHour + Math.ceil(task.durationMinutes / 60)).toString().padStart(2, '0')}:00`;

              newEvents.push({
                id: `ai-evt-${Date.now()}-${day.dayNumber}-${idx}`,
                title: task.title,
                description: `AI Prep Plan: ${day.focusArea}`,
                category: task.category,
                status: 'PLANNED',
                date: day.date,
                startTime,
                endTime,
                durationMinutes: task.durationMinutes,
              });

              newActivities.push({
                id: `ai-act-${Date.now()}-${day.dayNumber}-${idx}`,
                title: task.title,
                category: task.category,
                priority: task.priority,
                status: 'PLANNED',
                targetDate: day.date,
                estimatedMinutes: task.durationMinutes,
              });
            });
          });

          return {
            events: [...state.events, ...newEvents],
            activities: [...state.activities, ...newActivities],
          };
        }),

      exportToICS: () => {
        const state = get();
        let icsContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//PrepPulse AI//Interview Calendar//EN',
          'CALSCALE:GREGORIAN',
          'METHOD:PUBLISH',
        ];

        state.events.forEach((evt) => {
          const dateClean = evt.date.replace(/-/g, '');
          const startClean = (evt.startTime || '09:00').replace(':', '') + '00';
          const endClean = (evt.endTime || '10:00').replace(':', '') + '00';

          icsContent.push(
            'BEGIN:VEVENT',
            `UID:${evt.id}@preppulse.ai`,
            `DTSTAMP:${dateClean}T000000Z`,
            `DTSTART:${dateClean}T${startClean}`,
            `DTEND:${dateClean}T${endClean}`,
            `SUMMARY:${evt.title}`,
            `DESCRIPTION:${evt.description || 'PrepPulse AI Interview Practice Block'}`,
            `STATUS:${evt.status === 'COMPLETED' ? 'CONFIRMED' : 'TENTATIVE'}`,
            'END:VEVENT'
          );
        });

        icsContent.push('END:VCALENDAR');
        const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'preppulse_interview_schedule.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    }),
    {
      name: 'preppulse-calendar-storage',
    }
  )
);
