import React, { useState } from 'react';
import { RiskEvaluation, RiskLevel } from '../types';
import { ShieldAlert, AlertTriangle, ChevronDown, ChevronUp, Gauge, Info, CheckCircle2 } from 'lucide-react';

interface RiskScoreBreakdownCardProps {
  evaluation?: RiskEvaluation;
}

export const RiskScoreBreakdownCard: React.FC<RiskScoreBreakdownCardProps> = ({ evaluation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!evaluation) return null;

  const { risk_score, risk_level, risk_reasons, model_label } = evaluation;

  const getTierColor = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-900',
          badge: 'bg-red-600 text-white',
          gauge: 'text-red-600'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-300',
          text: 'text-orange-900',
          badge: 'bg-orange-600 text-white',
          gauge: 'text-orange-600'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          text: 'text-amber-900',
          badge: 'bg-amber-600 text-white',
          gauge: 'text-amber-600'
        };
      default:
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-300',
          text: 'text-emerald-900',
          badge: 'bg-emerald-600 text-white',
          gauge: 'text-emerald-600'
        };
    }
  };

  const colors = getTierColor(risk_level);

  return (
    <div className={`rounded-xl border p-4 shadow-xs transition-all ${colors.bg} ${colors.border}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className={`w-11 h-11 rounded-xl bg-white border ${colors.border} flex items-center justify-center font-black ${colors.gauge} shadow-xs shrink-0`}>
            <span className="text-base font-mono">{risk_score}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                Explainable Risk Engine
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${colors.badge}`}>
                {risk_level} RISK ({risk_score}/100)
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 max-w-md line-clamp-1">
              {risk_reasons[0] || 'Operational assessment within acceptable limits.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center space-x-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-white/90 hover:bg-white text-slate-700 border border-slate-200 cursor-pointer shadow-xs shrink-0 w-full sm:w-auto"
        >
          <span>{isExpanded ? 'Hide Factors' : `Factors (${risk_reasons.length})`}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              Algorithmic Contributing Risk Factors:
            </span>
            <span className="font-mono text-[10px] text-slate-500 font-normal">
              {model_label}
            </span>
          </div>

          <div className="space-y-1.5 font-sans">
            {risk_reasons.map((reason, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 shadow-2xs"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed">{reason}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-between font-mono">
            <span>Score Range: 0 (Negligible) - 100 (Immediate Critical Threat)</span>
            <span className="text-emerald-700 font-bold">Deterministic Mathematical Pipeline</span>
          </div>
        </div>
      )}
    </div>
  );
};
