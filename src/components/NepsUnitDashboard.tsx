import React, { useState, useMemo } from 'react';
import { 
  HealthUnit, 
  TrainingAction, 
  AttendanceRecord, 
  TrainingNeedDNC,
  UnitStaffCensus,
  ProfessionalCategory,
  ThematicAxis 
} from '../types';
import { OfficialIndicatorsPanel } from './OfficialIndicatorsPanel';
import { 
  ALL_THEMATIC_AXES, 
  ALL_PROFESSIONAL_CATEGORIES 
} from '../data/mockData';
import { 
  Building, 
  Plus, 
  Users, 
  Clock, 
  Award, 
  CheckCircle2, 
  Key, 
  Star, 
  Search, 
  ChevronRight, 
  Send, 
  Calendar, 
  Filter, 
  AlertCircle,
  FileSpreadsheet,
  QrCode,
  Target,
  UserCheck,
  Ban
} from 'lucide-react';

interface NepsUnitDashboardProps {
  unit: HealthUnit;
  actions: TrainingAction[];
  attendance: AttendanceRecord[];
  dncList: TrainingNeedDNC[];
  censusList?: UnitStaffCensus[];
  onOpenNewAction: () => void;
  onSelectAction: (action: TrainingAction) => void;
  onOpenCertificate: (record: AttendanceRecord) => void;
  onSubmitDNC: (dnc: Omit<TrainingNeedDNC, 'id' | 'dateReported' | 'status'>) => void;
  onOpenCensusModal?: (unit: HealthUnit) => void;
  onOpenCancelModal?: (action: TrainingAction) => void;
}

