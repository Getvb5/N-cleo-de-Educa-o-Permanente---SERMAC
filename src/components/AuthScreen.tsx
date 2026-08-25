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
  Info,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { HealthUnit, AuthUser, UserRole } from '../types';
import { SermacEducaLogo } from './SermacEducaLogo';
import { RecifeBackground } from './RecifeBackground';
import { 
  isCentralSermacEmailAuthorized,
  isCentralSermacPasscodeValid,
  isNepsEmailAuthorized,
  getAuthorizedNepsUnit,
  AUTHORIZED_SERMAC_USERS, 
  DEFAULT_NEPS_USERS, 
  DEFAULT_PARTICIPANT_USER,
  AUTHORIZED_NEPS_PROFILES,
  findNepsProfileByUnitId,
  findNepsUserByEmail
} from '../data/mockData';

interface AuthScreenProps {
  units: HealthUnit[];
  onLoginSuccess: (user: AuthUser, selectedUnitId?: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ units, onLoginSuccess }) => {
  // State for Unit selections
  const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || 'unit-159');
  const [participantUnitId, setParticipantUnitId] = useState<string>(units[0]?.id || 'unit-159');
  
  // Institutional Account inputs per profile
  // 1. Central SERMAC (strict controlled access)
  const [sermacEmail, setSermacEmail] = useState<string>('');
  const [sermacName, setSermacName] = useState<string>('');
  const [sermacPasscode, setSermacPasscode] = useState<string>('');
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  
  // 2. NEPS Unit
  const [nepsEmail, setNepsEmail] = useState<string>('');
  const [nepsName, setNepsName] = useState<string>('');

  // 3. Participant
  const [partEmail, setPartEmail] = useState<string>('');
  const [partName, setPartName] = useState<string>('');

  // Error & Security Alert State
  const [authError, setAuthError] = useState<{
    email?: string;
    message: string;
    isAccessDenied?: boolean;
    isPasscodeError?: boolean;
  } | null>(null);

  /**
   * Complete Login with Institutional Profile & Security Key
   */
  const handleLogin = (role: UserRole, targetUnitId?: string) => {
    setAuthError(null);
    setPasscodeError(null);

    // =========================================================================
    // 1. GESTÃO CENTRAL (SERMAC) — STRICT CONTROLLED ACCESS (EMAIL + CHAVE SEGURANÇA)
    // =========================================================================
    if (role === 'SERMAC_CENTRAL') {
      const cleanEmail = sermacEmail.toLowerCase().trim();
      
      if (!cleanEmail) {
        setAuthError({
          message: 'Por favor, informe seu e-mail institucional para acessar a Gestão Central.',
        });
        return;
      }

      // Check Email Homologation
      if (!isCentralSermacEmailAuthorized(cleanEmail)) {
        setAuthError({
          email: cleanEmail,
          message: `O e-mail informado "${cleanEmail}" NÃO possui autorização para o perfil de Gestão Central (SERMAC).\n\nO acesso à Coordenação Geral é estritamente restrito aos e-mails homologados pela SERMAC.`,
          isAccessDenied: true
        });
        return;
      }

      // Check Institutional Passcode
      if (!isCentralSermacPasscodeValid(sermacPasscode)) {
        const errorMsg = !sermacPasscode.trim() 
          ? 'Por favor, insira a Chave de Acesso Institucional (PIN / Senha de Segurança) da Gestão Central.'
          : 'Chave de Acesso Institucional inválida. Verifique o código fornecido pela Secretaria de Média e Alta Complexidade (SERMAC).';
        
        setPasscodeError(errorMsg);
        setAuthError({
          email: cleanEmail,
          message: errorMsg,
          isPasscodeError: true
        });
        return;
      }

      const matched = AUTHORIZED_SERMAC_USERS.find(u => u.email.toLowerCase() === cleanEmail);
      const centralUser: AuthUser = matched ? {
        ...matched,
        email: cleanEmail,
        name: sermacName.trim() || matched.name,
        authProvider: 'institutional'
      } : {
        id: `usr-sermac-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
        name: sermacName.trim() || 'Gestor(a) Central SERMAC',
        email: cleanEmail,
        role: 'SERMAC_CENTRAL',
        registrationNumber: 'SMS-REC-2026',
        jobTitle: 'Gestão Central de Educação Permanente • SERMAC',
        avatarInitials: (sermacName || cleanEmail).substring(0, 2).toUpperCase(),
        authProvider: 'institutional'
      };

      onLoginSuccess(centralUser);
      return;
    }

    // =========================================================================
    // 2. NÚCLEO NEPS - UNIDADE — STRICT INSTITUTIONAL PROFILE ACCESS
    // =========================================================================
    if (role === 'NEPS_UNIT') {
      const cleanEmail = nepsEmail.trim().toLowerCase();
      if (!cleanEmail) {
        setAuthError({
          message: 'Por favor, digite seu e-mail funcional para acessar a Coordenação NEPS.',
        });
        return;
      }

      // Check if email is in the authorized NEPS coordinators / managers roster
      const isAuth = isNepsEmailAuthorized(cleanEmail);
      if (!isAuth) {
        setAuthError({
          message: `Acesso Restrito: O e-mail informado (${cleanEmail}) não possui autorização homologada para acesso aos Núcleos NEPS da rede municipal. Verifique o endereço funcional informado ou solicite credenciamento junto à SERMAC Central.`,
        });
        return;
      }

      // Check matching profile and unit
      const profile = getAuthorizedNepsUnit(cleanEmail);
      const matched = findNepsUserByEmail(cleanEmail, targetUnitId || selectedUnitId) ||
        DEFAULT_NEPS_USERS.find(u => u.email.toLowerCase() === cleanEmail);

      const targetUnitFinal = profile 
        ? (units.find(u => u.id === profile.unitId) || units.find(u => u.id === (targetUnitId || selectedUnitId)) || units[0])
        : (matched?.unitId 
            ? (units.find(u => u.id === matched.unitId) || units.find(u => u.id === (targetUnitId || selectedUnitId)) || units[0])
            : (units.find(u => u.id === (targetUnitId || selectedUnitId)) || units[0]));

      const displayName = nepsName.trim() || matched?.name || profile?.coordinatorName || targetUnitFinal.coordinatorName || 'Coordenação NEPS';

      const nepsUser: AuthUser = {
        id: matched?.id || `usr-neps-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
        name: displayName,
        email: cleanEmail,
        role: 'NEPS_UNIT',
        registrationNumber: matched?.registrationNumber || profile?.registrationNumber || 'COREN/CRM-PE',
        unitId: targetUnitFinal.id,
        unitName: targetUnitFinal.name,
        jobTitle: matched?.jobTitle || profile?.roleTitle || `Coordenação NEPS • ${targetUnitFinal.name}`,
        avatarInitials: matched?.avatarInitials || profile?.avatarInitials || displayName.substring(0, 2).toUpperCase(),
        authProvider: 'institutional'
      };

      onLoginSuccess(nepsUser, targetUnitFinal.id);
      return;
    }

    // =========================================================================
    // 3. PORTAL DO PARTICIPANTE — ACCESS FOR SUS PROFESSIONALS
    // =========================================================================
    const cleanEmail = partEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setAuthError({
        message: 'Por favor, digite seu e-mail para acessar o Portal do Participante.',
      });
      return;
    }

    // Determine unit of lotação
    const selectedUnit = units.find(u => u.id === (targetUnitId || participantUnitId)) || units[0];
    const displayName = partName.trim() || 'Profissional de Saúde SUS';
    
    const partUser: AuthUser = {
      ...DEFAULT_PARTICIPANT_USER,
      name: displayName,
      email: cleanEmail,
      registrationNumber: 'SUS-PE-2026',
      unitId: selectedUnit.id,
      unitName: selectedUnit.name,
      declaredUnitIds: [selectedUnit.id],
      declaredUnitNames: [selectedUnit.name],
      avatarInitials: displayName.substring(0, 2).toUpperCase(),
      authProvider: 'institutional'
    };

    onLoginSuccess(partUser, selectedUnit.id);
  };

  // Update NEPS coordinator selection when unit changes
  const handleUnitChange = (unitId: string) => {
    setSelectedUnitId(unitId);
  };

  const currentSelectedUnit = units.find(u => u.id === selectedUnitId) || units[0];

  return (
    <RecifeBackground>
      
      {/* Top Header - Institutional Gov.br / SUS */}
      <header className="w-full bg-[#00058a]/60 backdrop-blur-md text-white px-4 sm:px-6 py-4 border-b border-white/15 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <SermacEducaLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  SERMAC <span className="text-cyan-300">EDUCA</span>
                </h1>
                <span className="text-[11px] bg-white/20 text-white font-bold px-2 py-0.5 rounded">
                  PNEPS / SUS
                </span>
              </div>
              <p className="text-xs text-blue-100">
                Sistema de Gestão & Monitoramento da Educação Permanente em Saúde • SMS Recife
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/25 backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-cyan-300" />
              <span>Acesso Institucional Seguro</span>
            </span>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col justify-center">
        
        {/* Title & Guidance Banner */}
        <div className="text-center max-w-3xl mx-auto mb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-cyan-200 text-xs font-bold mb-1 shadow-sm">
            <Building2 className="w-4 h-4 text-cyan-300" />
            Autenticação Institucional • Rede Municipal de Saúde
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
            Portal de Acesso aos Perfis do Sistema
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-medium">
            Selecione seu perfil de atuação abaixo para acessar o sistema.
          </p>
        </div>

        {/* SECURITY ALERT / REFUSAL BOX */}
        {authError && (
          <div className="max-w-4xl mx-auto w-full mb-6 p-4 sm:p-5 rounded-lg border-2 border-rose-400 bg-rose-50 text-rose-900 shadow-sm animate-fadeIn">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded bg-rose-200 text-rose-800 flex items-center justify-center shrink-0">
                {authError.isPasscodeError ? <ShieldAlert className="w-6 h-6" /> : <UserX className="w-6 h-6" />}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-rose-950">
                    {authError.isPasscodeError 
                      ? 'ACESSO BLOQUEADO — CHAVE DE SEGURANÇA INSTITUCIONAL INCORRETA' 
                      : 'ACESSO NEGADO — E-MAIL NÃO HOMOLOGADO NA GESTÃO CENTRAL'}
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

                {!authError.isPasscodeError && (
                  <div className="pt-2 mt-2 border-t border-rose-200 text-xs text-rose-800">
                    <p className="font-semibold">
                      Caso necessite de autorização de acesso ao módulo da Gestão Central, solicite a homologação do seu e-mail institucional à Secretaria de Média e Alta Complexidade (SERMAC).
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3-PILLAR PROFILE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
          
          {/* ============================================================ */}
          {/* PILLAR 1: GESTÃO CENTRAL - SERMAC (STRICT CONTROLLED ACCESS) */}
          {/* ============================================================ */}
          <div className="bg-white/95 backdrop-blur-md border-2 border-[#1351B4] rounded-2xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden transition hover:-translate-y-1">
            
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

              {/* Form: Account for Central */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-3">
                <div className="flex items-center justify-between text-[#0C326F] font-bold text-xs">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1351B4]" />
                    <span>Autenticação Gestão Central</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold">
                    Restrito
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700">
                    E-mail Funcional Homologado:
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={sermacEmail}
                      onChange={(e) => {
                        setSermacEmail(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="ex: seu.email@recife.pe.gov.br"
                      className="w-full pl-8 pr-2.5 py-2 bg-white border border-slate-300 rounded text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#1351B4] focus:ring-1 focus:ring-[#1351B4]"
                    />
                  </div>
                </div>

                {/* INSTITUTIONAL SECURITY PASSCODE (CHAVE DE SEGURANÇA CENTRAL) */}
                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#1351B4]" />
                      <span>Chave de Segurança Institucional:</span>
                    </label>
                    <span className="text-[10px] text-amber-800 bg-amber-100 font-bold px-1.5 py-0.2 rounded border border-amber-200">
                      Obrigatória
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type={showPasscode ? "text" : "password"}
                      value={sermacPasscode}
                      onChange={(e) => {
                        setSermacPasscode(e.target.value);
                        setPasscodeError(null);
                      }}
                      placeholder="Digite a Chave de Segurança"
                      className={`w-full pl-3 pr-9 py-2 bg-white border rounded text-xs font-mono font-bold tracking-wide focus:outline-none transition-all ${
                        passcodeError 
                          ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/50 text-rose-900' 
                          : 'border-slate-300 focus:border-[#1351B4] focus:ring-1 focus:ring-[#1351B4] text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(!showPasscode)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                      title={showPasscode ? "Ocultar chave" : "Mostrar chave"}
                    >
                      {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {passcodeError ? (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {passcodeError}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 pt-0.5">
                      Token exclusivo e sigiloso da Secretaria de Média e Alta Complexidade (SERMAC).
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleLogin('SERMAC_CENTRAL')}
                className="w-full py-3 px-4 bg-[#1351B4] hover:bg-[#0C326F] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow active:scale-[0.99]"
              >
                <Lock className="w-4 h-4 text-blue-200" />
                <span>Validar Chave & Entrar na Central</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* ============================================================ */}
          {/* PILLAR 2: NÚCLEOS NEPS - UNIDADE                             */}
          {/* ============================================================ */}
          <div className="bg-white/95 backdrop-blur-md border-2 border-emerald-600 rounded-2xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden transition hover:-translate-y-1">
            
            <div className="absolute top-0 right-0 bg-emerald-700 text-white px-3 py-1 text-[10px] font-bold uppercase rounded-bl-lg tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Acesso Homologado
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
                Gestão direta das capacitações locais, validação de presença via QR Code em tempo real, submissão de LNT e censo.
              </p>

              {/* Form: Unit Selection & Account */}
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
                    E-mail Funcional Homologado:
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={nepsEmail}
                      onChange={(e) => {
                        setNepsEmail(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="ex: neps.unidade@saude.recife.pe.gov.br"
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
                      value={nepsName}
                      onChange={(e) => {
                        setNepsName(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="Seu Nome Completo"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Acesso restrito à equipe e coordenação homologada dos Núcleos NEPS.</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleLogin('NEPS_UNIT')}
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow"
              >
                <Building className="w-4 h-4" />
                <span>Entrar como NEPS ({currentSelectedUnit.code})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* ============================================================ */}
          {/* PILLAR 3: PORTAL DO PARTICIPANTE                             */}
          {/* ============================================================ */}
          <div className="bg-white/95 backdrop-blur-md border-2 border-purple-600 rounded-2xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden transition hover:-translate-y-1">
            
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

              {/* Form: Participant info */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Sua Unidade de Lotação / Atuação no SUS *
                  </label>

                  <select
                    value={participantUnitId}
                    onChange={(e) => setParticipantUnitId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 cursor-pointer shadow-2xs"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.type})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    🎯 Os cursos disponíveis e sua certificação oficial serão emitidos e vinculados a esta unidade.
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    E-mail Funcional / Contato:
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={partEmail}
                      onChange={(e) => {
                        setPartEmail(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="ex: seu.email@saude.recife.pe.gov.br"
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
                      value={partName}
                      onChange={(e) => {
                        setPartName(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="Seu Nome Completo"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div className="p-2 bg-purple-50 border border-purple-200 rounded text-[11px] text-purple-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <span>Acesso direto para qualquer profissional ou estagiário da rede.</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleLogin('PARTICIPANT')}
                className="w-full py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow"
              >
                <UserCheck className="w-4 h-4" />
                <span>Entrar como Participante</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full text-center py-3 border-t border-white/10 bg-[#000366]/60 backdrop-blur-md text-[11px] text-blue-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span>Prefeitura da Cidade do Recife • Secretaria de Saúde • Secretaria de Média e Alta Complexidade</span>
        </div>
      </footer>

    </RecifeBackground>
  );
};



