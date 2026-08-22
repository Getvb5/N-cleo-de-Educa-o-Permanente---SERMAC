import React, { useState } from 'react';
import { 
  Building2, 
  Building, 
  UserCheck, 
  Lock, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Info,
  KeyRound,
  User
} from 'lucide-react';
import { HealthUnit, AuthUser, UserRole } from '../types';
import { 
  DEFAULT_SERMAC_USER, 
  DEFAULT_NEPS_USERS, 
  DEFAULT_PARTICIPANT_USER 
} from '../data/mockData';

interface AuthScreenProps {
  units: HealthUnit[];
  onLoginSuccess: (user: AuthUser, selectedUnitId?: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ units, onLoginSuccess }) => {
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('SERMAC_CENTRAL');
  
  // SERMAC form state
  const [sermacEmail, setSermacEmail] = useState('coordenacao.sermac@saude.gov.br');
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

  // Submit Handler
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (activeRoleTab === 'SERMAC_CENTRAL') {
        if (!sermacEmail.trim()) {
          setErrorMessage('Por favor, informe o e-mail ou matrícula da Coordenação SERMAC.');
          return;
        }
        const sermacUser: AuthUser = {
          ...DEFAULT_SERMAC_USER,
          email: sermacEmail
        };
        onLoginSuccess(sermacUser);
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
    }, 350);
  };

  // Quick Fast-Logins
  const handleQuickSermac = () => {
    setActiveRoleTab('SERMAC_CENTRAL');
    setSermacEmail(DEFAULT_SERMAC_USER.email);
    setSermacPassword('sermac2026');
    onLoginSuccess(DEFAULT_SERMAC_USER);
  };

  const handleQuickNepsUnit = (unitId: string) => {
    setActiveRoleTab('NEPS_UNIT');
    setSelectedUnitId(unitId);
    const unitUser = DEFAULT_NEPS_USERS.find(u => u.unitId === unitId) || {
      ...DEFAULT_NEPS_USERS[0],
      unitId
    };
    onLoginSuccess(unitUser, unitId);
  };

  const handleQuickParticipant = () => {
    setActiveRoleTab('PARTICIPANT');
    onLoginSuccess(DEFAULT_PARTICIPANT_USER, 'unit-1');
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
              <span className="font-bold text-white tracking-tight text-lg">NEPS <span className="text-blue-400">Saúde</span></span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-500/30">
                PNEPS / SUS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Sistema Municipal de Educação Permanente em Saúde • SERMAC</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Ambiente Seguro SMS
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
              Selecione seu perfil institucional para gerenciar os treinamentos, emitir certificados ou consultar indicadores.
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
                <span>Coordenação Central</span>
                <span className="text-[10px] opacity-75 font-normal">SERMAC</span>
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
                <span className="text-[10px] opacity-75 font-normal">Unidade de Saúde</span>
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
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: COORDENAÇÃO CENTRAL - SERMAC */}
            {activeRoleTab === 'SERMAC_CENTRAL' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-2.5 text-xs text-blue-200">
                  <ShieldCheck className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white block">Coordenação Central SERMAC</strong>
                    Acesso completo à matriz intersetorial, Levantamento de Necessidades (LNT), diagnósticos IA e indicadores de todas as unidades da rede.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    E-mail Institucional ou Matrícula SMS
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-sermac-email"
                      type="text"
                      value={sermacEmail}
                      onChange={(e) => setSermacEmail(e.target.value)}
                      placeholder="coordenacao.sermac@saude.gov.br"
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
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
                        <span>Entrar na Coordenação SERMAC</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: COORDENAÇÃO NEPS - UNIDADE */}
            {activeRoleTab === 'NEPS_UNIT' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2.5 text-xs text-emerald-200">
                  <Building className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white block">Núcleo NEPS Local da Unidade</strong>
                    Acesso à gestão de capacitações locais, QR Code de presença, envio de DNC e certificação direta da equipe da unidade.
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
                    E-mail da Coordenação Local
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
                        <span>Acessar NEPS • {currentSelectedUnit.code}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: PORTAL DO PARTICIPANTE */}
            {activeRoleTab === 'PARTICIPANT' && (
              <form onSubmit={handleLogin} className="space-y-4">
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

            {/* Quick Demo Logins Section */}
            <div className="pt-4 border-t border-slate-700/60">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Acessos Rápidos de Demonstração (1 Clique)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  id="btn-fast-sermac"
                  type="button"
                  onClick={handleQuickSermac}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-900 hover:border-blue-500/50 border border-slate-700/80 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                    <span>SERMAC Central</span>
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">Dra. Regina Mendes</p>
                </button>

                <button
                  id="btn-fast-neps-ubs"
                  type="button"
                  onClick={() => handleQuickNepsUnit('unit-159')}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-900 hover:border-emerald-500/50 border border-slate-700/80 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                    <span>NEPS Poli. Agamenon</span>
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">Enf. Carla Albuquerque</p>
                </button>

                <button
                  id="btn-fast-neps-upa"
                  type="button"
                  onClick={() => handleQuickNepsUnit('unit-165')}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-900 hover:border-indigo-500/50 border border-slate-700/80 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                    <span>NEPS Mat. Bandeira</span>
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">Dra. Gabriela Fontes</p>
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

      {/* Footer */}
      <footer className="w-full text-center py-3 text-[11px] text-slate-500 z-10">
        Prefeitura Municipal • Secretaria Municipal de Saúde • Educação Permanente em Saúde (EPS/NEPS)
      </footer>

    </div>
  );
};
