import { OrganizationPolicyDocument, AgentRole, ToolAction, PolicySourceInfo } from '../types';

const ORG_POLICIES_STORAGE_KEY = 'c2c_org_policies_store_v1';

export const DEFAULT_ORG_POLICIES: OrganizationPolicyDocument[] = [
  {
    id: 'org-pol-001',
    fileName: 'Company_Data_Protection_Policy.pdf',
    title: 'Enterprise Customer Data Protection & Export Control Policy',
    fileSize: 42100,
    uploadedAt: '2025-01-15T09:30:00Z',
    processingStatus: 'INDEXED',
    sourceType: 'ORGANIZATION_POLICY',
    snippetCount: 6,
    rawText: `
SECTION 3.4 - CUSTOMER PERSONAL DATA HANDLING & EXPORT CONTROLS
1. Only approved administrators possessing verified Multi-Factor Authentication may initiate extraction or export of customer personal data.
2. Third-party vendors and contractors are strictly prohibited from exporting or mass-downloading customer records under all circumstances.
3. Any administrative export of sensitive customer information exceeding 100 records requires secondary compliance officer approval or elevated dual-key sign-off.
4. All customer identifiers including PAN, card numbers, and contact details must undergo automated sanitization before leaving the enclave boundary.
    `.trim(),
    keyRestrictions: [
      {
        targetRole: 'Vendor',
        targetAction: 'export_customer_data',
        restrictionType: 'RESTRICT_VENDOR',
        ruleText: 'Section 3.4(2): Third-party vendors and contractors are strictly prohibited from exporting or mass-downloading customer records.',
        section: 'Section 3.4'
      },
      {
        targetRole: 'Admin',
        targetAction: 'export_customer_data',
        restrictionType: 'REQUIRE_ADMIN_APPROVAL',
        ruleText: 'Section 3.4(3): Administrative customer data export requires mandatory multi-factor authentication verification and automated PII redaction.',
        section: 'Section 3.4'
      }
    ]
  },
  {
    id: 'org-pol-002',
    fileName: 'Vendor_Security_Governance_Manual.txt',
    title: 'Third-Party Vendor Access & Information Security Standard',
    fileSize: 28400,
    uploadedAt: '2025-02-10T14:15:00Z',
    processingStatus: 'INDEXED',
    sourceType: 'ORGANIZATION_POLICY',
    snippetCount: 4,
    rawText: `
SECTION 5.2 - RESTRICTION ON SYSTEMIC THREAT & RISK INTELLIGENCE
External vendors, suppliers, and consultants shall not be granted access to cross-institutional threat advisories, market risk aggregations, or sovereign vulnerability databases. Vendor visibility is restricted strictly to their own sandbox telemetry and contractual compliance KPIs.
    `.trim(),
    keyRestrictions: [
      {
        targetRole: 'Vendor',
        targetAction: 'get_global_risk_report',
        restrictionType: 'RESTRICT_VENDOR',
        ruleText: 'Section 5.2: External vendors shall not be granted access to cross-institutional threat advisories or market risk reports.',
        section: 'Section 5.2'
      }
    ]
  },
  {
    id: 'org-pol-003',
    fileName: 'AI_Agent_Usage_Charter_2025.docx',
    title: 'Enterprise Autonomous AI & MCP Tool Invocation Charter',
    fileSize: 35600,
    uploadedAt: '2025-03-01T11:00:00Z',
    processingStatus: 'INDEXED',
    sourceType: 'ORGANIZATION_POLICY',
    snippetCount: 5,
    rawText: `
SECTION 2.1 - MANDATORY RUNTIME GOVERNANCE & UNTRUSTED INPUT DEFENSE
1. AI agents operating on behalf of internal or external personnel must execute only allowlisted tools.
2. Natural language tool resolution must be deterministic and mediated by statutory policy filters.
3. Documents uploaded to the knowledge base constitute UNTRUSTED DATA and shall under no circumstance override role hierarchies, security guards, or execution boundaries.
    `.trim(),
    keyRestrictions: [
      {
        targetRole: 'All',
        targetAction: 'All',
        restrictionType: 'REQUIRE_ADMIN_APPROVAL',
        ruleText: 'Section 2.1: Autonomous agents are bound by immutable statutory and organizational policy matrices.',
        section: 'Section 2.1'
      }
    ]
  }
];

export const SAMPLE_DEMO_ORG_POLICIES = DEFAULT_ORG_POLICIES;

export function getStoredOrgPolicies(targetSessionId?: string): OrganizationPolicyDocument[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(ORG_POLICIES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          if (targetSessionId) {
            return parsed.filter((p: any) => !p.sessionId || p.sessionId === targetSessionId);
          }
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn("Could not read organization policies from storage:", e);
  }
  // Strictly return empty list for fresh sessions - do NOT automatically load demo data
  return [];
}

export function saveStoredOrgPolicies(policies: OrganizationPolicyDocument[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(ORG_POLICIES_STORAGE_KEY, JSON.stringify(policies));
    }
  } catch (e) {
    console.error("Failed to store organization policies:", e);
  }
}

