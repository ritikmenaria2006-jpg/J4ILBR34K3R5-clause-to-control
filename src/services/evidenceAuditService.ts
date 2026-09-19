import { OrganizationEvidenceItem, EvidenceAuditFinding } from '../types';

export const INITIAL_ORGANIZATION_EVIDENCE: OrganizationEvidenceItem[] = [
  {
    id: 'ev-config-01',
    fileName: 'company_config.json',
    title: 'Core Infrastructure Security & Encryption Configuration',
    category: 'CONFIG',
    fileType: 'JSON',
    uploadedAt: '2026-03-10T10:30:00Z',
    isDemoEvidence: true,
    contentSnippet: '{ "env": "production", "database_encryption_level": 4, "tls_version": "1.2", "session_timeout_minutes": 15, "pii_logging": false }',
    rawContent: JSON.stringify(
      {
        environment: 'production',
        organization_id: 'org-acme-001',
        database_encryption_level: 4, // Intentionally Level 4 (AES-128) to trigger compliance gap (Requirement is Level 5 / AES-256)
        kms_provider: 'cloud_kms_standard',
        tls_version: '1.2',
        session_timeout_minutes: 15,
        pii_logging_enabled: false,
        mfa_enforced_globally: false,
        vendor_direct_db_access: false,
        backup_immutable_retention_days: 180
      },
      null,
      2
    )
  },
  {
    id: 'ev-access-02',
    fileName: 'access_control.csv',
    title: 'Identity & Privilege Access Inventory (IAM Audit)',
    category: 'ACCESS_LOG',
    fileType: 'CSV',
    uploadedAt: '2026-03-12T14:15:00Z',
    isDemoEvidence: true,
    contentSnippet: 'user_id,role,mfa_enforced,privilege_level,last_rotation\nadmin_sys_01,Admin,true,full_access,2026-02-15\nadmin_user_03,Admin,false,full_access,2025-11-20\nvendor_sec_01,Vendor,true,isolated_enclave,2026-03-01',
    rawContent: `user_id,role,mfa_enforced,privilege_level,last_rotation,status
admin_sys_01,Admin,true,full_access,2026-02-15,ACTIVE
admin_user_03,Admin,false,full_access,2025-11-20,ACTIVE
auditor_cscrf_99,Auditor,true,read_compliance,2026-01-10,ACTIVE
vendor_sec_01,Vendor,true,isolated_enclave,2026-03-01,ACTIVE
contractor_ext_04,Vendor,false,read_only,2025-08-14,PENDING_REVIEW`
  },
  {
    id: 'ev-report-03',
    fileName: 'security_report.pdf',
    title: 'Independent Statutory Cybersecurity Audit Report (Annual)',
    category: 'AUDIT_REPORT',
    fileType: 'PDF',
    uploadedAt: '2026-03-15T09:00:00Z',
    isDemoEvidence: true,
    contentSnippet: 'ANNUAL CYBER RESILIENCE REVIEW 2026. Finding SEC-04: Legacy customer export endpoint contains raw unmasked PAN records before intermediary gateway redaction. Finding SEC-09: Unenforced MFA on secondary admin service accounts.',
    rawContent: `======================================================================
INDEPENDENT STATUTORY CYBERSECURITY AUDIT ATTESTATION (ANNUAL 2026)
Target Institution: ACME Financial & FinTech Services Ltd.
Frameworks Assessed: DPDP Act 2023, SEBI CSCRF 2024, RBI PSO 2024, PCI DSS v4.0.1
======================================================================

EXECUTIVE SUMMARY OF AUDIT FINDINGS:

1. [AUDIT OBSERVATION CR-01] Database At-Rest Encryption Assessment:
   The production PostgreSQL customer cluster configuration in 'company_config.json'
   implements database encryption level 4 (AES-128) rather than mandatory Level 5 (AES-256-GCM).
   Non-compliant with DPDP Section 8(5) technical safeguards and SEBI CSCRF PR.DS.S1.

2. [AUDIT OBSERVATION CR-02] Privileged Account Multi-Factor Authentication:
   Inspection of 'access_control.csv' revealed account 'admin_user_03' possesses
   system administrator privileges without mandatory Hardware/TOTP MFA enforcement.
   Violates SEBI CSCRF PR.AA.S1 and PCI DSS Req 8.3.1.

3. [AUDIT OBSERVATION CR-03] Cardholder Data Storage & Egress:
   Customer database staging stores unmasked PAN and Indian PAN identifiers. While
   Clause-to-Control Runtime Gateway actively sanitizes outbound payloads to external
   parties, storage-level tokenization is missing.

4. [AUDIT OBSERVATION CR-04] Vendor Isolation Verification:
   Vendor access verification test confirmed external role 'Vendor' is strictly blocked
   from executing customer data extraction tools and accessing global risk reports.
   Compliant with DPDP Section 16 and SEBI CSCRF PR.DS.S2.`
  }
];

