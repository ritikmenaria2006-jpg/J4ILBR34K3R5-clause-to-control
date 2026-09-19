import React, { useState } from 'react';
import { 
  Scale, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Search, 
  Download, 
  FileCheck2, 
  TrendingUp, 
  Building2, 
  DollarSign 
} from 'lucide-react';
import { AgentRole, ToolAction, RegulatoryFramework, RegulationItem, GRCAuditReport } from '../types';
import { FULL_REGULATIONS_LIST, evaluateGRCAudit, STATUTORY_FRAMEWORKS_INFO } from '../data/regulationsData';

export const GRCAuditorView: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<AgentRole>('Vendor');
  const [selectedAction, setSelectedAction] = useState<ToolAction>('export_customer_data');
  const [selectedFramework, setSelectedFramework] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLIANT' | 'VIOLATION'>('ALL');
  const [auditReport, setAuditReport] = useState<GRCAuditReport>(() => 
    evaluateGRCAudit('Vendor', 'export_customer_data', 'Routine audit evaluation', 'ALL')
  );
  const [expandedRegId, setExpandedRegId] = useState<string | null>(null);

  const handleRunAudit = () => {
    const report = evaluateGRCAudit(selectedRole, selectedAction, 'Operator manual audit test', selectedFramework);
    setAuditReport(report);
  };

  const handleRunFullInstitutionalAudit = () => {
    setSelectedRole('Admin');
    setSelectedAction('get_own_compliance_status');
    setSelectedFramework('ALL');
    const report = evaluateGRCAudit('Admin', 'get_own_compliance_status', 'Institutional Comprehensive Audit', 'ALL');
    setAuditReport(report);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GRC_Audit_Report_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredRegulations = auditReport.regulations.filter((reg) => {
    if (statusFilter !== 'ALL' && reg.compliance_status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        reg.id.toLowerCase().includes(q) ||
        reg.title.toLowerCase().includes(q) ||
        reg.section_or_control.toLowerCase().includes(q) ||
        reg.statutory_text.toLowerCase().includes(q) ||
        reg.mandated_control.toLowerCase().includes(q) ||
        reg.framework.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-200">
              GRC Compliance Officer Console
            </span>
            <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-900 rounded-full border border-emerald-200">
              5 Ingested Regulatory Baselines
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2 flex items-center gap-2">
            <Scale className="w-7 h-7 text-indigo-600" />
            Statutory GRC Multi-Framework Audit Validator
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Empowers GRC auditors to validate autonomous AI agent actions against every authoritative regulation across 
            <strong> DPDP Act 2023</strong>, <strong>SEBI CSCRF 2024</strong>, <strong>RBI PSO 2024</strong>, 
            <strong> NIST SP 800-37 RMF</strong>, and <strong>PCI DSS v4.0.1</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRunFullInstitutionalAudit}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>100% Institutional Audit</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Formal Attestation</span>
          </button>
        </div>
      </div>

      {/* Framework Coverage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {STATUTORY_FRAMEWORKS_INFO.map((fw) => (
          <div key={fw.name} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${fw.badgeColor}`}>
                {fw.name}
              </span>
              <h3 className="font-bold text-xs text-slate-800 mt-2 line-clamp-2" title={fw.fullName}>
                {fw.fullName}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {fw.totalSections} Authoritative Controls Indexed
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-medium text-slate-600 block line-clamp-1" title={fw.keyPenalties}>
                ⚖️ {fw.keyPenalties}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Examination Criteria & Dispatch */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Auditor Interrogation Parameters</h2>
            <p className="text-xs text-slate-500">Configure simulated agent tool invocations to test runtime regulatory gating.</p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
            Mode: Pre-Execution Interception
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              1. Agent Operating Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as AgentRole)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-hidden"
            >
              <option value="Admin">Admin (Data Fiduciary / System Admin)</option>
              <option value="Auditor">Auditor (Internal / CERT-In Empanelled)</option>
              <option value="Vendor">Vendor (External Third-Party Service Provider)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              2. Target Agent Tool / Capability
            </label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value as ToolAction)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-hidden"
            >
              <option value="export_customer_data">export_customer_data (Customer Records & PAN Egress)</option>
              <option value="get_global_risk_report">get_global_risk_report (Systemic Vulnerability Feed)</option>
              <option value="get_own_compliance_status">get_own_compliance_status (Security Telemetry & SLA)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              3. Regulatory Framework Scope
            </label>
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-hidden"
            >
              <option value="ALL">All 5 Regulatory Frameworks (Complete Matrix)</option>
              <option value="DPDP">Digital Personal Data Protection Act 2023</option>
              <option value="CSCRF">SEBI CSCRF 2024</option>
              <option value="RBI">RBI Master Directions (PSOs) 2024</option>
              <option value="NIST">NIST SP 800-37 RMF Rev 2</option>
              <option value="PCI">PCI DSS v4.0.1</option>
            </select>
          </div>

          <div>
            <button
              onClick={handleRunAudit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Validate Every Regulation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Verdict Summary Banner */}
      <div className={`p-6 rounded-2xl border ${
        auditReport.overall_verdict === 'APPROVED'
          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
          : 'bg-rose-50/80 border-rose-300 text-rose-950'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            {auditReport.overall_verdict === 'APPROVED' ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-8 h-8 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                  auditReport.overall_verdict === 'APPROVED'
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-rose-200 text-rose-900'
                }`}>
                  {auditReport.overall_verdict === 'APPROVED' ? 'STATUS: STATUTORILY COMPLIANT' : 'STATUS: INTERCEPTED & AUDIT REJECTED'}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Evaluated at {new Date(auditReport.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <h2 className="text-xl font-black mt-1">
                {auditReport.overall_verdict === 'APPROVED'
                  ? 'Request Authorized Under Complete Multi-Framework Examination'
                  : `Halted by Governance Matrix: ${auditReport.violations_count} Statutory Clause Violations`}
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                {auditReport.auditor_notes}
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="flex items-center gap-3">
            <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-200/60 text-center min-w-[100px]">
              <div className="text-[10px] font-bold uppercase text-slate-500">Total Checked</div>
              <div className="text-xl font-black text-slate-800">{auditReport.total_evaluated}</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-200/60 text-center min-w-[100px]">
              <div className="text-[10px] font-bold uppercase text-emerald-600">Passed</div>
              <div className="text-xl font-black text-emerald-700">{auditReport.compliant_count}</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-200/60 text-center min-w-[100px]">
              <div className="text-[10px] font-bold uppercase text-rose-600">Violations</div>
              <div className="text-xl font-black text-rose-700">{auditReport.violations_count}</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-rose-200 text-center min-w-[130px]">
              <div className="text-[10px] font-bold uppercase text-rose-700 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>Penalty Risk</span>
              </div>
              <div className="text-xl font-black text-rose-800">
                ₹{auditReport.total_penalty_exposure_cr} Cr
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regulations Table & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search section, clause, penalty, text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Verdict:</span>
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  statusFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({auditReport.regulations.length})
              </button>
              <button
                onClick={() => setStatusFilter('VIOLATION')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  statusFilter === 'VIOLATION' ? 'bg-rose-600 text-white' : 'text-rose-600 hover:text-rose-900'
                }`}
              >
                Violations ({auditReport.violations_count})
              </button>
              <button
                onClick={() => setStatusFilter('COMPLIANT')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  statusFilter === 'COMPLIANT' ? 'bg-emerald-600 text-white' : 'text-emerald-600 hover:text-emerald-900'
                }`}
              >
                Compliant ({auditReport.compliant_count})
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Regulations List */}
        <div className="divide-y divide-slate-100">
          {filteredRegulations.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No regulations match the current filter criteria.
            </div>
          ) : (
            filteredRegulations.map((reg) => {
              const isExpanded = expandedRegId === reg.id;
              const isViolation = reg.compliance_status === 'VIOLATION';

              return (
                <div key={reg.id} className={`p-4 transition-colors ${isViolation ? 'bg-rose-50/20' : 'hover:bg-slate-50/60'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {reg.id}
                        </span>
                        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {reg.framework}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {reg.section_or_control}
                        </span>
                        {reg.risk_level && (
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            reg.risk_level === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : reg.risk_level === 'HIGH'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            Risk: {reg.risk_level}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">
                        {reg.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 font-serif italic">
                        "{reg.statutory_text}"
                      </p>

                      <div className="text-xs text-slate-700 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-900">Enforced Technical Control: </span>
                        {reg.mandated_control}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        isViolation
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {isViolation ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{isViolation ? 'VIOLATION' : 'COMPLIANT'}</span>
                      </span>

                      {reg.penalty_exposure_cr && reg.penalty_exposure_cr > 0 ? (
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          ₹{reg.penalty_exposure_cr} Cr Exposure
                        </span>
                      ) : null}

                      <button
                        onClick={() => setExpandedRegId(isExpanded ? null : reg.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2 cursor-pointer mt-1"
                      >
                        {isExpanded ? 'Hide Details' : 'View Audit Procedures'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Audit Card */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Statutory Penalty & Regulatory Consequence:
                        </span>
                        <p className="text-xs text-rose-900 font-medium bg-rose-50/70 p-2 rounded-md border border-rose-200 mt-1">
                          {reg.penalty_or_consequence}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          GRC Auditor Verification Procedure:
                        </span>
                        <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-md border border-slate-200 mt-1">
                          {reg.audit_procedure}
                        </p>
                      </div>

                      {reg.finding && (
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Automated Evaluation Finding:
                          </span>
                          <p className={`text-xs p-2 rounded-md font-semibold mt-1 ${
                            isViolation ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {reg.finding}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
