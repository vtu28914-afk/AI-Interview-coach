'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpenCheck, 
  Sparkles, 
  Search, 
  RotateCw, 
  Play, 
  CheckCircle2, 
  Layers, 
  Code2, 
  Cpu, 
  Target,
  ChevronRight
} from 'lucide-react';
import { MockSetupModal } from '@/components/interview/MockSetupModal';

interface Flashcard {
  id: string;
  category: 'DSA' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'ARCHITECTURE';
  question: string;
  domain: string;
  summaryAnswer: string;
  keyPoints: string[];
}

const VAULT_QUESTIONS: Flashcard[] = [
  {
    id: 'vq-1',
    category: 'SYSTEM_DESIGN',
    domain: 'High-Throughput Caching',
    question: 'How do you handle Cache Stampede (Thundering Herd) when a hot key expires under heavy read traffic?',
    summaryAnswer: 'Use Mutex Locking (SingleFlight pattern), Probabilistic Early Expiration (XFetch algorithm), or Background Refresh.',
    keyPoints: [
      'SingleFlight pattern: Only one cache miss request queries the database while others wait.',
      'Probabilistic Early Expiration computes a time-to-recompute probability and regenerates the cache ahead of expiration.',
      'Soft TTL vs Hard TTL: Serve stale data gracefully while an async worker revalidates.',
    ],
  },
  {
    id: 'vq-2',
    category: 'DSA',
    domain: 'Graph & Concurrency',
    question: 'How do you detect cycles in a directed dependency graph (e.g. build systems or task schedulers)?',
    summaryAnswer: 'Use Kahn’s Algorithm (Topological Sort via BFS with In-Degree tracking) or DFS with three-color graph coloring (White/Gray/Black states).',
    keyPoints: [
      'Kahn’s Algorithm: Compute in-degrees of all nodes. Enqueue 0 in-degree nodes. If processed node count < V, a cycle exists.',
      'DFS 3-color: White (unvisited), Gray (currently in recursion call stack), Black (fully processed). Re-visiting a Gray node flags a back-edge cycle.',
    ],
  },
  {
    id: 'vq-3',
    category: 'BEHAVIORAL',
    domain: 'STAR Framework: Failure & Blameless Culture',
    question: 'Tell me about a production incident you caused or handled, and how you communicated during the outage.',
    summaryAnswer: 'Structure via STAR: Situation -> Task -> Action (mitigation first, communicate status) -> Result (blameless postmortem, CI/CD guardrail).',
    keyPoints: [
      'Emphasize radical ownership: do not deflect blame onto teammates or third-party libraries.',
      'Detail communication cadences: real-time status page updates, executive summaries.',
      'Concrete engineering outcome: automated regression tests, canary deployment gates.',
    ],
  },
  {
    id: 'vq-4',
    category: 'ARCHITECTURE',
    domain: 'Distributed Consensus',
    question: 'What is the Raft consensus algorithm and how does Leader Election work in the presence of split votes?',
    summaryAnswer: 'Raft manages replicated logs via randomized election timeouts to resolve split votes and elect a unique leader.',
    keyPoints: [
      'Randomized election timeouts (e.g. 150-300ms) ensure one follower times out first and requests votes from peers.',
      'Heartbeat AppendEntries RPCs reset election timers across followers.',
      'Log matching property: A leader never overwrites its own log and only commits entries present on a majority of nodes.',
    ],
  },
];

export default function SkillVaultPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = VAULT_QUESTIONS.filter((q) => {
    if (selectedCategory !== 'ALL' && q.category !== selectedCategory) return false;
    if (searchQuery && !q.question.toLowerCase().includes(searchQuery.toLowerCase()) && !q.domain.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Interview Skill Vault & Flashcards</h1>
          <p className="text-xs text-slate-400 mt-1">
            Master high-signal architectural concepts, algorithm intuition, and STAR narrative frameworks.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Practice in Mock Room</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search concepts or domains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'SYSTEM_DESIGN', 'DSA', 'BEHAVIORAL', 'ARCHITECTURE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'All Domains' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Flashcard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => {
          const isFlipped = !!flippedCards[item.id];

          return (
            <div
              key={item.id}
              onClick={() => toggleFlip(item.id)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl cursor-pointer transition-all duration-300 min-h-[220px] flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {item.domain}
                  </span>

                  <div className="flex items-center gap-1.5 text-slate-500 group-hover:text-indigo-400 text-xs transition">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{isFlipped ? 'Show Question' : 'Click to Reveal Answer'}</span>
                  </div>
                </div>

                {!isFlipped ? (
                  <h3 className="text-base font-semibold text-white leading-relaxed pt-2">
                    {item.question}
                  </h3>
                ) : (
                  <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                    <p className="text-xs font-medium text-emerald-400 leading-relaxed">
                      {item.summaryAnswer}
                    </p>
                    <ul className="space-y-1.5">
                      {item.keyPoints.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>Category: {item.category.replace('_', ' ')}</span>
                <span className="text-indigo-400 font-medium group-hover:underline">
                  {isFlipped ? 'Tap to flip back' : 'Reveal benchmark response →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <MockSetupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
