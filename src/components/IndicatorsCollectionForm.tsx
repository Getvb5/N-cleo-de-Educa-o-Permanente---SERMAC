import React, { useState, useMemo, useEffect } from 'react';
import { 
  HealthUnit, 
  ProfessionalCategory, 
  UnitStaffCensus, 
  TrainingAction, 
  AttendanceRecord,
  AuthUser 
} from '../types';
import { ALL_PROFESSIONAL_CATEGORIES } from '../data/mockData';
import { OFFICIAL_INDICATOR_METAS } from '../utils/indicatorCalculator';
import { getPublicIndicatorsFormUrl } from '../utils/publicUrlHelper';
import { 
  Building2, 
  Users, 
  Check, 
  Copy, 
  Share2, 
  ExternalLink, 
  Printer, 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Target, 
  TrendingUp, 
  ShieldCheck, 
  FileText, 
  Layers, 
  Info,
  RefreshCw,
  Award,
  Clock,
  Send,
  HelpCircle,
  Link2
} from 'lucide-react';

interface IndicatorsCollectionFormProps {
  units: HealthUnit[];
  defaultUnitId?: string;
  currentCensusList?: UnitStaffCensus[];
  actions?: TrainingAction[];
  attendance?: AttendanceRecord[];
  currentUser?: AuthUser | null;
  onSaveCensus: (updatedUnit: HealthUnit, newCensus: UnitStaffCensus) => void;
  onExitStandalone?: () => void;
}

