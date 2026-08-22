import React, { useState, useMemo } from 'react';
import { 
  HealthUnit, 
  TrainingAction, 
  AttendanceRecord, 
  UnitStaffCensus,
  ProfessionalCategory 
} from '../types';
import { calculateSermacIndicators, OFFICIAL_INDICATOR_METAS } from '../utils/indicatorCalculator';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { 
  Award, 
  Building2, 
  Users, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileDown, 
  Filter, 
  Info, 
  Calendar, 
  Layers, 
  GraduationCap, 
  Ban, 
  UserCheck, 
  ChevronRight,
  ShieldCheck,
  Printer,
  Sparkles
} from 'lucide-react';

interface OfficialIndicatorsPanelProps {
  units: HealthUnit[];
  actions: TrainingAction[];
  attendance: AttendanceRecord[];
  censusList: UnitStaffCensus[];
  onOpenCensusModal?: (unit: HealthUnit) => void;
}

const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];

export const OfficialIndicatorsPanel: React.FC<OfficialIndicatorsPanelProps> = ({
  units = [],
  actions = [],
  attendance = [],
  censusList = [],
  onOpenCensusModal
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string>(() => {
    return units.length === 1 ? units[0].id : 'all';
  });
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Agosto/2026');
  const [activeDetailTab, setActiveDetailTab] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Keep selectedUnitId synced if single unit changes
  React.useEffect(() => {
    if (units.length === 1) {
      setSelectedUnitId(units[0].id);
    }
  }, [units]);

  // Compute report data using the official calculator
  const report = useMemo(() => {
    return calculateSermacIndicators(units, actions, attendance, selectedUnitId, selectedPeriod);
  }, [units, actions, attendance, selectedUnitId, selectedPeriod]);

  const selectedUnit = useMemo(() => {
    return units.find(u => u.id === selectedUnitId);
  }, [units, selectedUnitId]);

  return (
    <div className="space-y-6">
      
      {/* Header with Title & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 text-xs font-black tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-md uppercase">
              Painel Oficial SERMAC / NEPS Recife
            </span>
            <span className="text-xs text-slate-400">• Sistema de Monitoramento de EPS</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            Indicadores de Educação Permanente em Saúde
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhamento, execução do planejamento, adesão dos profissionais e integração com a Escola de Saúde do Recife (ESR).
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="Agosto/2026">Agosto / 2026</option>
              <option value="Julho/2026">Julho / 2026</option>
              <option value="Consolidado 2026">Consolidado 2026</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 max-w-xs">
            <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={selectedUnitId}
              onChange={e => setSelectedUnitId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer truncate"
            >
              {units.length > 1 && <option value="all">Toda a Rede ({units.length} Unidades)</option>}
              {units.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm"
            title="Imprimir ou Salvar em PDF"
          >
            <Printer className="w-4 h-4 text-teal-400" />
            <span>Exportar Relatório</span>
          </button>
        </div>
      </div>

      {/* Grid of 6 Official Indicators Cards (Matching PDF Overview) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Índice de Atividade da EP */}
        <div
          onClick={() => setActiveDetailTab(1)}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activeDetailTab === 1 
              ? 'bg-slate-850 border-teal-500/80 shadow-lg shadow-teal-950/40 ring-1 ring-teal-500/40' 
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs font-black flex items-center justify-center border border-teal-500/30">
                1
              </span>
              <span className="text-xs font-bold text-slate-300">Índice de Atividade da EP</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black border ${
              report.atividadeEP.isGoalMet 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              Meta ≥ 90%
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-white">{report.atividadeEP.rate}%</span>
              <span className="text-xs text-slate-400 ml-2">alcançado</span>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <p className="font-semibold text-teal-300">{report.atividadeEP.uniqueParticipants} únicos treinados</p>
              <p>{report.atividadeEP.totalActiveStaff} profissionais ativos</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full transition-all duration-500 ${
                report.atividadeEP.rate >= 90 ? 'bg-emerald-500' : report.atividadeEP.rate >= 70 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, report.atividadeEP.rate)}%` }}
            />
          </div>

          <p className="mt-2.5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Fórmula: (Únicos ÷ Total Ativos) × 100</span>
            <span className="text-teal-400 font-bold hover:underline">Ver detalhes →</span>
          </p>
        </div>

        {/* Card 2: Taxa de Execução do Plano do NEP (TEP) */}
        <div
          onClick={() => setActiveDetailTab(2)}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activeDetailTab === 2 
              ? 'bg-slate-850 border-indigo-500/80 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/40' 
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-black flex items-center justify-center border border-indigo-500/30">
                2
              </span>
              <span className="text-xs font-bold text-slate-300">Taxa Execução do Plano (TEP)</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black border ${
              report.execucaoPlanoTEP.isGoalMet 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            }`}>
              Meta 100%
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-white">{report.execucaoPlanoTEP.rate}%</span>
              <span className="text-xs text-slate-400 ml-2">executado</span>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <p className="font-semibold text-indigo-300">{report.execucaoPlanoTEP.executedActions} realizadas</p>
              <p>{report.execucaoPlanoTEP.plannedActions} planejadas no plano</p>
            </div>
          </div>

          <div className="mt-3 w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${Math.min(100, report.execucaoPlanoTEP.rate)}%` }}
            />
          </div>

          <p className="mt-2.5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Fórmula: (Realizadas ÷ Planejadas) × 100</span>
            <span className="text-indigo-400 font-bold hover:underline">Ver detalhes →</span>
          </p>
        </div>

        {/* Card 3: Coeficiente de Assiduidade por Tema */}
        <div
          onClick={() => setActiveDetailTab(3)}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activeDetailTab === 3 
              ? 'bg-slate-850 border-cyan-500/80 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40' 
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-black flex items-center justify-center border border-cyan-500/30">
                3
              </span>
              <span className="text-xs font-bold text-slate-300">Assiduidade por Tema</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black border ${
              report.assiduidadePorTema.isGoalMet 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
            }`}>
              Meta 100%
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-white">{report.assiduidadePorTema.rate}%</span>
              <span className="text-xs text-slate-400 ml-2">presença plena</span>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <p className="font-semibold text-cyan-300">{report.assiduidadePorTema.totalTrainedInTheme} presentes</p>
              <p>{report.assiduidadePorTema.totalExpectedInTheme} previstos</p>
            </div>
          </div>

          <div className="mt-3 w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${Math.min(100, report.assiduidadePorTema.rate)}%` }}
            />
          </div>

          <p className="mt-2.5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Fórmula: (Treinados ÷ Previstos) × 100</span>
            <span className="text-cyan-400 font-bold hover:underline">Ver detalhes →</span>
          </p>
        </div>

        {/* Card 4: Taxa de Adesão por Categoria Profissional */}
        <div
          onClick={() => setActiveDetailTab(4)}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activeDetailTab === 4 
              ? 'bg-slate-850 border-amber-500/80 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/40' 
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center border border-amber-500/30">
                4
              </span>
              <span className="text-xs font-bold text-slate-300">Adesão por Categoria</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black border bg-amber-500/10 text-amber-400 border-amber-500/20">
              Meta ≥ 90%
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-white">{report.adesaoPorCategoria.overallRate}%</span>
              <span className="text-xs text-slate-400 ml-2">média categorias</span>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <p className="font-semibold text-amber-300">{report.adesaoPorCategoria.byCategory.length} categorias</p>
              <p>elegíveis no período</p>
            </div>
          </div>

          <div className="mt-3 w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${Math.min(100, report.adesaoPorCategoria.overallRate)}%` }}
            />
          </div>

          <p className="mt-2.5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Fórmula: (Part. Categoria ÷ Elegíveis) × 100</span>
            <span className="text-amber-400 font-bold hover:underline">Ver detalhes →</span>
          </p>
        </div>

        {/* Card 5: Taxa de Cancelamento das Ações de EP */}
        <div
          onClick={() => setActiveDetailTab(5)}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activeDetailTab === 5 
              ? 'bg-slate-850 border-rose-500/80 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/40' 
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs font-black flex items-center justify-center border border-rose-500/30">
                5
              </span>
              <span className="text-xs font-bold text-slate-300">Taxa de Cancelamento</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black border ${
              report.taxaCancelamento.isGoalMet 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              Meta ≤ 10%
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-white">{report.taxaCancelamento.rate}%</span>
              <span className="text-xs text-slate-400 ml-2">cancelamentos</span>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <p className="font-semibold text-rose-300">{report.taxaCancelamento.cancelledActions} cancelada(s)</p>
              <p>{report.taxaCancelamento.totalPlannedActions} total no plano</p>
            </div>
          </div>

          <div className="mt-3 w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full transition-all duration-500 ${
                report.taxaCancelamento.rate <= 10 ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, report.taxaCancelamento.rate * 5)}%` }}
            />
          </div>

          <p className="mt-2.5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Fórmula: (Cancelados ÷ Planejados) × 100</span>
            <span className="text-rose-400 font-bold hover:underline">Ver causas →</span>
          </p>
        </div>

        {/* Card 6: % de Treinamentos Vinculados à ESR */}
        <div
          onClick={() => setActiveDetailTab(6)}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activeDetailTab === 6 
              ? 'bg-slate-850 border-purple-500/80 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/40' 
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-black flex items-center justify-center border border-purple-500/30">
                6
              </span>
              <span className="text-xs font-bold text-slate-300">Vinculação à ESR</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black border bg-purple-500/10 text-purple-300 border-purple-500/20">
              Escola de Saúde do Recife
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-white">{report.vinculacaoESR.rate}%</span>
              <span className="text-xs text-slate-400 ml-2">parceria ESR</span>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <p className="font-semibold text-purple-300">{report.vinculacaoESR.esrLinkedActions} com selo ESR</p>
              <p>{report.vinculacaoESR.totalCompletedActions} ações concluídas</p>
            </div>
          </div>

          <div className="mt-3 w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${Math.min(100, report.vinculacaoESR.rate)}%` }}
            />
          </div>

          <p className="mt-2.5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Fórmula: (Vinculados ESR ÷ Concluídos) × 100</span>
            <span className="text-purple-400 font-bold hover:underline">Ver detalhes →</span>
          </p>
        </div>

      </div>

      {/* Deep-Dive Active Tab Detail Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-6">
        
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveDetailTab(1)}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeDetailTab === 1 ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>1. Índice de Atividade da EP (Profissionais Ativos)</span>
          </button>
          <button
            onClick={() => setActiveDetailTab(2)}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeDetailTab === 2 ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>2. Execução do Plano (TEP)</span>
          </button>
          <button
            onClick={() => setActiveDetailTab(3)}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeDetailTab === 3 ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>3. Assiduidade por Tema</span>
          </button>
          <button
            onClick={() => setActiveDetailTab(4)}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeDetailTab === 4 ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>4. Adesão por Categoria</span>
          </button>
          <button
            onClick={() => setActiveDetailTab(5)}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeDetailTab === 5 ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>5. Cancelamento de Ações</span>
          </button>
          <button
            onClick={() => setActiveDetailTab(6)}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeDetailTab === 6 ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>6. Vinculação ESR</span>
          </button>
        </div>

        {/* TAB 1: Índice de Atividade da EP (Profissionais Ativos) */}
        {activeDetailTab === 1 && (
          <div className="space-y-6">
            
            {/* Header info & formula banner */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Indicador 1: Índice de Atividade da Educação Permanente
                  </h3>
                  <span className="px-2 py-0.5 text-xs font-bold bg-teal-500/20 text-teal-300 rounded border border-teal-500/30">
                    Meta Oficial: ≥ 90%
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  <strong>Objetivo:</strong> Mensurar o alcance das ações de EPS entre os profissionais ativos das unidades vinculadas à SERMAC.
                </p>
                <div className="text-xs font-mono text-teal-400 pt-1">
                  Fórmula: (Nº de profissionais únicos que participaram ÷ Nº total de profissionais ativos) × 100
                </div>
              </div>

              {selectedUnit && onOpenCensusModal && (
                <button
                  onClick={() => onOpenCensusModal(selectedUnit)}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-teal-900/30 transition-all flex-shrink-0"
                >
                  <Users className="w-4 h-4" />
                  Atualizar Censo de Ativos ({selectedUnit.name})
                </button>
              )}
            </div>

            {/* Chart: Activity Index per Unit */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Cobertura de Profissionais Únicos por Unidade de Saúde (Meta ≥ 90%)
                  </h4>
                  <span className="text-[11px] text-slate-500">Linha verde pontilhada indica a meta</span>
                </div>

                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={report.atividadeEP.byUnit} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis 
                        dataKey="unitName" 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        tickFormatter={(val: string) => val.split(' ')[0] + ' ' + (val.split(' ')[2] || '')}
                      />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        formatter={(val: any) => [`${val}%`, 'Índice de Atividade']}
                      />
                      <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                        {report.atividadeEP.byUnit.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.rate >= 90 ? '#10b981' : entry.rate >= 70 ? '#f59e0b' : '#ef4444'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Census & Workforce Status Checklist */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Diagnóstico do Censo de Ativos
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                      <span className="text-slate-400">Total de Ativos Cadastrados:</span>
                      <span className="font-bold text-white">{report.atividadeEP.totalActiveStaff}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                      <span className="text-slate-400">Profissionais Únicos Capacitados:</span>
                      <span className="font-bold text-teal-300">{report.atividadeEP.uniqueParticipants}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                      <span className="text-slate-400">Unidades com Censo Atualizado:</span>
                      <span className="font-bold text-emerald-400">19 / 19 (100%)</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-teal-950/30 border border-teal-800/40 rounded-xl text-teal-200 text-xs">
                  <p className="font-bold text-teal-300 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Regra Antiduplicidade
                  </p>
                  <p className="text-[11px] text-teal-200/80 leading-relaxed">
                    Em conformidade com a nota técnica do indicador, o cálculo considera exclusivamente o número de <strong>profissionais únicos alcançados no período</strong> (via CPF/Matrícula SUS), garantindo que múltiplas participações não inflem artificialmente a cobertura.
                  </p>
                </div>
              </div>

            </div>

            {/* Table Breakdown per Unit with Edit Census action */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase">
                  Detalhamento por Unidade de Saúde (19 Unidades da Rede)
                </span>
                <span className="text-[11px] text-slate-500">Mês de Referência: {selectedPeriod}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Unidade de Saúde</th>
                      <th className="p-3 text-center">Profissionais Ativos</th>
                      <th className="p-3 text-center">Únicos Capacitados</th>
                      <th className="p-3 text-center">Índice de Atividade</th>
                      <th className="p-3 text-center">Status da Meta (≥90%)</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {report.atividadeEP.byUnit.map(item => {
                      const matchedUnit = units.find(u => u.id === item.unitId);
                      return (
                        <tr key={item.unitId} className="hover:bg-slate-850/50 transition-colors">
                          <td className="p-3 font-semibold text-white">
                            {item.unitName}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-300">
                            {item.totalActiveStaff}
                          </td>
                          <td className="p-3 text-center font-bold text-teal-400">
                            {item.uniqueParticipants}
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-sm font-black text-white">{item.rate}%</span>
                          </td>
                          <td className="p-3 text-center">
                            {item.isGoalMet ? (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                                Meta Atingida
                              </span>
                            ) : item.rate >= 70 ? (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                                Em Alerta
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
                                Abaixo da Meta
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {matchedUnit && onOpenCensusModal && (
                              <button
                                onClick={() => onOpenCensusModal(matchedUnit)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                              >
                                Editar Censo
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Execução do Plano do NEP (TEP) */}
        {activeDetailTab === 2 && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Indicador 2: Taxa de Execução do Plano do Núcleo de Educação Permanente (TEP)
                </h3>
                <span className="px-2 py-0.5 text-xs font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                  Meta Oficial: 100%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                <strong>Objetivo:</strong> Mensurar o grau de execução das ações de EPS previstas no Levantamento de Necessidades de Treinamento (LNT), avaliando a aderência entre planejamento e execução.
              </p>
              <div className="text-xs font-mono text-indigo-400 pt-1">
                Fórmula: TEP = (Nº de atividades efetivamente realizadas ÷ Nº de atividades planejadas no período) × 100
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.execucaoPlanoTEP.byUnit.map(u => (
                <div key={u.unitId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">{u.unitName}</p>
                    <p className="text-[11px] text-slate-400">
                      {u.executed} concluídas de {u.planned} planejadas
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-indigo-400">{u.rate}%</span>
                    <span className={`block text-[10px] font-bold ${u.isGoalMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {u.isGoalMet ? 'Plano Concluído' : 'Em Execução'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Coeficiente de Assiduidade por Tema */}
        {activeDetailTab === 3 && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Indicador 3: Coeficiente de Assiduidade por Tema
                </h3>
                <span className="px-2 py-0.5 text-xs font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                  Meta Oficial: 100%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                <strong>Objetivo:</strong> Mensurar a adesão dos profissionais aos treinamentos ofertados, considerando o quantitativo previamente previsto para participação em cada tema.
              </p>
              <div className="text-xs font-mono text-cyan-400 pt-1">
                Fórmula: (Nº de profissionais treinados no tema ÷ Nº de profissionais previstos para o tema) × 100
              </div>
            </div>

            <div className="space-y-3">
              {report.assiduidadePorTema.byAction.map(act => (
                <div key={act.actionId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">
                        {act.actionCode}
                      </span>
                      <span className="text-xs font-bold text-white">{act.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {act.unitName} • Eixo: {act.thematicAxis}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-200">
                        {act.trained} treinados / {act.expected} previstos
                      </p>
                      <span className="text-base font-black text-cyan-400">{act.rate}%</span>
                    </div>
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${
                      act.rate >= 90 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {act.rate >= 100 ? '100% Participação' : `${act.rate}% Assiduidade`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Adesão por Categoria Profissional */}
        {activeDetailTab === 4 && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Indicador 4: Taxa de Adesão por Categoria Profissional aos Treinamentos Ofertados
                </h3>
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                  Meta Oficial: ≥ 90%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                <strong>Objetivo:</strong> Mensurar a participação dos profissionais nas ações de EP por categoria profissional (médicos, enfermeiros, técnicos, ACS, etc.), subsidiando estratégias direcionadas.
              </p>
              <div className="text-xs font-mono text-amber-400 pt-1">
                Fórmula: (Nº de profissionais da categoria que participaram ÷ Nº de profissionais da categoria elegíveis) × 100
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.adesaoPorCategoria.byCategory.map(cat => (
                <div key={cat.category} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{cat.category}</p>
                    <p className="text-[11px] text-slate-400">
                      {cat.participantsCount} participaram de {cat.eligibleCount} elegíveis
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-400">{cat.rate}%</span>
                    <span className={`block text-[10px] font-bold ${cat.isGoalMet ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {cat.isGoalMet ? 'Meta Atingida' : 'Em Acompanhamento'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Taxa de Cancelamento de Ações de EP */}
        {activeDetailTab === 5 && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Indicador 5: Taxa de Cancelamento das Ações de Educação Permanente
                </h3>
                <span className="px-2 py-0.5 text-xs font-bold bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                  Meta Oficial: ≤ 10% (Quanto menor, melhor)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                <strong>Objetivo:</strong> Mensurar a proporção de ações planejadas que foram canceladas e registrar as causas-raiz para melhoria contínua.
              </p>
              <div className="text-xs font-mono text-rose-400 pt-1">
                Fórmula: (Nº de treinamentos cancelados no período ÷ Nº total de treinamentos planejados) × 100
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Breakdown by reason */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Distribuição dos Motivos de Cancelamento
                </h4>
                {report.taxaCancelamento.reasonsBreakdown.length > 0 ? (
                  <div className="space-y-2">
                    {report.taxaCancelamento.reasonsBreakdown.map((r, idx) => (
                      <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                        <span className="text-xs text-slate-300">{r.reason}</span>
                        <div className="text-right">
                          <span className="text-xs font-bold text-rose-400">{r.count} ação(ões)</span>
                          <span className="text-[10px] text-slate-500 block">({r.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Nenhum cancelamento registrado no período.</p>
                )}
              </div>

              {/* Cancelled actions list */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Ações Canceladas no Período
                </h4>
                <div className="space-y-2">
                  {actions.filter(a => a.status === 'cancelada').map(act => (
                    <div key={act.id} className="p-3 bg-rose-950/20 border border-rose-800/30 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{act.title}</span>
                        <span className="text-[10px] font-mono text-rose-400">{act.code}</span>
                      </div>
                      <p className="text-[11px] text-rose-200/80">
                        <strong>Motivo:</strong> {act.cancellationReason || 'Cancelamento operacional.'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {act.unitName} • Categoria: {act.cancellationCategory || 'Geral'}
                      </p>
                    </div>
                  ))}
                  {actions.filter(a => a.status === 'cancelada').length === 0 && (
                    <p className="text-xs text-slate-500 italic">Nenhuma ação cancelada.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: % de Treinamentos Vinculados à ESR */}
        {activeDetailTab === 6 && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Indicador 6: Percentual de Treinamentos Vinculados à Escola de Saúde do Recife (ESR)
                </h3>
                <span className="px-2 py-0.5 text-xs font-bold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                  Meta: A definir (Monitoramento de Parceria)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                <strong>Objetivo:</strong> Mensurar a proporção de treinamentos ofertados pelos NEPS vinculados à SERMAC realizados em parceria ou vinculados à Escola de Saúde do Recife (ESR).
              </p>
              <div className="text-xs font-mono text-purple-400 pt-1">
                Fórmula: (Nº de treinamentos vinculados à ESR realizados ÷ Nº total de treinamentos realizados) × 100
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Tipos de Vínculo com a ESR
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-slate-300">Parceria Pedagógica ESR</span>
                    <span className="text-xs font-bold text-purple-400">Ativo na Rede</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-slate-300">Certificação Oficial ESR</span>
                    <span className="text-xs font-bold text-purple-400">Homologado</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-slate-300">Instrutoria e Tutoria Compartilhada</span>
                    <span className="text-xs font-bold text-purple-400">Em Expansão</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-950/20 border border-purple-800/30 rounded-xl flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Integração Ensino-Serviço ESR
                  </h4>
                  <p className="text-xs text-purple-200/80 leading-relaxed">
                    A articulação entre a SERMAC, os NEPS locais e a Escola de Saúde do Recife fortalece a qualificação continuada do SUS, unificando trilhas de aprendizagem e diretrizes pedagógicas em toda a média e alta complexidade.
                  </p>
                </div>
                <div className="pt-4 border-t border-purple-800/30 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total com Vinculação ESR:</span>
                  <span className="text-xl font-black text-purple-400">{report.vinculacaoESR.rate}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
