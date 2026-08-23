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
    <div className="flex flex-col h-full bg-[#0C326F] text-slate-100 select-none border-r border-[#08234D] shadow-xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1A4588] bg-[#0A295B] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#0C326F] font-black text-xl shadow-sm shrink-0 border border-slate-200">
            +
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white font-black text-lg tracking-tight">
                NEPS <span className="text-[#8AB4F8]">SERMAC</span>
              </h1>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-slate-200 font-semibold mt-0.5">
              Secretaria de Saúde • SUS Recife
            </p>
          </div>
        </div>
        {mobileMenuOpen && (
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-[#1A4588] lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Context Header */}
      <div className="px-5 py-3 bg-[#08234D] border-b border-[#1A4588]">
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
          Ambiente Institucional
        </span>
        <div className="flex items-center gap-2.5">
          {currentRole === 'SERMAC_CENTRAL' && (
            <>
              <div className="w-6 h-6 rounded bg-[#1351B4] flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-white">Gestão Central - SERMAC</span>
            </>
          )}
          {currentRole === 'NEPS_UNIT' && (
            <>
              <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center shrink-0">
                <Building className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">Núcleo NEPS</span>
                <span className="text-[11px] text-emerald-200 block truncate">{currentUnit.name}</span>
              </div>
            </>
          )}
          {currentRole === 'PARTICIPANT' && (
            <>
              <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-white">Portal do Participante</span>
            </>
          )}
        </div>
      </div>

      {/* Role-Specific Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        
        {currentRole === 'SERMAC_CENTRAL' && (
          <>
            <div className="text-[10px] font-bold text-slate-300 uppercase px-3 pb-1 pt-1 tracking-wider">
              Painel Estratégico da Rede
            </div>

            <div className="px-3.5 py-2.5 bg-[#1351B4] text-white rounded-lg text-xs font-bold flex items-center gap-2.5 shadow-sm border border-[#2670E8]">
              <Building2 className="w-4 h-4 text-white" />
              <span>Visão Global dos 8 Distritos</span>
            </div>

            <div className="text-[10px] font-bold text-slate-300 uppercase px-3 pt-4 pb-1 tracking-wider">
              Ferramentas Centrais
            </div>
            
            <button
              id="sidebar-btn-ai-diag"
              onClick={() => { onOpenAiDiagnosis(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1A4588] rounded-lg text-xs text-white transition-all text-left font-medium"
            >
              <Sparkles className="w-4 h-4 text-[#8AB4F8] shrink-0" />
              <span>Diagnóstico IA Gemini</span>
            </button>

            {onOpenPaepsPlan && (
              <button
                id="sidebar-btn-lnt"
                onClick={() => { onOpenPaepsPlan(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1A4588] rounded-lg text-xs text-white transition-all text-left font-medium"
              >
                <FileText className="w-4 h-4 text-[#8AB4F8] shrink-0" />
                <span>Levantamento de Necessidades (LNT)</span>
              </button>
            )}
          </>
        )}

        {currentRole === 'NEPS_UNIT' && (
          <>
            <div className="text-[10px] font-bold text-slate-300 uppercase px-3 pb-1 pt-1 tracking-wider">
              Gestão da Unidade
            </div>

            <div className="px-3.5 py-2.5 bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2.5 shadow-sm border border-emerald-500">
              <Building className="w-4 h-4 text-white" />
              <span>Painel Local • {currentUnit.code}</span>
            </div>

            <div className="text-[10px] font-bold text-slate-300 uppercase px-3 pt-4 pb-1 tracking-wider">
              Ações do Núcleo
            </div>
            
            <button
              id="sidebar-btn-new-action"
              onClick={() => { onOpenNewAction(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-[#1351B4] hover:bg-[#1A5CD6] text-white rounded-lg text-xs shadow-sm transition-all text-left font-bold border border-[#2670E8]"
            >
              <Plus className="w-4 h-4 text-white shrink-0" />
              <span>Novo Treinamento</span>
            </button>
          </>
        )}

        {currentRole === 'PARTICIPANT' && (
          <>
            <div className="text-[10px] font-bold text-slate-300 uppercase px-3 pb-1 pt-1 tracking-wider">
              Área do Profissional
            </div>

            <div className="px-3.5 py-2.5 bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-2.5 shadow-sm border border-purple-500">
              <UserCheck className="w-4 h-4 text-white" />
              <span>Auto-Check-in & Certificados</span>
            </div>
          </>
        )}

        {/* SUS Guidelines Institutional Banner */}
        <div className="pt-4 px-1">
          <div className="p-3.5 rounded-lg bg-[#08234D] border border-[#1A4588] text-[11px] text-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-[#8AB4F8] font-bold text-[10px] uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              PNEPS / SUS Recife
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              Educação Permanente baseada na problematização e qualificação do trabalho em saúde pública.
            </p>
          </div>
        </div>
      </nav>

      {/* User / Profile Footer & Logout Button */}
      <div className="p-4 border-t border-[#1A4588] bg-[#0A295B]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-lg bg-[#1351B4] flex items-center justify-center text-white font-bold text-xs border border-white/20">
                {roleInfo.initial}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{roleInfo.title}</p>
              <p className="text-[10px] text-slate-300 truncate">{currentUser?.email || roleInfo.subtitle}</p>
            </div>
          </div>
          <button
            id="sidebar-btn-logout"
            onClick={onLogout}
            className="p-2 rounded-lg text-slate-300 hover:text-rose-300 hover:bg-[#1A4588] transition-colors shrink-0"
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
    <header className="w-full min-h-[4.25rem] bg-white border-b border-slate-200 border-t-2 border-t-[#1351B4] flex flex-wrap lg:flex-nowrap items-center justify-between px-4 sm:px-6 lg:px-8 py-3 shrink-0 shadow-xs z-30 gap-3">
      
      {/* Left Side: Mobile Menu Button + Screen Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <button 
          id="btn-mobile-menu-toggle"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 shrink-0"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 py-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-[#0C326F] tracking-tight leading-tight">
              {currentRole === 'SERMAC_CENTRAL' && 'Gestão Central - SERMAC • Visão Geral da Rede'}
              {currentRole === 'NEPS_UNIT' && `Núcleo NEPS • ${currentUnit.name}`}
              {currentRole === 'PARTICIPANT' && 'Portal do Profissional de Saúde'}
            </h2>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold rounded uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Sessão Homologada
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-0.5 truncate hidden sm:block">
            {currentRole === 'SERMAC_CENTRAL' && 'Prefeitura da Cidade do Recife • Secretaria de Saúde • Gerência Geral de Atenção e Informação'}
            {currentRole === 'NEPS_UNIT' && `${currentUnit.type} - Distrito ${currentUnit.district} • Coordenador(a): ${currentUser?.name || currentUnit.coordinatorName}`}
            {currentRole === 'PARTICIPANT' && 'Registro de presença (PIN/QR Code), avaliação de reação e emissão de certificados'}
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
            className="bg-[#1351B4] hover:bg-[#0C326F] text-white px-3.5 py-2 rounded-lg font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer border border-[#0C326F]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Diagnóstico IA Gemini</span>
          </button>
        )}

        {/* Action Button: New Training for NEPS Unit */}
        {currentRole === 'NEPS_UNIT' && (
          <button
            id="btn-header-new-training"
            onClick={onOpenNewAction}
            className="bg-[#1351B4] hover:bg-[#0C326F] text-white px-3.5 py-2 rounded-lg font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer border border-[#0C326F]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo Treinamento</span>
          </button>
        )}

        {/* User Identity Chip */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5">
          <div className="w-7 h-7 rounded bg-[#0C326F] text-white text-[11px] font-black flex items-center justify-center shrink-0">
            {currentUser?.avatarInitials || (currentRole === 'SERMAC_CENTRAL' ? 'GC' : currentRole === 'NEPS_UNIT' ? 'UN' : 'PS')}
          </div>
          <div className="hidden md:block text-left min-w-0 max-w-[160px]">
            <p className="text-xs font-bold text-slate-800 truncate leading-tight">
              {currentUser?.name || (currentRole === 'SERMAC_CENTRAL' ? 'Gestor Central' : currentUnit.name)}
            </p>
            <p className="text-[10px] text-slate-500 font-medium truncate leading-tight">
              {currentUser?.email || (currentRole === 'SERMAC_CENTRAL' ? 'SERMAC' : currentUnit.type)}
            </p>
          </div>
        </div>

        {/* User Account / Logout Action */}
        <button
          id="header-btn-switch-user"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-colors shrink-0 cursor-pointer"
          title="Sair da sessão e trocar de conta"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-700" />
          <span className="hidden sm:inline">Sair</span>
        </button>

      </div>
    </header>
  );
};
