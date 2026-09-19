import React, { useState } from 'react';
import { OrganizationProfile, IndustryType, SubSectorType } from '../types';
import { saveStoredOrgProfile } from '../services/applicabilityEngine';
import { Building, Sliders, CheckCircle2, ShieldAlert, Cpu, CreditCard, Landmark } from 'lucide-react';

interface OrganizationProfileModalProps {
  profile: OrganizationProfile;
  onProfileChange: (newProfile: OrganizationProfile) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const OrganizationProfileModal: React.FC<OrganizationProfileModalProps> = ({
  profile,
  onProfileChange,
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState<OrganizationProfile>({ ...profile });
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredOrgProfile(formData);
    onProfileChange(formData);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1000);
  };

  const handleIndustrySelect = (ind: IndustryType) => {
    if (ind === 'IT') {
      setFormData({
        ...formData,
        industry: 'IT',
        subSector: 'General IT',
        sebiRegisteredIntermediary: false,
        rbiPaymentSystemOperator: false
      });
    } else {
      setFormData({
        ...formData,
        industry: 'Finance',
        subSector: 'Securities & Capital Markets',
        sebiRegisteredIntermediary: true
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Organization Profile & Scope</h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Feeds the Applicability Engine to Determine Regulatory Framework Scope
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Industry Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Industry Sector</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleIndustrySelect('Finance')}
                className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  formData.industry === 'Finance'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span>Finance & Capital Markets</span>
              </button>
              <button
                type="button"
                onClick={() => handleIndustrySelect('IT')}
                className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  formData.industry === 'IT'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>Information Technology</span>
              </button>
            </div>
          </div>

          {/* Sub-Sector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Sub-Sector Classification</label>
            <select
              value={formData.subSector}
              onChange={(e) => setFormData({ ...formData, subSector: e.target.value as SubSectorType })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {formData.industry === 'Finance' ? (
                <>
                  <option value="Securities & Capital Markets">Securities & Capital Markets (SEBI CSCRF)</option>
                  <option value="Banking / NBFC">Banking / NBFC (RBI Cyber Resilience)</option>
                  <option value="Payments & Card Environment">Payments & Card Environment (RBI PSO + PCI DSS)</option>
                </>
              ) : (
                <>
                  <option value="General IT">General IT & Software Services</option>
                  <option value="Critical Information Infrastructure">Critical Information Infrastructure (NIST)</option>
                </>
              )}
            </select>
          </div>

          {/* Specific Statutory Triggers */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="block text-xs font-bold text-slate-700">Authoritative Statutory Scope Triggers:</span>

            <label className="flex items-start space-x-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/70">
              <input
                type="checkbox"
                checked={formData.sebiRegisteredIntermediary}
                onChange={(e) => setFormData({ ...formData, sebiRegisteredIntermediary: e.target.checked })}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="block text-xs font-bold text-slate-800">SEBI Registered Market Intermediary</span>
                <span className="block text-[11px] text-slate-500">
                  Enforces SEBI CSCRF 2024 (Market risk intelligence & contractor isolation)
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/70">
              <input
                type="checkbox"
                checked={formData.rbiPaymentSystemOperator}
                onChange={(e) => setFormData({ ...formData, rbiPaymentSystemOperator: e.target.checked })}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="block text-xs font-bold text-slate-800">RBI Authorized Payment System Operator (PSO)</span>
                <span className="block text-[11px] text-slate-500">
                  Enforces RBI Cyber Resilience Directions 2024 for payment clearing and settlement
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/70">
              <input
                type="checkbox"
                checked={formData.handlesCardholderData}
                onChange={(e) => setFormData({ ...formData, handlesCardholderData: e.target.checked })}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="block text-xs font-bold text-slate-800">Handles Payment Card / PAN Data</span>
                <span className="block text-[11px] text-slate-500">
                  Triggers PCI DSS v4.0.1 Requirement 3.4 & 3.5 PAN masking and query barriers
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/70">
              <input
                type="checkbox"
                checked={formData.criticalInformationInfrastructure}
                onChange={(e) => setFormData({ ...formData, criticalInformationInfrastructure: e.target.checked })}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="block text-xs font-bold text-slate-800">Critical Information Infrastructure (CII)</span>
                <span className="block text-[11px] text-slate-500">
                  Enforces NIST SP 800-37 RMF Task P-11/P-12 and DPDP enhanced safeguards
                </span>
              </div>
            </label>
          </div>

          {savedNotice && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Organization profile updated. Applicability matrix recalculated.</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
            >
              Save Profile & Update Scope
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
