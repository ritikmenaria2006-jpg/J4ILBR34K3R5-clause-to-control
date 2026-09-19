#!/usr/bin/env python3
"""
Clause-to-Control: Policy Compiler (compile_policy.py)
------------------------------------------------------
This module compiles regulatory legal texts (SEBI CSCRF and India DPDP Act 2023)
into an enforceable, deterministic policy permission matrix (policy_rules.json).

Pipeline:
  1. Ingest raw legal text documents from /data.
  2. Chunk texts into discrete regulatory clause units.
  3. Index chunks in a local ChromaDB vector database.
  4. Query ChromaDB for tool and role governance context.
  5. Prompt an LLM (Groq Llama 3 -> Gemini API fallback) to synthesize
     an enforceable permission schema.
  6. Fail-safe: When run with `--mock` (or on API/network rate limit failure),
     generates 8 curated, high-fidelity rules so the live hackfest demo never breaks.
"""

import os
import sys
import json
import argparse
from pathlib import Path
from typing import List, Dict, Any

# Curated deterministic permission matrix cross-mapped to all 5 statutory frameworks
CURATED_MOCK_RULES: List[Dict[str, Any]] = [
    {
        "role": "Vendor",
        "action": "export_customer_data",
        "condition": "External vendors barred from extracting customer records, PAN, or PII under any condition",
        "allowed": False,
        "cited_clause": "DPDP Sec 8(5) & Sec 16(1) | SEBI CSCRF PR.DS.S2 | RBI PSO Para 19(b) | PCI DSS Req 3.5.1 | NIST Task P-11",
        "clause_text": "Statutory data localization and third-party vendor isolation forbid contractors from exporting, downloading, or mass-querying production customer databases or PAN records. Cross-border transmission without sovereign approval is strictly prohibited (DPDP penalty up to ₹250 Cr)."
    },
    {
        "role": "Admin",
        "action": "export_customer_data",
        "condition": "Authorized operational data query subject to mandatory automated PII/PAN redaction prior to egress",
        "allowed": True,
        "cited_clause": "DPDP Sec 4(1) & 8(5) | SEBI CSCRF PR.DS.S1 | RBI PSO Para 20(d) | PCI DSS Req 3.4.1 | NIST Task S-3",
        "clause_text": "Data Fiduciary administrators may query operational data solely for lawful consented purposes, provided technical safeguards render PII and cardholder PAN unreadable (display masking of BIN and last 4 maximum digits)."
    },
    {
        "role": "Auditor",
        "action": "export_customer_data",
        "condition": "Statutory audit mandate does not confer bulk unredacted raw personal data or PAN export privileges",
        "allowed": False,
        "cited_clause": "DPDP Sec 6(1) & 10(2)(b) | SEBI CSCRF PR.AA.S3 | RBI PSO Para 15(d) | PCI DSS Req 7.2.6 | NIST Task A-3",
        "clause_text": "Audit access does not extend to raw customer personal data extraction without specific fiduciary authorization. Direct unfiltered ad-hoc query access to cardholder data repositories is prohibited for non-administrative auditors."
    },
    {
        "role": "Vendor",
        "action": "get_global_risk_report",
        "condition": "Cross-institutional systemic threat intelligence restricted from external supplier visibility",
        "allowed": False,
        "cited_clause": "SEBI CSCRF GV.RM.S3 & PR.AA.S3 | RBI PSO Para 16(f) | NIST Task P-14 | PCI DSS Req 1.4.1",
        "clause_text": "Regulated entities must ensure that access to macro systemic market risk reports, sector threat advisories, and consolidated vulnerability intelligence is restricted strictly to Authorized Compliance Officers, System Administrators, and certified statutory auditors."
    },
    {
        "role": "Admin",
        "action": "get_global_risk_report",
        "condition": "Infrastructure and security administrators authorized for systemic resilience and BCP oversight",
        "allowed": True,
        "cited_clause": "SEBI CSCRF GV.RR.S3 & RC.RP.S2 | RBI PSO Para 10 & 23(a) | NIST Task R-2 | PCI DSS Req 12.1.4",
        "clause_text": "Executive administrators and CISO personnel maintain full authority to review macro systemic risk reports to ensure compliance with 2-hour RTO and 15-minute RPO disaster resilience benchmarks."
    },
    {
        "role": "Auditor",
        "action": "get_global_risk_report",
        "condition": "Statutory compliance auditors authorized for cross-market vulnerability reviews and threat posture assessment",
        "allowed": True,
        "cited_clause": "SEBI CSCRF DE.CM.S5 & Annexure-B | RBI PSO Para 12 | NIST Task A-4 | PCI DSS Req 11.4.1",
        "clause_text": "CERT-In empanelled and designated statutory auditors are entitled to evaluate institutional risk reports and VAPT findings covering 100% of critical systems and 25% of non-critical assets."
    },
    {
        "role": "Auditor",
        "action": "get_own_compliance_status",
        "condition": "Statutory audit access to institutional posture and control telemetry",
        "allowed": True,
        "cited_clause": "SEBI CSCRF GV.OV.S4 & PR.AA.S8 | RBI PSO Para 27(e) | NIST Task M-5 | PCI DSS Req 10.2.1",
        "clause_text": "Auditors have explicit mandate to inspect Cyber Capability Index (CCI) metrics, 5-year preserved audit logs, and continuous monitoring telemetry."
    },
    {
        "role": "Vendor",
        "action": "get_own_compliance_status",
        "condition": "Self-inspection of vendor-specific compliance status, SBOM deposit, and SLA indicators",
        "allowed": True,
        "cited_clause": "SEBI CSCRF GV.SC.S5 & PR.IP.S14 | RBI PSO Para 19(a) | PCI DSS Req 12.8.2 | NIST Task P-5",
        "clause_text": "Third-party service providers are permitted to inspect their own sandboxed compliance metrics, SBOM verification status, and contractual security SLA adherence."
    }
]


