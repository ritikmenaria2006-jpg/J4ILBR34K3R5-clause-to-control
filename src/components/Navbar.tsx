import React, { useState, useRef, useEffect } from 'react';
import { AppMode, OrganizationProfile, ProductActivation, UserSession } from '../types';
import {
  ShieldCheck,
  Lock,
  Terminal,
  FileText,
  Cpu,
  BookOpen,
  Scale,
  Layers,
  Eye,
  SlidersHorizontal,
  Key,
  Building,
  CheckCircle2,
  FolderCheck,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';

export type AppTab =
  | 'console'
  | 'org_policies'
  | 'evidence'
  | 'grc'
  | 'playbook'
  | 'matrix'
  | 'regulations'
  | 'codebase';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  appMode: AppMode;
  onToggleAppMode: (mode: AppMode) => void;
  activation: ProductActivation;
  onOpenActivationModal: () => void;
  profile: OrganizationProfile;
  onOpenProfileModal: () => void;
  session: UserSession | null;
  isWorkflowUnlocked: boolean;
  onLockedTabClick: (tabName: string) => void;
  onLogout: () => void;
}

interface NavItemConfig {
  id: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  demoOnly?: boolean;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'console', label: 'AI Chat', icon: Terminal },
  { id: 'org_policies', label: 'Org Policies', icon: Layers },
  { id: 'evidence', label: 'Evidence & Audit', icon: FolderCheck },
  { id: 'grc', label: 'GRC Matrix', icon: Scale, demoOnly: true },
  { id: 'playbook', label: 'Scenarios', icon: Cpu, demoOnly: true },
  { id: 'matrix', label: 'Policy Matrix', icon: Lock, demoOnly: true },
  { id: 'regulations', label: 'Regulations', icon: BookOpen, demoOnly: true },
  { id: 'codebase', label: 'Codebase', icon: FileText, demoOnly: true },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  appMode,
  onToggleAppMode,
  activation,
  onOpenActivationModal,
  profile,
  onOpenProfileModal,
  session,
  isWorkflowUnlocked,
  onLockedTabClick,
  onLogout
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showProfileMenu]);

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Row 1: Brand & Top Utilities */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-slate-100">
          {/* Brand Logo & Enclave Tag */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 shadow-xs shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                  Clause-to-Control
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Runtime AI Governance
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                DPDP 2023 • SEBI CSCRF • RBI PSO • NIST RMF • PCI DSS
              </p>
            </div>
          </div>

          {/* Top Right Utilities: User Enclave / Profile Menu, Scope, Mode Toggle */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* User Profile Menu / Session Trigger */}
            {session && session.authenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all font-semibold text-xs shadow-xs cursor-pointer border border-slate-800"
                  aria-label="User profile menu"
                  aria-expanded={showProfileMenu}
                >
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-200">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold">
                    {session.role === 'Admin' ? 'Administrator' : session.role}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                      showProfileMenu ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
                    {/* Identity Header */}
                    <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-black text-slate-900 text-sm truncate">
                          {session.role === 'Admin' ? 'Administrator' : session.role}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 truncate">
                          {session.userId}
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Status */}
                    <div className="py-3 space-y-2.5 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Organization
                        </span>
                        <span className="font-bold text-slate-800 truncate block">
                          {profile.organizationName || 'ApexNova Technologies'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Role
                        </span>
                        <span className="font-semibold text-slate-800">
                          {session.role === 'Admin' ? 'Administrator' : session.role}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Authentication
                        </span>
                        <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* Sign Out Action */}
                    <div className="pt-2.5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <span className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 font-medium text-xs font-mono">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Unauthenticated</span>
              </span>
            )}

            {/* Scope Trigger */}
            {session && session.authenticated && (
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                title="View Organization Profile & Statutory Applicability"
              >
                <Building className="w-3.5 h-3.5 text-indigo-600" />
                <span>{profile.industry}</span>
              </button>
            )}

            {/* License Pill */}
            <button
              type="button"
              onClick={onOpenActivationModal}
              className={`hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer ${
                activation.isActivated
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
              }`}
              title="Product Key & License Management"
            >
              <Key className="w-3 h-3" />
              <span>{activation.isActivated ? 'LICENSED' : 'UNLICENSED'}</span>
            </button>

            {/* Demo / Live Switch */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => onToggleAppMode('DEMO')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  appMode === 'DEMO'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Demo Mode: Full technical telemetry, code viewer, policy matrices, and debug traces."
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>DEMO</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleAppMode('LIVE')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  appMode === 'LIVE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Live Mode: Production enterprise user view."
              >
                <Eye className="w-3 h-3" />
                <span>LIVE</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Responsive Tab Navigation */}
        <div className="flex items-center justify-between py-2 overflow-x-auto no-scrollbar">
          <nav className="flex items-center space-x-1.5 min-w-max">
            {NAV_ITEMS.map((item) => {
              if (item.demoOnly && appMode !== 'DEMO') {
                return null;
              }

              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isLocked = !isWorkflowUnlocked;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (isLocked) {
                      onLockedTabClick(item.label);
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : isLocked
                      ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={isLocked ? `Locked: Complete setup to access ${item.label}` : item.label}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
