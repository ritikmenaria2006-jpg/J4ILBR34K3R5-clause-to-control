#!/usr/bin/env python3
"""
Clause-to-Control: PII Guard Middleware (pii_guard.py)
------------------------------------------------------
Downstream data egress sanitization engine implementing DPDP 2023 Clause 8.3
and SEBI CSCRF Clause 9.4.0.

Resilience Architecture (Hackfest Fail-Safe):
  - Primary Engine: Microsoft Presidio (AnalyzerEngine + AnonymizerEngine)
  - Secondary Engine: Pure Python Regex Scanner with zero external model dependencies.
  If Presidio fails (e.g., missing spaCy 'en_core_web_sm' model on flaky Wi-Fi),
  the system immediately and transparently shifts to Regex scanning for:
    1. Email Addresses
    2. Phone Numbers (including Indian +91 formats)
    3. Credit Card Numbers
    4. Indian Permanent Account Numbers (PAN: [A-Z]{5}[0-9]{4}[A-Z]{1})
"""

import re
from typing import Dict, Any, List

# Regex definitions for deterministic fallback
REGEX_PATTERNS = {
    "PAN_NUMBER": re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b"),
    "EMAIL_ADDRESS": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b"),
    "PHONE_NUMBER": re.compile(r"(?:\+91[\-\s]?)?[6789]\d{9}\b|\b\d{3}[\-\s]?\d{3}[\-\s]?\d{4}\b"),
    "CREDIT_CARD": re.compile(r"\b(?:\d{4}[\-\s]?){3}\d{4}\b")
}

# Attempt Presidio Initialization
_PRESIDIO_AVAILABLE = False
_analyzer = None
_anonymizer = None

try:
    from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
    from presidio_anonymizer import AnonymizerEngine

    _analyzer = AnalyzerEngine()
    _anonymizer = AnonymizerEngine()

    # Register Indian PAN recognizer inside Presidio
    pan_pattern = Pattern(name="pan_pattern", regex=r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b", score=0.95)
    pan_recognizer = PatternRecognizer(supported_entity="INDIA_PAN", patterns=[pan_pattern])
    _analyzer.registry.add_recognizer(pan_recognizer)

    _PRESIDIO_AVAILABLE = True
    print("[PII_GUARD] Microsoft Presidio NLP engine initialized successfully.")
except Exception as exc:
    print(f"[PII_GUARD WARNING] Presidio initialization failed ({exc}).")
    print("[PII_GUARD FAILSAFE] Seamlessly activated Zero-Dependency Regex PII Guard.")
    _PRESIDIO_AVAILABLE = False


def _regex_redact(text: str) -> Dict[str, Any]:
    """Pure-Python Regex fallback sanitizer for resilient offline hackathon operation."""
    redacted = text
    detected_entities: List[str] = []

    for entity_type, pattern in REGEX_PATTERNS.items():
        matches = list(pattern.finditer(redacted))
        if matches:
            if entity_type not in detected_entities:
                detected_entities.append(entity_type)
            redacted = pattern.sub(f"<{entity_type}_REDACTED>", redacted)

    return {
        "has_pii": len(detected_entities) > 0,
        "redacted_text": redacted,
        "entities": detected_entities
    }


def redact_pii(text: str) -> Dict[str, Any]:
    """
    Main entry point for scanning and redacting sensitive PII from agent outputs.

    Args:
        text (str): Raw string output emitted by MCP tools.

    Returns:
        Dict[str, Any]: {
            "has_pii": bool,
            "redacted_text": str,
            "entities": List[str]
        }
    """
    if not text or not isinstance(text, str):
        return {"has_pii": False, "redacted_text": "", "entities": []}

    # If Presidio is available and initialized, attempt NLP analysis
    if _PRESIDIO_AVAILABLE and _analyzer and _anonymizer:
        try:
            results = _analyzer.analyze(
                text=text,
                language="en",
                entities=["EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD", "PERSON", "INDIA_PAN"]
            )

            if results:
                anonymized_result = _anonymizer.anonymize(text=text, analyzer_results=results)
                detected = list({r.entity_type for r in results})
                return {
                    "has_pii": True,
                    "redacted_text": anonymized_result.text,
                    "entities": detected
                }
            else:
                # Secondary safety net: run regex check in case Presidio model missed custom PAN
                return _regex_redact(text)
        except Exception as err:
            print(f"[PII_GUARD ERROR] Presidio execution failed during analyze ({err}). Falling back to Regex.")
            return _regex_redact(text)

    # Fallback to pure regex
    return _regex_redact(text)


if __name__ == "__main__":
    sample_text = (
        "Client Record: Rajesh Kumar, Email: rajesh.k@example.com, "
        "Phone: +91 9876543210, PAN: ABCDE1234F, Card: 4111-2222-3333-4444."
    )
    result = redact_pii(sample_text)
    print("Has PII:", result["has_pii"])
    print("Entities Detected:", result["entities"])
    print("Sanitized Output:\n", result["redacted_text"])