def load_regulatory_documents(data_dir: Path) -> Dict[str, str]:
    """Reads raw text regulation files from the data directory across all 5 frameworks."""
    docs = {}
    target_files = [
        "dpdp_act_2023.txt",
        "sebi_cscrf_2024.txt",
        "rbi_cyber_resilience_pso_2024.txt",
        "nist_sp_800_37_r2.txt",
        "pci_dss_v4_0_1.txt",
        "cscrf_mock.txt",
        "dpdp_mock.txt"
    ]
    for filename in target_files:
        file_path = data_dir / filename
        if file_path.exists():
            docs[filename] = file_path.read_text(encoding="utf-8")
        else:
            print(f"[WARN] Regulatory file not found: {file_path}")
    return docs


def extract_rules_with_groq(context_text: str, api_key: str) -> List[Dict[str, Any]]:
    """Attempts rule extraction using Groq's Llama-3 API."""
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        system_prompt = (
            "You are a regulatory compliance AI compiler. Given regulatory text clauses, "
            "synthesize an enforceable access control matrix for AI agent tools. "
            "Output ONLY a valid JSON array of objects with keys: "
            "role (Admin/Auditor/Vendor), action (get_global_risk_report/get_own_compliance_status/export_customer_data), "
            "condition (str), allowed (bool), cited_clause (str), clause_text (str)."
        )
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze these regulatory clauses:\n\n{context_text}"}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        raw_content = response.choices[0].message.content
        data = json.loads(raw_content)
        if isinstance(data, dict) and "rules" in data:
            return data["rules"]
        elif isinstance(data, list):
            return data
        return list(data.values())[0]
    except Exception as err:
        print(f"[ERROR] Groq extraction failed: {err}")
        raise err


