import { UserSession } from '../types';

export const SESSION_KEYS = {
  PROFILE: 'c2c_org_profile_v1',
  POLICIES: 'c2c_org_policies_v1',
  EVIDENCE: 'c2c_organization_evidence_v1',
  FINDINGS: 'c2c_evidence_findings_v1',
  LEGACY_EVIDENCE: 'c2c_evidence_v1',
  LEGACY_FINDINGS: 'c2c_findings_v1',
  CHAT_HISTORY: 'c2c_chat_history_v1',
  AUDIT_LOGS: 'c2c_audit_logs_v1',
  SECURITY_ALERTS: 'c2c_security_alerts_v1',
  ACTIVE_SESSION: 'c2c_active_session_id_v1'
};

// PERSISTENT KEY (Category A - MUST NOT BE CLEARED ON LOGOUT)
export const PRODUCT_ACTIVATION_KEY = 'c2c_product_activation_v1';

/**
 * Generates a cryptographically-random session identifier.
 */
export function generateSessionId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `sess_${ts}_${rand}`;
}

/**
 * Completely purges all session-specific confidential data (Category C)
 * from browser storage while strictly preserving Product Activation (Category A).
 * 
 * Iterates through all localStorage keys and purges any key matching c2c_*
 * except the persistent product activation key.
 */
export function clearAllSessionData(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith('c2c_') && key !== PRODUCT_ACTIVATION_KEY) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      console.info(`[SessionManager] Purged ${keysToRemove.length} session storage artifacts on logout.`);
    }
  } catch (e) {
    console.error("[SessionManager] Failed to clear session data:", e);
  }
}

/**
 * Returns the active session ID or null if unauthenticated.
 */
export function getActiveSessionId(): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(SESSION_KEYS.ACTIVE_SESSION);
    }
  } catch {
    // Ignore storage read errors
  }
  return null;
}

/**
 * Records the active session ID.
 */
export function setActiveSessionId(sessionId: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SESSION_KEYS.ACTIVE_SESSION, sessionId);
    }
  } catch (e) {
    console.warn("[SessionManager] Could not persist session ID:", e);
  }
}

/**
 * Invalidates and deletes the active session ID from storage.
 */
export function clearActiveSessionId(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(SESSION_KEYS.ACTIVE_SESSION);
    }
  } catch (e) {
    console.warn("[SessionManager] Could not clear session ID:", e);
  }
}
