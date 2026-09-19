import {
  AgentRole,
  DecisionVerdict,
  RiskEvaluation,
  RiskLevel,
  SecurityAnalysis,
  ToolAction
} from '../types';

/**
 * Clause-to-Control Explainable Risk Engine
 * Computes deterministic, auditable risk scores (0-100) and discrete risk levels
 * based on input threat taxonomy, role tier, action impact, and egress data sensitivity.
 */
export function calculateRiskScore(params: {
  role: AgentRole;
  action: ToolAction | string | null;
  securityAnalysis: SecurityAnalysis;
  decision: DecisionVerdict;
  piiRedacted?: boolean;
  orgPolicyConflict?: boolean;
  mfaVerified?: boolean;
}): RiskEvaluation {
  const { role, action, securityAnalysis, decision, piiRedacted, orgPolicyConflict, mfaVerified } = params;

  let score = 10; // Baseline operational risk
  const reasons: string[] = [];

  // 1. Security Preflight & Injection Defense
  if (securityAnalysis.threatType === 'PROMPT_INJECTION') {
    score += 55;
    reasons.push(
      `Critical Threat: Prompt injection pattern detected ('${securityAnalysis.flaggedPhrase || 'adversarial instruction'}').`
    );
  } else if (securityAnalysis.threatType === 'PRIVILEGE_ESCALATION') {
    score += 45;
    reasons.push(
      `High Threat: Unauthorized privilege escalation / role spoofing pattern identified in prompt text.`
    );
  } else if (securityAnalysis.threatType === 'POLICY_BYPASS') {
    score += 40;
    reasons.push(
      `Policy Circumvention: Query attempts to bypass statutory guardrails or organizational security controls.`
    );
  }

  // 2. Target Action Sensitivity
  if (action === 'export_customer_data') {
    score += 30;
    reasons.push(
      'High Impact Action: Bulk customer data & PAN export operation touches restricted statutory data tier.'
    );
  } else if (action === 'get_global_risk_report') {
    score += 18;
    reasons.push(
      'Moderate Impact Action: Global systemic risk intelligence requires verified institutional clearance.'
    );
  } else if (action === 'get_own_compliance_status') {
    score += 5;
    reasons.push('Low Impact Action: Self-service compliance status lookup within authenticated boundary.');
  }

  // 3. Role & Identity Enclave Context
  if (role === 'Vendor') {
    score += 15;
    reasons.push('External Identity: Vendor roles operate under mandatory zero-trust statutory isolation (DPDP Sec 16).');
  } else if (role === 'Admin') {
    if (!mfaVerified) {
      score += 20;
      reasons.push('Elevated Privilege Risk: Administrative session without active step-up MFA verification.');
    }
  }

  // 4. Data Egress Sanitization
  if (piiRedacted) {
    score += 15;
    reasons.push('PII Interception: Output contained unmasked personal identifiers (PAN / Email / Phone / Card) that required redaction.');
  }

  // 5. Organizational Policy Enclave
  if (orgPolicyConflict) {
    score += 12;
    reasons.push('Policy Conflict: Action triggers restrictive organizational policy rule surpassing baseline.');
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(5, score));

  let level: RiskLevel = 'LOW';
  if (finalScore >= 75) {
    level = 'CRITICAL';
  } else if (finalScore >= 50) {
    level = 'HIGH';
  } else if (finalScore >= 25) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  return {
    risk_score: finalScore,
    risk_level: level,
    risk_reasons: reasons.length > 0 ? reasons : ['Standard baseline execution risk within authorized boundaries.'],
    model_label: 'Clause-to-Control demo risk model'
  };
}
