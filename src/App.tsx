import React, { useState } from 'react';
import { Navbar, AppTab } from './components/Navbar';
import { ConsoleView } from './components/ConsoleView';
import { AuthModal } from './components/AuthModal';
import { OrganizationPolicyView } from './components/OrganizationPolicyView';
import { GRCAuditorView } from './components/GRCAuditorView';
import { PlaybookView } from './components/PlaybookView';
import { PolicyMatrixView } from './components/PolicyMatrixView';
import { RegulationsView } from './components/RegulationsView';
import { CodebaseViewer } from './components/CodebaseViewer';
import { EvidenceAuditView } from './components/EvidenceAuditView';
import { ProductActivationModal } from './components/ProductActivationModal';
import { OrganizationProfileModal } from './components/OrganizationProfileModal';
import { SecurityAlertsBanner } from './components/SecurityAlertsBanner';
import { WorkflowStepper, WorkflowStepId } from './components/WorkflowStepper';
import { OrganizationProfileStep } from './components/OrganizationProfileStep';
import { GovernanceSetupStep } from './components/GovernanceSetupStep';
import { PolicyEvidenceSetupStep } from './components/PolicyEvidenceSetupStep';
import {
  AuditRecord,
  DemoScenario,
  AppMode,
  UserSession,
  OrganizationProfile,
  ProductActivation,
  SecurityAlertItem
} from './types';
import { INITIAL_AUDIT_LOGS } from './data/mockData';
import { DEFAULT_ORG_PROFILE, EMPTY_ORG_PROFILE, getStoredProductActivation } from './services/applicabilityEngine';
import { clearAllSessionData, generateSessionId, setActiveSessionId } from './services/sessionManager';
import { Lock, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('console');
  const [appMode, setAppMode] = useState<AppMode>('DEMO');
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);

  // Security Principle: User starts unauthenticated.
  const [session, setSession] = useState<UserSession | null>(null);

  // Workflow Pipeline State (Sequential Gating: Auth -> Org Profile -> Governance -> Policies -> Agent)
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<WorkflowStepId>('AUTH');
  const [organizationProfileComplete, setOrganizationProfileComplete] = useState<boolean>(false);
  const [governanceConfigComplete, setGovernanceConfigComplete] = useState<boolean>(false);
  const [policyEvidenceComplete, setPolicyEvidenceComplete] = useState<boolean>(false);

  // Locked Tab Notice State
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  // Organization profile & applicability state - starts with clean empty profile for fresh sessions
  const [orgProfile, setOrgProfile] = useState<OrganizationProfile>(EMPTY_ORG_PROFILE);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // Product key & activation state (Persistent across sessions)
  const [productActivation, setProductActivation] = useState<ProductActivation>(getStoredProductActivation);
  const [showActivationModal, setShowActivationModal] = useState<boolean>(false);

  // Security alert queue: Empty by default. Only rendered for authenticated Admins.
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlertItem[]>([]);

  // Natural prompt initial value when passed from scenarios
  const [consoleInitialPrompt, setConsoleInitialPrompt] = useState<string>(
    "Show me the organization's global risk report."
  );

  // Determine completed steps
  const completedSteps: WorkflowStepId[] = [];
  if (session && session.authenticated) completedSteps.push('AUTH');
  if (organizationProfileComplete) completedSteps.push('ORG_PROFILE');
  if (governanceConfigComplete) completedSteps.push('GOVERNANCE_SETUP');
  if (policyEvidenceComplete) completedSteps.push('POLICY_EVIDENCE');
  if (
    session?.authenticated &&
    organizationProfileComplete &&
    governanceConfigComplete &&
    policyEvidenceComplete
  ) {
    completedSteps.push('AGENT_READY');
  }

  const isWorkflowUnlocked = Boolean(
    session?.authenticated &&
    organizationProfileComplete &&
    governanceConfigComplete &&
    policyEvidenceComplete
  );

  const handleAddAuditLog = (record: AuditRecord) => {
    setAuditLogs((prev) => [record, ...prev]);
  };

  const handleLoginSuccess = (newSession: UserSession) => {
    const sessionId = newSession.sessionId || generateSessionId();
    const sessionWithId: UserSession = {
      ...newSession,
      sessionId
    };
    setActiveSessionId(sessionId);
    setSession(sessionWithId);
    setLockedNotice(null);
    if (!organizationProfileComplete) {
      setActiveWorkflowStep('ORG_PROFILE');
    } else if (!governanceConfigComplete) {
      setActiveWorkflowStep('GOVERNANCE_SETUP');
    } else if (!policyEvidenceComplete) {
      setActiveWorkflowStep('POLICY_EVIDENCE');
    } else {
      setActiveWorkflowStep('AGENT_READY');
    }
  };

  const handleLogout = () => {
    // 1. Purge all Category C confidential session data from browser storage
    clearAllSessionData();

    // 2. Clear all in-memory React session and onboarding states
    setSession(null);
    setActiveWorkflowStep('AUTH');
    setLockedNotice(null);
    setSecurityAlerts([]);
    setOrganizationProfileComplete(false);
    setGovernanceConfigComplete(false);
    setPolicyEvidenceComplete(false);
    setOrgProfile(EMPTY_ORG_PROFILE);
    setAuditLogs([]);
    setActiveTab('console');
  };

  const handleOrgProfileComplete = (updatedProfile: OrganizationProfile) => {
    setOrgProfile(updatedProfile);
    setOrganizationProfileComplete(true);
    setActiveWorkflowStep('GOVERNANCE_SETUP');
    setLockedNotice(null);
  };

  const handleGovernanceConfirm = () => {
    setGovernanceConfigComplete(true);
    setActiveWorkflowStep('POLICY_EVIDENCE');
    setLockedNotice(null);
  };

  const handlePolicyEvidenceComplete = () => {
    setPolicyEvidenceComplete(true);
    setActiveWorkflowStep('AGENT_READY');
    setActiveTab('console');
    setLockedNotice(null);
  };

  const handleLockedTabClick = (tabName: string) => {
    if (!session || !session.authenticated) {
      setLockedNotice(`Complete Step 1: Authentication first to access ${tabName}.`);
    } else if (!organizationProfileComplete) {
      setLockedNotice(`Complete Step 2: Mandatory Company Type selection first to access ${tabName}.`);
    } else if (!governanceConfigComplete) {
      setLockedNotice(`Complete Step 3: Governance Baseline setup first to access ${tabName}.`);
    } else if (!policyEvidenceComplete) {
      setLockedNotice(`Complete Step 4: Policy & Evidence verification first to access ${tabName}.`);
    } else {
      setLockedNotice(`Complete previous setup steps first.`);
    }
  };

  const handleSelectScenario = (scenario: DemoScenario) => {
    if (scenario.naturalPrompt) {
      setConsoleInitialPrompt(scenario.naturalPrompt);
    } else {
      switch (scenario.action) {
        case 'export_customer_data':
          setConsoleInitialPrompt("Export the customer information.");
          break;
        case 'get_global_risk_report':
          setConsoleInitialPrompt("Show me the organization's global risk report.");
          break;
        case 'get_own_compliance_status':
          setConsoleInitialPrompt("Show me my compliance status.");
          break;
      }
    }
    setActiveTab('console');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        appMode={appMode}
        onToggleAppMode={(mode) => setAppMode(mode)}
        activation={productActivation}
        onOpenActivationModal={() => setShowActivationModal(true)}
        profile={orgProfile}
        onOpenProfileModal={() => setShowProfileModal(true)}
        session={session}
        isWorkflowUnlocked={isWorkflowUnlocked}
        onLockedTabClick={handleLockedTabClick}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Real-time Security Incident Alert Banner (ONLY rendered for authenticated Admins) */}
        {session && session.authenticated && session.role === 'Admin' && (
          <SecurityAlertsBanner
            alerts={securityAlerts}
            userRole={session.role}
            onClearAlerts={() => setSecurityAlerts([])}
          />
        )}

        {/* Locked Step Notice Banner */}
        {lockedNotice && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl p-3.5 flex items-center justify-between shadow-2xs animate-in fade-in duration-150">
            <div className="flex items-center space-x-2.5 text-xs font-semibold">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{lockedNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setLockedNotice(null)}
              className="p-1 text-amber-700 hover:text-amber-900 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Workflow Stepper Navigation (Only visible in Demo Mode; completely hidden in Live Mode) */}
        {appMode === 'DEMO' && (
          <WorkflowStepper
            currentStep={activeWorkflowStep}
            completedSteps={completedSteps}
            onSelectStep={(step) => {
              if (completedSteps.includes(step) || step === activeWorkflowStep) {
                setActiveWorkflowStep(step);
                setLockedNotice(null);
              } else {
                setLockedNotice('Complete the previous setup steps first before navigating to this stage.');
              }
            }}
            onLockedClick={(stepTitle) => {
              setLockedNotice(`Complete the previous setup step first to unlock ${stepTitle}.`);
            }}
          />
        )}

        {/* WORKFLOW PIPELINE RENDERING */}

        {/* Step 1: Authentication */}
        {activeWorkflowStep === 'AUTH' && (
          <div className="space-y-4">
            <AuthModal
              currentSession={session}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
              appMode={appMode}
            />
          </div>
        )}

        {/* Step 2: Mandatory Organization Profile (Company Type Selection) */}
        {activeWorkflowStep === 'ORG_PROFILE' && (
          <OrganizationProfileStep
            currentProfile={orgProfile}
            onComplete={handleOrgProfileComplete}
          />
        )}

        {/* Step 3: Governance Framework Applicability Baseline */}
        {activeWorkflowStep === 'GOVERNANCE_SETUP' && (
          <GovernanceSetupStep
            profile={orgProfile}
            onConfirm={handleGovernanceConfirm}
            onBack={() => setActiveWorkflowStep('ORG_PROFILE')}
          />
        )}

        {/* Step 4: Organization Policy & Evidence Setup */}
        {activeWorkflowStep === 'POLICY_EVIDENCE' && (
          <PolicyEvidenceSetupStep
            onComplete={handlePolicyEvidenceComplete}
            onBack={() => setActiveWorkflowStep('GOVERNANCE_SETUP')}
          />
        )}

        {/* Step 5: Agent Ready (Full Console & Protected Navigation Unlocked) */}
        {activeWorkflowStep === 'AGENT_READY' && isWorkflowUnlocked && (
          <>
            {/* Tab 1: AI Chat & Gateway Console */}
            {activeTab === 'console' && session && session.authenticated && (
              <ConsoleView
                key={`${session.role}-${session.sessionId || ''}-${session.isAdminMfaVerified}-${consoleInitialPrompt}-${orgProfile.industry}-${productActivation.isActivated}`}
                auditLogs={auditLogs}
                onAddAuditLog={handleAddAuditLog}
                session={session}
                appMode={appMode}
                initialPrompt={consoleInitialPrompt}
                orgProfile={orgProfile}
                productActivation={productActivation}
                onAddSecurityAlert={(alert) => setSecurityAlerts(prev => [alert, ...prev])}
                onNavigateToTab={(tab) => setActiveTab(tab as any)}
              />
            )}

            {/* Tab 2: Organization Policies */}
            {activeTab === 'org_policies' && <OrganizationPolicyView />}

            {/* Tab 3: Evidence & Audit View (Supporting Inspection Area) */}
            {activeTab === 'evidence' && (
              <EvidenceAuditView onNavigateToTab={(tab) => setActiveTab(tab as any)} />
            )}

            {/* Tab 4: GRC Matrix (Demo Mode) */}
            {activeTab === 'grc' && appMode === 'DEMO' && <GRCAuditorView />}

            {/* Tab 5: Scenarios Playbook (Demo Mode) */}
            {activeTab === 'playbook' && appMode === 'DEMO' && (
              <PlaybookView onSelectScenario={handleSelectScenario} />
            )}

            {/* Tab 6: Policy Matrix (Demo Mode) */}
            {activeTab === 'matrix' && appMode === 'DEMO' && <PolicyMatrixView />}

            {/* Tab 7: Regulations (Demo Mode) */}
            {activeTab === 'regulations' && appMode === 'DEMO' && <RegulationsView />}

            {/* Tab 8: Codebase Viewer (Demo Mode) */}
            {activeTab === 'codebase' && appMode === 'DEMO' && <CodebaseViewer />}
          </>
        )}
      </main>

      {/* Global Modals for Organization Profile & Product Key */}
      <ProductActivationModal
        isOpen={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        activation={productActivation}
        onActivationChange={(updated: ProductActivation) => setProductActivation(updated)}
      />

      <OrganizationProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={orgProfile}
        onProfileChange={(updated: OrganizationProfile) => setOrgProfile(updated)}
      />

      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 flex-wrap justify-center sm:justify-start">
            <span className="font-bold text-slate-800">Clause-to-Control</span>
            <span>•</span>
            <span className="font-mono text-indigo-700 font-semibold">{appMode} MODE</span>
            <span>•</span>
            <span>{orgProfile.industry} Profile ({orgProfile.subSector})</span>
          </div>
          <div>
            Comprehensive 5-Framework Governance: DPDP Act 2023, SEBI CSCRF 2024, RBI PSO 2024, NIST SP 800-37 RMF & PCI DSS v4.0.1
          </div>
        </div>
      </footer>
    </div>
  );
}
