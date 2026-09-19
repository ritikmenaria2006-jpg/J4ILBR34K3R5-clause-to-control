import {
  OrganizationProfile,
  ProductActivation,
  FrameworkRegistryItem,
  GovernanceCoverageReport,
  ToolAction,
  AgentRole
} from '../types';

export const DEFAULT_PRODUCT_ACTIVATION: ProductActivation = {
  isActivated: true,
  productKey: 'ACME-DEMO-2026',
  organizationName: 'ACME Demo Organization',
  organizationId: 'org-acme-001',
  licenseState: 'ACTIVE',
  activatedAt: new Date().toISOString(),
  entitlements: ['CORE_GOVERNANCE', 'DPDP', 'SEBI', 'RBI', 'NIST', 'PCI_DSS']
};

export const DEFAULT_ORG_PROFILE: OrganizationProfile = {
  organizationId: 'org-acme-001',
  organizationName: 'ACME Demo Financial & FinTech Services',
  industry: 'Finance',
  subSector: 'Securities & Capital Markets',
  handlesCardholderData: false,
  criticalInformationInfrastructure: true,
  sebiRegisteredIntermediary: true,
  rbiPaymentSystemOperator: false,
  crossBorderDataTransfer: false
};

export const SAMPLE_DEMO_ORG_PROFILE = DEFAULT_ORG_PROFILE;

export const EMPTY_ORG_PROFILE: OrganizationProfile = {
  organizationId: '',
  organizationName: '',
  industry: undefined as any,
  subSector: undefined as any,
  handlesCardholderData: false,
  criticalInformationInfrastructure: false,
  sebiRegisteredIntermediary: false,
  rbiPaymentSystemOperator: false,
  crossBorderDataTransfer: false
};

const ACTIVATION_STORAGE_KEY = 'c2c_product_activation_v1';
const PROFILE_STORAGE_KEY = 'c2c_org_profile_v1';

export function getStoredProductActivation(): ProductActivation {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(ACTIVATION_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (e) {
    console.warn('Using default activation:', e);
  }
  return DEFAULT_PRODUCT_ACTIVATION;
}

export function saveStoredProductActivation(activation: ProductActivation): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(ACTIVATION_STORAGE_KEY, JSON.stringify(activation));
    }
  } catch (e) {
    console.error('Failed to store product activation:', e);
  }
}

export function getStoredOrgProfile(): OrganizationProfile {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (e) {
    console.warn('Could not read stored profile:', e);
  }
  return EMPTY_ORG_PROFILE;
}

export function saveStoredOrgProfile(profile: OrganizationProfile): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    }
  } catch (e) {
    console.error('Failed to store organization profile:', e);
  }
}

export function clearStoredOrgProfile(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Failed to clear organization profile storage:', e);
  }
}

/**
 * Validates product activation keys for the hackathon demo.
 * Demo supported keys: ACME-DEMO-2026, CTC-HACKFEST-2026, SEBI-FINTECH-2026
 */
