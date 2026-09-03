import { 
  HealthUnit, 
  TrainingAction, 
  AttendanceRecord, 
  TrainingNeedDNC,
  UnitStaffCensus,
  ProfessionalCategory,
  InstructorCategory,
  ThematicAxis,
  ActiveMethodology,
  Modality,
  AuthUser
} from '../types';

export const INITIAL_HEALTH_UNITS: HealthUnit[] = [
  {
    id: 'unit-159',
    name: 'US 159 Policlínica Agamenon Magalhães',
    code: 'US-159',
    cnes: '0000531',
    type: 'POLICLINICA',
    district: 'Distrito Sanitário II',
    coordinatorName: 'Enf. Mikael Lima Brasil (Coord. NEPS)',
    coordinatorEmail: 'nsppam@gmail.com',
    totalStaff: 335,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 68,
      'Médico(a) da Família / Clínico': 34,
      'Enfermeiro(a)': 48,
      'Técnico(a) de Enfermagem': 86,
      'Auxiliar de Enfermagem': 12,
      'Cirurgião(ã)-Dentista': 10,
      'Técnico/Auxiliar de Saúde Bucal': 8,
      'Psicólogo(a)': 6,
      'Fisioterapeuta': 8,
      'Assistente Social': 6,
      'Farmacêutico(a)': 5,
      'Nutricionista': 7,
      'Fonoaudiólogo(a) / Terapeuta Ocupacional': 6,
      'Agente Comunitário de Saúde (ACS)': 12,
      'Agente de Combate a Endemias (ACE)': 4,
      'Recepcionista / Atendimento': 10,
      'Agente Administrativo / Faturamento': 5,
      'Higienização e Apoio Operacional': 3
    }
  },
  {
    id: 'unit-163',
    name: 'US 163 Hospital de Pediatria Helena Moura',
    code: 'US-163',
    cnes: '0001015',
    type: 'HOSPITAL',
    district: 'Distrito Sanitário III',
    coordinatorName: 'Enf. Adriana Leite dos Santos (Coord. NEPS)',
    coordinatorEmail: 'nephelenamoura@gmail.com',
    totalStaff: 412,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 84,
      'Médico(a) da Família / Clínico': 12,
      'Enfermeiro(a)': 78,
      'Técnico(a) de Enfermagem': 136,
      'Auxiliar de Enfermagem': 18,
      'Fisioterapeuta': 16,
      'Psicólogo(a)': 6,
      'Assistente Social': 8,
      'Farmacêutico(a)': 8,
      'Nutricionista': 6,
      'Fonoaudiólogo(a) / Terapeuta Ocupacional': 6,
      'Recepcionista / Atendimento': 14,
      'Agente Administrativo / Faturamento': 6,
      'Higienização e Apoio Operacional': 14
    }
  },
  {
    id: 'unit-169',
    name: 'US 169 Policlínica Amaury Coutinho',
    code: 'US-169',
    cnes: '0000604',
    type: 'POLICLINICA',
    district: 'Distrito Sanitário III',
    coordinatorName: 'Enf. Rafaela Maria de Lima Medeiros (Coord. NEPS)',
    coordinatorEmail: 'nepspac26@gmail.com',
    totalStaff: 368,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 72,
      'Médico(a) da Família / Clínico': 36,
      'Enfermeiro(a)': 56,
      'Técnico(a) de Enfermagem': 98,
      'Auxiliar de Enfermagem': 14,
      'Cirurgião(ã)-Dentista': 12,
      'Técnico/Auxiliar de Saúde Bucal': 10,
      'Psicólogo(a)': 6,
      'Fisioterapeuta': 10,
      'Assistente Social': 6,
      'Farmacêutico(a)': 6,
      'Nutricionista': 5,
      'Agente Comunitário de Saúde (ACS)': 14,
      'Agente de Combate a Endemias (ACE)': 4,
      'Recepcionista / Atendimento': 10,
      'Agente Administrativo / Faturamento': 5,
      'Higienização e Apoio Operacional': 4
    }
  },
  {
    id: 'unit-164',
    name: 'US 164 Centro de Reidratação e Urg Ped M Cravo Gama',
    code: 'US-164',
    cnes: '0000930',
    type: 'UPA',
    district: 'Distrito Sanitário II',
    coordinatorName: 'Sem Coordenação',
    coordinatorEmail: 'neps.us164@saude.recife.pe.gov.br',
    totalStaff: 245,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 52,
      'Enfermeiro(a)': 44,
      'Técnico(a) de Enfermagem': 82,
      'Auxiliar de Enfermagem': 10,
      'Fisioterapeuta': 8,
      'Assistente Social': 6,
      'Psicólogo(a)': 4,
      'Farmacêutico(a)': 5,
      'Nutricionista': 4,
      'Recepcionista / Atendimento': 14,
      'Agente Administrativo / Faturamento': 4,
      'Higienização e Apoio Operacional': 12
    }
  },
  {
    id: 'unit-165',
    name: 'US 165 Maternidade Bandeira Filho',
    code: 'US-165',
    cnes: '0000701',
    type: 'MATERNIDADE',
    district: 'Distrito Sanitário V',
    coordinatorName: 'Enf. Andreza Rodrigues Silva (Coord. NEPS)',
    coordinatorEmail: 'neps.pmam@recife.pe.gov.br',
    totalStaff: 430,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 86,
      'Enfermeiro(a)': 82,
      'Técnico(a) de Enfermagem': 148,
      'Auxiliar de Enfermagem': 16,
      'Psicólogo(a)': 8,
      'Assistente Social': 10,
      'Nutricionista': 6,
      'Fisioterapeuta': 12,
      'Fonoaudiólogo(a) / Terapeuta Ocupacional': 6,
      'Farmacêutico(a)': 8,
      'Recepcionista / Atendimento': 16,
      'Agente Administrativo / Faturamento': 8,
      'Higienização e Apoio Operacional': 24
    }
  },
  {
    id: 'unit-153',
    name: 'US 153 Policlínica e Maternidade Arnaldo Marques',
    code: 'US-153',
    cnes: '0000671',
    type: 'MATERNIDADE',
    district: 'Distrito Sanitário VI',
    coordinatorName: 'Enf. Clenio Ribeiro / Delmilena de Aquino (Coord. NEPS)',
    coordinatorEmail: 'clenio.ribeiro@recife.pe.gov.br',
    totalStaff: 485,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 98,
      'Médico(a) da Família / Clínico': 28,
      'Enfermeiro(a)': 90,
      'Técnico(a) de Enfermagem': 164,
      'Auxiliar de Enfermagem': 20,
      'Cirurgião(ã)-Dentista': 8,
      'Técnico/Auxiliar de Saúde Bucal': 6,
      'Psicólogo(a)': 8,
      'Assistente Social': 10,
      'Fisioterapeuta': 12,
      'Nutricionista': 7,
      'Farmacêutico(a)': 8,
      'Recepcionista / Atendimento': 14,
      'Agente Administrativo / Faturamento': 8,
      'Higienização e Apoio Operacional': 4
    }
  },
  {
    id: 'unit-167',
    name: 'US 167 Policlínica e Maternidade Professor Barros Lima',
    code: 'US-167',
    cnes: '0020516',
    type: 'MATERNIDADE',
    district: 'Distrito Sanitário II',
    coordinatorName: 'Enf. Patrícia Bispo / Patrícia Madruga (Coord. NEPS)',
    coordinatorEmail: 'nepsbarroslima@recife.pe.gov.br',
    totalStaff: 510,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 104,
      'Médico(a) da Família / Clínico': 32,
      'Enfermeiro(a)': 96,
      'Técnico(a) de Enfermagem': 174,
      'Auxiliar de Enfermagem': 22,
      'Cirurgião(ã)-Dentista': 8,
      'Técnico/Auxiliar de Saúde Bucal': 6,
      'Psicólogo(a)': 8,
      'Assistente Social': 10,
      'Fisioterapeuta': 12,
      'Nutricionista': 8,
      'Farmacêutico(a)': 8,
      'Recepcionista / Atendimento': 12,
      'Agente Administrativo / Faturamento': 6,
      'Higienização e Apoio Operacional': 4
    }
  },
  {
    id: 'unit-144',
    name: 'US 144 Policlínica Clementino Fraga',
    code: 'US-144',
    cnes: '0000647',
    type: 'POLICLINICA',
    district: 'Distrito Sanitário IV',
    coordinatorName: 'Nutr./Sanit. Gisele Carvalho (Coord. NEPS)',
    coordinatorEmail: 'enfermeiraspcf@gmail.com',
    totalStaff: 295,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 62,
      'Médico(a) da Família / Clínico': 32,
      'Enfermeiro(a)': 48,
      'Técnico(a) de Enfermagem': 82,
      'Auxiliar de Enfermagem': 10,
      'Cirurgião(ã)-Dentista': 8,
      'Técnico/Auxiliar de Saúde Bucal': 6,
      'Fisioterapeuta': 10,
      'Psicólogo(a)': 6,
      'Assistente Social': 6,
      'Farmacêutico(a)': 6,
      'Nutricionista': 5,
      'Recepcionista / Atendimento': 8,
      'Agente Administrativo / Faturamento': 4,
      'Higienização e Apoio Operacional': 2
    }
  },
  {
    id: 'unit-162',
    name: 'US 162 Policlínica Albert Sabin',
    code: 'US-162',
    cnes: '0000612',
    type: 'POLICLINICA',
    district: 'Distrito Sanitário III',
    coordinatorName: 'Farm. Alex Lucena (Coord. NEPS)',
    coordinatorEmail: 'pas.neps@gmail.com',
    totalStaff: 280,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 58,
      'Médico(a) da Família / Clínico': 30,
      'Enfermeiro(a)': 44,
      'Técnico(a) de Enfermagem': 78,
      'Auxiliar de Enfermagem': 10,
      'Cirurgião(ã)-Dentista': 8,
      'Técnico/Auxiliar de Saúde Bucal': 6,
      'Fisioterapeuta': 10,
      'Psicólogo(a)': 6,
      'Assistente Social': 6,
      'Farmacêutico(a)': 6,
      'Nutricionista': 5,
      'Recepcionista / Atendimento': 8,
      'Agente Administrativo / Faturamento': 3,
      'Higienização e Apoio Operacional': 2
    }
  },
  {
    id: 'unit-166',
    name: 'US 166 Policlínica Centro',
    code: 'US-166',
    cnes: '0001139',
    type: 'POLICLINICA',
    district: 'Distrito Sanitário I',
    coordinatorName: 'Enf. Margareth La Puente (Coord. NEPS)',
    coordinatorEmail: 'nepspoliclinicacentro@gmail.com',
    totalStaff: 265,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 54,
      'Médico(a) da Família / Clínico': 28,
      'Enfermeiro(a)': 42,
      'Técnico(a) de Enfermagem': 74,
      'Auxiliar de Enfermagem': 8,
      'Cirurgião(ã)-Dentista': 8,
      'Técnico/Auxiliar de Saúde Bucal': 6,
      'Psicólogo(a)': 8,
      'Assistente Social': 8,
      'Farmacêutico(a)': 6,
      'Nutricionista': 5,
      'Recepcionista / Atendimento': 10,
      'Agente Administrativo / Faturamento': 5,
      'Higienização e Apoio Operacional': 3
    }
  },
  {
    id: 'unit-128',
    name: 'US 128 Policlínica Lessa de Andrade',
    code: 'US-128',
    cnes: '0000590',
    type: 'POLICLINICA',
    district: 'Distrito Sanitário IV',
    coordinatorName: 'Psic. Telma Melo (Coord. NEPS)',
    coordinatorEmail: 'nepspla2024@gmail.com',
    totalStaff: 320,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 66,
      'Médico(a) da Família / Clínico': 32,
      'Enfermeiro(a)': 52,
      'Técnico(a) de Enfermagem': 88,
      'Auxiliar de Enfermagem': 12,
      'Cirurgião(ã)-Dentista': 8,
      'Técnico/Auxiliar de Saúde Bucal': 6,
      'Psicólogo(a)': 8,
      'Assistente Social': 8,
      'Farmacêutico(a)': 8,
      'Fisioterapeuta': 8,
      'Nutricionista': 6,
      'Recepcionista / Atendimento': 10,
      'Agente Administrativo / Faturamento': 5,
      'Higienização e Apoio Operacional': 3
    }
  },
  {
    id: 'unit-160',
    name: 'US 160 Policlínica Gouveia de Barros',
    code: 'US-160',
    cnes: '0000507',
    type: 'POLICLINICA',
    district: 'Distrito Sanitário I',
    coordinatorName: 'Farm. Rhayanne Thais de Moraes Ramos (Coord. NEPS)',
    coordinatorEmail: 'rhayanne.moraes11@gmail.com',
    totalStaff: 255,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 52,
      'Médico(a) da Família / Clínico': 28,
      'Enfermeiro(a)': 40,
      'Técnico(a) de Enfermagem': 72,
      'Auxiliar de Enfermagem': 8,
      'Cirurgião(ã)-Dentista': 6,
      'Técnico/Auxiliar de Saúde Bucal': 6,
      'Fisioterapeuta': 8,
      'Psicólogo(a)': 6,
      'Assistente Social': 6,
      'Farmacêutico(a)': 6,
      'Nutricionista': 4,
      'Recepcionista / Atendimento': 8,
      'Agente Administrativo / Faturamento': 3,
      'Higienização e Apoio Operacional': 2
    }
  },
  {
    id: 'unit-376',
    name: 'US 376 Policlínica Salomão Kelner',
    code: 'US-376',
    cnes: '6897029',
    type: 'POLICLINICA',
    district: 'Distrito Sanitário II',
    coordinatorName: 'Enf. Daniela Maria dos Santos (Coord. NEPS)',
    coordinatorEmail: 'educacaopermanentepsk@gmail.com',
    totalStaff: 345,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 70,
      'Médico(a) da Família / Clínico': 34,
      'Enfermeiro(a)': 54,
      'Técnico(a) de Enfermagem': 96,
      'Auxiliar de Enfermagem': 14,
      'Cirurgião(ã)-Dentista': 8,
      'Técnico/Auxiliar de Saúde Bucal': 6,
      'Psicólogo(a)': 6,
      'Assistente Social': 6,
      'Fisioterapeuta': 10,
      'Farmacêutico(a)': 6,
      'Nutricionista': 6,
      'Recepcionista / Atendimento': 12,
      'Agente Administrativo / Faturamento': 7,
      'Higienização e Apoio Operacional': 4
    }
  },
  {
    id: 'unit-321',
    name: 'US 321 Central de Alergologia',
    code: 'US-321',
    cnes: '0000906',
    type: 'AMBULATORIO',
    district: 'Distrito Sanitário I',
    coordinatorName: 'Enf. Betty Rocha (Coord. NEPS)',
    coordinatorEmail: 'nepscentralalergo@gmail.com',
    totalStaff: 95,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 26,
      'Enfermeiro(a)': 18,
      'Técnico(a) de Enfermagem': 28,
      'Auxiliar de Enfermagem': 4,
      'Psicólogo(a)': 3,
      'Assistente Social': 3,
      'Farmacêutico(a)': 4,
      'Nutricionista': 2,
      'Recepcionista / Atendimento': 4,
      'Agente Administrativo / Faturamento': 2,
      'Higienização e Apoio Operacional': 1
    }
  },
  {
    id: 'unit-293',
    name: 'US 293 Policlínica do Pina',
    code: 'US-293',
    cnes: '3037096',
    type: 'POLICLINICA',
    district: 'Distrito Sanitário VI',
    coordinatorName: 'Sem Coordenação',
    coordinatorEmail: 'neps.us293@saude.recife.pe.gov.br',
    totalStaff: 275,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 56,
      'Médico(a) da Família / Clínico': 30,
      'Enfermeiro(a)': 44,
      'Técnico(a) de Enfermagem': 76,
      'Auxiliar de Enfermagem': 8,
      'Cirurgião(ã)-Dentista': 8,
      'Técnico/Auxiliar de Saúde Bucal': 6,
      'Fisioterapeuta': 8,
      'Psicólogo(a)': 6,
      'Assistente Social': 6,
      'Farmacêutico(a)': 6,
      'Nutricionista': 5,
      'Recepcionista / Atendimento': 10,
      'Agente Administrativo / Faturamento': 4,
      'Higienização e Apoio Operacional': 2
    }
  },
  {
    id: 'unit-101',
    name: 'US 101 Policlínica Prof Waldemar de Oliveira',
    code: 'US-101',
    cnes: '0000620',
    type: 'POLICLINICA',
    district: 'Distrito Sanitário I',
    coordinatorName: 'José Carlos Alves de Souza Jr (Coord. NEPS)',
    coordinatorEmail: 'jose.souza@recife.pe.gov.br',
    totalStaff: 250,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 50,
      'Médico(a) da Família / Clínico': 28,
      'Enfermeiro(a)': 40,
      'Técnico(a) de Enfermagem': 70,
      'Auxiliar de Enfermagem': 8,
      'Cirurgião(ã)-Dentista': 6,
      'Técnico/Auxiliar de Saúde Bucal': 6,
      'Psicólogo(a)': 6,
      'Assistente Social': 6,
      'Farmacêutico(a)': 6,
      'Fisioterapeuta': 6,
      'Nutricionista': 4,
      'Recepcionista / Atendimento': 8,
      'Agente Administrativo / Faturamento': 4,
      'Higienização e Apoio Operacional': 2
    }
  },
  {
    id: 'unit-217',
    name: 'US 217 Centro Médico Sen José Ermírio de Moraes',
    code: 'US-217',
    cnes: '0000558',
    type: 'CENTRO_SAUDE',
    district: 'Distrito Sanitário III',
    coordinatorName: 'Assist. Soc. Paula Moraes (Coord. NEPS)',
    coordinatorEmail: 'nepscmem22@gmail.com',
    totalStaff: 215,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 48,
      'Médico(a) da Família / Clínico': 22,
      'Enfermeiro(a)': 34,
      'Técnico(a) de Enfermagem': 56,
      'Fisioterapeuta': 16,
      'Psicólogo(a)': 8,
      'Assistente Social': 6,
      'Fonoaudiólogo(a) / Terapeuta Ocupacional': 8,
      'Farmacêutico(a)': 4,
      'Nutricionista': 4,
      'Recepcionista / Atendimento': 6,
      'Agente Administrativo / Faturamento': 2,
      'Higienização e Apoio Operacional': 1
    }
  },
  {
    id: 'unit-180',
    name: 'US 180 Central de Regulação Médica SAMU Metropolitano Recife',
    code: 'US-180',
    cnes: '6946283',
    type: 'SAMU',
    district: 'Distrito Central Metropolitano',
    coordinatorName: 'Enf. Janise Cláudia Miranda Laporte (Coord. NEPS)',
    coordinatorEmail: 'nep.samu@gmail.com',
    totalStaff: 680,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Médico(a) Especialista / Emergencista': 160,
      'Enfermeiro(a)': 130,
      'Técnico(a) de Enfermagem': 180,
      'Condutor de Ambulância / Transporte': 140,
      'Recepcionista / Atendimento': 50,
      'Agente Administrativo / Faturamento': 12,
      'Higienização e Apoio Operacional': 8
    }
  },
  {
    id: 'unit-143',
    name: 'US 143 Laboratório Municipal do Recife',
    code: 'US-143',
    cnes: '0000779',
    type: 'LABORATORIO',
    district: 'Distrito Sanitário IV',
    coordinatorName: 'Biól. Camilla Vila Nova (Coord. NEPS)',
    coordinatorEmail: 'coordenacaodeestagiolm@gmail.com',
    totalStaff: 185,
    censusStatus: 'atualizado',
    lastCensusDate: '2026-08-23',
    activeStaffBreakdown: {
      'Farmacêutico(a)': 46,
      'Técnico(a) de Enfermagem': 52,
      'Auxiliar de Enfermagem': 24,
      'Agente Administrativo / Faturamento': 22,
      'Recepcionista / Atendimento': 26,
      'Higienização e Apoio Operacional': 15
    }
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
  'Condutor de Ambulância / Transporte',
  'Outro'
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
  'Webinar com Fórum de Debates',
  'Outros'
];

