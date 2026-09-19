import {
  OrganizationProfile,
  ProductActivation,
  AgentRole,
  AuditPlan,
  AuditPlanSource,
  ChatAuditResult,
  AuditScopeType,
  EvidenceAuditFinding,
  OrganizationEvidenceItem
} from '../types';
import {
  getStoredEvidence,
  getStoredFindings,
  evaluateEvidenceAgainstControls
} from './evidenceAuditService';
import {
  evaluateGovernanceCoverage,
  getApplicableFrameworks
} from './applicabilityEngine';

export interface AuditIntentDetectionResult {
  isAuditRequest: boolean;
  scope: AuditScopeType;
  scopeTitle: string;
  targetFramework?: string;
  confidence: number;
  reasoning: string;
}

const AUDIT_TRIGGER_KEYWORDS = [
  'audit',
  'check',
  'evaluate',
  'assess',
  'review',
  'compliance',
  'controls',
  'control',
  'gap',
  'gaps',
  'failing',
  'failed',
  'statutory',
  'evidence',
  'encryption',
  'vendor access',
  'rbi',
  'sebi',
  'dpdp',
  'pci dss',
  'nist'
];

/**
 * Stage 2a: Detects if natural language query constitutes an audit or compliance evaluation intent.
 */
export function detectAuditIntent(query: string): AuditIntentDetectionResult {
  const norm = query.toLowerCase().trim();

  // Exclude direct tool commands that are not audit inquiries
  if (norm.startsWith('export customer') || norm.startsWith('export the customer')) {
    return {
      isAuditRequest: false,
      scope: 'CUSTOMER_DATA_PROTECTION',
      scopeTitle: 'Customer Export',
      confidence: 0,
      reasoning: 'Direct egress action, not an audit assessment.'
    };
  }

  const hasTrigger = AUDIT_TRIGGER_KEYWORDS.some((kw) => norm.includes(kw));

  if (!hasTrigger) {
    return {
      isAuditRequest: false,
      scope: 'GLOBAL_CONTROL_AUDIT',
      scopeTitle: 'Standard Query',
      confidence: 0,
      reasoning: 'No statutory audit or governance verification keywords identified.'
    };
  }

  // Detect Specific Framework Audit (e.g. "audit against RBI", "check SEBI compliance")
  if (norm.includes('rbi') || norm.includes('reserve bank') || norm.includes('pso')) {
    return {
      isAuditRequest: true,
      scope: 'SPECIFIC_FRAMEWORK',
      scopeTitle: 'RBI Payment System Operator (PSO 2024) Direction Audit',
      targetFramework: 'RBI PSO 2024',
      confidence: 0.95,
      reasoning: 'User requested explicit statutory audit against RBI Payment System Operator regulations.'
    };
  }

  // Detect Evidence Inventory Inquiries (e.g. "What evidence do you have available?", "show evidence")
  if (norm.includes('evidence') && (norm.includes('available') || norm.includes('what') || norm.includes('list') || norm.includes('have') || norm.includes('show') || norm.includes('inventory') || norm.includes('status'))) {
    return {
      isAuditRequest: true,
      scope: 'EVIDENCE_INVENTORY' as any,
      scopeTitle: 'Organization Evidence Artifact Inventory',
      confidence: 0.96,
      reasoning: 'User requested inspection of indexed organization evidence artifacts.'
    };
  }

  if (norm.includes('sebi') || norm.includes('cscrf')) {
    return {
      isAuditRequest: true,
      scope: 'SPECIFIC_FRAMEWORK',
      scopeTitle: 'SEBI Cyber Security & Cyber Resilience Framework (CSCRF 2024) Audit',
      targetFramework: 'SEBI CSCRF 2024',
      confidence: 0.95,
      reasoning: 'User requested explicit statutory audit against SEBI CSCRF cybersecurity controls.'
    };
  }

  if (norm.includes('dpdp') || norm.includes('fiduciary')) {
    return {
      isAuditRequest: true,
      scope: 'SPECIFIC_FRAMEWORK',
      scopeTitle: 'Digital Personal Data Protection Act (DPDP 2023) Audit',
      targetFramework: 'DPDP Act 2023',
      confidence: 0.95,
      reasoning: 'User requested explicit audit against DPDP statutory fiduciary obligations.'
    };
  }

  // Detect Thematic Audit Scopes
  if (norm.includes('encryption') || norm.includes('aes') || norm.includes('crypto') || norm.includes('cipher') || norm.includes('database_encryption')) {
    return {
      isAuditRequest: true,
      scope: 'ENCRYPTION_CONFIG',
      scopeTitle: 'Cryptographic Storage & Database Encryption Audit',
      confidence: 0.95,
      reasoning: 'Targeted evaluation of encryption levels, TLS, and KMS key ring configuration against DPDP and SEBI mandates.'
    };
  }

  if (norm.includes('vendor') || norm.includes('third party') || norm.includes('contractor')) {
    return {
      isAuditRequest: true,
      scope: 'VENDOR_ACCESS',
      scopeTitle: 'Third-Party Vendor Access & Boundary Governance Audit',
      confidence: 0.92,
      reasoning: 'Evaluation of external vendor privileges, customer export restrictions, and isolation controls.'
    };
  }

  if (norm.includes('agent') || norm.includes('permission') || norm.includes('allowlist') || norm.includes('tool permission')) {
    return {
      isAuditRequest: true,
      scope: 'AI_AGENT_PERMISSIONS',
      scopeTitle: 'Autonomous AI Agent Execution Boundary & Permission Audit',
      confidence: 0.9,
      reasoning: 'Audit of approved tool allowlist, security preflight filters, and natural language mediator boundaries.'
    };
  }

  if (norm.includes('access control') || norm.includes('iam') || norm.includes('mfa') || norm.includes('privileged')) {
    return {
      isAuditRequest: true,
      scope: 'ACCESS_CONTROL_GAPS',
      scopeTitle: 'IAM & Administrative Privilege Access Control Gap Audit',
      confidence: 0.94,
      reasoning: 'Inspection of IAM access records for unverified administrator accounts and missing multi-factor authentication.'
    };
  }

  if (norm.includes('customer data') || norm.includes('personal data') || norm.includes('pii') || norm.includes('pan')) {
    return {
      isAuditRequest: true,
      scope: 'CUSTOMER_DATA_PROTECTION',
      scopeTitle: 'Customer Personal Data Protection & Fiduciary Safeguards Audit',
      confidence: 0.92,
      reasoning: 'Statutory verification of customer PII safeguards, PAN redaction, and database storage encryption.'
    };
  }

  // Default to Global Control Gap Audit (e.g. "tell me which controls are failing", "audit our compliance status")
  return {
    isAuditRequest: true,
    scope: 'GLOBAL_CONTROL_AUDIT',
    scopeTitle: 'Comprehensive Multi-Framework Control Gap & Evidence Audit',
    confidence: 0.88,
    reasoning: 'Comprehensive audit comparing all indexed institutional evidence against active governance baselines.'
  };
}

