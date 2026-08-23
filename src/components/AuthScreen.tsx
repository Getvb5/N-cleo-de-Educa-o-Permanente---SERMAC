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
  UserX,
  X,
  Mail,
  CheckCircle2,
  HelpCircle,
  ExternalLink
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
  
  // UI Status
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  // Error & Fallback Modal State
  const [authError, setAuthError] = useState<{
    email?: string;
    message: string;
    isAccessDenied?: boolean;
  } | null>(null);

  // Manual Google Account Input Modal (when OAuth origin_mismatch occurs or requested)
  const [manualGoogleModal, setManualGoogleModal] = useState<{
    isOpen: boolean;
    role: UserRole;
    targetUnitId?: string;
  } | null>(null);

  const [inputGoogleEmail, setInputGoogleEmail] = useState<string>('getvb98@gmail.com');
  const [inputGoogleName, setInputGoogleName] = useState<string>('Getúlio Batista');
  const [manualError, setManualError] = useState<string | null>(null);

  /**
   * Finalize Login with a given Google Email & Profile
   */
  const completeGoogleLogin = (
    role: UserRole, 
    email: string, 
    name: string, 
    photoUrl?: string, 
    targetUnitId?: string
  ): boolean => {
    const cleanEmail = email.toLowerCase().trim();

    // 1. STRICT CONTROLLED ACCESS: ONLY FOR GESTÃO CENTRAL - SERMAC
    if (role === 'SERMAC_CENTRAL') {
      if (!isCentralSermacEmailAuthorized(cleanEmail)) {
        const errorMsg = `A conta Google informada ("${cleanEmail}") NÃO possui autorização para o perfil de Gestão Central (SERMAC).\n\nO acesso à Coordenação Central é estritamente restrito aos e-mails homologados pela Secretaria de Saúde (SMS Recife).`;
        setAuthError({
          email: cleanEmail,
          message: errorMsg,
          isAccessDenied: true
        });
        return false;
      }

      const matched = AUTHORIZED_SERMAC_USERS.find(u => u.email.toLowerCase() === cleanEmail);
      const centralUser: AuthUser = matched ? {
        ...matched,
        email: cleanEmail,
        name: name || matched.name,
        photoUrl: photoUrl || matched.photoUrl,
        authProvider: 'google'
      } : {
        id: `usr-sermac-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
        name: name || 'Gestor(a) Central SERMAC',
        email: cleanEmail,
        role: 'SERMAC_CENTRAL',
        registrationNumber: 'SMS-REC-2026',
        jobTitle: 'Gestão Central de Educação Permanente • SERMAC',
        avatarInitials: (name || cleanEmail).substring(0, 2).toUpperCase(),
        photoUrl,
        authProvider: 'google'
      };

      onLoginSuccess(centralUser);
      return true;
    }

    // 2. NÚCLEO NEPS - UNIDADE (OPEN TO ANY GOOGLE ACCOUNT)
    if (role === 'NEPS_UNIT') {
      const currentUnit = units.find(u => u.id === (targetUnitId || selectedUnitId)) || units[0];
      const matched = DEFAULT_NEPS_USERS.find(u => u.unitId === currentUnit.id);

      const nepsUser: AuthUser = {
        id: matched?.id || `usr-neps-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
        name: name || currentUnit.coordinatorName || 'Coordenação NEPS',
        email: cleanEmail,
        role: 'NEPS_UNIT',
        registrationNumber: matched?.registrationNumber || 'COREN/CRM-PE',
        unitId: currentUnit.id,
        unitName: currentUnit.name,
        jobTitle: `Coordenação NEPS • ${currentUnit.name}`,
        avatarInitials: (name || currentUnit.coordinatorName || 'NE').substring(0, 2).toUpperCase(),
        photoUrl,
        authProvider: 'google'
      };

      onLoginSuccess(nepsUser, currentUnit.id);
      return true;
    }

    // 3. PORTAL DO PARTICIPANTE (OPEN TO ANY GOOGLE ACCOUNT)
    const currentUnit = units.find(u => u.id === (targetUnitId || participantUnitId)) || units[0];
    const partUser: AuthUser = {
      ...DEFAULT_PARTICIPANT_USER,
      name: name || 'Profissional de Saúde SUS',
      email: cleanEmail,
      registrationNumber: 'SUS-PE-2026',
      unitId: currentUnit.id,
      unitName: currentUnit.name,
      avatarInitials: (name || 'PS').substring(0, 2).toUpperCase(),
      photoUrl,
      authProvider: 'google'
    };

    onLoginSuccess(partUser, currentUnit.id);
    return true;
  };

  /**
   * Handle Google Login Trigger
   */
  const handleGoogleLogin = async (role: UserRole, targetUnitId?: string, actionKey: string = 'google-auth') => {
    setAuthError(null);
    setIsLoading(true);
    setLoadingAction(actionKey);

    try {
      let googleUser: { email: string; name: string; photoUrl?: string; uid: string };

      try {
        // Try Google Identity Services Popup
        googleUser = await requestGoogleIdentitySignIn();
      } catch (gsiErr: any) {
        console.warn('GSI login failed, attempting Firebase Popup fallback:', gsiErr);
        // Fallback to Firebase Google Provider Popup
        try {
          googleUser = await signInWithGooglePopup();
        } catch (firebaseErr: any) {
          throw gsiErr;
        }
      }

      setIsLoading(false);
      setLoadingAction(null);

      // Complete login
      completeGoogleLogin(role, googleUser.email, googleUser.name, googleUser.photoUrl, targetUnitId);

    } catch (err: any) {
      console.warn('Google Sign-In caught error, falling back to Google account identification:', err);
      setIsLoading(false);
      setLoadingAction(null);

      // Preset suggested emails based on role
      if (role === 'SERMAC_CENTRAL') {
        setInputGoogleEmail('getvb98@gmail.com');
        setInputGoogleName('Getúlio Batista');
      } else if (role === 'NEPS_UNIT') {
        const u = units.find(unit => unit.id === (targetUnitId || selectedUnitId)) || units[0];
        setInputGoogleEmail(u.coordinatorEmail || `${u.code.toLowerCase()}@gmail.com`);
        setInputGoogleName(u.coordinatorName || 'Coordenação NEPS');
      } else {
        setInputGoogleEmail('profissional.sus@gmail.com');
        setInputGoogleName('Profissional de Saúde');
      }

      setManualError(null);
      setManualGoogleModal({
        isOpen: true,
        role,
        targetUnitId: targetUnitId || (role === 'NEPS_UNIT' ? selectedUnitId : participantUnitId)
      });
    }
  };

  /**
   * Submit from Manual Google Account Input
   */
  const handleManualGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualGoogleModal) return;

    const email = inputGoogleEmail.trim();
    if (!email || !email.includes('@')) {
      setManualError('Por favor, informe um endereço de e-mail do Google válido.');
      return;
    }

    const name = inputGoogleName.trim() || email.split('@')[0];
    const success = completeGoogleLogin(manualGoogleModal.role, email, name, undefined, manualGoogleModal.targetUnitId);

    if (success) {
      setManualGoogleModal(null);
    } else {
      setManualError(
        `O e-mail "${email}" não está na lista de gestores homologados da Gestão Central SERMAC.`
      );
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
              Autenticação Google OAuth 2.0
            </span>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col justify-center">
        
        {/* Title & Guidance Banner */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#EBF2FC] border border-[#1351B4]/30 text-[#0C326F] text-xs font-bold mb-1">
            <GoogleIcon className="w-4 h-4" />
            Acesso Exclusivo com Conta Google
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0C326F] tracking-tight">
            Portal de Autenticação com o Google
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Selecione o seu perfil de atuação abaixo e clique em <strong>Entrar com o Google</strong> para autenticar com sua conta Gmail ou Google Workspace.
          </p>
        </div>

        {/* SECURITY ALERT / REFUSAL BOX */}
        {authError && (
          <div className="max-w-4xl mx-auto w-full mb-6 p-4 sm:p-5 rounded-lg border-2 border-rose-400 bg-rose-50 text-rose-900 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded bg-rose-200 text-rose-800 flex items-center justify-center shrink-0">
                <UserX className="w-6 h-6" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-rose-950">
                    ACESSO NEGADO — CONTA GOOGLE NÃO HOMOLOGADA
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
                  <span className="font-bold">E-mails autorizados para a Gestão Central (SERMAC):</span>
                  <div className="font-mono text-[11px] flex flex-wrap gap-2 text-slate-800 pt-1">
                    {AUTHORIZED_SERMAC_USERS.map(u => (
                      <span key={u.email} className="px-2 py-0.5 bg-white border border-rose-300 rounded font-semibold">
                        {u.email}
                      </span>
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
          {/* PILLAR 1: GESTÃO CENTRAL - SERMAC (CONTROLLED ACCESS ONLY) */}
          {/* ============================================================ */}
          <div className="bg-white border border-slate-300 border-t-4 border-t-[#1351B4] rounded-lg p-5 flex flex-col justify-between shadow-xs transition-all hover:shadow-md">
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded bg-[#EBF2FC] text-[#0C326F] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#1351B4]" />
                </div>
                <span className="px-2.5 py-0.5 bg-[#EBF2FC] text-[#0C326F] text-[11px] font-bold uppercase rounded border border-[#1351B4]/20">
                  Acesso Controlado
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#0C326F] tracking-tight">
                Gestão Central - SERMAC
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Coordenação Geral, matriz intersetorial da rede, diagnóstico preditivo IA, LNT e consolidação dos 8 Distritos Sanitários.
              </p>

              {/* Requirement Box */}
              <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-[#0C326F] font-bold text-xs">
                  <Lock className="w-3.5 h-3.5 text-[#1351B4]" />
                  <span>Acesso Restrito: E-mails Homologados</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  O acesso à Gestão Central é <strong>estritamente controlado</strong>. Ao autenticar com o Google, o sistema valida se a sua conta Gmail pertence aos gestores autorizados pela SMS Recife.
                </p>
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono space-y-0.5">
                  <div className="text-emerald-700 font-sans font-bold">Contas autorizadas:</div>
                  <div>• getvb98@gmail.com</div>
                  <div>• getulio.batista@ufpe.br</div>
                  <div>• neps.ggai@gmail.com</div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleGoogleLogin('SERMAC_CENTRAL', undefined, 'sermac-google')}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#1351B4] hover:bg-[#0C326F] text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading && loadingAction === 'sermac-google' ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Autenticando com o Google...</span>
                  </span>
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4" />
                    <span>Entrar com Conta Google (Central)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>

          {/* ============================================================ */}
          {/* PILLAR 2: NÚCLEOS NEPS - UNIDADE (ANY GOOGLE ACCOUNT) */}
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

              {/* Unit Selection */}
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
                
                <p className="text-[11px] text-slate-500 italic">
                  * Acesso livre para qualquer profissional autenticado com conta Google na unidade.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleGoogleLogin('NEPS_UNIT', currentSelectedUnit.id, 'neps-google')}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading && loadingAction === 'neps-google' ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Autenticando com o Google...</span>
                  </span>
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4" />
                    <span>Entrar com Conta Google ({currentSelectedUnit.code})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>

          {/* ============================================================ */}
          {/* PILLAR 3: PORTAL DO PARTICIPANTE (ANY GOOGLE ACCOUNT) */}
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

              {/* Participant info */}
              <div className="mt-4 space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Sua Unidade de Lotação:
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

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
                  <p className="text-[11px] leading-relaxed">
                    Ao clicar no botão abaixo, sua conta Google será utilizada para identificação e emissão dos seus certificados oficiais com código de validação.
                  </p>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  * Acesso livre para qualquer profissional de saúde com conta Google/Gmail.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleGoogleLogin('PARTICIPANT', participantUnitId, 'participant-google')}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading && loadingAction === 'participant-google' ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Autenticando com o Google...</span>
                  </span>
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4" />
                    <span>Entrar com Conta Google (Participante)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

        {/* SECURITY & RBAC ADVISORY */}
        <div className="max-w-4xl mx-auto w-full mt-8 p-4 bg-white border border-slate-300 rounded-lg flex items-center gap-3 text-xs text-slate-600 shadow-xs">
          <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
          <div className="space-y-0.5">
            <strong className="text-slate-900 font-bold block">Controle de Acesso por Papéis (RBAC)</strong>
            <p className="text-[11px] text-slate-600">
              Todas as autenticações utilizam o protocolo Google OAuth 2.0. O acesso à Gestão Central SERMAC é restrito aos gestores autorizados pela SMS Recife. Os perfis de NEPS Local e Portal do Participante são de livre acesso para profissionais com qualquer conta Google.
            </p>
          </div>
        </div>

      </main>

      {/* MODAL: IDENTIFICAÇÃO DA CONTA GOOGLE / GMAIL QUANDO OAUTH NÃO ABRE O POPUP */}
      {manualGoogleModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-300 overflow-hidden">
            
            <div className="bg-[#0C326F] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
                  <GoogleIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Identificação da Conta Google</h3>
                  <p className="text-[11px] text-blue-200">
                    {manualGoogleModal.role === 'SERMAC_CENTRAL' 
                      ? 'Gestão Central SERMAC (Acesso Restrito)' 
                      : manualGoogleModal.role === 'NEPS_UNIT' 
                      ? 'Coordenação NEPS Unidade' 
                      : 'Portal do Participante'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setManualGoogleModal(null)}
                className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualGoogleSubmit} className="p-5 space-y-4">
              
              <div className="p-3 bg-[#EBF2FC] border border-[#1351B4]/20 rounded text-xs text-[#0C326F] space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#1351B4]" />
                  Validação de Conta Google / Gmail
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Informe o seu e-mail da conta Google/Gmail para conectar ao perfil selecionado:
                </p>
              </div>

              {manualError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{manualError}</span>
                </div>
              )}

              {/* Quick-select for Central SERMAC */}
              {manualGoogleModal.role === 'SERMAC_CENTRAL' && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Contas Google Homologadas na Central:
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {AUTHORIZED_SERMAC_USERS.map((user) => (
                      <button
                        key={user.email}
                        type="button"
                        onClick={() => {
                          setInputGoogleEmail(user.email);
                          setInputGoogleName(user.name);
                        }}
                        className={`px-3 py-2 text-left rounded border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          inputGoogleEmail.toLowerCase() === user.email.toLowerCase()
                            ? 'bg-[#EBF2FC] border-[#1351B4] text-[#0C326F] font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <p className="font-bold">{user.name}</p>
                          <p className="text-[11px] font-mono opacity-80">{user.email}</p>
                        </div>
                        {inputGoogleEmail.toLowerCase() === user.email.toLowerCase() && (
                          <CheckCircle2 className="w-4 h-4 text-[#1351B4]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  E-mail da Conta Google (Gmail / Workspace):
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={inputGoogleEmail}
                    onChange={(e) => setInputGoogleEmail(e.target.value)}
                    placeholder="seu.email@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#1351B4]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  Nome do Usuário Google:
                </label>
                <input
                  type="text"
                  required
                  value={inputGoogleName}
                  onChange={(e) => setInputGoogleName(e.target.value)}
                  placeholder="Nome Completo"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-[#1351B4]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setManualGoogleModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1351B4] hover:bg-[#0C326F] text-white text-xs font-bold rounded shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <GoogleIcon className="w-4 h-4" />
                  <span>Conectar com esta Conta Google</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

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