export const ALL_MODALITIES: Modality[] = [
  'Presencial',
  'Híbrido',
  'EAD / Online'
];

// Clean zero-data initial state for real-world production testing
export const INITIAL_TRAINING_ACTIONS: TrainingAction[] = [];

export const INITIAL_STAFF_CENSUS: UnitStaffCensus[] = INITIAL_HEALTH_UNITS.map(unit => ({
  id: `census-${unit.code.toLowerCase()}-2026-08`,
  unitId: unit.id,
  unitName: unit.name,
  period: 'Agosto/2026',
  totalActiveStaff: unit.totalStaff,
  breakdown: unit.activeStaffBreakdown || {},
  notes: `Censo homologado com base na folha de pagamento oficial e integração ElastiCNES (CNES ${unit.cnes || '0000531'}).`,
  submittedBy: unit.coordinatorName || 'Coordenação NEPS',
  submittedAt: '2026-08-23T08:00:00Z',
  verifiedBySermac: true
}));

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [];

export const INITIAL_TRAINING_NEEDS: TrainingNeedDNC[] = [];

// Helper functions with localStorage persistence
export const STORAGE_KEYS = {
  UNITS: 'sermac_eps_units_recife_v7_clean',
  ACTIONS: 'sermac_eps_actions_recife_v7_clean',
  ATTENDANCE: 'sermac_eps_attendance_recife_v7_clean',
  DNC: 'sermac_eps_dnc_recife_v7_clean',
  CENSUS: 'sermac_eps_census_recife_v7_clean',
  USER_PROFILE: 'sermac_eps_current_user_recife_v7_clean'
};

