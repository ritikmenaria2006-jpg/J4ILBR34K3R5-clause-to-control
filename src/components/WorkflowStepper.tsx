import React from 'react';
import { Check, Lock, ChevronRight, User, Building, BookOpen, FileCheck, Terminal } from 'lucide-react';

export type WorkflowStepId = 'AUTH' | 'ORG_PROFILE' | 'GOVERNANCE_SETUP' | 'POLICY_EVIDENCE' | 'AGENT_READY';

interface WorkflowStepperProps {
  currentStep: WorkflowStepId;
  completedSteps: WorkflowStepId[];
  onSelectStep: (step: WorkflowStepId) => void;
  onLockedClick: (stepTitle: string) => void;
}

interface StepConfig {
  id: WorkflowStepId;
  number: number;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: StepConfig[] = [
  { id: 'AUTH', number: 1, title: 'Authentication', shortTitle: 'Auth', icon: User },
  { id: 'ORG_PROFILE', number: 2, title: 'Organization Profile', shortTitle: 'Org Scope', icon: Building },
  { id: 'GOVERNANCE_SETUP', number: 3, title: 'Governance Baseline', shortTitle: 'Frameworks', icon: BookOpen },
  { id: 'POLICY_EVIDENCE', number: 4, title: 'Policies & Evidence', shortTitle: 'Policies', icon: FileCheck },
  { id: 'AGENT_READY', number: 5, title: 'AI Agent Console', shortTitle: 'Agent', icon: Terminal },
];

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStep,
  completedSteps,
  onSelectStep,
  onLockedClick
}) => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
      <div className="flex items-center justify-between overflow-x-auto gap-1 sm:gap-2 no-scrollbar py-1">
        {STEPS.map((step, idx) => {
          const isCurrent = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const isLocked = !isCurrent && !isCompleted;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => {
                  if (isLocked) {
                    onLockedClick(step.title);
                  } else {
                    onSelectStep(step.id);
                  }
                }}
                className={`flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-900 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-200'
                }`}
                title={
                  isCurrent
                    ? `Current Step: ${step.title}`
                    : isCompleted
                    ? `Completed: Click to revisit ${step.title}`
                    : `Locked: Complete previous steps to unlock ${step.title}`
                }
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : isLocked ? <Lock className="w-2.5 h-2.5" /> : step.number}
                </div>

                <span className="hidden md:inline">{step.title}</span>
                <span className="md:hidden">{step.shortTitle}</span>

                {isLocked && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
              </button>

              {idx < STEPS.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
