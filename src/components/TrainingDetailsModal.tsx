import React, { useState } from 'react';
import { TrainingAction, AttendanceRecord, ProfessionalCategory, HealthUnit } from '../types';
import { ALL_PROFESSIONAL_CATEGORIES } from '../data/mockData';
import { lookupCnesProfessionalApi, formatCpf } from '../utils/cnesService';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  Award, 
  CheckCircle, 
  Star, 
  Key, 
  BookOpen, 
  FileText, 
  Plus, 
  Check, 
  Download,
  Share2,
  AlertCircle,
  Pencil,
  Trash2,
  AlertTriangle,
  Search,
  Building,
  Ban,
  CheckCircle2
} from 'lucide-react';

interface TrainingDetailsModalProps {
  action: TrainingAction | null;
  attendanceRecords?: AttendanceRecord[];
  attendanceList?: AttendanceRecord[];
  units?: HealthUnit[];
  onClose: () => void;
  onUpdateStatus?: (actionId: string, newStatus: TrainingAction['status']) => void;
  onAddManualAttendance?: (record: Omit<AttendanceRecord, 'id' | 'certificateCode'>) => void;
  onAddAttendance?: (record: Omit<AttendanceRecord, 'id' | 'certificateCode'>) => void;
  onOpenCertificate: (record: AttendanceRecord) => void;
  onEditAction?: (action: TrainingAction) => void;
  onDeleteAction?: (actionId: string) => void;
  onOpenCancelModal?: (action: TrainingAction) => void;
}