export function clearAllEpsData() {
  try {
    const oldKeys = [
      'sermac_eps_actions_recife_v4',
      'sermac_eps_attendance_recife_v4',
      'sermac_eps_dnc_recife_v4',
      'sermac_eps_census_recife_v4',
      'sermac_eps_actions_recife_v5_prod',
      'sermac_eps_attendance_recife_v5_prod',
      'sermac_eps_dnc_recife_v5_prod',
      'sermac_eps_census_recife_v5_prod',
      'sermac_eps_units_recife_v5_prod',
      STORAGE_KEYS.ACTIONS,
      STORAGE_KEYS.ATTENDANCE,
      STORAGE_KEYS.DNC
    ];
    oldKeys.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
    localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DNC, JSON.stringify([]));
  } catch (e) {
    console.error('Error clearing EPS data', e);
  }
}

// Auto-purge any leftover legacy v4/v5 mock data on script execution
(() => {
  try {
    const legacyKeys = [
      'sermac_eps_actions_recife_v4',
      'sermac_eps_attendance_recife_v4',
      'sermac_eps_dnc_recife_v4',
      'sermac_eps_actions_recife_v5_prod',
      'sermac_eps_attendance_recife_v5_prod',
      'sermac_eps_dnc_recife_v5_prod'
    ];
    legacyKeys.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  } catch (e) {}
})();

