import { 
  HealthUnit, 
  TrainingAction, 
  AttendanceRecord, 
  TrainingNeedDNC,
  ProfessionalCategory,
  InstructorCategory,
  ThematicAxis,
  ActiveMethodology,
  Modality
} from '../types';

export const INITIAL_HEALTH_UNITS: HealthUnit[] = [
  {
    id: 'unit-1',
    name: 'UBS Vila Esperança - Dr. Mário Covas',
    code: 'UBS-01',
    type: 'UBS',
    district: 'Distrito Norte',
    coordinatorName: 'Dra. Camila Nogueira (Enfermeira)',
    coordinatorEmail: 'neps.vilas@saude.gov.br',
    totalStaff: 48
  },
  {
    id: 'unit-2',
    name: 'UBS Central - Maria da Glória',
    code: 'UBS-02',
    type: 'UBS',
    district: 'Distrito Central',
    coordinatorName: 'Enf. Rodrigo Albuquerque',
    coordinatorEmail: 'neps.central@saude.gov.br',
    totalStaff: 62
  },
  {
    id: 'unit-3',
    name: 'UPA 24h Zona Norte - Dr. Geraldo Ferreira',
    code: 'UPA-ZN',
    type: 'UPA',
    district: 'Distrito Norte',
    coordinatorName: 'Dr. Lucas Silveira (Médico Emergencista)',
    coordinatorEmail: 'neps.upazn@saude.gov.br',
    totalStaff: 110
  },
  {
    id: 'unit-4',
    name: 'Hospital Municipal Dr. Arnaldo Peixoto',
    code: 'HM-AP',
    type: 'HOSPITAL',
    district: 'Distrito Leste',
    coordinatorName: 'Profa. Juliana Prado (Coord. NEPS Hospitalar)',
    coordinatorEmail: 'neps.hospital@saude.gov.br',
    totalStaff: 340
  },
  {
    id: 'unit-5',
    name: 'CAPS II Renascer - Saúde Mental',
    code: 'CAPS-02',
    type: 'CAPS',
    district: 'Distrito Sul',
    coordinatorName: 'Psic. Marcela Fontes',
    coordinatorEmail: 'neps.caps@saude.gov.br',
    totalStaff: 32
  },
  {
    id: 'unit-6',
    name: 'Policlínica Municipal de Especialidades',
    code: 'POLI-01',
    type: 'POLICLINICA',
    district: 'Distrito Central',
    coordinatorName: 'Farm. Carlos Eduardo Rocha',
    coordinatorEmail: 'neps.policlinica@saude.gov.br',
    totalStaff: 75
  },
  {
    id: 'unit-7',
    name: 'Coordenação de Vigilância em Saúde (COVS)',
    code: 'COVS-01',
    type: 'VIGILANCIA',
    district: 'Sede SERMAC',
    coordinatorName: 'Biól. Fernanda Vasconcelos',
    coordinatorEmail: 'vigilancia.sermac@saude.gov.br',
    totalStaff: 45
  },
  {
    id: 'unit-8',
    name: 'Base Central SAMU 192',
    code: 'SAMU-01',
    type: 'SAMU',
    district: 'Distrito Central',
    coordinatorName: 'Enf. Bruno Esteves',
    coordinatorEmail: 'neps.samu@saude.gov.br',
    totalStaff: 80
  }
];

export const ALL_PROFESSIONAL_CATEGORIES: ProfessionalCategory[] = [
  'Médico(a) da Família / Clínico',
  'Médico(a) Especialista / Emergencista',
  'Enfermeiro(a)',
  'Técnico(a) de Enfermagem',
  'Auxiliar de Enfermagem',
  'Agente Comunitário de Saúde (ACS)',
  'Agente de Combate a Endemias (ACE)',
  'Psicólogo(a)',
  'Fisioterapeuta',
  'Assistente Social',
  'Farmacêutico(a)',
  'Nutricionista',
  'Cirurgião(ã)-Dentista',
  'Técnico/Auxiliar de Saúde Bucal',
  'Fonoaudiólogo(a) / Terapeuta Ocupacional',
  'Recepcionista / Atendimento',
  'Agente Administrativo / Faturamento',
  'Higienização e Apoio Operacional',
  'Condutor de Ambulância / Transporte'
];

export const ALL_INSTRUCTOR_CATEGORIES: InstructorCategory[] = [
  'Facilitador Local NEPS (Unidade)',
  'Equipe Técnica / Tutor SERMAC',
  'Médico(a) Preceptor / Especialista',
  'Enfermeiro(a) RT / Especialista',
  'Profissional eMulti / NASF',
  'Docente Universitário / Residência',
  'Consultor(a) Externo / Ministério da Saúde',
  'Vigilância em Saúde / Coordenação'
];

