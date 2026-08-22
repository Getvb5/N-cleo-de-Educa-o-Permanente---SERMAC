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
  KeyRound, 
  User, 
  ShieldAlert, 
  Check, 
  X, 
  LogIn
} from 'lucide-react';
import { HealthUnit, AuthUser, UserRole } from '../types';
import { 
  AUTHORIZED_CENTRAL_SERMAC_EMAILS, 
  isCentralSermacEmailAuthorized, 
  AUTHORIZED_SERMAC_USERS, 
  DEFAULT_SERMAC_USER, 
  DEFAULT_NEPS_USERS, 
  DEFAULT_PARTICIPANT_USER 
} from '../data/mockData';

// Google Colored Icon Component
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
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('SERMAC_CENTRAL');
  
  // Google modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGmail, setCustomGmail] = useState('');
  
  // SERMAC form state
  const [sermacEmail, setSermacEmail] = useState('getulio.batista@ufpe.br');
  const [sermacPassword, setSermacPassword] = useState('sermac2026');
  
  // NEPS Unit form state
  const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || 'unit-159');
  const [nepsEmail, setNepsEmail] = useState(units[0]?.coordinatorEmail || 'neps.us159@saude.recife.pe.gov.br');
  const [nepsPassword, setNepsPassword] = useState('neps123');

  // Participant form state
  const [participantCpf, setParticipantCpf] = useState('321.654.987-00');
  const [participantName, setParticipantName] = useState('Enf. Juliana Vasconcelos');
  const [participantUnitId, setParticipantUnitId] = useState<string>(units[0]?.id || 'unit-159');

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update NEPS email when unit changes
  const handleUnitChange = (unitId: string) => {
    setSelectedUnitId(unitId);
    const unitUser = DEFAULT_NEPS_USERS.find(u => u.unitId === unitId);
    if (unitUser) {
      setNepsEmail(unitUser.email);
    } else {
      const u = units.find(unit => unit.id === unitId);
      setNepsEmail(u?.coordinatorEmail || 'neps.unidade@saude.gov.br');
    }
  };

  // Google Login execution
  const handleGoogleAccountSelect = (email: string, userName?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (activeRoleTab === 'SERMAC_CENTRAL') {
        if (!isCentralSermacEmailAuthorized(cleanEmail)) {
          setErrorMessage(`Acesso negado: A conta Google (${cleanEmail}) não possui permissão de Gestão Central - SERMAC. E-mails autorizados: getulio.batista@ufpe.br, neps.ggai@gmail.com ou antonio.andrade@recife.pe.gov.br`);
          setShowGoogleModal(false);
          return;
        }

        const matched = AUTHORIZED_SERMAC_USERS.find(u => u.email.toLowerCase() === cleanEmail);
        const authedUser: AuthUser = matched ? {
          ...matched,
          authProvider: 'google'
        } : {
          id: `usr-sermac-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
          name: userName || 'Gestor(a) SERMAC',
          email: cleanEmail,
          role: 'SERMAC_CENTRAL',
          registrationNumber: 'SMS-REC-2026',
          jobTitle: 'Gestão Central de Educação Permanente • SERMAC',
          avatarInitials: (userName || cleanEmail).substring(0, 2).toUpperCase(),
          authProvider: 'google'
        };

        setShowGoogleModal(false);
        onLoginSuccess(authedUser);
      } else if (activeRoleTab === 'NEPS_UNIT') {
        const currentUnit = units.find(u => u.id === selectedUnitId) || units[0];
        const matched = DEFAULT_NEPS_USERS.find(u => u.unitId === selectedUnitId);

        const nepsUser: AuthUser = {
          id: matched?.id || `usr-neps-${selectedUnitId}`,
          name: userName || currentUnit.coordinatorName || 'Coordenador(a) NEPS',
          email: cleanEmail,
          role: 'NEPS_UNIT',
          registrationNumber: 'COREN/CRM-PE',
          unitId: currentUnit.id,
          unitName: currentUnit.name,
          jobTitle: `Coordenação NEPS • ${currentUnit.name}`,
          avatarInitials: (userName || currentUnit.coordinatorName || 'NE').substring(0, 2).toUpperCase(),
          authProvider: 'google'
        };

        setShowGoogleModal(false);
        onLoginSuccess(nepsUser, selectedUnitId);
      } else {
        const currentUnit = units.find(u => u.id === participantUnitId) || units[0];
        const partUser: AuthUser = {
          ...DEFAULT_PARTICIPANT_USER,
          name: userName || participantName || 'Profissional SUS',
          email: cleanEmail,
          registrationNumber: participantCpf || 'SUS-992014',
          unitId: currentUnit.id,
          unitName: currentUnit.name,
          avatarInitials: (userName || participantName || 'PS').substring(0, 2).toUpperCase(),
          authProvider: 'google'
        };

        setShowGoogleModal(false);
        onLoginSuccess(partUser, currentUnit.id);
      }
    }, 400);
  };

  // Submit Handler (Form)
  const handleFormLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (activeRoleTab === 'SERMAC_CENTRAL') {
        const cleanEmail = sermacEmail.trim().toLowerCase();
        if (!cleanEmail) {
          setErrorMessage('Por favor, informe o e-mail cadastrado para a Gestão Central - SERMAC.');
          return;
        }

        // Strict Email Authorization Check
        if (!isCentralSermacEmailAuthorized(cleanEmail)) {
          setErrorMessage('Acesso restrito: O perfil Gestão Central - SERMAC é restrito aos seguintes e-mails autorizados: getulio.batista@ufpe.br, neps.ggai@gmail.com ou antonio.andrade@recife.pe.gov.br');
          return;
        }

        const matchedUser = AUTHORIZED_SERMAC_USERS.find(u => u.email.toLowerCase() === cleanEmail) || {
          ...DEFAULT_SERMAC_USER,
          email: cleanEmail
        };

        onLoginSuccess(matchedUser);
      } else if (activeRoleTab === 'NEPS_UNIT') {
        const matchedUser = DEFAULT_NEPS_USERS.find(u => u.unitId === selectedUnitId);
        const currentUnit = units.find(u => u.id === selectedUnitId) || units[0];

        const nepsUser: AuthUser = matchedUser || {
          id: `usr-neps-${selectedUnitId}`,
          name: currentUnit.coordinatorName || 'Coordenador(a) NEPS',
          email: nepsEmail || currentUnit.coordinatorEmail,
          role: 'NEPS_UNIT',
          registrationNumber: 'COREN/CRM-SMS',
          unitId: currentUnit.id,
          unitName: currentUnit.name,
          jobTitle: `Coord. NEPS • ${currentUnit.name}`,
          avatarInitials: currentUnit.coordinatorName.substring(0, 2).toUpperCase()
        };

        onLoginSuccess(nepsUser, selectedUnitId);
      } else {
        const currentUnit = units.find(u => u.id === participantUnitId) || units[0];
        const partUser: AuthUser = {
          ...DEFAULT_PARTICIPANT_USER,
          name: participantName || 'Profissional de Saúde',
          registrationNumber: participantCpf || 'SUS-884920',
          unitId: currentUnit.id,
          unitName: currentUnit.name
        };
        onLoginSuccess(partUser, currentUnit.id);
      }
    }, 300);
  };

  const currentSelectedUnit = units.find(u => u.id === selectedUnitId) || units[0];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      
      {/* Background Accent Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="w-full border-b border-slate-800 bg-slate-950/60 backdrop-blur-md px-6 py-3.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-sm">
            +
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight text-lg">NEPS <span className="text-blue-400">SERMAC</span></span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-500/30">
                PNEPS / SUS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Sistema Municipal de Educação Permanente em Saúde • SERMAC Recife</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Ambiente Seguro SMS Recife
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span>Versão 2026.1</span>
        </div>
      </header>

      {/* Main Login Box Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-4">
        <div className="w-full max-w-xl bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden">
          
          {/* Header Description */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-800 to-slate-800/50 border-b border-slate-700/70 text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Acesso ao Sistema de Capacitação
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-md mx-auto">
              Acesse com sua conta <strong>Google / Gmail</strong> ou selecione seu perfil institucional.
            </p>

            {/* Role Tab Selector */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/60 mt-6">
              
              {/* SERMAC Tab */}
              <button
                id="login-tab-sermac"
                type="button"
                onClick={() => { setActiveRoleTab('SERMAC_CENTRAL'); setErrorMessage(null); }}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  activeRoleTab === 'SERMAC_CENTRAL'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Building2 className="w-4 h-4 mb-1" />
                <span>Gestão Central</span>
                <span className="text-[10px] opacity-80 font-semibold">- SERMAC</span>
              </button>

              {/* NEPS Unit Tab */}
              <button
                id="login-tab-neps"
                type="button"
                onClick={() => { setActiveRoleTab('NEPS_UNIT'); setErrorMessage(null); }}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  activeRoleTab === 'NEPS_UNIT'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Building className="w-4 h-4 mb-1" />
                <span>Núcleo NEPS</span>
                <span className="text-[10px] opacity-80 font-semibold">- Unidade</span>
              </button>

              {/* Participant Tab */}
              <button
                id="login-tab-participant"
                type="button"
                onClick={() => { setActiveRoleTab('PARTICIPANT'); setErrorMessage(null); }}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  activeRoleTab === 'PARTICIPANT'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <UserCheck className="w-4 h-4 mb-1" />
                <span>Participante</span>
                <span className="text-[10px] opacity-75 font-normal">Profissional SUS</span>
              </button>

            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-5">
            
            {errorMessage && (
              <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <strong className="block text-rose-300 font-semibold mb-0.5">Acesso Não Autorizado</strong>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* PRIMARY GOOGLE / GMAIL LOGIN BUTTON (Official Google Button Style) */}
            <div className="space-y-3">
              <button
                id="btn-login-with-google"
                type="button"
                onClick={() => setShowGoogleModal(true)}
                disabled={isLoading}
                className="w-full bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold py-3 px-4 rounded-xl shadow-lg border border-slate-200 transition-all flex items-center justify-center gap-3 cursor-pointer group hover:shadow-xl"
              >
                <GoogleIcon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium text-slate-800 group-hover:text-slate-950">
                  Fazer login com o <strong>Google / Gmail</strong>
                </span>
              </button>

              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-slate-700 w-full" />
                <span className="bg-slate-800 px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider relative z-10 shrink-0">
                  ou acesse pelo formulário
                </span>
              </div>
            </div>

            {/* TAB 1: GESTÃO CENTRAL - SERMAC */}
            {activeRoleTab === 'SERMAC_CENTRAL' && (
              <form onSubmit={handleFormLogin} className="space-y-4">
                <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2.5 text-xs text-blue-200">
                  <ShieldCheck className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white block font-bold mb-0.5">Perfil: Gestão Central - SERMAC</strong>
                    <span>
                      Acesso restrito à Coordenação Geral de Educação Permanente, matriz intersetorial, diagnósticos IA, LNT e indicadores de toda a rede.
                    </span>
                  </div>
                </div>

                {/* Authorized Emails Helper Box */}
                <div className="p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      E-mails autorizados para login Google / Gmail:
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {AUTHORIZED_SERMAC_USERS.map((usr) => {
                      const isSelected = sermacEmail.toLowerCase() === usr.email.toLowerCase();
                      return (
                        <button
                          key={usr.email}
                          type="button"
                          onClick={() => {
                            setSermacEmail(usr.email);
                            setErrorMessage(null);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all border ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500 text-white font-medium'
                              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <span className="block font-semibold text-slate-200">{usr.name}</span>
                            <span className="block font-mono text-[11px] text-blue-400">{usr.email}</span>
                          </div>
                          {isSelected ? (
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <span className="text-[10px] text-slate-500 shrink-0">Selecionar</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    E-mail Google Autorizado (Gestão Central - SERMAC)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-sermac-email"
                      type="email"
                      value={sermacEmail}
                      onChange={(e) => {
                        setSermacEmail(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="getulio.batista@ufpe.br"
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Senha de Acesso
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-sermac-password"
                      type="password"
                      value={sermacPassword}
                      onChange={(e) => setSermacPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-login-sermac-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-3 rounded-lg text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Acessar Gestão Central - SERMAC</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: NÚCLEO NEPS - UNIDADE */}
            {activeRoleTab === 'NEPS_UNIT' && (
              <form onSubmit={handleFormLogin} className="space-y-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2.5 text-xs text-emerald-200">
                  <Building className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white block">Perfil: Núcleo NEPS - Unidade</strong>
                    Gestão de capacitações locais da unidade de saúde, QR Code de presença, envio de DNC e certificação direta da equipe.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Selecione a Unidade de Saúde (NEPS)
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      id="select-login-unit"
                      value={selectedUnitId}
                      onChange={(e) => handleUnitChange(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                          {u.name} ({u.type}) — {u.district}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 pl-1">
                    Coordenador(a) titular: <strong className="text-slate-200">{currentSelectedUnit.coordinatorName}</strong>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    E-mail ou Conta Google da Coordenação
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-neps-email"
                      type="text"
                      value={nepsEmail}
                      onChange={(e) => setNepsEmail(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Senha do Núcleo Local
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-neps-password"
                      type="password"
                      value={nepsPassword}
                      onChange={(e) => setNepsPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-login-neps-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold py-3 rounded-lg text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Acessar Núcleo NEPS - {currentSelectedUnit.code}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: PORTAL DO PARTICIPANTE */}
            {activeRoleTab === 'PARTICIPANT' && (
              <form onSubmit={handleFormLogin} className="space-y-4">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-start gap-2.5 text-xs text-purple-200">
                  <UserCheck className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white block">Portal do Profissional do SUS</strong>
                    Registro rápido de presença com PIN de 4 dígitos, avaliação de reação dos cursos e download de certificados autenticados.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nome Completo do Profissional
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-part-name"
                      type="text"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      placeholder="Ex: Enf. Juliana Vasconcelos"
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      CPF ou Matrícula SUS
                    </label>
                    <input
                      id="input-part-cpf"
                      type="text"
                      value={participantCpf}
                      onChange={(e) => setParticipantCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Unidade de Lotação
                    </label>
                    <select
                      id="select-part-unit"
                      value={participantUnitId}
                      onChange={(e) => setParticipantUnitId(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-login-part-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold py-3 rounded-lg text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Acessar Portal do Participante</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Quick Demo Accounts */}
            <div className="pt-4 border-t border-slate-700/60">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Acessos Rápidos com Google (1 Clique)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  id="btn-fast-sermac"
                  type="button"
                  onClick={() => handleGoogleAccountSelect('getulio.batista@ufpe.br', 'Prof. Getúlio Batista')}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-900 hover:border-blue-500/50 border border-slate-700/80 rounded-lg text-left transition-all group"
                  title="Acessar com Google como Prof. Getúlio Batista (UFPE / SERMAC)"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                    <span className="truncate">Gestão Central</span>
                    <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium truncate mt-0.5">Prof. Getúlio Batista</p>
                  <p className="text-[9px] text-slate-500 font-mono truncate">getulio.batista@ufpe.br</p>
                </button>

                <button
                  id="btn-fast-neps-ubs"
                  type="button"
                  onClick={() => {
                    setActiveRoleTab('NEPS_UNIT');
                    setSelectedUnitId('unit-159');
                    handleGoogleAccountSelect('carla.albuquerque.neps@gmail.com', 'Enf. Carla Albuquerque');
                  }}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-900 hover:border-emerald-500/50 border border-slate-700/80 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                    <span className="truncate">Núcleo NEPS</span>
                    <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium truncate mt-0.5">Enf. Carla Albuquerque</p>
                  <p className="text-[9px] text-slate-500 truncate">US 159 Agamenon (Gmail)</p>
                </button>

                <button
                  id="btn-fast-neps-upa"
                  type="button"
                  onClick={() => {
                    setActiveRoleTab('NEPS_UNIT');
                    setSelectedUnitId('unit-165');
                    handleGoogleAccountSelect('gabriela.fontes.neps@gmail.com', 'Dra. Gabriela Fontes');
                  }}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-900 hover:border-indigo-500/50 border border-slate-700/80 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                    <span className="truncate">Núcleo NEPS</span>
                    <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium truncate mt-0.5">Dra. Gabriela Fontes</p>
                  <p className="text-[9px] text-slate-500 truncate">US 165 Bandeira (Gmail)</p>
                </button>
              </div>
            </div>

          </div>

          {/* Footer Card Info */}
          <div className="px-6 py-3.5 bg-slate-900/90 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Conformidade com a Portaria GM/MS nº 1.996/2007 (PNEPS)
            </span>
            <span className="font-semibold text-slate-300">SMS / SERMAC</span>
          </div>

        </div>
      </main>

      {/* GOOGLE ACCOUNT CHOOSER MODAL (Simulated Google Auth Modal) */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white text-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            
            {/* Modal Google Top Header */}
            <div className="p-6 text-center border-b border-slate-100">
              <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center bg-slate-50 rounded-full border border-slate-100">
                <GoogleIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                Fazer login com o Google
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                para continuar no aplicativo <strong>NEPS - SERMAC</strong>
              </p>

              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-700 font-medium">
                <span>Perfil pretendido:</span>
                <span className="font-bold text-blue-600">
                  {activeRoleTab === 'SERMAC_CENTRAL' && 'Gestão Central - SERMAC'}
                  {activeRoleTab === 'NEPS_UNIT' && 'Núcleo NEPS - Unidade'}
                  {activeRoleTab === 'PARTICIPANT' && 'Participante / Profissional'}
                </span>
              </div>
            </div>

            {/* Modal Body: Accounts list */}
            <div className="p-5 space-y-3 max-h-[360px] overflow-y-auto">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                Escolha uma conta do Google ou Gmail:
              </p>

              {/* SERMAC Authorized Google Accounts */}
              {activeRoleTab === 'SERMAC_CENTRAL' && (
                <div className="space-y-1.5">
                  {AUTHORIZED_SERMAC_USERS.map((usr) => (
                    <button
                      key={usr.email}
                      type="button"
                      onClick={() => handleGoogleAccountSelect(usr.email, usr.name)}
                      className="w-full p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center gap-3 text-left transition-all group"
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                        {usr.avatarInitials || 'GB'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">{usr.name}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-semibold">Autorizado</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono block truncate">{usr.email}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* NEPS Unit Google Accounts */}
              {activeRoleTab === 'NEPS_UNIT' && (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleGoogleAccountSelect('carla.albuquerque.neps@gmail.com', 'Enf. Carla Albuquerque')}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center gap-3 text-left transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                      CA
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">Enf. Carla Albuquerque</span>
                        <span className="text-[10px] text-slate-400">US 159</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono block truncate">carla.albuquerque.neps@gmail.com</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGoogleAccountSelect('gabriela.fontes.neps@gmail.com', 'Dra. Gabriela Fontes')}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center gap-3 text-left transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                      GF
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">Dra. Gabriela Fontes</span>
                        <span className="text-[10px] text-slate-400">US 165</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono block truncate">gabriela.fontes.neps@gmail.com</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Participant Google Accounts */}
              {activeRoleTab === 'PARTICIPANT' && (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleGoogleAccountSelect('juliana.vasconcelos.sus@gmail.com', 'Enf. Juliana Vasconcelos')}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 flex items-center gap-3 text-left transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                      JV
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-purple-700 block">Enf. Juliana Vasconcelos</span>
                      <span className="text-[11px] text-slate-500 font-mono block truncate">juliana.vasconcelos.sus@gmail.com</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Custom Gmail Input Form */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ou digite qualquer outra conta do Google (Gmail):
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={customGmail}
                    onChange={(e) => setCustomGmail(e.target.value)}
                    placeholder="seu.email@gmail.com"
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customGmail.trim()) {
                        handleGoogleAccountSelect(customGmail.trim());
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Entrar</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Bottom Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Autenticação Google Identity
              </span>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium rounded hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full text-center py-3 text-[11px] text-slate-500 z-10">
        Prefeitura Municipal do Recife • Secretaria Municipal de Saúde • Educação Permanente em Saúde (EPS/NEPS)
      </footer>

    </div>
  );
};
