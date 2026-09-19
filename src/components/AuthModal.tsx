import React, { useState } from 'react';
import { UserSession, AppMode } from '../types';
import {
  Shield,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Usb,
  Sparkles,
  KeyRound
} from 'lucide-react';

interface AuthModalProps {
  onLoginSuccess: (session: UserSession) => void;
  currentSession: UserSession | null;
  onLogout: () => void;
  appMode?: AppMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onLoginSuccess,
  currentSession,
  onLogout,
  appMode = 'DEMO'
}) => {
  // Login tabs: Vendor, Auditor, or Admin
  const [authPath, setAuthPath] = useState<'Vendor' | 'Auditor' | 'Admin'>('Vendor');
  const [userId, setUserId] = useState('vendor-sec-01');
  const [password, setPassword] = useState('vendor123');
  const [mfaCode, setMfaCode] = useState('749201');
  const [securityKeyVerified, setSecurityKeyVerified] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Admin multi-stage challenge state (only activated AFTER admin credentials are submitted)
  const [adminChallengeStage, setAdminChallengeStage] = useState<'CREDENTIALS' | 'MFA_CHALLENGE' | 'KEY_CHALLENGE'>('CREDENTIALS');

  const handleRoleTabChange = (role: 'Vendor' | 'Auditor' | 'Admin') => {
    setAuthPath(role);
    setLoginError('');
    setAdminChallengeStage('CREDENTIALS');
    setSecurityKeyVerified(false);
    if (role === 'Vendor') {
      setUserId('vendor-sec-01');
      setPassword('vendor123');
      setMfaCode('749201');
    } else if (role === 'Auditor') {
      setUserId('auditor-cscrf-99');
      setPassword('auditPass2025');
      setMfaCode('749201');
    } else {
      setUserId('admin-sec-master');
      setPassword('adminMasterPass2026!');
      setMfaCode('749201');
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!userId.trim() || !password.trim()) {
      setLoginError('Please enter both User ID and Password.');
      return;
    }

    if (authPath === 'Admin') {
      // Validate administrator primary credentials first
      if (password !== 'adminMasterPass2026!' && password !== 'admin123') {
        setLoginError('Invalid Administrator credentials.');
        return;
      }

      // Progress to secondary factor verification (never disclosed on the public selector)
      setAdminChallengeStage('MFA_CHALLENGE');
      return;
    }

    // Authenticate session for Vendor or Auditor
    const newSession: UserSession = {
      role: authPath,
      userId: userId.trim(),
      authenticated: true,
      mfa_verified: true,
      admin_elevated: false,
      security_key_verified: false,
      organization_id: 'org-acme-001',
      license_state: 'ACTIVE',
      isAdminMfaVerified: false,
      loginTimestamp: new Date().toISOString()
    };

    onLoginSuccess(newSession);
  };

  const handleAdminMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (mfaCode !== '749201' && mfaCode !== '123456') {
      setLoginError('Invalid TOTP verification code. Use demo code 749201 or 123456.');
      return;
    }

    // Progress to hardware/virtual security key attestation
    setAdminChallengeStage('KEY_CHALLENGE');
  };

  const handleAdminKeyAttestation = () => {
    setSecurityKeyVerified(true);

    const adminSession: UserSession = {
      role: 'Admin',
      userId: userId.trim(),
      authenticated: true,
      mfa_verified: true,
      admin_elevated: true,
      security_key_verified: true,
      organization_id: 'org-acme-001',
      license_state: 'ACTIVE',
      isAdminMfaVerified: true,
      loginTimestamp: new Date().toISOString()
    };

    onLoginSuccess(adminSession);
  };

  // If user is already authenticated
  if (currentSession && currentSession.authenticated) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                currentSession.role === 'Admin'
                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                  : currentSession.role === 'Auditor'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Active Session:
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    currentSession.role === 'Admin'
                      ? 'bg-purple-700 text-white'
                      : currentSession.role === 'Auditor'
                      ? 'bg-blue-700 text-white'
                      : 'bg-emerald-700 text-white'
                  }`}
                >
                  {currentSession.role}
                </span>
                <span className="inline-flex items-center text-xs text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  AUTHENTICATED
                </span>
                {currentSession.role === 'Admin' && currentSession.isAdminMfaVerified && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 flex items-center space-x-1">
                    <Usb className="w-3 h-3" />
                    <span>SECURITY KEY VERIFIED ✓</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-mono break-all">
                ID: {currentSession.userId} • Org: {currentSession.organization_id || 'org-acme-001'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={onLogout}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-all cursor-pointer text-center"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen: Vendor, Auditor, and Admin
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm max-w-lg w-full mx-auto my-4">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Clause-to-Control</h2>
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mt-0.5">Secure Access Gateway</p>
        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          Sign in to your authorized enclave. Privileges are derived from authenticated credentials, never natural-language prompt declarations.
        </p>
      </div>

      {/* 3 Public Entry Paths — Neutral Labels (NO public disclosure of MFA or security-key specifics) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5 p-1.5 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => handleRoleTabChange('Vendor')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
            authPath === 'Vendor'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Vendor Login
        </button>
        <button
          type="button"
          onClick={() => handleRoleTabChange('Auditor')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
            authPath === 'Auditor'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Auditor Login
        </button>
        <button
          type="button"
          onClick={() => handleRoleTabChange('Admin')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
            authPath === 'Admin'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          Admin Login
        </button>
      </div>

      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 mb-5 text-xs text-slate-600 leading-relaxed">
        {authPath === 'Vendor' ? (
          <div>
            <span className="font-bold text-slate-800">Vendor Enclave:</span> Third-party contractors authenticate here. Subject to automated PII redaction and strict vendor segregation (DPDP Sec 16 & CSCRF PR.DS.S2).
          </div>
        ) : authPath === 'Auditor' ? (
          <div>
            <span className="font-bold text-slate-800">Auditor Enclave:</span> Statutory compliance officers authenticate here with inspection permissions for regulatory review and audit evidence.
          </div>
        ) : (
          <div>
            <span className="font-bold text-slate-800">Administrator Enclave:</span> Privileged operations gateway requiring verified administrator identity and progressive multi-factor validation.
          </div>
        )}
      </div>

      {/* Admin Progressive Challenge (Revealed only after initial administrator credentials submit) */}
      {authPath === 'Admin' && adminChallengeStage === 'MFA_CHALLENGE' ? (
        <form onSubmit={handleAdminMfaSubmit} className="space-y-4 animate-in fade-in duration-150">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>Identity Verification Step 1 of 2: TOTP Code</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Enter your 6-digit Time-Based One-Time Password (TOTP) from your authenticator application.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              6-Digit Authenticator Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder="749201"
              className="w-full px-3 py-2 text-center tracking-widest font-mono text-lg font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
              required
            />
            <span className="text-[11px] text-slate-500 block mt-1">
              Demo code: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">749201</code> or <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">123456</code>
            </span>
          </div>

          {loginError && (
            <div className="text-xs text-red-600 font-semibold flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setAdminChallengeStage('CREDENTIALS')}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              ← Back to Credentials
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      ) : authPath === 'Admin' && adminChallengeStage === 'KEY_CHALLENGE' ? (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-xs text-indigo-900 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <Usb className="w-4 h-4 text-indigo-700" />
              <span>Identity Verification Step 2 of 2: Security Key</span>
            </div>
            <p className="text-[11px] text-indigo-800">
              Cryptographic hardware key attestation required under SEBI CSCRF PR.AA.S1.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mx-auto text-slate-700">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {appMode === 'DEMO'
                  ? 'Virtual Security Key (Simulated FIDO2 / WebAuthn)'
                  : 'WebAuthn Security Key Sensor'}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {appMode === 'DEMO'
                  ? 'Click below to simulate cryptographic token attestation.'
                  : 'Insert your registered security key and touch the sensor.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAdminKeyAttestation}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{appMode === 'DEMO' ? 'Touch Virtual FIDO2 Key (Attest)' : 'Attest Security Key'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setAdminChallengeStage('MFA_CHALLENGE')}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              ← Back to TOTP
            </button>
            <button
              type="button"
              onClick={() => setAdminChallengeStage('CREDENTIALS')}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Standard Username & Password Form */
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              User Identifier
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none min-w-0"
              placeholder="Enter User ID..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none min-w-0"
              placeholder="Enter password..."
              required
            />
          </div>

          {loginError && (
            <div className="text-xs text-red-600 font-semibold flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Sign In as {authPath}
          </button>
        </form>
      )}

      <div className="mt-5 pt-3.5 border-t border-slate-100 text-[11px] text-slate-500 text-center leading-relaxed">
        Demo Accounts: <span className="font-mono text-slate-700 font-semibold">vendor-sec-01</span> / <span className="font-mono text-slate-700 font-semibold">vendor123</span> • <span className="font-mono text-slate-700 font-semibold">auditor-cscrf-99</span> / <span className="font-mono text-slate-700 font-semibold">auditPass2025</span> • <span className="font-mono text-slate-700 font-semibold">admin-sec-master</span> / <span className="font-mono text-slate-700 font-semibold">adminMasterPass2026!</span>
      </div>
    </div>
  );
};
