#!/usr/bin/env python3
"""
Clause-to-Control: FastAPI Runtime Gateway (main.py)
---------------------------------------------------
Primary interception layer enforcing dynamic regulatory compliance on all
autonomous AI agent tool requests.

Execution Pipeline:
  Step 1: Input Perimeter Defense -> injection_guard.scan_for_injection(context_text)
          [Block if injection pattern detected]
  Step 2: Regulatory Access Control -> enforcer.check_permission(role, requested_action)
          [Block if policy denies action]
  Step 3: Tool Execution -> mock_tools.TOOL_REGISTRY[requested_action]()
  Step 4: Egress Data Sanitization -> pii_guard.redact_pii(raw_tool_output)
  Step 5: Immutable Audit Ledger -> Append record to /audit/audit_log.json
  Step 6: Return structured response to client.
"""

import os
import sys
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Add project root to sys.path to allow clean imports across modules
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from middleware.injection_guard import scan_for_injection
from middleware.enforcer import check_permission
from middleware.pii_guard import redact_pii
from middleware.grc_auditor import load_all_regulations, audit_request_against_regulations, run_full_institutional_grc_audit
from tools.mock_tools import TOOL_REGISTRY

# Audit log storage path
AUDIT_LOG_FILE = PROJECT_ROOT / "audit" / "audit_log.json"

app = FastAPI(
    title="Clause-to-Control API",
    description="Regulatory Governance Runtime Interceptor for Autonomous AI Agents",
    version="1.0.0"
)

# Enable CORS for local Streamlit / web frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AgentRequest(BaseModel):
    role: str = Field(..., description="Agent role: Admin, Auditor, or Vendor")
    requested_action: str = Field(..., description="Name of tool: get_global_risk_report, get_own_compliance_status, or export_customer_data")
    context_text: str = Field(..., description="Contextual prompt or instruction passed into the agent")


class AgentResponse(BaseModel):
    decision: str = Field(..., description="'APPROVED' or 'BLOCKED'")
    reason: str
    cited_clause: str
    clause_text: str
    raw_output: Optional[str] = None
    sanitized_output: Optional[str] = None
    pii_redacted: bool = False
    entities_detected: list = []
    injection_detected: bool = False
    matched_phrase: Optional[str] = None
    timestamp: str


def append_audit_entry(entry: Dict[str, Any]) -> None:
    """Appends an immutable governance record to /audit/audit_log.json."""
    AUDIT_LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    logs = []
    if AUDIT_LOG_FILE.exists():
        try:
            content = AUDIT_LOG_FILE.read_text(encoding="utf-8").strip()
            if content:
                logs = json.loads(content)
                if not isinstance(logs, list):
                    logs = []
        except Exception as exc:
            print(f"[AUDIT LOG WARN] Reinitializing malformed audit log: {exc}")
            logs = []

    logs.append(entry)
    AUDIT_LOG_FILE.write_text(json.dumps(logs, indent=2), encoding="utf-8")


