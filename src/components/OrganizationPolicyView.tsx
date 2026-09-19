import React, { useState } from 'react';
import { OrganizationPolicyDocument } from '../types';
import {
  getStoredOrgPolicies,
  saveStoredOrgPolicies,
  processUploadedPolicy,
  DEFAULT_ORG_POLICIES
} from '../services/organizationPolicyService';
import {
  Upload,
  FileText,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Eye,
  Database,
  Lock,
  Layers
} from 'lucide-react';

export const OrganizationPolicyView: React.FC = () => {
  const [policies, setPolicies] = useState<OrganizationPolicyDocument[]>(getStoredOrgPolicies());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<OrganizationPolicyDocument | null>(null);

  // Form states for manual input / paste
  const [manualTitle, setManualTitle] = useState('');
  const [manualFileName, setManualFileName] = useState('');
  const [manualText, setManualText] = useState('');
  const [showManualPaste, setShowManualPaste] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text || text.trim().length === 0) {
          setUploadError('The uploaded file appears to be empty.');
          setIsUploading(false);
          return;
        }

        // Process uploaded policy safely into local storage & ChromaDB index representation
        const newDoc = processUploadedPolicy(file.name, text);
        const updated = getStoredOrgPolicies();
        setPolicies(updated);
        setUploadSuccess(`Successfully ingested & indexed '${file.name}' (${newDoc.snippetCount} policy snippets).`);
        setIsUploading(false);
      } catch (err) {
        setUploadError(`Failed to process document: ${err}`);
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setUploadError('Failed to read file from disk.');
      setIsUploading(false);
    };

    // Read as text
    reader.readAsText(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualFileName.trim() || !manualText.trim()) {
      setUploadError('Please specify a policy filename and enter policy content.');
      return;
    }

    setIsUploading(true);
    try {
      const fileName = manualFileName.endsWith('.txt') || manualFileName.endsWith('.pdf')
        ? manualFileName
        : `${manualFileName}.txt`;

      const newDoc = processUploadedPolicy(fileName, manualText, manualTitle.trim() || undefined);
      const updated = getStoredOrgPolicies();
      setPolicies(updated);
      setUploadSuccess(`Successfully created and indexed '${fileName}'.`);
      setManualFileName('');
      setManualTitle('');
      setManualText('');
      setShowManualPaste(false);
    } catch (err) {
      setUploadError(`Failed to save policy: ${err}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePolicy = (id: string, fileName: string) => {
    const filtered = policies.filter(p => p.id !== id);
    saveStoredOrgPolicies(filtered);
    setPolicies(filtered);
    if (selectedPolicy?.id === id) {
      setSelectedPolicy(null);
    }
    setUploadSuccess(`Removed policy '${fileName}'.`);
  };

  const handleResetDefaults = () => {
    saveStoredOrgPolicies(DEFAULT_ORG_POLICIES);
    setPolicies(DEFAULT_ORG_POLICIES);
    setUploadSuccess('Reset to baseline enterprise organization policies.');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">Organization Policies Knowledge Base</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                Source: ORGANIZATION POLICY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload enterprise internal policies (Data Protection, AI Usage, Vendor Governance). Parsed into local ChromaDB vectors to influence runtime decisions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Policies</span>
          </button>
        </div>
      </div>

      {/* Upload Zone & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Widget & Policy List */}
        <div className="lg:col-span-7 space-y-5">
          {/* Upload Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                Upload Organization Policy Document
              </h3>
              <button
                type="button"
                onClick={() => setShowManualPaste(!showManualPaste)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {showManualPaste ? "Switch to File Upload" : "Or Paste Policy Text"}
              </button>
            </div>

            {showManualPaste ? (
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Document Filename (.pdf / .txt)
                  </label>
                  <input
                    type="text"
                    value={manualFileName}
                    onChange={(e) => setManualFileName(e.target.value)}
                    placeholder="e.g. Internal_Data_Export_Standard.pdf"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Policy Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. Enterprise Customer Data Export Controls"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Policy Content / Clauses
                  </label>
                  <textarea
                    rows={4}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Paste enterprise policy text here..."
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowManualPaste(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Save & Index Policy
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center block cursor-pointer transition-colors bg-slate-50/50">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="text-xs font-bold text-slate-800 block">
                    Choose a Policy File to Ingest
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Supported formats: PDF, TXT, DOCX. Stored strictly in local Vector Store.
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            )}

            {/* Critical Security Notice */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Security Invariant:</span> Uploaded documents are treated as untrusted data. Document content cannot override system prompts, elevate role privileges, disable injection filters, or modify security code.
              </div>
            </div>

            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {uploadError && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* Uploaded Policies List */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-600" />
                Active Organization Policies ({policies.length})
              </h3>
              <span className="text-[11px] text-slate-500">
                Vector DB: Local Storage / ChromaDB Emulation
              </span>
            </div>

            <div className="space-y-2.5">
              {policies.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedPolicy(doc)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    selectedPolicy?.id === doc.id
                      ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-200'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center text-indigo-600 flex-shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{doc.fileName}</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">{doc.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                          <span>Status: <span className="font-semibold text-emerald-700">INDEXED</span></span>
                          <span>•</span>
                          <span>Source: <span className="font-semibold text-indigo-700">ORGANIZATION POLICY</span></span>
                          <span>•</span>
                          <span>{doc.snippetCount} Snippets</span>
                          <span>•</span>
                          <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePolicy(doc.id, doc.fileName);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete policy"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Policy Document Inspector */}
        <div className="lg:col-span-5 space-y-5">
          {selectedPolicy ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">
                  Document Inspector
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{selectedPolicy.fileName}</h3>
                <p className="text-xs text-slate-500">{selectedPolicy.title}</p>
              </div>

              {/* Extracted Rules */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Extracted Governance Restrictions ({selectedPolicy.keyRestrictions.length}):
                </h4>
                <div className="space-y-1.5">
                  {selectedPolicy.keyRestrictions.map((r, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                        <span>Role: <strong className="text-slate-800">{r.targetRole || 'All'}</strong></span>
                        <span>Action: <strong className="text-indigo-700">{r.targetAction}</strong></span>
                      </div>
                      <p className="text-slate-800 font-medium text-[11px]">{r.ruleText}</p>
                      <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                        Section: {r.section || "Relevant policy passage"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Document Content */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Stored Policy Text:
                </h4>
                <pre className="p-3 bg-slate-950 text-slate-200 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {selectedPolicy.rawText}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 shadow-sm flex flex-col items-center justify-center space-y-2">
              <FileText className="w-8 h-8 text-slate-400" />
              <h4 className="text-xs font-bold text-slate-700">Select a Policy to Inspect</h4>
              <p className="text-[11px] max-w-xs">
                Click any indexed policy on the left to view its extracted restrictions, chunk snippets, and verbatim clauses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