export function activateProductKey(key: string, organizationName: string = 'ACME Demo Organization'): {
  success: boolean;
  activation?: ProductActivation;
  error?: string;
} {
  const cleanKey = key.trim().toUpperCase();
  if (
    cleanKey === 'ACME-DEMO-2026' ||
    cleanKey === 'CTC-HACKFEST-2026' ||
    cleanKey === 'SEBI-FINTECH-2026' ||
    cleanKey.startsWith('CTC-')
  ) {
    const activation: ProductActivation = {
      isActivated: true,
      productKey: cleanKey,
      organizationName: organizationName.trim() || 'ACME Demo Organization',
      organizationId: `org-${cleanKey.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      licenseState: 'ACTIVE',
      activatedAt: new Date().toISOString(),
      entitlements: ['CORE_GOVERNANCE', 'DPDP', 'SEBI', 'RBI', 'NIST', 'PCI_DSS']
    };
    saveStoredProductActivation(activation);
    return { success: true, activation };
  }

  return {
    success: false,
    error: 'Invalid product key. For demo, use: ACME-DEMO-2026 or CTC-HACKFEST-2026'
  };
}

/**
 * Source & Framework Registry
 */
export function getFrameworkRegistry(
  profile: OrganizationProfile,
  activation: ProductActivation
): FrameworkRegistryItem[] {
  const isLicensed = (entitlement: string) => activation.entitlements.includes(entitlement as any);

  return [
    {
      source_id: 'dpdp',
      display_name: 'Digital Personal Data Protection Act (DPDP) 2023',
      source_type: 'REGULATORY',
      version: 'Act No. 22 of 2023',
      availability: true,
      enabled: isLicensed('DPDP'),
      license_required: true,
      license_status: isLicensed('DPDP') ? 'LICENSED' : 'UNLICENSED',
      applicability_reason: 'Mandatory statutory baseline for all entities processing digital personal data within India.'
    },
    {
      source_id: 'sebi_cscrf',
      display_name: 'SEBI Cyber Security and Cyber Resilience Framework (CSCRF) 2024',
      source_type: 'REGULATORY',
      version: 'Circular SEBI/HO/ITD/ITD_VAP/P/CIR/2024/116',
      availability: true,
      enabled: isLicensed('SEBI') && (profile.industry === 'Finance' || profile.sebiRegisteredIntermediary),
      license_required: true,
      license_status: isLicensed('SEBI') ? 'LICENSED' : 'UNLICENSED',
      applicability_reason: profile.sebiRegisteredIntermediary || profile.industry === 'Finance'
        ? 'Applicable: Entity is classified as a regulated financial intermediary / market participant.'
        : 'Not Applicable: Entity is not operating within SEBI capital markets jurisdiction.'
    },
    {
      source_id: 'rbi_pso',
      display_name: 'RBI Cyber Resilience Directions for Payment System Operators (PSO) 2024',
      source_type: 'REGULATORY',
      version: 'RBI/2024-25/55 DOS.CO.CSITE.SEC.No.3/31.01.015/2024-25',
      availability: true,
      enabled: isLicensed('RBI') && (profile.rbiPaymentSystemOperator || profile.subSector === 'Banking / NBFC' || profile.subSector === 'Payments & Card Environment'),
      license_required: true,
      license_status: isLicensed('RBI') ? 'LICENSED' : 'UNLICENSED',
      applicability_reason: profile.rbiPaymentSystemOperator || profile.subSector === 'Payments & Card Environment'
        ? 'Applicable: Entity operates payment processing or banking infrastructure.'
        : 'Not Applicable: Entity profile does not designate active RBI Payment System Operator status.'
    },
    {
      source_id: 'nist_rmf',
      display_name: 'NIST SP 800-37 RMF / AI RMF 1.0 Governance Controls',
      source_type: 'REGULATORY',
      version: 'SP 800-37 Rev 2 & NIST AI 100-1',
      availability: true,
      enabled: isLicensed('NIST'),
      license_required: true,
      license_status: isLicensed('NIST') ? 'LICENSED' : 'UNLICENSED',
      applicability_reason: profile.criticalInformationInfrastructure || profile.industry === 'IT'
        ? 'Applicable: Critical Information Infrastructure (CII) & autonomous AI agent risk management.'
        : 'Applicable: Baseline international cybersecurity risk controls.'
    },
    {
      source_id: 'pci_dss',
      display_name: 'PCI DSS v4.0.1 (Payment Card Industry Data Security Standard)',
      source_type: 'REGULATORY',
      version: 'Version 4.0.1 June 2024',
      availability: true,
      enabled: isLicensed('PCI_DSS') && profile.handlesCardholderData,
      license_required: true,
      license_status: isLicensed('PCI_DSS') ? 'LICENSED' : 'UNLICENSED',
      applicability_reason: profile.handlesCardholderData
        ? 'Applicable: Organization profile indicates handling or storing cardholder / PAN data.'
        : 'Not Evaluated: Cardholder data environment (CDE) is not active in the current organizational profile.'
    },
    {
      source_id: 'org_policies',
      display_name: 'Institutional Internal Security & AI Charters',
      source_type: 'ORGANIZATION_POLICY',
      version: 'Active Corporate Repository (2025-2026)',
      availability: true,
      enabled: true,
      license_required: false,
      license_status: 'LICENSED',
      applicability_reason: 'Institutional policies defining role boundaries, approval thresholds, and tool allowlists.'
    }
  ];
}

/**
 * Generates an authoritative GovernanceCoverageReport for an action
 * dynamically distinguishing:
 * - AVAILABLE
 * - EVALUATED
 * - NOT_EVALUATED (with transparent reasons)
 * - VIOLATIONS
 * Never implies NOT EVALUATED = PASSED!
 */
export function evaluateGovernanceCoverage(
  role: AgentRole,
  action: ToolAction | string | null,
  profile: OrganizationProfile,
  activation: ProductActivation,
  violatingFrameworkNames: string[] = []
): GovernanceCoverageReport {
  const registry = getFrameworkRegistry(profile, activation);

  const availableFrameworks = registry.map((r) => r.display_name);
  const evaluatedFrameworks: string[] = [];
  const notEvaluatedFrameworks: { name: string; reason: string }[] = [];
  const applicableFrameworks: string[] = [];

  for (const item of registry) {
    if (!item.enabled) {
      if (item.license_status === 'UNLICENSED') {
        notEvaluatedFrameworks.push({
          name: item.display_name,
          reason: 'Not evaluated: License entitlement is not active for this framework.'
        });
      } else {
        notEvaluatedFrameworks.push({
          name: item.display_name,
          reason: item.applicability_reason
        });
      }
    } else {
      applicableFrameworks.push(item.display_name);
      evaluatedFrameworks.push(item.display_name);
    }
  }

  return {
    availableFrameworks,
    evaluatedFrameworks,
    notEvaluatedFrameworks,
    applicableFrameworks,
    violatingFrameworks: violatingFrameworkNames
  };
}

export function getApplicableFrameworks(
  profile: OrganizationProfile,
  activation: ProductActivation
): string[] {
  return getFrameworkRegistry(profile, activation)
    .filter((f) => f.enabled)
    .map((f) => f.display_name);
}