@app.get("/health")
def health_check():
    """Health check diagnostic endpoint."""
    return {
        "status": "healthy",
        "service": "Clause-to-Control Runtime Gateway",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/audit/logs")
def get_audit_logs():
    """Returns historical governance transaction logs."""
    if not AUDIT_LOG_FILE.exists():
        return []
    try:
        return json.loads(AUDIT_LOG_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []


class GRCAuditQueryRequest(BaseModel):
    role: str = Field(..., description="Agent role: Admin, Auditor, or Vendor")
    action: str = Field(..., description="Action or tool invocation being evaluated")
    context_text: Optional[str] = Field("", description="Contextual prompt or instruction")
    framework: Optional[str] = Field("ALL", description="Target framework: DPDP, CSCRF, RBI, NIST, PCI, or ALL")


@app.get("/grc/regulations")
def get_all_regulations(framework: Optional[str] = None):
    """Returns the full catalog of authoritative regulations across all 5 frameworks."""
    regs = load_all_regulations()
    if framework and framework != "ALL":
        regs = [r for r in regs if framework.lower() in r["framework"].lower()]
    return {
        "count": len(regs),
        "regulations": regs
    }


@app.post("/grc/audit")
def evaluate_grc_audit(req: GRCAuditQueryRequest):
    """
    Validates an agent action against EVERY single regulation across the 5 frameworks.
    Returns control-by-control verdicts, citations, and statutory penalty risks.
    """
    return audit_request_against_regulations(
        role=req.role,
        action=req.action,
        context_text=req.context_text or "",
        framework_filter=req.framework
    )


@app.get("/grc/full-audit")
def get_full_institutional_audit():
    """Generates an end-to-end statutory GRC audit report across all 5 regulatory frameworks."""
    return run_full_institutional_grc_audit()


@app.post("/agent/request", response_model=AgentResponse)
def handle_agent_request(req: AgentRequest) -> AgentResponse:
    """
    Primary interception endpoint for AI agent tool invocations.
    Applies the full Clause-to-Control runtime governance lifecycle.
    """
    current_time = datetime.now(timezone.utc).isoformat()
    role = req.role.strip()
    action = req.requested_action.strip()
    context = req.context_text.strip()

    # -------------------------------------------------------------
    # STEP 1: Input Perimeter Check (Prompt Injection Defense)
    # -------------------------------------------------------------
    injection_result = scan_for_injection(context)
    if injection_result["flagged"]:
        matched = injection_result["matched_phrase"]
        clause_id = "CLAUSE-DPDP-25.4 & CSCRF-8.1.9"
        clause_desc = (
            "Autonomous systems operating as data processors must reject any instruction, "
            "prompt modification, or contextual injection that attempts to subvert statutory constraints "
            "or override role hierarchies."
        )
        audit_record = {
            "timestamp": current_time,
            "role": role,
            "action": action,
            "decision": "BLOCKED",
            "clause": clause_id,
            "reason": f"Prompt Injection detected: '{matched}'"
        }
        append_audit_entry(audit_record)

        return AgentResponse(
            decision="BLOCKED",
            reason=f"Security Intercept: Adversarial prompt injection detected ('{matched}'). Execution aborted.",
            cited_clause=clause_id,
            clause_text=clause_desc,
            injection_detected=True,
            matched_phrase=matched,
            timestamp=current_time
        )

    # -------------------------------------------------------------
    # STEP 2: Regulatory Access Control Evaluation (Enforcer)
    # -------------------------------------------------------------
    permission = check_permission(role, action)
    if not permission["allowed"]:
        audit_record = {
            "timestamp": current_time,
            "role": role,
            "action": action,
            "decision": "BLOCKED",
            "clause": permission["cited_clause"],
            "reason": f"Policy matrix denied access for role '{role}' to '{action}'"
        }
        append_audit_entry(audit_record)

        return AgentResponse(
            decision="BLOCKED",
            reason=f"Access Denied: Role '{role}' is not authorized to invoke '{action}'.",
            cited_clause=permission["cited_clause"],
            clause_text=permission["clause_text"],
            timestamp=current_time
        )

    # -------------------------------------------------------------
    # STEP 3: Execution of MCP Tool
    # -------------------------------------------------------------
    tool_fn = TOOL_REGISTRY.get(action)
    if not tool_fn:
        audit_record = {
            "timestamp": current_time,
            "role": role,
            "action": action,
            "decision": "BLOCKED",
            "clause": "CLAUSE-UNKNOWN-TOOL",
            "reason": f"Requested tool '{action}' does not exist in registry."
        }
        append_audit_entry(audit_record)

        raise HTTPException(
            status_code=404,
            detail=f"Tool '{action}' not found in registered agent capabilities."
        )

    raw_output = tool_fn()

    # -------------------------------------------------------------
    # STEP 4: Output Data Sanitization (PII Guard)
    # -------------------------------------------------------------
    pii_result = redact_pii(raw_output)
    sanitized_output = pii_result["redacted_text"]

    # -------------------------------------------------------------
    # STEP 5: Append to Immutable Audit Log
    # -------------------------------------------------------------
    audit_record = {
        "timestamp": current_time,
        "role": role,
        "action": action,
        "decision": "APPROVED",
        "clause": permission["cited_clause"],
        "reason": "Authorized execution under statutory mandate",
        "pii_redacted": pii_result["has_pii"]
    }
    append_audit_entry(audit_record)

    # -------------------------------------------------------------
    # STEP 6: Return Response
    # -------------------------------------------------------------
    return AgentResponse(
        decision="APPROVED",
        reason=f"Request granted under governing clause {permission['cited_clause']}.",
        cited_clause=permission["cited_clause"],
        clause_text=permission["clause_text"],
        raw_output=raw_output,
        sanitized_output=sanitized_output,
        pii_redacted=pii_result["has_pii"],
        entities_detected=pii_result["entities"],
        timestamp=current_time
    )


if __name__ == "__main__":
    import uvicorn
    print("[INFO] Starting Clause-to-Control FastAPI server on 0.0.0.0:8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
