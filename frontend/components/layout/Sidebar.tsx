'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Mic, 
  BarChart3, 
  CalendarDays, 
  BookOpenCheck, 
  Settings, 
  Flame, 
  Sparkles,
  Bot,
  Layers,
  LogOut
} from 'lucide-react';
import { useUserStore } from '@/lib/store/useUserStore';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'AI Mock Interview', href: '/interview', icon: Mic, badge: 'Live AI' },
  { name: 'Performance Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Calendar & Planner', href: '/calendar', icon: CalendarDays },
  { name: 'Skill Vault', href: '/skills', icon: BookOpenCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useUserStore();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const displayName = user?.name || profile.name;

  return (
    <aside className="w-64 h-screen bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between fixed left-0 top-0 z-40">
      <div>
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/60 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-white tracking-tight">PrepPulse</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Interview Mastery Suite</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 mt-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile & Quick CTA Widget */}
      <div className="p-4 border-t border-slate-800/60 space-y-3">
        {/* Streak & Score pill */}
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/15 text-amber-400 rounded-lg">
              <Flame className="w-4 h-4 fill-amber-400/20" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Daily Streak</div>
              <div className="text-sm font-bold text-slate-200">{profile.currentStreak} Days 🔥</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Avg Score</div>
            <div className="text-sm font-bold text-emerald-400">{profile.averageScore}%</div>
          </div>
        </div>

        {/* Candidate Info with Logout button */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow shrink-0">
              {displayName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-slate-200 truncate">{displayName}</div>
              <div className="text-[11px] text-slate-400 truncate">{profile.targetRole}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition shrink-0"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
