import { RegulationItem, GRCAuditReport, AgentRole, ToolAction, RegulatoryFramework } from '../types';

export const FULL_REGULATIONS_LIST: RegulationItem[] = [
  // --- DPDP ACT 2023 ---
  {
    id: "DPDP-SEC-4-1",
    framework: "DPDP Act 2023",
    chapter_or_domain: "Chapter II: Obligations of Data Fiduciary",
    section_or_control: "Section 4(1)",
    title: "Grounds for Processing Personal Data",
    statutory_text: "A person may process the personal data of a Data Principal only in accordance with the provisions of this Act and for a lawful purpose for which the Data Principal has given her consent or for certain legitimate uses.",
    mandated_control: "Enforce affirmative consent verification and validated lawful purpose on every data query, tool execution, and export action.",
    penalty_or_consequence: "Statutory non-compliance inquiry under Section 27; monetary penalty up to ₹50 crore under Schedule Item 7.",
    audit_procedure: "Examine consent audit records, consent token validity, and verify that processing is strictly confined to explicitly authorized purposes.",
    compliance_status: "COMPLIANT",
    mapped_agent_action: "export_customer_data"
  },
  {
    id: "DPDP-SEC-6-1",
    framework: "DPDP Act 2023",
    chapter_or_domain: "Chapter II: Obligations of Data Fiduciary",
    section_or_control: "Section 6(1)",
    title: "Free, Specific, Informed and Unambiguous Consent",
    statutory_text: "The consent given by the Data Principal shall be free, specific, informed, unconditional and unambiguous with a clear affirmative action, signifying agreement to processing for the specified purpose and limited to such personal data as is necessary for such specified purpose.",
    mandated_control: "Validate purpose limitation; block bulk querying or batch scraping of customer PII without specific affirmative consent verification.",
    penalty_or_consequence: "Invalidation of processing mandate; civil regulatory action and penalties up to ₹50 crore under Schedule Item 7.",
    audit_procedure: "Inspect consent forms and verify that extraneous data collection (e.g. mobile contact lists, financial profiles) is blocked at runtime.",
    compliance_status: "COMPLIANT",
    mapped_agent_action: "export_customer_data"
  },
  {
    id: "DPDP-SEC-8-5",
    framework: "DPDP Act 2023",
    chapter_or_domain: "Chapter II: Obligations of Data Fiduciary",
    section_or_control: "Section 8(5)",
    title: "Reasonable Security Safeguards to Prevent Personal Data Breach",
    statutory_text: "A Data Fiduciary shall protect personal data in its possession or under its control, including in respect of any processing undertaken by it or on its behalf by a Data Processor, by taking reasonable security safeguards to prevent personal data breach.",
    mandated_control: "Mandatory real-time PII anonymization / tokenization (Presidio Analyzer + Regex redaction) on all outbound telemetry; zero-trust access control.",
    penalty_or_consequence: "CRITICAL STATUTORY PENALTY: Monetary penalty may extend up to two hundred and fifty crore rupees (₹250 Crore) under Schedule Item 1.",
    audit_procedure: "Execute synthetic data egress tests containing Indian PAN, email addresses, and phone numbers to confirm 100% redaction before presentation.",
    compliance_status: "COMPLIANT",
    mapped_agent_action: "export_customer_data"
  },
  {
    id: "DPDP-SEC-8-6",
    framework: "DPDP Act 2023",
    chapter_or_domain: "Chapter II: Obligations of Data Fiduciary",
    section_or_control: "Section 8(6)",
    title: "Intimation of Personal Data Breach to Board and Data Principals",
    statutory_text: "In the event of a personal data breach, the Data Fiduciary shall give the Board and each affected Data Principal, intimation of such breach in such form and manner as may be prescribed.",
    mandated_control: "Automated incident detection engine triggering real-time notification dispatches to Data Protection Board of India and affected individuals.",
    penalty_or_consequence: "HIGH STATUTORY PENALTY: Monetary penalty may extend to two hundred crore rupees (₹200 Crore) under Schedule Item 2.",
    audit_procedure: "Examine incident notification runbooks and verify breach reporting templates, automated webhook endpoints, and delivery mechanisms.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "DPDP-SEC-8-7",
    framework: "DPDP Act 2023",
    chapter_or_domain: "Chapter II: Obligations of Data Fiduciary",
    section_or_control: "Section 8(7)",
    title: "Mandatory Data Erasure Upon Purpose Expiration",
    statutory_text: "A Data Fiduciary shall erase personal data upon the Data Principal withdrawing her consent or as soon as it is reasonable to assume that the specified purpose is no longer being served, whichever is earlier.",
    mandated_control: "Automated data lifecycle retention tracking; automated deletion triggers upon purpose expiration or consent withdrawal.",
    penalty_or_consequence: "Monetary penalty up to ₹50 crore under Schedule Item 7.",
    audit_procedure: "Review database TTL configurations, erasure job logs, and verify automated purge of customer data exceeding retention schedules.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "DPDP-SEC-9-1",
    framework: "DPDP Act 2023",
    chapter_or_domain: "Chapter II: Obligations of Data Fiduciary",
    section_or_control: "Section 9(1) & 9(3)",
    title: "Protection of Children's Data & Ban on Behavioral Profiling",
    statutory_text: "A Data Fiduciary shall obtain verifiable parental consent before processing child data. It shall not undertake tracking, behavioural monitoring of children, or targeted advertising directed at children.",
    mandated_control: "Verifiable parental consent token verification; absolute runtime block on tracking, profiling, and telemetry scripts for child accounts.",
    penalty_or_consequence: "CRITICAL STATUTORY PENALTY: Monetary penalty may extend to two hundred crore rupees (₹200 Crore) under Schedule Item 3.",
    audit_procedure: "Verify age-verification checkpoints and audit analytics egress to confirm complete absence of child behavioral tracking.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "DPDP-SEC-10-2",
    framework: "DPDP Act 2023",
    chapter_or_domain: "Chapter II: Obligations of Data Fiduciary",
    section_or_control: "Section 10(2)",
    title: "Significant Data Fiduciary Mandates (DPO, Independent Auditor, DPIA)",
    statutory_text: "The Significant Data Fiduciary shall: (a) appoint a Data Protection Officer based in India responsible to Board of Directors; (b) appoint an independent data auditor; (c) undertake periodic Data Protection Impact Assessment (DPIA).",
    mandated_control: "Resident Indian DPO designation, direct Board reporting line, annual DPIA evaluations, and CERT-In empanelled independent auditor reviews.",
    penalty_or_consequence: "HIGH STATUTORY PENALTY: Monetary penalty may extend to one hundred and fifty crore rupees (₹150 Crore) under Schedule Item 4.",
    audit_procedure: "Inspect DPO appointment credentials, DPIA reports, and independent auditor engagement letters.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "DPDP-SEC-16-1",
    framework: "DPDP Act 2023",
    chapter_or_domain: "Chapter IV: Special Provisions",
    section_or_control: "Section 16(1)",
    title: "Restrictions on Cross-Border Data Extraction",
    statutory_text: "The Central Government may, by notification, restrict the transfer of personal data by a Data Fiduciary for processing to such country or territory outside India as may be so notified.",
    mandated_control: "Enforce sovereign data residency boundary; block unauthorized outbound cross-border transmission of domestic customer datasets.",
    penalty_or_consequence: "Monetary penalty up to ₹50 crore; border firewall gateway block.",
    audit_procedure: "Inspect egress routing tables and cloud storage bucket locations to verify adherence to cross-border transfer restrictions.",
    compliance_status: "COMPLIANT",
    mapped_agent_action: "export_customer_data"
  },

  // --- SEBI CSCRF 2024 ---
  {
    id: "CSCRF-GV-RR-S3",
    framework: "SEBI CSCRF 2024",
    chapter_or_domain: "Governance: Roles, Responsibilities and Authorities",
    section_or_control: "Standard GV.RR.S3",
    title: "Mandatory CISO Appointment & Direct MD/CEO Reporting Line",
    statutory_text: "REs shall designate a senior official as Chief Information Security Officer (CISO) whose function would be to assess, identify, and reduce cybersecurity risks. The reporting of the CISO shall be directly to the MD & CEO.",
    mandated_control: "Formal board designation of CISO with direct MD/CEO reporting channel, fully independent of IT infrastructure delivery teams.",
    penalty_or_consequence: "Regulatory show-cause notice and non-compliance rating under CSCRF Section 4.4.",
    audit_procedure: "Examine organizational chart, appointment letter, and meeting minutes of CISO direct reporting to MD & CEO.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "CSCRF-GV-PO-S1",
    framework: "SEBI CSCRF 2024",
    chapter_or_domain: "Governance: Policy",
    section_or_control: "Standard GV.PO.S1",
    title: "Board-Approved Cybersecurity Policy & Quarterly IT Committee",
    statutory_text: "A comprehensive cybersecurity and cyber resilience policy shall be documented and implemented after receiving approval from Board. MIIs and Qualified REs shall constitute an IT Committee including at least one external independent cybersecurity expert meeting quarterly.",
    mandated_control: "Annual Board approval of IS policy; quarterly IT Committee reviews with independent expert; Plan-Do-Check-Act (PDCA) governance model.",
    penalty_or_consequence: "Audit non-conformity in Cyber Audit Report (Annexure-B); regulatory action under SEBI Act Section 11(1).",
    audit_procedure: "Verify Board approval resolutions, IT Committee composition, and quarterly minutes of meetings.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "CSCRF-GV-OV-S4",
    framework: "SEBI CSCRF 2024",
    chapter_or_domain: "Governance: Oversight",
    section_or_control: "Standard GV.OV.S4",
    title: "Cyber Capability Index (CCI) 23-Parameter Evaluation",
    statutory_text: "Organizations to assess their cyber resilience posture using CCI on a periodic basis (half-yearly third-party assessment for MIIs, yearly for Qualified REs). Calculated across 23 parameters with maturity ratings from Exceptional (91-100) to Fail (<=50).",
    mandated_control: "Automated CCI evaluation engine scoring 23 weighted parameters across budget, VAPT, SOC efficacy, and control coverage.",
    penalty_or_consequence: "Maturity classification downgrade; compulsory supervisory remediation if score falls to Bare Minimum or Fail.",
    audit_procedure: "Recalculate CCI score using verified evidence artifacts per Annexure-K Table 27.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "CSCRF-GV-SC-S5",
    framework: "SEBI CSCRF 2024",
    chapter_or_domain: "Governance: Supply Chain Risk Management",
    section_or_control: "Standard GV.SC.S5",
    title: "Software Bill of Materials (SBOM) for Critical Systems",
    statutory_text: "REs shall obtain SBOM for existing critical systems within 6 months and for new procurements. Must include primary and transitive dependencies, versions, cryptographic hashes, licenses, and patch status. Prohibits vendor kill switches.",
    mandated_control: "Automated repository SBOM dependency scanning, license compliance checks, and cryptographic SHA-256 verification of all software components.",
    penalty_or_consequence: "Empanelment disqualification for software vendors; major non-conformity in cyber audit.",
    audit_procedure: "Examine SBOM manifests for all critical applications and verify absence of unauthorized third-party libraries or kill switches.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "CSCRF-ID-AM-S2",
    framework: "SEBI CSCRF 2024",
    chapter_or_domain: "Identify: Asset Management",
    section_or_control: "Standard ID.AM.S2",
    title: "Asset Inventory & 3-Day SLA on Changes",
    statutory_text: "All REs shall maintain an up-to-date inventory of hardware, software, digital assets (URLs, APIs, domains), cloud assets, and data flows. Any additions, deletions, or changes shall be reflected in the asset inventory within 3 working days. No shadow IT permitted.",
    mandated_control: "Automated continuous asset discovery via ITSM/CMDB tool updating inventory within 72 hours of infrastructure alteration.",
    penalty_or_consequence: "Audit finding under CSCRF Annexure-B Table 15 item 2; mandatory remediation in 3 months.",
    audit_procedure: "Sample recent network additions and verify timestamp of discovery versus inventory registration date.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "CSCRF-PR-AA-S3",
    framework: "SEBI CSCRF 2024",
    chapter_or_domain: "Protect: Identity Management, Authentication & Access Control",
    section_or_control: "Standard PR.AA.S3 & PR.AA.S4",
    title: "Zero Trust Security Model & Principle of Least Privilege (PoLP)",
    statutory_text: "While granting access permissions and authorizations to resources, Principle of Least Privilege (PoLP) shall be followed along with segregation of duties. REs shall follow Zero Trust Model; access to critical systems is denied by default.",
    mandated_control: "Deterministic 4-tier specificity policy engine enforcing default-deny; explicit role-to-tool privilege authorization.",
    penalty_or_consequence: "Regulatory audit non-compliance; immediate revocation of unauthorized tool privileges.",
    audit_procedure: "Simulate unmapped role-action pairs and verify enforcement engine returns 403 Forbidden with default-deny citation.",
    compliance_status: "COMPLIANT",
    mapped_agent_action: "get_global_risk_report"
  },
  {
    id: "CSCRF-PR-AA-S8",
    framework: "SEBI CSCRF 2024",
    chapter_or_domain: "Protect: Identity Management, Authentication & Access Control",
    section_or_control: "Standard PR.AA.S8",
    title: "Comprehensive Log Management & 2-Year Retention",
    statutory_text: "REs shall collect system, application, network, database, security, and audit trail logs. Logs shall be maintained and stored in a secure location for a time period not less than two (2) years (at least 6 months online and rest in archival mode).",
    mandated_control: "Centralized immutable audit ledger with SHA-256 integrity hashing; minimum 2-year retention lifecycle.",
    penalty_or_consequence: "Failure of compliance audit under Annexure-B Checklist Item 6; regulatory sanction.",
    audit_procedure: "Inspect log storage repository, archiving configurations, and test tamper-evident checksum verification.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "CSCRF-PR-DS-S2",
    framework: "SEBI CSCRF 2024",
    chapter_or_domain: "Protect: Data Security",
    section_or_control: "Standard PR.DS.S2",
    title: "Data Classification & Sovereign Data Localization",
    statutory_text: "REs shall classify data into Regulatory Data and IT/Cybersecurity Data. Original Regulatory Data must be kept accessible and stored within the legal boundaries of India. IT and Cybersecurity Data sent to international SOC/SaaS must be approved by Board.",
    mandated_control: "Automated data classification tags; physical and logical hosting verification ensuring Indian sovereignty for Regulatory Data.",
    penalty_or_consequence: "Critical statutory breach; regulatory inquiry by SEBI under Section 11(1) of SEBI Act.",
    audit_procedure: "Verify primary and backup data storage geographic IP ranges; inspect cloud provider contracts for Indian data sovereignty clauses.",
    compliance_status: "COMPLIANT",
    mapped_agent_action: "export_customer_data"
  },
  {
    id: "CSCRF-PR-MA-S3",
    framework: "SEBI CSCRF 2024",
    chapter_or_domain: "Protect: Maintenance",
    section_or_control: "Standard PR.MA.S3",
    title: "Mandatory Patch Management Timelines (1 Week High, 2 Weeks Mod)",
    statutory_text: "Patches shall be categorized based on severity: High severity <= 1 week; Moderate severity <= 2 weeks; Low severity <= 1 month. Critical emergency patches deployed immediately. Virtual patching allowed for legacy systems for maximum 6 months.",
    mandated_control: "Automated vulnerability scanner integrated with patch deployment pipeline enforcing 7-day High / 24-hr Critical patching SLA.",
    penalty_or_consequence: "Non-compliance finding in VAPT audit; heightened exploitation risk.",
    audit_procedure: "Compare patch release timestamps against deployment timestamps across all production servers.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "CSCRF-DE-CM-S1",
    framework: "SEBI CSCRF 2024",
    chapter_or_domain: "Detect: Security Continuous Monitoring",
    section_or_control: "Standard DE.CM.S1 & S3",
    title: "24x7x365 SOC & Market SOC Onboarding",
    statutory_text: "All REs must establish continuous security monitoring through a 24x7x365 SOC (own SOC, Market SOC by NSE/BSE, or third-party). Small REs must onboard to Market SOC. Measure functional efficacy across 5 domains.",
    mandated_control: "Continuous live ingestion of system, network, and application telemetry into SOC/SIEM with automated alert rules.",
    penalty_or_consequence: "Mandatory directive to onboard Market SOC; audit non-conformity.",
    audit_procedure: "Review SOC SLA logs, SIEM ingestion metrics, and annual SOC efficacy report per Annexure-N.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "CSCRF-DE-CM-S5",
    framework: "SEBI CSCRF 2024",
    chapter_or_domain: "Detect: Security Continuous Monitoring",
    section_or_control: "Standard DE.CM.S5",
    title: "VAPT Scope: 100% Critical & 25% Non-Critical Systems",
    statutory_text: "VAPT shall be conducted covering 100% of critical systems and 25% of non-critical systems. Report submitted within 1 month of test; findings closed within 3 months; revalidation completed within 5 months.",
    mandated_control: "Comprehensive automated/manual VAPT program covering infra, web, APIs, mobile, and cloud environments with strict closure SLA.",
    penalty_or_consequence: "Regulatory submission rejection; escalation to SEBI High Powered Steering Committee (HPSC-CS).",
    audit_procedure: "Inspect VAPT report (Annexure-A), verify 100% critical asset coverage, and confirm closure within 90 days.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "CSCRF-RS-CO-S1",
    framework: "SEBI CSCRF 2024",
    chapter_or_domain: "Respond: Incident Response Reporting & Communication",
    section_or_control: "Standard RS.CO.S1",
    title: "Mandatory 6-Hour Incident Reporting to SEBI & CERT-In",
    statutory_text: "Any cyber-attack, incident or breach falling under CERT-In directions shall be notified to SEBI (mkt_incidents@sebi.gov.in) and CERT-In within 6 hours of detection. Full incident report submitted on SEBI portal within 24 hours.",
    mandated_control: "Automated incident dispatch webhook alerting security officers and generating 6-hour regulatory notification drafts.",
    penalty_or_consequence: "Regulatory enforcement action by SEBI and statutory CERT-In penalties under IT Act Section 70B.",
    audit_procedure: "Test incident timeline drills and verify notification timestamps against the 6-hour detection threshold.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "CSCRF-RC-RP-S2",
    framework: "SEBI CSCRF 2024",
    chapter_or_domain: "Recover: Incident Recovery Plan Execution",
    section_or_control: "Standard RC.RP.S2",
    title: "Disaster Declaration (30 min), RTO <= 2 Hours, RPO <= 15 Min",
    statutory_text: "In the event of critical system disruption, declare 'Disaster' within 30 minutes. Resumption of critical operations with Recovery Time Objective (RTO) <= 2 hours and Recovery Point Objective (RPO) <= 15 minutes.",
    mandated_control: "Automated failover clustering, continuous transactional replication, and pre-scripted DR invocation workflows.",
    penalty_or_consequence: "Supervisory intervention; market trading suspension for MIIs/brokers.",
    audit_procedure: "Review semi-annual disaster recovery drill logs and verify failover time <= 120 minutes and data loss <= 15 minutes.",
    compliance_status: "COMPLIANT"
  },

  // --- RBI PSO 2024 ---
  {
    id: "RBI-PSO-PARA-7",
    framework: "RBI PSO 2024",
    chapter_or_domain: "Section II: Governance Controls",
    section_or_control: "Paragraph 7 & 8",
    title: "Board Oversight & Quarterly IT Sub-Committee",
    statutory_text: "The Board of Directors of the PSO shall ensure adequate oversight over information security and cyber resilience. Oversight delegated to a Board sub-committee headed by cybersecurity expert, meeting at least once every quarter.",
    mandated_control: "Quarterly Board cybersecurity sub-committee meetings, CISO charter, and annual Board review of IS Policy.",
    penalty_or_consequence: "Regulatory supervisory rating downgrade by RBI; directions under Section 10(2) of PSS Act 2007.",
    audit_procedure: "Inspect sub-committee meeting charters, minutes, and verification of cybersecurity expert leadership.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "RBI-PSO-PARA-16",
    framework: "RBI PSO 2024",
    chapter_or_domain: "Section III: Baseline Security Controls",
    section_or_control: "Paragraph 16",
    title: "Network Security & Multi-Layer Boundary Defense",
    statutory_text: "Network devices configured and checked periodically for security rules; 24x7x365 SOC; SIEM correlating alerts across business units; anti-malware scanning incoming data; network segmentation between prod, test, and dev; port whitelisting.",
    mandated_control: "Micro-segmentation between development, staging, and production; default-deny ingress/egress firewalls; port whitelisting.",
    penalty_or_consequence: "Regulatory inspection non-compliance; operational restriction on payment processing.",
    audit_procedure: "Review firewall rulesets, test network isolation between dev and prod environments, and confirm port whitelist.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "RBI-PSO-PARA-22-D",
    framework: "RBI PSO 2024",
    chapter_or_domain: "Section III: Baseline Security Controls",
    section_or_control: "Paragraph 22(d)",
    title: "Mandatory 6-Hour Incident Reporting to RBI (Annex 1) & CERT-In",
    statutory_text: "Unusual incidents like cyber-attacks, outage of critical system/infrastructure, internal fraud, settlement delay, etc., shall be reported to RBI in the Incident Reporting Format (Annex 1) within 6 hours of detection. Any cyber incident reported to CERT-In.",
    mandated_control: "Pre-configured RBI Annex 1 incident reporting workflow with 6-hour automated alert escalation.",
    penalty_or_consequence: "Regulatory penalty and supervisory action under Section 18 of Payment and Settlement Systems Act 2007.",
    audit_procedure: "Review incident response runbooks and verify test reporting to RBI DPSS within 6 hours of simulated outage.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "RBI-PSO-PARA-27-A",
    framework: "RBI PSO 2024",
    chapter_or_domain: "Section III: Baseline Security Controls",
    section_or_control: "Paragraph 27(a)",
    title: "Mandatory Multi-Factor Authentication (MFA) on Payment Debits",
    statutory_text: "The PSO shall ensure that all payment transactions, including cash withdrawals, involving debit to the account conducted through electronic modes are permitted only by validation through multi-factor authentication.",
    mandated_control: "Enforce mandatory MFA (two independent factors) on 100% of debit payment instructions prior to processing authorization.",
    penalty_or_consequence: "Immediate directive to halt non-MFA debit transactions; liability for unauthorized customer losses.",
    audit_procedure: "Sample transaction authorization flows and confirm that debit requests without secondary authentication factor are rejected.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "RBI-PSO-PARA-27-E",
    framework: "RBI PSO 2024",
    chapter_or_domain: "Section III: Baseline Security Controls",
    section_or_control: "Paragraph 27(e)",
    title: "Mandatory 5-Year Audit Log Preservation",
    statutory_text: "The PSO shall put in place a mechanism to capture, analyse, store and archive audit logs in a systematic manner. Log messages shall uniquely identify the user, action, and parameters. Audit logs shall be preserved for a period of at least five (5) years.",
    mandated_control: "WORM (Write Once Read Many) compliant long-term archival storage retaining audit logs for minimum 5 years.",
    penalty_or_consequence: "Regulatory non-compliance citation; inability to support legal evidentiary requirements.",
    audit_procedure: "Verify log retention policies and check storage bucket lifecycle rules enforcing 5-year retention.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "RBI-PSO-PARA-29-A",
    framework: "RBI PSO 2024",
    chapter_or_domain: "Section IV: Digital Payment Security Controls",
    section_or_control: "Paragraph 29(a)-(c)",
    title: "Customer Alert Redaction, Merchant Name & OTP Positioning",
    statutory_text: "While sending SMS/email alerts: (a) Bank account/card number redacted/masked; (b) Online payments must display merchant name (not gateway) and amount; (c) OTP must be placed at the end of notification message referencing specific transaction.",
    mandated_control: "Egress notification sanitizer masking account numbers, fetching verified beneficiary merchant names, and placing OTP at terminal position.",
    penalty_or_consequence: "Consumer grievance redressal action; supervisory penalties by RBI DPSS.",
    audit_procedure: "Test customer alert generator with test transactions to verify masking and OTP message structure.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "RBI-PSO-PARA-31-C",
    framework: "RBI PSO 2024",
    chapter_or_domain: "Section IV: Digital Payment Security Controls",
    section_or_control: "Paragraph 31(c)",
    title: "Mobile App Device & SIM Binding",
    statutory_text: "The PSO shall ensure device binding / finger printing of mobile applications with the device and SIM. In case the mobile application remains unused beyond policy determined period, device binding must be performed again.",
    mandated_control: "Cryptographic binding of app session token with device IMEI/Hardware ID and SIM IMSI cryptographic hash.",
    penalty_or_consequence: "Payment application security vulnerability; required immediate remediation.",
    audit_procedure: "Attempt application execution on cloned device or with altered SIM to verify automatic authorization denial.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "RBI-PSO-PARA-31-G",
    framework: "RBI PSO 2024",
    chapter_or_domain: "Section IV: Digital Payment Security Controls",
    section_or_control: "Paragraph 31(g)",
    title: "Mandatory 12-Hour Cooling Period for Profile Credential Changes",
    statutory_text: "Whenever there is a change in registered mobile number or email ID linked to the payment instrument there shall be a cooling period of minimum 12 hours before allowing any payment transaction through online modes.",
    mandated_control: "Stateful 12-hour account cooling lock on outbound payment transactions following profile credential modifications.",
    penalty_or_consequence: "Supervisory audit violation; financial liability for account takeover fraud.",
    audit_procedure: "Simulate phone number change and attempt instant funds transfer; verify 12-hour hold timer is enforced.",
    compliance_status: "COMPLIANT"
  },

  // --- NIST SP 800-37 RMF ---
  {
    id: "NIST-RMF-TASK-P-11",
    framework: "NIST SP 800-37 RMF",
    chapter_or_domain: "Step 1: Prepare (System Level)",
    section_or_control: "Task P-11",
    title: "Determine Authorization Boundary",
    statutory_text: "Determine the authorization boundary of the system. The authorization boundary establishes the scope of protection for an information system and includes all people, processes, and information technologies supporting the system.",
    mandated_control: "Formal system boundary documentation distinguishing in-scope internal microservices from external third-party provider systems.",
    penalty_or_consequence: "Inability to render Authorization to Operate (ATO); governance gap across external boundaries.",
    audit_procedure: "Review network architecture, data flow diagrams, and confirm that all agent tool integrations are within declared boundary.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "NIST-RMF-TASK-C-2",
    framework: "NIST SP 800-37 RMF",
    chapter_or_domain: "Step 2: Categorize",
    section_or_control: "Task C-2",
    title: "Security Categorization via FIPS 199/200 High-Water Mark",
    statutory_text: "Categorize the system and document the security categorization results. Categorization determinations consider potential adverse impacts from loss of confidentiality, integrity, or availability using high-water mark concept (Low, Moderate, High).",
    mandated_control: "System security categorization matrix evaluating impact on operations, assets, individuals, and national financial infrastructure.",
    penalty_or_consequence: "Incorrect control baseline selection leading to systemic vulnerabilities.",
    audit_procedure: "Audit information type categorization documentation and verify that high-impact systems implement required SP 800-53 controls.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "NIST-RMF-TASK-A-3",
    framework: "NIST SP 800-37 RMF",
    chapter_or_domain: "Step 5: Assess",
    section_or_control: "Task A-3",
    title: "Control Assessments & Independent Evaluation",
    statutory_text: "Assess the controls in accordance with assessment procedures described in assessment plans to determine if controls are implemented correctly, operating as intended, and producing desired outcomes. Assessor independence required.",
    mandated_control: "Independent technical control assessment (code inspection, configuration verification, penetration testing).",
    penalty_or_consequence: "Denial of Authorization to Operate; invalidation of security posture claims.",
    audit_procedure: "Examine Security Assessment Report (SAR) produced by independent control assessor.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "NIST-RMF-TASK-R-4",
    framework: "NIST SP 800-37 RMF",
    chapter_or_domain: "Step 6: Authorize",
    section_or_control: "Task R-4",
    title: "Explicit Authorization Decision (ATO / Denial)",
    statutory_text: "Determine if the risk from the operation or use of the information system is acceptable. The explicit acceptance of risk is the responsibility of the Authorizing Official (AO) and cannot be delegated. Renders ATO, ATU, Common Control Auth, or Denial.",
    mandated_control: "Signed formal ATO decision document by designated executive Authorizing Official based on complete authorization package.",
    penalty_or_consequence: "Operating without ATO is an immediate violation of federal and organizational governance policy.",
    audit_procedure: "Inspect official signed ATO letter and verify that authorization terms, conditions, and termination dates are active.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "NIST-RMF-TASK-M-2",
    framework: "NIST SP 800-37 RMF",
    chapter_or_domain: "Step 7: Monitor",
    section_or_control: "Task M-2",
    title: "Ongoing Control Assessments & Continuous Monitoring",
    statutory_text: "Assess the controls implemented within and inherited by the system in accordance with continuous monitoring strategy. Ongoing assessments support near real-time risk management and ongoing authorization.",
    mandated_control: "Automated continuous control monitoring, vulnerability scans, and SIEM metric integration feeding real-time posture dashboard.",
    penalty_or_consequence: "Rescission of ongoing authorization; required static reauthorization.",
    audit_procedure: "Verify automated telemetry feeds and audit continuous monitoring frequency records.",
    compliance_status: "COMPLIANT"
  },

  // --- PCI DSS v4.0.1 ---
  {
    id: "PCI-DSS-REQ-3-3-1",
    framework: "PCI DSS v4.0.1",
    chapter_or_domain: "Requirement 3: Protect Stored Account Data",
    section_or_control: "Requirement 3.3.1",
    title: "Prohibition of Sensitive Authentication Data (SAD) Post-Authorization",
    statutory_text: "Sensitive authentication data (SAD) is not stored after authorization, even if encrypted. All SAD received is rendered unrecoverable upon completion of authorization: (3.3.1.1) full track data; (3.3.1.2) card verification code (CVV/CVC); (3.3.1.3) PIN and PIN block.",
    mandated_control: "Strict memory-only processing of SAD; zero persistent storage; automated secure purge after authorization completion.",
    penalty_or_consequence: "CRITICAL PCI DSS non-compliance; immediate fines from payment brands and potential revocation of card acquiring privileges.",
    audit_procedure: "Execute deep file, database, and memory dump scans across all CDE components to verify zero post-authorization SAD storage.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "PCI-DSS-REQ-3-4-1",
    framework: "PCI DSS v4.0.1",
    chapter_or_domain: "Requirement 3: Protect Stored Account Data",
    section_or_control: "Requirement 3.4.1",
    title: "PAN Display Masking (BIN and Last 4 Maximum)",
    statutory_text: "PAN is masked when displayed (the BIN and last four digits are the maximum number of digits to be displayed), such that only personnel with a legitimate business need can see more than the BIN and last four digits.",
    mandated_control: "Application-level masking displaying maximum first 6 (BIN) and last 4 digits (e.g. 4111-11XX-XXXX-1111); full PAN view restricted to authenticated admins.",
    penalty_or_consequence: "PCI DSS non-compliance finding; payment brand fines.",
    audit_procedure: "Inspect screen displays, reports, and receipts across user roles to verify masking controls.",
    compliance_status: "COMPLIANT",
    mapped_agent_action: "export_customer_data"
  },
  {
    id: "PCI-DSS-REQ-3-5-1",
    framework: "PCI DSS v4.0.1",
    chapter_or_domain: "Requirement 3: Protect Stored Account Data",
    section_or_control: "Requirement 3.5.1",
    title: "PAN Rendered Unreadable Wherever Stored",
    statutory_text: "PAN is rendered unreadable anywhere it is stored by using: one-way keyed cryptographic hashes of entire PAN, truncation, index tokens, or strong cryptography with associated key management.",
    mandated_control: "AES-256 or HMAC-SHA256 encryption/tokenization of PAN across databases, file stores, backups, and log archives.",
    penalty_or_consequence: "Catastrophic data breach risk; immediate loss of PCI compliance certification.",
    audit_procedure: "Inspect data stores and verify all stored PAN instances are encrypted or tokenized.",
    compliance_status: "COMPLIANT",
    mapped_agent_action: "export_customer_data"
  },
  {
    id: "PCI-DSS-REQ-6-2-4",
    framework: "PCI DSS v4.0.1",
    chapter_or_domain: "Requirement 6: Develop & Maintain Secure Systems",
    section_or_control: "Requirement 6.2.4",
    title: "Software Engineering Techniques to Prevent Common Attacks",
    statutory_text: "Software engineering techniques are defined and in use to prevent common attacks: injection attacks (SQL, LDAP, XPath, command), buffer/pointer manipulation, cryptographic flaws, business logic flaws (XSS, CSRF), access control bypass.",
    mandated_control: "Input perimeter defense (injection scanner), parameterized database queries, and secure coding standards in S-SDLC.",
    penalty_or_consequence: "Software vulnerability exploitation; failed code security audit.",
    audit_procedure: "Examine automated SAST/DAST results and verify adversarial prompt injection testing suite.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "PCI-DSS-REQ-8-4-2",
    framework: "PCI DSS v4.0.1",
    chapter_or_domain: "Requirement 8: Identify Users and Authenticate Access",
    section_or_control: "Requirement 8.4.2",
    title: "MFA for All Non-Console Access into CDE",
    statutory_text: "Multi-factor authentication (MFA) is implemented for all non-console access into the CDE for personnel with administrative access, all non-console access into the CDE, and all remote access originating from outside the entity's network.",
    mandated_control: "Mandatory two-factor authentication (password + hardware/software token or FIDO2) for all CDE access.",
    penalty_or_consequence: "Critical audit failure; immediate requirement to implement MFA before compliance sign-off.",
    audit_procedure: "Observe user and admin login workflows to confirm MFA challenge on all remote and non-console connections.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "PCI-DSS-REQ-10-2-1",
    framework: "PCI DSS v4.0.1",
    chapter_or_domain: "Requirement 10: Log and Monitor All Access",
    section_or_control: "Requirement 10.2.1 & 10.5.1",
    title: "Audit Logs for All User Access to Cardholder Data & 12-Month Retention",
    statutory_text: "Audit logs capture all individual user access to cardholder data, administrative actions, invalid logon attempts, credential changes. Retain audit log history for at least 12 months, with at least the most recent 3 months immediately available online.",
    mandated_control: "Immutable event logging recording user ID, timestamp, event type, success/failure, origin IP, and resource name; 12-month retention policy.",
    penalty_or_consequence: "Inability to perform forensic analysis following security compromise; failed compliance report.",
    audit_procedure: "Review audit log configurations and verify sample log entries for all required metadata fields.",
    compliance_status: "COMPLIANT"
  },
  {
    id: "PCI-DSS-REQ-12-8-2",
    framework: "PCI DSS v4.0.1",
    chapter_or_domain: "Requirement 12: Support Information Security with Policies",
    section_or_control: "Requirement 12.8.2",
    title: "Written Agreements & Responsibility Matrix with TPSPs",
    statutory_text: "Maintain written agreements with all third-party service providers (TPSPs) with which account data is shared. Written agreements include acknowledgment from TPSP that they are responsible for security of account data they possess or process.",
    mandated_control: "Signed TPSP agreements including formal PCI DSS responsibility matrix and annual Attestation of Compliance (AOC) verification.",
    penalty_or_consequence: "TPSP non-compliance renders the hiring entity non-compliant under Requirement 12.8.",
    audit_procedure: "Examine TPSP contracts and verify documented responsibility matrix identifying customer vs provider controls.",
    compliance_status: "COMPLIANT",
    mapped_agent_action: "get_own_compliance_status"
  }
];

