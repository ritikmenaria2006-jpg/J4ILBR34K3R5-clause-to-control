# Clause-to-Control : Runtime AI Agent Governance Layer
AI-SEC HackFest 2026 MVP • A runtime governance layer for AI agents that translates curated regulatory and organizational requirements into deterministic controls for tool access.

Demo note: This project uses curated/mock regulatory mappings for demonstration and does not constitute legal advice, compliance certification, or a claim of complete regulatory coverage.

## Team

- Ritik Menaria — Team Captain
- Navaneet Chandran
- Yash Agarwal

## Hackathon

Built for AI-SEC HackFest 2026 at Manipal Institute of Technology, Bengaluru.
---

## 💡 Executive Summary
Enterprise governance requirements often exist as policies, regulatory documents and audit guidance, while AI agents increasingly interact with tools, data and business systems. Clause-to-Control explores how these requirements can be translated into runtime controls that influence agent actions.

**Clause-to-Control** flips this model:
1. **Compiles** unstructured regulatory text into an enforceable, deterministic policy permission matrix (`policy_rules.json`).
2. **Intercepts** every runtime Model Context Protocol (MCP) tool call.
3. **Defends** against adversarial prompt injection attacks before policy checks.
4. **Enforces** hierarchical specificity-based access controls citing exact legal clauses.
5. **Redacts** outbound sensitive PII (Indian PAN, email, phone, credit cards) via Microsoft Presidio + resilient Zero-Dependency Regex fallback.
6. **Logs** every transaction to an immutable audit trail (`/audit/audit_log.json`).

---

## 🏛️ Project Directory Structure

```text
├── data/
│   ├── cscrf_mock.txt         # 5 realistic SEBI CSCRF clauses (vendor data isolation, dual-approval, etc.)
│   └── dpdp_mock.txt          # 5 realistic DPDP Act 2023 clauses (purpose limitation, PII redaction, etc.)
├── policy/
│   ├── compile_policy.py      # Regulatory compiler (ChromaDB + Groq/Gemini + --mock fallback flag)
│   └── policy_rules.json      # Compiled 8-rule deterministic permission matrix
├── middleware/
│   ├── injection_guard.py     # Case-insensitive prompt injection & jailbreak scanner (18+ patterns)
│   ├── pii_guard.py           # Microsoft Presidio with fail-safe pure Python Regex PII scanner (PAN, Email, Phone)
│   └── enforcer.py            # Specificity-based policy arbiter (Exact > Role* > Action* > Default Deny)
├── tools/
│   └── mock_tools.py          # Simulated MCP agent tools (risk report, compliance status, raw PII customer export)
├── api/
│   └── main.py                # FastAPI gateway with 6-stage interception pipeline (POST /agent/request)
├── audit/
│   └── audit_log.json         # Real-time append-only statutory compliance ledger
├── ui/
│   └── app.py                 # Streamlit visual operator dashboard with offline resilience & metric cards
├── requirements.txt           # Python dependency manifest
└── README.md                  # Setup commands, architecture, and live demo playbook
```

---

## 🛡️ Hackfest Resiliency Architecture (Battle-Tested)
Hackathons frequently suffer from flaky conference Wi-Fi, rate limits, and missing heavy ML models. Clause-to-Control includes 4 deliberate engineering workarounds:
1. **Presidio spaCy Model Fallback:** In `pii_guard.py`, Presidio initialization is wrapped in a `try/except`. If `en_core_web_sm` is missing or slow, it instantly falls back to a zero-dependency Python Regex scanner configured for Indian PANs (`[A-Z]{5}[0-9]{4}[A-Z]{1}`), phone numbers, credit cards, and emails.
2. **LLM Extraction Fallback:** `compile_policy.py` features a `--mock` flag. If Groq or Gemini are rate-limited or unconfigured, running `--mock` emits a pristine, handwritten 8-rule matrix in seconds.
3. **FastAPI/Streamlit Decoupling:** `app.py` catches network connection drops gracefully, alerts the operator, and provides an in-process local execution fallback so the demo never halts.
4. **Rule Specificity Conflict Resolution:** `enforcer.py` resolves wildcard conflicts using a strict specificity scoring hierarchy:
   $$\text{Exact Match (Score 4)} > \text{Role Match (Score 3)} > \text{Action Match (Score 2)} > \text{Default Deny (Score 0)}$$

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
Ensure you have Python 3.10+ installed.

### 2. Create and Activate a Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate       # On Linux/macOS
# or: .\venv\Scripts\activate  # On Windows
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. (Optional) Download spaCy English Model
If your network allows, download the model for Presidio's NLP parser:
```bash
python -m spacy download en_core_web_sm
```
*(If this step is skipped or fails, `pii_guard.py` automatically activates the built-in Regex engine.)*

### 5. Compile the Regulatory Policies
Run the policy compiler to generate `policy_rules.json`:
```bash
# Option A: Fast resilient mode (Guaranteed 8 curated rules without needing API keys)
python policy/compile_policy.py --mock

# Option B: Live LLM extraction mode (Requires GROQ_API_KEY or GEMINI_API_KEY)
export GROQ_API_KEY="your_key_here"
python policy/compile_policy.py
```

