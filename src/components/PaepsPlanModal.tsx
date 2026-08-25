import React, { useState } from 'react';
import { HealthUnit, TrainingAction, TrainingNeedDNC } from '../types';
import { 
  X, 
  FileText, 
  Printer, 
  Download, 
  CheckCircle, 
  Target, 
  Calendar, 
  Users, 
  Award,
  Layers,
  ClipboardList,
  PlusCircle,
  Trash2,
  CheckCircle2,
  Building2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

interface PaepsPlanModalProps {
  units: HealthUnit[];
  actions: TrainingAction[];
  dncList: TrainingNeedDNC[];
  onClose: () => void;
  onAddLntNeed?: (item: Omit<TrainingNeedDNC, 'id' | 'dateReported'>) => void;
  onUpdateDncStatus?: (dncId: string, status: TrainingNeedDNC['status']) => void;
  onDeleteDnc?: (dncId: string) => void;
}

const CATEGORY_OPTIONS = [
  'Enfermagem (Enfermeiros, Téc. e Aux.)',
  'Corpo Médico / Clínico',
  'Agentes Comunitários de Saúde (ACS / ACE)',
  'Equipe Multiprofissional (Psicologia, Serviço Social, Nutrição, Fisioterapia, Farmácia)',
  'Saúde Bucal (Cirurgiões-Dentistas e ASB/TSB)',
  'Recepção, Acolhimento e Regulação',
  'Administrativo e Apoio Operacional',
  'Equipe SAMU 192 (Condutores, Socorristas, Regulação Médica)'
];

export const PaepsPlanModal: React.FC<PaepsPlanModalProps> = ({
  units = [],
  actions = [],
  dncList = [],
  onClose,
  onAddLntNeed,
  onUpdateDncStatus,
  onDeleteDnc
}) => {
  // Form State to Insert New LNT Data
  const [showInsertForm, setShowInsertForm] = useState(false);
  const [theme, setTheme] = useState('');
  const [unitId, setUnitId] = useState(units[0]?.id || 'unit-1');
  const [targetCategories, setTargetCategories] = useState<string[]>([CATEGORY_OPTIONS[0]]);
  const [justification, setJustification] = useState('');
  const [urgency, setUrgency] = useState<'Crítica' | 'Alta' | 'Média'>('Alta');
  const [estimatedParticipants, setEstimatedParticipants] = useState<number>(25);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const totalStaff = units.reduce((acc, u) => acc + u.totalStaff, 0);

  const toggleCategory = (cat: string) => {
    if (targetCategories.includes(cat)) {
      if (targetCategories.length > 1) {
        setTargetCategories(targetCategories.filter(c => c !== cat));
      }
    } else {
      setTargetCategories([...targetCategories, cat]);
    }
  };

  const handleInsertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) {
      setFormError('Por favor, informe o tema / necessidade de treinamento.');
      return;
    }
    if (!justification.trim()) {
      setFormError('Por favor, descreva a justificativa ou problema identificado no processo de trabalho.');
      return;
    }

    const selectedUnitObj = units.find(u => u.id === unitId) || units[0];

    const newLntItem: Omit<TrainingNeedDNC, 'id' | 'dateReported'> = {
      unitId: selectedUnitObj?.id || 'unit-sermac',
      unitName: selectedUnitObj?.name || 'Rede Municipal SERMAC',
      suggestedTheme: theme.trim(),
      targetCategories: targetCategories.length > 0 ? targetCategories : ['Todos os Profissionais da Unidade'],
      justification: justification.trim(),
      urgency,
      estimatedParticipants: Number(estimatedParticipants) || 20,
      status: 'Aprovado_LNT'
    };

    if (onAddLntNeed) {
      onAddLntNeed(newLntItem);
    }

    // Reset Form
    setTheme('');
    setJustification('');
    setEstimatedParticipants(25);
    setFormError(null);
    setSuccessMessage('Nova necessidade inserida e consolidada no LNT com sucesso!');
    setShowInsertForm(false);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#0C326F] p-4 sm:p-5 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 text-blue-200 rounded-xl border border-blue-400/30">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Levantamento de Necessidades de Treinamento – LNT (Ciclo 2026)</h2>
              <p className="text-[11px] sm:text-xs text-blue-200">
                Diagnóstico Situacional e Matriz de Demandas Formativas consolidado pela SERMAC e Núcleos NEPS
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              id="btn-insert-lnt-toggle"
              onClick={() => setShowInsertForm(!showInsertForm)}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{showInsertForm ? 'Ocultar Formulário' : '+ Inserir Dados no LNT'}</span>
            </button>
            <button
              id="btn-print-lnt"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-blue-800 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-3 px-6 text-emerald-800 text-xs font-semibold flex items-center gap-2 print:hidden">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Insertion Form Drawer / Accordion */}
        {showInsertForm && (
          <div className="bg-slate-50 border-b border-slate-300 p-4 sm:p-6 print:hidden overflow-y-auto max-h-[50vh] animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2 text-slate-900">
                <PlusCircle className="w-4 h-4 text-[#1351B4]" />
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide">
                  Inserir Nova Demanda / Necessidade no LNT (Diagnóstico Municipal)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInsertForm(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleInsertSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Theme */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Tema / Necessidade de Treinamento e Educação Permanente *
                  </label>
                  <input
                    type="text"
                    required
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="Ex: Manejo Clínico de Arboviroses e Protocolos de Hidratação Rápida"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#1351B4] focus:ring-1 focus:ring-[#1351B4]"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Unidade de Saúde Solicitante *
                  </label>
                  <select
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#1351B4]"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.code} - {u.name} ({u.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Grau de Urgência da Demanda *
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-[#1351B4]"
                  >
                    <option value="Crítica">🚨 Crítica (Impacto direto em morbimortalidade / segurança)</option>
                    <option value="Alta">⚠️ Alta (Reestruturação de fluxo e qualificação assistencial)</option>
                    <option value="Média">ℹ️ Média (Aperfeiçoamento continuado de rotinas)</option>
                  </select>
                </div>

                {/* Target Categories */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Público-Alvo / Categorias Profissionais Prioritárias:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-white p-2.5 rounded-lg border border-slate-200">
                    {CATEGORY_OPTIONS.map((cat) => {
                      const isChecked = targetCategories.includes(cat);
                      return (
                        <label
                          key={cat}
                          className={`flex items-center gap-2 p-1.5 rounded text-[11px] cursor-pointer transition ${
                            isChecked ? 'bg-blue-50 text-[#0C326F] font-semibold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCategory(cat)}
                            className="rounded text-[#1351B4] focus:ring-[#1351B4]"
                          />
                          <span>{cat}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Estimated Participants */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Meta de Profissionais a Capacitar:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={estimatedParticipants}
                    onChange={(e) => setEstimatedParticipants(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#1351B4]"
                  />
                </div>

                {/* Justification */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Justificativa e Situação-Problema Observada no Trabalho *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Descreva o nó crítico ou necessidade assistencial identificada na prática..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#1351B4]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowInsertForm(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1351B4] hover:bg-[#0C326F] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar e Consolidar no LNT</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Document Content */}
        <div className="p-6 sm:p-8 overflow-y-auto text-slate-800 space-y-6 text-xs leading-relaxed">
          
          {/* Document Title Header */}
          <div className="text-center border-b border-slate-300 pb-4">
            <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider">
              Secretaria Municipal de Saúde • SERMAC
            </h3>
            <h1 className="text-xl font-bold text-slate-900 mt-1 uppercase">
              LEVANTAMENTO DE NECESSIDADES DE TREINAMENTO – LNT (CICLO 2026)
            </h1>
            <p className="text-slate-500 text-[11px] mt-1 font-mono">
              Instrumento Técnico de Diagnóstico e Planejamento da Política Nacional de Educação Permanente em Saúde (PNEPS/SUS)
            </p>
          </div>

          {/* Section 1: Overview */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 border-l-4 border-[#1351B4] pl-2">
              1. Apresentação e Justificativa do LNT
            </h4>
            <p className="text-slate-700 leading-normal">
              O <strong>Levantamento de Necessidades de Treinamento – LNT 2026</strong> consolida a identificação diagnóstica e participativa dos nós críticos nos processos de trabalho de todas as 19 unidades da rede de saúde (Policlínicas, Maternidades, Hospitais, Centros de Saúde, SAMU 192 e Laboratório Municipal), conduzido pela Coordenação do Núcleo de Educação Permanente em Saúde - SERMAC em articulação direta com os Núcleos locais (NEPS).
            </p>
          </div>

          {/* Section 2: Macro Goals */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 border-l-4 border-[#1351B4] pl-2">
              2. Metas & Critérios de Priorização do LNT
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="font-semibold text-slate-500 block">Cobertura de Levantamento</span>
                <span className="text-lg font-bold text-slate-900 font-mono">100% das Unidades de Saúde</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="font-semibold text-slate-500 block">Foco em Metodologias Ativas</span>
                <span className="text-lg font-bold text-[#1351B4] font-mono">≥ 80% das ações práticas</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="font-semibold text-slate-500 block">Índice de Resolubilidade</span>
                <span className="text-lg font-bold text-emerald-700 font-mono">≥ 90% das demandas atendidas</span>
              </div>
            </div>
          </div>

          {/* Section 3: Prioritized Needs from DNC / LNT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 border-l-4 border-[#1351B4] pl-2">
                3. Matriz de Demandas Priorizadas pelo LNT (Diagnóstico por Unidade)
              </h4>
              <span className="text-[11px] font-mono text-slate-500 font-bold">
                Total: {dncList.length} necessidades cadastradas
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Tema Demandado no LNT</th>
                    <th className="p-2.5">Unidade Solicitante</th>
                    <th className="p-2.5">Público Prioritário</th>
                    <th className="p-2.5">Urgência</th>
                    <th className="p-2.5">Status no LNT</th>
                    <th className="p-2.5 text-right print:hidden">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dncList.map((dnc) => (
                    <tr key={dnc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5">
                        <p className="font-bold text-slate-900">{dnc.suggestedTheme}</p>
                        <p className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">"{dnc.justification}"</p>
                      </td>
                      <td className="p-2.5 text-slate-700 font-medium">{dnc.unitName}</td>
                      <td className="p-2.5 text-slate-600">
                        {Array.isArray(dnc.targetCategories) ? dnc.targetCategories.slice(0, 2).join(', ') : 'Geral'}
                        {dnc.targetCategories?.length > 2 && '...'}
                      </td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          dnc.urgency === 'Crítica' ? 'bg-rose-100 text-rose-800' :
                          dnc.urgency === 'Alta' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {dnc.urgency}
                        </span>
                      </td>
                      <td className="p-2.5 font-semibold text-[#1351B4]">
                        {dnc.status ? dnc.status.replace('_', ' ').replace('PAEPS', 'LNT') : 'Aprovado LNT'}
                      </td>
                      <td className="p-2.5 text-right print:hidden">
                        {onDeleteDnc && (
                          <button
                            type="button"
                            onClick={() => onDeleteDnc(dnc.id)}
                            title="Remover necessidade do LNT"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {dncList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400 italic">
                        Nenhuma demanda cadastrada no LNT ainda. Clique em "+ Inserir Dados no LNT" para adicionar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Scheduled Actions Matrix */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 border-l-4 border-[#1351B4] pl-2">
              4. Quadro de Ações Formativas Vinculadas ao LNT
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Código</th>
                    <th className="p-2.5">Tema / Eixo</th>
                    <th className="p-2.5">Facilitador / Categoria</th>
                    <th className="p-2.5">Carga</th>
                    <th className="p-2.5">Modalidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {actions.slice(0, 6).map((act) => (
                    <tr key={act.id}>
                      <td className="p-2.5 font-mono text-slate-500 font-bold">{act.code}</td>
                      <td className="p-2.5 font-medium text-slate-900">
                        {act.title}
                        <span className="block text-[10px] text-slate-500">{act.thematicAxis}</span>
                      </td>
                      <td className="p-2.5 text-slate-600">
                        {act.instructorName}
                        <span className="block text-[10px] text-[#1351B4] font-semibold">{act.instructorCategory}</span>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">{act.workloadHours}h</td>
                      <td className="p-2.5 text-slate-600">{act.modality}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center">
            <div>
              <div className="w-56 h-0.5 bg-slate-400 mx-auto mb-1.5"></div>
              <p className="font-bold text-xs text-slate-900">
                Coordenadora do Núcleo de Educação Permanente em Saúde - SERMAC
              </p>
              <p className="text-[11px] text-slate-500">SERMAC / Secretaria Municipal de Saúde</p>
            </div>
            <div>
              <div className="w-56 h-0.5 bg-slate-400 mx-auto mb-1.5"></div>
              <p className="font-bold text-xs text-slate-900">Colegiado de Coordenadores NEPS das Unidades</p>
              <p className="text-[11px] text-slate-500">Comissão de Validação do LNT / SUS</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

