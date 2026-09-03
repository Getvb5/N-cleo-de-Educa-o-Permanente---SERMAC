import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrainingAction, 
  AttendanceRecord, 
  HealthUnit, 
  ProfessionalCategory,
  FeedbackData,
  CnesProfessional,
  AuthUser
} from '../types';
import { 
  ALL_PROFESSIONAL_CATEGORIES 
} from '../data/mockData';
import { lookupCnesProfessionalApi, formatCpf } from '../utils/cnesService';
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
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Lock,
  User,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Plus,
  Filter,
  CheckSquare,
  Square,
  Layers,
  MapPin,
  HelpCircle
} from 'lucide-react';

interface ParticipantPortalProps {
  currentUser?: AuthUser | null;
  actions: TrainingAction[];
  attendance: AttendanceRecord[];
  units: HealthUnit[];
  cnesProfessionals?: CnesProfessional[];
  onRegisterCheckin: (record: AttendanceRecord | Omit<AttendanceRecord, 'id' | 'certificateCode'>) => void;
  onSaveFeedback: (attendanceId: string, feedback: FeedbackData) => void;
  onOpenCertificate: (record: AttendanceRecord) => void;
  onOpenCnesModal?: () => void;
  onAddCnesProfessional?: (newProf: CnesProfessional) => void;
  onUpdateCurrentUser?: (updatedUser: AuthUser) => void;
}

