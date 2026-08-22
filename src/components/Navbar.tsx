import React, { useState } from 'react';
import { 
  UserRole, 
  HealthUnit,
  AuthUser 
} from '../types';
import { 
  Building2, 
  Building, 
  UserCheck, 
  Sparkles, 
  FileText, 
  Menu, 
  X, 
  Plus,
  LogOut,
  User,
  Shield
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  units: HealthUnit[];
  selectedUnitId: string;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onOpenAiDiagnosis: () => void;
  onOpenNewAction: () => void;
  onOpenPaepsPlan?: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  setCurrentRole,
  units,
  selectedUnitId,
  currentUser,
  onLogout,
  onOpenAiDiagnosis,
  onOpenNewAction,
  onOpenPaepsPlan,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const currentUnit = units.find(u => u.id === selectedUnitId) || units[0];

  const getRoleBadge = () => {
    if (currentUser) {
      return {
        initial: currentUser.avatarInitials || (currentRole === 'SERMAC_CENTRAL' ? 'GC' : currentRole === 'NEPS_UNIT' ? 'UN' : 'PS'),
        title: currentUser.name,
        subtitle: currentUser.jobTitle || (currentRole === 'SERMAC_CENTRAL' ? 'Gestão Central - SERMAC' : currentUnit.name)
      };
    }
    switch (currentRole) {
      case 'SERMAC_CENTRAL':
        return { initial: 'GC', title: 'Gestão Central - SERMAC', subtitle: 'SMS Recife' };
      case 'NEPS_UNIT':
        return { initial: 'UN', title: currentUnit.coordinatorName || 'Coord. NEPS', subtitle: currentUnit.name };
      case 'PARTICIPANT':
        return { initial: 'PS', title: 'Profissional de Saúde', subtitle: 'Matrícula Ativa' };
    }
  };

  const roleInfo = getRoleBadge();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-300 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-sm shrink-0">
            +
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white font-bold text-lg tracking-tight">
                NEPS <span className="text-blue-400">SERMAC</span>
              </h1>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
              Educação Permanente • Recife
            </p>
          </div>
        </div>
        {mobileMenuOpen && (
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-500 uppercase px-3 pb-2 pt-1 tracking-wider">
          Módulos do Sistema
        </div>

        {/* SERMAC Role Button */}
        <button
          id="sidebar-role-sermac"
          onClick={() => { setCurrentRole('SERMAC_CENTRAL'); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
            currentRole === 'SERMAC_CENTRAL'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <span>Gestão Central - SERMAC</span>
        </button>

        {/* NEPS Unit Role Button */}
        <button
          id="sidebar-role-neps"
          onClick={() => { setCurrentRole('NEPS_UNIT'); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
            currentRole === 'NEPS_UNIT'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Building className="w-4 h-4 shrink-0" />
          <span>Núcleo NEPS - Unidade</span>
        </button>

        {/* Participant Role Button */}
        <button
          id="sidebar-role-participant"
          onClick={() => { setCurrentRole('PARTICIPANT'); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
            currentRole === 'PARTICIPANT'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4 shrink-0" />
          <span>Portal do Participante</span>
        </button>

        {/* Context Sub-navigation */}
        {currentRole === 'SERMAC_CENTRAL' && (
          <>
            <div className="text-[10px] font-bold text-slate-500 uppercase px-3 pt-6 pb-2 tracking-wider">
              Ferramentas Estratégicas
            </div>
            
            <button
              id="sidebar-btn-ai-diag"
              onClick={() => { onOpenAiDiagnosis(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md text-xs text-purple-300 transition-colors text-left font-medium"
            >
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Diagnóstico IA Gemini</span>
            </button>

            {onOpenPaepsPlan && (
              <button
                id="sidebar-btn-lnt"
                onClick={() => { onOpenPaepsPlan(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md text-xs text-teal-300 transition-colors text-left font-medium"
              >
                <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Levantamento de Necessidades (LNT)</span>
              </button>
            )}
          </>
        )}

        {currentRole === 'NEPS_UNIT' && (
          <>
            <div className="text-[10px] font-bold text-slate-500 uppercase px-3 pt-6 pb-2 tracking-wider">
              Ações da Unidade
            </div>
            
            <button
              id="sidebar-btn-new-action"
              onClick={() => { onOpenNewAction(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 rounded-md text-xs transition-colors text-left font-semibold"
            >
              <Plus className="w-4 h-4 text-blue-300 shrink-0" />
              <span>Novo Treinamento</span>
            </button>
          </>
        )}

        {/* SUS Guidelines Micro note */}
        <div className="pt-6 px-3">
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-400">
            <p className="font-semibold text-slate-300 mb-0.5">PNEPS / SUS</p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Educação Permanente baseada na problematização do processo de trabalho.
            </p>
          </div>
        </div>
      </nav>

      {/* User / Profile Footer & Logout Button */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/80">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                {roleInfo.initial}
              </div>
              {currentUser?.authProvider === 'google' && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-xs border border-slate-200" title="Autenticado via Google / Gmail">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-white truncate">{roleInfo.title}</p>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || roleInfo.subtitle}</p>
            </div>
          </div>

          <button
            id="sidebar-btn-logout"
            onClick={onLogout}
            title="Trocar Perfil / Sair"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP PERMANENT SIDEBAR */}
      <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-slate-800 min-h-screen">
        {sidebarContent}
      </aside>

      {/* MOBILE DRAWER / OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

interface HeaderProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedUnitId: string;
  setSelectedUnitId: (unitId: string) => void;
  units: HealthUnit[];
  currentUser: AuthUser | null;
  onLogout: () => void;
  onOpenAiDiagnosis: () => void;
  onOpenNewAction: () => void;
  onOpenPaepsPlan?: () => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setCurrentRole,
  selectedUnitId,
  setSelectedUnitId,
  units,
  currentUser,
  onLogout,
  onOpenAiDiagnosis,
  onOpenNewAction,
  onOpenMobileMenu
}) => {
  const currentUnit = units.find(u => u.id === selectedUnitId) || units[0];

  return (
    <header className="w-full min-h-[4.25rem] bg-white border-b border-slate-200 flex flex-wrap lg:flex-nowrap items-center justify-between px-4 sm:px-6 lg:px-8 py-2.5 shrink-0 shadow-xs z-30 gap-3">
      
      {/* Left Side: Mobile Menu Button + Screen Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <button 
          id="btn-mobile-menu-toggle"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 shrink-0"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 py-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              {currentRole === 'SERMAC_CENTRAL' && 'Gestão Central - SERMAC • Visão Geral da Rede'}
              {currentRole === 'NEPS_UNIT' && `Núcleo NEPS - Unidade • ${currentUnit.name}`}
              {currentRole === 'PARTICIPANT' && 'Portal do Profissional de Saúde'}
            </h2>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase tracking-wider inline-flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Tempo Real
            </span>
          </div>
          <p className="text-xs text-slate-500 font-normal mt-0.5 truncate hidden sm:block">
            {currentRole === 'SERMAC_CENTRAL' && 'Secretaria Municipal de Saúde • Gestão Integrada de Educação Permanente'}
            {currentRole === 'NEPS_UNIT' && `${currentUnit.type} - Distrito ${currentUnit.district} • Coordenador(a): ${currentUnit.coordinatorName}`}
            {currentRole === 'PARTICIPANT' && 'Registro rápido de presença, avaliação de reação e emissão de certificados'}
          </p>
        </div>
      </div>

      {/* Right Side: Filters, Unit Selector, Quick Role Switch & Logout */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0 ml-auto">
        
        {/* Unit Selector when on NEPS mode */}
        {currentRole === 'NEPS_UNIT' && (
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <select
              id="header-unit-selector"
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer max-w-[150px] sm:max-w-[220px] truncate"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.type})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Role-Specific Action Button */}
        {currentRole === 'SERMAC_CENTRAL' && (
          <button
            id="btn-header-ai-diag"
            onClick={onOpenAiDiagnosis}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Diagnóstico IA</span>
          </button>
        )}

        {currentRole === 'NEPS_UNIT' && (
          <button
            id="btn-header-new-training"
            onClick={onOpenNewAction}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo Treinamento</span>
          </button>
        )}

        {/* Role Quick Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 shrink-0">
          <button 
            id="top-nav-role-sermac"
            onClick={() => setCurrentRole('SERMAC_CENTRAL')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              currentRole === 'SERMAC_CENTRAL' 
                ? 'bg-blue-600 text-white shadow-xs font-bold' 
                : 'hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Gestão Central - SERMAC"
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Gestão Central</span>
            <span className="inline md:hidden">Central</span>
          </button>

          <button 
            id="top-nav-role-neps"
            onClick={() => setCurrentRole('NEPS_UNIT')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              currentRole === 'NEPS_UNIT' 
                ? 'bg-blue-600 text-white shadow-xs font-bold' 
                : 'hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Núcleo NEPS - Unidade"
          >
            <Building className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Núcleo NEPS</span>
            <span className="inline md:hidden">NEPS</span>
          </button>

          <button 
            id="top-nav-role-participant"
            onClick={() => setCurrentRole('PARTICIPANT')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              currentRole === 'PARTICIPANT' 
                ? 'bg-blue-600 text-white shadow-xs font-bold' 
                : 'hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Portal do Participante"
          >
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Participante</span>
            <span className="inline md:hidden">Aluno</span>
          </button>
        </div>

        {/* User Account / Logout Action */}
        <button
          id="header-btn-switch-user"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shrink-0"
          title="Sair ou trocar conta"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Sair</span>
        </button>

      </div>
    </header>
  );
};
