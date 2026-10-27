import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TargetRole, ExperienceLevel } from '@/types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  token?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithSocial: (provider: 'google' | 'github') => Promise<boolean>;
  loginAsDemo: () => void;
  logout: () => void;
  clearError: () => void;
}

const DEMO_USER: AuthUser = {
  id: 'usr-default-1',
  name: 'Alex Chen',
  email: 'alex.chen@domain.io',
  role: 'Candidate',
  token: 'mock-jwt-token-alex-chen-senior-2026',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: DEMO_USER,
      token: DEMO_USER.token || null,
      isAuthenticated: true,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // Send request to API route
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Invalid credentials');
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (err: any) {
          set({ error: err.message || 'Login failed', isLoading: false });
          return false;
        }
      },

      signup: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Registration failed');
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (err: any) {
          set({ error: err.message || 'Signup failed', isLoading: false });
          return false;
        }
      },

      loginWithSocial: async (provider) => {
        set({ isLoading: true, error: null });
        // Simulate OAuth hand-shake
        await new Promise((r) => setTimeout(r, 600));

        const socialUser: AuthUser = {
          id: `usr-${provider}-${Date.now()}`,
          name: provider === 'google' ? 'Google Candidate' : 'GitHub Engineer',
          email: `${provider}.user@prep.io`,
          role: 'Candidate',
          token: `oauth-token-${provider}-${Date.now()}`,
        };

        set({
          user: socialUser,
          token: socialUser.token || null,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      },

      loginAsDemo: () => {
        set({
          user: DEMO_USER,
          token: DEMO_USER.token || null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'preppulse-auth-storage',
    }
  )
);
