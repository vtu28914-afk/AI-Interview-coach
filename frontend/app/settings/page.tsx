'use client';

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Key, 
  User, 
  Mic2, 
  Sparkles, 
  Check, 
  Save, 
  FileText, 
  Upload, 
  Volume2, 
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useUserStore } from '@/lib/store/useUserStore';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { TargetRole, ExperienceLevel } from '@/types';
import confetti from 'canvas-confetti';

export default function SettingsPage() {
  const { profile, updateProfile, addTechSkill, removeTechSkill, uploadResume } = useUserStore();
  const { 
    geminiApiKey, 
    setGeminiApiKey, 
    openaiApiKey, 
    setOpenaiApiKey,
    autoPlayTTS,
    setAutoPlayTTS,
    ttsSpeed,
    setTtsSpeed,
    webcamDefaultOn,
    setWebcamDefaultOn,
    clearKeys
  } = useSettingsStore();

  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState<TargetRole>(profile.targetRole);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(profile.experienceLevel);
  const [newSkill, setNewSkill] = useState('');
  const [resumeText, setResumeText] = useState(profile.resumeSummary || '');
  const [geminiKeyInput, setGeminiKeyInput] = useState(geminiApiKey);
  const [openaiKeyInput, setOpenaiKeyInput] = useState(openaiApiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      targetRole: role,
      experienceLevel,
      resumeSummary: resumeText,
    });
    setGeminiApiKey(geminiKeyInput.trim());
    setOpenaiApiKey(openaiKeyInput.trim());

    setSavedSuccess(true);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
    });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      addTechSkill(newSkill.trim());
      setNewSkill('');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform & AI Configuration</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your candidate profile context, AI provider keys, and audio/webcam preferences.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Candidate Profile Context */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <User className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Candidate Persona & Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Engineering Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as TargetRole)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Full Stack Engineer">Full Stack Engineer</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="ML/AI Engineer">ML/AI Engineer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="DevOps / SRE">DevOps / SRE</option>
                <option value="System Architect">System Architect</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Seniority Target</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="JUNIOR">Junior (0-2 years)</option>
                <option value="MID">Mid-Level (3-5 years)</option>
                <option value="SENIOR">Senior (5-8 years)</option>
                <option value="STAFF">Lead / Staff (8+ years)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Add Key Tech Skill (Press Enter)</label>
              <input
                type="text"
                placeholder="e.g. Kubernetes, Redis, Kafka"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleAddSkill}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Tech Stack Pills */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Active Tech Stack</label>
            <div className="flex flex-wrap gap-1.5">
              {profile.techStack.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-center gap-1.5"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeTechSkill(skill)}
                    className="text-slate-500 hover:text-rose-400 font-bold text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Resume Parsing Context */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Resume Experience Summary Context (Feeds into AI Question Generation)
            </label>
            <textarea
              rows={3}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste summary points from your resume: e.g. Architected microservices with 50k RPS, led database sharding, built React design system..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>
        </div>

        {/* AI Key Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <Key className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">AI Model Integration Keys</h2>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            By default, PrepPulse AI utilizes an intelligent built-in simulation engine. 
            Optionally configure your personal Google Gemini API Key or OpenAI Key for live cloud LLM inference.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Google Gemini API Key (Recommended)
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                OpenAI API Key (Alternative)
              </label>
              <input
                type="password"
                placeholder="sk-..."
                value={openaiKeyInput}
                onChange={(e) => setOpenaiKeyInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Keys are stored in your secure browser local storage and never exposed.</span>
            </div>

            <button
              type="button"
              onClick={clearKeys}
              className="text-xs text-rose-400 hover:underline"
            >
              Clear Stored Keys
            </button>
          </div>
        </div>

        {/* Audio & Media Preferences */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Audio & Video Preferences</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white">AI Spoken Voice (TTS)</div>
                <div className="text-[11px] text-slate-400">Read questions aloud automatically</div>
              </div>
              <input
                type="checkbox"
                checked={autoPlayTTS}
                onChange={(e) => setAutoPlayTTS(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white">Webcam Default</div>
                <div className="text-[11px] text-slate-400">Open camera preview automatically</div>
              </div>
              <input
                type="checkbox"
                checked={webcamDefaultOn}
                onChange={(e) => setWebcamDefaultOn(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
