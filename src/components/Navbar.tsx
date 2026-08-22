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

      {/* Role Context Header */}
      <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Ambiente Autenticado
        </span>
        <div className="flex items-center gap-2">
          {currentRole === 'SERMAC_CENTRAL' && (
            <>
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-xs font-bold text-white">Gestão Central - SERMAC</span>
            </>
          )}
          {currentRole === 'NEPS_UNIT' && (
            <>
              <Building className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">Núcleo NEPS</span>
                <span className="text-[11px] text-emerald-300 block truncate">{currentUnit.name}</span>
              </div>
            </>
          )}
          {currentRole === 'PARTICIPANT' && (
            <>
              <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-xs font-bold text-white">Portal do Participante</span>
            </>
          )}
        </div>
      </div>

      {/* Role-Specific Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        
        {currentRole === 'SERMAC_CENTRAL' && (
          <>
            <div className="text-[10px] font-bold text-slate-400 uppercase px-3 pb-1 pt-2 tracking-wider">
              Painel Estratégico da Rede
            </div>

            <div className="px-3 py-2 bg-blue-600/15 border border-blue-500/30 rounded-lg text-xs font-semibold text-blue-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Visão Global dos 8 Distritos</span>
            </div>

            <div className="text-[10px] font-bold text-slate-400 uppercase px-3 pt-5 pb-1 tracking-wider">
              Ferramentas Centrais
            </div>
            
            <button
              id="sidebar-btn-ai-diag"
              onClick={() => { onOpenAiDiagnosis(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 rounded-lg text-xs text-purple-300 transition-colors text-left font-medium"
            >
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Diagnóstico IA Gemini</span>
            </button>

            {onOpenPaepsPlan && (
              <button
                id="sidebar-btn-lnt"
                onClick={() => { onOpenPaepsPlan(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 rounded-lg text-xs text-teal-300 transition-colors text-left font-medium"
              >
                <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Levantamento de Necessidades (LNT)</span>
              </button>
            )}
          </>
        )}

        {currentRole === 'NEPS_UNIT' && (
          <>
            <div className="text-[10px] font-bold text-slate-400 uppercase px-3 pb-1 pt-2 tracking-wider">
              Gestão da Unidade
            </div>

            <div className="px-3 py-2 bg-emerald-600/15 border border-emerald-500/30 rounded-lg text-xs font-semibold text-emerald-200 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Painel Local • {currentUnit.code}</span>
            </div>

            <div className="text-[10px] font-bold text-slate-400 uppercase px-3 pt-5 pb-1 tracking-wider">
              Ações do Núcleo
            </div>
            
            <button
              id="sidebar-btn-new-action"
              onClick={() => { onOpenNewAction(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600/30 rounded-lg text-xs transition-colors text-left font-semibold"
            >
              <Plus className="w-4 h-4 text-blue-300 shrink-0" />
              <span>Novo Treinamento</span>
            </button>
          </>
        )}

        {currentRole === 'PARTICIPANT' && (
          <>
            <div className="text-[10px] font-bold text-slate-400 uppercase px-3 pb-1 pt-2 tracking-wider">
              Área do Profissional
            </div>

            <div className="px-3 py-2 bg-purple-600/15 border border-purple-500/30 rounded-lg text-xs font-semibold text-purple-200 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-400" />
              <span>Auto-Check-in & Certificados</span>
            </div>
          </>
        )}

        {/* SUS Guidelines Micro note */}
        <div className="pt-6 px-3">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-400">
            <p className="font-semibold text-slate-300 mb-0.5">PNEPS / SUS</p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Educação Permanente baseada na problematização do processo de trabalho.
            </p>
          </div>
        </div>
      </nav>

      {/* User / Profile Footer & Logout Button */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                {roleInfo.initial}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{roleInfo.title}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || roleInfo.subtitle}</p>
            </div>
          </div>

          <button
            id="sidebar-btn-logout"
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
            title="Sair da Conta / Trocar de Perfil"
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
  selectedUnitId: string;
  setSelectedUnitId?: (unitId: string) => void;
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
  selectedUnitId,
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
              {currentRole === 'NEPS_UNIT' && `Núcleo NEPS • ${currentUnit.name}`}
              {currentRole === 'PARTICIPANT' && 'Portal do Profissional de Saúde'}
            </h2>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase tracking-wider inline-flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Sessão Autenticada
            </span>
          </div>
          <p className="text-xs text-slate-500 font-normal mt-0.5 truncate hidden sm:block">
            {currentRole === 'SERMAC_CENTRAL' && 'Secretaria Municipal de Saúde • Painel Integrado de Educação Permanente em Saúde'}
            {currentRole === 'NEPS_UNIT' && `${currentUnit.type} - Distrito ${currentUnit.district} • Coordenador(a): ${currentUser?.name || currentUnit.coordinatorName}`}
            {currentRole === 'PARTICIPANT' && 'Registro de presença (PIN), avaliação de reação e emissão de declarações/certificados'}
          </p>
        </div>
      </div>

      {/* Right Side: Role Actions & User Profile Badge with Logout */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0 ml-auto">
        
        {/* Action Button: AI Diagnostic for SERMAC */}
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

        {/* Action Button: New Training for NEPS Unit */}
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

        {/* User Identity Chip */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {currentUser?.avatarInitials || (currentRole === 'SERMAC_CENTRAL' ? 'GC' : currentRole === 'NEPS_UNIT' ? 'UN' : 'PS')}
          </div>
          <div className="hidden md:block text-left min-w-0 max-w-[160px]">
            <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
              {currentUser?.name || (currentRole === 'SERMAC_CENTRAL' ? 'Gestor Central' : currentUnit.name)}
            </p>
            <p className="text-[10px] text-slate-500 truncate leading-tight">
              {currentUser?.email || (currentRole === 'SERMAC_CENTRAL' ? 'SERMAC' : currentUnit.type)}
            </p>
          </div>
        </div>

        {/* User Account / Logout Action */}
        <button
          id="header-btn-switch-user"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors shrink-0"
          title="Sair da sessão e trocar de conta"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">Sair / Trocar</span>
        </button>

      </div>
    </header>
  );
};