export function loadStoredCensus(): UnitStaffCensus[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CENSUS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= INITIAL_HEALTH_UNITS.length) {
        return parsed.map((c: UnitStaffCensus) => {
          const defaultUnit = INITIAL_HEALTH_UNITS.find(u => u.id === c.unitId);
          if (!defaultUnit) return c;
          return {
            ...c,
            totalActiveStaff: defaultUnit.totalStaff,
            breakdown: defaultUnit.activeStaffBreakdown || c.breakdown
          };
        });
      }
    }
  } catch (e) {
    console.error('Error loading census', e);
  }
  return INITIAL_STAFF_CENSUS;
}

export function saveStoredCensus(censusList: UnitStaffCensus[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CENSUS, JSON.stringify(censusList));
  } catch (e) {
    console.error('Error saving census', e);
  }
}

export function loadStoredUnits(): HealthUnit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNITS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return INITIAL_HEALTH_UNITS.map((defaultUnit: HealthUnit) => {
          const stored = parsed.find(u => u.id === defaultUnit.id || u.code === defaultUnit.code);
          if (!stored) return defaultUnit;
          return {
            ...defaultUnit,
            coordinatorName: stored.coordinatorName || defaultUnit.coordinatorName,
            coordinatorEmail: stored.coordinatorEmail || defaultUnit.coordinatorEmail,
            lastCensusDate: stored.lastCensusDate || defaultUnit.lastCensusDate,
            censusStatus: stored.censusStatus || defaultUnit.censusStatus,
            totalStaff: defaultUnit.totalStaff,
            activeStaffBreakdown: defaultUnit.activeStaffBreakdown
          };
        });
      }
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
      if (Array.isArray(parsed)) return parsed;
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
      if (Array.isArray(parsed)) return parsed;
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
      if (Array.isArray(parsed)) return parsed;
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

export const AUTHORIZED_CENTRAL_SERMAC_EMAILS = [
  'getulio.batista@ufpe.br',
  'getvb98@gmail.com',
  'neps.sermac@gmail.com',
  'neps.ggai@gmail.com',
  'antonio.andrade@recife.pe.gov.br'
] as const;