export const ParticipantPortal: React.FC<ParticipantPortalProps> = ({
  currentUser,
  actions = [],
  attendance = [],
  units = [],
  cnesProfessionals = [],
  onRegisterCheckin,
  onSaveFeedback,
  onOpenCertificate,
  onOpenCnesModal,
  onAddCnesProfessional,
  onUpdateCurrentUser
}) => {
  // Check-in Form State initialized with logged-in user if available
  const [pin, setPin] = useState('');
  const [selectedActionId, setSelectedActionId] = useState('');
  const [participantName, setParticipantName] = useState(currentUser?.name || '');
  const [cpf, setCpf] = useState(currentUser?.cpf || '');
  const [regNumber, setRegNumber] = useState(currentUser?.registrationNumber || '');
  const [category, setCategory] = useState<ProfessionalCategory>('Enfermeiro(a)');
  const [cnesMatch, setCnesMatch] = useState<CnesProfessional | null>(null);
  const [isSearchingCnes, setIsSearchingCnes] = useState(false);
  const [cnesLookupFeedback, setCnesLookupFeedback] = useState<string | null>(null);
  
  // Track IDs of certificates issued in current session to ensure instantaneous Passport presence
  const [sessionIssuedIds, setSessionIssuedIds] = useState<Set<string>>(() => new Set());

  // Single unit of lotação from user's login
  const userUnitId = currentUser?.unitId || units[0]?.id || 'unit-159';
  const userUnit = useMemo(() => {
    return units.find(u => u.id === userUnitId) || units[0];
  }, [units, userUnitId]);

  // Catalog filters
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogStatusFilter, setCatalogStatusFilter] = useState<'todos' | 'planejada' | 'em_andamento' | 'concluida'>('todos');

  // Sync user info if currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !participantName) setParticipantName(currentUser.name);
      if (currentUser.registrationNumber && !regNumber) setRegNumber(currentUser.registrationNumber);
      if (currentUser.cpf && !cpf) setCpf(currentUser.cpf);
    }
  }, [currentUser]);

  // STRICT REQUIREMENT: ONLY return courses offered by the user's logged-in health unit
  const unitOfferedActions = useMemo(() => {
    return actions.filter(a => a.unitId === userUnitId);
  }, [actions, userUnitId]);

  // Active / Ongoing trainings available for check-in from this unit
  const activeTrainings = useMemo(() => {
    return unitOfferedActions.filter(a => a.status === 'em_andamento' || a.status === 'planejada' || a.status === 'concluida');
  }, [unitOfferedActions]);

  // Real-time matched action based on entered PIN (within user's unit)
  const pinMatchedAction = useMemo(() => {
    const cleanPin = pin.trim();
    if (cleanPin.length !== 4) return null;
    return unitOfferedActions.find(a => a.checkinPin.trim() === cleanPin && a.status !== 'cancelada') || null;
  }, [pin, unitOfferedActions]);

  // Detect if PIN belongs to another health unit
  const otherUnitActionMatch = useMemo(() => {
    const cleanPin = pin.trim();
    if (cleanPin.length !== 4 || pinMatchedAction) return null;
    return actions.find(a => a.checkinPin.trim() === cleanPin && a.status !== 'cancelada') || null;
  }, [pin, pinMatchedAction, actions]);

  // Catalog filtered actions
  const filteredCatalogActions = useMemo(() => {
    return unitOfferedActions.filter(a => {
      const matchStatus = catalogStatusFilter === 'todos' || a.status === catalogStatusFilter;
      const term = catalogSearch.toLowerCase().trim();
      const matchSearch = !term || (
        a.title.toLowerCase().includes(term) ||
        a.code.toLowerCase().includes(term) ||
        a.thematicAxis.toLowerCase().includes(term) ||
        a.targetAudience.toLowerCase().includes(term) ||
        a.unitName.toLowerCase().includes(term) ||
        a.instructor.toLowerCase().includes(term)
      );
      return matchStatus && matchSearch;
    });
  }, [unitOfferedActions, catalogStatusFilter, catalogSearch]);

  // Live lookup logic for CNES
  const handlePerformCnesLookup = async (inputVal?: string) => {
    const rawValue = (inputVal || cpf || participantName).trim();
    const cleanVal = rawValue.replace(/\D/g, '');
    if (!rawValue) {
      alert('Por favor digite o Cartão SUS (CNS) ou Nome para consulta no CNES.');
      return;
    }

    // 1. Check local list
    const localMatch = cnesProfessionals.find(p => 
      (cleanVal && p.cns === cleanVal) || 
      (cleanVal && p.cns.includes(cleanVal)) ||
      (p.name && p.name.toLowerCase().includes(rawValue.toLowerCase()))
    );
    if (localMatch) {
      setCnesMatch(localMatch);
      setParticipantName(localMatch.name);
      setCategory(localMatch.professionalCategory);
      setRegNumber(`CNS-${localMatch.cns.slice(-6)}`);
      setCnesLookupFeedback(`Profissional localizado no CNES (${localMatch.unitName})`);
      return;
    }

    // 2. Query live CNES API
    setIsSearchingCnes(true);
    setCnesLookupFeedback(null);

    try {
      const result = await lookupCnesProfessionalApi(cleanVal || rawValue, {
        unitId: userUnit.id,
        unitName: userUnit.name,
        cnesCode: userUnit.cnes,
        nameHint: participantName || (!cleanVal ? rawValue : undefined),
        categoryHint: category || undefined
      });

      if (result) {
        setCnesMatch(result);
        setParticipantName(result.name);
        setCategory(result.professionalCategory);
        setRegNumber(`CNS-${result.cns.slice(-6)}`);
        setCnesLookupFeedback(`Cadastro recuperado com sucesso do Cadastro Nacional CNES / DATASUS!`);

        // Save in global database
        if (onAddCnesProfessional) {
          onAddCnesProfessional(result);
        }
      } else {
        setCnesLookupFeedback('Profissional não localizado no CNES com os dados informados.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingCnes(false);
    }
  };
  
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

  const handleCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim();

    if (!cleanPin) {
      alert('Por favor, informe o código PIN de 4 dígitos gerado pelo facilitador / Coordenação NEPS.');
      return;
    }

    if (cleanPin.length !== 4) {
      alert('O PIN de confirmação de presença deve ter exatamente 4 dígitos numéricos.');
      return;
    }

    // STRICT PIN VALIDATION: Must match an action offered by declared units
    const targetAction = unitOfferedActions.find(a => a.checkinPin.trim() === cleanPin && a.status !== 'cancelada');

    if (!targetAction) {
      if (otherUnitActionMatch) {
        alert(
          `O PIN "${cleanPin}" pertence à capacitação "${otherUnitActionMatch.title}" ofertada pela unidade "${otherUnitActionMatch.unitName}".\n\nSua conta está vinculada à unidade "${userUnit.name}". As capacitações e certificações neste portal são exclusivas para a sua unidade de lotação.`
        );
        return;
      }

      alert(`PIN "${cleanPin}" inválido! Este código não corresponde a nenhuma ação educativa ativa ou cadastrada pela Coordenação NEPS da sua unidade (${userUnit.name}).`);
      return;
    }

    if (!participantName.trim() || !cpf.trim()) {
      alert('Por favor preencha seu nome completo e CPF para emissão do certificado autenticado.');
      return;
    }

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

    const certCode = `CERT-${targetAction.code}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecordId = `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const effectiveName = participantName.trim() || currentUser?.name || 'Profissional SUS';
    const effectiveCpf = cpf.trim() || currentUser?.cpf || '';
    const effectiveReg = regNumber.trim() || currentUser?.registrationNumber || `SUS-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecordData: AttendanceRecord = {
      id: newRecordId,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      actionId: targetAction.id,
      actionTitle: targetAction.title,
      actionCode: targetAction.code,
      thematicAxis: targetAction.thematicAxis,
      unitId: targetAction.unitId,
      unitName: targetAction.unitName,
      participantName: effectiveName,
      cpf: effectiveCpf,
      registrationNumber: effectiveReg,
      professionalCategory: category,
      participantUnitId: userUnit.id,
      participantUnitName: userUnit.name,
      workloadHours: targetAction.workloadHours,
      date: targetAction.dateStart,
      checkinTimestamp: new Date().toISOString(),
      status: 'presente' as const,
      certificateIssued: true,
      certificateCode: certCode
    };

    // Reset feedback form to clean initial states
    setSatisfactionRating(5);
    setInstructorRating(5);
    setApplicabilityRating(5);
    setContentClarityRating(5);
    setComment('');
    setSuggestions('');
    setFeedbackSuccess(false);

    onRegisterCheckin(newRecordData);
    setActiveCheckinRecord(newRecordData);
    setSessionIssuedIds(prev => new Set([...prev, newRecordId]));

    // Sync updated name/cpf/registration with user profile
    if (currentUser && onUpdateCurrentUser) {
      onUpdateCurrentUser({
        ...currentUser,
        name: effectiveName,
        cpf: effectiveCpf,
        registrationNumber: effectiveReg,
        unitId: userUnit.id,
        unitName: userUnit.name
      });
    }

    setPin('');
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheckinRecord) return;

    const feedbackPayload: FeedbackData = {
      satisfactionRating: Number(satisfactionRating),
      applicabilityRating: Number(applicabilityRating),
      instructorRating: Number(instructorRating),
      contentClarityRating: Number(contentClarityRating),
      comment: comment.trim() || undefined,
      suggestions: suggestions.trim() || undefined
    };

    onSaveFeedback(activeCheckinRecord.id, feedbackPayload);
    setActiveCheckinRecord(prev => prev ? { ...prev, feedback: feedbackPayload } : null);
    setFeedbackSuccess(true);
  };

  // Filter only certificates for the current logged-in professional
  const userFilteredAttendance = useMemo(() => {
    if (!currentUser) return attendance;
    
    // Normalize string removing diacritics, prefixes, punctuation
    const sanitize = (str: string) => 
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/^(dr\.|dra\.|enf\.|t[eé]c\.|prof\.|profa\.|farm\.|biom[eé]d\.|acs|ace|med\.|nutri\.|fisiot\.|psic\.)\s+/gi, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const currentCleanName = sanitize(currentUser.name || '');
    const formCleanName = sanitize(participantName || '');
    const currentEmail = (currentUser.email || '').trim().toLowerCase();
    const currentUserId = currentUser.id;

    const currentRegDigits = (currentUser.registrationNumber || '').replace(/\D/g, '');
    const formRegDigits = regNumber.replace(/\D/g, '');
    const currentCpfDigits = (currentUser.cpf || '').replace(/\D/g, '');
    const formCpfDigits = cpf.replace(/\D/g, '');

    const nameTokens = currentCleanName.split(' ').filter(t => t.length > 2);
    const formNameTokens = formCleanName.split(' ').filter(t => t.length > 2);

    return attendance.filter((rec) => {
      // 1. Newly issued in this session
      if (sessionIssuedIds.has(rec.id) || (activeCheckinRecord && activeCheckinRecord.id === rec.id)) {
        return true;
      }

      // 2. Direct ID or Email match
      if (rec.userId && currentUserId && rec.userId === currentUserId) {
        return true;
      }
      if (rec.userEmail && currentEmail && rec.userEmail.toLowerCase() === currentEmail) {
        return true;
      }

      // 3. CPF match
      const recCpfDigits = (rec.cpf || '').replace(/\D/g, '');
      if (recCpfDigits && recCpfDigits.length >= 6) {
        if (currentCpfDigits && (recCpfDigits === currentCpfDigits || recCpfDigits.includes(currentCpfDigits) || currentCpfDigits.includes(recCpfDigits))) {
          return true;
        }
        if (formCpfDigits && (recCpfDigits === formCpfDigits || recCpfDigits.includes(formCpfDigits) || formCpfDigits.includes(recCpfDigits))) {
          return true;
        }
      }

      // 4. Registration number (Matrícula / COREN / CNS) match
      const recRegDigits = (rec.registrationNumber || '').replace(/\D/g, '');
      if (recRegDigits && recRegDigits.length >= 3) {
        if (currentRegDigits && (recRegDigits === currentRegDigits || recRegDigits.endsWith(currentRegDigits) || currentRegDigits.endsWith(recRegDigits))) {
          return true;
        }
        if (formRegDigits && (recRegDigits === formRegDigits || recRegDigits.endsWith(formRegDigits) || formRegDigits.endsWith(recRegDigits))) {
          return true;
        }
      }

      // 5. Name match (Exact, Substring, or 2+ token overlap)
      const recCleanName = sanitize(rec.participantName || '');
      if (recCleanName) {
        if (currentCleanName && (
          recCleanName === currentCleanName ||
          recCleanName.includes(currentCleanName) ||
          currentCleanName.includes(recCleanName)
        )) {
          return true;
        }
        if (formCleanName && formCleanName.length > 4 && (
          recCleanName === formCleanName ||
          recCleanName.includes(formCleanName) ||
          formCleanName.includes(recCleanName)
        )) {
          return true;
        }

        // Token overlap
        const recTokens = recCleanName.split(' ').filter(t => t.length > 2);
        if (nameTokens.length > 0) {
          const commonTokens = nameTokens.filter(t => recTokens.includes(t));
          if (commonTokens.length >= 2 || (nameTokens.length === 1 && commonTokens.length === 1)) {
            return true;
          }
        }
        if (formNameTokens.length > 0) {
          const commonFormTokens = formNameTokens.filter(t => recTokens.includes(t));
          if (commonFormTokens.length >= 2) {
            return true;
          }
        }
      }

      return false;
    });
  }, [attendance, currentUser, participantName, cpf, regNumber, sessionIssuedIds, activeCheckinRecord]);

  // Filtered Passport records (by search keyword within user's own certificates)
  const myPassportRecords = useMemo(() => {
    if (!passportSearch.trim()) return userFilteredAttendance;
    const term = passportSearch.toLowerCase().trim();
    return userFilteredAttendance.filter(r => 
      r.actionTitle.toLowerCase().includes(term) ||
      r.thematicAxis.toLowerCase().includes(term) ||
      r.certificateCode.toLowerCase().includes(term) ||
      r.actionCode.toLowerCase().includes(term) ||
      r.unitName.toLowerCase().includes(term) ||
      r.date.includes(term)
    );
  }, [userFilteredAttendance, passportSearch]);

  const totalAccumulatedHours = useMemo(() => {
    return userFilteredAttendance.reduce((acc, r) => acc + r.workloadHours, 0);
  }, [userFilteredAttendance]);

  return (
    <div className="space-y-6">
      
      {/* UNIT OF LOTAÇÃO BANNER */}
      <div className="bg-white border border-purple-200 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-linear-to-r from-purple-50/50 via-white to-blue-50/30">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 bg-purple-100/90 px-2 py-0.5 rounded">
                Unidade de Lotação do Usuário
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {unitOfferedActions.length} capacitações ofertadas
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-1.5 bg-white border border-purple-300 text-purple-950 font-bold text-xs px-3 py-1 rounded-lg shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>{userUnit.name}</span>
                <span className="text-[10px] text-purple-600 font-mono">({userUnit.type} • CNES {userUnit.cnes})</span>
              </span>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100/80 text-purple-900 rounded-lg text-xs font-semibold border border-purple-200">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
          <span>Lotação Vinculada ao Login e aos Certificados</span>
        </div>
      </div>

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
            Capacitações Ofertadas
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{unitOfferedActions.length}</span>
            <span className="text-xs text-purple-600 font-medium font-bold">Unidade de Lotação</span>
          </div>
          <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 w-[85%]"></div>
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

      {/* Main Grid: Check-in Card + Feedback/Evaluation */}
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
                <p className="text-[11px] text-slate-400">Validação instantânea com PIN de 4 dígitos da unidade de lotação ({userUnit.name})</p>
              </div>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Frequência Segura
            </span>
          </div>

          <form onSubmit={handleCheckinSubmit} className="p-4 space-y-4 text-xs">
            
            {/* PIN INPUT HERO */}
            <div className={`p-4 rounded-xl border transition-all ${
              pinMatchedAction
                ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-100'
                : otherUnitActionMatch
                ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-100'
                : pin.trim().length === 4
                ? 'bg-rose-50/60 border-rose-300 ring-2 ring-rose-100'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-800 font-bold text-xs uppercase tracking-wide">
                  Código PIN Oficial da Ação <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-slate-500 font-medium">
                  Gerado pela Coordenação NEPS de {userUnit.name}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={pin}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setPin(digitsOnly);
                      if (digitsOnly.length === 4) {
                        const match = unitOfferedActions.find(a => a.checkinPin.trim() === digitsOnly && a.status !== 'cancelada');
                        if (match) {
                          setSelectedActionId(match.id);
                        }
                      }
                    }}
                    placeholder="0000"
                    className="w-36 bg-white border border-slate-300 text-slate-900 font-mono font-black text-2xl tracking-widest text-center rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
                  />
                </div>

                <div className="flex-1 text-xs">
                  {pinMatchedAction ? (
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-100/70 border border-emerald-300 px-3 py-2 rounded-lg animate-in fade-in">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <span className="block text-[11px] font-mono uppercase text-emerald-900">
                          ✓ PIN Válido ({pinMatchedAction.unitName}): [{pinMatchedAction.code}]
                        </span>
                        <span className="text-[11px] font-normal truncate block text-emerald-950">
                          {pinMatchedAction.title} ({pinMatchedAction.workloadHours}h)
                        </span>
                      </div>
                    </div>
                  ) : otherUnitActionMatch ? (
                    <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 space-y-1">
                      <div className="flex items-center gap-1 font-bold text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Ação exclusiva de outra unidade ({otherUnitActionMatch.unitName})</span>
                      </div>
                      <p className="text-[10px] text-amber-800">
                        "{otherUnitActionMatch.title}" — Este PIN é exclusivo para profissionais lotados em {otherUnitActionMatch.unitName}.
                      </p>
                    </div>
                  ) : pin.trim().length === 4 ? (
                    <div className="flex items-center gap-1.5 text-rose-800 font-medium bg-rose-100/70 border border-rose-300 px-3 py-2 rounded-lg animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="text-[11px]">
                        PIN não localizado entre as ações ativas da unidade {userUnit.name}.
                      </span>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Digite os <strong>4 dígitos numéricos</strong> informados no treinamento da unidade {userUnit.name}.
                    </p>
                  )}
                </div>
              </div>

              {/* Quick helper for active unit actions */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                <span className="text-slate-400 font-medium text-[10px]">Ações com PIN ativo em {userUnit.name}:</span>
                {activeTrainings.length === 0 ? (
                  <span className="text-[10px] text-slate-400 italic">Nenhum PIN ativo no momento para a sua unidade de lotação.</span>
                ) : (
                  activeTrainings.slice(0, 4).map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setPin(a.checkinPin);
                        setSelectedActionId(a.id);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition border cursor-pointer ${
                        pin === a.checkinPin
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-700'
                      }`}
                      title={`${a.title} - ${a.unitName}`}
                    >
                      PIN {a.checkinPin} ({a.code})
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Participant Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-semibold text-xs">
                    CPF <span className="text-red-500">*</span> (Validação CNES)
                  </label>
                  <button
                    type="button"
                    onClick={() => handlePerformCnesLookup()}
                    disabled={isSearchingCnes || !cpf}
                    className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    <Search className={`w-3 h-3 ${isSearchingCnes ? 'animate-spin' : ''}`} />
                    <span>{isSearchingCnes ? 'Buscando...' : 'Buscar no CNES'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={(e) => {
                      const val = e.target.value;
                      const formatted = formatCpf(val);
                      setCpf(formatted);
                      
                      const cleanVal = formatted.replace(/\D/g, '');
                      // Immediate local lookup
                      const match = cnesProfessionals.find(p => p.cpf.replace(/\D/g, '') === cleanVal || p.cpf === formatted);
                      if (match) {
                        setCnesMatch(match);
                        setParticipantName(match.name);
                        setCategory(match.professionalCategory);
                        setRegNumber(match.councilRegistration || `CNS-${match.cns.slice(-6)}`);
                        setCnesLookupFeedback(null);
                      } else if (cleanVal.length === 11) {
                        // Auto-lookup online if 11 digits complete
                        handlePerformCnesLookup(cleanVal);
                      } else {
                        setCnesMatch(null);
                        setCnesLookupFeedback(null);
                      }
                    }}
                    placeholder="000.000.000-00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                  {cnesMatch && (
                    <span className="absolute right-2 top-2 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-300">
                      <ShieldCheck className="w-3 h-3" /> CNES Ativo
                    </span>
                  )}
                </div>
                {cnesLookupFeedback && !cnesMatch && (
                  <p className="text-[10px] text-amber-700 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{cnesLookupFeedback}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-xs">
                  Seu Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Ex: Dra. Mariana Vasconcelos"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-xs">
                  Matrícula SUS / Registro de Classe (CRM, COREN, CRO, etc.)
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="Ex: COREN-PE 123456"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-xs">
                  Sua Categoria Profissional <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProfessionalCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {ALL_PROFESSIONAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {cnesMatch && (
                <div className="sm:col-span-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between text-[11px] text-emerald-900 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Vínculo CNES Confirmado: <strong>{cnesMatch.cboDescription}</strong> ({cnesMatch.weeklyHours}h) • {cnesMatch.unitName}
                    </span>
                  </div>
                  {onOpenCnesModal && (
                    <button
                      type="button"
                      onClick={onOpenCnesModal}
                      className="text-emerald-700 font-bold hover:underline shrink-0"
                    >
                      Ver no CNES
                    </button>
                  )}
                </div>
              )}

              {/* LOCKED / BOUND UNIT OF LOTAÇÃO (CANNOT BE CHANGED ARBITRARILY TO DESYNC FROM LOGIN) */}
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1 text-xs">
                  Sua Unidade de Lotação / Vínculo Institucional
                </label>
                <div className="w-full bg-purple-50/70 border border-purple-200 rounded-lg p-2.5 flex items-center justify-between text-xs text-purple-950 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{userUnit.name}</p>
                      <p className="text-[10px] text-purple-700">
                        CNES: <span className="font-mono font-semibold">{userUnit.cnes}</span> • Tipo: {userUnit.type} • Definida no Login
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-purple-200 text-purple-900 px-2.5 py-1 rounded-md border border-purple-300 shrink-0 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                    Lotação Vinculada
                  </span>
                </div>
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
                    <form onSubmit={handleFeedbackSubmit} className="space-y-3.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                      <div className="border-b border-slate-200/80 pb-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-slate-800 font-bold text-xs">
                            1. Avaliação Geral do Treinamento (Satisfação)
                          </label>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            satisfactionRating >= 4 ? 'text-emerald-700 bg-emerald-50' : satisfactionRating === 3 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'
                          }`}>
                            {satisfactionRating === 1 && '★ 1 - Muito Insatisfeito'}
                            {satisfactionRating === 2 && '★ 2 - Insatisfeito'}
                            {satisfactionRating === 3 && '★ 3 - Regular'}
                            {satisfactionRating === 4 && '★ 4 - Satisfeito'}
                            {satisfactionRating === 5 && '★ 5 - Excelente'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setSatisfactionRating(star)}
                              className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                satisfactionRating >= star
                                  ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              <span>★</span>
                              <span>{star}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-b border-slate-200/80 pb-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-slate-800 font-bold text-xs">
                            2. Didática e Domínio do Facilitador / Docente
                          </label>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {instructorRating} / 5
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setInstructorRating(star)}
                              className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                instructorRating >= star
                                  ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              <span>★</span>
                              <span>{star}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-b border-slate-200/80 pb-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-slate-800 font-bold text-xs">
                            3. Aplicabilidade Prática no Cotidiano SUS
                          </label>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {applicabilityRating} / 5
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setApplicabilityRating(star)}
                              className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                applicabilityRating >= star
                                  ? 'bg-blue-600 border-blue-700 text-white shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              <span>★</span>
                              <span>{star}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-b border-slate-200/80 pb-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-slate-800 font-bold text-xs">
                            4. Clareza do Conteúdo e Recursos
                          </label>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {contentClarityRating} / 5
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setContentClarityRating(star)}
                              className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                contentClarityRating >= star
                                  ? 'bg-purple-600 border-purple-700 text-white shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              <span>★</span>
                              <span>{star}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1 text-xs">
                          Comentários ou Sugestões
                        </label>
                        <textarea
                          rows={2}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="O que achou do treinamento? Sugestões para próximas ações..."
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs"
                      >
                        <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                        <span>Salvar Avaliação de Reação</span>
                      </button>
                    </form>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-3">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Certificado emitido e vinculado à sua unidade!</span>
                      </div>
                      <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                        Sua participação foi computada com vínculo registrado em <strong>{activeCheckinRecord.participantUnitName || currentUser?.unitName}</strong> e o certificado oficial já está disponível no seu <strong>Passaporte de Educação Permanente</strong>.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <button
                          onClick={() => {
                            if (activeCheckinRecord) {
                              onOpenCertificate(activeCheckinRecord);
                            }
                          }}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Visualizar Certificado Oficial</span>
                        </button>
                      </div>
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

      {/* SECTION: CATALOG OF COURSES OFFERED BY AUTODECLARED UNITS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-linear-to-r from-slate-50 via-white to-purple-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center shadow-xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">
                Cursos Ofertados por sua Unidade de Lotação
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full">
                {unitOfferedActions.length} ações disponíveis
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Cursos e treinamentos cadastrados pelo NEPS para: <strong className="text-slate-800">{userUnit.name}</strong>.
            </p>
          </div>

          {/* Search and Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              {(['todos', 'planejada', 'em_andamento', 'concluida'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setCatalogStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                    catalogStatusFilter === st
                      ? 'bg-white text-purple-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'todos' ? 'Todos' : st === 'planejada' ? 'Planejadas' : st === 'em_andamento' ? 'Em Andamento' : 'Concluídas'}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Filtrar cursos da unidade..."
                className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none w-44 sm:w-56 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {filteredCatalogActions.length === 0 ? (
          <div className="text-center py-10 px-4 space-y-2">
            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700">
              Nenhuma capacitação encontrada para a(s) unidade(s) selecionada(s)
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Não há cursos com o filtro aplicado ofertados pelas suas unidades autodeclaradas. Quando a coordenação NEPS cadastrar novas ações, elas aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalogActions.map((act) => {
              const isSelected = selectedActionId === act.id || pin === act.checkinPin;
              return (
                <div
                  key={act.id}
                  className={`bg-white border rounded-xl p-4 shadow-2xs hover:shadow-sm transition flex flex-col justify-between group ${
                    isSelected
                      ? 'border-purple-500 ring-2 ring-purple-100 bg-purple-50/20'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-mono text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded">
                        {act.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        act.status === 'em_andamento'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                          : act.status === 'concluida'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {act.status === 'em_andamento' ? '● Em Andamento' : act.status === 'concluida' ? 'Concluída' : 'Planejada'}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 leading-snug group-hover:text-purple-900 transition-colors">
                      {act.title}
                    </h4>

                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                      <p className="truncate flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        <strong>Unidade:</strong> {act.unitName}
                      </p>
                      <p className="truncate"><strong>Eixo:</strong> {act.thematicAxis}</p>
                      <p className="truncate"><strong>Público:</strong> {act.targetAudience}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                        <span>Carga Horária: <strong>{act.workloadHours}h</strong></span>
                        <span>Modalidade: <strong>{act.modality}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      PIN: {act.checkinPin}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPin(act.checkinPin);
                        setSelectedActionId(act.id);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                      className="text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 px-3 py-1.5 rounded-lg shadow-2xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <Key className="w-3 h-3" />
                      <span>Usar no Check-in</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PASSPORT OF PERMANENT EDUCATION (CARTEIRA INDIVIDUAL DO PROFISSIONAL) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-linear-to-r from-slate-50 via-white to-blue-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-slate-800 tracking-tight">
                Meu Passaporte de Educação Permanente
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Titular Autenticado</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>Profissional: <strong className="text-slate-900">{currentUser?.name || 'Profissional SUS'}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Matrícula/CNS: <strong className="font-mono text-slate-800">{currentUser?.registrationNumber || 'SUS-PE'}</strong></span>
              {currentUser?.unitName && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 truncate max-w-xs">{currentUser.unitName}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs shadow-2xs flex items-center gap-2">
              <span className="text-slate-500 font-medium">Total Acreditado:</span>
              <strong className="text-blue-700 font-mono font-bold text-sm">{totalAccumulatedHours}h</strong>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={passportSearch}
                onChange={(e) => setPassportSearch(e.target.value)}
                placeholder="Buscar em meus certificados..."
                className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none w-48 sm:w-60 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {myPassportRecords.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="font-bold text-sm text-slate-700">
                {passportSearch.trim()
                  ? `Nenhum certificado encontrado para "${passportSearch}"`
                  : `Nenhum certificado registrado no passaporte de ${currentUser?.name || 'seu perfil'} ainda`}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {passportSearch.trim()
                  ? 'Verifique os termos digitados ou limpe o campo de busca para exibir todos os seus certificados.'
                  : 'Participe de uma das capacitações ativas da rede SUS e realize o auto-check-in acima com o PIN informado pelo facilitador para liberar sua declaração autenticada.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myPassportRecords.map((rec) => {
              const isNewlyIssued = activeCheckinRecord?.id === rec.id;
              return (
                <div 
                  key={rec.id}
                  className={`bg-white border p-4 rounded-xl shadow-2xs hover:shadow-sm transition flex flex-col justify-between group ${
                    isNewlyIssued
                      ? 'border-emerald-400 ring-2 ring-emerald-100 bg-emerald-50/20'
                      : 'border-slate-200/90 hover:border-blue-300'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-blue-50 text-blue-800 border border-blue-100 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                          {rec.actionCode}
                        </span>
                        {isNewlyIssued && (
                          <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Recém-emitido
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[10px] font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {rec.date}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 leading-snug group-hover:text-blue-900 transition-colors">
                      {rec.actionTitle}
                    </h4>

                    <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <p className="truncate"><strong>Eixo:</strong> {rec.thematicAxis}</p>
                      <p className="truncate flex items-center gap-1">
                        <Building className="w-3 h-3 text-purple-600 shrink-0" />
                        <span><strong>Lotação:</strong> {rec.participantUnitName || currentUser?.unitName || rec.unitName}</span>
                      </p>
                      <p className="truncate text-slate-500 text-[10px]">
                        Ofertante NEPS: {rec.unitName}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span>Carga Horária:</span>
                        <strong className="text-blue-700 font-mono font-bold">{rec.workloadHours} horas</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[9px] text-slate-400 font-mono truncate max-w-[120px]" title={rec.certificateCode}>
                      {rec.certificateCode}
                    </span>

                    <button
                      onClick={() => onOpenCertificate(rec)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1351B4] hover:bg-[#0C326F] px-3 py-1.5 rounded-lg shadow-2xs transition active:scale-95 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Visualizar Certificado</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