export const IndicatorsCollectionForm: React.FC<IndicatorsCollectionFormProps> = ({
  units = [],
  defaultUnitId,
  currentCensusList = [],
  actions = [],
  attendance = [],
  currentUser,
  onSaveCensus,
  onExitStandalone
}) => {
  // Find initial unit
  const [selectedUnitId, setSelectedUnitId] = useState<string>(() => {
    if (defaultUnitId && units.some(u => u.id === defaultUnitId)) {
      return defaultUnitId;
    }
    return units[0]?.id || '';
  });

  const activeUnit = useMemo(() => {
    return units.find(u => u.id === selectedUnitId) || units[0];
  }, [units, selectedUnitId]);

  // Existing census record if any
  const existingCensus = useMemo(() => {
    return currentCensusList.find(c => c.unitId === activeUnit?.id);
  }, [currentCensusList, activeUnit?.id]);

  // Form states
  const [period, setPeriod] = useState<string>('Setembro/2026');
  const [submitterName, setSubmitterName] = useState<string>(() => {
    return currentUser?.name || activeUnit?.coordinatorName || 'Coordenação Local NEPS';
  });
  const [submitterEmail, setSubmitterEmail] = useState<string>(() => {
    return currentUser?.email || activeUnit?.coordinatorEmail || 'neps.unidade@saude.recife.pe.gov.br';
  });
  const [submitterRole, setSubmitterRole] = useState<string>('Coordenador(a) do NEPS da Unidade');

  // Breakdown of active staff
  const [breakdown, setBreakdown] = useState<Partial<Record<ProfessionalCategory, number>>>(() => {
    return existingCensus?.breakdown || activeUnit?.activeStaffBreakdown || {
      'Médico(a) da Família / Clínico': 12,
      'Médico(a) Especialista / Emergencista': 8,
      'Enfermeiro(a)': 14,
      'Técnico(a) de Enfermagem': 22,
      'Auxiliar de Enfermagem': 4,
      'Agente Comunitário de Saúde (ACS)': 18,
      'Agente de Combate a Endemias (ACE)': 6,
      'Psicólogo(a)': 2,
      'Assistente Social': 2,
      'Farmacêutico(a)': 2,
      'Nutricionista': 1,
      'Recepcionista / Atendimento': 4,
      'Higienização e Apoio Operacional': 4
    };
  });

  // Action metrics for the period
  const unitActions = useMemo(() => {
    return actions.filter(a => a.unitId === activeUnit?.id);
  }, [actions, activeUnit?.id]);

  const unitAttendance = useMemo(() => {
    return attendance.filter(a => a.unitId === activeUnit?.id || a.participantUnitId === activeUnit?.id);
  }, [attendance, activeUnit?.id]);

  const presentRecords = useMemo(() => {
    return unitAttendance.filter(r => r.status === 'presente');
  }, [unitAttendance]);

  const liveUniqueTrained = useMemo(() => {
    const set = new Set<string>();
    presentRecords.forEach(r => {
      const key = r.cpf || r.registrationNumber || r.participantName;
      if (key) set.add(key);
    });
    return set.size;
  }, [presentRecords]);

  // Operational metrics fields (customizable if needed)
  const [plannedActionsCount, setPlannedActionsCount] = useState<number>(() => {
    return Math.max(unitActions.length, 3);
  });
  const [executedActionsCount, setExecutedActionsCount] = useState<number>(() => {
    const done = unitActions.filter(a => a.status === 'concluida').length;
    return done > 0 ? done : unitActions.length;
  });
  const [uniqueTrainedInput, setUniqueTrainedInput] = useState<number>(() => {
    return liveUniqueTrained > 0 ? liveUniqueTrained : 42;
  });
  const [plannedAttendeesInput, setPlannedAttendeesInput] = useState<number>(() => {
    const sum = unitActions.reduce((acc, a) => acc + (a.plannedAttendeesCount || a.maxSeats || 25), 0);
    return sum > 0 ? sum : 50;
  });
  const [totalAttendedInput, setTotalAttendedInput] = useState<number>(() => {
    return presentRecords.length > 0 ? presentRecords.length : 48;
  });
  const [cancelledCount, setCancelledCount] = useState<number>(() => {
    return unitActions.filter(a => a.status === 'cancelada').length;
  });
  const [cancellationReason, setCancellationReason] = useState<string>('Falta de Quórum por Escala de Plantão');
  const [esrLinkedCount, setEsrLinkedCount] = useState<number>(() => {
    return unitActions.filter(a => a.isEsrLinked).length;
  });

  // Source and notes
  const [dataSource, setDataSource] = useState<string>('Integração CNES / DATASUS e Escala Oficial do Mês');
  const [notes, setNotes] = useState<string>(() => {
    return existingCensus?.notes || `Quadro de profissionais ativos e execução de EPS apurados para ${period}, homologados pelo NEPS da ${activeUnit?.name || 'Unidade'}.`;
  });

  // Submission state
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [protocolCode, setProtocolCode] = useState<string>('');
  const [submissionDate, setSubmissionDate] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Sync state if activeUnit changes
  useEffect(() => {
    if (activeUnit) {
      if (existingCensus?.breakdown) {
        setBreakdown(existingCensus.breakdown);
      } else if (activeUnit.activeStaffBreakdown) {
        setBreakdown(activeUnit.activeStaffBreakdown);
      }
      setNotes(`Quadro de profissionais ativos e execução de EPS apurados para ${period}, homologados pelo NEPS da ${activeUnit.name}.`);
    }
  }, [activeUnit?.id, existingCensus]);

  // Total calculated staff
  const totalCalculatedStaff = useMemo(() => {
    return (Object.values(breakdown) as (number | undefined)[]).reduce<number>(
      (acc, count) => acc + (Number(count) || 0),
      0
    );
  }, [breakdown]);

  // Live Indicator Calculations
  const calculatedAtividadeRate = useMemo(() => {
    if (totalCalculatedStaff <= 0) return 0;
    return Math.min(100, Math.round((uniqueTrainedInput / totalCalculatedStaff) * 1000) / 10);
  }, [uniqueTrainedInput, totalCalculatedStaff]);

  const calculatedTepRate = useMemo(() => {
    if (plannedActionsCount <= 0) return 0;
    return Math.min(100, Math.round((executedActionsCount / plannedActionsCount) * 1000) / 10);
  }, [executedActionsCount, plannedActionsCount]);

  const calculatedAssiduidadeRate = useMemo(() => {
    if (plannedAttendeesInput <= 0) return 0;
    return Math.min(100, Math.round((totalAttendedInput / plannedAttendeesInput) * 1000) / 10);
  }, [totalAttendedInput, plannedAttendeesInput]);

  const calculatedCancelRate = useMemo(() => {
    if (plannedActionsCount <= 0) return 0;
    return Math.round((cancelledCount / plannedActionsCount) * 1000) / 10;
  }, [cancelledCount, plannedActionsCount]);

  const handleCategoryChange = (category: ProfessionalCategory, value: string) => {
    const num = parseInt(value, 10);
    setBreakdown(prev => ({
      ...prev,
      [category]: isNaN(num) || num < 0 ? 0 : num
    }));
  };

  const handleResetToPresets = () => {
    if (!activeUnit) return;
    if (activeUnit.activeStaffBreakdown) {
      setBreakdown(activeUnit.activeStaffBreakdown);
    } else {
      const fallback: Partial<Record<ProfessionalCategory, number>> = {
        'Médico(a) da Família / Clínico': 12,
        'Médico(a) Especialista / Emergencista': 8,
        'Enfermeiro(a)': 14,
        'Técnico(a) de Enfermagem': 22,
        'Auxiliar de Enfermagem': 4,
        'Agente Comunitário de Saúde (ACS)': 18,
        'Agente de Combate a Endemias (ACE)': 6,
        'Psicólogo(a)': 2,
        'Assistente Social': 2,
        'Farmacêutico(a)': 2,
        'Nutricionista': 1,
        'Recepcionista / Atendimento': 4,
        'Higienização e Apoio Operacional': 4
      };
      setBreakdown(fallback);
    }
  };

  const handleZeroAll = () => {
    const zeroed: Partial<Record<ProfessionalCategory, number>> = {};
    ALL_PROFESSIONAL_CATEGORIES.forEach(c => {
      zeroed[c] = 0;
    });
    setBreakdown(zeroed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUnit) return;

    const protocol = `COL-${activeUnit.code || 'US'}-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    const updatedUnit: HealthUnit = {
      ...activeUnit,
      totalStaff: totalCalculatedStaff > 0 ? totalCalculatedStaff : (activeUnit.totalStaff || 1),
      activeStaffBreakdown: breakdown,
      lastCensusDate: nowIso.split('T')[0],
      censusStatus: 'atualizado'
    };

    const newCensus: UnitStaffCensus = {
      id: `census-${activeUnit.id}-${Date.now()}`,
      unitId: activeUnit.id,
      unitName: activeUnit.name,
      period: period,
      totalActiveStaff: totalCalculatedStaff > 0 ? totalCalculatedStaff : (activeUnit.totalStaff || 1),
      breakdown: breakdown,
      notes: `${notes} [Protocolo: ${protocol} | Responsável: ${submitterName} (${submitterEmail})]`,
      submittedBy: submitterName,
      submittedAt: nowIso,
      verifiedBySermac: true
    };

    onSaveCensus(updatedUnit, newCensus);

    setProtocolCode(protocol);
    setSubmissionDate(new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyDirectLink = () => {
    const url = getPublicIndicatorsFormUrl(activeUnit?.id);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 pb-16 antialiased selection:bg-[#1351b4] selection:text-white">
      
      {/* TOP INSTITUTIONAL BAR */}
      <header className="bg-[#0C326F] text-white border-b border-[#0C326F]/80 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3.5 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-2 text-white">
              <Building2 className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-200 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-400/30">
                  SUS • Recife
                </span>
                <span className="text-xs text-blue-200 font-semibold">SERMAC • Gestão da Educação na Saúde</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200 bg-emerald-900/70 px-2 py-0.5 rounded border border-emerald-400/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                  Acesso Público Liberado
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Coleta Oficial de Indicadores de Educação Permanente (NEPS)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyDirectLink}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 text-xs font-bold border border-white/15 transition flex items-center gap-1.5 cursor-pointer"
              title="Copiar Link público deste formulário"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link Público'}</span>
            </button>

            {onExitStandalone && (
              <button
                type="button"
                onClick={onExitStandalone}
                className="px-3 py-1.5 rounded-lg bg-blue-800/80 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-blue-600/40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{currentUser ? 'Voltar ao Painel' : 'Área Restrita (Login)'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* SUCCESS CONFIRMATION MODAL/SCREEN */}
        {isSubmitted ? (
          <div className="bg-white rounded-2xl border border-emerald-300 shadow-md p-6 sm:p-10 space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                Coleta Homologada com Sucesso
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Indicadores Transmitidos para a SERMAC
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Os dados de quadro de pessoal e indicadores da unidade <strong className="text-slate-800">{activeUnit?.name}</strong> para o período <strong className="text-slate-800">{period}</strong> foram salvos e sincronizados com o banco de dados oficial do SERMAC EDUCA.
              </p>
            </div>

            {/* Protocol Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-lg mx-auto text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Número de Protocolo</span>
                <span className="font-mono text-sm font-black text-[#1351B4] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                  {protocolCode}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Unidade de Saúde:</span>
                  <span className="font-bold text-slate-800">{activeUnit?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">CNES:</span>
                  <span className="font-bold text-slate-800">{activeUnit?.cnes || '0000531'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total de Ativos Informados:</span>
                  <span className="font-bold text-[#1351B4]">{totalCalculatedStaff} servidores</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Data e Hora:</span>
                  <span className="font-bold text-slate-800">{submissionDate}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Responsável pelo Preenchimento:</span>
                  <span className="font-bold text-slate-800">{submitterName} ({submitterEmail})</span>
                </div>
              </div>
            </div>

            {/* Summary KPI Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-center">
                <span className="block text-[11px] font-bold text-blue-900">Índice Atividade EP</span>
                <span className="text-lg font-black text-[#1351B4]">{calculatedAtividadeRate}%</span>
                <span className="block text-[10px] text-blue-700 font-semibold">Meta ≥ 90%</span>
              </div>
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-center">
                <span className="block text-[11px] font-bold text-emerald-900">Execução Plano (TEP)</span>
                <span className="text-lg font-black text-emerald-700">{calculatedTepRate}%</span>
                <span className="block text-[10px] text-emerald-700 font-semibold">Meta 100%</span>
              </div>
              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg text-center">
                <span className="block text-[11px] font-bold text-teal-900">Assiduidade Tema</span>
                <span className="text-lg font-black text-teal-700">{calculatedAssiduidadeRate}%</span>
                <span className="block text-[10px] text-teal-700 font-semibold">Meta 100%</span>
              </div>
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg text-center">
                <span className="block text-[11px] font-bold text-purple-900">Cancelamento</span>
                <span className="text-lg font-black text-purple-700">{calculatedCancelRate}%</span>
                <span className="block text-[10px] text-purple-700 font-semibold">Meta ≤ 10%</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Comprovante</span>
              </button>
              
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="px-4 py-2.5 bg-[#1351B4] hover:bg-[#0C326F] text-white text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Editar / Preencher Outro Período</span>
              </button>

              {onExitStandalone && (
                <button
                  type="button"
                  onClick={onExitStandalone}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{currentUser ? 'Voltar ao Painel Geral' : 'Área Restrita (Login)'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* MAIN FORM */
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* PUBLIC ACCESS BANNER */}
            <div className="bg-linear-to-r from-blue-50 via-white to-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-300 text-[#0C326F] flex items-center justify-center shrink-0">
                  <Link2 className="w-5 h-5 text-[#1351B4]" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Acesso Público Aberto
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Não requer login ou senha de acesso
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0C326F]">
                    Formulário Oficial de Coleta de Indicadores e Censo da Unidade
                  </h3>
                  <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                    Este formulário é de acesso público para coordenadores, membros do NEP ou responsáveis técnicos da unidade <strong>{activeUnit?.name}</strong>. Ao concluir, os dados e cálculos são transmitidos instantaneamente para a Gestão Central (SERMAC).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyDirectLink}
                className="px-3.5 py-2 rounded-lg bg-[#1351B4] hover:bg-[#0C326F] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link Público'}</span>
              </button>
            </div>

            {/* UNIT IDENTIFICATION & CONTEXT HEADER */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-black bg-[#EBF2FC] text-[#0C326F] border border-blue-200 uppercase">
                      Unidade de Saúde
                    </span>
                    {activeUnit?.cnes && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        CNES: {activeUnit.cnes}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {activeUnit?.district}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-[#0C326F] tracking-tight">
                    {activeUnit?.name}
                  </h2>
                  <p className="text-xs text-slate-600">
                    Coordenação Oficial NEPS: <strong>{activeUnit?.coordinatorName}</strong> • {activeUnit?.coordinatorEmail}
                  </p>
                </div>

                {/* Unit Switcher if multiple units provided */}
                {units.length > 1 && (
                  <div className="w-full sm:w-72">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Alternar Unidade de Saúde:
                    </label>
                    <select
                      value={selectedUnitId}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1351B4] focus:outline-none"
                    >
                      {units.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Informational Guidelines Alert */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 flex items-start gap-3 text-xs text-blue-950">
                <Info className="w-5 h-5 text-[#1351B4] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-blue-900">
                    Instruções para Preenchimento Mensal dos Indicadores de EPS:
                  </p>
                  <p className="text-blue-800 leading-relaxed">
                    Este formulário destina-se ao registro mensal do quantitativo de servidores em exercício ativo na unidade (denominador chave para o <strong>Índice de Atividade da EP</strong> e <strong>Adesão por Categoria</strong>) e das informações de execução das ações de EPS. Os dados alimentam diretamente os painéis da SERMAC e da Secretaria de Saúde do Recife.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 1: RESPONSÁVEL E PERÍODO */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0C326F] border-b border-slate-200 pb-2">
                <Calendar className="w-4 h-4 text-[#1351B4]" />
                <h3>1. Dados da Coleta e Responsável</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mês / Período de Referência *
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-[#1351B4] focus:outline-none"
                    required
                  >
                    <option value="Setembro/2026">Setembro/2026</option>
                    <option value="Agosto/2026">Agosto/2026</option>
                    <option value="Julho/2026">Julho/2026</option>
                    <option value="Junho/2026">Junho/2026</option>
                    <option value="Outubro/2026">Outubro/2026 (Planejamento)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nome do Responsável *
                  </label>
                  <input
                    type="text"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-[#1351B4] focus:outline-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    E-mail Institucional *
                  </label>
                  <input
                    type="email"
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                    placeholder="ex: coordenador@recife.pe.gov.br"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-[#1351B4] focus:outline-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cargo / Função na Unidade *
                  </label>
                  <input
                    type="text"
                    value={submitterRole}
                    onChange={(e) => setSubmitterRole(e.target.value)}
                    placeholder="ex: Coordenador(a) NEPS"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-[#1351B4] focus:outline-none font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: CENSO DE PROFISSIONAIS ATIVOS (DENOMINADOR) */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#0C326F]">
                    <Users className="w-4 h-4 text-[#1351B4]" />
                    <h3>2. Quadro de Pessoal em Exercício Ativo no Mês</h3>
                  </div>
                  <p className="text-xs text-slate-600">
                    Informe o quantitativo real de profissionais em exercício (excluindo licenças prolongadas). Base do <strong>Indicador 1 (Índice de Atividade)</strong> e <strong>Indicador 4 (Adesão por Categoria)</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetToPresets}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition flex items-center gap-1 cursor-pointer"
                    title="Restaurar valores de referência CNES da unidade"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Carregar Base CNES</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleZeroAll}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition flex items-center gap-1 cursor-pointer"
                    title="Zerar campos para preenchimento manual"
                  >
                    <span>Zerar</span>
                  </button>
                </div>
              </div>

              {/* Total Active Staff Counter Banner */}
              <div className="bg-linear-to-r from-blue-900 to-[#1351B4] text-white p-4 rounded-xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white border border-white/20">
                    <Target className="w-5 h-5 text-blue-200" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-blue-200 font-bold block">
                      Denominador Oficial Apurado
                    </span>
                    <span className="text-xs text-blue-100 font-medium">
                      Soma de todas as categorias profissionais informadas
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black tracking-tight text-white">
                    {totalCalculatedStaff}
                  </div>
                  <span className="text-[11px] font-bold text-blue-200">
                    Profissionais Ativos na Unidade
                  </span>
                </div>
              </div>

              {/* Grid of Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {ALL_PROFESSIONAL_CATEGORIES.map(category => {
                  const count = breakdown[category] || 0;
                  return (
                    <div 
                      key={category} 
                      className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                        count > 0 
                          ? 'bg-blue-50/40 border-blue-200 shadow-2xs' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <label className="text-xs font-semibold text-slate-800 leading-tight select-none">
                        {category}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={999}
                        value={count}
                        onChange={(e) => handleCategoryChange(category, e.target.value)}
                        className="w-16 py-1.5 px-2 bg-white border border-slate-300 rounded text-xs font-black text-center text-[#0C326F] focus:border-[#1351B4] focus:ring-2 focus:ring-[#1351B4]/20 focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: METAS E AÇÕES DO PERÍODO */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0C326F] border-b border-slate-200 pb-2">
                <Target className="w-4 h-4 text-[#1351B4]" />
                <h3>3. Metas e Execução das Ações de Educação Permanente no Mês</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ações de EPS Planejadas no Período (Plano do NEP)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={plannedActionsCount}
                    onChange={(e) => setPlannedActionsCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-[#1351B4] focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Denominador da TEP (Indicador 2)</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ações de EPS Efetivamente Executadas / Realizadas
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={executedActionsCount}
                    onChange={(e) => setExecutedActionsCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-[#1351B4] focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Numerador da TEP (Indicador 2)</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Profissionais Únicos Capacitados no Período
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={uniqueTrainedInput}
                    onChange={(e) => setUniqueTrainedInput(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-[#1351B4] focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Numerador do Índice de Atividade (Indicador 1)</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Profissionais Previstos nos Temas do Período
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={plannedAttendeesInput}
                    onChange={(e) => setPlannedAttendeesInput(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-[#1351B4] focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Denominador da Assiduidade (Indicador 3)</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Total de Presenças Efetivas Registradas
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={totalAttendedInput}
                    onChange={(e) => setTotalAttendedInput(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-[#1351B4] focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Numerador da Assiduidade (Indicador 3)</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ações em Parceria com a Escola de Saúde (ESR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={esrLinkedCount}
                    onChange={(e) => setEsrLinkedCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-[#1351B4] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Vinculação ESR (Indicador 6)</span>
                </div>
              </div>

              {/* Cancelled Actions Details (Indicador 5) */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Houve cancelamento de ações planejadas no período? (Indicador 5 - Taxa ≤ 10%)
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Ações suspensas ou adiadas no mês de referência
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="font-semibold text-slate-700">Qtd. Canceladas:</label>
                    <input
                      type="number"
                      min={0}
                      value={cancelledCount}
                      onChange={(e) => setCancelledCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 p-1.5 bg-white border border-slate-300 rounded font-bold text-center text-rose-700"
                    />
                  </div>
                </div>

                {cancelledCount > 0 && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Motivo Predominante do Cancelamento:
                    </label>
                    <select
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800"
                    >
                      <option value="Falta de Quórum por Escala de Plantão">Falta de Quórum por Escala de Plantão / Remanejamento</option>
                      <option value="Emergência ou Surto Epidemiológico">Emergência ou Surto Epidemiológico na Unidade</option>
                      <option value="Indisponibilidade de Instrutor / Facilitador">Indisponibilidade de Instrutor / Facilitador</option>
                      <option value="Problemas de Infraestrutura / Espaço Físico">Problemas de Infraestrutura / Espaço Físico</option>
                      <option value="Outro Motivo Justificado">Outro Motivo Justificado</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: LIVE CALCULATION PREVIEW */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0C326F]">
                  <TrendingUp className="w-4 h-4 text-[#1351B4]" />
                  <h3>4. Apuração Instantânea dos Indicadores Oficiais</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  Cálculo automático em tempo real
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Atividade */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 uppercase">1. Atividade EP</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      calculatedAtividadeRate >= OFFICIAL_INDICATOR_METAS.ATIVIDADE_EP
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      Meta ≥ 90%
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#0C326F]">
                    {calculatedAtividadeRate}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {uniqueTrainedInput} únicos ÷ {totalCalculatedStaff} ativos
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${calculatedAtividadeRate >= 90 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, calculatedAtividadeRate)}%` }}
                    />
                  </div>
                </div>

                {/* 2. TEP */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 uppercase">2. Execução (TEP)</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      calculatedTepRate >= OFFICIAL_INDICATOR_METAS.EXECUCAO_PLANO_TEP
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-blue-50 text-[#1351B4] border-blue-200'
                    }`}>
                      Meta 100%
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#0C326F]">
                    {calculatedTepRate}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {executedActionsCount} executadas ÷ {plannedActionsCount} planejadas
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-[#1351B4]"
                      style={{ width: `${Math.min(100, calculatedTepRate)}%` }}
                    />
                  </div>
                </div>

                {/* 3. Assiduidade */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 uppercase">3. Assiduidade</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      calculatedAssiduidadeRate >= OFFICIAL_INDICATOR_METAS.ASSIDUIDADE_TEMA
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-blue-50 text-[#1351B4] border-blue-200'
                    }`}>
                      Meta 100%
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#0C326F]">
                    {calculatedAssiduidadeRate}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {totalAttendedInput} presentes ÷ {plannedAttendeesInput} previstos
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-teal-600"
                      style={{ width: `${Math.min(100, calculatedAssiduidadeRate)}%` }}
                    />
                  </div>
                </div>

                {/* 4. Cancelamento */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 uppercase">5. Cancelamento</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      calculatedCancelRate <= OFFICIAL_INDICATOR_METAS.TAXA_CANCELAMENTO
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}>
                      Meta ≤ 10%
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#0C326F]">
                    {calculatedCancelRate}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {cancelledCount} canceladas ÷ {plannedActionsCount} no plano
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${calculatedCancelRate <= 10 ? 'bg-emerald-600' : 'bg-rose-600'}`}
                      style={{ width: `${Math.min(100, calculatedCancelRate)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: METODOLOGIA E NOTAS */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0C326F] border-b border-slate-200 pb-2">
                <FileText className="w-4 h-4 text-[#1351B4]" />
                <h3>5. Fontes de Dados e Observações da Coordenação</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fonte dos Dados do Quadro de Pessoal
                  </label>
                  <select
                    value={dataSource}
                    onChange={(e) => setDataSource(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800"
                  >
                    <option value="Integração CNES / DATASUS e Escala Oficial do Mês">Integração CNES / DATASUS e Escala Oficial do Mês</option>
                    <option value="Folha de Pagamento Municipal da Unidade">Folha de Pagamento Municipal da Unidade</option>
                    <option value="Escala de Plantão e Registro Interno do NEP">Escala de Plantão e Registro Interno do NEP</option>
                    <option value="Censo Presencial Homologado pela Direção">Censo Presencial Homologado pela Direção</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Declaração de Conformidade
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-600 leading-relaxed">
                    Declaro para os devidos fins de gestão do trabalho e educação na saúde que as informações prestadas refletem a realidade operacional da unidade no período informado.
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Observações e Justificativas Metodológicas (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Informe eventuais particularidades, reformas, movimentações de servidores ou destaques do período..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1351B4] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Os dados serão salvos permanentemente na nuvem e integrados aos relatórios gerais da SERMAC.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-[#1351B4] hover:bg-[#0C326F] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmitir Coleta de Indicadores</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-12 text-center text-xs text-slate-500">
        <p>Prefeitura da Cidade do Recife • Secretaria de Saúde • SERMAC • Núcleos de Educação Permanente em Saúde (NEPS)</p>
      </footer>

    </div>
  );
};