export const AUTHORIZED_CENTRAL_PASSCODES = [
  'SERMAC@2026',
  'SMSRECIFE2026',
  'NEPS2026',
  'RECIFE2026'
] as const;

export function isCentralSermacEmailAuthorized(email: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (AUTHORIZED_CENTRAL_SERMAC_EMAILS as readonly string[]).includes(normalized);
}

export function isCentralSermacPasscodeValid(passcode: string): boolean {
  if (!passcode) return false;
  const clean = passcode.trim();
  return (AUTHORIZED_CENTRAL_PASSCODES as readonly string[]).includes(clean);
}

export const AUTHORIZED_SERMAC_USERS: AuthUser[] = [
  {
    id: 'usr-sermac-getulio',
    name: 'Prof. Getúlio Batista',
    email: 'getulio.batista@ufpe.br',
    role: 'SERMAC_CENTRAL',
    registrationNumber: 'UFPE/SMS-0014',
    jobTitle: 'Gestor & Pesquisador EPS • UFPE / SERMAC',
    avatarInitials: 'GB'
  },
  {
    id: 'usr-sermac-getulio-gmail',
    name: 'Prof. Getúlio Batista',
    email: 'getvb98@gmail.com',
    role: 'SERMAC_CENTRAL',
    registrationNumber: 'UFPE/SMS-0014',
    jobTitle: 'Gestor & Pesquisador EPS • UFPE / SERMAC',
    avatarInitials: 'GB'
  },
  {
    id: 'usr-sermac-gestao',
    name: 'Coordenação Geral NEPS / SERMAC',
    email: 'neps.sermac@gmail.com',
    role: 'SERMAC_CENTRAL',
    registrationNumber: 'SERMAC-SMS-2026',
    jobTitle: 'Secretaria de Média e Alta Complexidade • SERMAC',
    avatarInitials: 'SM'
  },
  {
    id: 'usr-sermac-antonio',
    name: 'Dr. Antônio Andrade',
    email: 'antonio.andrade@recife.pe.gov.br',
    role: 'SERMAC_CENTRAL',
    registrationNumber: 'SMS-00129',
    jobTitle: 'Coordenação Geral de Educação Permanente • SERMAC Recife',
    avatarInitials: 'AA'
  }
];

export const DEFAULT_SERMAC_USER: AuthUser = AUTHORIZED_SERMAC_USERS[0];

export interface AuthorizedNepsUnitProfile {
  unitId: string;
  unitName: string;
  coordinatorName: string;
  category: string;
  roleTitle: string;
  emails: string[];
  registrationNumber?: string;
  avatarInitials: string;
}