export const ALL_THEMATIC_AXES: ThematicAxis[] = [
  'Atenção Primária e Saúde da Família',
  'Urgência, Emergência e Suporte à Vida',
  'Humanização e Acolhimento com Classificação de Risco',
  'Segurança do Paciente e Controle de Infecções (CCIH)',
  'Vigilância em Saúde, Arboviroses e Imunização',
  'Saúde Mental, Drogas e Matriciamento',
  'Saúde da Mulher, Materno-Infantil e Pré-Natal',
  'Doenças Crônicas Não Transmissíveis (DCNT)',
  'Ética, Legislação e Prontuário Eletrônico (e-SUS)',
  'Gestão do Trabalho e Liderança Interprofissional'
];

export const ALL_METHODOLOGIES: ActiveMethodology[] = [
  'Oficina Prática / Hands-on',
  'Simulação Realística / Cenário Clínico',
  'Roda de Conversa / Problematização (Arco de Maguerez)',
  'Estudo de Casos Clínicos Interprofissionais',
  'Exposição Dialogada com Dinâmica de Grupo',
  'Instrução no Posto de Trabalho (In Loco)',
  'Webinar com Fórum de Debates'
];

export const ALL_MODALITIES: Modality[] = [
  'Presencial',
  'Híbrido',
  'EAD / Online'
];