export const TrainingDetailsModal: React.FC<TrainingDetailsModalProps> = ({
  action,
  attendanceRecords = [],
  attendanceList = [],
  units = [],
  onClose,
  onUpdateStatus,
  onAddManualAttendance,
  onAddAttendance,
  onOpenCertificate,
  onEditAction,
  onDeleteAction,
  onOpenCancelModal
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'attendance' | 'feedback' | 'pin'>('info');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Manual attendee form
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [category, setCategory] = useState<ProfessionalCategory>('Enfermeiro(a)');
  const [isSearchingCnes, setIsSearchingCnes] = useState(false);
  const [cnesLookupFeedback, setCnesLookupFeedback] = useState<string | null>(null);

  const handleLookupCnesInManualForm = async (inputVal?: string) => {
    const rawVal = inputVal || cpf || name;
    const cleanDigits = rawVal.replace(/\D/g, '');
    if (!rawVal.trim()) return;

    setIsSearchingCnes(true);
    setCnesLookupFeedback(null);
    try {
      const res = await lookupCnesProfessionalApi(cleanDigits || rawVal, {
        unitId: action?.unitId,
        unitName: action?.unitName,
        nameHint: name || (!cleanDigits ? rawVal : undefined),
        categoryHint: category || undefined
      });

      if (res) {
        setName(res.name);
        setCategory(res.professionalCategory);
        setRegNumber(res.cns ? `CNS-${res.cns.slice(-6)}` : `SUS-${Math.floor(1000 + Math.random() * 9000)}`);
        setCnesLookupFeedback(`Recuperado do CNES: ${res.name} (${res.cboDescription})`);
      } else {
        setCnesLookupFeedback('Profissional não localizado no CNES.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingCnes(false);
    }
  };

  if (!action) return null;

  const records = attendanceRecords.length > 0 ? attendanceRecords : attendanceList;
  const currentActionRecords = (records || []).filter(r => r && r.actionId === action.id);
  const presentCount = currentActionRecords.filter(r => r && r.status === 'presente').length;
  const feedbackRecords = currentActionRecords.filter(r => r && r.feedback && r.feedback.satisfactionRating);

  const avgSatisfaction = feedbackRecords.length > 0
    ? (feedbackRecords.reduce((acc, r) => acc + (r.feedback?.satisfactionRating || 0), 0) / feedbackRecords.length).toFixed(1)
    : '0.0';

  const avgApplicability = feedbackRecords.length > 0
    ? (feedbackRecords.reduce((acc, r) => acc + (r.feedback?.applicabilityRating || 0), 0) / feedbackRecords.length).toFixed(1)
    : '0.0';

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cpf) return;

    const addFn = onAddManualAttendance || onAddAttendance;
    if (addFn) {
      addFn({
        actionId: action.id,
        actionTitle: action.title,
        actionCode: action.code,
        thematicAxis: action.thematicAxis,
        unitId: action.unitId,
        unitName: action.unitName,
        participantName: name,
        cpf,
        registrationNumber: regNumber || `SUS-${Math.floor(1000 + Math.random() * 9000)}`,
        professionalCategory: category,
        participantUnitId: action.unitId,
        participantUnitName: action.unitName,
        workloadHours: action.workloadHours,
        date: action.dateStart,
        checkinTimestamp: new Date().toISOString(),
        status: 'presente',
        certificateIssued: true
      });
    }

    setName('');
    setCpf('');
    setRegNumber('');
    setShowAddForm(false);
  };

  const handleExportCSV = () => {
    const headers = 'Código Ação;Tema;Participante;CPF;Matrícula;Categoria;Unidade;Data;Status;Avaliação\n';
    const rows = currentActionRecords.map(r => 
      `"${r.actionCode}";"${r.actionTitle}";"${r.participantName}";"${r.cpf}";"${r.registrationNumber}";"${r.professionalCategory}";"${r.participantUnitName}";"${r.date}";"${r.status}";"${r.feedback?.satisfactionRating || 'N/A'}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Lista_Presenca_${action.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="bg-teal-500/20 text-teal-300 text-xs font-mono font-bold px-2.5 py-0.5 rounded border border-teal-500/30">
                {action.code}
              </span>
              <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-2.5 py-0.5 rounded">
                {action.thematicAxis}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                action.status === 'concluida' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                action.status === 'em_andamento' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                action.status === 'cancelada' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {action.status.toUpperCase().replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 leading-tight">
              {action.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
              <span>{action.unitName}</span>
              <span>•</span>
              <span>Docente: <strong className="text-slate-200">{action.instructorName}</strong> ({action.instructorCategory})</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenCancelModal && action.status !== 'cancelada' && action.status !== 'concluida' && (
              <button
                type="button"
                onClick={() => onOpenCancelModal(action)}
                className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title="Cancelar esta ação formativa com justificativa oficial"
              >
                <Ban className="w-3.5 h-3.5 text-rose-300" />
                <span className="hidden sm:inline">Cancelar Ação</span>
              </button>
            )}

            {onEditAction && (
              <button
                onClick={() => {
                  onClose();
                  onEditAction(action);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Editar dados da Ação"
              >
                <Pencil className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Editar</span>
              </button>
            )}

            {onDeleteAction && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Excluir Ação"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Excluir</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Alert Banner */}
        {showDeleteConfirm && (
          <div className="bg-rose-50 border-b border-rose-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-900 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <strong className="block text-rose-950 font-bold text-sm">Confirmar exclusão desta Ação Educativa?</strong>
                <p className="text-rose-800 mt-0.5">
                  A ação <strong>{action.code} — {action.title}</strong> será permanentemente excluída do sistema, incluindo seus registros vinculados.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (onDeleteAction) {
                    onDeleteAction(action.id);
                  }
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'info'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Plano & Dados da Ação</span>
          </button>
          
          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'attendance'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Lista de Presença ({presentCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('pin')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'pin'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>PIN de Auto-Check-in</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'feedback'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Avaliação de Reação ({feedbackRecords.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-700">
          
          {/* TAB 1: INFO & PEDAGOGICAL PLAN */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              
              {/* If Action is Cancelled - Official Notice */}
              {action.status === 'cancelada' && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                    <Ban className="w-4 h-4 text-rose-600" />
                    <span>Ação Formatada Cancelada Oficialmente</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/80 p-2.5 rounded-lg border border-rose-100">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Categoria do Cancelamento:</span>
                      <span className="font-semibold text-rose-950">{action.cancellationCategory || 'Institucional'}</span>
                    </div>
                    {action.cancellationDate && (
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Data do Cancelamento:</span>
                        <span className="font-semibold text-slate-800">{action.cancellationDate}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold mb-0.5">Justificativa Registrada:</span>
                    <p className="bg-white/80 p-2.5 rounded-lg border border-rose-100 italic text-slate-800">
                      "{action.cancellationReason || 'Cancelamento registrado pela coordenação.'}"
                    </p>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    Esta ocorrência foi contabilizada no <strong>Indicador 5 — Taxa de Cancelamento de EP</strong> da SERMAC.
                  </p>
                </div>
              )}

              {/* Status Controller Bar (when not cancelled) */}
              {action.status !== 'cancelada' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Status da Ação:</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${
                        action.status === 'concluida' ? 'bg-emerald-500' :
                        action.status === 'em_andamento' ? 'bg-blue-500' : 'bg-slate-400'
                      }`} />
                      {action.status === 'concluida' ? 'Concluída' : action.status === 'em_andamento' ? 'Em Andamento' : 'Planejada'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {onUpdateStatus && action.status !== 'concluida' && (
                      <>
                        {action.status === 'planejada' && (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(action.id, 'em_andamento')}
                            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Iniciar Atividade</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(action.id, 'concluida')}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Concluir Ação</span>
                        </button>
                      </>
                    )}

                    {onOpenCancelModal && (
                      <button
                        type="button"
                        onClick={() => onOpenCancelModal(action)}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        title="Registrar cancelamento com justificativa oficial"
                      >
                        <Ban className="w-3.5 h-3.5 text-rose-600" />
                        <span>Cancelar Ação</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Meta Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Carga Horária</span>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">{action.workloadHours} horas</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">Modalidade</span>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">{action.modality}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">Data / Horário</span>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">{action.dateStart} • {action.timeSchedule}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">Local / Sala</span>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">{action.location}</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Ementa e Justificativa da Ação
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {action.description}
                </p>
              </div>

              {/* Methodology & Target Audience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Metodologia Adotada
                  </h4>
                  <div className="bg-teal-50 border border-teal-200 p-3 rounded-lg text-xs font-medium text-teal-900">
                    <strong className="block text-teal-950 font-bold mb-1">
                      {(action.methodology === 'Outros' || action.methodology === 'Outro') && action.customMethodology 
                        ? `Outros: ${action.customMethodology}` 
                        : action.methodology}
                    </strong>
                    Prática pedagógica baseada em problematização dos processos de trabalho e dinâmicas do SUS.
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Categorias Profissionais Alvo
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {action.targetCategories.map((cat, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-md font-medium border border-slate-200">
                        {cat === 'Outro' && action.customTargetCategory ? `Outro (${action.customTargetCategory})` : cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Syllabus / Content Modules */}
              {action.syllabus && action.syllabus.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Conteúdo Programático Estruturado
                  </h4>
                  <ul className="space-y-2">
                    {action.syllabus.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Competencies */}
              {action.competenciesToDevelop && action.competenciesToDevelop.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Competências a Serem Desenvolvidas
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {action.competenciesToDevelop.map((comp, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-emerald-50 text-emerald-900 text-xs p-2.5 rounded-lg border border-emerald-200">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{comp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: ATTENDANCE & CALL */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              
              {/* Attendance Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-600">
                  Total de Presentes: <strong className="text-slate-900 font-bold">{presentCount}</strong> / Vagas: <strong className="text-slate-900">{action.maxSeats}</strong> ({Math.round((presentCount / (action.maxSeats || 1)) * 100)}% ocupação)
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar Lista (.CSV)</span>
                  </button>

                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Adicionar Presença Manual</span>
                  </button>
                </div>
              </div>

              {/* Manual Add Form */}
              {showAddForm && (
                <form onSubmit={handleManualSubmit} className="bg-teal-50/60 border border-teal-200 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-teal-900">Registrar Presença de Profissional na Chamada</h4>
                    <span className="text-[11px] text-teal-700">Digite o CPF para autocompletar via CNES</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-slate-600 font-medium">CPF *</label>
                        <button
                          type="button"
                          onClick={() => handleLookupCnesInManualForm()}
                          disabled={isSearchingCnes || !cpf}
                          className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer disabled:opacity-40"
                        >
                          {isSearchingCnes ? 'Buscando...' : 'Buscar CNES'}
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={cpf}
                        onChange={(e) => {
                          const val = e.target.value;
                          const formatted = formatCpf(val);
                          setCpf(formatted);
                          const digits = formatted.replace(/\D/g, '');
                          if (digits.length === 11) {
                            handleLookupCnesInManualForm(digits);
                          }
                        }}
                        placeholder="000.000.000-00"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Nome Completo *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Dr. Roberto Martins"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Matrícula / Conselho</label>
                      <input
                        type="text"
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                        placeholder="Ex: CRM-PE 14592"
                        className="w-full bg-white border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Categoria Profissional</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ProfessionalCategory)}
                        className="w-full bg-white border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                      >
                        {ALL_PROFESSIONAL_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {cnesLookupFeedback && (
                    <p className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      {cnesLookupFeedback}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setCnesLookupFeedback(null);
                      }}
                      className="px-3 py-1 bg-slate-200 text-slate-700 text-xs rounded-md font-medium cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 bg-teal-600 text-white text-xs rounded-md font-bold hover:bg-teal-500 cursor-pointer shadow-xs"
                    >
                      Confirmar Presença
                    </button>
                  </div>
                </form>
              )}

              {/* Attendees List */}
              {currentActionRecords.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                  Nenhum registro de presença para esta ação até o momento. Utilize o PIN de auto-check-in ou adicione manualmente acima.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Profissional</th>
                        <th className="p-3">Categoria</th>
                        <th className="p-3">Matrícula / CPF</th>
                        <th className="p-3">Check-in</th>
                        <th className="p-3">Avaliação</th>
                        <th className="p-3 text-right">Certificado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {currentActionRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">
                            {record.participantName}
                          </td>
                          <td className="p-3 text-slate-600">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                              {record.professionalCategory}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 font-mono">
                            {record.registrationNumber} • {record.cpf}
                          </td>
                          <td className="p-3 text-slate-500">
                            {new Date(record.checkinTimestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3">
                            {record.feedback ? (
                              <span className="flex items-center gap-1 text-amber-600 font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                {record.feedback.satisfactionRating}.0
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Pendente</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => onOpenCertificate(record)}
                              className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded transition"
                            >
                              Ver Certificado
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: LIVE PIN FOR CLASSROOM PROJECTION */}
          {activeTab === 'pin' && (
            <div className="text-center py-8 space-y-6">
              <div className="max-w-md mx-auto bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-xl border border-slate-700">
                <span className="text-xs font-semibold text-teal-400 tracking-wider uppercase">
                  Código de Presença para Projeção em Sala
                </span>
                
                <div className="my-6">
                  <div className="text-6xl md:text-7xl font-mono font-black tracking-widest text-teal-300 drop-shadow-md">
                    {action.checkinPin}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-mono">
                    Ação: {action.code}
                  </p>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-xl text-xs text-slate-300 space-y-2 text-left border border-slate-700">
                  <div className="flex items-center gap-2 text-teal-300 font-bold">
                    <CheckCircle className="w-4 h-4" />
                    <span>Instruções para os Participantes:</span>
                  </div>
                  <p>1. Acesse o sistema pelo celular ou tablet na aba <strong>Destinatário / Frequência</strong>.</p>
                  <p>2. Digite o código PIN de 4 dígitos <strong className="text-teal-300 font-mono">{action.checkinPin}</strong> e seu CPF/Matrícula.</p>
                  <p>3. Sua frequência é computada em tempo real e o certificado fica liberado após a avaliação!</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REACTION EVALUATION FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              
              {/* Feedback Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
                  <span className="text-xs text-amber-800 font-medium">Satisfação Geral</span>
                  <div className="text-2xl font-black text-amber-900 mt-1 flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                    {avgSatisfaction} <span className="text-xs font-normal text-amber-700">/ 5.0</span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
                  <span className="text-xs text-emerald-800 font-medium">Aplicabilidade no SUS</span>
                  <div className="text-2xl font-black text-emerald-900 mt-1 flex items-center justify-center gap-1">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    {avgApplicability} <span className="text-xs font-normal text-emerald-700">/ 5.0</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center">
                  <span className="text-xs text-blue-800 font-medium">Avaliações Respondidas</span>
                  <div className="text-2xl font-black text-blue-900 mt-1 font-mono">
                    {feedbackRecords.length}
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl text-center">
                  <span className="text-xs text-purple-800 font-medium">Taxa de Resposta</span>
                  <div className="text-2xl font-black text-purple-900 mt-1 font-mono">
                    {presentCount > 0 ? Math.round((feedbackRecords.length / presentCount) * 100) : 100}%
                  </div>
                </div>
              </div>

              {/* Feedbacks List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Comentários e Sugestões dos Alunos
                </h4>

                {feedbackRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum comentário registrado ainda.</p>
                ) : (
                  feedbackRecords.map((r) => (
                    <div key={r.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{r.participantName} ({r.professionalCategory})</span>
                        <div className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>Nota: {r.feedback?.satisfactionRating}.0</span>
                        </div>
                      </div>
                      {r.feedback?.comment && (
                        <p className="text-slate-700 italic">"{r.feedback.comment}"</p>
                      )}
                      {r.feedback?.suggestions && (
                        <p className="text-slate-500"><strong className="text-slate-700">Sugestão:</strong> {r.feedback.suggestions}</p>
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
