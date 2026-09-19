import React, { useState } from 'react';
import { COMPILED_POLICY_RULES } from '../data/mockData';
import { Lock, Filter, CheckCircle2, XCircle, Search } from 'lucide-react';

export const PolicyMatrixView: React.FC = () => {
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRules = COMPILED_POLICY_RULES.filter((rule) => {
    const matchesRole = roleFilter === 'ALL' || rule.role === roleFilter;
    const matchesSearch =
      rule.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.cited_clause.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.clause_text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Lock className="w-6 h-6 text-slate-700" />
            Compiled Governance Matrix
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Deterministic permission table compiled from SEBI CSCRF and DPDP 2023 statutes (<code className="font-mono text-slate-700">policy/policy_rules.json</code>).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search clause, tool..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 w-48"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            {['ALL', 'Admin', 'Auditor', 'Vendor'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  roleFilter === r
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">MCP Tool Action</th>
                <th className="py-3 px-4">Permission</th>
                <th className="py-3 px-4">Cited Statutory Clause</th>
                <th className="py-3 px-4">Condition & Legal Mandate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRules.map((rule, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {rule.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 font-medium whitespace-nowrap">
                    {rule.action}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {rule.allowed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ALLOWED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" />
                        DENIED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-sky-800 whitespace-nowrap">
                    {rule.cited_clause}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-md">
                    <div className="font-medium text-slate-800 mb-0.5">{rule.condition}</div>
                    <div className="text-[11px] italic text-slate-500">"{rule.clause_text}"</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
