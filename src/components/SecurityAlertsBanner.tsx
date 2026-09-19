import React, { useState } from 'react';
import { SecurityAlertItem, AgentRole } from '../types';
import { ShieldAlert, AlertOctagon, X, ChevronDown, ChevronUp, BellRing } from 'lucide-react';

interface SecurityAlertsBannerProps {
  alerts: SecurityAlertItem[];
  userRole: AgentRole;
  onClearAlerts: () => void;
}

export const SecurityAlertsBanner: React.FC<SecurityAlertsBannerProps> = ({
  alerts,
  userRole,
  onClearAlerts
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show banner if there are active alerts
  if (!alerts || alerts.length === 0) return null;

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;

  return (
    <div className="bg-red-950 text-white rounded-xl shadow-lg border border-red-800 p-3.5 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-red-600/30 border border-red-500 flex items-center justify-center text-red-300">
            <BellRing className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-red-200">
                Statutory Security & Perimeter Alerts
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white">
                {alerts.length} New Event{alerts.length > 1 ? 's' : ''}
              </span>
              {criticalCount > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                  {criticalCount} Critical
                </span>
              )}
            </div>
            <p className="text-[11px] text-red-300 mt-0.5">
              Runtime defense intercepted adversarial or unauthorized activity. Admin audit logged.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-900/50 hover:bg-red-800 text-xs text-red-200 cursor-pointer"
          >
            <span>{isExpanded ? 'Hide Details' : 'View Alerts'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={onClearAlerts}
            title="Clear all alerts"
            className="p-1 rounded-lg text-red-400 hover:text-white hover:bg-red-900/60 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-red-900 space-y-2 max-h-56 overflow-y-auto pr-1">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-2.5 rounded-lg bg-red-900/40 border border-red-800/80 text-xs flex items-start justify-between gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="font-bold text-red-100">{alert.eventType.replace('_', ' ')}</span>
                  <span className="text-[10px] text-red-400 font-mono">Role: {alert.role}</span>
                </div>
                <p className="text-[11px] text-red-200">{alert.description}</p>
                {alert.flaggedPhrase && (
                  <div className="text-[10px] text-amber-300 font-mono">
                    Flagged Pattern: <code className="bg-red-950 px-1 py-0.5 rounded border border-red-900">{alert.flaggedPhrase}</code>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-red-400 font-mono shrink-0">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