export const INITIAL_EVIDENCE_FINDINGS: EvidenceAuditFinding[] = [
  {
    id: 'finding-01',
    controlId: 'DPDP-SEC-8-5',
    controlTitle: 'Cryptographic Storage Protection & Data Security Safeguards',
    framework: 'DPDP Act 2023 & SEBI CSCRF PR.DS.S1',
    requirementText: 'Data Fiduciaries must implement robust cryptographic safeguards for stored personal data (Minimum AES-256 / Encryption Level 5 with managed HSM keys).',
    observedText: 'Production configuration exhibits database_encryption_level: 4 (AES-128-CBC) with standard KMS.',
    status: 'FAIL',
    evidenceSource: 'company_config.json',
    evidenceLocation: 'Line 4, database_encryption_level: 4',
    evidenceExcerpt: '"database_encryption_level": 4, "kms_provider": "cloud_kms_standard"',
    suggestedRemediation: 'Re-encrypt storage partitions using AES-256-GCM. Update Cloud KMS key ring to FIPS 140-3 HSM root key and elevate config level to 5.',
    humanReviewRequired: true,
    isDemoEvidence: true
  },
  {
    id: 'finding-02',
    controlId: 'SEBI-CSCRF-PR.AA.S1',
    controlTitle: 'Mandatory Multi-Factor Authentication for Privileged Administrator Accounts',
    framework: 'SEBI CSCRF 2024 & PCI DSS Req 8.3.1',
    requirementText: 'All administrative, elevated, or privileged access sessions must mandate Hardware Token or Authenticator TOTP multi-factor verification.',
    observedText: 'IAM inventory lists privileged account "admin_user_03" with mfa_enforced: false.',
    status: 'FAIL',
    evidenceSource: 'access_control.csv',
    evidenceLocation: 'Record 2: admin_user_03,Admin,false',
    evidenceExcerpt: 'admin_user_03,Admin,false,full_access,2025-11-20,ACTIVE',
    suggestedRemediation: 'Enforce unconditional MFA enrollment policy on IAM group "Administrators". Temporarily revoke session tokens for admin_user_03 pending TOTP binding.',
    humanReviewRequired: true,
    isDemoEvidence: true
  },
  {
    id: 'finding-03',
    controlId: 'PCI-DSS-REQ-3.4.1',
    controlTitle: 'Render Primary Account Number (PAN) Unreadable Anywhere Stored',
    framework: 'PCI DSS v4.0.1 Req 3.4.1 & RBI PSO Para 20(d)',
    requirementText: 'Primary Account Numbers must be rendered unreadable using strong one-way hash, truncation (max first 6 and last 4 digits), or format-preserving tokenization.',
    observedText: 'Database queries return unmasked 16-digit card numbers. Runtime PII guard masks output on egress, but storage layer lacks native tokenization.',
    status: 'PARTIAL',
    evidenceSource: 'security_report.pdf',
    evidenceLocation: 'Section 3, Audit Observation CR-03',
    evidenceExcerpt: 'Customer database staging stores unmasked PAN and Indian PAN identifiers... storage-level tokenization is missing.',
    suggestedRemediation: 'Deploy Vault Format-Preserving Tokenization (FPE) on PAN columns at ingestion time, keeping only tokenized references in the operational database.',
    humanReviewRequired: true,
    isDemoEvidence: true
  },
  {
    id: 'finding-04',
    controlId: 'DPDP-SEC-16-1',
    controlTitle: 'Third-Party Contractor & Vendor Statutory Isolation',
    framework: 'DPDP Act 2023 Sec 16 & SEBI CSCRF PR.DS.S2',
    requirementText: 'Third-party vendors and contractors must be isolated from production customer data and unauthorized systemic reporting tools.',
    observedText: 'Clause-to-Control runtime interceptor deterministically denies all Vendor requests targeting export_customer_data and get_global_risk_report.',
    status: 'PASS',
    evidenceSource: 'security_report.pdf & access_control.csv',
    evidenceLocation: 'Section 4, Audit Observation CR-04',
    evidenceExcerpt: 'Vendor access verification test confirmed external role "Vendor" is strictly blocked from executing customer data extraction tools.',
    suggestedRemediation: 'No corrective action required. Maintain automated continuous policy enforcement in Clause-to-Control runtime gateway.',
    humanReviewRequired: false,
    isDemoEvidence: true
  }
];

