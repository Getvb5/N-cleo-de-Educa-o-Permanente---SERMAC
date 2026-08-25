export type UserRole = 'SERMAC_CENTRAL' | 'NEPS_UNIT' | 'PARTICIPANT';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registrationNumber: string;
  cpf?: string;
  unitId?: string;
  unitName?: string;
  declaredUnitIds?: string[];
  declaredUnitNames?: string[];
  avatarInitials?: string;
  jobTitle?: string;
  photoUrl?: string;
  authProvider?: 'google' | 'institutional';
}

export type UnitType = 
  | 'UBS' 
  | 'ESF' 
  | 'UPA' 
  | 'HOSPITAL' 
  | 'MATERNIDADE'
  | 'CAPS' 
  | 'POLICLINICA' 
  | 'AMBULATORIO'
  | 'CENTRO_SAUDE'
  | 'VIGILANCIA' 
  | 'SAMU' 
  | 'LABORATORIO';

export interface HealthUnit {
  id: string;
  name: string;
  code: string;
  cnes?: string; // Código CNES oficial (7 dígitos)
  type: UnitType;
  district: string;
  coordinatorName: string;
  coordinatorEmail: string;
  totalStaff: number;
  activeStaffBreakdown?: Partial<Record<ProfessionalCategory, number>>;
  lastCensusDate?: string;
  censusStatus?: 'atualizado' | 'pendente' | 'em_revisao';
  cnesSyncedAt?: string; // Última sincronização de dados CNES
}

export interface CnesProfessional {
  id: string;
  cpf?: string;
  cns: string; // Cartão Nacional de Saúde
  name: string;
  cboCode: string; // Código CBO (ex: 2235-05, 2251-25)
  cboDescription: string;
  professionalCategory: ProfessionalCategory;
  councilRegistration?: string;
  cnesUnitCode: string; // Código CNES da unidade de lotação
  unitId: string;
  unitName: string;
  weeklyHours: number; // Carga horária semanal (ex: 20h, 30h, 40h)
  contractType: 'Estatutário' | 'Contrato Temporário' | 'CLT / Fundação' | 'Residente / Bolsista' | 'Cedido';
  status: 'Ativo' | 'Afastado' | 'Licença';
  lastSynced: string;
}

export interface CnesSyncSummary {
  unitId: string;
  cnesCode: string;
  syncedAt: string;
  totalActiveProfessionals: number;
  categoriesFound: number;
  source: 'DATASUS_API' | 'CNES_ARQUIVO_XML' | 'CNES_ARQUIVO_CSV';
}

export interface UnitStaffCensus {
  id: string;
  unitId: string;
  unitName: string;
  period: string; // ex: '2026-08' ou 'Agosto/2026'
  totalActiveStaff: number;
  breakdown: Partial<Record<ProfessionalCategory, number>>;
  notes?: string;
  submittedBy: string;
  submittedAt: string;
  verifiedBySermac: boolean;
}

export type ProfessionalCategory =
  | 'Médico(a) da Família / Clínico'
  | 'Médico(a) Especialista / Emergencista'
  | 'Enfermeiro(a)'
  | 'Técnico(a) de Enfermagem'
  | 'Auxiliar de Enfermagem'
  | 'Agente Comunitário de Saúde (ACS)'
  | 'Agente de Combate a Endemias (ACE)'
  | 'Psicólogo(a)'
  | 'Fisioterapeuta'
  | 'Assistente Social'
  | 'Farmacêutico(a)'
  | 'Nutricionista'
  | 'Cirurgião(ã)-Dentista'
  | 'Técnico/Auxiliar de Saúde Bucal'
  | 'Fonoaudiólogo(a) / Terapeuta Ocupacional'
  | 'Recepcionista / Atendimento'
  | 'Agente Administrativo / Faturamento'
  | 'Higienização e Apoio Operacional'
  | 'Condutor de Ambulância / Transporte'
  | 'Outro';

