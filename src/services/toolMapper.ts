import { NaturalLanguageToolMapping, ToolAction } from '../types';

export const APPROVED_TOOLS: {
  name: ToolAction;
  title: string;
  description: string;
  keywords: string[];
}[] = [
  {
    name: 'get_global_risk_report',
    title: 'Get Global Risk Report',
    description: 'Retrieves macro systemic market risk reports, threat intelligence, and sector vulnerability advisories.',
    keywords: [
      'risk report',
      'global risk',
      'organization risk',
      'systemic risk',
      'threat report',
      'vulnerability report',
      'market risk',
      'macro risk',
      'sector risk',
      'threat intelligence'
    ]
  },
  {
    name: 'get_own_compliance_status',
    title: 'Get Own Compliance Status',
    description: 'Inspects Cyber Capability Index (CCI), audit posture, statutory compliance metrics, and SLA telemetry.',
    keywords: [
      'compliance status',
      'compliance',
      'audit status',
      'posture',
      'my compliance',
      'own compliance',
      'check compliance',
      'cscrf score',
      'dpdp status',
      'telemetry',
      'sla status'
    ]
  },
  {
    name: 'export_customer_data',
    title: 'Export Customer Data',
    description: 'Queries production databases for customer records, contact information, and personal identity data.',
    keywords: [
      'customer data',
      'customer information',
      'export customers',
      'download customer',
      'extract customer',
      'customer records',
      'client data',
      'user data',
      'customer database',
      'dump customer',
      'pii export'
    ]
  }
];

/**
 * Deterministic rule-based intent mapper ensuring 100% offline hackathon resilience.
 * Only maps to registered allowlisted tools. If no confident match, returns null.
 */
export function resolveToolFromNaturalLanguage(userQuery: string): NaturalLanguageToolMapping {
  if (!userQuery || !userQuery.trim()) {
    return {
      originalQuery: userQuery,
      resolvedAction: null,
      confidence: 0,
      mappingMethod: 'UNMAPPED',
      reasoning: "Empty query provided. No tool capability requested."
    };
  }

  const normalized = userQuery.toLowerCase().trim();

  // Check approved tools keyword registry
  for (const tool of APPROVED_TOOLS) {
    for (const kw of tool.keywords) {
      if (normalized.includes(kw)) {
        return {
          originalQuery: userQuery,
          resolvedAction: tool.name,
          confidence: 0.95,
          mappingMethod: 'KEYWORD_RULE_BASED',
          reasoning: `Matched approved capability pattern '${kw}' targeting registered tool '${tool.name}'.`
        };
      }
    }
  }

  // Common synonyms / heuristics
  if (normalized.includes('risk') || normalized.includes('threat') || normalized.includes('vulnerability')) {
    return {
      originalQuery: userQuery,
      resolvedAction: 'get_global_risk_report',
      confidence: 0.85,
      mappingMethod: 'KEYWORD_RULE_BASED',
      reasoning: "Matched systemic risk heuristics targeting registered tool 'get_global_risk_report'."
    };
  }

  if (normalized.includes('audit') || normalized.includes('posture') || normalized.includes('status') || normalized.includes('score')) {
    return {
      originalQuery: userQuery,
      resolvedAction: 'get_own_compliance_status',
      confidence: 0.85,
      mappingMethod: 'KEYWORD_RULE_BASED',
      reasoning: "Matched compliance telemetry heuristics targeting registered tool 'get_own_compliance_status'."
    };
  }

  if (normalized.includes('customer') || normalized.includes('client') || normalized.includes('export') || normalized.includes('user record') || normalized.includes('pan')) {
    return {
      originalQuery: userQuery,
      resolvedAction: 'export_customer_data',
      confidence: 0.85,
      mappingMethod: 'KEYWORD_RULE_BASED',
      reasoning: "Matched customer data extraction heuristics targeting registered tool 'export_customer_data'."
    };
  }

  // Strict allowlist: No unregistered tool is ever created or executed
  return {
    originalQuery: userQuery,
    resolvedAction: null,
    confidence: 0,
    mappingMethod: 'UNMAPPED',
    reasoning: "I couldn't map your request to an approved tool. Approved tools are: get_global_risk_report, get_own_compliance_status, export_customer_data."
  };
}