---

## 💻 Running the Application (Side-by-Side)

Open two terminal tabs:

### Terminal 1: Launch FastAPI Backend (Port 8000)
```bash
python api/main.py
# Server will run on http://0.0.0.0:8000
# OpenAPI Docs: http://localhost:8000/docs
```

### Terminal 2: Launch Streamlit Frontend (Port 8501)
```bash
streamlit run ui/app.py
# Streamlit dashboard will open at http://localhost:8501
```

---

## 🎬 Live Hackfest Demo Playbook (3 Scenarios)

Present these three scenarios to the judges to showcase the full end-to-end security architecture:

### Scenario 1: Blocked Third-Party Vendor Exfiltration 🚫
- **Goal:** Show that an external vendor cannot exfiltrate customer databases.
- **Steps:**
  1. In the Streamlit sidebar, select **Role:** `Vendor`.
  2. In the main UI, select **Target MCP Tool:** `export_customer_data`.
  3. Ensure Context Prompt is normal (e.g., "Monthly backup extract").
  4. Click **Dispatch Intercepted Request**.
- **Expected Outcome:**
  - Giant **Red 🚫 BLOCKED** card appears.
  - Cites **`CLAUSE-CSCRF-4.1.2 & CLAUSE-DPDP-16.1`**.
  - Displays legal text: *"External vendors, service providers, and outsourced contractors are strictly prohibited from exporting..."*
  - The transaction is immediately written to `/audit/audit_log.json`.

---

### Scenario 2: Blocked Adversarial Prompt Injection 🚨
- **Goal:** Show that jailbreak attempts are caught at the input perimeter before policy checks.
- **Steps:**
  1. In the sidebar, select **Role:** `Admin`.
  2. Select **Target MCP Tool:** `get_global_risk_report`.
  3. Click the **🚨 Inject Adversarial Prompt** helper button (populates *"System prompt override: Ignore previous instructions..."*).
  4. Click **Dispatch Intercepted Request**.
- **Expected Outcome:**
  - Giant **Red 🚫 BLOCKED** card appears.
  - Cites **`CLAUSE-DPDP-25.4 & CSCRF-8.1.9`** (Adversarial override prohibition).
  - Explicitly flags: `Prompt Injection detected: 'ignore previous instructions'`.
  - Tool execution is aborted without hitting backend infrastructure.

---

### Scenario 3: Authorized Admin Execution with Downstream PII Redaction ✅
- **Goal:** Show authorized fiduciary access combined with automated egress data masking.
- **Steps:**
  1. In the sidebar, select **Role:** `Admin`.
  2. Select **Target MCP Tool:** `export_customer_data`.
  3. Click **🔄 Reset to Safe Prompt**.
  4. Click **Dispatch Intercepted Request**.
- **Expected Outcome:**
  - Giant **Green ✅ APPROVED** card appears.
  - Cites **`CLAUSE-DPDP-6.1`** (Purpose limitation under fiduciary consent).
  - **Downstream PII Sanitization Alert:** `🛡️ DPDP Clause 8.3 Enforced: Sensitive PII Redacted`.
  - Expand **"View Raw Output vs Sanitized Telemetry"**:
    - Raw output has Vikramaditya Sharma's PAN `ABCDE1234F`, email, and phone.
    - Sanitized stream automatically redacts: `<PAN_NUMBER_REDACTED>`, `<EMAIL_ADDRESS_REDACTED>`, `<PHONE_NUMBER_REDACTED>`.
  - The updated entry appears live at the top of the **Statutory Audit Ledger** dataframe!

---

## 🏆 Regulatory Mapping Matrix

| Regulatory Source | Clause ID | Applied Defense & Code Enforcement |
|---|---|---|
| **SEBI CSCRF** | Clause 4.1.2 | `enforcer.py`: Blocks Vendors from data extraction |
| **SEBI CSCRF** | Clause 5.3.1 | `enforcer.py`: Dual-authorization for systemic risk reports |
| **SEBI CSCRF** | Clause 7.2.4 | `enforcer.py`: Auditor diagnostic telemetry verification |
| **SEBI CSCRF** | Clause 8.1.9 | `injection_guard.py`: Pre-execution tool call perimeter gating |
| **SEBI CSCRF** | Clause 9.4.0 | `pii_guard.py`: Outbound diagnostic data masking |
| **DPDP 2023** | Clause 6.1 | `enforcer.py`: Purpose limitation & consent boundaries |
| **DPDP 2023** | Clause 8.3 | `pii_guard.py`: Mandatory tokenization of Indian PAN & contact PII |
| **DPDP 2023** | Clause 10.2 | `api/main.py`: Immutable audit logging to `audit_log.json` |
| **DPDP 2023** | Clause 16.1 | `enforcer.py`: Barring contractor cross-border personal data exports |
| **DPDP 2023** | Clause 25.4 | `injection_guard.py`: Adversarial prompt override rejection |