export type InstructorCategory =
  | 'Facilitador Local NEPS (Unidade)'
  | 'Equipe Técnica / Tutor SERMAC'
  | 'Médico(a) Preceptor / Especialista'
  | 'Enfermeiro(a) RT / Especialista'
  | 'Profissional eMulti / NASF'
  | 'Docente Universitário / Residência'
  | 'Consultor(a) Externo / Ministério da Saúde'
  | 'Vigilância em Saúde / Coordenação';

export type ThematicAxis =
  | 'Atenção Primária e Saúde da Família'
  | 'Urgência, Emergência e Suporte à Vida'
  | 'Humanização e Acolhimento com Classificação de Risco'
  | 'Segurança do Paciente e Controle de Infecções (CCIH)'
  | 'Vigilância em Saúde, Arboviroses e Imunização'
  | 'Saúde Mental, Drogas e Matriciamento'
  | 'Saúde da Mulher, Materno-Infantil e Pré-Natal'
  | 'Doenças Crônicas Não Transmissíveis (DCNT)'
  | 'Ética, Legislação e Prontuário Eletrônico (e-SUS)'
  | 'Gestão do Trabalho e Liderança Interprofissional';

export type Modality = 'Presencial' | 'Híbrido' | 'EAD / Online';

export type ActiveMethodology =
  | 'Palestra'
  | 'Oficina Prática / Hands-on'
  | 'Simulação Realística / Cenário Clínico'
  | 'Roda de Conversa / Problematização (Arco de Maguerez)'
  | 'Estudo de Casos Clínicos Interprofissionais'
  | 'Exposição Dialogada com Dinâmica de Grupo'
  | 'Instrução no Posto de Trabalho (In Loco)'
  | 'Webinar com Fórum de Debates'
  | 'Outro';

export type ActionStatus = 'planejada' | 'em_andamento' | 'concluida' | 'cancelada';

export interface TrainingAction {
  id: string;
  code: string;
  title: string;
  thematicAxis: ThematicAxis;
  description: string;
  unitId: string;
  unitName: string;
  instructorName: string;
  instructorCategory: InstructorCategory;
  instructorAffiliation?: string;
  targetCategories: ProfessionalCategory[];
  customTargetCategory?: string; // Descrição quando 'Outro' é selecionado
  modality: Modality;
  methodology: ActiveMethodology;
  customMethodology?: string; // Descrição quando 'Outro' é selecionado
  workloadHours: number;
  dateStart: string;
  dateEnd: string;
  timeSchedule: string;
  location: string;
  maxSeats: number;
  plannedAttendeesCount?: number; // Nº de profissionais previstos para o tema (Indicador 3)
  eligibleProfessionalsCount?: number; // Nº de profissionais elegíveis da categoria (Indicador 4)
  isEsrLinked?: boolean; // Vinculado à Escola de Saúde do Recife - ESR (Indicador 6)
  esrLinkType?: 'Certificação Oficial ESR' | 'Parceria Pedagógica ESR' | 'Instrutoria Conjunta' | 'Programa Estratégico ESR';
  status: ActionStatus;
  cancellationReason?: string; // Motivo do cancelamento (Indicador 5)
  cancellationCategory?: 'Falta de Quórum' | 'Emergência/Surto' | 'Indisponibilidade de Instrutor' | 'Problemas de Infraestrutura' | 'Escala de Plantão/Remanejamento' | 'Outro';
  cancelledAt?: string;
  checkinPin: string;
  enrolledCount: number;
  attendedCount: number;
  satisfactionAverage: number;
  syllabus?: string[];
  competenciesToDevelop?: string[];
  materialsNeeded?: string[];
  createdAt: string;
  createdBy: string;
}

export interface SermacIndicatorReport {
  period: string; // ex: 'Agosto/2026' ou 'Consolidado 2026'
  generatedAt: string;
  
  // 1. Índice de Atividade da Educação Permanente (Meta: >= 90%)
  atividadeEP: {
    uniqueParticipants: number;
    totalActiveStaff: number;
    rate: number; // %
    meta: number; // 90
    isGoalMet: boolean;
    byUnit: Array<{
      unitId: string;
      unitName: string;
      uniqueParticipants: number;
      totalActiveStaff: number;
      rate: number;
      isGoalMet: boolean;
    }>;
  };

