import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CandidateProfile, TargetRole, ExperienceLevel } from '@/types';

interface UserState {
  profile: CandidateProfile;
  updateProfile: (updates: Partial<CandidateProfile>) => void;
  setTargetRole: (role: TargetRole) => void;
  setExperienceLevel: (level: ExperienceLevel) => void;
  addTechSkill: (skill: string) => void;
  removeTechSkill: (skill: string) => void;
  incrementStreak: () => void;
  recordInterviewCompleted: (score: number) => void;
  uploadResume: (fileName: string, parsedText: string) => void;
}

const DEFAULT_PROFILE: CandidateProfile = {
  id: 'usr-default-1',
  name: 'Alex Chen',
  email: 'alex.chen@domain.io',
  targetRole: 'Software Engineer',
  experienceLevel: 'MID',
  techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Design', 'Redis', 'Docker'],
  resumeSummary: 'Full-stack software engineer with 3+ years experience building low-latency microservices, responsive React web apps, and distributed data pipelines.',
  resumeFileName: 'Alex_Chen_Resume_2026.pdf',
  currentStreak: 4,
  longestStreak: 12,
  totalInterviews: 6,
  averageScore: 84.5,
  targetInterviewDate: '2026-10-05',
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,

      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      setTargetRole: (targetRole) =>
        set((state) => ({
          profile: { ...state.profile, targetRole },
        })),

      setExperienceLevel: (experienceLevel) =>
        set((state) => ({
          profile: { ...state.profile, experienceLevel },
        })),

      addTechSkill: (skill) =>
        set((state) => {
          if (state.profile.techStack.includes(skill)) return state;
          return {
            profile: {
              ...state.profile,
              techStack: [...state.profile.techStack, skill],
            },
          };
        }),

      removeTechSkill: (skill) =>
        set((state) => ({
          profile: {
            ...state.profile,
            techStack: state.profile.techStack.filter((s) => s !== skill),
          },
        })),

      incrementStreak: () =>
        set((state) => {
          const newStreak = state.profile.currentStreak + 1;
          return {
            profile: {
              ...state.profile,
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, state.profile.longestStreak),
            },
          };
        }),

      recordInterviewCompleted: (score) =>
        set((state) => {
          const total = state.profile.totalInterviews + 1;
          const newAvg = Math.round(
            (state.profile.averageScore * state.profile.totalInterviews + score) / total
          );
          return {
            profile: {
              ...state.profile,
              totalInterviews: total,
              averageScore: newAvg,
            },
          };
        }),

      uploadResume: (fileName, parsedText) =>
        set((state) => ({
          profile: {
            ...state.profile,
            resumeFileName: fileName,
            resumeSummary: parsedText,
          },
        })),
    }),
    {
      name: 'preppulse-user-storage',
    }
  )
);