export const NepsUnitDashboard: React.FC<NepsUnitDashboardProps> = ({
  unit,
  actions = [],
  attendance = [],
  dncList = [],
  censusList = [],
  onOpenNewAction,
  onSelectAction,
  onOpenCertificate,
  onSubmitDNC,
  onOpenCensusModal,
  onOpenCancelModal
}) => {
  const [activeTab, setActiveTab] = useState<'acoes' | 'indicadores' | 'frequencias' | 'solicitar_dnc'>('acoes');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'planejada' | 'em_andamento' | 'concluida' | 'cancelada'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // DNC Form States
  const [dncTheme, setDncTheme] = useState('');
  const [dncAxis, setDncAxis] = useState<ThematicAxis>(ALL_THEMATIC_AXES[0]);
  const [dncJustification, setDncJustification] = useState('');
  const [dncTargetCategories, setDncTargetCategories] = useState<ProfessionalCategory[]>(['Enfermeiro(a)']);
  const [dncUrgency, setDncUrgency] = useState<'Baixa' | 'Média' | 'Alta' | 'Crítica'>('Alta');
  const [dncSuccess, setDncSuccess] = useState(false);

  // Unit-specific data filters
  const unitActions = useMemo(() => {
    return actions.filter(a => a.unitId === unit.id);
  }, [actions, unit.id]);

  const unitAttendance = useMemo(() => {
    return attendance.filter(a => a.unitId === unit.id || a.participantUnitId === unit.id);
  }, [attendance, unit.id]);

  const unitDnc = useMemo(() => {
    return dncList.filter(d => d.unitId === unit.id);
  }, [dncList, unit.id]);

  // Unit Metrics
  const unitMetrics = useMemo(() => {
    const presentRecords = unitAttendance.filter(r => r.status === 'presente');
    const totalAttendances = presentRecords.length;
    const uniqueTrained = new Set(presentRecords.map(r => r.cpf)).size;
    const coveragePercent = unit.totalStaff > 0 ? Math.min(100, Math.round((uniqueTrained / unit.totalStaff) * 100)) : 0;
    const totalHours = unitActions.reduce((acc, a) => acc + (a.workloadHours * (a.attendedCount || 1)), 0);

    const feedbackRecords = unitAttendance.filter(r => r.feedback && r.feedback.satisfactionRating);
    const avgSatisfaction = feedbackRecords.length > 0
      ? (feedbackRecords.reduce((acc, r) => acc + (r.feedback?.satisfactionRating || 5), 0) / feedbackRecords.length).toFixed(1)
      : '4.8';

    return {
      totalActions: unitActions.length,
      totalAttendances,
      uniqueTrained,
      coveragePercent,
      totalHours,
      avgSatisfaction
    };
  }, [unit, unitActions, unitAttendance]);

  const filteredActions = unitActions.filter(action => {
    const matchesStatus = statusFilter === 'todos' || action.status === statusFilter;
    const matchesSearch = !searchTerm || 
      action.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      action.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleDncSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dncTheme || !dncJustification) return;

    onSubmitDNC({
      unitId: unit.id,
      unitName: unit.name,
      suggestedTheme: dncTheme,
      thematicAxis: dncAxis,
      justification: dncJustification,
      targetCategories: dncTargetCategories,
      urgency: dncUrgency,
      requestedBy: unit.coordinatorName
    });

    setDncTheme('');
    setDncJustification('');
    setDncSuccess(true);
    setTimeout(() => setDncSuccess(false), 4000);
  };

  const handleToggleDncCategory = (cat: ProfessionalCategory) => {
    if (dncTargetCategories.includes(cat)) {
      if (dncTargetCategories.length > 1) {
        setDncTargetCategories(dncTargetCategories.filter(c => c !== cat));
      }
    } else {
      setDncTargetCategories([...dncTargetCategories, cat]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HIGH DENSITY 4-COL KPI METRICS FOR NEPS UNIT */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        
        {/* KPI 1: Profissionais Treinados */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-300 shadow-xs hover:border-slate-400 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Treinados na Unidade
            </p>
            <div className="w-7 h-7 rounded bg-[#EBF2FC] text-[#0C326F] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#0C326F] tracking-tight">{unitMetrics.uniqueTrained}</span>
            <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{unitMetrics.coveragePercent}% cobertura</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#1351B4] rounded-full" style={{ width: `${unitMetrics.coveragePercent}%` }}></div>
          </div>
        </div>

        {/* KPI 2: Ações de Treinamento */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-300 shadow-xs hover:border-slate-400 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Ações Educativas
            </p>
            <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#0C326F] tracking-tight">{unitMetrics.totalActions}</span>
            <span className="text-xs text-slate-600 font-semibold">Meta trimestral: 6</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(100, (unitMetrics.totalActions / 6) * 100)}%` }}></div>
          </div>
        </div>

        {/* KPI 3: Horas Ministradas */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-300 shadow-xs hover:border-slate-400 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Carga Horária Cumprida
            </p>
            <div className="w-7 h-7 rounded bg-blue-50 text-[#1351B4] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#0C326F] tracking-tight">{unitMetrics.totalHours}h</span>
            <span className="text-xs text-[#1351B4] font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Acumulado</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#1351B4] rounded-full w-[74%]"></div>
          </div>
        </div>

        {/* KPI 4: Avaliação dos Alunos */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-300 shadow-xs hover:border-slate-400 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Avaliação de Reação
            </p>
            <div className="w-7 h-7 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#0C326F] tracking-tight flex items-center gap-1">
              {unitMetrics.avgSatisfaction}
            </span>
            <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">/ 5.0 Tracer</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full w-[96%]"></div>
          </div>
        </div>

      </div>

      {/* TABS NAVIGATION */}
      <div className="bg-white p-1 rounded-lg border border-slate-300 shadow-xs text-xs font-bold flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('acoes')}
            className={`py-2.5 px-3.5 rounded flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'acoes'
                ? 'bg-[#1351B4] text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 font-semibold'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Ações ({unitActions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('indicadores')}
            className={`py-2.5 px-3.5 rounded flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'indicadores'
                ? 'bg-[#0C326F] text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 font-semibold'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Indicadores & Metas</span>
          </button>

          <button
            onClick={() => setActiveTab('frequencias')}
            className={`py-2.5 px-3.5 rounded flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'frequencias'
                ? 'bg-[#1351B4] text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 font-semibold'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Frequências ({unitAttendance.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('solicitar_dnc')}
            className={`py-2.5 px-3.5 rounded flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'solicitar_dnc'
                ? 'bg-[#1351B4] text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 font-semibold'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Solicitar DNC</span>
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {onOpenCensusModal && (
            <button
              onClick={() => onOpenCensusModal(unit)}
              className="bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Atualizar quadro de servidores ativos para o cálculo do Índice de Atividade da EP"
            >
              <Users className="w-3.5 h-3.5 text-teal-700" />
              <span>Censo de Ativos ({unit.totalStaff})</span>
            </button>
          )}

          <button
            onClick={onOpenNewAction}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Treinamento</span>
          </button>
        </div>
      </div>

      {/* TAB: INDICADORES E CENSO DE ATIVOS */}
      {activeTab === 'indicadores' && (
        <div className="space-y-4">
          <OfficialIndicatorsPanel
            units={[unit]}
            actions={actions}
            attendance={attendance}
            censusList={censusList}
            onOpenCensusModal={onOpenCensusModal}
          />
        </div>
      )}

      {/* TAB 1: UNIT ACTIONS */}
      {activeTab === 'acoes' && (
        <div className="space-y-4">
          
          {/* Action Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-semibold">Filtrar:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-xs rounded-md px-2.5 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
              >
                <option value="todos">Todos os Status</option>
                <option value="planejada">Planejada</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluida">Concluída</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por tema ou código..."
                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredActions.length === 0 ? (
              <div className="col-span-2 text-center py-10 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs space-y-2">
                <Calendar className="w-7 h-7 text-slate-300 mx-auto" />
                <p>Nenhuma ação educativa encontrada para os filtros selecionados.</p>
                <button
                  onClick={onOpenNewAction}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Clique aqui para cadastrar a primeira capacitação da unidade
                </button>
              </div>
            ) : (
              filteredActions.map((action) => (
                <div
                  key={action.id}
                  onClick={() => onSelectAction(action)}
                  className="bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 p-4 rounded-xl transition cursor-pointer shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-slate-100 text-slate-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                        {action.code}
                      </span>
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded">
                        {action.modality}
                      </span>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      action.status === 'concluida' ? 'bg-emerald-100 text-emerald-800' :
                      action.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {action.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-xs text-slate-900 leading-snug">
                      {action.title}
                    </h3>
                    <p className="text-[10px] text-blue-700 font-semibold mt-0.5">
                      {action.thematicAxis}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Docente</span>
                      <span className="font-semibold text-slate-800 truncate block">{action.instructorName}</span>
                      <span className="text-[10px] text-slate-500">{action.instructorCategory}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Carga & Data</span>
                      <span className="font-semibold text-slate-800 block">{action.workloadHours} horas</span>
                      <span className="text-[10px] text-slate-500">{action.dateStart}</span>
                    </div>
                  </div>

                  {/* Footer with PIN Badge and Attendees */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 bg-slate-900 text-blue-300 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                      <Key className="w-3 h-3 text-blue-400" />
                      <span>PIN: {action.checkinPin}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px]">
                        Presentes: <strong className="text-slate-900 font-mono">{action.attendedCount || 0}</strong> / {action.maxSeats}
                      </span>
                      <span className="text-blue-600 font-bold text-xs flex items-center">
                        Gerenciar <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* TAB 2: ATTENDANCE RECORDS */}
      {activeTab === 'frequencias' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Frequências Registradas na Unidade</h3>
              <p className="text-[11px] text-slate-400">Total de {unitAttendance.length} presenças registradas</p>
            </div>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                  <th className="pb-2 font-bold">Profissional</th>
                  <th className="pb-2 font-bold">Categoria</th>
                  <th className="pb-2 font-bold">Treinamento</th>
                  <th className="pb-2 font-bold text-center">Carga</th>
                  <th className="pb-2 font-bold text-center">Data</th>
                  <th className="pb-2 font-bold text-center">Avaliação</th>
                  <th className="pb-2 font-bold text-right">Declaração</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                {unitAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 font-semibold text-slate-800">
                      {rec.participantName}
                      <span className="block text-[10px] text-slate-400 font-mono">{rec.cpf}</span>
                    </td>
                    <td className="py-2.5 text-slate-600 font-medium">
                      {rec.professionalCategory}
                    </td>
                    <td className="py-2.5 text-slate-800">
                      <span className="font-semibold block">{rec.actionTitle}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{rec.actionCode}</span>
                    </td>
                    <td className="py-2.5 text-center font-mono font-bold text-slate-900">{rec.workloadHours}h</td>
                    <td className="py-2.5 text-center text-slate-500 text-[11px]">{rec.date}</td>
                    <td className="py-2.5 text-center">
                      {rec.feedback ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-xs">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {rec.feedback.satisfactionRating}.0
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Pendente</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onOpenCertificate(rec)}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition"
                      >
                        Certificado
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REQUEST TRAINING NEED (DNC) */}
      {activeTab === 'solicitar_dnc' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Levantamento de Necessidades de Capacitação (DNC)</h3>
            <p className="text-[11px] text-slate-400">Identificou uma situação-problema na unidade? Submeta para a Coordenação Central SERMAC</p>
          </div>

          <div className="p-4 space-y-4">
            {dncSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-lg flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Demanda encaminhada com sucesso para o observatório SERMAC!</span>
              </div>
            )}

            <form onSubmit={handleDncSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tema da Capacitação Proposta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={dncTheme}
                    onChange={(e) => setDncTheme(e.target.value)}
                    placeholder="Ex: Manejo Clínico da Sífilis Congênita e Testes Rápidos na Atenção Primária"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Eixo Temático Estratégico <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dncAxis}
                    onChange={(e) => setDncAxis(e.target.value as ThematicAxis)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {ALL_THEMATIC_AXES.map((axis) => (
                      <option key={axis} value={axis}>{axis}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Grau de Urgência na Unidade <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dncUrgency}
                    onChange={(e) => setDncUrgency(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Baixa">Baixa (Aprimoramento contínuo)</option>
                    <option value="Média">Média (Ajuste de fluxos)</option>
                    <option value="Alta">Alta (Impacto assistencial direto)</option>
                    <option value="Crítica">Crítica (Risco assistencial ou epidemiológico)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Justificativa Pedagógica & Situação-Problema na Unidade <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={dncJustification}
                    onChange={(e) => setDncJustification(e.target.value)}
                    placeholder="Explique o motivo da solicitação, aumento de casos, novos protocolos ou dificuldades identificadas..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Target categories */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Público-Alvo que Necessita da Formação
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {ALL_PROFESSIONAL_CATEGORIES.slice(0, 10).map((cat) => {
                    const isChecked = dncTargetCategories.includes(cat);
                    return (
                      <label key={cat} className="flex items-center space-x-1.5 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleDncCategory(cat)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="truncate">{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  id="btn-submit-dnc"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Demanda para SERMAC</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HIGH DENSITY ACTION CALLOUT BANNER */}
      <div className="bg-blue-900 text-white rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 shadow-lg shadow-blue-900/20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shrink-0">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <p className="text-xs font-bold">Multiplicador Local NEPS Ativo</p>
            <p className="text-xs text-blue-200 mt-0.5">
              Compartilhe o código PIN de auto-check-in no início da sessão com os participantes para registro instantâneo e liberação de declarações funcionais.
            </p>
          </div>
        </div>
        <button 
          onClick={onOpenNewAction}
          className="bg-white text-blue-900 text-[10px] font-bold uppercase px-4 py-2 rounded shadow-xs hover:bg-blue-50 transition-colors shrink-0"
        >
          Novo Treinamento
        </button>
      </div>

    </div>
  );
};