export const INITIAL_TRAINING_ACTIONS: TrainingAction[] = [
  {
    id: 'act-1',
    code: 'EPS-2026-001',
    title: 'Manejo Clínico de Arboviroses (Dengue, Chikungunya e Zika) na Atenção Primária',
    thematicAxis: 'Vigilância em Saúde, Arboviroses e Imunização',
    description: 'Capacitação prática em hidratação oportuna, estratificação de risco e notificação compulsória no e-SUS para equipes de saúde.',
    unitId: 'unit-1',
    unitName: 'UBS Vila Esperança - Dr. Mário Covas',
    instructorName: 'Dra. Mariana Guedes (Infectologista)',
    instructorCategory: 'Vigilância em Saúde / Coordenação',
    instructorAffiliation: 'COVS / SERMAC Central',
    targetCategories: [
      'Médico(a) da Família / Clínico',
      'Enfermeiro(a)',
      'Técnico(a) de Enfermagem',
      'Agente Comunitário de Saúde (ACS)'
    ],
    modality: 'Presencial',
    methodology: 'Estudo de Casos Clínicos Interprofissionais',
    workloadHours: 4,
    dateStart: '2026-08-10',
    dateEnd: '2026-08-10',
    timeSchedule: '08:00 às 12:00',
    location: 'Auditório da UBS Vila Esperança',
    maxSeats: 35,
    status: 'concluida',
    checkinPin: '8492',
    enrolledCount: 28,
    attendedCount: 26,
    satisfactionAverage: 4.8,
    syllabus: [
      'Sinais de alarme e estadiamento clínico da Dengue',
      'Protocolo de Hidratação venosa e oral rápida no acolhimento',
      'Critérios de transferência para UPA e acompanhamento domiciliar pelo ACS',
      'Notificação imediata no SINAN/e-SUS'
    ],
    competenciesToDevelop: [
      'Identificação precoce de sinais de choque e gravidade',
      'Integração médico-enfermagem-ACS no território',
      'Registro qualificado de dados epidemiológicos'
    ],
    materialsNeeded: ['Apostila de manejo clínico MS', 'Projetor', 'Fluxogramas plastificados'],
    createdAt: '2026-08-01',
    createdBy: 'Dra. Camila Nogueira'
  },
  {
    id: 'act-2',
    code: 'EPS-2026-002',
    title: 'Acolhimento com Classificação de Risco e Comunicação Não-Violenta no SUS',
    thematicAxis: 'Humanização e Acolhimento com Classificação de Risco',
    description: 'Oficina interativa de escuta qualificada, gestão de conflitos na porta de entrada e humanização da assistência.',
    unitId: 'unit-3',
    unitName: 'UPA 24h Zona Norte - Dr. Geraldo Ferreira',
    instructorName: 'Prof. Sérgio Meirelles (Psicólogo Hospitalar)',
    instructorCategory: 'Equipe Técnica / Tutor SERMAC',
    instructorAffiliation: 'Coordenação de Humanização SERMAC',
    targetCategories: [
      'Recepcionista / Atendimento',
      'Enfermeiro(a)',
      'Técnico(a) de Enfermagem',
      'Agente Administrativo / Faturamento',
      'Higienização e Apoio Operacional'
    ],
    modality: 'Presencial',
    methodology: 'Roda de Conversa / Problematização (Arco de Maguerez)',
    workloadHours: 6,
    dateStart: '2026-08-14',
    dateEnd: '2026-08-15',
    timeSchedule: '14:00 às 17:00 (2 encontros)',
    location: 'Sala de Treinamento NEPS UPA Zona Norte',
    maxSeats: 40,
    status: 'concluida',
    checkinPin: '3170',
    enrolledCount: 38,
    attendedCount: 35,
    satisfactionAverage: 4.9,
    syllabus: [
      'Diretrizes da Política Nacional de Humanização (HumanizaSUS)',
      'Protocolo de Manchester e postura da recepção frente a casos prioritários',
      'Técnicas de desescalada verbal e manejo de acompanhantes ansiosos',
      'Autocuidado dos profissionais que atuam na linha de frente'
    ],
    competenciesToDevelop: [
      'Escuta atenta e empatia no atendimento ao usuário',
      'Comunicação clara sobre tempos de espera e prioridades clínicas',
      'Trabalho articulado entre recepção e equipe de triagem'
    ],
    materialsNeeded: ['Vídeos reflexivos', 'Cartilha de acolhimento', 'Crachás de identificação'],
    createdAt: '2026-08-02',
    createdBy: 'Dr. Lucas Silveira'
  },
  {
    id: 'act-3',
    code: 'EPS-2026-003',
    title: 'Simulação Realística: Parada Cardiorrespiratória (PCR) e Suporte Básico de Vida (BLS)',
    thematicAxis: 'Urgência, Emergência e Suporte à Vida',
    description: 'Treinamento de alta fidelidade com manequins em ressuscitação cardiopulmonar de alta qualidade e uso do DEA.',
    unitId: 'unit-4',
    unitName: 'Hospital Municipal Dr. Arnaldo Peixoto',
    instructorName: 'Enf. Bruno Esteves e Dra. Patrícia Lima',
    instructorCategory: 'Facilitador Local NEPS (Unidade)',
    instructorAffiliation: 'Núcleo de Educação em Urgências (NEU/SAMU e Hospital)',
    targetCategories: [
      'Enfermeiro(a)',
      'Técnico(a) de Enfermagem',
      'Médico(a) Especialista / Emergencista',
      'Fisioterapeuta',
      'Condutor de Ambulância / Transporte'
    ],
    modality: 'Presencial',
    methodology: 'Simulação Realística / Cenário Clínico',
    workloadHours: 8,
    dateStart: '2026-08-18',
    dateEnd: '2026-08-18',
    timeSchedule: '08:00 às 17:00 (com intervalo)',
    location: 'Laboratório de Habilidades e Simulação Realística HM-AP',
    maxSeats: 25,
    status: 'concluida',
    checkinPin: '9021',
    enrolledCount: 25,
    attendedCount: 24,
    satisfactionAverage: 5.0,
    syllabus: [
      'Cadeia de Sobrevivência e reconhecimento rápido da PCR',
      'Compressões torácicas de alta qualidade e ventilação adequada',
      'Operação segura do Desfibrilador Externo Automático (DEA)',
      'Dinâmica de equipe de alto desempenho e debriefing estruturado'
    ],
    competenciesToDevelop: [
      'Execução técnica precisa das manobras de RCP',
      'Liderança compartilhada e comunicação em circuito fechado',
      'Tomada de decisão sob pressão em ambiente hospitalar'
    ],
    materialsNeeded: ['Manequins de RCP adultos e pediátricos', 'DEA de treinamento', 'Bolsa-valva-máscara'],
    createdAt: '2026-08-05',
    createdBy: 'Profa. Juliana Prado'
  },
  {
    id: 'act-4',
    code: 'EPS-2026-004',
    title: 'Prevenção de Lesão por Pressão e Higiene de Mãos: Meta 5 da Segurança do Paciente',
    thematicAxis: 'Segurança do Paciente e Controle de Infecções (CCIH)',
    description: 'Protocolos de segurança, aplicação da Escala de Braden e boas práticas na prevenção de IRAS na enfermagem.',
    unitId: 'unit-4',
    unitName: 'Hospital Municipal Dr. Arnaldo Peixoto',
    instructorName: 'Enf. Tatiane Barreto (CCIH)',
    instructorCategory: 'Enfermeiro(a) RT / Especialista',
    instructorAffiliation: 'Comissão de Controle de Infecção Hospitalar',
    targetCategories: [
      'Enfermeiro(a)',
      'Técnico(a) de Enfermagem',
      'Auxiliar de Enfermagem',
      'Fisioterapeuta',
      'Higienização e Apoio Operacional'
    ],
    modality: 'Presencial',
    methodology: 'Oficina Prática / Hands-on',
    workloadHours: 4,
    dateStart: '2026-08-20',
    dateEnd: '2026-08-20',
    timeSchedule: '13:30 às 17:30',
    location: 'Enfermaria Modelo - HM-AP',
    maxSeats: 30,
    status: 'concluida',
    checkinPin: '6543',
    enrolledCount: 29,
    attendedCount: 27,
    satisfactionAverage: 4.7,
    syllabus: [
      'Os 5 momentos da Higienização das Mãos segundo a OMS',
      'Classificação dos estágios de lesão por pressão',
      'Técnicas de reposicionamento no leito e coberturas protetoras',
      'Auditoria clínica e preenchimento de checklist de segurança'
    ],
    competenciesToDevelop: [
      'Adesão sistemática às práticas de biossegurança',
      'Avaliação da integridade cutânea em pacientes restritos ao leito',
      'Cuidado colaborativo entre equipe assistencial e de apoio'
    ],
    materialsNeeded: ['Gel fluorescente com luz UV para checagem de lavagem das mãos', 'Amostras de curativos', 'Escalas Braden impressas'],
    createdAt: '2026-08-08',
    createdBy: 'Profa. Juliana Prado'
  },
  {
    id: 'act-5',
    code: 'EPS-2026-005',
    title: 'Matriciamento em Saúde Mental na APS: Manejo de Ansiedade, Depressão e Crises',
    thematicAxis: 'Saúde Mental, Drogas e Matriciamento',
    description: 'Articulação entre equipes de Saúde da Família e CAPS para cuidado longitudinal e combate ao estigma.',
    unitId: 'unit-5',
    unitName: 'CAPS II Renascer - Saúde Mental',
    instructorName: 'Psic. Marcela Fontes e Dr. Daniel Castro (Psiquiatra)',
    instructorCategory: 'Profissional eMulti / NASF',
    instructorAffiliation: 'Equipe de Matriciamento CAPS II / SERMAC',
    targetCategories: [
      'Médico(a) da Família / Clínico',
      'Enfermeiro(a)',
      'Agente Comunitário de Saúde (ACS)',
      'Psicólogo(a)',
      'Assistente Social'
    ],
    modality: 'Híbrido',
    methodology: 'Estudo de Casos Clínicos Interprofissionais',
    workloadHours: 6,
    dateStart: '2026-08-24',
    dateEnd: '2026-08-25',
    timeSchedule: '09:00 às 12:00',
    location: 'Espaço de Convivência CAPS II / Transmissão Online',
    maxSeats: 50,
    status: 'em_andamento',
    checkinPin: '7721',
    enrolledCount: 46,
    attendedCount: 42,
    satisfactionAverage: 4.9,
    syllabus: [
      'Princípios da Reforma Psiquiátrica e Rede de Atenção Psicossocial (RAPS)',
      'Identificação de sofrimento psíquico e risco de autoextermínio',
      'Elaboração de Projeto Terapêutico Singular (PTS)',
      'Uso racional de psicofármacos e terapias integrativas na UBS'
    ],
    competenciesToDevelop: [
      'Construção de cuidado compartilhado sem encaminhamentos desnecessários',
      'Acolhimento da crise sem contenção violenta',
      'Sensibilidade e empatia em visitas domiciliares de saúde mental'
    ],
    materialsNeeded: ['Guias RAPS', 'Plataforma Google Meet para híbrido', 'Roteiro de PTS'],
    createdAt: '2026-08-10',
    createdBy: 'Psic. Marcela Fontes'
  },
  {
    id: 'act-6',
    code: 'EPS-2026-006',
    title: 'Qualificação do Registro no e-SUS APS e Boas Práticas no Prontuário Eletrônico',
    thematicAxis: 'Ética, Legislação e Prontuário Eletrônico (e-SUS)',
    description: 'Padronização de evolução clínica, SOEP, CIAP-2 e faturamento de procedimentos no sistema municipal.',
    unitId: 'unit-2',
    unitName: 'UBS Central - Maria da Glória',
    instructorName: 'Analista Tiago Mendonça',
    instructorCategory: 'Equipe Técnica / Tutor SERMAC',
    instructorAffiliation: 'Divisão de Informação e Tecnologia em Saúde SERMAC',
    targetCategories: [
      'Médico(a) da Família / Clínico',
      'Enfermeiro(a)',
      'Cirurgião(ã)-Dentista',
      'Agente Administrativo / Faturamento',
      'Farmacêutico(a)'
    ],
    modality: 'Presencial',
    methodology: 'Oficina Prática / Hands-on',
    workloadHours: 4,
    dateStart: '2026-08-28',
    dateEnd: '2026-08-28',
    timeSchedule: '08:30 às 12:30',
    location: 'Laboratório de Informática da SMS / SERMAC',
    maxSeats: 30,
    status: 'planejada',
    checkinPin: '5198',
    enrolledCount: 22,
    attendedCount: 0,
    satisfactionAverage: 0,
    syllabus: [
      'Estruturação da nota clínica pelo método SOAP',
      'Codificação correta CIAP-2 e CID-10 para financiamento SUS',
      'Gestão de listas de agendamento e dispensação de medicamentos',
      'Aspectos éticos e sigilo do prontuário digital (LGPD na Saúde)'
    ],
    competenciesToDevelop: [
      'Agilidade e completude no preenchimento de prontuários',
      'Melhoria dos indicadores do programa Previne Brasil / Novo Financiamento',
      'Garantia do sigilo e segurança dos dados do paciente'
    ],
    materialsNeeded: ['Computadores com ambiente de testes do e-SUS', 'Manual de apoio'],
    createdAt: '2026-08-15',
    createdBy: 'Enf. Rodrigo Albuquerque'
  },
  {
    id: 'act-7',
    code: 'EPS-2026-007',
    title: 'Abordagem Comunitária e Estratégias de Busca Ativa em Saúde da Mulher e Pré-Natal',
    thematicAxis: 'Saúde da Mulher, Materno-Infantil e Pré-Natal',
    description: 'Capacitação territorial dos Agentes Comunitários e Técnicos de Enfermagem para busca ativa de gestantes de alto risco.',
    unitId: 'unit-1',
    unitName: 'UBS Vila Esperança - Dr. Mário Covas',
    instructorName: 'Enf. Camila Nogueira',
    instructorCategory: 'Facilitador Local NEPS (Unidade)',
    instructorAffiliation: 'Núcleo de Educação Permanente UBS Vila Esperança',
    targetCategories: [
      'Agente Comunitário de Saúde (ACS)',
      'Técnico(a) de Enfermagem',
      'Enfermeiro(a)',
      'Assistente Social'
    ],
    modality: 'Presencial',
    methodology: 'Roda de Conversa / Problematização (Arco de Maguerez)',
    workloadHours: 4,
    dateStart: '2026-08-29',
    dateEnd: '2026-08-29',
    timeSchedule: '13:00 às 17:00',
    location: 'Salão Comunitário Vila Esperança',
    maxSeats: 25,
    status: 'planejada',
    checkinPin: '4401',
    enrolledCount: 19,
    attendedCount: 0,
    satisfactionAverage: 0,
    syllabus: [
      'Importância do início precoce do pré-natal até a 12ª semana',
      'Identificação de vulnerabilidades sociais e violência doméstica',
      'Rastreamento de exames laboratoriais básicos e ultrassonografia',
      'Vinculação com a Maternidade de Referência (Rede Cegonha / RAMI)'
    ],
    competenciesToDevelop: [
      'Mapeamento territorial de gestantes e puérperas',
      'Sensibilidade na abordagem de questões de gênero e vulnerabilidade',
      'Articulação da equipe multidisciplinar da UBS'
    ],
    materialsNeeded: ['Cadernetas da Gestante', 'Fichas de busca ativa territorial'],
    createdAt: '2026-08-16',
    createdBy: 'Dra. Camila Nogueira'
  }
];

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // Ação 1 (Arboviroses)
  {
    id: 'att-101',
    actionId: 'act-1',
    actionTitle: 'Manejo Clínico de Arboviroses (Dengue, Chikungunya e Zika) na Atenção Primária',
    actionCode: 'EPS-2026-001',
    thematicAxis: 'Vigilância em Saúde, Arboviroses e Imunização',
    unitId: 'unit-1',
    unitName: 'UBS Vila Esperança - Dr. Mário Covas',
    participantName: 'Dra. Luiza Helena Ramos',
    cpf: '123.456.789-00',
    registrationNumber: 'MED-4821',
    professionalCategory: 'Médico(a) da Família / Clínico',
    participantUnitId: 'unit-1',
    participantUnitName: 'UBS Vila Esperança - Dr. Mário Covas',
    workloadHours: 4,
    date: '2026-08-10',
    checkinTimestamp: '2026-08-10T08:04:12Z',
    status: 'presente',
    feedback: {
      satisfactionRating: 5,
      applicabilityRating: 5,
      instructorRating: 5,
      contentClarityRating: 5,
      comment: 'Treinamento excelente e muito prático para o início do período de chuvas.',
      suggestions: 'Disponibilizar mais cópias plastificadas do fluxograma de hidratação.'
    },
    certificateIssued: true,
    certificateCode: 'CERT-EPS-2026-001-A101'
  },
  {
    id: 'att-102',
    actionId: 'act-1',
    actionTitle: 'Manejo Clínico de Arboviroses (Dengue, Chikungunya e Zika) na Atenção Primária',
    actionCode: 'EPS-2026-001',
    thematicAxis: 'Vigilância em Saúde, Arboviroses e Imunização',
    unitId: 'unit-1',
    unitName: 'UBS Vila Esperança - Dr. Mário Covas',
    participantName: 'Enf. Amanda Corrêa',
    cpf: '234.567.890-11',
    registrationNumber: 'ENF-9912',
    professionalCategory: 'Enfermeiro(a)',
    participantUnitId: 'unit-1',
    participantUnitName: 'UBS Vila Esperança - Dr. Mário Covas',
    workloadHours: 4,
    date: '2026-08-10',
    checkinTimestamp: '2026-08-10T08:02:45Z',
    status: 'presente',
    feedback: {
      satisfactionRating: 5,
      applicabilityRating: 5,
      instructorRating: 5,
      contentClarityRating: 4,
      comment: 'Muito esclarecedor quanto ao papel da triagem na classificação de risco.',
    },
    certificateIssued: true,
    certificateCode: 'CERT-EPS-2026-001-A102'
  },
  {
    id: 'att-103',
    actionId: 'act-1',
    actionTitle: 'Manejo Clínico de Arboviroses (Dengue, Chikungunya e Zika) na Atenção Primária',
    actionCode: 'EPS-2026-001',
    thematicAxis: 'Vigilância em Saúde, Arboviroses e Imunização',
    unitId: 'unit-1',
    unitName: 'UBS Vila Esperança - Dr. Mário Covas',
    participantName: 'Carlos Alberto de Souza',
    cpf: '345.678.901-22',
    registrationNumber: 'ACS-1044',
    professionalCategory: 'Agente Comunitário de Saúde (ACS)',
    participantUnitId: 'unit-1',
    participantUnitName: 'UBS Vila Esperança - Dr. Mário Covas',
    workloadHours: 4,
    date: '2026-08-10',
    checkinTimestamp: '2026-08-10T08:08:19Z',
    status: 'presente',
    feedback: {
      satisfactionRating: 4,
      applicabilityRating: 5,
      instructorRating: 5,
      contentClarityRating: 5,
      comment: 'Agora me sinto seguro para orientar as famílias sobre os sinais de perigo.',
    },
    certificateIssued: true,
    certificateCode: 'CERT-EPS-2026-001-A103'
  },
  {
    id: 'att-104',
    actionId: 'act-1',
    actionTitle: 'Manejo Clínico de Arboviroses (Dengue, Chikungunya e Zika) na Atenção Primária',
    actionCode: 'EPS-2026-001',
    thematicAxis: 'Vigilância em Saúde, Arboviroses e Imunização',
    unitId: 'unit-1',
    unitName: 'UBS Vila Esperança - Dr. Mário Covas',
    participantName: 'Maria José dos Santos',
    cpf: '456.789.012-33',
    registrationNumber: 'TEC-3318',
    professionalCategory: 'Técnico(a) de Enfermagem',
    participantUnitId: 'unit-1',
    participantUnitName: 'UBS Vila Esperança - Dr. Mário Covas',
    workloadHours: 4,
    date: '2026-08-10',
    checkinTimestamp: '2026-08-10T08:05:50Z',
    status: 'presente',
    feedback: {
      satisfactionRating: 5,
      applicabilityRating: 5,
      instructorRating: 4,
      contentClarityRating: 5,
      comment: 'A revisão do cálculo de gotejamento de soro foi fundamental.',
    },
    certificateIssued: true,
    certificateCode: 'CERT-EPS-2026-001-A104'
  },

  // Ação 2 (Humanização e Acolhimento)
  {
    id: 'att-201',
    actionId: 'act-2',
    actionTitle: 'Acolhimento com Classificação de Risco e Comunicação Não-Violenta no SUS',
    actionCode: 'EPS-2026-002',
    thematicAxis: 'Humanização e Acolhimento com Classificação de Risco',
    unitId: 'unit-3',
    unitName: 'UPA 24h Zona Norte - Dr. Geraldo Ferreira',
    participantName: 'Fabiana Antunes',
    cpf: '567.890.123-44',
    registrationNumber: 'REC-7719',
    professionalCategory: 'Recepcionista / Atendimento',
    participantUnitId: 'unit-3',
    participantUnitName: 'UPA 24h Zona Norte - Dr. Geraldo Ferreira',
    workloadHours: 6,
    date: '2026-08-15',
    checkinTimestamp: '2026-08-14T14:02:11Z',
    status: 'presente',
    feedback: {
      satisfactionRating: 5,
      applicabilityRating: 5,
      instructorRating: 5,
      contentClarityRating: 5,
      comment: 'Muito emocionante e necessário. O trabalho na recepção da UPA é desafiador.',
      suggestions: 'Realizar treinamentos semestrais para renovar a energia da equipe.'
    },
    certificateIssued: true,
    certificateCode: 'CERT-EPS-2026-002-A201'
  },
  {
    id: 'att-202',
    actionId: 'act-2',
    actionTitle: 'Acolhimento com Classificação de Risco e Comunicação Não-Violenta no SUS',
    actionCode: 'EPS-2026-002',
    thematicAxis: 'Humanização e Acolhimento com Classificação de Risco',
    unitId: 'unit-3',
    unitName: 'UPA 24h Zona Norte - Dr. Geraldo Ferreira',
    participantName: 'Enf. Renato Bezerra',
    cpf: '678.901.234-55',
    registrationNumber: 'ENF-5582',
    professionalCategory: 'Enfermeiro(a)',
    participantUnitId: 'unit-3',
    participantUnitName: 'UPA 24h Zona Norte - Dr. Geraldo Ferreira',
    workloadHours: 6,
    date: '2026-08-15',
    checkinTimestamp: '2026-08-14T13:58:30Z',
    status: 'presente',
    feedback: {
      satisfactionRating: 5,
      applicabilityRating: 4,
      instructorRating: 5,
      contentClarityRating: 5,
      comment: 'As dinâmicas de problematização ajudaram muito a aproximar a enfermagem da recepção.',
    },
    certificateIssued: true,
    certificateCode: 'CERT-EPS-2026-002-A202'
  },

  // Ação 3 (Simulação PCR)
  {
    id: 'att-301',
    actionId: 'act-3',
    actionTitle: 'Simulação Realística: Parada Cardiorrespiratória (PCR) e Suporte Básico de Vida (BLS)',
    actionCode: 'EPS-2026-003',
    thematicAxis: 'Urgência, Emergência e Suporte à Vida',
    unitId: 'unit-4',
    unitName: 'Hospital Municipal Dr. Arnaldo Peixoto',
    participantName: 'Dr. Leonardo Castilho',
    cpf: '789.012.345-66',
    registrationNumber: 'MED-1109',
    professionalCategory: 'Médico(a) Especialista / Emergencista',
    participantUnitId: 'unit-4',
    participantUnitName: 'Hospital Municipal Dr. Arnaldo Peixoto',
    workloadHours: 8,
    date: '2026-08-18',
    checkinTimestamp: '2026-08-18T07:55:00Z',
    status: 'presente',
    feedback: {
      satisfactionRating: 5,
      applicabilityRating: 5,
      instructorRating: 5,
      contentClarityRating: 5,
      comment: 'Cenários realistas com debriefing de alto nível técnico.',
    },
    certificateIssued: true,
    certificateCode: 'CERT-EPS-2026-003-A301'
  },
  {
    id: 'att-302',
    actionId: 'act-3',
    actionTitle: 'Simulação Realística: Parada Cardiorrespiratória (PCR) e Suporte Básico de Vida (BLS)',
    actionCode: 'EPS-2026-003',
    thematicAxis: 'Urgência, Emergência e Suporte à Vida',
    unitId: 'unit-4',
    unitName: 'Hospital Municipal Dr. Arnaldo Peixoto',
    participantName: 'Téc. Sandra Regina de Paula',
    cpf: '890.123.456-77',
    registrationNumber: 'TEC-8840',
    professionalCategory: 'Técnico(a) de Enfermagem',
    participantUnitId: 'unit-4',
    participantUnitName: 'Hospital Municipal Dr. Arnaldo Peixoto',
    workloadHours: 8,
    date: '2026-08-18',
    checkinTimestamp: '2026-08-18T08:00:15Z',
    status: 'presente',
    feedback: {
      satisfactionRating: 5,
      applicabilityRating: 5,
      instructorRating: 5,
      contentClarityRating: 5,
      comment: 'Incrível ter a chance de treinar com manequins que dão feedback da compressão.',
    },
    certificateIssued: true,
    certificateCode: 'CERT-EPS-2026-003-A302'
  }
];