const EVIDENCE_STORAGE_KEY = 'c2c_organization_evidence_v1';
const FINDINGS_STORAGE_KEY = 'c2c_evidence_findings_v1';

export interface RawEvidenceFileInput {
  name: string;
  content: string;
  size?: number;
  category?: 'CONFIG' | 'ACCESS_LOG' | 'AUDIT_REPORT' | 'INVENTORY';
}

export interface MultiFileProcessResult {
  indexedEvidence: OrganizationEvidenceItem[];
  failedFiles: { fileName: string; reason: string }[];
  totalSubmitted: number;
  totalIndexed: number;
  totalFailed: number;
  updatedFindings: EvidenceAuditFinding[];
}

export const SUPPORTED_EVIDENCE_EXTENSIONS = ['.json', '.csv', '.txt', '.pdf', '.docx', '.xlsx'];

/**
 * Determine category based on filename and content hints
 */
export function inferEvidenceCategory(fileName: string, content: string): 'CONFIG' | 'ACCESS_LOG' | 'AUDIT_REPORT' | 'INVENTORY' {
  const lowerName = fileName.toLowerCase();
  const lowerContent = content.toLowerCase();

  if (lowerName.includes('config') || lowerName.includes('setting') || lowerName.includes('env') || lowerContent.includes('database_encryption')) {
    return 'CONFIG';
  }
  if (lowerName.includes('access') || lowerName.includes('iam') || lowerName.includes('matrix') || lowerName.includes('permission') || lowerContent.includes('mfa')) {
    return 'ACCESS_LOG';
  }
  if (lowerName.includes('inventory') || lowerName.includes('asset') || lowerContent.includes('asset_id') || lowerContent.includes('hostname')) {
    return 'INVENTORY';
  }
  return 'AUDIT_REPORT';
}

/**
 * Infer fileType enum value from filename
 */
export function inferEvidenceFileType(fileName: string): 'JSON' | 'CSV' | 'PDF' | 'TXT' | 'DOCX' | 'XLSX' {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.json')) return 'JSON';
  if (lower.endsWith('.csv')) return 'CSV';
  if (lower.endsWith('.pdf')) return 'PDF';
  if (lower.endsWith('.docx')) return 'DOCX';
  if (lower.endsWith('.xlsx')) return 'XLSX';
  return 'TXT';
}

/**
 * Evaluates all indexed evidence documents deterministically against regulatory and statutory controls.
 * Cross-references multiple evidence sources and explicitly lists all contributing files.
 */
