import React, { useState } from 'react';
import { ProductActivation } from '../types';
import { activateProductKey } from '../services/applicabilityEngine';
import { Key, ShieldCheck, CheckCircle2, AlertCircle, Building2, Layers } from 'lucide-react';

interface ProductActivationModalProps {
  activation: ProductActivation;
  onActivationChange: (newActivation: ProductActivation) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductActivationModal: React.FC<ProductActivationModalProps> = ({
  activation,
  onActivationChange,
  isOpen,
  onClose
}) => {
  const [keyInput, setKeyInput] = useState(activation.productKey || 'ACME-DEMO-2026');
  const [orgInput, setOrgInput] = useState(activation.organizationName || 'ACME Demo Organization');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = activateProductKey(keyInput, orgInput);
    if (res.success && res.activation) {
      onActivationChange(res.activation);
      setSuccessMsg('Product Key successfully activated. Entitlements provisioned.');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } else {
      setErrorMsg(res.error || 'Invalid product key.');
    }
  };

  const handleUseDemoKey = () => {
    setKeyInput('ACME-DEMO-2026');
    setOrgInput('ACME Demo Organization');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-900 text-indigo-200 flex items-center justify-center font-bold">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">CLAUSE-TO-CONTROL</h2>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Organization License & Product Key Activation
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Status:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                activation.isActivated
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
            >
              {activation.isActivated ? 'LICENSE ACTIVE' : 'UNLICENSED'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Organization:</span>
            <span className="font-mono text-slate-900 font-bold">{activation.organizationName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Active Key:</span>
            <span className="font-mono text-slate-600">{activation.productKey || 'None'}</span>
          </div>
        </div>

        <form onSubmit={handleActivate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Organization Legal Entity Name
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={orgInput}
                onChange={(e) => setOrgInput(e.target.value)}
                placeholder="e.g. ACME Demo Organization"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-800">
                Product Key
              </label>
              <button
                type="button"
                onClick={handleUseDemoKey}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Use Demo Key
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                placeholder="e.g. ACME-DEMO-2026"
                className="flex-1 px-3 py-2 font-mono text-xs tracking-wider uppercase font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer transition-all"
              >
                ACTIVATE
              </button>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              Demo product keys: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">ACME-DEMO-2026</code> or <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">CTC-HACKFEST-2026</code>
            </span>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 mb-2">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Active Regulatory Entitlements:</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {activation.entitlements.map((ent) => (
                <div
                  key={ent}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-mono font-bold">{ent}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
