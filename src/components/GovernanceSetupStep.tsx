import React from 'react';
import { OrganizationProfile, FrameworkRegistryItem } from '../types';
import { getFrameworkRegistry, DEFAULT_PRODUCT_ACTIVATION } from '../services/applicabilityEngine';
import { BookOpen, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

interface GovernanceSetupStepProps {
  profile: OrganizationProfile;
  onConfirm: () => void;
  onBack: () => void;
}

export const GovernanceSetupStep: React.FC<GovernanceSetupStepProps> = ({
  profile,
  onConfirm,
  onBack
}) => {
  const registry: FrameworkRegistryItem[] = getFrameworkRegistry(profile, DEFAULT_PRODUCT_ACTIVATION);
  const activeFrameworks = registry.filter((r) => r.enabled && r.source_type === 'REGULATORY');
  const scopedOutFrameworks = registry.filter((r) => !r.enabled && r.source_type === 'REGULATORY');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm max-w-2xl w-full mx-auto my-4 animate-in fade-in duration-200">
      {/* Step Header */}
      <div className="flex items-center space-x-3.5 mb-6 border-b border-slate-100 pb-5">
        <div className="w-12 h-12 rounded-2xl bg-indigo-900 text-indigo-200 flex items-center justify-center shrink-0 shadow-xs">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              STEP 3 OF 5 • GOVERNANCE FRAMEWORKS
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Statutory Applicability Baseline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Frameworks automatically activated based on your <span className="font-bold text-slate-700">{profile.industry}</span> profile ({profile.subSector}).
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Active Frameworks List */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Applicable Frameworks ({activeFrameworks.length} Active)</span>
            <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              ENFORCEMENT READY
            </span>
          </h3>
          <div className="space-y-2">
            {activeFrameworks.map((fw: FrameworkRegistryItem) => (
              <div
                key={fw.source_id}
                className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start space-x-3"
              >
                <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-emerald-950">{fw.display_name}</h4>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900">
                      MANDATORY
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                    {fw.applicability_reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scoped Out Frameworks */}
        {scopedOutFrameworks.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Scoped-Out Frameworks ({scopedOutFrameworks.length} Inactive)
            </h3>
            <div className="space-y-1.5">
              {scopedOutFrameworks.map((so: FrameworkRegistryItem) => (
                <div
                  key={so.source_id}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-600"
                >
                  <span className="font-semibold">{so.display_name}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Not applicable to {profile.industry}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center space-x-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Modify Company Type</span>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Confirm Statutory Baseline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