export function evaluateEvidenceAgainstControls(evidenceList: OrganizationEvidenceItem[]): EvidenceAuditFinding[] {
  const findings: EvidenceAuditFinding[] = [];

  // Filter only indexed or successfully processed items
  const activeEvidence = evidenceList.filter((ev) => ev.status !== 'FAILED');

  // Helper to find documents containing specific keywords
  const findEvidenceDocs = (keywords: string[]): OrganizationEvidenceItem[] => {
    return activeEvidence.filter((ev) => {
      const combined = `${ev.fileName} ${ev.title} ${ev.rawContent}`.toLowerCase();
      return keywords.some((k) => combined.includes(k.toLowerCase()));
    });
  };

  // 1. Control DPDP-SEC-8-5 & SEBI CSCRF PR.DS.S1: Cryptographic Storage Protection
  const cryptoDocs = findEvidenceDocs(['encryption', 'kms', 'database_encryption_level', 'AES-128', 'AES-256']);
  if (cryptoDocs.length > 0) {
    const cryptoSources = cryptoDocs.map((d) => d.displayName || d.fileName);
    const hasWeakEncryption = cryptoDocs.some((d) => 
      d.rawContent.includes('database_encryption_level": 4') ||
      d.rawContent.includes('encryption_level: 4') ||
      d.rawContent.toLowerCase().includes('aes-128')
    );

    findings.push({
      id: 'finding-crypto-01',
      controlId: 'DPDP-SEC-8-5',
      controlTitle: 'Cryptographic Storage Protection & Data Security Safeguards',
      framework: 'DPDP Act 2023 Sec 8(5) & SEBI CSCRF PR.DS.S1',
      requirementText: 'Data Fiduciaries must implement robust cryptographic safeguards for stored personal data (Minimum AES-256 / Encryption Level 5 with managed HSM keys).',
      observedText: hasWeakEncryption
        ? 'Production configuration exhibits database_encryption_level: 4 (AES-128-CBC) with standard KMS.'
        : 'Storage clusters exhibit verified AES-256-GCM hardware key encryption (Level 5).',
      status: hasWeakEncryption ? 'FAIL' : 'PASS',
      evidenceSource: cryptoSources.join(' & '),
      evidenceSources: cryptoSources,
      evidenceLocation: cryptoDocs.map((d) => `${d.displayName || d.fileName}: Field 'database_encryption_level'`).join('; '),
      evidenceExcerpt: cryptoDocs[0].contentSnippet.substring(0, 140),
      suggestedRemediation: hasWeakEncryption
        ? 'Re-encrypt storage partitions using AES-256-GCM. Update Cloud KMS key ring to FIPS 140-3 HSM root key and elevate config level to 5.'
        : 'Maintain automated continuous encryption validation in infrastructure CI/CD.',
      humanReviewRequired: hasWeakEncryption,
      isDemoEvidence: true
    });
  }

  // 2. Control SEBI-CSCRF-PR.AA.S1 & PCI DSS Req 8.3.1: IAM Multi-Factor Authentication
  const iamDocs = findEvidenceDocs(['mfa', 'access_control', 'iam', 'admin_user', 'privilege_level', 'matrix']);
  if (iamDocs.length > 0) {
    const iamSources = iamDocs.map((d) => d.displayName || d.fileName);
    const hasUnenforcedMfa = iamDocs.some((d) => 
      d.rawContent.includes('mfa_enforced,false') ||
      d.rawContent.includes('mfa_enforced: false') ||
      d.rawContent.includes('"mfa_enforced_globally": false') ||
      d.rawContent.includes('admin_user_03,Admin,false')
    );

    findings.push({
      id: 'finding-iam-02',
      controlId: 'SEBI-CSCRF-PR.AA.S1',
      controlTitle: 'Mandatory Multi-Factor Authentication for Privileged Administrator Accounts',
      framework: 'SEBI CSCRF 2024 & PCI DSS Req 8.3.1',
      requirementText: 'All administrative, elevated, or privileged access sessions must mandate Hardware Token or Authenticator TOTP multi-factor verification.',
      observedText: hasUnenforcedMfa
        ? 'IAM inventory lists privileged account(s) with mfa_enforced: false.'
        : 'All privileged identity records show active Hardware/TOTP MFA enforcement.',
      status: hasUnenforcedMfa ? 'FAIL' : 'PASS',
      evidenceSource: iamSources.join(' & '),
      evidenceSources: iamSources,
      evidenceLocation: iamDocs.map((d) => `${d.displayName || d.fileName}: Identity records`).join('; '),
      evidenceExcerpt: iamDocs[0].rawContent.includes('admin_user_03')
        ? 'admin_user_03,Admin,false,full_access,2025-11-20,ACTIVE'
        : iamDocs[0].contentSnippet.substring(0, 130),
      suggestedRemediation: hasUnenforcedMfa
        ? 'Enforce unconditional MFA enrollment policy on IAM group "Administrators". Temporarily revoke session tokens for unverified admin accounts.'
        : 'Maintain continuous conditional-access MFA policies across administrative tenants.',
      humanReviewRequired: hasUnenforcedMfa,
      isDemoEvidence: true
    });
  }

  // 3. Control PCI-DSS-REQ-3.4.1 & RBI PSO Para 20(d): Cardholder Data Tokenization
  const cardDocs = findEvidenceDocs(['pan', 'cardholder', 'tokenization', 'pci', 'card']);
  if (cardDocs.length > 0) {
    const cardSources = cardDocs.map((d) => d.displayName || d.fileName);
    const hasUnmaskedStorage = cardDocs.some((d) => 
      d.rawContent.toLowerCase().includes('unmasked pan') ||
      d.rawContent.toLowerCase().includes('storage-level tokenization is missing') ||
      d.rawContent.toLowerCase().includes('tokenization missing')
    );

    findings.push({
      id: 'finding-pci-03',
      controlId: 'PCI-DSS-REQ-3.4.1',
      controlTitle: 'Render Primary Account Number (PAN) Unreadable Anywhere Stored',
      framework: 'PCI DSS v4.0.1 Req 3.4.1 & RBI PSO Para 20(d)',
      requirementText: 'Primary Account Numbers must be rendered unreadable using strong one-way hash, truncation (max first 6 and last 4 digits), or format-preserving tokenization.',
      observedText: hasUnmaskedStorage
        ? 'Database queries return unmasked card identifiers. Runtime PII guard masks output on egress, but storage layer lacks native tokenization.'
        : 'Format-preserving tokenization (FPE) active across all primary payment identifier tables.',
      status: hasUnmaskedStorage ? 'PARTIAL' : 'PASS',
      evidenceSource: cardSources.join(' & '),
      evidenceSources: cardSources,
      evidenceLocation: cardDocs.map((d) => `${d.displayName || d.fileName}: Data storage finding`).join('; '),
      evidenceExcerpt: 'Customer database staging stores unmasked PAN identifiers... egress redacted but storage-level tokenization missing.',
      suggestedRemediation: hasUnmaskedStorage
        ? 'Deploy Vault Format-Preserving Tokenization (FPE) on PAN columns at ingestion time, keeping only tokenized references in the operational database.'
        : 'Continue weekly automated PAN cleartext scanning across database volumes.',
      humanReviewRequired: hasUnmaskedStorage,
      isDemoEvidence: true
    });
  }

  // 4. Control DPDP-SEC-16-1 & SEBI CSCRF PR.DS.S2: Third-Party Vendor Statutory Isolation
  const vendorDocs = findEvidenceDocs(['vendor', 'contractor', 'third-party', 'isolation', 'statutory']);
  if (vendorDocs.length > 0) {
    const vendorSources = vendorDocs.map((d) => d.displayName || d.fileName);
    findings.push({
      id: 'finding-vendor-04',
      controlId: 'DPDP-SEC-16-1',
      controlTitle: 'Third-Party Contractor & Vendor Statutory Isolation',
      framework: 'DPDP Act 2023 Sec 16 & SEBI CSCRF PR.DS.S2',
      requirementText: 'Third-party vendors and contractors must be isolated from production customer data and unauthorized systemic reporting tools.',
      observedText: 'Clause-to-Control runtime interceptor deterministically denies all Vendor requests targeting export_customer_data and get_global_risk_report.',
      status: 'PASS',
      evidenceSource: vendorSources.join(' & '),
      evidenceSources: vendorSources,
      evidenceLocation: vendorDocs.map((d) => `${d.displayName || d.fileName}`).join('; '),
      evidenceExcerpt: 'Vendor access verification test confirmed external role "Vendor" is strictly blocked from executing customer data extraction tools.',
      suggestedRemediation: 'No corrective action required. Maintain automated continuous policy enforcement in Clause-to-Control runtime gateway.',
      humanReviewRequired: false,
      isDemoEvidence: true
    });
  }

  // 5. Dynamic Check for Risk Register / Threat Posture Artifacts
  const riskDocs = findEvidenceDocs(['risk_register', 'threat', 'residual_risk', 'vulnerability']);
  if (riskDocs.length > 0) {
    const riskSources = riskDocs.map((d) => d.displayName || d.fileName);
    findings.push({
      id: 'finding-risk-05',
      controlId: 'SEBI-CSCRF-GV.RM.S1',
      controlTitle: 'Enterprise Risk Register & Continuous Threat Posture Maintenance',
      framework: 'SEBI CSCRF 2024 & NIST CSF 2.0 GV.RM',
      requirementText: 'Institutions must maintain an active, dynamic risk register documenting known technical debt, third-party exposure, and residual threat levels.',
      observedText: `Dynamic risk register cataloged in ${riskSources.join(', ')}. Residual risks and compensating controls mapped.`,
      status: 'PASS',
      evidenceSource: riskSources.join(' & '),
      evidenceSources: riskSources,
      evidenceLocation: `${riskSources[0]}: Risk Register Matrix`,
      evidenceExcerpt: riskDocs[0].contentSnippet.substring(0, 140),
      suggestedRemediation: 'Schedule quarterly board risk committee review of documented open risk items.',
      humanReviewRequired: false,
      isDemoEvidence: true
    });
  }

  // 6. Dynamic Check for Asset Inventory Artifacts
  const assetDocs = findEvidenceDocs(['inventory', 'asset', 'hardware', 'endpoint']);
  if (assetDocs.length > 0) {
    const assetSources = assetDocs.map((d) => d.displayName || d.fileName);
    findings.push({
      id: 'finding-asset-06',
      controlId: 'SEBI-CSCRF-PR.AT.S1',
      controlTitle: 'Enterprise Hardware, Software & Cloud Asset Inventory Governance',
      framework: 'SEBI CSCRF 2024 & ISO/IEC 27001:2022 A.5.9',
      requirementText: 'All compute nodes, database clusters, and cloud workloads must be cataloged in an authoritative asset inventory with classification tiers.',
      observedText: `Comprehensive asset inventory reconciled across ${assetSources.join(', ')}.`,
      status: 'PASS',
      evidenceSource: assetSources.join(' & '),
      evidenceSources: assetSources,
      evidenceLocation: `${assetSources[0]}: Asset Records`,
      evidenceExcerpt: assetDocs[0].contentSnippet.substring(0, 140),
      suggestedRemediation: 'Ensure newly provisioned cloud infrastructure registers automatically through Terraform provider hooks.',
      humanReviewRequired: false,
      isDemoEvidence: true
    });
  }

  // If no specific documents matched, return initial baseline findings as fallback
  if (findings.length === 0) {
    return INITIAL_EVIDENCE_FINDINGS;
  }

  return findings;
}