export const AUTHORIZED_NEPS_PROFILES: AuthorizedNepsUnitProfile[] = [
  {
    unitId: 'unit-159',
    unitName: 'US 159 Policlínica Agamenon Magalhães',
    coordinatorName: 'Mikael Lima Brasil',
    category: 'Enfermeiro',
    roleTitle: 'Coordenador NEPS (Enfermeiro)',
    emails: ['nsppam@gmail.com', 'getulio.batista@ufpe.br', 'getvb98@gmail.com', 'neps.us159@saude.recife.pe.gov.br'],
    registrationNumber: 'COREN-PE 512.980',
    avatarInitials: 'MB'
  },
  {
    unitId: 'unit-163',
    unitName: 'US 163 Hospital de Pediatria Helena Moura',
    coordinatorName: 'Adriana Leite dos Santos',
    category: 'Enfermeira',
    roleTitle: 'Coordenadora NEPS (Enfermeira)',
    emails: ['nephelenamoura@gmail.com', 'neps.us163@saude.recife.pe.gov.br'],
    registrationNumber: 'COREN-PE 412.390',
    avatarInitials: 'AS'
  },
  {
    unitId: 'unit-169',
    unitName: 'US 169 Policlínica Amaury Coutinho',
    coordinatorName: 'Rafaela Maria de Lima Medeiros',
    category: 'Enfermeira',
    roleTitle: 'Coordenadora NEPS (Enfermeira)',
    emails: ['nepspac26@gmail.com', 'rafa_mlm@hotmail.com', 'neps.us169@saude.recife.pe.gov.br'],
    registrationNumber: 'COREN-PE 389.120',
    avatarInitials: 'RM'
  },
  {
    unitId: 'unit-164',
    unitName: 'US 164 Centro de Reidratação e Urg Ped M Cravo Gama',
    coordinatorName: 'Coordenação NEPS',
    category: 'Coordenação',
    roleTitle: 'Coordenador(a) NEPS',
    emails: ['neps.us164@saude.recife.pe.gov.br'],
    registrationNumber: 'SMS-16400',
    avatarInitials: 'CG'
  },
  {
    unitId: 'unit-165',
    unitName: 'US 165 Maternidade Bandeira Filho',
    coordinatorName: 'Andreza Rodrigues Silva',
    category: 'Enfermeira',
    roleTitle: 'Coordenadora NEPS (Enfermeira)',
    emails: ['neps.pmam@recife.pe.gov.br', 'neps.us165@saude.recife.pe.gov.br'],
    registrationNumber: 'COREN-PE 478.201',
    avatarInitials: 'AS'
  },
  {
    unitId: 'unit-153',
    unitName: 'US 153 Policlínica e Maternidade Arnaldo Marques',
    coordinatorName: 'Clenio Ribeiro / Delmilena de Aquino',
    category: 'Enfermeiro(a)',
    roleTitle: 'Coordenador(a) NEPS (Enfermagem)',
    emails: ['clenio.ribeiro@recife.pe.gov.br', 'neps.us153@saude.recife.pe.gov.br'],
    registrationNumber: 'COREN-PE 310.450',
    avatarInitials: 'CR'
  },
  {
    unitId: 'unit-167',
    unitName: 'US 167 Policlínica e Maternidade Professor Barros Lima',
    coordinatorName: 'Patrícia Bispo / Patrícia Madruga',
    category: 'Enfermeira',
    roleTitle: 'Coordenadora NEPS (Enfermeira)',
    emails: ['nepsbarroslima@recife.pe.gov.br', 'neps.us167@saude.recife.pe.gov.br'],
    registrationNumber: 'COREN-PE 294.118',
    avatarInitials: 'PB'
  },
  {
    unitId: 'unit-144',
    unitName: 'US 144 Policlínica Clementino Fraga',
    coordinatorName: 'Gisele Carvalho',
    category: 'Nutricionista / Sanitarista',
    roleTitle: 'Coordenadora NEPS (Nutricionista/Sanitarista)',
    emails: ['enfermeiraspcf@gmail.com', 'giselefernanda12@gmail.com', 'neps.us144@saude.recife.pe.gov.br'],
    registrationNumber: 'CRN-6 10928',
    avatarInitials: 'GC'
  },
  {
    unitId: 'unit-162',
    unitName: 'US 162 Policlínica Albert Sabin',
    coordinatorName: 'Alex Lucena',
    category: 'Farmacêutico',
    roleTitle: 'Coordenador NEPS (Farmacêutico)',
    emails: ['pas.neps@gmail.com', 'neps.us162@saude.recife.pe.gov.br'],
    registrationNumber: 'CRF-PE 08492',
    avatarInitials: 'AL'
  },
  {
    unitId: 'unit-166',
    unitName: 'US 166 Policlínica Centro',
    coordinatorName: 'Margareth La Puente',
    category: 'Enfermeira',
    roleTitle: 'Coordenadora NEPS (Enfermeira)',
    emails: ['nepspoliclinicacentro@gmail.com', 'neps.us166@saude.recife.pe.gov.br'],
    registrationNumber: 'COREN-PE 189.442',
    avatarInitials: 'ML'
  },
  {
    unitId: 'unit-128',
    unitName: 'US 128 Policlínica Lessa de Andrade',
    coordinatorName: 'Telma Melo',
    category: 'Psicóloga',
    roleTitle: 'Coordenadora NEPS (Psicóloga)',
    emails: ['nepspla2024@gmail.com', 'neps.us128@saude.recife.pe.gov.br'],
    registrationNumber: 'CRP-02 14209',
    avatarInitials: 'TM'
  },
  {
    unitId: 'unit-160',
    unitName: 'US 160 Policlínica Gouveia de Barros',
    coordinatorName: 'Rhayanne Thais de Moraes Ramos',
    category: 'Farmacêutica',
    roleTitle: 'Coordenadora NEPS (Farmacêutica)',
    emails: ['rhayanne.moraes11@gmail.com', 'neps.us160@saude.recife.pe.gov.br'],
    registrationNumber: 'CRF-PE 11204',
    avatarInitials: 'RM'
  },
  {
    unitId: 'unit-376',
    unitName: 'US 376 Policlínica Salomão Kelner',
    coordinatorName: 'Daniela Maria dos Santos',
    category: 'Enfermeira',
    roleTitle: 'Coordenadora NEPS (Enfermeira)',
    emails: ['educacaopermanentepsk@gmail.com', 'neps.us376@saude.recife.pe.gov.br'],
    registrationNumber: 'COREN-PE 438.109',
    avatarInitials: 'DS'
  },
  {
    unitId: 'unit-321',
    unitName: 'US 321 Central de Alergologia',
    coordinatorName: 'Betty Rocha',
    category: 'Enfermeira',
    roleTitle: 'Coordenadora NEPS (Enfermeira)',
    emails: ['nepscentralalergo@gmail.com', 'neps.us321@saude.recife.pe.gov.br'],
    registrationNumber: 'COREN-PE 281.903',
    avatarInitials: 'BR'
  },
  {
    unitId: 'unit-293',
    unitName: 'US 293 Policlínica do Pina',
    coordinatorName: 'Coordenação NEPS',
    category: 'Coordenação',
    roleTitle: 'Coordenador(a) NEPS',
    emails: ['neps.us293@saude.recife.pe.gov.br'],
    registrationNumber: 'SMS-29300',
    avatarInitials: 'PN'
  },
  {
    unitId: 'unit-101',
    unitName: 'US 101 Policlínica Prof Waldemar de Oliveira',
    coordinatorName: 'José Carlos Alves de Souza Jr',
    category: 'Coordenador NEPS',
    roleTitle: 'Coordenador NEPS',
    emails: ['jose.souza@recife.pe.gov.br', 'neps.us101@saude.recife.pe.gov.br'],
    registrationNumber: 'SMS-10129',
    avatarInitials: 'JS'
  },
  {
    unitId: 'unit-217',
    unitName: 'US 217 Centro Médico Sen José Ermírio de Moraes',
    coordinatorName: 'Paula Moraes',
    category: 'Assistente Social',
    roleTitle: 'Coordenadora NEPS (Assistente Social)',
    emails: ['nepscmem22@gmail.com', 'neps.us217@saude.recife.pe.gov.br'],
    registrationNumber: 'CRESS-PE 08912',
    avatarInitials: 'PM'
  },
  {
    unitId: 'unit-180',
    unitName: 'US 180 Central de Regulação Médica SAMU Metropolitano Recife',
    coordinatorName: 'Janise Cláudia Miranda Laporte',
    category: 'Enfermeira',
    roleTitle: 'Coordenadora NEPS (Enfermeira)',
    emails: ['nep.samu@gmail.com', 'neps.us180@saude.recife.pe.gov.br'],
    registrationNumber: 'COREN-PE 319.482',
    avatarInitials: 'JL'
  },
  {
    unitId: 'unit-143',
    unitName: 'US 143 Laboratório Municipal do Recife',
    coordinatorName: 'Camilla Vila Nova',
    category: 'Bióloga',
    roleTitle: 'Coordenadora NEPS (Bióloga)',
    emails: ['coordenacaodeestagiolm@gmail.com', 'camilla.vilanova@recife.pe.gov.br', 'neps.us143@saude.recife.pe.gov.br'],
    registrationNumber: 'CRBio-05 18920',
    avatarInitials: 'CV'
  }
];

