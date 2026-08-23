import React, { useState } from 'react';
import { 
  Building2, 
  Building, 
  UserCheck, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert, 
  Check, 
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  Fingerprint
} from 'lucide-react';
import { HealthUnit, AuthUser, UserRole } from '../types';
import { 
  isCentralSermacEmailAuthorized, 
  AUTHORIZED_SERMAC_USERS, 
  DEFAULT_SERMAC_USER, 
  DEFAULT_NEPS_USERS, 
  DEFAULT_PARTICIPANT_USER 
} from '../data/mockData';

// Official Google Multi-color Icon
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
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
  // State for Unit and Participant options
  const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || 'unit-159');
  const [participantUnitId, setParticipantUnitId] = useState<string>(units[0]?.id || 'unit-159');
  const [participantName, setParticipantName] = useState('Enf. Juliana Vasconcelos');
  
  // Custom Gmail input
  const [customEmail, setCustomEmail] = useState('');
  
  // UI Status
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [modalTargetRole, setModalTargetRole] = useState<UserRole>('SERMAC_CENTRAL');

  // Fast Login execution with Google
  const executeGoogleLogin = (
    email: string, 
    userName: string, 
    role: UserRole, 
    unitId?: string,
    actionKey: string = 'login'
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    setErrorMessage(null);
    setIsLoading(true);
    setLoadingAction(actionKey);

    setTimeout(() => {
      setIsLoading(false);
      setLoadingAction(null);
      setShowGoogleModal(false);

      if (role === 'SERMAC_CENTRAL') {
        // STRICT AUTHORIZATION CHECK FOR GESTÃO CENTRAL
        if (!isCentralSermacEmailAuthorized(cleanEmail)) {
          setErrorMessage(
            `Acesso Negado: O e-mail Google "${cleanEmail}" não consta no rol de gestores autorizados para a Gestão Central - SERMAC. O acesso à coordenação central é estritamente restrito a contas homologadas (ex: getulio.batista@ufpe.br, getvb98@gmail.com, neps.ggai@gmail.com, antonio.andrade@recife.pe.gov.br).`
          );
          return;
        }

        const matched = AUTHORIZED_SERMAC_USERS.find(u => u.email.toLowerCase() === cleanEmail);
        const authedUser: AuthUser = matched ? {
          ...matched,
          email: cleanEmail,
          authProvider: 'google'
        } : {
          id: `usr-sermac-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
          name: userName || 'Gestor(a) Central SERMAC',
          email: cleanEmail,
          role: 'SERMAC_CENTRAL',
          registrationNumber: 'SMS-REC-2026',
          jobTitle: 'Gestão Central de Educação Permanente • SERMAC',
          avatarInitials: (userName || cleanEmail).substring(0, 2).toUpperCase(),
          authProvider: 'google'
        };

        onLoginSuccess(authedUser);
      } else if (role === 'NEPS_UNIT') {
        const currentUnit = units.find(u => u.id === (unitId || selectedUnitId)) || units[0];
        const matched = DEFAULT_NEPS_USERS.find(u => u.unitId === currentUnit.id);

        const nepsUser: AuthUser = {
          id: matched?.id || `usr-neps-${currentUnit.id}`,
          name: userName || currentUnit.coordinatorName || 'Coordenação NEPS',
          email: cleanEmail,
          role: 'NEPS_UNIT',
          registrationNumber: 'COREN/CRM-PE',
          unitId: currentUnit.id,
          unitName: currentUnit.name,
          jobTitle: `Coordenação NEPS • ${currentUnit.name}`,
          avatarInitials: (userName || currentUnit.coordinatorName || 'NE').substring(0, 2).toUpperCase(),
          authProvider: 'google'
        };

        onLoginSuccess(nepsUser, currentUnit.id);
      } else {
        const currentUnit = units.find(u => u.id === (unitId || participantUnitId)) || units[0];
        const partUser: AuthUser = {
          ...DEFAULT_PARTICIPANT_USER,
          name: userName || participantName || 'Profissional de Saúde',
          email: cleanEmail,
          registrationNumber: 'SUS-PE-2026',
          unitId: currentUnit.id,
          unitName: currentUnit.name,
          avatarInitials: (userName || participantName || 'PS').substring(0, 2).toUpperCase(),
          authProvider: 'google'
        };

        onLoginSuccess(partUser, currentUnit.id);
      }
    }, 350);
  };

  // Smart Custom Email Router
  const handleCustomEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customEmail.trim().toLowerCase();
    if (!clean) return;

    if (isCentralSermacEmailAuthorized(clean)) {
      const matched = AUTHORIZED_SERMAC_USERS.find(u => u.email.toLowerCase() === clean);
      executeGoogleLogin(clean, matched?.name || 'Gestor SERMAC', 'SERMAC_CENTRAL', undefined, 'custom-email');
    } else {
      // If not in SERMAC whitelist, check if it belongs to any unit or alert
      const unitMatch = units.find(u => u.coordinatorEmail.toLowerCase() === clean);
      if (unitMatch) {
        executeGoogleLogin(clean, unitMatch.coordinatorName, 'NEPS_UNIT', unitMatch.id, 'custom-email');
      } else {
        setErrorMessage(
          `O e-mail "${clean}" não está na lista de Gestores Centrais da SERMAC. Se você é um profissional de saúde, acesse pelo Portal do Participante ou selecione sua Unidade NEPS.`
        );
      }
    }
  };

  const currentSelectedUnit = units.find(u => u.id === selectedUnitId) || units[0];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* Background Ambience / Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header - Institutional Branding */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-900/30 ring-1 ring-white/20">
              +
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">
                  NEPS <span className="text-blue-400">SERMAC</span>
                </h1>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                  PNEPS / SUS
                </span>
                <span className="hidden md:inline-flex text-[10px] bg-emerald-500/15 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Metodologia Tracer
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sistema de Gestão & Monitoramento da Educação Permanente em Saúde • SMS Recife
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-medium text-slate-300">Ambiente Seguro Google SSO</span>
            </div>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline font-mono text-[11px] text-slate-400">v2026.1</span>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col justify-center">
        
        {/* Title & Guidance Banner */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-1">
            <Fingerprint className="w-3.5 h-3.5 text-blue-400" />
            Autenticação Unificada por Google / Gmail
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Portal Institucional de Acesso
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Selecione a sua esfera de atuação ou utilize sua conta institucional Google / Gmail. O sistema aplica controle de acesso baseado em papéis (RBAC) e rastreabilidade Tracer.
          </p>
        </div>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="max-w-3xl mx-auto w-full mb-6 p-4 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-start gap-3 shadow-lg shadow-rose-950/40 animate-fadeIn">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block text-rose-300 font-bold text-sm mb-0.5">Acesso Não Autorizado</strong>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* TRACER 3-PILLAR PROFILE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
          
          {/* ============================================================ */}
          {/* PILLAR 1: GESTÃO CENTRAL - SERMAC */}
          {/* ============================================================ */}
          <div className="bg-slate-900/90 border border-blue-500/40 hover:border-blue-400/80 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-xl shadow-blue-950/30 relative group">
            
            {/* Top Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-500/30">
                Nível Central
              </span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>

              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Gestão Central - SERMAC
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Coordenação Geral, matriz intersetorial da rede, diagnóstico preditivo IA, LNT e consolidação dos 8 Distritos Sanitários.
              </p>

              {/* Authorized Google Accounts List */}
              <div className="mt-5 space-y-2">
                <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Contas Google Autorizadas:
                  </span>
                  <span className="text-[10px] text-slate-500">1 Clique</span>
                </div>

                <div className="space-y-1.5">
                  {AUTHORIZED_SERMAC_USERS.map((usr) => {
                    const isCurrentLoading = isLoading && loadingAction === `sermac-${usr.email}`;
                    return (
                      <button
                        key={usr.email}
                        type="button"
                        onClick={() => executeGoogleLogin(usr.email, usr.name, 'SERMAC_CENTRAL', undefined, `sermac-${usr.email}`)}
                        disabled={isLoading}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/60 text-left transition-all group/btn disabled:opacity-50"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-xs font-semibold text-slate-200 group-hover/btn:text-white block truncate">
                            {usr.name}
                          </span>
                          <span className="text-[11px] font-mono text-blue-400 block truncate">
                            {usr.email}
                          </span>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          {isCurrentLoading ? (
                            <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <GoogleIcon className="w-4 h-4" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setModalTargetRole('SERMAC_CENTRAL');
                  setShowGoogleModal(true);
                }}
                disabled={isLoading}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Entrar na Gestão Central (Google)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* ============================================================ */}
          {/* PILLAR 2: NÚCLEOS NEPS - UNIDADE */}
          {/* ============================================================ */}
          <div className="bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-400/80 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-xl shadow-emerald-950/20 relative group">
            
            {/* Top Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-500/30">
                Nível Local
              </span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                <Building className="w-6 h-6 text-emerald-400" />
              </div>

              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Núcleo NEPS - Unidade
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Gestão direta das capacitações locais, validação de presença via QR Code em tempo real, submissão de DNC e censo.
              </p>

              {/* Unit Selection Form */}
              <div className="mt-5 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                    Selecione a Unidade de Saúde (NEPS):
                  </label>
                  <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                        {u.name} ({u.type}) — {u.district}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Coordenação Local:</span>
                    <span className="text-emerald-400 font-semibold">{currentSelectedUnit.code}</span>
                  </div>
                  <p className="font-semibold text-slate-200 truncate">{currentSelectedUnit.coordinatorName}</p>
                  <p className="text-[11px] font-mono text-slate-400 truncate">{currentSelectedUnit.coordinatorEmail}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  executeGoogleLogin(
                    currentSelectedUnit.coordinatorEmail,
                    currentSelectedUnit.coordinatorName,
                    'NEPS_UNIT',
                    currentSelectedUnit.id,
                    `neps-${currentSelectedUnit.id}`
                  );
                }}
                disabled={isLoading}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading && loadingAction === `neps-${currentSelectedUnit.id}` ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4" />
                    <span>Acessar Núcleo Local (Google)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

          </div>

          {/* ============================================================ */}
          {/* PILLAR 3: PORTAL DO PARTICIPANTE */}
          {/* ============================================================ */}
          <div className="bg-slate-900/90 border border-purple-500/40 hover:border-purple-400/80 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-xl shadow-purple-950/20 relative group">
            
            {/* Top Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider rounded-md border border-purple-500/30">
                Profissionais SUS
              </span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
                <UserCheck className="w-6 h-6 text-purple-400" />
              </div>

              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Portal do Participante
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Registro de frequência por PIN/QR Code, avaliação de reação dos treinamentos e emissão imediata de certificados.
              </p>

              {/* Participant demo selector */}
              <div className="mt-5 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                    Nome do Profissional / Servidor:
                  </label>
                  <input
                    type="text"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Ex: Enf. Juliana Vasconcelos"
                    className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                    Unidade de Lotação:
                  </label>
                  <select
                    value={participantUnitId}
                    onChange={(e) => setParticipantUnitId(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  executeGoogleLogin(
                    'juliana.vasconcelos.sus@gmail.com',
                    participantName,
                    'PARTICIPANT',
                    participantUnitId,
                    'participant-google'
                  );
                }}
                disabled={isLoading}
                className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading && loadingAction === 'participant-google' ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4" />
                    <span>Entrar como Participante (Google)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

        {/* BOTTOM SINGLE SIGN-ON BAR (Tracer Direct Email Access) */}
        <div className="max-w-3xl mx-auto w-full mt-10 p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md">
                <GoogleIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Acessar com qualquer conta Google ou Gmail
                </h4>
                <p className="text-[11px] text-slate-400">
                  O sistema reconhece automaticamente seu perfil pelo e-mail institucional.
                </p>
              </div>
            </div>

            <form onSubmit={handleCustomEmailSubmit} className="w-full sm:w-auto flex items-center gap-2">
              <input
                type="email"
                value={customEmail}
                onChange={(e) => {
                  setCustomEmail(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="seu.email@gmail.com"
                className="flex-1 sm:w-64 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="submit"
                disabled={isLoading || !customEmail.trim()}
                className="px-4 py-2 bg-slate-100 hover:bg-white text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <span>Acessar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        </div>

      </main>

      {/* GOOGLE ACCOUNT CHOOSER MODAL */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white text-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp">
            
            <div className="p-6 text-center border-b border-slate-100">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-slate-50 rounded-full border border-slate-100 shadow-xs">
                <GoogleIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Fazer login com o Google
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {modalTargetRole === 'SERMAC_CENTRAL' 
                  ? 'Acesso restrito à Coordenação Geral (SERMAC Central)' 
                  : 'Acesso ao sistema NEPS - SERMAC'}
              </p>
            </div>

            <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto">
              
              {/* Form to enter custom Google account */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Digitar conta Google / Gmail:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="ex: getulio.batista@ufpe.br ou getvb98@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!customEmail.trim()) return;
                      executeGoogleLogin(customEmail.trim(), '', modalTargetRole);
                    }}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs"
                  >
                    Entrar
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">
                  {modalTargetRole === 'SERMAC_CENTRAL' ? 'Gestores Centrais Homologados:' : 'Contas Disponíveis:'}
                </p>

                {/* SERMAC Central Accounts */}
                <div className="space-y-1.5">
                  {AUTHORIZED_SERMAC_USERS.map((usr) => (
                    <button
                      key={usr.email}
                      type="button"
                      onClick={() => executeGoogleLogin(usr.email, usr.name, 'SERMAC_CENTRAL')}
                      className="w-full p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center gap-3 text-left transition-all group"
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                        {usr.avatarInitials || 'GC'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">{usr.name}</span>
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">Central</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono block truncate">{usr.email}</span>
                      </div>
                    </button>
                  ))}

                  {modalTargetRole !== 'SERMAC_CENTRAL' && (
                    <button
                      type="button"
                      onClick={() => executeGoogleLogin(currentSelectedUnit.coordinatorEmail, currentSelectedUnit.coordinatorName, 'NEPS_UNIT', currentSelectedUnit.id)}
                      className="w-full p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center gap-3 text-left transition-all group"
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                        UN
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">{currentSelectedUnit.coordinatorName}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">{currentSelectedUnit.code}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono block truncate">{currentSelectedUnit.coordinatorEmail}</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Google Identity Protocol
              </span>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold rounded hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-4 border-t border-slate-800/60 bg-slate-950/80 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Prefeitura da Cidade do Recife • Secretaria de Saúde • Gerência Geral de Atenção e Informação (GGAI)</span>
          <span className="text-slate-400 font-medium">Metodologia Tracer de Avaliação • PNEPS</span>
        </div>
      </footer>

    </div>
  );
};
