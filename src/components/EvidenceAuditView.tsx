import React, { useState } from 'react';
import { OrganizationEvidenceItem, EvidenceAuditFinding } from '../types';
import {
  getStoredEvidence,
  getStoredFindings,
  processEvidenceDocuments,
  RawEvidenceFileInput,
  SUPPORTED_EVIDENCE_EXTENSIONS
} from '../services/evidenceAuditService';
import {
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Eye,
  ShieldCheck,
  Building,
  Layers,
  FileCode,
  FileCheck,
  AlertCircle,
  Clock,
  Files,
  Bot,
  ArrowRight
} from 'lucide-react';

interface EvidenceAuditViewProps {
  onNavigateToTab?: (tab: string) => void;
}

export const EvidenceAuditView: React.FC<EvidenceAuditViewProps> = ({ onNavigateToTab }) => {
  const [evidenceList, setEvidenceList] = useState<OrganizationEvidenceItem[]>(getStoredEvidence());
  const [findings, setFindings] = useState<EvidenceAuditFinding[]>(getStoredFindings());
  const [selectedEvidence, setSelectedEvidence] = useState<OrganizationEvidenceItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{
    totalSubmitted: number;
    totalIndexed: number;
    totalFailed: number;
    failedFiles: { fileName: string; reason: string }[];
  } | null>(null);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve((event.target?.result as string) || '');
      };
      reader.onerror = () => {
        resolve('');
      };
      reader.readAsText(file);
    });
  };

  const handleMultipleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setIsProcessing(true);
    setUploadFeedback(null);

    const rawInputs: RawEvidenceFileInput[] = [];

    for (const file of files) {
      const content = await readFileContent(file);
      rawInputs.push({
        name: file.name,
        size: file.size,
        content
      });
    }

    const result = processEvidenceDocuments(rawInputs, evidenceList);
    setEvidenceList(result.indexedEvidence);
    setFindings(result.updatedFindings);
    setIsProcessing(false);

    setUploadFeedback({
      totalSubmitted: result.totalSubmitted,
      totalIndexed: result.totalIndexed,
      totalFailed: result.totalFailed,
      failedFiles: result.failedFiles
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes <= 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const passCount = findings.filter((f) => f.status === 'PASS').length;
  const failCount = findings.filter((f) => f.status === 'FAIL').length;
  const partialCount = findings.filter((f) => f.status === 'PARTIAL').length;

  return (
    <div className="space-y-6">
      {/* Primary Workflow Guidance Callout Banner */}
      <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-200 text-indigo-950 px-2 py-0.5 rounded">
                Supporting Inspection Area
              </span>
              <span className="text-xs font-bold text-slate-800">
                AI Agent Chat Drives Primary Audits
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Initiate, execute, and converse with statutory audits in the <strong>AI Chat</strong> tab. Use this repository view to manage uploaded artifacts, inspect raw source text, and verify gap determinations.
            </p>
          </div>
        </div>

        {onNavigateToTab && (
          <button
            type="button"
            onClick={() => onNavigateToTab('console')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0 shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Launch Audit in AI Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
              EVIDENCE REPOSITORY
            </span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              SUPPORTING INSPECTION AREA
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Organization Evidence & Control Gap Repository
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Deep artifact inspection for institutional configuration files, evidence metadata, and statutory verification records.
          </p>
        </div>

        <div>
          <label
            htmlFor="evidence-multi-file-input"
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Select Multiple Files</span>
          </label>
          <input
            id="evidence-multi-file-input"
            type="file"
            multiple
            accept=".json,.csv,.txt,.pdf,.docx,.xlsx"
            onChange={(e) => {
              if (e.target.files) {
                handleMultipleFiles(e.target.files);
                e.target.value = '';
              }
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* Multi-File Upload Drop Area */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Files className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Evidence & Audit: Upload Organization Evidence
              </h3>
              <p className="text-xs text-slate-500">
                Add one or multiple files in a single operation. Retains all existing evidence documents.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
            Multi-Document Support Active
          </span>
        </div>

        {/* Drag & Drop Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/40'
          }`}
        >
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-slate-800">
              Drop multiple files here, or{' '}
              <label
                htmlFor="evidence-multi-file-input"
                className="text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
              >
                browse
              </label>
            </div>
            <p className="text-xs text-slate-500">
              Supported formats: <strong className="text-slate-700">PDF, TXT, JSON, CSV, DOCX, XLSX</strong> where supported. You may select multiple files simultaneously.
            </p>
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center space-x-2 text-xs text-indigo-900 font-semibold animate-pulse">
            <Clock className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Processing and indexing uploaded evidence files into the governance knowledge base...</span>
          </div>
        )}

        {/* Upload Summary Feedback & Partial Failure Details */}
        {uploadFeedback && (
          <div className="space-y-2">
            <div
              className={`p-3.5 rounded-lg border text-xs font-bold flex items-center justify-between ${
                uploadFeedback.totalFailed === 0
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : uploadFeedback.totalIndexed > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-red-50 text-red-900 border-red-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                {uploadFeedback.totalFailed === 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>
                  {uploadFeedback.totalIndexed} file{uploadFeedback.totalIndexed !== 1 ? 's' : ''} processed & indexed successfully
                  {uploadFeedback.totalFailed > 0 && ` • ${uploadFeedback.totalFailed} file${uploadFeedback.totalFailed !== 1 ? 's' : ''} failed`}
                </span>
              </div>
              <span className="text-[11px] font-mono">
                Batch total: {uploadFeedback.totalSubmitted}
              </span>
            </div>

            {uploadFeedback.failedFiles.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1.5 text-xs text-red-800">
                <span className="font-bold block text-red-900">Failed files:</span>
                {uploadFeedback.failedFiles.map((ff, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <XCircle className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-mono font-semibold">{ff.fileName}</span> — <span>{ff.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Evidence Artifacts
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {evidenceList.length} Files
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Config, IAM, Audit Reports</span>
        </div>

        <div className="bg-white border border-emerald-200 p-4 rounded-xl shadow-xs bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Controls Passed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{passCount}</span>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">Statutory Evidence Verified</span>
        </div>

        <div className="bg-white border border-red-200 p-4 rounded-xl shadow-xs bg-red-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
              Control Gaps (Fail)
            </span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-2xl font-black text-red-700 mt-1 block">{failCount}</span>
          <span className="text-[11px] text-red-600 mt-0.5 block">Remediation Required</span>
        </div>

        <div className="bg-white border border-amber-200 p-4 rounded-xl shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Partial Compliance
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{partialCount}</span>
          <span className="text-[11px] text-amber-600 mt-0.5 block">Egress Redacted / Storage Gap</span>
        </div>
      </div>

      {/* Selected / Uploaded Evidence Repository Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Selected / Uploaded Evidence
              </h3>
              <p className="text-xs text-slate-500">
                All indexed organization documents actively backing statutory audit determinations.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">
            {evidenceList.length} Active Artifacts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {evidenceList.length === 0 ? (
            <div className="col-span-3 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Files className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No organization evidence uploaded yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Use the upload box above to index evidence artifacts for this session.</p>
            </div>
          ) : (
            evidenceList.map((ev) => (
            <div
              key={ev.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-100 text-indigo-800">
                      {ev.fileType}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    [{ev.status || 'INDEXED'}]
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                  {ev.displayName || ev.fileName}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-0.5">
                  <span>{ev.fileName}</span>
                  <span>{formatFileSize(ev.fileSize || ev.size)}</span>
                </div>

                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Source Type: <span className="text-slate-600 font-semibold">{ev.source_type || 'ORGANIZATION_EVIDENCE'}</span>
                </div>

                <p className="text-[11px] text-slate-600 mt-2 line-clamp-3 bg-white p-2 rounded border border-slate-200 font-mono">
                  {ev.contentSnippet}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  DEMO EVIDENCE
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedEvidence(ev)}
                  className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Raw</span>
                </button>
              </div>
            </div>
          )))}
        </div>
      </div>

      {/* Control Gap Findings Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Evidence-Based Control Gap Audit & Findings
              </h3>
              <p className="text-xs text-slate-500">
                Deterministic comparison of statutory requirements vs. observed configuration evidence across all indexed documents.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {findings.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No control evaluations available</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Upload evidence documents to evaluate compliance against statutory frameworks.</p>
            </div>
          ) : (
            findings.map((f) => (
            <div
              key={f.id}
              className={`p-4 rounded-xl border transition-all ${
                f.status === 'FAIL'
                  ? 'bg-red-50/40 border-red-200'
                  : f.status === 'PARTIAL'
                  ? 'bg-amber-50/40 border-amber-200'
                  : 'bg-emerald-50/40 border-emerald-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-black uppercase ${
                      f.status === 'FAIL'
                        ? 'bg-red-600 text-white'
                        : f.status === 'PARTIAL'
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    STATUS: {f.status}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700">{f.controlId}</span>
                  <span className="text-xs text-slate-500">• {f.framework}</span>
                </div>

                {/* Evidence Source Transparency: single vs multi-source */}
                {f.evidenceSources && f.evidenceSources.length > 1 ? (
                  <div className="text-[11px] font-mono text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200">
                    <span className="font-bold text-slate-500">Evidence Sources:</span>{' '}
                    <span className="text-indigo-700 font-semibold">{f.evidenceSources.join(' + ')}</span>
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Source: {f.evidenceSource}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-900 mb-2">{f.controlTitle}</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                    Statutory Requirement
                  </span>
                  <p className="text-slate-800">{f.requirementText}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                    Observed in Evidence ({f.evidenceLocation})
                  </span>
                  <p className="text-slate-800 font-mono text-[11px]">{f.observedText}</p>
                  <div className="mt-1 p-1.5 bg-slate-50 rounded border border-slate-200 text-[10px] font-mono text-slate-600">
                    Excerpt: {f.evidenceExcerpt}
                  </div>
                </div>
              </div>

              {/* Remediation Suggestion Engine (Human Review Required, Non-Auto-Executing) */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5 text-indigo-950 font-bold">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <span>AI-Assisted Suggested Remediation (Technical Guidance)</span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                    Human Review Required (Non-Auto-Executing)
                  </span>
                </div>
                <p className="text-indigo-900 text-[11px] mt-0.5">{f.suggestedRemediation}</p>
              </div>
            </div>
          )))}
        </div>
      </div>

      {/* Raw Evidence Viewer Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedEvidence.title}</h3>
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
                  <span>{selectedEvidence.fileName}</span>
                  <span>•</span>
                  <span>{formatFileSize(selectedEvidence.fileSize || selectedEvidence.size)}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">[{selectedEvidence.status || 'INDEXED'}]</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                DEMO EVIDENCE
              </span>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-xl">
              <pre className="whitespace-pre-wrap">{selectedEvidence.rawContent}</pre>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end mt-3">
              <button
                type="button"
                onClick={() => setSelectedEvidence(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
