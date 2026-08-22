export type UserRole = 'SERMAC_CENTRAL' | 'NEPS_UNIT' | 'PARTICIPANT';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registrationNumber: string;
  unitId?: string;
  unitName?: string;
  avatarInitials?: string;
  jobTitle?: string;
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
  type: UnitType;
  district: string;
  coordinatorName: string;
  coordinatorEmail: string;
  totalStaff: number;
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
  | 'Condutor de Ambulância / Transporte';

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
  | 'Oficina Prática / Hands-on'
  | 'Simulação Realística / Cenário Clínico'
  | 'Roda de Conversa / Problematização (Arco de Maguerez)'
  | 'Estudo de Casos Clínicos Interprofissionais'
  | 'Exposição Dialogada com Dinâmica de Grupo'
  | 'Instrução no Posto de Trabalho (In Loco)'
  | 'Webinar com Fórum de Debates';

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
  modality: Modality;
  methodology: ActiveMethodology;
  workloadHours: number;
  dateStart: string;
  dateEnd: string;
  timeSchedule: string;
  location: string;
  maxSeats: number;
  status: ActionStatus;
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
}

export interface TrainingNeedDNC {
  id: string;
  unitId: string;
  unitName: string;
  suggestedTheme: string;
  thematicAxis: ThematicAxis;
  justification: string;
  targetCategories: ProfessionalCategory[];
  urgency: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  requestedBy: string;
  dateReported: string;
  status: 'Pendente' | 'Aprovado_LNT' | 'Aprovado_PAEPS' | 'Em_Planejamento' | 'Atendido';
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
