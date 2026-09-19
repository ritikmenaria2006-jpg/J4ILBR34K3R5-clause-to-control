import React from 'react';
import { GovernanceCoverageReport } from '../types';
import { Shield, ShieldAlert, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface GovernanceCoverageCardProps {
  coverage?: GovernanceCoverageReport;
  isLiveMode?: boolean;
}

export const GovernanceCoverageCard: React.FC<GovernanceCoverageCardProps> = ({
  coverage,
  isLiveMode = false
}) => {
  if (!coverage) return null;

  const hasViolations = coverage.violatingFrameworks && coverage.violatingFrameworks.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Governance Framework Coverage & Statutory Scope
          </h4>
        </div>
        <span className="text-[11px] font-mono text-slate-500 font-semibold">
          {coverage.evaluatedFrameworks.length} Evaluated • {coverage.notEvaluatedFrameworks.length} Excluded
        </span>
      </div>

      {/* Violations Callout if present */}
      {hasViolations && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-xs font-bold text-red-900 mb-1">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>Multi-Framework Statutory Violations Detected:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {coverage.violatingFrameworks.map((vf) => (
              <span
                key={vf}
                className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-600 text-white shadow-2xs"
              >
                {vf}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Evaluated Frameworks */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Active Frameworks Evaluated in Real-Time:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {coverage.evaluatedFrameworks.map((fName) => {
            const isViolated = coverage.violatingFrameworks.includes(fName);
            return (
              <div
                key={fName}
                className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                  isViolated
                    ? 'bg-red-50/70 border-red-200 text-red-900'
                    : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center space-x-1.5 truncate">
                  {isViolated ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                  <span className="truncate font-semibold">{fName}</span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0 ml-1.5 ${
                    isViolated ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isViolated ? 'VIOLATION' : 'PASSED'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Not Evaluated Frameworks (with transparent reasons) */}
      {coverage.notEvaluatedFrameworks.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
            <span>Frameworks Not Evaluated (With Scoping Rationales):</span>
            <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              Not Evaluated ≠ Passed
            </span>
          </div>
          <div className="space-y-1">
            {coverage.notEvaluatedFrameworks.map((ne) => (
              <div
                key={ne.name}
                className="flex items-start space-x-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">{ne.name}: </span>
                  <span className="text-slate-600 text-[11px]">{ne.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