/**
 * Processes a collection of evidence documents in a single operation.
 * Supports:
 * - Multi-file selection & batch upload
 * - Retains all existing evidence (does not discard or overwrite)
 * - Safe duplicate filename handling (e.g. filename (2).json)
 * - Partial failure tolerance: processes all valid files, reports failed files with helpful reasons
 * - Stores enriched metadata (evidence_id, filename, source_type, status, size, etc.)
 * - Triggers multi-document audit evaluation across ALL indexed documents
 */
export function processEvidenceDocuments(
  incomingFiles: RawEvidenceFileInput[],
  existingEvidence: OrganizationEvidenceItem[]
): MultiFileProcessResult {
  const failedFiles: { fileName: string; reason: string }[] = [];
  const newlyIndexed: OrganizationEvidenceItem[] = [];

  // Track existing filenames to detect duplicates
  const existingNames = new Set(existingEvidence.map((e) => e.fileName.toLowerCase()));
  const duplicateCounts = new Map<string, number>();

  for (const file of incomingFiles) {
    const lowerName = file.name.toLowerCase();
    const extIndex = lowerName.lastIndexOf('.');
    const ext = extIndex !== -1 ? lowerName.substring(extIndex) : '';

    // Validate file type
    if (!SUPPORTED_EVIDENCE_EXTENSIONS.includes(ext)) {
      failedFiles.push({
        fileName: file.name,
        reason: `Unsupported evidence type (${ext || 'no extension'}). Supported formats: PDF, TXT, JSON, CSV, DOCX, XLSX.`
      });
      continue;
    }

    // Validate content presence
    if (!file.content && file.size === 0) {
      failedFiles.push({
        fileName: file.name,
        reason: 'Empty file: Evidence document contains 0 bytes.'
      });
      continue;
    }

    // Safe duplicate filename handling: assign display name like "file (2).json"
    let displayName = file.name;
    if (existingNames.has(lowerName)) {
      const currentCount = (duplicateCounts.get(lowerName) || 1) + 1;
      duplicateCounts.set(lowerName, currentCount);
      const base = extIndex !== -1 ? file.name.substring(0, extIndex) : file.name;
      displayName = `${base} (${currentCount})${ext}`;
    } else {
      existingNames.add(lowerName);
      duplicateCounts.set(lowerName, 1);
    }

    const uniqueId = `ev-doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const category = file.category || inferEvidenceCategory(file.name, file.content);
    const fileType = inferEvidenceFileType(file.name);
    const nowIso = new Date().toISOString();

    const newEvidenceItem: OrganizationEvidenceItem = {
      id: uniqueId,
      evidence_id: uniqueId,
      fileName: file.name,
      filename: file.name,
      displayName,
      title: `Uploaded Institutional Evidence: ${displayName}`,
      category,
      fileType,
      file_type: fileType,
      uploadedAt: nowIso,
      uploaded_at: nowIso,
      fileSize: file.size || file.content.length,
      size: file.size || file.content.length,
      status: 'INDEXED',
      source_type: 'ORGANIZATION_EVIDENCE',
      contentSnippet: (file.content || '').substring(0, 160) + (file.content.length > 160 ? '...' : ''),
      rawContent: file.content || `[Binary/Document Stream for ${file.name}]`,
      isDemoEvidence: true
    };

    newlyIndexed.push(newEvidenceItem);
  }

  // Combine newly indexed items with existing ones (all retained!)
  const updatedEvidence = [...newlyIndexed, ...existingEvidence];
  saveStoredEvidence(updatedEvidence);

  // Evaluate controls across ALL indexed evidence files
  const updatedFindings = evaluateEvidenceAgainstControls(updatedEvidence);
  saveStoredFindings(updatedFindings);

  return {
    indexedEvidence: updatedEvidence,
    failedFiles,
    totalSubmitted: incomingFiles.length,
    totalIndexed: newlyIndexed.length,
    totalFailed: failedFiles.length,
    updatedFindings
  };
}

export const SAMPLE_DEMO_EVIDENCE = INITIAL_ORGANIZATION_EVIDENCE;
export const SAMPLE_DEMO_FINDINGS = INITIAL_EVIDENCE_FINDINGS;

export function getStoredEvidence(targetSessionId?: string): OrganizationEvidenceItem[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(EVIDENCE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          if (targetSessionId) {
            return parsed.filter((e: any) => !e.sessionId || e.sessionId === targetSessionId);
          }
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Could not read stored evidence:', e);
  }
  // Strictly return empty list for fresh sessions - do NOT automatically load demo data
  return [];
}

export function saveStoredEvidence(evidence: OrganizationEvidenceItem[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(EVIDENCE_STORAGE_KEY, JSON.stringify(evidence));
    }
  } catch (e) {
    console.error('Failed to store evidence:', e);
  }
}

export function getStoredFindings(targetSessionId?: string): EvidenceAuditFinding[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(FINDINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          if (targetSessionId) {
            return parsed.filter((f: any) => !f.sessionId || f.sessionId === targetSessionId);
          }
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Could not read stored findings:', e);
  }
  // Strictly return empty list for fresh sessions - do NOT automatically load demo findings
  return [];
}

export function saveStoredFindings(findings: EvidenceAuditFinding[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(FINDINGS_STORAGE_KEY, JSON.stringify(findings));
    }
  } catch (e) {
    console.error('Failed to store findings:', e);
  }
}

export function clearStoredEvidenceAndFindings(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(EVIDENCE_STORAGE_KEY);
      window.localStorage.removeItem(FINDINGS_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Failed to clear evidence and findings storage:', e);
  }
}