export const INITIAL_TRAINING_NEEDS: TrainingNeedDNC[] = [
  {
    id: 'dnc-1',
    unitId: 'unit-1',
    unitName: 'UBS Vila Esperança - Dr. Mário Covas',
    suggestedTheme: 'Manejo de Feridas Complexas e Coberturas Especiais no SUS',
    thematicAxis: 'Atenção Primária e Saúde da Família',
    justification: 'Aumento de 40% nos atendimentos de pé diabético e úlceras venosas na unidade necessitando de padronização.',
    targetCategories: ['Enfermeiro(a)', 'Técnico(a) de Enfermagem', 'Médico(a) da Família / Clínico'],
    urgency: 'Alta',
    requestedBy: 'Enf. Camila Nogueira',
    dateReported: '2026-08-18',
    status: 'Aprovado_PAEPS'
  },
  {
    id: 'dnc-2',
    unitId: 'unit-3',
    unitName: 'UPA 24h Zona Norte - Dr. Geraldo Ferreira',
    suggestedTheme: 'Identificação e Manejo da Sepse na Porta de Entrada Hospitalar',
    thematicAxis: 'Urgência, Emergência e Suporte à Vida',
    justification: 'Necessidade de implementação do Protocolo Municipal de Sepse com abertura precoce do pacote de 1 hora.',
    targetCategories: ['Médico(a) Especialista / Emergencista', 'Enfermeiro(a)', 'Técnico(a) de Enfermagem'],
    urgency: 'Crítica',
    requestedBy: 'Dr. Lucas Silveira',
    dateReported: '2026-08-20',
    status: 'Em_Planejamento'
  },
  {
    id: 'dnc-3',
    unitId: 'unit-2',
    unitName: 'UBS Central - Maria da Glória',
    suggestedTheme: 'Abordagem Integral e Tratamento do Tabagismo na APS',
    thematicAxis: 'Doenças Crônicas Não Transmissíveis (DCNT)',
    justification: 'Formação de novos grupos de apoio ao tabagista e capacitação farmacêutica na reposição de nicotina.',
    targetCategories: ['Psicólogo(a)', 'Farmacêutico(a)', 'Médico(a) da Família / Clínico', 'Agente Comunitário de Saúde (ACS)'],
    urgency: 'Média',
    requestedBy: 'Enf. Rodrigo Albuquerque',
    dateReported: '2026-08-21',
    status: 'Pendente'
  }
];

