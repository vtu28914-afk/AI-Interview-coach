'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  FileText, 
  Building2, 
  Code2, 
  Target, 
  Calendar,
  Layers
} from 'lucide-react';
import { useUserStore } from '@/lib/store/useUserStore';
import { TargetRole, ExperienceLevel } from '@/types';
import confetti from 'canvas-confetti';

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, updateProfile } = useUserStore();

  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<TargetRole>(profile.targetRole || 'Software Engineer');
  const [level, setLevel] = useState<ExperienceLevel>(profile.experienceLevel || 'MID');
  const [targetCompany, setTargetCompany] = useState<string>('Google');
  const [targetDate, setTargetDate] = useState<string>(
    profile.targetInterviewDate || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]
  );
  const [skills, setSkills] = useState<string[]>(profile.techStack || ['React', 'TypeScript', 'Node.js', 'System Design']);
  const [newSkillInput, setNewSkillInput] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>(profile.resumeSummary || '');
  const [resumeFileName, setResumeFileName] = useState<string>(profile.resumeFileName || 'Resume.pdf');

  const addSkill = (s: string) => {
    if (s.trim() && !skills.includes(s.trim())) {
      setSkills([...skills, s.trim()]);
      setNewSkillInput('');
    }
  };

  const removeSkill = (s: string) => {
    setSkills(skills.filter((item) => item !== s));
  };

  const handleFinish = () => {
    updateProfile({
      targetRole: role,
      experienceLevel: level,
      techStack: skills,
      targetInterviewDate: targetDate,
      resumeSummary: resumeText || 'Experienced software engineer focused on distributed systems and high-scale full stack development.',
      resumeFileName,
    });

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });

    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Step Indicator Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/25 mb-1">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Candidate Profile Calibration</h1>
          <p className="text-xs text-slate-400">Step {step} of 3: Calibrate your AI mock interviewer context</p>

          {/* Progress bar */}
          <div className="w-48 mx-auto bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800 mt-3">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Step 1: Role & Experience Level */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">Select Your Target Engineering Track</h2>
                <p className="text-xs text-slate-400">Questions will be calibrated directly to this role&apos;s bar.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Target Role</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    'Software Engineer',
                    'Full Stack Engineer',
                    'Frontend Engineer',
                    'Backend Engineer',
                    'Data Scientist',
                    'ML/AI Engineer',
                    'Product Manager',
                    'DevOps / SRE',
                    'System Architect',
                  ].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r as TargetRole)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition ${
                        role === r
                          ? 'border-indigo-500 bg-indigo-500/15 text-white shadow-sm ring-1 ring-indigo-500/50'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Seniority Tier</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'JUNIOR', label: 'Junior', sub: '0-2 years' },
                    { id: 'MID', label: 'Mid-Level', sub: '3-5 years' },
                    { id: 'SENIOR', label: 'Senior', sub: '5-8 years' },
                    { id: 'STAFF', label: 'Lead / Staff', sub: '8+ years' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setLevel(lvl.id as ExperienceLevel)}
                      className={`p-3 rounded-xl border text-center transition ${
                        level === lvl.id
                          ? 'border-indigo-500 bg-indigo-500/15 text-white ring-1 ring-indigo-500/50'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{lvl.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{lvl.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Target Company & Key Tech Skills */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">Target Companies & Core Tech Stack</h2>
                <p className="text-xs text-slate-400">Specifies the questions, algorithmic depth, and system design topics.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Dream / Target Company</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      placeholder="e.g. Google, Amazon, Meta, Stripe"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Target Interview Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Core Technologies (Type & press Enter to add)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill(newSkillInput);
                      }
                    }}
                    placeholder="e.g. Redis, Kubernetes, PostgreSQL, GraphQL"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => addSkill(newSkillInput)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-1.5"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        className="text-indigo-400 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Resume Context & Parser */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">Resume Experience & Background Context</h2>
                <p className="text-xs text-slate-400">
                  The AI interviewer will dynamically reference your past projects and claims in questions and follow-ups.
                </p>
              </div>

              {/* Upload Dropzone Preview */}
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 text-center bg-slate-950/40 space-y-2 transition cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-white">Upload Resume (PDF, DOCX)</div>
                <p className="text-[11px] text-slate-400">
                  Active file parsed: <span className="text-indigo-400 font-semibold">{resumeFileName}</span>
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Resume Highlights & Project Summary (AI Prompt Context)
                </label>
                <textarea
                  rows={4}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste notable achievements: e.g. Reduced database latency by 45% using Redis caching; led migration of payment gateway handling $5M/day..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Bottom Wizard Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-lg shadow-emerald-500/25 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish Setup & Launch Studio</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