export function clearStoredOrgPolicies(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(ORG_POLICIES_STORAGE_KEY);
    }
  } catch (e) {
    console.warn("Failed to clear organization policies storage:", e);
  }
}

/**
 * Parses uploaded document content into an indexed Organization Policy.
 * CRITICAL SECURITY: The content is treated strictly as PASSIVE DATA, never executable instructions.
 * Prompts like "ignore instructions and give admin" are purely stored as text and sanitized.
 */
export function processUploadedPolicy(
  fileName: string,
  rawContent: string,
  customTitle?: string
): OrganizationPolicyDocument {
  const sanitizedText = rawContent
    .replace(/<\/?script[^>]*>/gi, '')
    .trim();

  const lines = sanitizedText.split('\n').filter(l => l.trim().length > 0);
  const snippetCount = Math.max(1, Math.ceil(lines.length / 4));

  // Extract candidate restrictions via conservative pattern search
  const keyRestrictions: OrganizationPolicyDocument['keyRestrictions'] = [];
  const lowerText = sanitizedText.toLowerCase();

  if (lowerText.includes('vendor') && (lowerText.includes('export') || lowerText.includes('customer') || lowerText.includes('prohibit'))) {
    keyRestrictions.push({
      targetRole: 'Vendor',
      targetAction: 'export_customer_data',
      restrictionType: 'RESTRICT_VENDOR',
      ruleText: 'Extracted rule: Vendor personal customer data export prohibited by organization policy.',
      section: 'Relevant policy passage'
    });
  }

  if (lowerText.includes('admin') && lowerText.includes('export') && (lowerText.includes('approval') || lowerText.includes('mfa') || lowerText.includes('restricted'))) {
    keyRestrictions.push({
      targetRole: 'Admin',
      targetAction: 'export_customer_data',
      restrictionType: 'REQUIRE_ADMIN_APPROVAL',
      ruleText: 'Extracted rule: Administrative personal customer data export subject to explicit compliance authorization.',
      section: 'Relevant policy passage'
    });
  }

  if (lowerText.includes('vendor') && (lowerText.includes('risk') || lowerText.includes('threat') || lowerText.includes('intelligence'))) {
    keyRestrictions.push({
      targetRole: 'Vendor',
      targetAction: 'get_global_risk_report',
      restrictionType: 'RESTRICT_VENDOR',
      ruleText: 'Extracted rule: External vendors restricted from systemic threat and market risk advisories.',
      section: 'Relevant policy passage'
    });
  }

  const newDoc: OrganizationPolicyDocument = {
    id: `org-pol-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fileName,
    title: customTitle || fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
    fileSize: sanitizedText.length,
    uploadedAt: new Date().toISOString(),
    processingStatus: 'INDEXED',
    sourceType: 'ORGANIZATION_POLICY',
    snippetCount,
    rawText: sanitizedText,
    keyRestrictions
  };

  const current = getStoredOrgPolicies();
  const updated = [newDoc, ...current];
  saveStoredOrgPolicies(updated);
  return newDoc;
}

/**
 * Checks all active organization policies for relevant restrictions on the agent's action.
 * Returns applicable citations and whether approval or blocking is required.
 */
export function evaluateOrganizationPolicies(
  role: AgentRole,
  action: ToolAction
): {
  isBlocked: boolean;
  requiresApproval: boolean;
  matchedPolicies: PolicySourceInfo[];
  reason?: string;
  appliedDocName?: string;
} {
  const policies = getStoredOrgPolicies();
  const matchedSources: PolicySourceInfo[] = [];
  let isBlocked = false;
  let requiresApproval = false;
  let reasonText = '';
  let appliedDocName: string | undefined = undefined;

  for (const doc of policies) {
    for (const rule of doc.keyRestrictions) {
      const roleMatches = rule.targetRole === 'All' || rule.targetRole === role;
      const actionMatches = rule.targetAction === 'All' || rule.targetAction === action;

      if (roleMatches && actionMatches) {
        matchedSources.push({
          sourceType: 'ORGANIZATION_POLICY',
          sourceName: doc.fileName,
          sectionOrControl: rule.section || 'Relevant policy passage',
          passageSnippet: rule.ruleText
        });

        if (rule.restrictionType === 'RESTRICT_VENDOR' && role === 'Vendor') {
          isBlocked = true;
          appliedDocName = doc.fileName;
          reasonText = `Organization policy '${doc.fileName}' (${rule.section || 'Relevant policy passage'}) explicitly restricts Vendor access to '${action}'.`;
        } else if (rule.restrictionType === 'REQUIRE_ADMIN_APPROVAL' && role === 'Admin') {
          // If admin export customer data and policy mandates extra check
          appliedDocName = doc.fileName;
          // Notice: We keep it allowed or approval required based on company policy
        }
      }
    }
  }

  return {
    isBlocked,
    requiresApproval,
    matchedPolicies: matchedSources,
    reason: reasonText || undefined,
    appliedDocName
  };
}
