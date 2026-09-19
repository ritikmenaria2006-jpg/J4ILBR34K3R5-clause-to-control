#!/usr/bin/env python3
"""
Clause-to-Control: Policy Enforcer Middleware (enforcer.py)
------------------------------------------------------------
Core deterministic access arbitration layer implementing runtime governance.
Interprets compiled legal matrices from policy_rules.json and evaluates incoming
agent tool executions against strict regulatory clauses.

Specificity Resolution Hierarchy (Highest to Lowest):
  1. Exact Match  (Score 4): role == target_role AND action == target_action
  2. Role Match   (Score 3): role == target_role AND action == '*'
  3. Action Match (Score 2): role == '*'         AND action == target_action
  4. Global Match (Score 1): role == '*'         AND action == '*'
  5. Default Deny (Score 0): Strict Zero-Trust baseline rejection.
"""

import json
from pathlib import Path
from typing import Dict, Any, List, Optional

# Default fallback policy path
DEFAULT_POLICY_PATH = Path(__file__).resolve().parent.parent / "policy" / "policy_rules.json"


def load_policy_rules(policy_path: Optional[Path] = None) -> List[Dict[str, Any]]:
    """Loads compiled rules matrix from the JSON repository."""
    target_path = policy_path or DEFAULT_POLICY_PATH
    if not target_path.exists():
        print(f"[ENFORCER WARN] Policy file not found at {target_path}. Using empty ruleset.")
        return []
    try:
        data = json.loads(target_path.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return data
        return []
    except Exception as exc:
        print(f"[ENFORCER ERROR] Could not read policy rules: {exc}")
        return []


def check_permission(role: str, action: str, policy_path: Optional[Path] = None) -> Dict[str, Any]:
    """
    Evaluates role and requested tool action using the strict specificity scoring hierarchy.

    Args:
        role (str): The authenticated or selected agent role (e.g., 'Admin', 'Auditor', 'Vendor').
        action (str): The target MCP tool identifier (e.g., 'export_customer_data').
        policy_path (Optional[Path]): Override path for policy_rules.json.

    Returns:
        Dict[str, Any]: {
            "allowed": bool,
            "cited_clause": str,
            "clause_text": str
        }
    """
    normalized_role = (role or "").strip().capitalize()
    normalized_action = (action or "").strip().lower()

    rules = load_policy_rules(policy_path)

    best_match_score = -1
    best_rule: Optional[Dict[str, Any]] = None

    for rule in rules:
        r_role = rule.get("role", "").strip()
        r_action = rule.get("action", "").strip().lower()

        # Specificity Level 4: Exact Match
        if r_role == normalized_role and r_action == normalized_action:
            score = 4
        # Specificity Level 3: Role Wildcard
        elif r_role == normalized_role and r_action == "*":
            score = 3
        # Specificity Level 2: Action Wildcard
        elif r_role == "*" and r_action == normalized_action:
            score = 2
        # Specificity Level 1: Full Wildcard
        elif r_role == "*" and r_action == "*":
            score = 1
        else:
            continue

        # Keep rule with highest specificity
        if score > best_match_score:
            best_match_score = score
            best_rule = rule

    # If matching rule exists in policy matrix
    if best_rule is not None and best_match_score > 0:
        return {
            "allowed": bool(best_rule.get("allowed", False)),
            "cited_clause": best_rule.get("cited_clause", "CLAUSE-UNSPECIFIED"),
            "clause_text": best_rule.get("clause_text", "No detailed clause text provided.")
        }

    # Default Deny: Zero-Trust baseline
    return {
        "allowed": False,
        "cited_clause": "CLAUSE-ZERO-TRUST-DENY",
        "clause_text": (
            f"Zero-Trust Baseline Enforcement: Role '{normalized_role}' has no authorized grant "
            f"for tool operation '{normalized_action}' under SEBI CSCRF or DPDP 2023 regulations."
        )
    }


if __name__ == "__main__":
    print("Testing Vendor -> export_customer_data:")
    print(check_permission("Vendor", "export_customer_data"))

    print("\nTesting Admin -> export_customer_data:")
    print(check_permission("Admin", "export_customer_data"))

    print("\nTesting Unknown Role -> *:")
    print(check_permission("Guest", "export_customer_data"))
