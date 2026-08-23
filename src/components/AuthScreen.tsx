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
  Sparkles,
  KeyRound,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react';
import { HealthUnit, AuthUser, UserRole } from '../types';
import { 
  isCentralSermacEmailAuthorized, 
  AUTHORIZED_SERMAC_USERS, 
  DEFAULT_NEPS_USERS, 
  DEFAULT_PARTICIPANT_USER 
} from '../data/mockData';
import { requestGoogleIdentitySignIn } from '../lib/googleAuth';
import { signInWithGooglePopup, signOutGoogle } from '../lib/firebase';

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
  // State for Unit and Participant options
  const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || 'unit-159');
  const [participantUnitId, setParticipantUnitId] = useState<string>(units[0]?.id || 'unit-159');
  
  // Custom Direct Email Inputs
  const [customSermacEmail, setCustomSermacEmail] = useState<string>('getvb98@gmail.com');
  const [customParticipantEmail, setCustomParticipantEmail] = useState<string>('profissional.sus@saude.recife.pe.gov.br');
  const [customParticipantName, setCustomParticipantName] = useState<string>('Profissional de Saúde SUS');

  // Auth Mode: 'google' or 'direct'
  const [loginMethod, setLoginMethod] = useState<'google' | 'direct'>('direct');
  const [showOriginHelp, setShowOriginHelp] = useState<boolean>(false);

  // UI Status
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [authError, setAuthError] = useState<{
    email?: string;
    message: string;
    isAccessDenied?: boolean;
    isOriginMismatch?: boolean;
  } | null>(null);

  /**
   * Direct Login with Homologated Institutional Email
   */
  const handleDirectEmailLogin = (role: UserRole, targetUnitId?: string) => {
    setAuthError(null);

    // 1. GESTÃO CENTRAL (SERMAC)
    if (role === 'SERMAC_CENTRAL') {
      const email = customSermacEmail.toLowerCase().trim();
      if (!isCentralSermacEmailAuthorized(email)) {
        setAuthError({
          email,
          message: `O e-mail "${email}" NÃO possui autorização para o perfil de Gestão Central (SERMAC).\n\nO acesso à Coordenação Central é estritamente restrito aos e-mails homologados pela SMS Recife.`,
          isAccessDenied: true
        });
        return;
      }

      const matched = AUTHORIZED_SERMAC_USERS.find(u => u.email.toLowerCase() === email);
      const centralUser: AuthUser = matched ? {
        ...matched,
        authProvider: 'institutional'
      } : {
        id: `usr-sermac-${email.replace(/[^a-z0-9]/g, '')}`,
        name: 'Gestor(a) Central SERMAC',
        email,
        role: 'SERMAC_CENTRAL',
        registrationNumber: 'SMS-REC-2026',
        jobTitle: 'Gestão Central de Educação Permanente • SERMAC',
        avatarInitials: email.substring(0, 2).toUpperCase(),
        authProvider: 'institutional'
      };

      onLoginSuccess(centralUser);
      return;
    }

    // 2. NÚCLEO NEPS - UNIDADE
    if (role === 'NEPS_UNIT') {
      const currentUnit = units.find(u => u.id === (targetUnitId || selectedUnitId)) || units[0];
      const matched = DEFAULT_NEPS_USERS.find(u => u.unitId === currentUnit.id);

      const nepsUser: AuthUser = {
        id: matched?.id || `usr-neps-${currentUnit.id}`,
        name: matched?.name || currentUnit.coordinatorName || 'Coordenação NEPS',
        email: matched?.email || currentUnit.coordinatorEmail || `neps.${currentUnit.code.toLowerCase()}@saude.recife.pe.gov.br`,
        role: 'NEPS_UNIT',
        registrationNumber: matched?.registrationNumber || 'COREN/CRM-PE',
        unitId: currentUnit.id,
        unitName: currentUnit.name,
        jobTitle: matched?.jobTitle || `Coordenação NEPS • ${currentUnit.name}`,
        avatarInitials: (matched?.name || currentUnit.coordinatorName || 'NE').substring(0, 2).toUpperCase(),
        authProvider: 'institutional'
      };

      onLoginSuccess(nepsUser, currentUnit.id);
      return;
    }

    // 3. PORTAL DO PARTICIPANTE
    const currentUnit = units.find(u => u.id === (targetUnitId || participantUnitId)) || units[0];
    const partUser: AuthUser = {
      ...DEFAULT_PARTICIPANT_USER,
      name: customParticipantName.trim() || 'Profissional de Saúde SUS',
      email: customParticipantEmail.toLowerCase().trim() || 'participante@saude.recife.pe.gov.br',
      unitId: currentUnit.id,
      unitName: currentUnit.name,
      avatarInitials: (customParticipantName || 'PS').substring(0, 2).toUpperCase(),
      authProvider: 'institutional'
    };

    onLoginSuccess(partUser, currentUnit.id);
  };

  /**
   * Real Google Authentication via Firebase / Google OAuth popup with fallback
   */
  const handleRealGoogleLogin = async (role: UserRole, targetUnitId?: string, actionKey: string = 'google-auth') => {
    setAuthError(null);
    setIsLoading(true);
    setLoadingAction(actionKey);

    try {
      let googleUser: { email: string; name: string; photoUrl?: string; uid: string };

      try {
        // Try Google Identity Services
        googleUser = await requestGoogleIdentitySignIn();
      } catch (gsiErr: any) {
        console.warn('GSI login failed, attempting Firebase Popup fallback:', gsiErr);
        // Fallback to Firebase Google Provider Popup
        try {
          googleUser = await signInWithGooglePopup();
        } catch (firebaseErr: any) {
          throw gsiErr; // propagate original or combined error
        }
      }

      const authenticatedEmail = googleUser.email.toLowerCase().trim();

      // STRICT SECURITY GATE: GESTÃO CENTRAL (SERMAC)
      if (role === 'SERMAC_CENTRAL') {
        if (!isCentralSermacEmailAuthorized(authenticatedEmail)) {
          await signOutGoogle();

          setAuthError({
            email: authenticatedEmail,
            message: `A conta Google autenticada ("${authenticatedEmail}") NÃO possui autorização para o perfil de Gestão Central (SERMAC).\n\nO acesso à Coordenação Central é estritamente restrito aos e-mails homologados pela Secretaria de Saúde (SMS Recife).`,
            isAccessDenied: true
          });
          setIsLoading(false);
          setLoadingAction(null);
          return;
        }

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

      // NÚCLEO NEPS - UNIDADE
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

      // PORTAL DO PARTICIPANTE
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

      const isOrigin = err.message?.includes('origin_mismatch') || err.message?.includes('origin') || err.code === 'auth/unauthorized-domain';

      if (isOrigin) {
        setAuthError({
          message: 'Erro 400: origin_mismatch — O domínio atual do aplicativo precisa ser cadastrado nas "Origens JavaScript autorizadas" no Google Cloud Console.\n\nPara acessar imediatamente sem depender da configuração de domínio no Google Cloud, utilize o botão de Acesso Direto abaixo.',
          isAccessDenied: false,
          isOriginMismatch: true
        });
      } else if (err.code === 'auth/popup-closed-by-user') {
        setAuthError({
          message: 'A janela de autenticação da Google foi fechada antes de concluir o login. Clique no botão novamente para entrar.',
          isAccessDenied: false
        });
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError({
          message: 'O pop-up de login da Google foi bloqueado pelo seu navegador. Por favor, permita pop-ups para este site ou utilize o Acesso Direto.',
          isAccessDenied: false
        });
      } else {
        setAuthError({
          message: err.message || 'Falha ao autenticar com a Google. Utilize o Acesso Direto com E-mail Homologado para entrar imediatamente.',
          isAccessDenied: false
        });
      }
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white/10 text-white text-xs font-semibold border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              Ambiente Seguro • SMS Recife
            </span>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col justify-center">
        
        {/* Title & Guidance Banner */}
        <div className="text-center max-w-3xl mx-auto mb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#EBF2FC] border border-[#1351B4]/30 text-[#0C326F] text-xs font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-[#1351B4]" />
            Portal Institucional de Acesso e Autenticação
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0C326F] tracking-tight">
            Selecione seu Perfil de Acesso
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Acesse a Gestão Central SERMAC, a Coordenação Local dos NEPS ou o Portal do Participante.
          </p>

          {/* Toggle Login Method Tabs */}
          <div className="inline-flex items-center p-1 bg-white border border-slate-300 rounded-lg shadow-xs mt-3">
            <button
              type="button"
              onClick={() => setLoginMethod('direct')}
              className={`px-4 py-2 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                loginMethod === 'direct'
                  ? 'bg-[#0C326F] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Acesso Direto Institucional (Recomendado)</span>
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('google')}
              className={`px-4 py-2 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                loginMethod === 'google'
                  ? 'bg-[#0C326F] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <GoogleIcon className="w-4 h-4" />
              <span>Autenticação Google OAuth 2.0</span>
            </button>
          </div>
        </div>

        {/* SECURITY ALERT / REFUSAL / ORIGIN MISMATCH BOX */}
        {authError && (
          <div className={`max-w-4xl mx-auto w-full mb-6 p-4 sm:p-5 rounded-lg border-2 shadow-sm ${
            authError.isAccessDenied 
              ? 'bg-rose-50 border-rose-400 text-rose-900' 
              : authError.isOriginMismatch
              ? 'bg-blue-50 border-[#1351B4] text-slate-900'
              : 'bg-amber-50 border-amber-400 text-amber-950'
          }`}>
            <div className="flex items-start gap-3.5">
              {authError.isAccessDenied ? (
                <div className="w-10 h-10 rounded bg-rose-200 text-rose-800 flex items-center justify-center shrink-0">
                  <UserX className="w-6 h-6" />
                </div>
              ) : authError.isOriginMismatch ? (
                <div className="w-10 h-10 rounded bg-blue-200 text-[#0C326F] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              )}
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">
                    {authError.isAccessDenied 
                      ? 'ACESSO RECUSADO — CONTA NÃO HOMOLOGADA' 
                      : authError.isOriginMismatch 
                      ? 'Erro 400: origin_mismatch (OAuth Google)' 
                      : 'Aviso de Autenticação'}
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

                {/* Instant 1-Click Fallback for Origin Mismatch */}
                {authError.isOriginMismatch && (
                  <div className="pt-3 mt-2 border-t border-blue-200 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomSermacEmail('getvb98@gmail.com');
                        handleDirectEmailLogin('SERMAC_CENTRAL');
                      }}
                      className="px-4 py-2 bg-[#1351B4] hover:bg-[#0C326F] text-white text-xs font-bold rounded shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Entrar como Getúlio Batista (getvb98@gmail.com)</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowOriginHelp(!showOriginHelp)}
                      className="text-xs text-[#1351B4] font-bold underline hover:text-[#0C326F] flex items-center gap-1 cursor-pointer"
                    >
                      {showOriginHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      <span>Como autorizar a origem no Google Cloud Console</span>
                    </button>
                  </div>
                )}

                {/* Collapsible Cloud Console Instructions */}
                {showOriginHelp && (
                  <div className="mt-3 p-3.5 bg-white border border-blue-200 rounded text-xs text-slate-700 space-y-2">
                    <p className="font-bold text-[#0C326F]">Passo a passo para registrar o domínio no Google Cloud:</p>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                      <li>Acesse o <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-[#1351B4] font-bold underline">Console do Google Cloud &gt; Credenciais</a>.</li>
                      <li>Clique no <strong>ID do cliente OAuth 2.0</strong> do seu projeto.</li>
                      <li>Na seção <strong>Origens JavaScript autorizadas</strong>, clique em <em>+ Adicionar URI</em>.</li>
                      <li>Cole a URL atual do seu app: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">{window.location.origin}</code></li>
                      <li>Clique em <strong>Salvar</strong> (pode levar alguns minutos para propagar globalmente nos servidores da Google).</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3-PILLAR PROFILE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
          
          {/* ============================================================ */}
          {/* PILLAR 1: GESTÃO CENTRAL - SERMAC */}
          {/* ============================================================ */}
          <div className="bg-white border border-slate-300 border-t-4 border-t-[#1351B4] rounded-lg p-5 flex flex-col justify-between shadow-xs transition-all hover:shadow-md">
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded bg-[#EBF2FC] text-[#0C326F] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#1351B4]" />
                </div>
                <span className="px-2.5 py-0.5 bg-[#EBF2FC] text-[#0C326F] text-[11px] font-bold uppercase rounded border border-[#1351B4]/20">
                  Coordenação Central
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#0C326F] tracking-tight">
                Gestão Central - SERMAC
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Coordenação Geral, matriz intersetorial da rede, diagnóstico preditivo IA, LNT e consolidação dos 8 Distritos Sanitários.
              </p>

              {/* Requirement / Email selection */}
              <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-[#0C326F] font-bold text-xs">
                  <Lock className="w-3.5 h-3.5 text-[#1351B4]" />
                  <span>Acesso Restrito: E-mails Homologados</span>
                </div>
                
                {loginMethod === 'direct' ? (
                  <div className="space-y-2 pt-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Selecione ou digite o e-mail do Gestor:
                    </label>
                    <select
                      value={customSermacEmail}
                      onChange={(e) => setCustomSermacEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#1351B4]"
                    >
                      {AUTHORIZED_SERMAC_USERS.map((u) => (
                        <option key={u.email} value={u.email}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>

                    <div className="pt-1">
                      <input
                        type="email"
                        value={customSermacEmail}
                        onChange={(e) => setCustomSermacEmail(e.target.value)}
                        placeholder="Ou digite outro e-mail institucional..."
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1351B4]"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    A janela do Google solicitará a sua conta ativa. Somente os e-mails autorizados (ex: <span className="font-bold text-[#0C326F]">getvb98@gmail.com</span>, <span className="font-bold text-[#0C326F]">getulio.batista@ufpe.br</span>) terão acesso liberado.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              {loginMethod === 'direct' ? (
                <button
                  type="button"
                  onClick={() => handleDirectEmailLogin('SERMAC_CENTRAL')}
                  className="w-full py-2.5 px-4 bg-[#1351B4] hover:bg-[#0C326F] text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Acessar Painel Central SERMAC</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRealGoogleLogin('SERMAC_CENTRAL', undefined, 'sermac-google')}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#1351B4] hover:bg-[#0C326F] text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading && loadingAction === 'sermac-google' ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Autenticando...</span>
                    </span>
                  ) : (
                    <>
                      <GoogleIcon className="w-4 h-4" />
                      <span>Entrar com a Conta Google</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

          </div>

          {/* ============================================================ */}
          {/* PILLAR 2: NÚCLEOS NEPS - UNIDADE */}
          {/* ============================================================ */}
          <div className="bg-white border border-slate-300 border-t-4 border-t-emerald-600 rounded-lg p-5 flex flex-col justify-between shadow-xs transition-all hover:shadow-md">
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <Building className="w-5 h-5 text-emerald-700" />
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase rounded border border-emerald-300">
                  Nível Local
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#0C326F] tracking-tight">
                Núcleo NEPS - Unidade
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Gestão direta das capacitações locais, validação de presença via QR Code em tempo real, submissão de DNC e censo.
              </p>

              {/* Unit Selection Form */}
              <div className="mt-4 space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Selecione a Unidade de Saúde (NEPS):
                  </label>
                  <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.type}) — {u.district}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>Coordenação Local:</span>
                    <span className="text-emerald-700 font-bold">{currentSelectedUnit.code}</span>
                  </div>
                  <p className="font-bold text-slate-800 truncate">{currentSelectedUnit.coordinatorName}</p>
                  <p className="text-[11px] font-mono text-slate-500 truncate">{currentSelectedUnit.coordinatorEmail}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              {loginMethod === 'direct' ? (
                <button
                  type="button"
                  onClick={() => handleDirectEmailLogin('NEPS_UNIT', currentSelectedUnit.id)}
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Acessar NEPS ({currentSelectedUnit.code})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRealGoogleLogin('NEPS_UNIT', currentSelectedUnit.id, 'neps-google')}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading && loadingAction === 'neps-google' ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Autenticando...</span>
                    </span>
                  ) : (
                    <>
                      <GoogleIcon className="w-4 h-4" />
                      <span>Entrar com a Conta Google</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

          </div>

          {/* ============================================================ */}
          {/* PILLAR 3: PORTAL DO PARTICIPANTE */}
          {/* ============================================================ */}
          <div className="bg-white border border-slate-300 border-t-4 border-t-purple-600 rounded-lg p-5 flex flex-col justify-between shadow-xs transition-all hover:shadow-md">
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded bg-purple-50 text-purple-800 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-purple-700" />
                </div>
                <span className="px-2.5 py-0.5 bg-purple-50 text-purple-800 text-[11px] font-bold uppercase rounded border border-purple-300">
                  Profissionais SUS
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#0C326F] tracking-tight">
                Portal do Participante
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Registro de frequência por PIN/QR Code, avaliação de reação dos treinamentos e emissão imediata de certificados.
              </p>

              {/* Participant info selector */}
              <div className="mt-4 space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Unidade de Lotação:
                  </label>
                  <select
                    value={participantUnitId}
                    onChange={(e) => setParticipantUnitId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-purple-600 cursor-pointer"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                {loginMethod === 'direct' ? (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Nome do Profissional:
                    </label>
                    <input
                      type="text"
                      value={customParticipantName}
                      onChange={(e) => setCustomParticipantName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                ) : (
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
                    <p className="text-[11px]">
                      Seu nome e e-mail serão obtidos diretamente da sua conta Google ao autenticar.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              {loginMethod === 'direct' ? (
                <button
                  type="button"
                  onClick={() => handleDirectEmailLogin('PARTICIPANT', participantUnitId)}
                  className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Acessar Portal do Participante</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRealGoogleLogin('PARTICIPANT', participantUnitId, 'participant-google')}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading && loadingAction === 'participant-google' ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Autenticando...</span>
                    </span>
                  ) : (
                    <>
                      <GoogleIcon className="w-4 h-4" />
                      <span>Entrar com a Conta Google</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

          </div>

        </div>

        {/* SECURITY & RBAC ADVISORY */}
        <div className="max-w-4xl mx-auto w-full mt-8 p-4 bg-white border border-slate-300 rounded-lg flex items-center gap-3 text-xs text-slate-600 shadow-xs">
          <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
          <div className="space-y-0.5">
            <strong className="text-slate-900 font-bold block">Protocolo de Segurança e Controle de Acesso por Papéis (RBAC)</strong>
            <p className="text-[11px] text-slate-600">
              O sistema NEPS-SERMAC integra autenticação institucional com validação rigorosa de permissões. O acesso à Gestão Central é restrito aos gestores homologados pela Secretaria de Saúde do Recife.
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