export function evaluateGRCAudit(
  role: AgentRole,
  action: ToolAction,
  context: string,
  frameworkFilter?: string
): GRCAuditReport {
  const isVendor = role === 'Vendor';
  const isAdmin = role === 'Admin';
  const isAuditor = role === 'Auditor';

  let compliantCount = 0;
  let violationsCount = 0;
  let totalPenaltyExposure = 0;

  const evaluatedRegulations = FULL_REGULATIONS_LIST.filter((reg) => {
    if (!frameworkFilter || frameworkFilter === 'ALL') return true;
    return reg.framework.toLowerCase().includes(frameworkFilter.toLowerCase());
  }).map((reg) => {
    let status: 'COMPLIANT' | 'VIOLATION' = 'COMPLIANT';
    let finding = 'In Full Compliance with statutory mandate';
    let risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let penalty = 0;

    // Check action and role compliance against this regulation
    if (action === 'export_customer_data') {
      if (isVendor) {
        if (reg.id.includes('DPDP-SEC-8-5')) {
          status = 'VIOLATION';
          finding = 'CRITICAL VIOLATION: External vendor attempted raw personal data extraction without statutory safeguards.';
          risk_level = 'CRITICAL';
          penalty = 250;
        } else if (reg.id.includes('DPDP-SEC-16-1') || reg.id.includes('CSCRF-PR-DS-S2')) {
          status = 'VIOLATION';
          finding = 'REGULATORY BREACH: Cross-border/Third-party data exfiltration attempt violating Data Localization.';
          risk_level = 'HIGH';
          penalty = 50;
        } else if (reg.id.includes('PCI-DSS-REQ-3-5-1') || reg.id.includes('PCI-DSS-REQ-3-4-1')) {
          status = 'VIOLATION';
          finding = 'PCI NON-COMPLIANCE: Vendor account requested unmasked account numbers / PAN.';
          risk_level = 'HIGH';
        } else if (reg.id.includes('CSCRF-PR-AA-S3')) {
          status = 'VIOLATION';
          finding = 'ACCESS CONTROL FAILURE: Zero-Trust violation for Vendor role attempting unprivileged tool access.';
          risk_level = 'HIGH';
        }
      } else if (isAuditor) {
        if (reg.id.includes('DPDP-SEC-4-1') || reg.id.includes('DPDP-SEC-6-1')) {
          status = 'VIOLATION';
          finding = 'PURPOSE LIMITATION BREACH: Auditor role cannot perform operational raw personal data extraction.';
          risk_level = 'HIGH';
          penalty = 50;
        }
      } else if (isAdmin) {
        if (reg.id.includes('DPDP-SEC-8-5')) {
          finding = 'COMPLIANT VIA SAFEGUARD: Admin export validated; downstream automated PII redaction active.';
          status = 'COMPLIANT';
        } else if (reg.id.includes('PCI-DSS-REQ-3-4-1')) {
          finding = 'COMPLIANT: Admin access permitted with dynamic masking of middle digits.';
          status = 'COMPLIANT';
        }
      }
    } else if (action === 'get_global_risk_report') {
      if (isVendor) {
        if (reg.id.includes('CSCRF-PR-AA-S3')) {
          status = 'VIOLATION';
          finding = 'SYSTEMIC RISK BREACH: Vendor restricted from viewing macro cross-market vulnerability intelligence.';
          risk_level = 'HIGH';
          penalty = 10;
        } else if (reg.id.includes('RBI-PSO-PARA-16')) {
          status = 'VIOLATION';
          finding = 'NETWORK & ASSET SEGREGATION BREACH: Vendor perimeter isolation breached.';
          risk_level = 'HIGH';
        }
      } else {
        finding = `AUTHORIZED: ${role} role has verified mandate to inspect systemic risk intelligence.`;
        status = 'COMPLIANT';
      }
    } else if (action === 'get_own_compliance_status') {
      finding = `AUTHORIZED: ${role} role permitted to inspect compliance telemetry.`;
      status = 'COMPLIANT';
    }

    if (status === 'VIOLATION') {
      violationsCount++;
      totalPenaltyExposure += penalty;
    } else {
      compliantCount++;
    }

    return {
      ...reg,
      compliance_status: status,
      finding,
      risk_level,
      penalty_exposure_cr: penalty
    };
  });

  const totalEvaluated = evaluatedRegulations.length;
  const compliancePercentage = Math.round((compliantCount / Math.max(1, totalEvaluated)) * 100);

  return {
    overall_verdict: violationsCount === 0 ? 'APPROVED' : 'AUDIT_REJECTED',
    total_evaluated: totalEvaluated,
    compliant_count: compliantCount,
    violations_count: violationsCount,
    total_penalty_exposure_cr: totalPenaltyExposure,
    compliance_percentage: compliancePercentage,
    regulations: evaluatedRegulations,
    timestamp: new Date().toISOString(),
    auditor_notes: violationsCount === 0
      ? 'The requested operation satisfies every audited statutory clause across the designated framework baselines.'
      : `Operation halted: ${violationsCount} statutory compliance violation(s) identified with ₹${totalPenaltyExposure} Crore maximum potential statutory penalty exposure.`
  };
}

