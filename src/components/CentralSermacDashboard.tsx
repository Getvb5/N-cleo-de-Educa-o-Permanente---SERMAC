import React, { useState, useMemo } from 'react';
import { 
  HealthUnit, 
  TrainingAction, 
  AttendanceRecord, 
  TrainingNeedDNC,
  UnitStaffCensus,
  ProfessionalCategory,
  InstructorCategory,
  ThematicAxis 
} from '../types';
import { OfficialIndicatorsPanel } from './OfficialIndicatorsPanel';
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
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { 
  Building2, 
  Users, 
  Clock, 
  Award, 
  Star, 
  Sparkles, 
  FileText, 
  Download, 
  Filter, 
  Layers, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  Search,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Building,
  Check,
  Target
} from 'lucide-react';

interface CentralSermacDashboardProps {
  units: HealthUnit[];
  actions: TrainingAction[];
  attendance: AttendanceRecord[];
  dncList: TrainingNeedDNC[];
  censusList?: UnitStaffCensus[];
  onOpenAiDiagnosis: () => void;
  onOpenPaepsPlan: () => void;
  onSelectAction: (action: TrainingAction) => void;
  onUpdateDncStatus: (id: string, status: TrainingNeedDNC['status']) => void;
  onOpenCensusModal?: (unit: HealthUnit) => void;
}

const COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#0ea5e9', '#14b8a6', '#f97316'];

