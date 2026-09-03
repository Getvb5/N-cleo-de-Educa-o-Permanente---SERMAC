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
  Shield,
  Download,
  FileSpreadsheet,
  Users,
  Cloud
} from 'lucide-react';
import { SermacEducaLogo } from './SermacEducaLogo';

interface SidebarProps {
  currentRole: UserRole;
  units: HealthUnit[];
  selectedUnitId: string;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onOpenAiDiagnosis: () => void;
  onOpenNewAction: () => void;
  onOpenPaepsPlan?: () => void;
  onOpenCnesModal?: () => void;
  onOpenCensusModal?: (unit: HealthUnit) => void;
  onExportCsv?: () => void;
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
  onOpenCnesModal,
  onOpenCensusModal,
  onExportCsv,
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
          <SermacEducaLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white font-black text-lg tracking-tight">
                SERMAC <span className="text-[#8AB4F8]">EDUCA</span>
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
              <span>Visão Geral das Unidades</span>
            </div>

            <div className="text-[10px] font-bold text-slate-300 uppercase px-3 pt-4 pb-1 tracking-wider">
              Ferramentas Centrais
            </div>
            
            <button
              id="sidebar-btn-ai-diag"
              onClick={() => { onOpenAiDiagnosis(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1A4588] rounded-lg text-xs text-white transition-all text-left font-medium cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Diagnóstico IA</span>
            </button>

            {onOpenPaepsPlan && (
              <button
                id="sidebar-btn-lnt"
                onClick={() => { onOpenPaepsPlan(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1A4588] rounded-lg text-xs text-white transition-all text-left font-medium cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#8AB4F8] shrink-0" />
                <span>LNT</span>
              </button>
            )}

            {onOpenCnesModal && (
              <button
                id="sidebar-btn-cnes"
                onClick={() => { onOpenCnesModal(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1A4588] rounded-lg text-xs text-white transition-all text-left font-medium cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Base CNES</span>
              </button>
            )}

            {onExportCsv && (
              <button
                id="sidebar-btn-export"
                onClick={() => { onExportCsv(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1A4588] rounded-lg text-xs text-white transition-all text-left font-medium cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-300 shrink-0" />
                <span>Exportar CSV</span>
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
              Ações & Integrações
            </div>
            
            <button
              id="sidebar-btn-new-action"
              onClick={() => { onOpenNewAction(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-[#1351B4] hover:bg-[#1A5CD6] text-white rounded-lg text-xs shadow-sm transition-all text-left font-bold border border-[#2670E8]"
            >
              <Plus className="w-4 h-4 text-white shrink-0" />
              <span>Novo Treinamento</span>
            </button>

            {onOpenCnesModal && (
              <button
                id="sidebar-btn-unit-cnes"
                onClick={() => { onOpenCnesModal(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1A4588] rounded-lg text-xs text-white transition-all text-left font-medium cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Base CNES ({currentUnit.cnes || '0002135'})</span>
              </button>
            )}

            {onOpenCensusModal && (
              <button
                id="sidebar-btn-unit-census"
                onClick={() => { onOpenCensusModal(currentUnit); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1A4588] rounded-lg text-xs text-white transition-all text-left font-medium cursor-pointer"
              >
                <Users className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Censo de Ativos ({currentUnit.totalStaff})</span>
              </button>
            )}
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

      </nav>

      {/* User / Profile Footer & Logout Button in a single unified box */}
      <div className="p-3 border-t border-[#1A4588] bg-[#0A295B]">
        <div className="p-2.5 rounded-lg bg-[#08234D] border border-[#1A4588]">
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
              className="p-1.5 rounded-md text-slate-300 hover:text-rose-300 hover:bg-[#1A4588] transition-colors shrink-0 cursor-pointer"
              title="Sair da Conta / Trocar de Perfil"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 pt-2 border-t border-[#1A4588]/80 flex items-center justify-between text-[10px]">
            <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sessão Homologada
            </span>
            <span className="text-slate-400 font-medium">SUS Recife</span>
          </div>
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
  onOpenAiDiagnosis?: () => void;
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
          <h2 className="text-base sm:text-lg font-bold text-[#0C326F] tracking-tight leading-tight">
            {currentRole === 'SERMAC_CENTRAL' && 'Gestão Central - SERMAC • Visão Geral das Unidades'}
            {currentRole === 'NEPS_UNIT' && `Núcleo NEPS • ${currentUnit.name}`}
            {currentRole === 'PARTICIPANT' && 'Portal do Profissional de Saúde'}
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5 truncate hidden sm:block">
            {currentRole === 'SERMAC_CENTRAL' && 'Prefeitura da Cidade do Recife • Secretaria de Saúde • Secretaria de Média e Alta Complexidade'}
            {currentRole === 'NEPS_UNIT' && `${currentUnit.type} - Distrito ${currentUnit.district} • Coordenador(a): ${currentUser?.name || currentUnit.coordinatorName}`}
            {currentRole === 'PARTICIPANT' && 'Registro de presença (PIN/QR Code), avaliação de reação e emissão de certificados'}
          </p>
        </div>
      </div>

      {/* Right Side: User Profile Badge with Logout */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0 ml-auto">

        {/* Cloud Persistence Badge */}
        <div 
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[#1351B4] text-[11px] font-bold shadow-2xs"
          title="Dados sincronizados e salvos oficialmente no Google Cloud Firestore em tempo real"
        >
          <Cloud className="w-3.5 h-3.5 text-[#1351B4]" />
          <span>Nuvem Oficial (Firestore)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Single Unified User Identity & Session Box */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 shadow-2xs">
          <div className="w-8 h-8 rounded-md bg-[#0C326F] text-white text-[11px] font-black flex items-center justify-center shrink-0 shadow-xs">
            {currentUser?.avatarInitials || (currentRole === 'SERMAC_CENTRAL' ? 'GC' : currentRole === 'NEPS_UNIT' ? 'UN' : 'PS')}
          </div>
          <div className="text-left min-w-0 max-w-[170px]">
            <p className="text-xs font-bold text-slate-800 truncate leading-tight">
              {currentUser?.name || (currentRole === 'SERMAC_CENTRAL' ? 'Gestor Central' : currentUnit.name)}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Sessão Homologada
              </span>
            </div>
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