export const DEFAULT_NEPS_USERS: AuthUser[] = [
  {
    id: 'usr-neps-159-getulio',
    name: 'Prof. Getúlio Batista',
    email: 'getulio.batista@ufpe.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'UFPE/SMS-0014',
    unitId: 'unit-159',
    unitName: 'US 159 Policlínica Agamenon Magalhães',
    jobTitle: 'Gestor & Pesquisador EPS • PAM / UFPE',
    avatarInitials: 'GB'
  },
  {
    id: 'usr-neps-159-getulio-gmail',
    name: 'Prof. Getúlio Batista',
    email: 'getvb98@gmail.com',
    role: 'NEPS_UNIT',
    registrationNumber: 'UFPE/SMS-0014',
    unitId: 'unit-159',
    unitName: 'US 159 Policlínica Agamenon Magalhães',
    jobTitle: 'Gestor & Pesquisador EPS • PAM / UFPE',
    avatarInitials: 'GB'
  },
  {
    id: 'usr-neps-159',
    name: 'Enf. Mikael Lima Brasil',
    email: 'nsppam@gmail.com',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-PE 512.980',
    unitId: 'unit-159',
    unitName: 'US 159 Policlínica Agamenon Magalhães',
    jobTitle: 'Coordenador NEPS (Enfermeiro)',
    avatarInitials: 'MB'
  },
  {
    id: 'usr-neps-163',
    name: 'Enf. Adriana Leite dos Santos',
    email: 'nephelenamoura@gmail.com',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-PE 412.390',
    unitId: 'unit-163',
    unitName: 'US 163 Hospital de Pediatria Helena Moura',
    jobTitle: 'Coordenadora NEPS (Enfermeira)',
    avatarInitials: 'AS'
  },
  {
    id: 'usr-neps-169',
    name: 'Enf. Rafaela Maria de Lima Medeiros',
    email: 'nepspac26@gmail.com',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-PE 389.120',
    unitId: 'unit-169',
    unitName: 'US 169 Policlínica Amaury Coutinho',
    jobTitle: 'Coordenadora NEPS (Enfermeira)',
    avatarInitials: 'RM'
  },
  {
    id: 'usr-neps-169-alt',
    name: 'Enf. Rafaela Maria de Lima Medeiros',
    email: 'rafa_mlm@hotmail.com',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-PE 389.120',
    unitId: 'unit-169',
    unitName: 'US 169 Policlínica Amaury Coutinho',
    jobTitle: 'Coordenadora NEPS (Enfermeira)',
    avatarInitials: 'RM'
  },
  {
    id: 'usr-neps-164',
    name: 'Coordenação NEPS - M Cravo Gama',
    email: 'neps.us164@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'SMS-16400',
    unitId: 'unit-164',
    unitName: 'US 164 Centro de Reidratação e Urg Ped M Cravo Gama',
    jobTitle: 'Coordenador(a) NEPS Urgência Pediátrica',
    avatarInitials: 'CG'
  },
  {
    id: 'usr-neps-165',
    name: 'Enf. Andreza Rodrigues Silva',
    email: 'neps.pmam@recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-PE 478.201',
    unitId: 'unit-165',
    unitName: 'US 165 Maternidade Bandeira Filho',
    jobTitle: 'Coordenadora NEPS (Enfermeira)',
    avatarInitials: 'AS'
  },
  {
    id: 'usr-neps-153',
    name: 'Enf. Clenio Ribeiro / Delmilena de Aquino',
    email: 'clenio.ribeiro@recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-PE 310.450',
    unitId: 'unit-153',
    unitName: 'US 153 Policlínica e Maternidade Arnaldo Marques',
    jobTitle: 'Coordenador(a) NEPS (Enfermagem)',
    avatarInitials: 'CR'
  },
  {
    id: 'usr-neps-167',
    name: 'Enf. Patrícia Bispo / Patrícia Madruga',
    email: 'nepsbarroslima@recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-PE 294.118',
    unitId: 'unit-167',
    unitName: 'US 167 Policlínica e Maternidade Professor Barros Lima',
    jobTitle: 'Coordenadora NEPS (Enfermeira)',
    avatarInitials: 'PB'
  },
  {
    id: 'usr-neps-144',
    name: 'Nutr./Sanit. Gisele Carvalho',
    email: 'enfermeiraspcf@gmail.com',
    role: 'NEPS_UNIT',
    registrationNumber: 'CRN-6 10928',
    unitId: 'unit-144',
    unitName: 'US 144 Policlínica Clementino Fraga',
    jobTitle: 'Coordenadora NEPS (Nutricionista/Sanitarista)',
    avatarInitials: 'GC'
  },
  {
    id: 'usr-neps-144-alt',
    name: 'Nutr./Sanit. Gisele Carvalho',
    email: 'giselefernanda12@gmail.com',
    role: 'NEPS_UNIT',
    registrationNumber: 'CRN-6 10928',
    unitId: 'unit-144',
    unitName: 'US 144 Policlínica Clementino Fraga',
    jobTitle: 'Coordenadora NEPS (Nutricionista/Sanitarista)',
    avatarInitials: 'GC'
  },
  {
    id: 'usr-neps-162',
    name: 'Farm. Alex Lucena',
    email: 'pas.neps@gmail.com',
    role: 'NEPS_UNIT',
    registrationNumber: 'CRF-PE 08492',
    unitId: 'unit-162',
    unitName: 'US 162 Policlínica Albert Sabin',
    jobTitle: 'Coordenador NEPS (Farmacêutico)',
    avatarInitials: 'AL'
  },
  {
    id: 'usr-neps-166',
    name: 'Enf. Margareth La Puente',
    email: 'nepspoliclinicacentro@gmail.com',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-PE 189.442',
    unitId: 'unit-166',
    unitName: 'US 166 Policlínica Centro',
    jobTitle: 'Coordenadora NEPS (Enfermeira)',
    avatarInitials: 'ML'
  },
  {
    id: 'usr-neps-128',
    name: 'Psic. Telma Melo',
    email: 'nepspla2024@gmail.com',
    role: 'NEPS_UNIT',
    registrationNumber: 'CRP-02 14209',
    unitId: 'unit-128',
    unitName: 'US 128 Policlínica Lessa de Andrade',
    jobTitle: 'Coordenadora NEPS (Psicóloga)',
    avatarInitials: 'TM'
  },
  {
    id: 'usr-neps-160',
    name: 'Farm. Rhayanne Thais de Moraes Ramos',
    email: 'rhayanne.moraes11@gmail.com',
    role: 'NEPS_UNIT',
    registrationNumber: 'CRF-PE 11204',
    unitId: 'unit-160',
    unitName: 'US 160 Policlínica Gouveia de Barros',
    jobTitle: 'Coordenadora NEPS (Farmacêutica)',
    avatarInitials: 'RM'
  },
  {
    id: 'usr-neps-376',
    name: 'Enf. Daniela Maria dos Santos',
    email: 'educacaopermanentepsk@gmail.com',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-PE 438.109',
    unitId: 'unit-376',
    unitName: 'US 376 Policlínica Salomão Kelner',
    jobTitle: 'Coordenadora NEPS (Enfermeira)',
    avatarInitials: 'DS'
  },
  {
    id: 'usr-neps-321',
    name: 'Enf. Betty Rocha',
    email: 'nepscentralalergo@gmail.com',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-PE 281.903',
    unitId: 'unit-321',
    unitName: 'US 321 Central de Alergologia',
    jobTitle: 'Coordenadora NEPS (Enfermeira)',
    avatarInitials: 'BR'
  },
  {
    id: 'usr-neps-293',
    name: 'Coordenação NEPS - Pina',
    email: 'neps.us293@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'SMS-29300',
    unitId: 'unit-293',
    unitName: 'US 293 Policlínica do Pina',
    jobTitle: 'Coordenador(a) NEPS Policlínica',
    avatarInitials: 'PN'
  },
  {
    id: 'usr-neps-101',
    name: 'José Carlos Alves de Souza Jr',
    email: 'jose.souza@recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'SMS-10129',
    unitId: 'unit-101',
    unitName: 'US 101 Policlínica Prof Waldemar de Oliveira',
    jobTitle: 'Coordenador NEPS',
    avatarInitials: 'JS'
  },
  {
    id: 'usr-neps-217',
    name: 'Assist. Soc. Paula Moraes',
    email: 'nepscmem22@gmail.com',
    role: 'NEPS_UNIT',
    registrationNumber: 'CRESS-PE 08912',
    unitId: 'unit-217',
    unitName: 'US 217 Centro Médico Sen José Ermírio de Moraes',
    jobTitle: 'Coordenadora NEPS (Assistente Social)',
    avatarInitials: 'PM'
  },
  {
    id: 'usr-neps-180',
    name: 'Enf. Janise Cláudia Miranda Laporte',
    email: 'nep.samu@gmail.com',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-PE 319.482',
    unitId: 'unit-180',
    unitName: 'US 180 Central de Regulação Médica SAMU Metropolitano Recife',
    jobTitle: 'Coordenadora NEPS SAMU 192',
    avatarInitials: 'JL'
  },
  {
    id: 'usr-neps-143',
    name: 'Biól. Camilla Vila Nova',
    email: 'coordenacaodeestagiolm@gmail.com',
    role: 'NEPS_UNIT',
    registrationNumber: 'CRBio-05 18920',
    unitId: 'unit-143',
    unitName: 'US 143 Laboratório Municipal do Recife',
    jobTitle: 'Coordenadora NEPS (Bióloga)',
    avatarInitials: 'CV'
  },
  {
    id: 'usr-neps-143-alt',
    name: 'Biól. Camilla Vila Nova',
    email: 'camilla.vilanova@recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'CRBio-05 18920',
    unitId: 'unit-143',
    unitName: 'US 143 Laboratório Municipal do Recife',
    jobTitle: 'Coordenadora NEPS (Bióloga)',
    avatarInitials: 'CV'
  }
];

