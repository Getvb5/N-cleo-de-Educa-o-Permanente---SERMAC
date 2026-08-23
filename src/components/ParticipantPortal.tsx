import React, { useState, useMemo } from 'react';
import { 
  TrainingAction, 
  AttendanceRecord, 
  HealthUnit, 
  ProfessionalCategory,
  FeedbackData 
} from '../types';
import { 
  ALL_PROFESSIONAL_CATEGORIES 
} from '../data/mockData';
import confetti from 'canvas-confetti';
import { 
  UserCheck, 
  Key, 
  Award, 
  CheckCircle, 
  Star, 
  Clock, 
  Search, 
  Calendar, 
  FileText, 
  Sparkles, 
  Building, 
  ShieldCheck,
  Check,
  ChevronRight
} from 'lucide-react';

interface ParticipantPortalProps {
  actions: TrainingAction[];
  attendance: AttendanceRecord[];
  units: HealthUnit[];
  cnesProfessionals?: import('../types').CnesProfessional[];
  onRegisterCheckin: (record: Omit<AttendanceRecord, 'id' | 'certificateCode'>) => void;
  onSaveFeedback: (attendanceId: string, feedback: FeedbackData) => void;
  onOpenCertificate: (record: AttendanceRecord) => void;
  onOpenCnesModal?: () => void;
}