// Helper functions with localStorage persistence
const STORAGE_KEYS = {
  UNITS: 'sermac_eps_units_v1',
  ACTIONS: 'sermac_eps_actions_v1',
  ATTENDANCE: 'sermac_eps_attendance_v1',
  DNC: 'sermac_eps_dnc_v1',
  USER_PROFILE: 'sermac_eps_current_user_v1'
};

export function loadStoredUnits(): HealthUnit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNITS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading units', e);
  }
  return INITIAL_HEALTH_UNITS;
}

export function saveStoredUnits(units: HealthUnit[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
  } catch (e) {
    console.error('Error saving units', e);
  }
}

export function loadStoredActions(): TrainingAction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading actions', e);
  }
  return INITIAL_TRAINING_ACTIONS;
}

export function saveStoredActions(actions: TrainingAction[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
  } catch (e) {
    console.error('Error saving actions', e);
  }
}

export function loadStoredAttendance(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading attendance', e);
  }
  return INITIAL_ATTENDANCE_RECORDS;
}

export function saveStoredAttendance(records: AttendanceRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving attendance', e);
  }
}

export function loadStoredDNC(): TrainingNeedDNC[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DNC);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading DNC', e);
  }
  return INITIAL_TRAINING_NEEDS;
}

export function saveStoredDNC(dnc: TrainingNeedDNC[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.DNC, JSON.stringify(dnc));
  } catch (e) {
    console.error('Error saving DNC', e);
  }
}

export const getStoredHealthUnits = loadStoredUnits;
export const getStoredTrainingActions = loadStoredActions;
export const saveStoredTrainingActions = saveStoredActions;
export const getStoredAttendance = loadStoredAttendance;
export const getStoredDNC = loadStoredDNC;