/**
 * Builds a deterministic AI Audit Plan prior to execution.
 * Checks whether requested governance sources are actually available and applicable.
 */
export function buildAuditPlan(
  detection: AuditIntentDetectionResult,
  profile: OrganizationProfile,
  activation: ProductActivation
): AuditPlan {
  const auditId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const applicableFrameworks = getApplicableFrameworks(profile, activation);
  const evidenceList = getStoredEvidence();

  const governanceSources: AuditPlanSource[] = [];

  // Check Core Frameworks
  const isFinance = profile.industry === 'Finance';
  const isSebi = profile.sebiRegisteredIntermediary;
  const isRbi = profile.rbiPaymentSystemOperator;
  const isPci = profile.handlesCardholderData;

  // DPDP is universally applicable to all digital data fiduciaries
  governanceSources.push({
    name: 'DPDP Act 2023',
    status: 'ACTIVE',
    reason: 'Digital personal data fiduciary statutory requirement'
  });

  // SEBI CSCRF
  governanceSources.push({
    name: 'SEBI CSCRF 2024',
    status: isSebi ? 'ACTIVE' : 'NOT_APPLICABLE',
    reason: isSebi
      ? 'Mandatory cyber resilience framework for SEBI registered capital market intermediaries'
      : 'Entity is not registered as a SEBI capital market intermediary'
  });

  // RBI PSO
  governanceSources.push({
    name: 'RBI PSO 2024',
    status: isRbi ? 'ACTIVE' : 'NOT_APPLICABLE',
    reason: isRbi
      ? 'Payment System Operator directions under PSS Act 2007'
      : 'Entity is not licensed as an RBI Payment System Operator'
  });

  // NIST SP 800-37 RMF
  governanceSources.push({
    name: 'NIST SP 800-37 RMF',
    status: 'ACTIVE',
    reason: 'Institutional AI risk management baseline'
  });

  // PCI DSS
  governanceSources.push({
    name: 'PCI DSS v4.0.1',
    status: isPci ? 'ACTIVE' : 'NOT_APPLICABLE',
    reason: isPci
      ? 'Active cardholder data environment (CDE) in scope'
      : 'Entity does not ingest or store payment cardholder data directly'
  });

  // Add Organization Policies
  governanceSources.push({
    name: 'Indexed Organization Policies',
    status: 'ACTIVE',
    reason: 'Internal AI charters and data handling guidelines'
  });

  // CRITICAL CHECK: If user asked for a specific framework (e.g. RBI) that is NOT active
  if (detection.scope === 'SPECIFIC_FRAMEWORK' && detection.targetFramework) {
    const targetSource = governanceSources.find((s) => s.name === detection.targetFramework);
    if (!targetSource || targetSource.status !== 'ACTIVE') {
      const activeList = governanceSources.filter((s) => s.status === 'ACTIVE').map((s) => s.name);
      return {
        auditId,
        query: detection.reasoning,
        scope: detection.scope,
        scopeTitle: detection.scopeTitle,
        governanceSources,
        evidenceSources: evidenceList.map((e) => ({
          fileName: e.fileName,
          category: e.category,
          status: e.status || 'INDEXED'
        })),
        totalControls: 0,
        canExecute: false,
        unavailabilityReason: `The requested governance source (${detection.targetFramework}) is NOT APPLICABLE or NOT CONFIGURED for this organization (${profile.industry} / ${profile.subSector}). Entities without licensed Payment System Operator status do not maintain RBI compliance mandates. The AI cannot invent compliance findings for unindexed regulatory bodies. Available applicable frameworks: ${activeList.join(', ')}.`
      };
    }
  }

  // Evidence Sources
  const evidenceSources = evidenceList.map((e) => ({
    fileName: e.displayName || e.fileName,
    category: e.category,
    status: e.status || 'INDEXED'
  }));

  return {
    auditId,
    query: detection.reasoning,
    scope: detection.scope,
    scopeTitle: detection.scopeTitle,
    governanceSources,
    evidenceSources,
    totalControls: 4 + evidenceList.length,
    canExecute: true
  };
}

