export type AgentRole = 'Admin' | 'Auditor' | 'Vendor';

export type AppMode = 'DEMO' | 'LIVE';

export type DecisionVerdict = 'APPROVED' | 'APPROVAL_REQUIRED' | 'BLOCKED';

export type PolicySourceType = 'REGULATORY' | 'ORGANIZATION_POLICY';

export interface PolicySourceInfo {
  sourceType: PolicySourceType;
  sourceName: string;
  sectionOrControl?: string;
  passageSnippet?: string;
}

export type ToolAction = 'export_customer_data' | 'get_global_risk_report' | 'get_own_compliance_status';

export interface UserSession {
  role: AgentRole;
  userId: string;
  authenticated: boolean;
  mfa_verified: boolean;
  admin_elevated: boolean;
  security_key_verified: boolean;
  organization_id: string;
  license_state: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'UNLICENSED';
  loginTimestamp: string;
  sessionId?: string;
  // Backwards compatibility
  isAdminMfaVerified?: boolean;
}

export type Entitlement =
  | 'CORE_GOVERNANCE'
  | 'DPDP'
  | 'SEBI'
  | 'RBI'
  | 'NIST'
  | 'PCI_DSS';

export interface ProductActivation {
  isActivated: boolean;
  productKey: string;
  organizationName: string;
  organizationId: string;
  licenseState: 'ACTIVE' | 'EXPIRED' | 'UNLICENSED';
  activatedAt: string;
  entitlements: Entitlement[];
}

export type IndustryType = 'IT' | 'Finance';
export type SubSectorType =
  | 'General IT'
  | 'Banking / NBFC'
  | 'Securities & Capital Markets'
  | 'Payments & Card Environment';

export interface OrganizationProfile {
  organizationId: string;
  organizationName: string;
  industry: IndustryType;
  subSector: SubSectorType;
  handlesCardholderData: boolean;
  criticalInformationInfrastructure: boolean;
  sebiRegisteredIntermediary: boolean;
  rbiPaymentSystemOperator: boolean;
  crossBorderDataTransfer: boolean;
}

export type FrameworkStatus =
  | 'AVAILABLE'
  | 'ACTIVE'
  | 'EVALUATED'
  | 'APPLICABLE'
  | 'NOT_APPLICABLE'
  | 'NOT_AVAILABLE'
  | 'NOT_ENABLED'
  | 'NOT_INDEXED'
  | 'EVALUATION_FAILED'
  | 'VIOLATION';

export interface FrameworkRegistryItem {
  source_id: string;
  display_name: string;
  source_type: 'REGULATORY' | 'ORGANIZATION_POLICY';
  version?: string;
  availability: boolean;
  enabled: boolean;
  license_required: boolean;
  license_status: 'LICENSED' | 'UNLICENSED';
  applicability_reason: string;
}

export interface GovernanceCoverageItem {
  frameworkId: string;
  frameworkName: string;
  sourceType: 'REGULATORY' | 'ORGANIZATION_POLICY';
  status: FrameworkStatus;
  statusDetail: string;
  violatingClause?: string;
}

