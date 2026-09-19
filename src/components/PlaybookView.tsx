import React from 'react';
import { DemoScenario, AgentRole, ToolAction } from '../types';
import { DEMO_SCENARIOS } from '../data/mockData';
import { Play, ShieldAlert, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PlaybookViewProps {
  onSelectScenario: (scenario: DemoScenario) => void;
}

export const PlaybookView: React.FC<PlaybookViewProps> = ({ onSelectScenario }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Live Hackfest Demo Playbook
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Step-by-step walkthrough demonstrating Clause-to-Control's primary resilience and governance capabilities to judges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DEMO_SCENARIOS.map((sc, index) => {
          const isBlocked = sc.expectedDecision === 'BLOCKED';
          return (
            <div
              key={sc.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-slate-400 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    SCENARIO 0{index + 1}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      isBlocked
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    Expected: {sc.expectedDecision}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {sc.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {sc.description}
                </p>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Role:</span>
                    <span className="font-bold text-slate-800">{sc.role}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tool:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[170px]">{sc.action}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Target Clause:</span>
                    <span className="font-bold text-sky-700 truncate max-w-[170px]">{sc.expectedClause}</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={() => onSelectScenario(sc)}
                  className="w-full py-2.5 px-3 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  <span>Launch in Console</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Engineering Workarounds Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-md border border-slate-700 mt-8">
        <h3 className="text-base font-bold flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          Hackfest Workarounds & Production Fallbacks Verified
        </h3>
        <p className="text-xs text-slate-300 mt-1">
          How this codebase protects live hackathon demos from flaking:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="font-bold text-slate-200 block mb-1">1. Presidio spaCy Fallback</span>
            <span className="text-slate-400">
              In <code className="text-emerald-300">pii_guard.py</code>: Try/except seamlessly activates zero-dependency Regex scanner for PAN, Email, and Phone.
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="font-bold text-slate-200 block mb-1">2. LLM / ChromaDB Fallback</span>
            <span className="text-slate-400">
              In <code className="text-emerald-300">compile_policy.py</code>: The <code className="text-emerald-300">--mock</code> flag bypasses Groq/Gemini to write 8 curated rules instantly.
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="font-bold text-slate-200 block mb-1">3. Decoupled UI / FastAPI</span>
            <span className="text-slate-400">
              In <code className="text-emerald-300">ui/app.py</code>: Streamlit catches network errors, warns gracefully, and offers local in-process fallback.
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="font-bold text-slate-200 block mb-1">4. Specificity Hierarchy</span>
            <span className="text-slate-400">
              In <code className="text-emerald-300">enforcer.py</code>: Exact Match (4) &gt; Role* (3) &gt; Action* (2) &gt; Default Deny (0).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
