import React, { useState } from 'react';
import { OrganizationProfile, IndustryType, SubSectorType } from '../types';
import { saveStoredOrgProfile } from '../services/applicabilityEngine';
import { Building2, Landmark, Cpu, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface OrganizationProfileStepProps {
  currentProfile: OrganizationProfile;
  onComplete: (profile: OrganizationProfile) => void;
}

export const OrganizationProfileStep: React.FC<OrganizationProfileStepProps> = ({
  currentProfile,
  onComplete
}) => {
  const [industry, setIndustry] = useState<IndustryType | null>(
    currentProfile.industry || null
  );
  const [subSector, setSubSector] = useState<SubSectorType>(
    currentProfile.subSector || 'Securities & Capital Markets'
  );
  const [orgName, setOrgName] = useState(
    currentProfile.organizationName || ''
  );
  const [validationError, setValidationError] = useState('');

  const handleQuickFillSample = () => {
    setOrgName('ACME Financial & FinTech Services Ltd.');
    setIndustry('Finance');
    setSubSector('Securities & Capital Markets');
    setValidationError('');
  };

  const handleIndustryChange = (selected: IndustryType) => {
    setIndustry(selected);
    setValidationError('');
    if (selected === 'IT') {
      setSubSector('General IT');
    } else {
      setSubSector('Securities & Capital Markets');
    }
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!industry) {
      setValidationError('Company Type selection is mandatory to configure governance applicability.');
      return;
    }

    const updatedProfile: OrganizationProfile = {
      ...currentProfile,
      organizationName: orgName.trim() || 'ACME Demo Enterprise',
      industry,
      subSector,
      sebiRegisteredIntermediary: industry === 'Finance' && subSector === 'Securities & Capital Markets',
      rbiPaymentSystemOperator: industry === 'Finance' && (subSector === 'Banking / NBFC' || subSector === 'Payments & Card Environment'),
      handlesCardholderData: industry === 'Finance' && subSector === 'Payments & Card Environment',
      criticalInformationInfrastructure: true,
      crossBorderDataTransfer: false
    };

    saveStoredOrgProfile(updatedProfile);
    onComplete(updatedProfile);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm max-w-2xl w-full mx-auto my-4 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex items-center space-x-3.5 mb-6 border-b border-slate-100 pb-5">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              STEP 2 OF 5 • MANDATORY ONBOARDING
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Organization Profile & Company Type
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select your company type to configure applicable statutory governance frameworks.
          </p>
        </div>
      </div>

      <form onSubmit={handleConfirm} className="space-y-6">
        {/* Organization Name */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Organization Legal Entity Name *
            </label>
            <button
              type="button"
              onClick={handleQuickFillSample}
              className="text-[11px] font-mono font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 transition-colors cursor-pointer"
            >
              ⚡ Fill Sample ACME Profile
            </button>
          </div>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white focus:outline-none transition-all min-w-0"
            placeholder="e.g. ACME Financial Technologies Ltd."
            required
          />
        </div>

        {/* Required Field: Company Type [ IT ] [ Finance ] */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Company Type *
            </label>
            <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Required for Governance Scoping
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* IT Option */}
            <button
              type="button"
              onClick={() => handleIndustryChange('IT')}
              className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                industry === 'IT'
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Cpu className="w-5 h-5" />
                </div>
                {industry === 'IT' && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Information Technology (IT)</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Software services, cloud providers, and digital platforms. Enforces DPDP Act 2023 and NIST SP 800-37 RMF baseline controls.
                </p>
              </div>
            </button>

            {/* Finance Option */}
            <button
              type="button"
              onClick={() => handleIndustryChange('Finance')}
              className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                industry === 'Finance'
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5" />
                </div>
                {industry === 'Finance' && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Finance & Banking</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Financial institutions, capital market intermediaries, and payment networks. Enforces SEBI CSCRF 2024, RBI PSO 2024, and PCI DSS.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Sub-Sector Selection (Contextual to Industry) */}
        {industry && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              {industry === 'Finance' ? 'Financial Sub-Sector Classification *' : 'Technology Sub-Sector *'}
            </label>

            {industry === 'Finance' ? (
              <div className="space-y-2">
                {[
                  {
                    id: 'Securities & Capital Markets',
                    label: 'Securities & Capital Markets',
                    desc: 'Stock brokers, depositories, mutual funds, and AMCs. Scope: SEBI CSCRF 2024 & DPDP 2023.'
                  },
                  {
                    id: 'Banking / NBFC',
                    label: 'Banking / NBFC',
                    desc: 'Scheduled commercial banks, non-banking financial entities. Scope: RBI PSO Cyber Resilience & DPDP 2023.'
                  },
                  {
                    id: 'Payments & Card Environment',
                    label: 'Payments & Card Environment',
                    desc: 'Payment gateways, card aggregators, and merchants. Scope: RBI PSO 2024 & PCI DSS v4.0.1.'
                  }
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      subSector === item.id
                        ? 'bg-white border-indigo-500 shadow-2xs'
                        : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="subSector"
                      value={item.id}
                      checked={subSector === item.id}
                      onChange={() => setSubSector(item.id as SubSectorType)}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">{item.label}</span>
                      <span className="text-slate-500 text-[11px] leading-relaxed">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="flex items-start space-x-3 p-3 rounded-lg border border-indigo-500 bg-white text-xs cursor-pointer shadow-2xs">
                  <input
                    type="radio"
                    name="subSector"
                    value="General IT"
                    checked={true}
                    readOnly
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">General IT & Software Services</span>
                    <span className="text-slate-500 text-[11px] leading-relaxed">
                      Statutory scope: DPDP Act 2023 & NIST SP 800-37 RMF governance baseline.
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Validation Warning */}
        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Action Button — NO Skip, NO Later, Mandatory Completion */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!industry}
            className="w-full py-3 px-5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Save Organization Profile & Continue to Frameworks</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-slate-400 text-center mt-2 font-mono">
            Demo applicability model: configuring regulatory boundary for autonomous agent runtime.
          </p>
        </div>
      </form>
    </div>
  );
};
