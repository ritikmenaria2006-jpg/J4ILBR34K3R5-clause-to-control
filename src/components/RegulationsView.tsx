import React, { useState } from 'react';
import { 
  BookOpen, 
  Scale, 
  FileText, 
  Search, 
  Shield, 
  CheckCircle, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { STATUTORY_FRAMEWORKS_INFO, FULL_REGULATIONS_LIST } from '../data/regulationsData';

export const RegulationsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dpdp');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeFrameworkInfo = STATUTORY_FRAMEWORKS_INFO.find((f) => {
    if (activeTab === 'dpdp') return f.name.includes('DPDP');
    if (activeTab === 'cscrf') return f.name.includes('CSCRF');
    if (activeTab === 'rbi') return f.name.includes('RBI');
    if (activeTab === 'nist') return f.name.includes('NIST');
    if (activeTab === 'pci') return f.name.includes('PCI');
    return true;
  }) || STATUTORY_FRAMEWORKS_INFO[0];

  const frameworkRegulations = FULL_REGULATIONS_LIST.filter((r) => {
    if (activeTab === 'dpdp' && !r.framework.includes('DPDP')) return false;
    if (activeTab === 'cscrf' && !r.framework.includes('CSCRF')) return false;
    if (activeTab === 'rbi' && !r.framework.includes('RBI')) return false;
    if (activeTab === 'nist' && !r.framework.includes('NIST')) return false;
    if (activeTab === 'pci' && !r.framework.includes('PCI')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.statutory_text.toLowerCase().includes(q) ||
        r.section_or_control.toLowerCase().includes(q) ||
        r.mandated_control.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Scale className="w-7 h-7 text-indigo-600" />
            Authoritative 5-Framework Regulatory Knowledge Base
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Complete, authoritative regulatory corpora ingested by the Clause-to-Control policy compiler.
            Covers India statutory privacy, market cyber resilience, central banking directions, and international standards.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('dpdp')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'dpdp' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>DPDP 2023</span>
          </button>
          <button
            onClick={() => setActiveTab('cscrf')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'cscrf' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>SEBI CSCRF</span>
          </button>
          <button
            onClick={() => setActiveTab('rbi')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'rbi' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>RBI PSO 2024</span>
          </button>
          <button
            onClick={() => setActiveTab('nist')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'nist' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>NIST SP 800-37</span>
          </button>
          <button
            onClick={() => setActiveTab('pci')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'pci' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>PCI DSS v4.0.1</span>
          </button>
        </div>
      </div>

      {/* Selected Framework Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded border ${activeFrameworkInfo.badgeColor}`}>
                {activeFrameworkInfo.name}
              </span>
              <span className="font-mono text-xs text-slate-500">
                Source Document: <code className="text-slate-800 font-bold">{activeFrameworkInfo.file}</code>
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {activeFrameworkInfo.fullName}
            </h3>
          </div>

          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-800">Enforcement Scope: </span>
            {activeFrameworkInfo.domains}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search regulatory clauses, text, penalty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Showing {frameworkRegulations.length} Verified Regulatory Clauses
          </div>
        </div>
      </div>

      {/* Structured Regulations List */}
      <div className="grid grid-cols-1 gap-4">
        {frameworkRegulations.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-sm text-slate-500">
            No regulations matching "{searchQuery}" in this framework.
          </div>
        ) : (
          frameworkRegulations.map((reg) => (
            <div key={reg.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black bg-slate-900 text-sky-400 px-2.5 py-1 rounded">
                    {reg.id}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {reg.section_or_control}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-500">
                    {reg.chapter_or_domain}
                  </span>
                </div>

                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                  <CheckCircle className="w-3 h-3" />
                  <span>Actively Enforced in Runtime Matrix</span>
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mb-2">
                {reg.title}
              </h4>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 mb-3 text-xs text-slate-800 font-serif leading-relaxed italic">
                "{reg.statutory_text}"
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                  <span className="font-bold text-indigo-950 block mb-1">
                    Mandated Technical & Operational Safeguard:
                  </span>
                  <p className="text-slate-700">{reg.mandated_control}</p>
                </div>

                <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                  <span className="font-bold text-rose-950 block mb-1">
                    Statutory Penalty / Regulatory Sanction:
                  </span>
                  <p className="text-rose-900">{reg.penalty_or_consequence}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  <strong>GRC Audit Method:</strong> {reg.audit_procedure}
                </span>
                {reg.mapped_agent_action && (
                  <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    Mapped Tool: {reg.mapped_agent_action}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
