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
        subtitle: currentUser.jobTitle || (currentRole === 'SERMAC_CENTRAL' ? 'Coordenação SERMAC' : currentUnit.name)
      };
    }
    switch (currentRole) {
      case 'SERMAC_CENTRAL':
        return { initial: 'GC', title: 'Coordenação Central', subtitle: 'SERMAC - SMS' };
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
      <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
              +
            </div>
            <h1 className="text-white font-bold text-xl tracking-tight">
              NEPS <span className="text-blue-400">Saúde</span>
            </h1>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1.5 font-semibold">
            Educação Permanente • SERMAC
          </p>
        </div>
        {mobileMenuOpen && (
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="text-slate-400 hover:text-white p-1 lg:hidden"
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
          <span>Gestão Central SERMAC</span>
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
          <span>Núcleo NEPS Unidade</span>
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
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
              {roleInfo.initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{roleInfo.title}</p>
              <p className="text-[10px] text-slate-400 truncate">{roleInfo.subtitle}</p>
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
    <header className="w-full h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 shadow-xs z-30">
      
      {/* Left Side: Mobile Menu Button + Screen Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button 
          id="btn-mobile-menu-toggle"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
              {currentRole === 'SERMAC_CENTRAL' && 'Visão Geral das Unidades'}
              {currentRole === 'NEPS_UNIT' && `Núcleo NEPS • ${currentUnit.name}`}
              {currentRole === 'PARTICIPANT' && 'Portal do Profissional de Saúde'}
            </h2>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider hidden sm:inline-block">
              Tempo Real
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium hidden md:block">
            {currentRole === 'SERMAC_CENTRAL' && 'Secretaria Municipal de Saúde • Gestão Integrada de Capacitação'}
            {currentRole === 'NEPS_UNIT' && `${currentUnit.type} - Distrito ${currentUnit.district} • Coordenador(a): ${currentUnit.coordinatorName}`}
            {currentRole === 'PARTICIPANT' && 'Registro rápido de presença, avaliação de reação e emissão de certificados'}
          </p>
        </div>
      </div>

      {/* Right Side: Filters, Unit Selector, Quick Role Switch & Logout */}
      <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
        
        {/* Unit Selector when on NEPS mode */}
        {currentRole === 'NEPS_UNIT' && (
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <select
              id="header-unit-selector"
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.type})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Period Indicator */}
        <div className="hidden xl:block bg-slate-100 px-3 py-1.5 rounded border border-slate-200 text-slate-600 font-medium">
          Período: Outubro 2023
        </div>

        {/* Role-Specific Action Button */}
        {currentRole === 'SERMAC_CENTRAL' && (
          <button
            id="btn-header-ai-diag"
            onClick={onOpenAiDiagnosis}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Diagnóstico IA</span>
          </button>
        )}

        {currentRole === 'NEPS_UNIT' && (
          <button
            id="btn-header-new-training"
            onClick={onOpenNewAction}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Treinamento</span>
          </button>
        )}

        {/* Role Quick Toggle - Visible on ALL screen sizes */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600">
          <button 
            id="top-nav-role-sermac"
            onClick={() => setCurrentRole('SERMAC_CENTRAL')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all ${
              currentRole === 'SERMAC_CENTRAL' 
                ? 'bg-blue-600 text-white shadow-xs font-bold' 
                : 'hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Gestão Central SERMAC"
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Gestão Central</span>
            <span className="inline sm:hidden">SERMAC</span>
          </button>

          <button 
            id="top-nav-role-neps"
            onClick={() => setCurrentRole('NEPS_UNIT')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all ${
              currentRole === 'NEPS_UNIT' 
                ? 'bg-blue-600 text-white shadow-xs font-bold' 
                : 'hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Núcleo NEPS da Unidade"
          >
            <Building className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">NEPS Unidade</span>
            <span className="inline sm:hidden">NEPS</span>
          </button>

          <button 
            id="top-nav-role-participant"
            onClick={() => setCurrentRole('PARTICIPANT')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all ${
              currentRole === 'PARTICIPANT' 
                ? 'bg-blue-600 text-white shadow-xs font-bold' 
                : 'hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Portal do Participante (Auto-Check-in)"
          >
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Participante</span>
            <span className="inline sm:hidden">Aluno</span>
          </button>
        </div>

        {/* User Account / Logout Action */}
        <button
          id="header-btn-switch-user"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          title="Trocar Perfil de Usuário ou Sair"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden lg:inline">Sair</span>
        </button>

      </div>
    </header>
  );
};
