import React, { useState, useRef } from 'react';
import {
  FileText,
  ArrowRight,
  ArrowLeft,
  Database,
  Award,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  FolderCheck,
  Trash2
} from 'lucide-react';
import {
  getStoredOrgPolicies,
  saveStoredOrgPolicies,
  processUploadedPolicy,
  SAMPLE_DEMO_ORG_POLICIES
} from '../services/organizationPolicyService';
import {
  getStoredEvidence,
  saveStoredEvidence,
  saveStoredFindings,
  processEvidenceDocuments,
  SAMPLE_DEMO_EVIDENCE,
  SAMPLE_DEMO_FINDINGS,
  evaluateEvidenceAgainstControls
} from '../services/evidenceAuditService';
import { getActiveSessionId } from '../services/sessionManager';
import { OrganizationPolicyDocument, OrganizationEvidenceItem } from '../types';

interface PolicyEvidenceSetupStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export const PolicyEvidenceSetupStep: React.FC<PolicyEvidenceSetupStepProps> = ({
  onComplete,
  onBack
}) => {
  const activeSessionId = getActiveSessionId() || undefined;
  const [policies, setPolicies] = useState<OrganizationPolicyDocument[]>(() => getStoredOrgPolicies(activeSessionId));
  const [evidence, setEvidence] = useState<OrganizationEvidenceItem[]>(() => getStoredEvidence(activeSessionId));
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const policyFileInputRef = useRef<HTMLInputElement>(null);
  const evidenceFileInputRef = useRef<HTMLInputElement>(null);

  // Explicit action: Load Demo Dataset
  const handleLoadDemoDataset = () => {
    setIsProcessing(true);
    setStatusMessage('Loading verified demo dataset (3 Policies + 5 Evidence Artifacts)...');

    setTimeout(() => {
      const demoPolicies = SAMPLE_DEMO_ORG_POLICIES.map((p) => ({
        ...p,
        sessionId: activeSessionId
      }));
      const demoEvidence = SAMPLE_DEMO_EVIDENCE.map((e) => ({
        ...e,
        sessionId: activeSessionId
      }));

      saveStoredOrgPolicies(demoPolicies);
      saveStoredEvidence(demoEvidence);

      const findings = evaluateEvidenceAgainstControls(demoEvidence);
      saveStoredFindings(findings);

      setPolicies(demoPolicies);
      setEvidence(demoEvidence);
      setIsProcessing(false);
      setStatusMessage('Demo dataset loaded successfully: 3 Policies and 5 Evidence documents indexed.');
    }, 400);
  };

  // Upload custom Policy files (multi-file)
  const handlePolicyFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newPolicies: OrganizationPolicyDocument[] = [...policies];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await file.text();
        const parsed = processUploadedPolicy(file.name, text);
        if (activeSessionId) {
          (parsed as any).sessionId = activeSessionId;
        }
        newPolicies.push(parsed);
      } catch (err) {
        console.error('Failed to parse policy file:', file.name, err);
      }
    }

    saveStoredOrgPolicies(newPolicies);
    setPolicies(newPolicies);
    setIsProcessing(false);
    setStatusMessage(`Uploaded and indexed ${files.length} organization policy document(s).`);
    if (policyFileInputRef.current) policyFileInputRef.current.value = '';
  };

  // Upload custom Evidence files (multi-file)
  const handleEvidenceFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const incoming: { name: string; content: string; size: number }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await file.text();
        incoming.push({
          name: file.name,
          content: text,
          size: file.size
        });
      } catch (err) {
        console.error('Failed to read evidence file:', file.name, err);
      }
    }

    const result = processEvidenceDocuments(incoming, evidence);
    if (activeSessionId) {
      result.indexedEvidence.forEach((item: any) => {
        item.sessionId = activeSessionId;
      });
      saveStoredEvidence(result.indexedEvidence);
    }

    setEvidence(result.indexedEvidence);
    setIsProcessing(false);
    setStatusMessage(`Indexed ${result.totalIndexed} evidence document(s). Controls evaluated.`);
    if (evidenceFileInputRef.current) evidenceFileInputRef.current.value = '';
  };

  const handleClearAll = () => {
    saveStoredOrgPolicies([]);
    saveStoredEvidence([]);
    saveStoredFindings([]);
    setPolicies([]);
    setEvidence([]);
    setStatusMessage('Cleared all policies and evidence for this session.');
  };

  const canActivate = policies.length > 0 && evidence.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm max-w-3xl w-full mx-auto my-4 animate-in fade-in duration-200">
      {/* Step Header */}
      <div className="flex items-center space-x-3.5 mb-6 border-b border-slate-100 pb-5">
        <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
          <Database className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
              STEP 4 OF 5 • MANDATORY POLICIES & EVIDENCE
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Organization Policies & Audit Evidence
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            AI Agent Chat requires active organizational policies and verifiable audit artifacts to execute.
          </p>
        </div>
      </div>

      {/* Quick Demo Helper Banner */}
      <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Fast-Track Demo Dataset (Recommended for Hackathon Evaluation)</span>
          </span>
          <p className="text-[11px] text-indigo-700 mt-0.5">
            Load 3 verified statutory policies and 5 multi-source compliance evidence files with one click.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLoadDemoDataset}
          disabled={isProcessing}
          className="shrink-0 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Demo Dataset</span>
        </button>
      </div>

      {/* Notification status message */}
      {statusMessage && (
        <div className="mb-4 p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium flex items-center justify-between">
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 text-xs ml-2"
          >
            ×
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* Section 1: Policies Upload & Inspection */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Organization Policies ({policies.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Internal rules, encryption charters, and IAM constraints applied by the agent runtime.
              </p>
            </div>
            <div>
              <input
                ref={policyFileInputRef}
                type="file"
                multiple
                accept=".txt,.json,.docx,.pdf,.md"
                onChange={handlePolicyFilesUpload}
                className="hidden"
                id="policy-file-input"
              />
              <label
                htmlFor="policy-file-input"
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Upload className="w-3 h-3 text-slate-500" />
                <span>Upload Policy Files</span>
              </label>
            </div>
          </div>

          {policies.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg bg-white/50">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-600">No policy documents uploaded yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upload your organization's policy files or click "Load Demo Dataset" above.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {policies.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-start space-x-2.5 text-xs shadow-2xs"
                >
                  <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate">{p.title}</span>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">
                        {p.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {p.keyRestrictions?.[0]?.ruleText || p.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Evidence Upload & Inspection */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FolderCheck className="w-4 h-4 text-emerald-600" />
                <span>Organization Evidence Artifacts ({evidence.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Infrastructure configurations, IAM access lists, and audit reports checked during audits.
              </p>
            </div>
            <div>
              <input
                ref={evidenceFileInputRef}
                type="file"
                multiple
                accept=".json,.csv,.log,.pdf,.txt,.yaml,.yml"
                onChange={handleEvidenceFilesUpload}
                className="hidden"
                id="evidence-file-input"
              />
              <label
                htmlFor="evidence-file-input"
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Upload className="w-3 h-3 text-slate-500" />
                <span>Upload Evidence Files</span>
              </label>
            </div>
          </div>

          {evidence.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg bg-white/50">
              <Award className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-600">No evidence artifacts uploaded yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upload infrastructure configuration (.json), access logs (.csv), or audit reports (.pdf).
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {evidence.map((e) => (
                <div
                  key={e.id}
                  className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-start space-x-2.5 text-xs shadow-2xs"
                >
                  <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate">
                        {e.displayName || e.fileName}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                        {e.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{e.contentSnippet}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Validation Barrier Notice */}
        {!canActivate && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Mandatory Setup: Provide at least 1 Organization Policy and 1 Evidence artifact (or click "Load Demo Dataset") before the AI Agent Console can be activated.
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Governance</span>
            </button>
            {(policies.length > 0 || evidence.length > 0) && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2.5 py-2 text-[11px] font-semibold text-red-600 hover:text-red-800 flex items-center space-x-1 cursor-pointer"
                title="Clear all session policies and evidence"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <button
            type="button"
            disabled={!canActivate}
            onClick={onComplete}
            className={`w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              canActivate
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <span>Activate AI Agent Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