/**
 * Executes a deterministic compliance audit directly for the AI Agent Chat.
 * Compares statutory requirements vs. observed configuration evidence across all indexed documents.
 */
export function executeChatAudit(
  query: string,
  profile: OrganizationProfile,
  activation: ProductActivation,
  role: AgentRole
): ChatAuditResult {
  const timestamp = new Date().toISOString();
  const detection = detectAuditIntent(query);
  const auditPlan = buildAuditPlan(detection, profile, activation);

  // If audit plan cannot execute (e.g. requested framework not available)
  if (!auditPlan.canExecute) {
    const activeFrameworks = auditPlan.governanceSources
      .filter((s) => s.status === 'ACTIVE')
      .map((s) => s.name);

    return {
      auditId: auditPlan.auditId,
      query,
      scope: detection.scope,
      scopeTitle: detection.scopeTitle,
      overallStatus: 'UNAVAILABLE',
      totalEvaluated: 0,
      passedCount: 0,
      partialCount: 0,
      failedCount: 0,
      findings: [],
      governanceCoverage: evaluateGovernanceCoverage(role, null, profile, activation, [detection.targetFramework || 'RBI PSO 2024']),
      evidenceSourcesUsed: [],
      remediationSummary: [
        `Audit cannot be completed: The requested statutory framework (${detection.targetFramework || 'Regulatory Framework'}) is not active or applicable to this organization profile.`,
        `To evaluate this framework, update the Organization Profile via the profile settings to enable the required regulatory status.`
      ],
      timestamp,
      unavailabilityReason: auditPlan.unavailabilityReason,
      availableFrameworks: activeFrameworks
    };
  }

  // Retrieve current session's indexed evidence
  const evidenceList = getStoredEvidence();

  // If no evidence is loaded in this session, return clear status
  if (evidenceList.length === 0) {
    return {
      auditId: auditPlan.auditId,
      query,
      scope: detection.scope,
      scopeTitle: detection.scopeTitle,
      overallStatus: 'UNAVAILABLE',
      totalEvaluated: 0,
      passedCount: 0,
      partialCount: 0,
      failedCount: 0,
      findings: [],
      governanceCoverage: evaluateGovernanceCoverage(role, null, profile, activation, ['DPDP Act 2023', 'SEBI CSCRF 2024']),
      evidenceSourcesUsed: [],
      remediationSummary: [
        'No organization evidence has been uploaded in this session.',
        'Upload infrastructure configuration files, access lists, or statutory reports to execute control verification.'
      ],
      timestamp,
      unavailabilityReason: 'No organization evidence has been uploaded in this session.',
      availableFrameworks: auditPlan.governanceSources.map((s) => s.name)
    };
  }

  // Handle Evidence Inventory inspection
  if ((detection.scope as any) === 'EVIDENCE_INVENTORY') {
    const fileList = evidenceList.map((e) => `${e.displayName || e.fileName} (${e.category})`).join(', ');
    return {
      auditId: auditPlan.auditId,
      query,
      scope: detection.scope,
      scopeTitle: detection.scopeTitle,
      overallStatus: 'PASS',
      totalEvaluated: evidenceList.length,
      passedCount: evidenceList.length,
      partialCount: 0,
      failedCount: 0,
      findings: [],
      governanceCoverage: evaluateGovernanceCoverage(role, null, profile, activation, ['DPDP Act 2023', 'SEBI CSCRF 2024']),
      evidenceSourcesUsed: evidenceList.map((e) => e.displayName || e.fileName),
      remediationSummary: [
        `Active session evidence repository contains ${evidenceList.length} verified artifact(s): ${fileList}.`
      ],
      timestamp,
      unavailabilityReason: undefined,
      availableFrameworks: auditPlan.governanceSources.map((s) => s.name)
    };
  }

  // Run multi-document evaluation across ALL indexed documents
  const allFindings = evaluateEvidenceAgainstControls(evidenceList);

  // Filter findings according to detected audit scope
  let targetedFindings: EvidenceAuditFinding[] = [];

  switch (detection.scope) {
    case 'ENCRYPTION_CONFIG':
      targetedFindings = allFindings.filter(
        (f) =>
          f.controlId.includes('DPDP-SEC-8-5') ||
          f.controlId.includes('PR.DS.S1') ||
          f.requirementText.toLowerCase().includes('cryptographic') ||
          f.requirementText.toLowerCase().includes('aes-256') ||
          f.observedText.toLowerCase().includes('encryption')
      );
      break;

    case 'ACCESS_CONTROL_GAPS':
      targetedFindings = allFindings.filter(
        (f) =>
          f.controlId.includes('PR.AA.S1') ||
          f.controlId.includes('PCI-DSS-REQ-8') ||
          f.requirementText.toLowerCase().includes('mfa') ||
          f.observedText.toLowerCase().includes('mfa') ||
          f.controlTitle.toLowerCase().includes('access')
      );
      break;

    case 'CUSTOMER_DATA_PROTECTION':
      targetedFindings = allFindings.filter(
        (f) =>
          f.controlId.includes('DPDP-SEC-8-5') ||
          f.controlId.includes('PCI-DSS-REQ-3') ||
          f.controlId.includes('PR.DS.S2') ||
          f.requirementText.toLowerCase().includes('pan') ||
          f.requirementText.toLowerCase().includes('personal data')
      );
      break;

    case 'VENDOR_ACCESS':
      targetedFindings = allFindings.filter(
        (f) =>
          f.controlId.includes('PR.DS.S2') ||
          f.controlTitle.toLowerCase().includes('vendor') ||
          f.observedText.toLowerCase().includes('vendor')
      );
      break;

    case 'AI_AGENT_PERMISSIONS':
      targetedFindings = allFindings.filter(
        (f) =>
          f.controlId.includes('PR.DS.S2') ||
          f.requirementText.toLowerCase().includes('agent') ||
          f.observedText.toLowerCase().includes('runtime') ||
          f.controlTitle.toLowerCase().includes('autonomous')
      );
      break;

    case 'SPECIFIC_FRAMEWORK':
      if (detection.targetFramework) {
        const tfNorm = detection.targetFramework.toLowerCase();
        targetedFindings = allFindings.filter((f) =>
          f.framework.toLowerCase().includes(tfNorm)
        );
      }
      break;

    case 'GLOBAL_CONTROL_AUDIT':
    default:
      // If user asked "which controls are failing"
      if (query.toLowerCase().includes('failing') || query.toLowerCase().includes('failed')) {
        targetedFindings = allFindings.filter((f) => f.status === 'FAIL' || f.status === 'PARTIAL');
      } else {
        targetedFindings = allFindings;
      }
      break;
  }

  // If filtered set was empty, fallback to all findings to provide complete transparency
  if (targetedFindings.length === 0) {
    targetedFindings = allFindings;
  }

  const passedCount = targetedFindings.filter((f) => f.status === 'PASS').length;
  const partialCount = targetedFindings.filter((f) => f.status === 'PARTIAL').length;
  const failedCount = targetedFindings.filter((f) => f.status === 'FAIL').length;

  let overallStatus: 'PASS' | 'PARTIAL' | 'FAIL' = 'PASS';
  if (failedCount > 0) {
    overallStatus = 'FAIL';
  } else if (partialCount > 0) {
    overallStatus = 'PARTIAL';
  }

  // Collect evidence source names
  const evidenceSourcesUsed = Array.from(
    new Set(targetedFindings.map((f) => f.evidenceSource).filter(Boolean))
  );

  // Generate actionable remediation summaries
  const remediationSummary = targetedFindings
    .filter((f) => f.status === 'FAIL' || f.status === 'PARTIAL')
    .map((f) => `[${f.controlId}] ${f.suggestedRemediation} (Human Review Required: YES)`);

  if (remediationSummary.length === 0) {
    remediationSummary.push('All evaluated controls meet statutory baselines. Maintain continuous monitoring.');
  }

  const violatingFrameworks = targetedFindings
    .filter((f) => f.status === 'FAIL')
    .map((f) => f.framework);

  const governanceCoverage = evaluateGovernanceCoverage(
    role,
    null,
    profile,
    activation,
    violatingFrameworks
  );

  return {
    auditId: auditPlan.auditId,
    query,
    scope: detection.scope,
    scopeTitle: detection.scopeTitle,
    overallStatus,
    totalEvaluated: targetedFindings.length,
    passedCount,
    partialCount,
    failedCount,
    findings: targetedFindings,
    governanceCoverage,
    evidenceSourcesUsed,
    remediationSummary,
    timestamp
  };
}
