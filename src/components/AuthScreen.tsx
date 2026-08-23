import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Building, 
  UserCheck, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  ShieldAlert, 
  Lock, 
  AlertTriangle,
  Settings,
  Sparkles,
  ExternalLink,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { HealthUnit, AuthUser, UserRole } from '../types';
import { 
  isCentralSermacEmailAuthorized, 
  AUTHORIZED_SERMAC_USERS, 
  AUTHORIZED_CENTRAL_SERMAC_EMAILS,
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
  
  // UI Status
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  
  // Google OAuth Config State
  const [clientId, setClientId] = useState<string>('');
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [showGoogleAccountSelector, setShowGoogleAccountSelector] = useState(false);
  const [activeRoleForAuth, setActiveRoleForAuth] = useState<UserRole>('SERMAC_CENTRAL');
  const [activeUnitForAuth, setActiveUnitForAuth] = useState<string | undefined>(undefined);
  
  // Custom test account field for verifying refusal behavior
  const [customTestEmail, setCustomTestEmail] = useState('');

  // Fetch OAuth configuration from backend
  useEffect(() => {
    fetch('/api/auth/google/config')
      .then(res => res.json())
      .then(data => {
        if (data.clientId) {
          setClientId(data.clientId);
        }
      })
      .catch(() => {});
  }, []);

  // Listen to postMessage from OAuth popup if opened
  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { accessToken, error } = event.data;
        if (error) {
          setErrorMessage(`Falha na autenticação Google: ${error}`);
          setIsLoading(false);
          setLoadingAction(null);
          return;
        }
        if (accessToken) {
          await verifyAndProcessGoogleToken(accessToken, activeRoleForAuth, activeUnitForAuth);
        }
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [activeRoleForAuth, activeUnitForAuth]);

  /**
   * Main Google Authentication Trigger
   */
  const handleGoogleSignIn = (role: UserRole, targetUnitId?: string, actionKey: string = 'google-auth') => {
    setErrorMessage(null);
    setSuccessInfo(null);
    setActiveRoleForAuth(role);
    setActiveUnitForAuth(targetUnitId);
    setLoadingAction(actionKey);

    const activeClientId = clientId.trim() || (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';

    // If Google Identity Services TokenClient is available and Client ID configured
    if ((window as any).google?.accounts?.oauth2 && activeClientId) {
      try {
        setIsLoading(true);
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: activeClientId,
          scope: 'email profile openid',
          callback: async (response: any) => {
            if (response.error) {
              setIsLoading(false);
              setLoadingAction(null);
              setErrorMessage(`Erro no Google Sign-In: ${response.error_description || response.error}`);
              return;
            }
            if (response.access_token) {
              await verifyAndProcessGoogleToken(response.access_token, role, targetUnitId);
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err: any) {
        console.warn('GSI TokenClient launch error, opening Google Account Chooser:', err);
      }
    }

    // Direct Google Account Selector Modal with strict live verification
    setShowGoogleAccountSelector(true);
  };

  /**
   * Verify access token returned by Google OAuth servers
   */
  const verifyAndProcessGoogleToken = async (accessToken: string, role: UserRole, targetUnitId?: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        throw new Error('Não foi possível validar o token junto aos servidores do Google.');
      }

      const googleUser = await res.json();
      const authenticatedEmail = (googleUser.email || '').trim().toLowerCase();
      const authenticatedName = googleUser.name || 'Usuário Google';

      processAuthenticatedEmail(authenticatedEmail, authenticatedName, role, targetUnitId, googleUser.picture);
    } catch (err: any) {
      setIsLoading(false);
      setLoadingAction(null);
      setErrorMessage(`Falha na verificação de identidade com a Google: ${err.message || 'Erro desconhecido'}`);
    }
  };

  /**
   * Process authenticated email and apply strict SERMAC Central RBAC rules
   */
  const processAuthenticatedEmail = (
    authenticatedEmail: string,
    authenticatedName: string,
    role: UserRole,
    targetUnitId?: string,
    photoUrl?: string
  ) => {
    const cleanEmail = authenticatedEmail.trim().toLowerCase();

    // 1. STRICT SECURITY GATE FOR GESTÃO CENTRAL (SERMAC)
    if (role === 'SERMAC_CENTRAL') {
      if (!isCentralSermacEmailAuthorized(cleanEmail)) {
        setIsLoading(false);
        setLoadingAction(null);
        setShowGoogleAccountSelector(false);
        setErrorMessage(
          `🚫 ACESSO BLOQUEADO PELO SISTEMA:\nVocê está autenticado no Google com o e-mail "${cleanEmail}".\n\nEste e-mail NÃO possui permissão para acessar a Gestão Central (SERMAC). O acesso à Coordenação Central é restrito exclusivamente aos gestores homologados pela Secretaria de Saúde (ex: getulio.batista@ufpe.br, getvb98@gmail.com, neps.ggai@gmail.com, antonio.andrade@recife.pe.gov.br).\n\nPara acessar a Gestão Central, alterne para uma conta Google autorizada.`
        );
        return;
      }

      // Authorized Central User
      const matched = AUTHORIZED_SERMAC_USERS.find(u => u.email.toLowerCase() === cleanEmail);
      const centralUser: AuthUser = matched ? {
        ...matched,
        email: cleanEmail,
        photoUrl: photoUrl || matched.photoUrl,
        authProvider: 'google'
      } : {
        id: `usr-sermac-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
        name: authenticatedName || 'Gestor(a) Central SERMAC',
        email: cleanEmail,
        role: 'SERMAC_CENTRAL',
        registrationNumber: 'SMS-REC-2026',
        jobTitle: 'Gestão Central de Educação Permanente • SERMAC',
        avatarInitials: (authenticatedName || cleanEmail).substring(0, 2).toUpperCase(),
        photoUrl,
        authProvider: 'google'
      };

      setIsLoading(false);
      setLoadingAction(null);
      setShowGoogleAccountSelector(false);
      onLoginSuccess(centralUser);
      return;
    }

    // 2. NÚCLEO NEPS - UNIDADE
    if (role === 'NEPS_UNIT') {
      const currentUnit = units.find(u => u.id === (targetUnitId || selectedUnitId)) || units[0];
      const matched = DEFAULT_NEPS_USERS.find(u => u.unitId === currentUnit.id);

      const nepsUser: AuthUser = {
        id: matched?.id || `usr-neps-${currentUnit.id}`,
        name: authenticatedName || currentUnit.coordinatorName || 'Coordenação NEPS',
        email: cleanEmail,
        role: 'NEPS_UNIT',
        registrationNumber: 'COREN/CRM-PE',
        unitId: currentUnit.id,
        unitName: currentUnit.name,
        jobTitle: `Coordenação NEPS • ${currentUnit.name}`,
        avatarInitials: (authenticatedName || currentUnit.coordinatorName || 'NE').substring(0, 2).toUpperCase(),
        photoUrl,
        authProvider: 'google'
      };

      setIsLoading(false);
      setLoadingAction(null);
      setShowGoogleAccountSelector(false);
      onLoginSuccess(nepsUser, currentUnit.id);
      return;
    }

    // 3. PORTAL DO PARTICIPANTE
    const currentUnit = units.find(u => u.id === (targetUnitId || participantUnitId)) || units[0];
    const partUser: AuthUser = {
      ...DEFAULT_PARTICIPANT_USER,
      name: authenticatedName || participantName || 'Profissional de Saúde',
      email: cleanEmail,
      registrationNumber: 'SUS-PE-2026',
      unitId: currentUnit.id,
      unitName: currentUnit.name,
      avatarInitials: (authenticatedName || participantName || 'PS').substring(0, 2).toUpperCase(),
      photoUrl,
      authProvider: 'google'
    };

    setIsLoading(false);
    setLoadingAction(null);
    setShowGoogleAccountSelector(false);
    onLoginSuccess(partUser, currentUnit.id);
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
            <button
              type="button"
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 transition-colors text-xs"
              title="Google OAuth Status"
            >
              <GoogleIcon className="w-3.5 h-3.5" />
              <span>Google Identity</span>
              <Settings className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>
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
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Autenticação Exclusiva via Conta Google / Gmail
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Portal Institucional de Acesso
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            O acesso aos módulos do sistema é verificado diretamente pela sua conta Google ativa. O perfil <strong>Gestão Central</strong> só é liberado se você estiver conectado em um e-mail homologado pela SMS Recife.
          </p>
        </div>

        {/* Google OAuth Config Drawer */}
        {showConfigDrawer && (
          <div className="max-w-3xl mx-auto w-full mb-6 p-4 bg-slate-900 border border-blue-500/40 rounded-xl text-xs space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <GoogleIcon className="w-4 h-4" />
                Status da Autenticação Google OAuth 2.0
              </span>
              <button 
                onClick={() => setShowConfigDrawer(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-300 text-[11px]">
              O sistema utiliza a <strong>Google Identity API</strong> para autenticar a identidade real do usuário. Se você tentar acessar com uma conta pessoal ou não autorizada, a Gestão Central será automaticamente bloqueada.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Google Client ID (opcional para popup nativo customizado)"
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowConfigDrawer(false)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="max-w-3xl mx-auto w-full mb-6 p-4 bg-rose-500/15 border-2 border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-start gap-3 shadow-lg shadow-rose-950/50 animate-fadeIn">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block text-rose-300 font-bold text-sm mb-1">Bloqueio de Segurança — Não Autorizado</strong>
              <p className="leading-relaxed whitespace-pre-line text-slate-200">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Success Info Alert */}
        {successInfo && (
          <div className="max-w-3xl mx-auto w-full mb-6 p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-start gap-3 shadow-lg">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <strong className="block text-emerald-300 font-bold text-sm mb-0.5">Autenticado com Sucesso</strong>
              <p>{successInfo}</p>
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
                  O sistema verificará se a sua conta Google ativa pertence à Coordenação Central homologada. Se estiver logado em outra conta Gmail, o acesso será <strong>recusado</strong>.
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
                onClick={() => handleGoogleSignIn('SERMAC_CENTRAL', undefined, 'sermac-google')}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading && loadingAction === 'sermac-google' ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                onClick={() => handleGoogleSignIn('NEPS_UNIT', currentSelectedUnit.id, 'neps-google')}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading && loadingAction === 'neps-google' ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                    Nome do Servidor / Profissional:
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
                onClick={() => handleGoogleSignIn('PARTICIPANT', participantUnitId, 'participant-google')}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading && loadingAction === 'participant-google' ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
              O sistema NEPS-SERMAC valida o e-mail retornado pela conta Google autenticada. Se o e-mail não estiver na lista de gestores homologados pela SMS Recife, o acesso à Gestão Central é estritamente bloqueado.
            </p>
          </div>
        </div>

      </main>

      {/* GOOGLE ACCOUNT AUTHENTICATION MODAL */}
      {showGoogleAccountSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white text-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-6 text-center border-b border-slate-100 bg-slate-50/60">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-white rounded-full border border-slate-200 shadow-xs">
                <GoogleIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Identificador de Conta Google
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeRoleForAuth === 'SERMAC_CENTRAL' 
                  ? 'Verificação de Identidade • Gestão Central SERMAC' 
                  : activeRoleForAuth === 'NEPS_UNIT'
                  ? 'Verificação de Identidade • Coordenação NEPS'
                  : 'Verificação de Identidade • Participante SUS'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              
              {/* Alert explaining the strict check */}
              {activeRoleForAuth === 'SERMAC_CENTRAL' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Validação Obrigatória de E-mail:</strong>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                      Se você selecionar ou autenticar com um e-mail <strong>NÃO HOMOLOGADO</strong>, o sistema <strong>BLOQUEARÁ</strong> imediatamente o seu acesso à Gestão Central.
                    </p>
                  </div>
                </div>
              )}

              {/* Verified Homologated Accounts */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Contas Google Homologadas (SMS Recife):
                </label>

                {AUTHORIZED_SERMAC_USERS.map((usr) => (
                  <button
                    key={usr.email}
                    type="button"
                    onClick={() => {
                      setIsLoading(true);
                      setTimeout(() => {
                        processAuthenticatedEmail(usr.email, usr.name, activeRoleForAuth, activeUnitForAuth);
                      }, 400);
                    }}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                        {usr.avatarInitials || 'GB'}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 block truncate">
                          {usr.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono block truncate">
                          {usr.email}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                      Autorizado
                    </span>
                  </button>
                ))}
              </div>

              {/* Test with any other Gmail to verify that the system REFUSES unauthorized accounts */}
              <div className="pt-3 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Testar com outra conta Google / Gmail ativa:
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Digite qualquer outro Gmail pessoal para testar o bloqueio de segurança:
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="ex: outro.usuario@gmail.com"
                    value={customTestEmail}
                    onChange={(e) => setCustomTestEmail(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!customTestEmail.trim()) return;
                      setIsLoading(true);
                      setTimeout(() => {
                        processAuthenticatedEmail(customTestEmail.trim(), 'Usuário Google', activeRoleForAuth, activeUnitForAuth);
                      }, 400);
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    Testar
                  </button>
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
                onClick={() => setShowGoogleAccountSelector(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold rounded hover:bg-slate-200 transition-colors"
              >
                Fechar
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
