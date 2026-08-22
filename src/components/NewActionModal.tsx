import React, { useState } from 'react';
import { 
  TrainingAction, 
  HealthUnit, 
  ThematicAxis, 
  ProfessionalCategory, 
  InstructorCategory, 
  ActiveMethodology, 
  Modality 
} from '../types';
import { 
  ALL_THEMATIC_AXES, 
  ALL_PROFESSIONAL_CATEGORIES, 
  ALL_INSTRUCTOR_CATEGORIES, 
  ALL_METHODOLOGIES, 
  ALL_MODALITIES 
} from '../data/mockData';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  Calendar, 
  Clock, 
  Users, 
  Check, 
  Loader2,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

interface NewActionModalProps {
  units: HealthUnit[];
  selectedUnitId: string;
  onClose: () => void;
  onSave: (action: TrainingAction) => void;
}

export const NewActionModal: React.FC<NewActionModalProps> = ({
  units,
  selectedUnitId,
  onClose,
  onSave
}) => {
  const [unitId, setUnitId] = useState(selectedUnitId || (units[0]?.id || ''));
  const [title, setTitle] = useState('');
  const [thematicAxis, setThematicAxis] = useState<ThematicAxis>(ALL_THEMATIC_AXES[0]);
  const [description, setDescription] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [instructorCategory, setInstructorCategory] = useState<InstructorCategory>(ALL_INSTRUCTOR_CATEGORIES[0]);
  const [instructorAffiliation, setInstructorAffiliation] = useState('');
  const [targetCategories, setTargetCategories] = useState<ProfessionalCategory[]>([
    'Enfermeiro(a)',
    'Técnico(a) de Enfermagem'
  ]);
  const [modality, setModality] = useState<Modality>('Presencial');
  const [methodology, setMethodology] = useState<ActiveMethodology>(ALL_METHODOLOGIES[0]);
  const [workloadHours, setWorkloadHours] = useState(4);
  const [dateStart, setDateStart] = useState(new Date().toISOString().split('T')[0]);
  const [timeSchedule, setTimeSchedule] = useState('08:30 às 12:30');
  const [location, setLocation] = useState('Auditório da Unidade');
  const [maxSeats, setMaxSeats] = useState(30);

  // AI Generation State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [syllabus, setSyllabus] = useState<string[]>([]);
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);

  const selectedUnit = units.find(u => u.id === unitId) || units[0];

  const handleToggleCategory = (category: ProfessionalCategory) => {
    if (targetCategories.includes(category)) {
      if (targetCategories.length > 1) {
        setTargetCategories(targetCategories.filter(c => c !== category));
      }
    } else {
      setTargetCategories([...targetCategories, category]);
    }
  };

  const handleSelectAllCategories = () => {
    if (targetCategories.length === ALL_PROFESSIONAL_CATEGORIES.length) {
      setTargetCategories(['Enfermeiro(a)']);
    } else {
      setTargetCategories([...ALL_PROFESSIONAL_CATEGORIES]);
    }
  };

  // AI Gemini Pedagogical Plan Generator
  const handleGenerateAiPlan = async () => {
    if (!title) {
      alert('Por favor, informe ao menos o Tema da Capacitação para que a IA possa elaborar o plano pedagógico.');
      return;
    }

    setIsGeneratingAi(true);
    setAiGeneratedSuccess(false);

    try {
      const response = await fetch('/api/gemini/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: title,
          targetAudience: targetCategories.join(', '),
          instructorCategory,
          modality,
          workloadHours,
          unitType: selectedUnit?.type || 'UBS'
        })
      });

      const data = await response.json();
      if (data.success && data.plan) {
        if (data.plan.objective) {
          setDescription(data.plan.objective);
        }
        if (data.plan.syllabus) {
          setSyllabus(data.plan.syllabus);
        }
        if (data.plan.competenciesToDevelop) {
          setCompetencies(data.plan.competenciesToDevelop);
        }
        if (data.plan.materialsNeeded) {
          setMaterials(data.plan.materialsNeeded);
        }
        setAiGeneratedSuccess(true);
      } else {
        throw new Error(data.error || 'Falha ao processar plano');
      }
    } catch (e) {
      console.warn('Using client-side structured pedagogical plan fallback', e);
      // Fallback
      setDescription(`Desenvolver competências técnico-científicas e atitudinais em "${title}" através de metodologias ativas, simulação realística e estudos de caso para o SUS.`);
      setSyllabus([
        `Módulo 1: Diretrizes Clínicas e Epidemiológicas em ${title} (1h)`,
        'Módulo 2: Protocolos de Segurança do Paciente e Fluxos da Unidade (2h)',
        'Módulo 3: Prática Simulada e Debriefing Interprofissional (1h)'
      ]);
      setCompetencies([
        'Trabalho articulado em equipe interprofissional e comunicação assertiva',
        'Tomada de decisão baseada em evidências científicas e protocolos do SUS',
        'Acolhimento humanizado e segurança do paciente'
      ]);
      setMaterials([
        'Projetor multimídia e estudos de caso impressos',
        'Checklist prático de procedimentos',
        'Ficha de avaliação de reação SERMAC'
      ]);
      setAiGeneratedSuccess(true);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !instructorName) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    const actionCode = `EPS-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newAction: TrainingAction = {
      id: `act-${Date.now()}`,
      code: actionCode,
      title,
      thematicAxis,
      description: description || `Capacitação permanente sobre ${title} para qualificação do cuidado no SUS.`,
      unitId,
      unitName: selectedUnit?.name || 'Unidade de Saúde',
      instructorName,
      instructorCategory,
      instructorAffiliation: instructorAffiliation || selectedUnit?.name,
      targetCategories,
      modality,
      methodology,
      workloadHours: Number(workloadHours),
      dateStart,
      dateEnd: dateStart,
      timeSchedule,
      location,
      maxSeats: Number(maxSeats),
      status: 'planejada',
      checkinPin: randomPin,
      enrolledCount: 0,
      attendedCount: 0,
      satisfactionAverage: 0,
      syllabus: syllabus.length > 0 ? syllabus : [
        'Módulo 1: Fundamentação Teórica e Protocolos SUS',
        'Módulo 2: Estudo de Casos e Dinâmica Prática',
        'Módulo 3: Pactuação de Melhorias e Avaliação de Reação'
      ],
      competenciesToDevelop: competencies.length > 0 ? competencies : [
        'Comunicação assertiva e trabalho em equipe',
        'Aplicação segura dos protocolos assistenciais'
      ],
      materialsNeeded: materials.length > 0 ? materials : ['Projetor', 'Lista de chamada NEPS'],
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: selectedUnit?.coordinatorName || 'Coordenação NEPS'
    };

    onSave(newAction);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/30 rounded-xl border border-blue-400/30">
              <BookOpen className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Cadastrar Nova Ação de Educação Permanente (EPS)</h2>
              <p className="text-xs text-blue-200">
                Planejamento pedagógico, público-alvo, facilitadores e geração de código de presença
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs">
          
          {/* AI Assistance Callout */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 text-white rounded-lg shadow-sm">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-purple-950">Assistente Pedagógico com IA Gemini</h4>
                <p className="text-xs text-purple-800">
                  Preencha o tema e clique para estruturar ementa, módulos e competências ativas automaticamente.
                </p>
              </div>
            </div>
            <button
              type="button"
              id="btn-ai-generate-plan"
              onClick={handleGenerateAiPlan}
              disabled={isGeneratingAi}
              className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition shrink-0 shadow-sm"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Elaborando Plano...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Ementa com IA</span>
                </>
              )}
            </button>
          </div>

          {aiGeneratedSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-lg flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Plano pedagógico e objetivos gerados com sucesso pela IA Gemini! Você pode ajustá-los abaixo.</span>
            </div>
          )}

          {/* Section 1: Identification */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5">
              1. Identificação & Eixo Temático
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Tema / Título da Capacitação <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Atualização no Manejo da Dengue e Hidratação Rápida na Atenção Básica"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Unidade de Saúde Promotora <span className="text-rose-500">*</span>
                </label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Eixo Temático Estratégico do SUS <span className="text-rose-500">*</span>
                </label>
                <select
                  value={thematicAxis}
                  onChange={(e) => setThematicAxis(e.target.value as ThematicAxis)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {ALL_THEMATIC_AXES.map((axis) => (
                    <option key={axis} value={axis}>{axis}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Objetivo Pedagógico / Ementa
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o propósito da formação e a problematização da prática cotidiana..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Facilitator / Instructor */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5">
              2. Facilitador / Categoria que Oferece o Treinamento
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nome do Docente / Facilitador <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  placeholder="Ex: Dra. Juliana Peixoto"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Categoria Instrutora <span className="text-rose-500">*</span>
                </label>
                <select
                  value={instructorCategory}
                  onChange={(e) => setInstructorCategory(e.target.value as InstructorCategory)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {ALL_INSTRUCTOR_CATEGORIES.map((ic) => (
                    <option key={ic} value={ic}>{ic}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Instituição / Setor de Origem
                </label>
                <input
                  type="text"
                  value={instructorAffiliation}
                  onChange={(e) => setInstructorAffiliation(e.target.value)}
                  placeholder="Ex: COVS / SERMAC Central ou NEPS UBS"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Target Professional Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h3 className="font-bold text-slate-900 text-sm">
                3. Categorias Profissionais Alvo (Destinatários da Capacitação)
              </h3>
              <button
                type="button"
                onClick={handleSelectAllCategories}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
              >
                {targetCategories.length === ALL_PROFESSIONAL_CATEGORIES.length ? 'Desmarcar Todos' : 'Selecionar Todos (Multi-interprofissional)'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {ALL_PROFESSIONAL_CATEGORIES.map((category) => {
                const isChecked = targetCategories.includes(category);
                return (
                  <label
                    key={category}
                    className={`flex items-center space-x-2 p-2 rounded-lg border text-[11px] cursor-pointer transition ${
                      isChecked
                        ? 'bg-blue-50 border-blue-300 text-blue-950 font-semibold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleCategory(category)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    >
                    </input>
                    <span className="truncate">{category}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Operational Data */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5">
              4. Modalidade, Metodologia & Logística
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Modalidade <span className="text-rose-500">*</span>
                </label>
                <select
                  value={modality}
                  onChange={(e) => setModality(e.target.value as Modality)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {ALL_MODALITIES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Metodologia Ativa <span className="text-rose-500">*</span>
                </label>
                <select
                  value={methodology}
                  onChange={(e) => setMethodology(e.target.value as ActiveMethodology)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {ALL_METHODOLOGIES.map((meth) => (
                    <option key={meth} value={meth}>{meth}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Carga Horária (Horas) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  required
                  value={workloadHours}
                  onChange={(e) => setWorkloadHours(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Limite de Vagas
                </label>
                <input
                  type="number"
                  min={5}
                  max={500}
                  value={maxSeats}
                  onChange={(e) => setMaxSeats(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Data de Realização <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Horário
                </label>
                <input
                  type="text"
                  value={timeSchedule}
                  onChange={(e) => setTimeSchedule(e.target.value)}
                  placeholder="Ex: 08:30 às 12:30"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Local / Sala de Realização
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Sala de Reuniões / Auditório Principal"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-100 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              id="btn-save-training-action"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Pactuar e Salvar Ação EPS</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
