import React, { useState } from 'react';
import { 
  Building2, 
  Building, 
  UserCheck, 
  ShieldCheck, 
  ArrowRight, 
  ShieldAlert, 
  Lock, 
  AlertTriangle,
  LogOut,
  UserX,
  Sparkles
} from 'lucide-react';
import { HealthUnit, AuthUser, UserRole } from '../types';
import { 
  isCentralSermacEmailAuthorized, 
  AUTHORIZED_SERMAC_USERS, 
  DEFAULT_NEPS_USERS, 
  DEFAULT_PARTICIPANT_USER 
} from '../data/mockData';
import { signInWithGooglePopup, signOutGoogle } from '../lib/firebase';

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
  
  // UI Status
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [authError, setAuthError] = useState<{
    email?: string;
    message: string;
    isAccessDenied?: boolean;
  } | null>(null);

  /**
   * Real Google Authentication via Firebase / Google OAuth popup
   */
  const handleRealGoogleLogin = async (role: UserRole, targetUnitId?: string, actionKey: string = 'google-auth') => {
    setAuthError(null);
    setIsLoading(true);
    setLoadingAction(actionKey);

    try {
      // 1. Launch real Google OAuth popup
      const googleUser = await signInWithGooglePopup();
      const authenticatedEmail = googleUser.email.toLowerCase().trim();

      // 2. STRICT SECURITY GATE: GESTÃO CENTRAL (SERMAC)
      if (role === 'SERMAC_CENTRAL') {
        if (!isCentralSermacEmailAuthorized(authenticatedEmail)) {
          // Immediately sign out from Google Firebase to revoke session
          await signOutGoogle();

          setAuthError({
            email: authenticatedEmail,
            message: `A conta Google autenticada ("${authenticatedEmail}") NÃO possui autorização para o perfil de Gestão Central (SERMAC).\n\nO acesso à Coordenação Central é estritamente restrito aos e-mails homologados pela Secretaria de Saúde (SMS Recife). Como você está logado no Google com uma conta não autorizada, o seu acesso foi bloqueado.`,
            isAccessDenied: true
          });
          setIsLoading(false);
          setLoadingAction(null);
          return;
        }

        // Homologated Gestor Central
        const matched = AUTHORIZED_SERMAC_USERS.find(u => u.email.toLowerCase() === authenticatedEmail);
        const centralUser: AuthUser = matched ? {
          ...matched,
          email: authenticatedEmail,
          photoUrl: googleUser.photoUrl || matched.photoUrl,
          authProvider: 'google'
        } : {
          id: `usr-sermac-${authenticatedEmail.replace(/[^a-z0-9]/g, '')}`,
          name: googleUser.name || 'Gestor(a) Central SERMAC',
          email: authenticatedEmail,
          role: 'SERMAC_CENTRAL',
          registrationNumber: 'SMS-REC-2026',
          jobTitle: 'Gestão Central de Educação Permanente • SERMAC',
          avatarInitials: (googleUser.name || authenticatedEmail).substring(0, 2).toUpperCase(),
          photoUrl: googleUser.photoUrl,
          authProvider: 'google'
        };

        setIsLoading(false);
        setLoadingAction(null);
        onLoginSuccess(centralUser);
        return;
      }

      // 3. NÚCLEO NEPS - UNIDADE
      if (role === 'NEPS_UNIT') {
        const currentUnit = units.find(u => u.id === (targetUnitId || selectedUnitId)) || units[0];
        const matched = DEFAULT_NEPS_USERS.find(u => u.unitId === currentUnit.id);

        const nepsUser: AuthUser = {
          id: matched?.id || `usr-neps-${currentUnit.id}`,
          name: googleUser.name || currentUnit.coordinatorName || 'Coordenação NEPS',
          email: authenticatedEmail,
          role: 'NEPS_UNIT',
          registrationNumber: 'COREN/CRM-PE',
          unitId: currentUnit.id,
          unitName: currentUnit.name,
          jobTitle: `Coordenação NEPS • ${currentUnit.name}`,
          avatarInitials: (googleUser.name || currentUnit.coordinatorName || 'NE').substring(0, 2).toUpperCase(),
          photoUrl: googleUser.photoUrl,
          authProvider: 'google'
        };

        setIsLoading(false);
        setLoadingAction(null);
        onLoginSuccess(nepsUser, currentUnit.id);
        return;
      }

      // 4. PORTAL DO PARTICIPANTE
      const currentUnit = units.find(u => u.id === (targetUnitId || participantUnitId)) || units[0];
      const partUser: AuthUser = {
        ...DEFAULT_PARTICIPANT_USER,
        name: googleUser.name || 'Profissional de Saúde',
        email: authenticatedEmail,
        registrationNumber: 'SUS-PE-2026',
        unitId: currentUnit.id,
        unitName: currentUnit.name,
        avatarInitials: (googleUser.name || 'PS').substring(0, 2).toUpperCase(),
        photoUrl: googleUser.photoUrl,
        authProvider: 'google'
      };

      setIsLoading(false);
      setLoadingAction(null);
      onLoginSuccess(partUser, currentUnit.id);

    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setIsLoading(false);
      setLoadingAction(null);

      // If user closed the popup or popup was blocked
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError({
          message: 'A janela de autenticação da Google foi fechada antes de concluir o login. Clique no botão novamente para entrar.',
          isAccessDenied: false
        });
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError({
          message: 'O pop-up de login da Google foi bloqueado pelo seu navegador. Por favor, permita pop-ups para este site e tente novamente.',
          isAccessDenied: false
        });
      } else {
        setAuthError({
          message: err.message || 'Falha ao autenticar com a Google. Verifique sua conexão e tente novamente.',
          isAccessDenied: false
        });
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

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Google OAuth 2.0 Ativo
            </span>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col justify-center">
        
        {/* Title & Guidance Banner */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Autenticação Oficial com a Conta Google
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Portal Institucional de Acesso
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Clique no botão do perfil desejado para abrir a janela oficial da Google. O sistema verifica o e-mail real da conta em que você está conectado no navegador e autoriza somente os gestores homologados.
          </p>
        </div>

        {/* SECURITY ALERT / REFUSAL BOX */}
        {authError && (
          <div className={`max-w-3xl mx-auto w-full mb-8 p-5 rounded-2xl border-2 shadow-2xl animate-fadeIn ${
            authError.isAccessDenied 
              ? 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-rose-950/60' 
              : 'bg-amber-950/80 border-amber-500 text-amber-100 shadow-amber-950/60'
          }`}>
            <div className="flex items-start gap-4">
              {authError.isAccessDenied ? (
                <div className="w-12 h-12 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center shrink-0">
                  <UserX className="w-7 h-7 text-rose-400" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-amber-600/30 border border-amber-500/50 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-7 h-7 text-amber-400" />
                </div>
              )}
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                    {authError.isAccessDenied ? 'ACESSO BLOQUEADO — CONTA NÃO HOMOLOGADA' : 'Aviso de Autenticação'}
                  </h4>
                  {authError.email && (
                    <span className="px-2.5 py-0.5 bg-rose-500/30 border border-rose-500/40 rounded-full font-mono text-[11px] text-rose-200">
                      {authError.email}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-200">
                  {authError.message}
                </p>

                {authError.isAccessDenied && (
                  <div className="pt-2 mt-2 border-t border-rose-500/30 text-xs text-rose-200/90 space-y-1">
                    <span className="font-bold text-white">Como obter acesso à Gestão Central:</span>
                    <p className="text-[11px]">
                      No pop-up da Google, selecione ou adicione uma das contas autorizadas pela Coordenação (ex: <span className="font-mono font-semibold text-white">getulio.batista@ufpe.br</span> ou <span className="font-mono font-semibold text-white">getvb98@gmail.com</span>).
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TRACER 3-PILLAR PROFILE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
          
          {/* ============================================================ */}
          {/* PILLAR 1: GESTÃO CENTRAL - SERMAC */}
          {/* ============================================================ */}
          <div className="bg-slate-900/90 border-2 border-blue-500/50 hover:border-blue-400 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-xl shadow-blue-950/40 relative group">
            
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

              {/* Requirement Box */}
              <div className="mt-5 p-3.5 bg-slate-950/90 rounded-xl border border-blue-500/30 text-xs space-y-2">
                <div className="flex items-center gap-2 text-blue-300 font-semibold text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Acesso Restrito: Validação de E-mail Google</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ao clicar, a Google abrirá a tela oficial para validar sua conta ativa. Contas não homologadas pela SMS Recife terão o acesso <strong>bloqueado</strong> automaticamente.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono space-y-0.5">
                  <div className="text-emerald-400 font-sans font-semibold">Contas autorizadas:</div>
                  <div>• getulio.batista@ufpe.br</div>
                  <div>• getvb98@gmail.com</div>
                  <div>• neps.ggai@gmail.com</div>
                  <div>• antonio.andrade@recife.pe.gov.br</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleRealGoogleLogin('SERMAC_CENTRAL', undefined, 'sermac-google')}
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading && loadingAction === 'sermac-google' ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Autenticando com a Google...</span>
                  </span>
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4" />
                    <span>Entrar com a Conta Google (Central)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>

          {/* ============================================================ */}
          {/* PILLAR 2: NÚCLEOS NEPS - UNIDADE */}
          {/* ============================================================ */}
          <div className="bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-xl shadow-emerald-950/20 relative group">
            
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
                onClick={() => handleRealGoogleLogin('NEPS_UNIT', currentSelectedUnit.id, 'neps-google')}
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading && loadingAction === 'neps-google' ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Autenticando com a Google...</span>
                  </span>
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4" />
                    <span>Entrar com a Conta Google (Unidade)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>

          {/* ============================================================ */}
          {/* PILLAR 3: PORTAL DO PARTICIPANTE */}
          {/* ============================================================ */}
          <div className="bg-slate-900/90 border border-purple-500/40 hover:border-purple-400 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-xl shadow-purple-950/20 relative group">
            
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

              {/* Participant info selector */}
              <div className="mt-5 space-y-3">
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
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400">
                  <p className="text-[11px]">
                    Seu nome e e-mail serão obtidos diretamente da sua conta Google ao autenticar.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleRealGoogleLogin('PARTICIPANT', participantUnitId, 'participant-google')}
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading && loadingAction === 'participant-google' ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Autenticando com a Google...</span>
                  </span>
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4" />
                    <span>Entrar com a Conta Google (Participante)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

        {/* SECURITY & RBAC ADVISORY */}
        <div className="max-w-4xl mx-auto w-full mt-10 p-4 bg-slate-900/70 border border-slate-800/80 rounded-2xl flex items-center gap-3.5 text-xs text-slate-400">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
          <div className="space-y-0.5">
            <strong className="text-slate-200 font-semibold block">Protocolo de Segurança e Controle de Acesso por Papéis (RBAC)</strong>
            <p className="text-[11px] text-slate-400">
              O sistema NEPS-SERMAC integra autenticação real com a Google. Tentativas de acesso à Gestão Central com contas não autorizadas são bloqueadas em tempo real.
            </p>
          </div>
        </div>

      </main>

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
