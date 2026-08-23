import React, { useState } from 'react';
import { 
  Building2, 
  Building, 
  UserCheck, 
  ShieldCheck, 
  ArrowRight, 
  ShieldAlert, 
  Lock, 
  UserX,
  Mail,
  CheckCircle2,
  User,
  Sparkles,
  Info
} from 'lucide-react';
import { HealthUnit, AuthUser, UserRole } from '../types';
import { 
  isCentralSermacEmailAuthorized, 
  AUTHORIZED_SERMAC_USERS, 
  DEFAULT_NEPS_USERS, 
  DEFAULT_PARTICIPANT_USER 
} from '../data/mockData';

// Official Google Multi-color Icon
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

interface AuthScreenProps {
  units: HealthUnit[];
  onLoginSuccess: (user: AuthUser, selectedUnitId?: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ units, onLoginSuccess }) => {
  // State for Unit selections
  const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || 'unit-159');
  const [participantUnitId, setParticipantUnitId] = useState<string>(units[0]?.id || 'unit-159');
  
  // Google Account inputs per profile
  // 1. Central SERMAC (default to user's authorized account)
  const [sermacGoogleEmail, setSermacGoogleEmail] = useState<string>('getvb98@gmail.com');
  const [sermacGoogleName, setSermacGoogleName] = useState<string>('Prof. Getúlio Batista');
  
  // 2. NEPS Unit
  const [nepsGoogleEmail, setNepsGoogleEmail] = useState<string>('neps.us159@saude.recife.pe.gov.br');
  const [nepsGoogleName, setNepsGoogleName] = useState<string>('Enf. Carla Albuquerque');

  // 3. Participant
  const [partGoogleEmail, setPartGoogleEmail] = useState<string>('getvb98@gmail.com');
  const [partGoogleName, setPartGoogleName] = useState<string>('Getúlio Batista');

  // Error & Security Alert State
  const [authError, setAuthError] = useState<{
    email?: string;
    message: string;
    isAccessDenied?: boolean;
  } | null>(null);

  /**
   * Complete Login with Google Profile
   */
  const handleLogin = (role: UserRole, targetUnitId?: string) => {
    setAuthError(null);

    // =========================================================================
    // 1. GESTÃO CENTRAL (SERMAC) — STRICT CONTROLLED ACCESS ONLY
    // =========================================================================
    if (role === 'SERMAC_CENTRAL') {
      const cleanEmail = sermacGoogleEmail.toLowerCase().trim();
      
      if (!isCentralSermacEmailAuthorized(cleanEmail)) {
        setAuthError({
          email: cleanEmail,
          message: `A conta Google "${cleanEmail}" NÃO possui autorização para o perfil de Gestão Central (SERMAC).\n\nO acesso à Coordenação Geral é estritamente restrito aos e-mails homologados pela Secretaria de Saúde (SMS Recife).`,
          isAccessDenied: true
        });
        return;
      }

      const matched = AUTHORIZED_SERMAC_USERS.find(u => u.email.toLowerCase() === cleanEmail);
      const centralUser: AuthUser = matched ? {
        ...matched,
        email: cleanEmail,
        name: sermacGoogleName.trim() || matched.name,
        authProvider: 'google'
      } : {
        id: `usr-sermac-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
        name: sermacGoogleName.trim() || 'Gestor(a) Central SERMAC',
        email: cleanEmail,
        role: 'SERMAC_CENTRAL',
        registrationNumber: 'SMS-REC-2026',
        jobTitle: 'Gestão Central de Educação Permanente • SERMAC',
        avatarInitials: (sermacGoogleName || cleanEmail).substring(0, 2).toUpperCase(),
        authProvider: 'google'
      };

      onLoginSuccess(centralUser);
      return;
    }

    // =========================================================================
    // 2. NÚCLEO NEPS - UNIDADE — OPEN ACCESS WITH ANY GOOGLE ACCOUNT
    // =========================================================================
    if (role === 'NEPS_UNIT') {
      const cleanEmail = (nepsGoogleEmail.trim() || 'neps.coordenador@gmail.com').toLowerCase();
      const currentUnit = units.find(u => u.id === (targetUnitId || selectedUnitId)) || units[0];
      const matched = DEFAULT_NEPS_USERS.find(u => u.unitId === currentUnit.id);

      const nepsUser: AuthUser = {
        id: matched?.id || `usr-neps-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
        name: nepsGoogleName.trim() || currentUnit.coordinatorName || 'Coordenação NEPS',
        email: cleanEmail,
        role: 'NEPS_UNIT',
        registrationNumber: matched?.registrationNumber || 'COREN/CRM-PE',
        unitId: currentUnit.id,
        unitName: currentUnit.name,
        jobTitle: `Coordenação NEPS • ${currentUnit.name}`,
        avatarInitials: (nepsGoogleName || currentUnit.coordinatorName || 'NE').substring(0, 2).toUpperCase(),
        authProvider: 'google'
      };

      onLoginSuccess(nepsUser, currentUnit.id);
      return;
    }

    // =========================================================================
    // 3. PORTAL DO PARTICIPANTE — OPEN ACCESS WITH ANY GOOGLE ACCOUNT
    // =========================================================================
    const cleanEmail = (partGoogleEmail.trim() || 'participante@gmail.com').toLowerCase();
    const currentUnit = units.find(u => u.id === (targetUnitId || participantUnitId)) || units[0];
    
    const partUser: AuthUser = {
      ...DEFAULT_PARTICIPANT_USER,
      name: partGoogleName.trim() || 'Profissional de Saúde SUS',
      email: cleanEmail,
      registrationNumber: 'SUS-PE-2026',
      unitId: currentUnit.id,
      unitName: currentUnit.name,
      avatarInitials: (partGoogleName || 'PS').substring(0, 2).toUpperCase(),
      authProvider: 'google'
    };

    onLoginSuccess(partUser, currentUnit.id);
  };

  // Update NEPS coordinator placeholders when unit changes
  const handleUnitChange = (unitId: string) => {
    setSelectedUnitId(unitId);
    const unit = units.find(u => u.id === unitId);
    if (unit) {
      setNepsGoogleName(unit.coordinatorName || 'Coordenação NEPS');
      setNepsGoogleEmail(unit.coordinatorEmail || `${unit.code.toLowerCase()}@gmail.com`);
    }
  };

  const currentSelectedUnit = units.find(u => u.id === selectedUnitId) || units[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-800 font-sans selection:bg-[#1351B4] selection:text-white">
      
      {/* Top Header - Institutional Gov.br / SUS */}
      <header className="w-full bg-[#0C326F] text-white px-4 sm:px-6 py-4 border-b-4 border-[#1351B4] shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-white text-[#0C326F] font-black text-xl flex items-center justify-center shadow-xs">
              +
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  NEPS <span className="text-blue-200">SERMAC</span>
                </h1>
                <span className="text-[11px] bg-white/20 text-white font-bold px-2 py-0.5 rounded">
                  PNEPS / SUS
                </span>
                <span className="hidden md:inline-flex text-[11px] bg-emerald-700 text-emerald-100 font-semibold px-2 py-0.5 rounded">
                  Metodologia Tracer
                </span>
              </div>
              <p className="text-xs text-blue-100">
                Sistema de Gestão & Monitoramento da Educação Permanente em Saúde • SMS Recife
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/20">
              <GoogleIcon className="w-4 h-4" />
              <span>Autenticação Google / Gmail</span>
            </span>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col justify-center">
        
        {/* Title & Guidance Banner */}
        <div className="text-center max-w-3xl mx-auto mb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#EBF2FC] border border-[#1351B4]/30 text-[#0C326F] text-xs font-bold mb-1">
            <GoogleIcon className="w-4 h-4" />
            Acesso com Conta Google / Gmail
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0C326F] tracking-tight">
            Portal de Acesso aos Perfis do Sistema
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Selecione seu perfil de atuação abaixo e entre com sua conta Google. 
            <strong className="text-[#0C326F] ml-1">O controle estrito de acesso é aplicado exclusivamente à Gestão Central SERMAC</strong>.
          </p>
        </div>

        {/* SECURITY ALERT / REFUSAL BOX */}
        {authError && (
          <div className="max-w-4xl mx-auto w-full mb-6 p-4 sm:p-5 rounded-lg border-2 border-rose-400 bg-rose-50 text-rose-900 shadow-sm animate-fadeIn">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded bg-rose-200 text-rose-800 flex items-center justify-center shrink-0">
                <UserX className="w-6 h-6" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-rose-950">
                    ACESSO NEGADO — CONTA GOOGLE NÃO HOMOLOGADA NA CENTRAL
                  </h4>
                  {authError.email && (
                    <span className="px-2.5 py-0.5 bg-rose-200 text-rose-900 font-mono text-[11px] font-bold rounded">
                      {authError.email}
                    </span>
                  )}
                </div>

                <p className="text-xs leading-relaxed whitespace-pre-line text-slate-700 font-medium">
                  {authError.message}
                </p>

                <div className="pt-2 mt-2 border-t border-rose-200 text-xs text-rose-800 space-y-1">
                  <span className="font-bold">E-mails homologados para a Gestão Central (SERMAC):</span>
                  <div className="font-mono text-[11px] flex flex-wrap gap-2 text-slate-800 pt-1">
                    {AUTHORIZED_SERMAC_USERS.map(u => (
                      <button
                        key={u.email}
                        type="button"
                        onClick={() => {
                          setSermacGoogleEmail(u.email);
                          setSermacGoogleName(u.name);
                          setAuthError(null);
                        }}
                        className="px-2.5 py-1 bg-white border border-rose-300 rounded font-semibold text-rose-900 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        ✓ {u.email} ({u.name.split(' ')[0]})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3-PILLAR PROFILE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
          
          {/* ============================================================ */}
          {/* PILLAR 1: GESTÃO CENTRAL - SERMAC (STRICT CONTROLLED ACCESS) */}
          {/* ============================================================ */}
          <div className="bg-white border-2 border-[#1351B4] rounded-xl p-5 flex flex-col justify-between shadow-md relative overflow-hidden">
            
            <div className="absolute top-0 right-0 bg-[#1351B4] text-white px-3 py-1 text-[10px] font-bold uppercase rounded-bl-lg tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Acesso Controlado
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#EBF2FC] text-[#0C326F] flex items-center justify-center shrink-0 border border-[#1351B4]/30">
                  <Building2 className="w-5 h-5 text-[#1351B4]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0C326F] tracking-tight">
                    Gestão Central SERMAC
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Coordenação Geral SMS Recife
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Coordenação Geral, matriz intersetorial da rede, diagnóstico preditivo IA, LNT e consolidação dos 8 Distritos Sanitários.
              </p>

              {/* Form: Google Account for Central */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-3">
                <div className="flex items-center justify-between text-[#0C326F] font-bold text-xs">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1351B4]" />
                    <span>Conta Google Homologada</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold">
                    Restrito
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Selecione ou confirme sua Conta Google:
                  </label>
                  
                  {/* Quick Select for Authorized Gestores */}
                  <div className="space-y-1.5">
                    {AUTHORIZED_SERMAC_USERS.map((user) => {
                      const isSelected = sermacGoogleEmail.toLowerCase() === user.email.toLowerCase();
                      return (
                        <button
                          key={user.email}
                          type="button"
                          onClick={() => {
                            setSermacGoogleEmail(user.email);
                            setSermacGoogleName(user.name);
                            setAuthError(null);
                          }}
                          className={`w-full text-left p-2 rounded-md border text-xs flex items-center justify-between transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-[#EBF2FC] border-[#1351B4] text-[#0C326F] shadow-xs' 
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isSelected ? 'bg-[#1351B4] text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {user.avatarInitials || 'GB'}
                            </div>
                            <div className="truncate">
                              <p className="font-bold text-xs truncate">{user.name}</p>
                              <p className="text-[10px] font-mono text-slate-500 truncate">{user.email}</p>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1351B4] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Manual email input fallback for other institutional Google accounts */}
                  <div className="pt-1">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      Ou digite outro e-mail Google:
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={sermacGoogleEmail}
                        onChange={(e) => setSermacGoogleEmail(e.target.value)}
                        placeholder="seu.email@gmail.com"
                        className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#1351B4]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleLogin('SERMAC_CENTRAL')}
                className="w-full py-3 px-4 bg-[#1351B4] hover:bg-[#0C326F] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Entrar como Gestão Central</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* ============================================================ */}
          {/* PILLAR 2: NÚCLEOS NEPS - UNIDADE (OPEN ACCESS WITH GOOGLE)   */}
          {/* ============================================================ */}
          <div className="bg-white border-2 border-emerald-600 rounded-xl p-5 flex flex-col justify-between shadow-md relative overflow-hidden">
            
            <div className="absolute top-0 right-0 bg-emerald-700 text-white px-3 py-1 text-[10px] font-bold uppercase rounded-bl-lg tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Acesso Livre
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300">
                  <Building className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Núcleos NEPS - Unidade
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    19 Unidades da Rede Municipal
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Gestão direta das capacitações locais, validação de presença via QR Code em tempo real, submissão de DNC e censo.
              </p>

              {/* Form: Unit Selection & Google Account */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Selecione a Unidade de Saúde (NEPS):
                  </label>
                  <select
                    value={selectedUnitId}
                    onChange={(e) => handleUnitChange(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.type}) — {u.district}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Sua Conta Google / Gmail:
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={nepsGoogleEmail}
                      onChange={(e) => setNepsGoogleEmail(e.target.value)}
                      placeholder="neps.sua_unidade@gmail.com"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Nome do Coordenador(a):
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={nepsGoogleName}
                      onChange={(e) => setNepsGoogleName(e.target.value)}
                      placeholder="Nome do Coordenador"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Acesso imediato para qualquer conta Google na unidade.</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleLogin('NEPS_UNIT')}
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Entrar como NEPS ({currentSelectedUnit.code})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* ============================================================ */}
          {/* PILLAR 3: PORTAL DO PARTICIPANTE (OPEN ACCESS WITH GOOGLE)   */}
          {/* ============================================================ */}
          <div className="bg-white border-2 border-purple-600 rounded-xl p-5 flex flex-col justify-between shadow-md relative overflow-hidden">
            
            <div className="absolute top-0 right-0 bg-purple-700 text-white px-3 py-1 text-[10px] font-bold uppercase rounded-bl-lg tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Acesso Livre
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center shrink-0 border border-purple-300">
                  <UserCheck className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Portal do Participante
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Profissionais e Alunos SUS
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Registro de frequência por PIN/QR Code, avaliação de reação dos treinamentos e emissão imediata de certificados oficiais.
              </p>

              {/* Form: Participant info & Google Account */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Sua Unidade de Lotação:
                  </label>
                  <select
                    value={participantUnitId}
                    onChange={(e) => setParticipantUnitId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 cursor-pointer shadow-2xs"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Sua Conta Google / Gmail:
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={partGoogleEmail}
                      onChange={(e) => setPartGoogleEmail(e.target.value)}
                      placeholder="seu.email@gmail.com"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 font-semibold focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Nome Completo do Profissional:
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={partGoogleName}
                      onChange={(e) => setPartGoogleName(e.target.value)}
                      placeholder="Seu Nome Completo"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div className="p-2 bg-purple-50 border border-purple-200 rounded text-[11px] text-purple-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <span>Acesso imediato para qualquer profissional com conta Google.</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleLogin('PARTICIPANT')}
                className="w-full py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Entrar como Participante</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* SECURITY & RBAC ADVISORY */}
        <div className="max-w-4xl mx-auto w-full mt-8 p-4 bg-white border border-slate-300 rounded-lg flex items-center gap-3 text-xs text-slate-600 shadow-xs">
          <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
          <div className="space-y-0.5">
            <strong className="text-slate-900 font-bold block">Controle de Acesso por Papéis (RBAC) com Identidade Google</strong>
            <p className="text-[11px] text-slate-600">
              O sistema valida a identidade Google/Gmail em todos os acessos. O acesso à <strong className="text-[#0C326F]">Gestão Central SERMAC</strong> é estritamente controlado e exclusivo aos e-mails homologados pela SMS Recife. Os perfis de <strong className="text-emerald-700">Coordenação NEPS Unidade</strong> e <strong className="text-purple-700">Portal do Participante</strong> possuem login livre para qualquer conta Google da rede.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 border-t border-slate-300 bg-white text-[11px] text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Prefeitura da Cidade do Recife • Secretaria de Saúde • Gerência Geral de Atenção e Informação (GGAI)</span>
          <span className="text-[#0C326F] font-bold">Metodologia Tracer de Avaliação • PNEPS</span>
        </div>
      </footer>

    </div>
  );
};



