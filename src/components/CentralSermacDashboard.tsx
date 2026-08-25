import React, { useState, useMemo } from 'react';
import { 
  HealthUnit, 
  TrainingAction, 
  AttendanceRecord, 
  TrainingNeedDNC,
  UnitStaffCensus,
  ProfessionalCategory,
  InstructorCategory,
  ThematicAxis,
  Modality
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
  Target,
  RotateCcw,
  BookOpen,
  MapPin,
  HelpCircle,
  Eye,
  Calendar,
  BarChart3,
  ListFilter,
  Ban,
  Pencil,
  Trash2
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
  onOpenCnesModal?: (unitId?: string) => void;
  onOpenCancelModal?: (action: TrainingAction) => void;
  onEditAction?: (action: TrainingAction) => void;
  onDeleteAction?: (actionId: string) => void;
}

const COLORS = ['#1351B4', '#0C326F', '#10b981', '#f59e0b', '#8b5cf6', '#0ea5e9', '#ec4899', '#14b8a6', '#f97316'];

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
  onOpenCensusModal,
  onOpenCnesModal,
  onOpenCancelModal,
  onEditAction,
  onDeleteAction
}) => {
  // Primary Navigation (Organized into 4 clear functional views)
  const [activeTab, setActiveTab] = useState<'indicadores' | 'unidades' | 'acoes' | 'dnc'>('indicadores');
  
  // Sub-view inside Indicadores (Oficiais vs Panorama de Docência)
  const [indicadoresSubTab, setIndicadoresSubTab] = useState<'oficiais' | 'panorama'>('oficiais');

  // Global Filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('all');
  const [selectedAxis, setSelectedAxis] = useState<string>('all');
  const [selectedModality, setSelectedModality] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Available unique districts
  const districts = useMemo(() => {
    const dSet = new Set<string>();
    units.forEach(u => {
      if (u.district) dSet.add(u.district);
    });
    return Array.from(dSet).sort();
  }, [units]);

  // Filtered units based on district selection
  const unitsInDistrict = useMemo(() => {
    if (selectedDistrict === 'all') return units;
    return units.filter(u => u.district === selectedDistrict);
  }, [units, selectedDistrict]);

  // Reset selected unit if it does not belong to the selected district
  const handleDistrictChange = (dist: string) => {
    setSelectedDistrict(dist);
    if (dist !== 'all' && selectedUnitId !== 'all') {
      const unit = units.find(u => u.id === selectedUnitId);
      if (unit && unit.district !== dist) {
        setSelectedUnitId('all');
      }
    }
  };

  // Check active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedDistrict !== 'all') count++;
    if (selectedUnitId !== 'all') count++;
    if (selectedAxis !== 'all') count++;
    if (selectedModality !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    if (searchTerm.trim() !== '') count++;
    return count;
  }, [selectedDistrict, selectedUnitId, selectedAxis, selectedModality, selectedStatus, searchTerm]);

  const handleResetFilters = () => {
    setSelectedDistrict('all');
    setSelectedUnitId('all');
    setSelectedAxis('all');
    setSelectedModality('all');
    setSelectedStatus('all');
    setSearchTerm('');
  };

  // Filtered Actions based on global filters
  const filteredActions = useMemo(() => {
    return actions.filter(action => {
      // 1. District filter
      if (selectedDistrict !== 'all') {
        const u = units.find(unit => unit.id === action.unitId);
        if (!u || u.district !== selectedDistrict) return false;
      }
      // 2. Unit filter
      if (selectedUnitId !== 'all' && action.unitId !== selectedUnitId) {
        return false;
      }
      // 3. Axis filter
      if (selectedAxis !== 'all' && action.thematicAxis !== selectedAxis) {
        return false;
      }
      // 4. Modality filter
      if (selectedModality !== 'all' && action.modality !== selectedModality) {
        return false;
      }
      // 5. Status filter
      if (selectedStatus !== 'all' && action.status !== selectedStatus) {
        return false;
      }
      // 6. Search term filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesTitle = action.title.toLowerCase().includes(query);
        const matchesCode = action.code.toLowerCase().includes(query);
        const matchesInstructor = action.instructorName.toLowerCase().includes(query);
        const matchesUnit = action.unitName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCode && !matchesInstructor && !matchesUnit) return false;
      }
      return true;
    });
  }, [actions, units, selectedDistrict, selectedUnitId, selectedAxis, selectedModality, selectedStatus, searchTerm]);

  // Filtered Attendance Records based on filtered actions and units
  const filteredAttendance = useMemo(() => {
    const filteredActionIds = new Set(filteredActions.map(a => a.id));
    return attendance.filter(att => {
      if (filteredActionIds.size > 0 && !filteredActionIds.has(att.actionId)) {
        return false;
      }
      if (selectedDistrict !== 'all') {
        const u = units.find(unit => unit.id === att.participantUnitId);
        if (!u || u.district !== selectedDistrict) return false;
      }
      if (selectedUnitId !== 'all' && att.participantUnitId !== selectedUnitId) {
        return false;
      }
      return true;
    });
  }, [attendance, filteredActions, units, selectedDistrict, selectedUnitId]);

  // Filtered Units for metrics
  const activeUnits = useMemo(() => {
    if (selectedUnitId !== 'all') {
      return units.filter(u => u.id === selectedUnitId);
    }
    if (selectedDistrict !== 'all') {
      return units.filter(u => u.district === selectedDistrict);
    }
    return units;
  }, [units, selectedDistrict, selectedUnitId]);

  // Consolidated Key Indicators for the Executive Bar
  const metrics = useMemo(() => {
    const totalStaff = activeUnits.reduce((acc, u) => acc + u.totalStaff, 0);
    const totalActions = filteredActions.length;
    const completedActions = filteredActions.filter(a => a.status === 'concluida').length;
    const presentRecords = filteredAttendance.filter(a => a.status === 'presente');
    const totalAttendances = presentRecords.length;
    
    // Unique participants by CPF/Matrícula
    const uniqueParticipants = new Set(presentRecords.map(r => r.cpf || r.registrationNumber)).size;
    
    // Calculate raw percentage
    const rawCoverage = totalStaff > 0 ? (uniqueParticipants / totalStaff) * 100 : 0;
    const formattedCoverage = rawCoverage > 0 && rawCoverage < 1 
      ? rawCoverage.toFixed(1) 
      : Math.round(rawCoverage).toString();
    
    const totalHoursDelivered = filteredActions.reduce((acc, a) => acc + (a.workloadHours * (a.attendedCount || 1)), 0);

    // Unique instructors count
    const uniqueInstructors = new Set(filteredActions.map(a => a.instructorName)).size;
    
    // DNC count for active units
    const activeUnitIds = new Set(activeUnits.map(u => u.id));
    const pendingDncCount = dncList.filter(d => activeUnitIds.has(d.unitId) && d.status === 'Pendente').length;

    return {
      totalStaff,
      totalActions,
      completedActions,
      totalAttendances,
      uniqueParticipants,
      formattedCoverage,
      rawCoverage,
      totalHoursDelivered,
      uniqueInstructors,
      pendingDncCount
    };
  }, [activeUnits, filteredActions, filteredAttendance, dncList]);

  // Chart Data: Categories
  const categoriesChartData = useMemo(() => {
    const counts: Record<string, { category: string; count: number; hours: number }> = {};
    filteredAttendance.forEach(att => {
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
  }, [filteredAttendance]);

  // Chart Data: Instructor Categories
  const instructorCategoriesData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredActions.forEach(a => {
      counts[a.instructorCategory] = (counts[a.instructorCategory] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    }));
  }, [filteredActions]);

  // "Quem Treina Quem" Cross-Tabulation Matrix
  const crossMatrixData = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};

    filteredActions.forEach(action => {
      const instCat = action.instructorCategory;
      if (!matrix[instCat]) matrix[instCat] = {};

      const actionAttendees = filteredAttendance.filter(a => a.actionId === action.id);
      actionAttendees.forEach(att => {
        const partCat = att.professionalCategory;
        matrix[instCat][partCat] = (matrix[instCat][partCat] || 0) + 1;
      });
    });

    return matrix;
  }, [filteredActions, filteredAttendance]);

  // Dynamic categories distribution for Panorama
  const categoryParticipationData = useMemo(() => {
    const catEligibleMap: Record<string, number> = {
      'Enfermagem (Técnicos e Auxiliares)': 850,
      'Médicos (ESF / Plantonistas / Especialistas)': 120,
      'Agentes Comunitários de Saúde (ACS / ACE)': 320,
      'Equipe Multiprofissional (Fisio, Psico, Fono, Nutri)': 45,
      'Administrativo / Recepção / Regulação': 210,
      'Serviços Gerais / Higiene / Transporte': 160
    };

    const catTrainedMap: Record<string, Set<string>> = {
      'Enfermagem (Técnicos e Auxiliares)': new Set(),
      'Médicos (ESF / Plantonistas / Especialistas)': new Set(),
      'Agentes Comunitários de Saúde (ACS / ACE)': new Set(),
      'Equipe Multiprofissional (Fisio, Psico, Fono, Nutri)': new Set(),
      'Administrativo / Recepção / Regulação': new Set(),
      'Serviços Gerais / Higiene / Transporte': new Set()
    };

    filteredAttendance.filter(r => r.status === 'presente').forEach(att => {
      const cat = att.professionalCategory || '';
      const key = att.cpf || att.registrationNumber || att.participantName;
      if (cat.includes('Enferm') || cat.includes('Técnico')) catTrainedMap['Enfermagem (Técnicos e Auxiliares)']?.add(key);
      else if (cat.includes('Médic')) catTrainedMap['Médicos (ESF / Plantonistas / Especialistas)']?.add(key);
      else if (cat.includes('Agente')) catTrainedMap['Agentes Comunitários de Saúde (ACS / ACE)']?.add(key);
      else if (cat.includes('Recepcionista') || cat.includes('Administrativo')) catTrainedMap['Administrativo / Recepção / Regulação']?.add(key);
      else if (cat.includes('Higienização') || cat.includes('Gerais') || cat.includes('Transporte')) catTrainedMap['Serviços Gerais / Higiene / Transporte']?.add(key);
      else catTrainedMap['Equipe Multiprofissional (Fisio, Psico, Fono, Nutri)']?.add(key);
    });

    return Object.entries(catEligibleMap).map(([name, eligible]) => {
      const trainedCount = catTrainedMap[name]?.size || 0;
      const coverage = eligible > 0 ? ((trainedCount / eligible) * 100).toFixed(1) : '0.0';
      return {
        name,
        eligible,
        trained: trainedCount,
        coverage: `${coverage}%`
      };
    });
  }, [filteredAttendance]);

  const topDemandedThemes = useMemo(() => {
    if (filteredActions.length === 0) return [];
    const counts: Record<string, number> = {};
    filteredActions.forEach(a => {
      counts[a.title] = (counts[a.title] || 0) + (a.attendedCount || 1);
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([title, count]) => ({
        title,
        percent: total > 0 ? Math.round((count / total) * 100) : 0
      }));
  }, [filteredActions]);

  const topInstructor = useMemo(() => {
    if (filteredActions.length === 0) return null;
    const instructorCounts: Record<string, { count: number; category: string }> = {};
    filteredActions.forEach(a => {
      if (!instructorCounts[a.instructorName]) {
        instructorCounts[a.instructorName] = { count: 0, category: a.instructorCategory };
      }
      instructorCounts[a.instructorName].count += 1;
    });
    const sorted = Object.entries(instructorCounts).sort((a, b) => b[1].count - a[1].count);
    return sorted.length > 0 ? { name: sorted[0][0], ...sorted[0][1] } : null;
  }, [filteredActions]);

  // Unit Rankings
  const unitPerformanceData = useMemo(() => {
    return activeUnits.map(unit => {
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
  }, [activeUnits, actions, attendance]);

  const handleExportCSV = () => {
    const headers = 'Código;Tema;Eixo Temático;Unidade;Docente;Categoria Instrutora;Carga Horária;Modalidade;Presentes;Status\n';
    const rows = filteredActions.map(a => 
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
    <div className="space-y-5">
      
      {/* 1. EXECUTIVE HEADER */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold tracking-wider bg-[#EBF2FC] text-[#0C326F] border border-[#1351B4]/30 rounded uppercase">
              SERMAC • Gestão Central
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Sistema de Monitoramento Municipal da Educação Permanente
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0C326F] tracking-tight">
            Painel Executivo de Educação Permanente em Saúde
          </h1>
          <p className="text-xs text-slate-600">
            Acompanhamento consolidado das <strong>{units.length} Unidades de Saúde</strong> distribuídas nos <strong>8 Distritos Sanitários</strong> do Recife.
          </p>
        </div>
      </div>

      {/* 2. UNIFIED GLOBAL FILTER BAR */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#1351B4]" />
            <span className="text-xs font-bold text-[#0C326F] uppercase tracking-wider">
              Filtros Estratégicos & Recorte da Rede
            </span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-[#EBF2FC] text-[#0C326F] text-[11px] font-bold rounded-full border border-[#1351B4]/30">
                {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro ativo' : 'filtros ativos'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* 1. Distrito Sanitário */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Distrito Sanitário:
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#1351B4] focus:ring-1 focus:ring-[#1351B4]"
            >
              <option value="all">Todos os Distritos (8 DS)</option>
              {districts.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          {/* 2. Unidade de Saúde */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Unidade de Saúde:
            </label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#1351B4] focus:ring-1 focus:ring-[#1351B4]"
            >
              <option value="all">Todas as Unidades ({unitsInDistrict.length})</option>
              {unitsInDistrict.map(u => (
                <option key={u.id} value={u.id}>
                  {u.code} - {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Eixo Temático */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Eixo Temático:
            </label>
            <select
              value={selectedAxis}
              onChange={(e) => setSelectedAxis(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#1351B4] focus:ring-1 focus:ring-[#1351B4]"
            >
              <option value="all">Todos os Eixos (10 Eixos)</option>
              <option value="Atenção Primária e Saúde da Família">Atenção Primária / ESF</option>
              <option value="Urgência, Emergência e Suporte à Vida">Urgência e Emergência</option>
              <option value="Segurança do Paciente e Controle de Infecções (CCIH)">Segurança do Paciente / CCIH</option>
              <option value="Humanização e Acolhimento com Classificação de Risco">Humanização e Acolhimento</option>
              <option value="Vigilância em Saúde, Arboviroses e Imunização">Vigilância e Imunização</option>
              <option value="Saúde Mental, Drogas e Matriciamento">Saúde Mental / RAPS</option>
              <option value="Saúde da Mulher, Materno-Infantil e Pré-Natal">Saúde da Mulher / Materno</option>
              <option value="Doenças Crônicas Não Transmissíveis (DCNT)">DCNT / Hiperdia</option>
              <option value="Ética, Legislação e Prontuário Eletrônico (e-SUS)">e-SUS / Prontuário</option>
              <option value="Gestão do Trabalho e Liderança Interprofissional">Gestão do Trabalho</option>
            </select>
          </div>

          {/* 4. Modalidade */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Modalidade:
            </label>
            <select
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#1351B4] focus:ring-1 focus:ring-[#1351B4]"
            >
              <option value="all">Todas as Modalidades</option>
              <option value="Presencial">Presencial</option>
              <option value="Híbrido">Híbrido</option>
              <option value="EAD / Online">EAD / Online</option>
            </select>
          </div>

          {/* 5. Busca Textual Rápida */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Busca Rápida:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tema, código, docente..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#1351B4] focus:ring-1 focus:ring-[#1351B4]"
              />
            </div>
          </div>

        </div>
      </div>



      {/* 4. CONSOLIDATED PRIMARY TABS NAVIGATION (4 Clean Views) */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-300 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        
        {/* Tab 1: Indicadores & Desempenho */}
        <button
          type="button"
          onClick={() => setActiveTab('indicadores')}
          className={`py-2 px-4 rounded-lg flex items-center gap-2 transition-all shrink-0 cursor-pointer text-xs ${
            activeTab === 'indicadores'
              ? 'bg-[#0C326F] text-white font-bold shadow-xs'
              : 'text-slate-700 hover:bg-slate-100 font-semibold'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Indicadores & Desempenho</span>
        </button>

        {/* Tab 2: Unidades de Saúde */}
        <button
          type="button"
          onClick={() => setActiveTab('unidades')}
          className={`py-2 px-4 rounded-lg flex items-center gap-2 transition-all shrink-0 cursor-pointer text-xs ${
            activeTab === 'unidades'
              ? 'bg-[#0C326F] text-white font-bold shadow-xs'
              : 'text-slate-700 hover:bg-slate-100 font-semibold'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Unidades de Saúde ({activeUnits.length})</span>
        </button>

        {/* Tab 3: Catálogo de Ações */}
        <button
          type="button"
          onClick={() => setActiveTab('acoes')}
          className={`py-2 px-4 rounded-lg flex items-center gap-2 transition-all shrink-0 cursor-pointer text-xs ${
            activeTab === 'acoes'
              ? 'bg-[#0C326F] text-white font-bold shadow-xs'
              : 'text-slate-700 hover:bg-slate-100 font-semibold'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catálogo de Ações ({filteredActions.length})</span>
        </button>

        {/* Tab 4: Demandas LNT */}
        <button
          type="button"
          onClick={() => setActiveTab('dnc')}
          className={`py-2 px-4 rounded-lg flex items-center gap-2 transition-all shrink-0 cursor-pointer text-xs ${
            activeTab === 'dnc'
              ? 'bg-[#0C326F] text-white font-bold shadow-xs'
              : 'text-slate-700 hover:bg-slate-100 font-semibold'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Demandas Formativas LNT ({dncList.length})</span>
          {metrics.pendingDncCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          )}
        </button>

      </div>

      {/* 5. VIEW CONTENTS */}

      {/* VIEW 1: INDICADORES & DESEMPENHO (UNIFIED VIEW) */}
      {activeTab === 'indicadores' && (
        <div className="space-y-5">
          
          {/* Sub-selector between Official Indicators and Dissemination Analysis */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIndicadoresSubTab('oficiais')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  indicadoresSubTab === 'oficiais'
                    ? 'bg-[#1351B4] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>6 Indicadores Oficiais SERMAC</span>
              </button>

              <button
                type="button"
                onClick={() => setIndicadoresSubTab('panorama')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  indicadoresSubTab === 'panorama'
                    ? 'bg-[#1351B4] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Panorama da Docência & Matriz Intersetorial</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 hidden sm:inline">
              {indicadoresSubTab === 'oficiais' 
                ? 'Metas pactuadas da Educação Permanente' 
                : 'Cruzamento multiprofissional da rede SUS'}
            </span>
          </div>

          {/* Sub-Tab 1: 6 Indicadores Oficiais SERMAC */}
          {indicadoresSubTab === 'oficiais' && (
            <OfficialIndicatorsPanel
              units={activeUnits}
              actions={filteredActions}
              attendance={filteredAttendance}
              censusList={censusList}
              onOpenCensusModal={onOpenCensusModal}
            />
          )}

          {/* Sub-Tab 2: Panorama da Docência & Matriz Intersetorial */}
          {indicadoresSubTab === 'panorama' && (
            <div className="space-y-5">
              
              {/* Top Row: Distribuição por Categoria & Temas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* Table: Distribuição por Categoria */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-300 shadow-xs flex flex-col">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-[#0C326F] text-sm">
                        Distribuição & Adesão por Categoria Profissional
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Volume de profissionais capacitados por categoria na rede
                      </p>
                    </div>
                    <span className="text-[10px] font-bold bg-[#EBF2FC] text-[#0C326F] px-2.5 py-1 rounded border border-[#1351B4]/20">
                      Censo Municipal
                    </span>
                  </div>

                  <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
                          <th className="pb-2.5 font-bold">Categoria Profissional</th>
                          <th className="pb-2.5 font-bold text-center">Público Estimado</th>
                          <th className="pb-2.5 font-bold text-center">Treinados</th>
                          <th className="pb-2.5 font-bold text-right">Cobertura</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                        {categoryParticipationData.map((cat, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 font-semibold text-slate-900">{cat.name}</td>
                            <td className="py-2.5 text-center font-mono">{cat.eligible}</td>
                            <td className="py-2.5 text-center font-bold text-[#0C326F] font-mono">{cat.trained}</td>
                            <td className="py-2.5 text-right font-bold font-mono">
                              <span className={cat.trained > 0 ? 'text-emerald-700' : 'text-slate-400'}>
                                {cat.coverage}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: Temas de Maior Demanda */}
                <div className="bg-white rounded-xl border border-slate-300 shadow-xs flex flex-col">
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="font-bold text-[#0C326F] text-sm">Temas de Maior Demanda</h3>
                    <p className="text-[11px] text-slate-500">Distribuição no volume de capacitações</p>
                  </div>
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    {topDemandedThemes.length > 0 ? (
                      <div className="space-y-3">
                        {topDemandedThemes.map((theme, idx) => {
                          const colors = ['bg-[#1351B4]', 'bg-indigo-600', 'bg-emerald-600', 'bg-amber-500'];
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-700 font-medium truncate max-w-[200px]" title={theme.title}>
                                  {theme.title}
                                </span>
                                <span className="font-bold text-slate-900 font-mono">{theme.percent}%</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${colors[idx % colors.length]} rounded-full`} style={{ width: `${theme.percent}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        Nenhuma ação de treinamento registrada no período
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-200 mt-auto">
                      {topInstructor ? (
                        <div className="flex items-center justify-between p-2.5 bg-[#EBF2FC] rounded-lg border border-[#1351B4]/20">
                          <div>
                            <p className="text-[10px] font-bold text-[#0C326F] uppercase">Docente em Destaque</p>
                            <p className="text-xs font-bold text-slate-900">{topInstructor.name} ({topInstructor.category})</p>
                          </div>
                          <span className="text-[10px] font-bold bg-[#1351B4] text-white px-2 py-0.5 rounded">
                            {topInstructor.count} {topInstructor.count === 1 ? 'Ação' : 'Ações'}
                          </span>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center text-xs text-slate-500">
                          Sem docentes com turmas ativas
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom: Matriz Intersetorial "Quem Treina Quem" */}
              <div className="bg-white rounded-xl border border-slate-300 shadow-xs flex flex-col">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-[#0C326F] text-sm">
                      Matriz Intersetorial: "Quem Treina Quem"
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Cruzamento entre a categoria que ministra e as categorias capacitadas (interprofissionalidade)
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-[#EBF2FC] text-[#0C326F] px-2.5 py-1 rounded border border-[#1351B4]/20 self-start sm:self-auto">
                    Intersetorialidade SUS Recife
                  </span>
                </div>

                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
                        <th className="pb-2.5 font-bold min-w-[200px]">Categoria Docente</th>
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
                            <td className="py-2.5 font-semibold text-slate-900">{instCat}</td>
                            <td className="py-2.5 text-center font-mono">
                              {enfCount > 0 ? <span className="bg-blue-50 text-[#1351B4] px-2 py-0.5 rounded font-bold border border-blue-200">{enfCount}</span> : '-'}
                            </td>
                            <td className="py-2.5 text-center font-mono">
                              {medCount > 0 ? <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold border border-indigo-200">{medCount}</span> : '-'}
                            </td>
                            <td className="py-2.5 text-center font-mono">
                              {acsCount > 0 ? <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">{acsCount}</span> : '-'}
                            </td>
                            <td className="py-2.5 text-center font-mono">
                              {multiCount > 0 ? <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold border border-amber-200">{multiCount}</span> : '-'}
                            </td>
                            <td className="py-2.5 text-center font-mono">
                              {apoioCount > 0 ? <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200">{apoioCount}</span> : '-'}
                            </td>
                            <td className="py-2.5 text-right font-bold text-[#0C326F] font-mono">{total}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* VIEW 2: UNIDADES DE SAÚDE & RANKING */}
      {activeTab === 'unidades' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-[#0C326F] text-sm">Desempenho por Unidade de Saúde</h3>
              <p className="text-[11px] text-slate-500">Exibindo {unitPerformanceData.length} unidades de saúde da rede municipal</p>
            </div>
            <span className="text-[10px] font-bold text-slate-700 uppercase bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              Meta Oficial: ≥ 90%
            </span>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
                  <th className="pb-2.5 font-bold">Unidade de Saúde</th>
                  <th className="pb-2.5 font-bold">CNES / Distrito</th>
                  <th className="pb-2.5 font-bold text-center">Quadro Ativo</th>
                  <th className="pb-2.5 font-bold text-center">Ações</th>
                  <th className="pb-2.5 font-bold text-center">Horas</th>
                  <th className="pb-2.5 font-bold text-center">Únicos Treinados</th>
                  <th className="pb-2.5 font-bold text-right">Índice de Cobertura</th>
                  <th className="pb-2.5 font-bold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                {unitPerformanceData.map(unit => (
                  <tr key={unit.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#1351B4] shrink-0" />
                        <div>
                          <span>{unit.name}</span>
                          <p className="text-[10px] text-slate-500 font-normal">{unit.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">
                      <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {unit.cnes || 'N/D'}
                      </span>
                      <span className="ml-1.5 font-semibold text-slate-500">{unit.district}</span>
                    </td>
                    <td className="py-3 text-center font-mono font-medium text-slate-700">
                      {unit.totalStaff}
                    </td>
                    <td className="py-3 text-center font-mono font-bold text-[#0C326F]">
                      {unit.actionsCount}
                    </td>
                    <td className="py-3 text-center font-mono text-slate-700">
                      {unit.hoursAccum}h
                    </td>
                    <td className="py-3 text-center font-mono font-bold text-[#1351B4]">
                      {unit.uniqueTrained}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`font-mono font-bold ${
                          unit.coveragePercent >= 90 
                            ? 'text-emerald-700' 
                            : unit.coveragePercent >= 70 
                            ? 'text-amber-700' 
                            : 'text-slate-600'
                        }`}>
                          {unit.coveragePercent}%
                        </span>
                        <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              unit.coveragePercent >= 90 
                                ? 'bg-emerald-600' 
                                : unit.coveragePercent >= 70 
                                ? 'bg-amber-500' 
                                : 'bg-slate-400'
                            }`}
                            style={{ width: `${Math.min(100, unit.coveragePercent)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenCnesModal && onOpenCnesModal(unit.id)}
                        className="p-1.5 text-slate-600 hover:text-[#1351B4] hover:bg-[#EBF2FC] rounded transition cursor-pointer"
                        title="Ver ficha CNES e equipe"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: CATÁLOGO DE AÇÕES DE CAPACITAÇÃO */}
      {activeTab === 'acoes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-[#0C326F] text-sm">
                Catálogo de Ações de Educação Permanente
              </h3>
              <p className="text-[11px] text-slate-500">
                {filteredActions.length} ações encontradas de acordo com os filtros selecionados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActions.map(action => (
              <div
                key={action.id}
                onClick={() => onSelectAction(action)}
                className="bg-white rounded-xl border border-slate-300 p-4 hover:border-[#1351B4] hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {action.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        action.status === 'concluida' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : action.status === 'em_andamento'
                          ? 'bg-blue-50 text-[#1351B4] border-blue-200'
                          : action.status === 'cancelada'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {action.status === 'concluida' ? 'Concluída' : action.status === 'em_andamento' ? 'Em Andamento' : action.status === 'cancelada' ? 'Cancelada' : 'Planejada'}
                      </span>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                        {onOpenCancelModal && action.status !== 'cancelada' && action.status !== 'concluida' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCancelModal(action);
                            }}
                            className="p-1 rounded bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition cursor-pointer"
                            title="Cancelar Treinamento (Justificativa Oficial)"
                          >
                            <Ban className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        )}
                        {onEditAction && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditAction(action);
                            }}
                            className="p-1 rounded bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition cursor-pointer"
                            title="Editar Ação"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteAction && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteAction(action.id);
                            }}
                            className="p-1 rounded bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                            title="Excluir Ação"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {action.title}
                  </h4>

                  <p className="text-[11px] text-[#1351B4] font-medium">
                    {action.thematicAxis}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[140px]">{action.unitName}</span>
                    </span>
                    <span className="font-bold text-slate-900 font-mono text-[11px]">
                      {action.workloadHours}h • {action.modality}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="truncate max-w-[150px]">Docente: <strong>{action.instructorName}</strong></span>
                    <span className="font-bold text-[#0C326F] font-mono">
                      {action.attendedCount || 0} / {action.vacancies} presentes
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: DEMANDAS FORMATIVAS DNC */}
      {activeTab === 'dnc' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-[#0C326F] text-sm">
                Demandas de Necessidades de Capacitação (LNT)
              </h3>
              <p className="text-[11px] text-slate-500">
                Solicitações encaminhadas pelas coordenações de NEPS das unidades de saúde
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenPaepsPlan}
              className="px-3 py-1.5 bg-[#1351B4] text-white text-xs font-bold rounded-lg shadow-xs hover:bg-[#0C326F] transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Consolidar no PAEPS 2026</span>
            </button>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
                  <th className="pb-2.5 font-bold">Unidade Solicitante</th>
                  <th className="pb-2.5 font-bold">Tema / Necessidade</th>
                  <th className="pb-2.5 font-bold">Eixo Temático</th>
                  <th className="pb-2.5 font-bold text-center">Público Alvo</th>
                  <th className="pb-2.5 font-bold text-center">Urgência</th>
                  <th className="pb-2.5 font-bold text-center">Status</th>
                  <th className="pb-2.5 font-bold text-right">Encaminhamento</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                {dncList.map(dnc => (
                  <tr key={dnc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-semibold text-slate-900">
                      {dnc.unitName}
                    </td>
                    <td className="py-3 font-medium text-slate-800">
                      {dnc.theme}
                    </td>
                    <td className="py-3 text-[#1351B4] font-medium text-[11px]">
                      {dnc.thematicAxis}
                    </td>
                    <td className="py-3 text-center text-slate-600">
                      {dnc.targetAudience}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        dnc.urgency === 'Alta' 
                          ? 'bg-rose-50 text-rose-800 border-rose-200' 
                          : dnc.urgency === 'Média'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-blue-50 text-[#1351B4] border-blue-200'
                      }`}>
                        {dnc.urgency}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        dnc.status === 'Aprovada'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : dnc.status === 'Pendente'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {dnc.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {dnc.status === 'Pendente' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onUpdateDncStatus(dnc.id, 'Aprovada')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition cursor-pointer"
                          >
                            Aprovar
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateDncStatus(dnc.id, 'Rejeitada')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold transition cursor-pointer"
                          >
                            Rejeitar
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-semibold">
                          Encaminhado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. STRATEGIC CALLOUT */}
      <div className="bg-[#EBF2FC] border border-[#1351B4]/30 rounded-xl p-4 flex items-start gap-3 text-xs text-[#0C326F]">
        <AlertCircle className="w-5 h-5 text-[#1351B4] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Diretriz de Monitoramento PNEPS • Gestão Central (SERMAC Recife)
          </p>
          <p className="text-slate-700 leading-relaxed">
            As ações de educação permanente devem cobrir prioritariamente as categorias com menor índice de adesão e manter a meta de pelo menos 90% de profissionais treinados por unidade de saúde. Use o <strong>Diagnóstico IA</strong> para obter planos e intervenções orientados aos distritos prioritários.
          </p>
        </div>
      </div>

    </div>
  );
};
