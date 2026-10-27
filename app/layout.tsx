import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'PrepPulse AI | AI Interview Practice & Performance Analytics',
  description: 'Production-ready AI mock interview simulation with real-time speech analytics, dynamic follow-ups, and calendar preparation planner.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