export const ParticipantPortal: React.FC<ParticipantPortalProps> = ({
  actions = [],
  attendance = [],
  units = [],
  cnesProfessionals = [],
  onRegisterCheckin,
  onSaveFeedback,
  onOpenCertificate,
  onOpenCnesModal
}) => {
  // Check-in Form State
  const [pin, setPin] = useState('');
  const [selectedActionId, setSelectedActionId] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [cpf, setCpf] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [category, setCategory] = useState<ProfessionalCategory>('Enfermeiro(a)');
  const [participantUnitId, setParticipantUnitId] = useState(units[0]?.id || '');
  const [cnesMatch, setCnesMatch] = useState<import('../types').CnesProfessional | null>(null);
  
  // Feedback Form State
  const [activeCheckinRecord, setActiveCheckinRecord] = useState<AttendanceRecord | null>(null);
  const [satisfactionRating, setSatisfactionRating] = useState(5);
  const [applicabilityRating, setApplicabilityRating] = useState(5);
  const [instructorRating, setInstructorRating] = useState(5);
  const [contentClarityRating, setContentClarityRating] = useState(5);
  const [comment, setComment] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Passport Filter
  const [passportSearch, setPassportSearch] = useState('');

  // Active / Ongoing trainings available for check-in
  const activeTrainings = useMemo(() => {
    return actions.filter(a => a.status === 'em_andamento' || a.status === 'planejada' || a.status === 'concluida');
  }, [actions]);

  const handleCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName || !cpf) {
      alert('Por favor preencha seu nome e CPF.');
      return;
    }

    // Find action by PIN or selected action
    let targetAction = actions.find(a => a.checkinPin.trim() === pin.trim());
    if (!targetAction && selectedActionId) {
      targetAction = actions.find(a => a.id === selectedActionId);
    }

    if (!targetAction) {
      alert('Código PIN ou ação não encontrada. Verifique o código de 4 dígitos informado pelo instrutor.');
      return;
    }

    const selectedUnit = units.find(u => u.id === participantUnitId) || units[0];

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      // ignore
    }

    const newRecordData = {
      actionId: targetAction.id,
      actionTitle: targetAction.title,
      actionCode: targetAction.code,
      thematicAxis: targetAction.thematicAxis,
      unitId: targetAction.unitId,
      unitName: targetAction.unitName,
      participantName,
      cpf,
      registrationNumber: regNumber || `SUS-${Math.floor(1000 + Math.random() * 9000)}`,
      professionalCategory: category,
      participantUnitId: selectedUnit?.id || targetAction.unitId,
      participantUnitName: selectedUnit?.name || targetAction.unitName,
      workloadHours: targetAction.workloadHours,
      date: targetAction.dateStart,
      checkinTimestamp: new Date().toISOString(),
      status: 'presente' as const,
      certificateIssued: true,
      feedback: {
        satisfactionRating: 5,
        applicabilityRating: 5,
        instructorRating: 5,
        contentClarityRating: 5,
        comment: 'Presença confirmada pelo próprio profissional no auto-checkin.'
      }
    };

    onRegisterCheckin(newRecordData);

    // Set for direct feedback flow
    const createdRecord: AttendanceRecord = {
      ...newRecordData,
      id: `att-${Date.now()}`,
      certificateCode: `CERT-${targetAction.code}-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setActiveCheckinRecord(createdRecord);

    setPin('');
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheckinRecord) return;

    onSaveFeedback(activeCheckinRecord.id, {
      satisfactionRating,
      applicabilityRating,
      instructorRating,
      contentClarityRating,
      comment,
      suggestions
    });

    setFeedbackSuccess(true);
  };

  // Filtered Passport
  const myPassportRecords = useMemo(() => {
    if (!passportSearch.trim()) return attendance;
    const term = passportSearch.toLowerCase();
    return attendance.filter(r => 
      r.participantName.toLowerCase().includes(term) ||
      r.cpf.includes(term) ||
      r.registrationNumber.toLowerCase().includes(term) ||
      r.actionTitle.toLowerCase().includes(term)
    );
  }, [attendance, passportSearch]);

  const totalAccumulatedHours = useMemo(() => {
    return myPassportRecords.reduce((acc, r) => acc + r.workloadHours, 0);
  }, [myPassportRecords]);

  return (
    <div className="space-y-6">
      
      {/* HIGH DENSITY 4-COL KPI METRICS FOR PARTICIPANT PORTAL */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        
        {/* KPI 1: Horas no Passaporte */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Horas Acumuladas
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalAccumulatedHours}h</span>
            <span className="text-xs text-emerald-600 font-semibold">Válido no SUS</span>
          </div>
          <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (totalAccumulatedHours / 40) * 100)}%` }}></div>
          </div>
        </div>

        {/* KPI 2: Certificados Conquistados */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Certificados Emitidos
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{myPassportRecords.length}</span>
            <span className="text-xs text-blue-600 font-medium">100% autenticados</span>
          </div>
          <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, myPassportRecords.length * 20)}%` }}></div>
          </div>
        </div>

        {/* KPI 3: Capacitações Disponíveis */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Capacitações Ativas
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeTrainings.length}</span>
            <span className="text-xs text-slate-400 font-medium">Em rede</span>
          </div>
          <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-[80%]"></div>
          </div>
        </div>

        {/* KPI 4: Status do Check-in */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Canal de Auto-Check-in
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">Online</span>
            <span className="text-xs text-emerald-500 font-medium">Via PIN 4 dígitos</span>
          </div>
          <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-full"></div>
          </div>
        </div>

      </div>

      {/* Main Grid: Check-in Card + Active Training List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHECK-IN FORM (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">Registrar Presença na Ação (Auto-Check-in)</h3>
                <p className="text-[11px] text-slate-400">Validação instantânea com PIN de 4 dígitos</p>
              </div>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Frequência Segura
            </span>
          </div>

          <form onSubmit={handleCheckinSubmit} className="p-4 space-y-4 text-xs">
            
            {/* PIN INPUT HERO */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-slate-700 font-bold text-xs uppercase tracking-wide">
                Código PIN da Ação (4 dígitos exibidos pelo instrutor)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Ex: 8492"
                  className="w-32 bg-white border border-slate-300 text-slate-900 font-mono font-black text-xl tracking-widest text-center rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-slate-500 text-[11px]">
                  Ou selecione a capacitação ativa abaixo caso não tenha o PIN em mãos.
                </span>
              </div>
            </div>

            {/* Select action alternative */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Ou selecione a Capacitação na lista da rede
              </label>
              <select
                value={selectedActionId}
                onChange={(e) => setSelectedActionId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Selecione uma ação educativa --</option>
                {activeTrainings.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.code}] {a.title} ({a.unitName} - {a.workloadHours}h)
                  </option>
                ))}
              </select>
            </div>

            {/* Participant Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  CPF <span className="text-red-500">*</span> (com validação CNES)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCpf(val);
                      // Auto-lookup in CNES database
                      const cleanVal = val.replace(/\D/g, '');
                      const match = cnesProfessionals.find(p => p.cpf.replace(/\D/g, '') === cleanVal || p.cpf === val);
                      if (match) {
                        setCnesMatch(match);
                        setParticipantName(match.name);
                        setCategory(match.professionalCategory);
                        setRegNumber(match.councilRegistration || `CNS-${match.cns.slice(-6)}`);
                        setParticipantUnitId(match.unitId);
                      } else {
                        setCnesMatch(null);
                      }
                    }}
                    placeholder="000.000.000-00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                  {cnesMatch && (
                    <span className="absolute right-2 top-2 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-300">
                      <ShieldCheck className="w-3 h-3" /> CNES Ativo
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Seu Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Ex: Dra. Mariana Vasconcelos"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Matrícula SUS / Registro de Classe
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="Ex: COREN-PE 123456"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Sua Categoria Profissional <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProfessionalCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {ALL_PROFESSIONAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {cnesMatch && (
                <div className="sm:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-center justify-between text-[11px] text-blue-900">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span>
                      Vínculo CNES detectado: <strong>{cnesMatch.cboDescription}</strong> ({cnesMatch.weeklyHours}h) • {cnesMatch.unitName}
                    </span>
                  </div>
                  {onOpenCnesModal && (
                    <button
                      type="button"
                      onClick={onOpenCnesModal}
                      className="text-blue-700 font-bold hover:underline"
                    >
                      Ver detalhes CNES
                    </button>
                  )}
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Sua Unidade de Lotação / Atuação
                </label>
                <select
                  value={participantUnitId}
                  onChange={(e) => setParticipantUnitId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="btn-confirm-checkin"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition flex items-center justify-center space-x-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Confirmar Minha Presença na Chamada</span>
              </button>
            </div>

          </form>

        </div>

        {/* REACTION EVALUATION / CERTIFICATE TRIGGER (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <div>
                <h3 className="font-bold text-sm text-slate-800">Avaliação de Reação & Impacto</h3>
                <p className="text-[11px] text-slate-400">Qualidade da formação e aplicabilidade no SUS</p>
              </div>
            </div>

            <div className="p-4">
              {activeCheckinRecord ? (
                <div className="space-y-3.5 text-xs">
                  
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-950">
                    <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Presença Homologada: {activeCheckinRecord.actionCode}</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      "{activeCheckinRecord.actionTitle}" ({activeCheckinRecord.workloadHours} horas)
                    </p>
                  </div>

                  {!feedbackSuccess ? (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          1. Didática e Domínio do Docente
                        </label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setInstructorRating(star)}
                              className={`px-2 py-1 rounded border text-xs font-bold transition ${
                                instructorRating >= star
                                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                              }`}
                            >
                              ★ {star}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          2. Aplicabilidade Prática no SUS
                        </label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setApplicabilityRating(star)}
                              className={`px-2 py-1 rounded border text-xs font-bold transition ${
                                applicabilityRating >= star
                                  ? 'bg-blue-50 border-blue-300 text-blue-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                              }`}
                            >
                              ★ {star}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Comentários Construtivos
                        </label>
                        <textarea
                          rows={2}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="O que achou do treinamento? O que pode melhorar?"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-xs"
                      >
                        Salvar Avaliação & Liberar Certificado
                      </button>
                    </form>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-center space-y-2.5">
                      <p className="text-xs text-blue-950 font-medium">
                        Obrigado! Sua avaliação foi registrada na matriz pedagógica da SERMAC.
                      </p>
                      <button
                        onClick={() => onOpenCertificate(activeCheckinRecord)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Emitir Certificado Funcional</span>
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs space-y-2">
                  <UserCheck className="w-7 h-7 text-slate-300 mx-auto" />
                  <p>Realize o auto-checkin de presença ao lado para habilitar o formulário de avaliação e a emissão do seu certificado.</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl text-[11px] text-slate-500 flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Certificados possuem código autenticador homologado pela SERMAC.</span>
          </div>

        </div>

      </div>

      {/* PASSPORT OF PERMANENT EDUCATION (CARTEIRA DO PROFISSIONAL) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
        
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-800">
                Meu Passaporte de Educação Permanente
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Histórico de certificações e horas acumuladas para pontuação funcional no SUS
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-md text-xs font-mono font-bold text-slate-800">
              Total: <strong>{totalAccumulatedHours}h</strong>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={passportSearch}
                onChange={(e) => setPassportSearch(e.target.value)}
                placeholder="Filtrar por CPF ou Nome..."
                className="bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none w-48 sm:w-56"
              />
            </div>
          </div>
        </div>

        {myPassportRecords.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Nenhum certificado registrado com o filtro informado.
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {myPassportRecords.map((rec) => (
              <div 
                key={rec.id}
                className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl shadow-2xs hover:border-blue-300 transition space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="bg-slate-200 text-slate-800 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                      {rec.actionCode}
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono">{rec.date}</span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 leading-snug">
                    {rec.actionTitle}
                  </h4>

                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <p><strong>Profissional:</strong> {rec.participantName}</p>
                    <p><strong>Categoria:</strong> {rec.professionalCategory}</p>
                    <p><strong>Unidade:</strong> {rec.unitName}</p>
                    <p><strong>Carga Horária:</strong> <strong className="text-blue-700 font-mono">{rec.workloadHours}h</strong></p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 font-mono">
                    {rec.certificateCode}
                  </span>

                  <button
                    onClick={() => onOpenCertificate(rec)}
                    className="flex items-center space-x-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition"
                  >
                    <Award className="w-3 h-3" />
                    <span>Certificado</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