  // 2. Taxa de Execução do Plano do NEP - TEP (Meta: 100%)
  execucaoPlanoTEP: {
    executedActions: number; // realizadas (concluídas)
    plannedActions: number; // total planejadas no período
    rate: number; // %
    meta: number; // 100
    isGoalMet: boolean;
    byUnit: Array<{
      unitId: string;
      unitName: string;
      executed: number;
      planned: number;
      rate: number;
      isGoalMet: boolean;
    }>;
  };

  // 3. Coeficiente de Assiduidade por Tema (Meta: 100%)
  assiduidadePorTema: {
    totalTrainedInTheme: number;
    totalExpectedInTheme: number;
    rate: number; // %
    meta: number; // 100
    isGoalMet: boolean;
    byAction: Array<{
      actionId: string;
      actionCode: string;
      title: string;
      thematicAxis: ThematicAxis;
      unitName: string;
      trained: number;
      expected: number;
      rate: number;
      isGoalMet: boolean;
    }>;
  };

  // 4. Taxa de Adesão por Categoria Profissional (Meta: >= 90%)
  adesaoPorCategoria: {
    overallRate: number;
    meta: number; // 90
    byCategory: Array<{
      category: ProfessionalCategory;
      participantsCount: number;
      eligibleCount: number;
      rate: number;
      isGoalMet: boolean;
    }>;
  };

  // 5. Taxa de Cancelamento das Ações de EP (Meta: <= 10%)
  taxaCancelamento: {
    cancelledActions: number;
    totalPlannedActions: number;
    rate: number; // %
    meta: number; // 10
    isGoalMet: boolean;
    reasonsBreakdown: Array<{
      reason: string;
      count: number;
      percentage: number;
    }>;
  };

  // 6. Percentual de Treinamentos Vinculados à ESR (Meta: A definir)
  vinculacaoESR: {
    esrLinkedActions: number;
    totalCompletedActions: number;
    rate: number; // %
    metaLabel: string; // 'A definir'
    byType: Array<{
      type: string;
      count: number;
    }>;
  };
}

export interface FeedbackData {
  satisfactionRating: number; // 1 to 5
  applicabilityRating: number; // 1 to 5 (impact on daily work)
  instructorRating: number; // 1 to 5
  contentClarityRating: number; // 1 to 5
  comment?: string;
  suggestions?: string;
}

export interface AttendanceRecord {
  id: string;
  actionId: string;
  actionTitle: string;
  actionCode: string;
  thematicAxis: ThematicAxis;
  unitId: string;
  unitName: string;
  participantName: string;
  cpf: string;
  registrationNumber: string; // Matrícula SUS
  professionalCategory: ProfessionalCategory;
  participantUnitId: string;
  participantUnitName: string;
  workloadHours: number;
  date: string;
  checkinTimestamp: string;
  status: 'presente' | 'ausente' | 'justificado';
  feedback?: FeedbackData;
  certificateIssued: boolean;
  certificateCode: string;
  userId?: string;
  userEmail?: string;
}

export interface TrainingNeedDNC {
  id: string;
  unitId: string;
  unitName: string;
  suggestedTheme: string;
  thematicAxis?: ThematicAxis;
  justification: string;
  targetCategories: (ProfessionalCategory | string)[];
  urgency: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  requestedBy?: string;
  dateReported: string;
  status: 'Pendente' | 'Aprovado_LNT' | 'Aprovado_PAEPS' | 'Em_Planejamento' | 'Atendido';
  estimatedParticipants?: number;
}

export interface AIAnalysisResult {
  summary: string;
  criticalGaps: string[];
  pedagogicalRecommendations: string[];
  strategicScore: number;
  priorityThemes: string[];
  multiplierInsight?: string;
}

export interface AIPedagogicalPlan {
  title: string;
  objective: string;
  methodology: string;
  syllabus: string[];
  competenciesToDevelop: string[];
  evaluationMethod: string;
  materialsNeeded: string[];
}