export const CentralSermacDashboard: React.FC<CentralSermacDashboardProps> = ({
  units = [],
  actions = [],
  attendance = [],
  dncList = [],
  censusList = [],
  onOpenAiDiagnosis,
  onOpenPaepsPlan,
  onSelectAction,
  onUpdateDncStatus,
  onOpenCensusModal
}) => {
  const [activeTab, setActiveTab] = useState<'indicadores_oficiais' | 'indicadores' | 'quem_treina_quem' | 'unidades' | 'dnc' | 'acoes'>('indicadores_oficiais');
  const [searchTerm, setSearchTerm] = useState('');

  // Consolidated Key Indicators
  const metrics = useMemo(() => {
    const totalStaff = units.reduce((acc, u) => acc + u.totalStaff, 0);
    const totalActions = actions.length;
    const completedActions = actions.filter(a => a.status === 'concluida').length;
    const presentRecords = attendance.filter(a => a.status === 'presente');
    const totalAttendances = presentRecords.length;
    
    // Unique participants by CPF/Matrícula
    const uniqueParticipants = new Set(presentRecords.map(r => r.cpf || r.registrationNumber)).size;
    const globalCoverage = totalStaff > 0 ? Math.min(100, Math.round((uniqueParticipants / totalStaff) * 100)) : 0;
    
    const totalHoursDelivered = actions.reduce((acc, a) => acc + (a.workloadHours * (a.attendedCount || 1)), 0);

    const feedbackRecords = attendance.filter(a => a.feedback && a.feedback.satisfactionRating);
    const avgSatisfaction = feedbackRecords.length > 0
      ? (feedbackRecords.reduce((acc, a) => acc + (a.feedback?.satisfactionRating || 5), 0) / feedbackRecords.length).toFixed(1)
      : '4.9';

    // Unique instructors count
    const uniqueInstructors = new Set(actions.map(a => a.instructorName)).size;
    const pendingDncCount = dncList.filter(d => d.status === 'Pendente').length;

    return {
      totalStaff,
      totalActions,
      completedActions,
      totalAttendances,
      uniqueParticipants,
      globalCoverage,
      totalHoursDelivered,
      avgSatisfaction,
      uniqueInstructors,
      pendingDncCount
    };
  }, [units, actions, attendance, dncList]);

  // Chart Data: Trained Categories Hours & Count
  const categoriesChartData = useMemo(() => {
    const counts: Record<string, { category: string; count: number; hours: number }> = {};
    attendance.forEach(att => {
      const cat = att.professionalCategory;
      if (!counts[cat]) {
        counts[cat] = { category: cat.replace(' da Família / Clínico', '').replace(' Especialista / Emergencista', ''), count: 0, hours: 0 };
      }
      counts[cat].count += 1;
      counts[cat].hours += att.workloadHours;
    });

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [attendance]);

  // Chart Data: Instructor Categories
  const instructorCategoriesData = useMemo(() => {
    const counts: Record<string, number> = {};
    actions.forEach(a => {
      counts[a.instructorCategory] = (counts[a.instructorCategory] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    }));
  }, [actions]);

  // Chart Data: Thematic Axes Distribution
  const thematicAxesData = useMemo(() => {
    const counts: Record<string, { axis: string; actionsCount: number; hours: number }> = {};
    actions.forEach(a => {
      if (!counts[a.thematicAxis]) {
        counts[a.thematicAxis] = { axis: a.thematicAxis, actionsCount: 0, hours: 0 };
      }
      counts[a.thematicAxis].actionsCount += 1;
      counts[a.thematicAxis].hours += a.workloadHours;
    });

    return Object.values(counts);
  }, [actions]);

  // "Quem Treina Quem" Cross-Tabulation Matrix
  const crossMatrixData = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};

    actions.forEach(action => {
      const instCat = action.instructorCategory;
      if (!matrix[instCat]) matrix[instCat] = {};

      const actionAttendees = attendance.filter(a => a.actionId === action.id);
      actionAttendees.forEach(att => {
        const partCat = att.professionalCategory;
        matrix[instCat][partCat] = (matrix[instCat][partCat] || 0) + 1;
      });
    });

    return matrix;
  }, [actions, attendance]);

  // Unit Rankings
  const unitPerformanceData = useMemo(() => {
    return units.map(unit => {
      const unitActions = actions.filter(a => a.unitId === unit.id);
      const unitAttendance = attendance.filter(a => a.participantUnitId === unit.id);
      const uniqueUnitTrained = new Set(unitAttendance.map(a => a.cpf)).size;
      const coveragePercent = Math.min(100, Math.round((uniqueUnitTrained / (unit.totalStaff || 1)) * 100));
      const hoursAccum = unitAttendance.reduce((acc, a) => acc + a.workloadHours, 0);

      return {
        ...unit,
        actionsCount: unitActions.length,
        attendancesCount: unitAttendance.length,
        uniqueTrained: uniqueUnitTrained,
        coveragePercent,
        hoursAccum
      };
    }).sort((a, b) => b.coveragePercent - a.coveragePercent);
  }, [units, actions, attendance]);

  const handleExportCSV = () => {
    const headers = 'Código;Tema;Eixo Temático;Unidade;Docente;Categoria Instrutora;Carga Horária;Modalidade;Presentes;Status\n';
    const rows = actions.map(a => 
      `"${a.code}";"${a.title}";"${a.thematicAxis}";"${a.unitName}";"${a.instructorName}";"${a.instructorCategory}";"${a.workloadHours}";"${a.modality}";"${a.attendedCount}";"${a.status}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SERMAC_Relatorio_Consolidado_EPS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* HIGH DENSITY 4-COL KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        
        {/* KPI 1: Total Treinados */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Total de Treinados
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.totalAttendances}</span>
            <span className="text-xs text-emerald-600 font-semibold">{metrics.uniqueParticipants} únicos</span>
          </div>
          <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (metrics.uniqueParticipants / (metrics.totalStaff || 1)) * 100)}%` }}></div>
          </div>
        </div>

        {/* KPI 2: Instrutores Ativos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Instrutores Ativos
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.uniqueInstructors}</span>
            <span className="text-xs text-slate-400 font-medium">Meta: 20</span>
          </div>
          <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (metrics.uniqueInstructors / 20) * 100)}%` }}></div>
          </div>
        </div>

        {/* KPI 3: Horas de Treinamento */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Horas de Treinamento
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.totalHoursDelivered}h</span>
            <span className="text-xs text-blue-600 font-medium">{metrics.totalActions} ações</span>
          </div>
          <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-[68%]"></div>
          </div>
        </div>

        {/* KPI 4: Pendências Registro / DNC */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Demandas DNC Pendentes
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600">0{metrics.pendingDncCount}</span>
            <span className="text-xs text-red-500 font-medium">Requer Análise</span>
          </div>
          <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-500" style={{ width: `${Math.min(100, metrics.pendingDncCount * 25)}%` }}></div>
          </div>
        </div>

      </div>

      {/* TABS NAVIGATION */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs font-semibold flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('indicadores_oficiais')}
          className={`py-2 px-3.5 rounded-lg flex items-center gap-2 transition shrink-0 ${
            activeTab === 'indicadores_oficiais'
              ? 'bg-teal-600 text-white font-semibold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Indicadores Oficiais SERMAC / NEPS</span>
        </button>

        <button
          onClick={() => setActiveTab('indicadores')}
          className={`py-2 px-3.5 rounded-lg flex items-center gap-2 transition shrink-0 ${
            activeTab === 'indicadores'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Visão Operacional Geral</span>
        </button>

        <button
          onClick={() => setActiveTab('quem_treina_quem')}
          className={`py-2 px-3.5 rounded-lg flex items-center gap-2 transition shrink-0 ${
            activeTab === 'quem_treina_quem'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Matriz "Quem Treina Quem"</span>
        </button>

        <button
          onClick={() => setActiveTab('unidades')}
          className={`py-2 px-3.5 rounded-lg flex items-center gap-2 transition shrink-0 ${
            activeTab === 'unidades'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Ranking de Unidades</span>
        </button>

        <button
          onClick={() => setActiveTab('dnc')}
          className={`py-2 px-3.5 rounded-lg flex items-center gap-2 transition shrink-0 ${
            activeTab === 'dnc'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Demandas DNC ({dncList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('acoes')}
          className={`py-2 px-3.5 rounded-lg flex items-center gap-2 transition shrink-0 ${
            activeTab === 'acoes'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Ações Cadastradas ({actions.length})</span>
        </button>

        <div className="ml-auto flex items-center gap-2 pr-1">
          <button
            onClick={onOpenPaepsPlan}
            className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md border border-slate-200 transition flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>LNT 2026</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md border border-slate-200 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* 0. OFFICIAL INDICATORS PANEL (SERMAC / NEPS) */}
      {activeTab === 'indicadores_oficiais' && (
        <OfficialIndicatorsPanel
          units={units}
          actions={actions}
          attendance={attendance}
          censusList={censusList}
          onOpenCensusModal={onOpenCensusModal}
        />
      )}

      {/* 1. INDICATORS / DASHBOARD GERAL */}
      {activeTab === 'indicadores' && (
        <div className="space-y-6">
          
          {/* Main 2-column density grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Table: Distribuição por Categoria Profissional */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Distribuição por Categoria Profissional
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Aderência e volume de treinados por categoria do SUS
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-[10px] text-slate-500">Técnico / Médio</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span className="text-[10px] text-slate-500">Nível Superior</span>
                  </div>
                </div>
              </div>

              <div className="p-4 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                      <th className="pb-2 font-bold">Categoria</th>
                      <th className="pb-2 font-bold text-center">Público Estimado</th>
                      <th className="pb-2 font-bold text-center">Treinados</th>
                      <th className="pb-2 font-bold text-right">Cobertura</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-slate-600">
                    <tr className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-800">Enfermagem (Técnicos e Auxiliares)</td>
                      <td className="py-2.5 text-center">850</td>
                      <td className="py-2.5 text-center font-bold text-slate-900">642</td>
                      <td className="py-2.5 text-right text-emerald-600 font-bold">75.5%</td>
                    </tr>
                    <tr className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-800">Médicos (ESF / Plantonistas / Especialistas)</td>
                      <td className="py-2.5 text-center">120</td>
                      <td className="py-2.5 text-center font-bold text-slate-900">84</td>
                      <td className="py-2.5 text-right text-amber-600 font-bold">70.0%</td>
                    </tr>
                    <tr className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-800">Agentes Comunitários de Saúde (ACS / ACE)</td>
                      <td className="py-2.5 text-center">320</td>
                      <td className="py-2.5 text-center font-bold text-slate-900">295</td>
                      <td className="py-2.5 text-right text-emerald-600 font-bold">92.1%</td>
                    </tr>
                    <tr className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-800">Fisioterapia / Fonoaudiologia / Terapia Ocupacional</td>
                      <td className="py-2.5 text-center">45</td>
                      <td className="py-2.5 text-center font-bold text-slate-900">45</td>
                      <td className="py-2.5 text-right text-emerald-600 font-bold">100%</td>
                    </tr>
                    <tr className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-800">Administrativo / Recepção / Regulação</td>
                      <td className="py-2.5 text-center">210</td>
                      <td className="py-2.5 text-center font-bold text-slate-900">115</td>
                      <td className="py-2.5 text-right text-red-500 font-bold">54.7%</td>
                    </tr>
                    <tr className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-800">Serviços Gerais / Higiene / Manutenção</td>
                      <td className="py-2.5 text-center">160</td>
                      <td className="py-2.5 text-center font-bold text-slate-900">148</td>
                      <td className="py-2.5 text-right text-emerald-600 font-bold">92.5%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Card: Temas com Maior Demanda */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm">Temas com Maior Demanda</h3>
                <p className="text-[11px] text-slate-400">Proporção no volume de capacitações</p>
              </div>
              <div className="p-4 space-y-3.5 flex-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">Suporte Básico de Vida (SBV / DEA)</span>
                    <span className="font-bold text-slate-900 font-mono">24%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[24%]"></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">Protocolo de Reconhecimento de Sepse</span>
                    <span className="font-bold text-slate-900 font-mono">18%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[18%]"></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">Segurança do Paciente & Metas Internacionais</span>
                    <span className="font-bold text-slate-900 font-mono">15%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[15%]"></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">Prontuário Eletrônico & e-SUS APS</span>
                    <span className="font-bold text-slate-900 font-mono">12%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[12%]"></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-auto">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Multiplicador Destaque</p>
                      <p className="text-xs font-bold text-slate-800">Dra. Camila Nogueira (Médica)</p>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      12 Sessões
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Secondary Density Row: Eixos do SUS & Quem Ensina */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart: Horas por Categoria */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-800 text-sm">Presenças por Categoria Profissional</h3>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  Top 8 Categorias
                </span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoriesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 9, fill: '#64748b' }} 
                      angle={-15} 
                      textAnchor="end" 
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="count" name="Participantes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart: Quem Ministra (Categorias Instrutoras) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-800 text-sm">Perfil dos Instrutores / Docentes</h3>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  Docência Municipal
                </span>
              </div>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={instructorCategoriesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {instructorCategoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-2 border-t border-slate-100">
                {instructorCategoriesData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-slate-600">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="truncate">{item.name}: <strong>{item.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. "QUEM TREINA QUEM" CROSS-TABULATION MATRIX */}
      {activeTab === 'quem_treina_quem' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Matriz de Disseminação: "Quem Treina Quem"
              </h3>
              <p className="text-[11px] text-slate-400">
                Cruzamento entre a categoria que ministra e as categorias participantes capacitadas
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-200 self-start sm:self-auto">
              Interprofissionalidade no SUS
            </span>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                  <th className="pb-2.5 font-bold min-w-[180px]">Categoria Docente</th>
                  <th className="pb-2.5 font-bold text-center">Enfermagem</th>
                  <th className="pb-2.5 font-bold text-center">Medicina</th>
                  <th className="pb-2.5 font-bold text-center">ACS / ACE</th>
                  <th className="pb-2.5 font-bold text-center">Multiprofissional</th>
                  <th className="pb-2.5 font-bold text-center">Apoio / Recepção</th>
                  <th className="pb-2.5 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(crossMatrixData).map(([instCat, attendeesMap], idx) => {
                  const total = Object.values(attendeesMap).reduce((a, b) => a + b, 0);

                  let enfCount = 0;
                  let medCount = 0;
                  let acsCount = 0;
                  let multiCount = 0;
                  let apoioCount = 0;

                  Object.entries(attendeesMap).forEach(([cat, cnt]) => {
                    if (cat.includes('Enfermagem')) enfCount += cnt;
                    else if (cat.includes('Médico')) medCount += cnt;
                    else if (cat.includes('Agente')) acsCount += cnt;
                    else if (cat.includes('Recepcionista') || cat.includes('Administrativo') || cat.includes('Higienização')) apoioCount += cnt;
                    else multiCount += cnt;
                  });

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-800">{instCat}</td>
                      <td className="py-2.5 text-center font-mono">
                        {enfCount > 0 ? <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">{enfCount}</span> : '-'}
                      </td>
                      <td className="py-2.5 text-center font-mono">
                        {medCount > 0 ? <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">{medCount}</span> : '-'}
                      </td>
                      <td className="py-2.5 text-center font-mono">
                        {acsCount > 0 ? <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">{acsCount}</span> : '-'}
                      </td>
                      <td className="py-2.5 text-center font-mono">
                        {multiCount > 0 ? <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold">{multiCount}</span> : '-'}
                      </td>
                      <td className="py-2.5 text-center font-mono">
                        {apoioCount > 0 ? <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">{apoioCount}</span> : '-'}
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-900 font-mono">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. RANKING DE UNIDADES */}
      {activeTab === 'unidades' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Ranking & Cobertura por Unidade de Saúde</h3>
              <p className="text-[11px] text-slate-400">Total de {units.length} unidades monitoradas em tempo real</p>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
              Meta SUS: 80%
            </span>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                  <th className="pb-2 font-bold">Unidade</th>
                  <th className="pb-2 font-bold">Tipo / Distrito</th>
                  <th className="pb-2 font-bold text-center">Quadro</th>
                  <th className="pb-2 font-bold text-center">Ações</th>
                  <th className="pb-2 font-bold text-center">Horas</th>
                  <th className="pb-2 font-bold text-center">Treinados</th>
                  <th className="pb-2 font-bold text-right">Cobertura</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                {unitPerformanceData.map((unit, idx) => (
                  <tr key={unit.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 font-semibold text-slate-800 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[9px]">
                        {idx + 1}
                      </span>
                      <span>{unit.name}</span>
                    </td>
                    <td className="py-2.5 text-slate-500">
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px]">
                        {unit.type}
                      </span>
                      <span className="text-slate-400 text-[10px] ml-1.5">{unit.district}</span>
                    </td>
                    <td className="py-2.5 text-center font-mono">{unit.totalStaff}</td>
                    <td className="py-2.5 text-center font-mono font-semibold text-blue-600">{unit.actionsCount}</td>
                    <td className="py-2.5 text-center font-mono">{unit.hoursAccum}h</td>
                    <td className="py-2.5 text-center font-mono font-bold text-slate-900">{unit.uniqueTrained}</td>
                    <td className="py-2.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <span className={`font-mono font-bold ${
                          unit.coveragePercent >= 75 ? 'text-emerald-600' :
                          unit.coveragePercent >= 50 ? 'text-amber-600' : 'text-red-500'
                        }`}>
                          {unit.coveragePercent}%
                        </span>
                        <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden sm:block">
                          <div 
                            className={`h-full ${
                              unit.coveragePercent >= 75 ? 'bg-emerald-500' :
                              unit.coveragePercent >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${unit.coveragePercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. DEMANDAS DNC */}
      {activeTab === 'dnc' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Levantamento de Necessidades (DNC)</h3>
              <p className="text-[11px] text-slate-400">Demandas formativas submetidas pelos núcleos locais NEPS</p>
            </div>
            <button
              onClick={onOpenPaepsPlan}
              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md shadow-xs transition"
            >
              Consolidar no LNT
            </button>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {dncList.map((dnc) => (
              <div key={dnc.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2.5 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      dnc.urgency === 'Crítica' ? 'bg-red-100 text-red-700' :
                      dnc.urgency === 'Alta' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {dnc.urgency}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{dnc.dateReported}</span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 leading-snug">
                    {dnc.suggestedTheme}
                  </h4>

                  <p className="text-[11px] text-slate-600">
                    <strong>Unidade:</strong> {dnc.unitName}
                  </p>

                  <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-200">
                    "{dnc.justification}"
                  </p>

                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {dnc.targetCategories.map((c, i) => (
                      <span key={i} className="bg-slate-200 text-slate-700 text-[9px] font-medium px-1.5 py-0.5 rounded">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Status: <strong className="text-slate-800">{dnc.status.replace('_', ' ').replace('PAEPS', 'LNT')}</strong>
                  </span>
                  
                  {dnc.status === 'Pendente' && (
                    <button
                      onClick={() => onUpdateDncStatus(dnc.id, 'Aprovado_LNT')}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded shadow-2xs transition"
                    >
                      Aprovar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TODAS AS AÇÕES CADASTRADAS */}
      {activeTab === 'acoes' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Catálogo Geral de Ações Educativas</h3>
              <p className="text-[11px] text-slate-400">Total de {actions.length} capacitações registradas no município</p>
            </div>
            
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por tema ou código..."
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-64"
            />
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {actions
              .filter(a => !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.code.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((act) => (
                <div 
                  key={act.id} 
                  onClick={() => onSelectAction(act)}
                  className="bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 p-3.5 rounded-xl transition cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-slate-200 text-slate-800 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {act.code}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      act.status === 'concluida' ? 'bg-emerald-100 text-emerald-800' :
                      act.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {act.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-snug">
                      {act.title}
                    </h4>
                    <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">
                      {act.thematicAxis}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <p><strong>Unidade:</strong> {act.unitName}</p>
                    <p><strong>Docente:</strong> {act.instructorName} ({act.instructorCategory})</p>
                    <p><strong>Carga Horária:</strong> {act.workloadHours}h • {act.modality}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Presentes: <strong className="text-slate-900">{act.attendedCount || 0}</strong> / {act.maxSeats}</span>
                    <span className="text-blue-600 font-bold flex items-center gap-1">
                      Ver Ficha <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
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
            <p className="text-xs font-bold">Ação Recomendada (Coordenação NEPS / SERMAC)</p>
            <p className="text-xs text-blue-200 mt-0.5">
              Unidade Hospitalar Norte apresenta baixa frequência no tema 'Protocolo de Reconhecimento de Sepse'. Recomendado agendamento de reforço para equipe noturna.
            </p>
          </div>
        </div>
        <button 
          onClick={onOpenAiDiagnosis}
          className="bg-white text-blue-900 text-[10px] font-bold uppercase px-4 py-2 rounded shadow-xs hover:bg-blue-50 transition-colors shrink-0"
        >
          Diagnóstico com IA
        </button>
      </div>

    </div>
  );
};