def extract_rules_with_gemini(context_text: str, api_key: str) -> List[Dict[str, Any]]:
    """Fallback rule extraction using Google Gemini API."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            "Analyze these regulatory clauses and compile them into a JSON list of access rules.\n"
            "Output ONLY valid JSON array with schema:\n"
            '[{"role": "Admin"|"Auditor"|"Vendor", "action": "get_global_risk_report"|"get_own_compliance_status"|"export_customer_data", '
            '"condition": "string", "allowed": true|false, "cited_clause": "string", "clause_text": "string"}]\n\n'
            f"Clauses:\n{context_text}"
        )
        resp = model.generate_content(prompt)
        text = resp.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        return json.loads(text.strip())
    except Exception as err:
        print(f"[ERROR] Gemini extraction failed: {err}")
        raise err


def build_and_compile(mock_mode: bool = False) -> None:
    """Main compilation entry point."""
    base_dir = Path(__file__).resolve().parent.parent
    data_dir = base_dir / "data"
    output_file = Path(__file__).resolve().parent / "policy_rules.json"

    print("==================================================")
    print("   Clause-to-Control : Policy Rule Compiler      ")
    print("==================================================")

    if mock_mode:
        print("[MOCK MODE ACTIVATED] Skipping LLM & ChromaDB ingestion.")
        print(f"[INFO] Writing {len(CURATED_MOCK_RULES)} curated SEBI CSCRF / DPDP rules to {output_file}...")
        output_file.write_text(json.dumps(CURATED_MOCK_RULES, indent=2), encoding="utf-8")
        print("[SUCCESS] Policy rules compiled successfully (Mock Mode).")
        return

    # Attempt live compilation pipeline
    print(f"[1/4] Ingesting legal texts from {data_dir}...")
    docs = load_regulatory_documents(data_dir)
    full_corpus = "\n\n".join(docs.values())

    if not full_corpus:
        print("[WARN] No document text found in /data. Falling back to curated rules.")
        output_file.write_text(json.dumps(CURATED_MOCK_RULES, indent=2), encoding="utf-8")
        return

    # Optional ChromaDB local indexing
    try:
        import chromadb
        print("[2/4] Indexing clauses in local ChromaDB...")
        chroma_client = chromadb.Client()
        collection = chroma_client.get_or_create_collection(name="regulatory_clauses")
        clauses = [c.strip() for c in full_corpus.split("\n\n") if c.strip()]
        for i, clause in enumerate(clauses):
            collection.upsert(
                documents=[clause],
                ids=[f"clause_{i}"],
                metadatas=[{"source": "mock_corpus", "index": i}]
            )
        print(f"[SUCCESS] ChromaDB indexed {len(clauses)} clause segments.")
    except Exception as e:
        print(f"[WARN] Local ChromaDB indexing skipped/failed ({e}). Continuing with in-memory context.")

    # LLM Synthesis with fallback
    print("[3/4] Synthesizing governance matrix via LLM...")
    groq_key = os.environ.get("GROQ_API_KEY")
    gemini_key = os.environ.get("GEMINI_API_KEY")
    rules = None

    if groq_key:
        print("[INFO] Attempting Groq extraction (Llama 3)...")
        try:
            rules = extract_rules_with_groq(full_corpus, groq_key)
            print("[SUCCESS] Groq extraction succeeded.")
        except Exception:
            print("[INFO] Falling back to Gemini...")

    if not rules and gemini_key:
        print("[INFO] Attempting Gemini extraction...")
        try:
            rules = extract_rules_with_gemini(full_corpus, gemini_key)
            print("[SUCCESS] Gemini extraction succeeded.")
        except Exception:
            print("[INFO] Gemini extraction failed.")

    if not rules:
        print("[INFO] LLM unavailable or keys not supplied. Applying guaranteed resilient fallback matrix.")
        rules = CURATED_MOCK_RULES

    print(f"[4/4] Writing compiled rules to {output_file}...")
    output_file.write_text(json.dumps(rules, indent=2), encoding="utf-8")
    print(f"[COMPLETE] Compiled {len(rules)} governance policies into policy_rules.json.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Compile regulatory texts into agent governance policies.")
    parser.add_argument(
        "--mock",
        action="store_true",
        help="Bypass LLM/ChromaDB and generate 8 curated SEBI CSCRF/DPDP rules."
    )
    args = parser.parse_args()
    build_and_compile(mock_mode=args.mock)