export function findNepsProfileByUnitId(unitId: string): AuthorizedNepsUnitProfile | undefined {
  return AUTHORIZED_NEPS_PROFILES.find(p => p.unitId === unitId);
}

export function findNepsUserByEmail(email: string, unitId?: string): AuthUser | undefined {
  if (!email) return undefined;
  const cleanEmail = email.trim().toLowerCase();
  
  if (unitId) {
    const matchingUnitUsers = DEFAULT_NEPS_USERS.filter(u => u.unitId === unitId);
    const foundExact = matchingUnitUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (foundExact) return foundExact;
  }
  
  return DEFAULT_NEPS_USERS.find(u => u.email.toLowerCase() === cleanEmail);
}

export function getAuthorizedNepsUnit(email: string): AuthorizedNepsUnitProfile | undefined {
  if (!email) return undefined;
  const clean = email.trim().toLowerCase();
  
  const profile = AUTHORIZED_NEPS_PROFILES.find(p => p.emails.some(e => e.toLowerCase() === clean));
  if (profile) return profile;

  const user = DEFAULT_NEPS_USERS.find(u => u.email.toLowerCase() === clean);
  if (user && user.unitId) {
    return AUTHORIZED_NEPS_PROFILES.find(p => p.unitId === user.unitId);
  }

  return undefined;
}

export function isNepsEmailAuthorized(email: string, unitId?: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  
  // If unitId is provided, check if the email belongs to that specific unit
  if (unitId) {
    const prof = AUTHORIZED_NEPS_PROFILES.find(p => p.unitId === unitId);
    if (prof && prof.emails.some(e => e.toLowerCase() === clean)) return true;
    
    const unitUsers = DEFAULT_NEPS_USERS.filter(u => u.unitId === unitId);
    if (unitUsers.some(u => u.email.toLowerCase() === clean)) return true;
    
    return false;
  }
  
  // General check across all NEPS units
  return AUTHORIZED_NEPS_PROFILES.some(p => p.emails.some(e => e.toLowerCase() === clean)) ||
    DEFAULT_NEPS_USERS.some(u => u.email.toLowerCase() === clean);
}

export const DEFAULT_PARTICIPANT_USER: AuthUser = {
  id: 'usr-part-01',
  name: 'Enf. Juliana Vasconcelos',
  email: 'juliana.vasconcelos@saude.recife.pe.gov.br',
  role: 'PARTICIPANT',
  registrationNumber: 'SUS-884920',
  unitId: 'unit-159',
  unitName: 'US 159 Policlínica Agamenon Magalhães',
  jobTitle: 'Profissional de Saúde (Enfermeira)',
  avatarInitials: 'JV'
};

export function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.role) {
        if (parsed.role === 'SERMAC_CENTRAL') {
          if (isCentralSermacEmailAuthorized(parsed.email)) {
            return parsed;
          }
          return null;
        }
        if (parsed.role === 'NEPS_UNIT') {
          if (isNepsEmailAuthorized(parsed.email, parsed.unitId)) {
            return parsed;
          }
          return null;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading stored user', e);
  }
  // Require explicit login by returning null when nothing valid is stored
  return null;
}

export function saveStoredUser(user: AuthUser | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    }
  } catch (e) {
    console.error('Error saving user profile', e);
  }
}

export const getStoredHealthUnits = loadStoredUnits;
export const getStoredTrainingActions = loadStoredActions;
export const saveStoredTrainingActions = saveStoredActions;
export const getStoredAttendance = loadStoredAttendance;
export const getStoredDNC = loadStoredDNC;