export const STATUTORY_FRAMEWORKS_INFO = [
  {
    name: 'DPDP Act 2023',
    fullName: 'Digital Personal Data Protection Act, 2023 (Ministry of Electronics & IT, India)',
    totalSections: 44,
    keyPenalties: 'Up to ₹250 Crore per breach (Schedule 1)',
    file: 'data/dpdp_act_2023.txt',
    domains: 'Data Fiduciary Obligations, Consent, Children, SDF, Penalties',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    name: 'SEBI CSCRF 2024',
    fullName: 'SEBI Cybersecurity & Cyber Resilience Framework for Regulated Entities',
    totalSections: 58,
    keyPenalties: 'SEBI Act Sec 11(1) Sanctions, Cyber Capability Index Downgrades, Trading Suspension',
    file: 'data/sebi_cscrf_2024.txt',
    domains: 'Governance (GV), Identify (ID), Protect (PR), Detect (DE), Respond (RS), Recover (RC), Evolve (EV)',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    name: 'RBI PSO 2024',
    fullName: 'RBI Master Directions on Cyber Resilience and Digital Payment Security for PSOs',
    totalSections: 35,
    keyPenalties: 'Section 10(2) & 18 Directions, License Revocation under PSS Act 2007',
    file: 'data/rbi_cyber_resilience_pso_2024.txt',
    domains: 'Governance, Baseline Security Controls, Digital Payment Security, 6-Hour Incident Reporting',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    name: 'NIST SP 800-37 RMF',
    fullName: 'NIST Special Publication 800-37 Rev 2: Risk Management Framework',
    totalSections: 48,
    keyPenalties: 'Denial of Authorization to Operate (ATO), Revocation of System Authority',
    file: 'data/nist_sp_800_37_r2.txt',
    domains: 'Prepare, Categorize, Select, Implement, Assess, Authorize, Monitor (Tasks P-1 to M-7)',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    name: 'PCI DSS v4.0.1',
    fullName: 'Payment Card Industry Data Security Standard Version 4.0.1',
    totalSections: 12,
    keyPenalties: 'Loss of Card Acquiring Authority, Monthly Non-Compliance Fines, Category 1 Audit Sanctions',
    file: 'data/pci_dss_v4_0_1.txt',
    domains: 'Network Security, Account Data Protection, Vulnerability Management, Access Control, Logging, Testing',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  }
];