export interface GovernanceCoverageReport {
  availableFrameworks: string[];
  evaluatedFrameworks: string[];
  notEvaluatedFrameworks: { name: string; reason: string }[];
  applicableFrameworks: string[];
  violatingFrameworks: string[];
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskEvaluation {
  risk_score: number; // 0 to 100
  risk_level: RiskLevel;
  risk_reasons: string[];
  model_label: string; // 'Clause-to-Control demo risk model'
}

export interface OrganizationEvidenceItem {
  id: string;
  evidence_id?: string;
  fileName: string;
  filename?: string;
  displayName?: string;
  title: string;
  category: 'CONFIG' | 'ACCESS_LOG' | 'AUDIT_REPORT' | 'INVENTORY';
  fileType: 'JSON' | 'CSV' | 'PDF' | 'TXT' | 'DOCX' | 'XLSX';
  file_type?: string;
  uploadedAt: string;
  uploaded_at?: string;
  fileSize?: number;
  size?: number;
  status?: 'INDEXED' | 'PROCESSING' | 'FAILED';
  source_type?: string;
  errorMessage?: string;
  contentSnippet: string;
  rawContent: string;
  isDemoEvidence: boolean;
}

export interface EvidenceAuditFinding {
  id: string;
  controlId: string;
  controlTitle: string;
  framework: string;
  requirementText: string;
  observedText: string;
  status: 'PASS' | 'PARTIAL' | 'FAIL';
  evidenceSource: string;
  evidenceSources?: string[];
  evidenceLocation: string;
  evidenceExcerpt: string;
  suggestedRemediation: string;
  humanReviewRequired: boolean;
  isDemoEvidence: boolean;
}

export interface SecurityAlertItem {
  id: string;
  timestamp: string;
  role: AgentRole;
  eventType: 'PROMPT_INJECTION' | 'PRIVILEGE_ESCALATION' | 'POLICY_BYPASS' | 'HIGH_RISK_ACTION' | 'PII_EXFILTRATION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  decision: DecisionVerdict;
  flaggedPhrase?: string;
}

export interface OrganizationPolicyDocument {
  id: string;
  fileName: string;
  title: string;
  fileSize: number;
  uploadedAt: string;
  processingStatus: 'PARSED' | 'INDEXED' | 'FAILED';
  sourceType: 'ORGANIZATION_POLICY';
  snippetCount: number;
  rawText: string;
  keyRestrictions: {
    targetRole?: AgentRole | 'All';
    targetAction: ToolAction | 'All';
    restrictionType: 'RESTRICT_VENDOR' | 'REQUIRE_ADMIN_APPROVAL' | 'PROHIBIT_BULK_EXPORT' | 'RESTRICT_RISK_REPORT';
    ruleText: string;
    section?: string;
  }[];
}

export interface NaturalLanguageToolMapping {
  originalQuery: string;
  resolvedAction: ToolAction | null;
  confidence: number;
  mappingMethod: 'KEYWORD_RULE_BASED' | 'SEMANTIC_LLM' | 'UNMAPPED';
  reasoning: string;
}

export interface PolicyRule {
  role: string;
  action: string;
  condition: string;
  allowed: boolean;
  cited_clause: string;
  clause_text: string;
}

export type SecurityThreatType = 'PROMPT_INJECTION' | 'PRIVILEGE_ESCALATION' | 'POLICY_BYPASS' | 'NONE';

export interface SecurityAnalysis {
  passed: boolean;
  threatType: SecurityThreatType;
  flaggedPhrase?: string;
  details: string;
  citedClause?: string;
  clauseText?: string;
  timestamp: string;
  perimeterScanTarget?: string;
}

export interface InterceptionResult {
  decision: DecisionVerdict;
  reason: string;
  cited_clause: string;
  clause_text: string;
  sources: PolicySourceInfo[];
  organizationPolicyApplied?: string;
  raw_output?: string;
  sanitized_output?: string;
  pii_redacted: boolean;
  entities_detected: string[];
  injection_detected: boolean;
  matched_phrase?: string;
  securityAnalysis: SecurityAnalysis;
  riskEvaluation?: RiskEvaluation;
  governanceCoverage?: GovernanceCoverageReport;
  violating_sources?: string[];
  timestamp: string;
  toolMapped?: ToolAction | null;
  naturalQuery?: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  role: AgentRole;
  action: ToolAction | string;
  naturalQuery?: string;
  decision: DecisionVerdict;
  clause: string;
  reason: string;
  sources?: PolicySourceInfo[];
  pii_redacted?: boolean;
  securityAnalysis?: SecurityAnalysis;
  riskEvaluation?: RiskEvaluation;
  governanceCoverage?: GovernanceCoverageReport;
  violating_sources?: string[];
}

export type RegulatoryFramework =
  | 'DPDP Act 2023'
  | 'SEBI CSCRF 2024'
  | 'RBI PSO 2024'
  | 'NIST SP 800-37 RMF'
  | 'PCI DSS v4.0.1';

export interface RegulationItem {
  id: string;
  framework: RegulatoryFramework;
  chapter_or_domain: string;
  section_or_control: string;
  title: string;
  statutory_text: string;
  mandated_control: string;
  penalty_or_consequence: string;
  audit_procedure: string;
  compliance_status: 'COMPLIANT' | 'VIOLATION' | 'ACTION_REQUIRED';
  mapped_agent_action?: string;
  finding?: string;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  penalty_exposure_cr?: number;
}

export interface GRCAuditReport {
  overall_verdict: 'APPROVED' | 'AUDIT_REJECTED';
  total_evaluated: number;
  compliant_count: number;
  violations_count: number;
  total_penalty_exposure_cr: number;
  compliance_percentage: number;
  regulations: RegulationItem[];
  timestamp: string;
  auditor_notes?: string;
}

export interface DemoScenario {
  id: string;
  title: string;
  badge: string;
  role: AgentRole;
  action: ToolAction;
  naturalPrompt?: string;
  context: string;
  description: string;
  expectedDecision: DecisionVerdict;
  expectedClause: string;
}

export type AuditScopeType =
  | 'CUSTOMER_DATA_PROTECTION'
  | 'ENCRYPTION_CONFIG'
  | 'VENDOR_ACCESS'
  | 'AI_AGENT_PERMISSIONS'
  | 'ACCESS_CONTROL_GAPS'
  | 'GLOBAL_CONTROL_AUDIT'
  | 'SPECIFIC_FRAMEWORK';

export interface AuditPlanSource {
  name: string;
  status: 'ACTIVE' | 'NOT_APPLICABLE' | 'NOT_AVAILABLE';
  reason?: string;
}

export interface AuditPlan {
  auditId: string;
  query: string;
  scope: AuditScopeType;
  scopeTitle: string;
  governanceSources: AuditPlanSource[];
  evidenceSources: {
    fileName: string;
    category: string;
    status: string;
  }[];
  totalControls: number;
  canExecute: boolean;
  unavailabilityReason?: string;
}

export interface ChatAuditResult {
  auditId: string;
  query: string;
  scope: AuditScopeType;
  scopeTitle: string;
  overallStatus: 'PASS' | 'PARTIAL' | 'FAIL' | 'UNAVAILABLE';
  totalEvaluated: number;
  passedCount: number;
  partialCount: number;
  failedCount: number;
  findings: EvidenceAuditFinding[];
  governanceCoverage: GovernanceCoverageReport;
  evidenceSourcesUsed: string[];
  remediationSummary: string[];
  timestamp: string;
  unavailabilityReason?: string;
  availableFrameworks?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  timestamp: string;
  text: string;
  type: 'TOOL_EXECUTION' | 'AUDIT_RESULT' | 'SECURITY_BLOCKED' | 'INFORMATIONAL';
  toolResult?: InterceptionResult;
  auditPlan?: AuditPlan;
  auditResult?: ChatAuditResult;
  securityAnalysis?: SecurityAnalysis;
}


