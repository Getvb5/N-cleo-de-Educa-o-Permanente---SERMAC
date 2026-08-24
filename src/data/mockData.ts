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
    coordinatorName: 'Enf. Carla Albuquerque (Coord. NEPS)',
    coordinatorEmail: 'neps.us159@saude.recife.pe.gov.br',
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
    coordinatorName: 'Dra. Beatriz Menezes (Coord. NEPS)',
    coordinatorEmail: 'neps.us163@saude.recife.pe.gov.br',
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
    coordinatorName: 'Enf. Rodrigo Cavalcanti (Coord. NEPS)',
    coordinatorEmail: 'neps.us169@saude.recife.pe.gov.br',
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
    coordinatorName: 'Dr. Thiago Vasconcelos (Coord. NEPS)',
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
    coordinatorName: 'Dra. Gabriela Fontes (Coord. NEPS)',
    coordinatorEmail: 'neps.us165@saude.recife.pe.gov.br',
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
    coordinatorName: 'Enf. Luciana Valença (Coord. NEPS)',
    coordinatorEmail: 'neps.us153@saude.recife.pe.gov.br',
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
    coordinatorName: 'Profa. Mariana Siqueira (Coord. NEPS)',
    coordinatorEmail: 'neps.us167@saude.recife.pe.gov.br',
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
    coordinatorName: 'Farm. Carlos Eduardo Rocha (Coord. NEPS)',
    coordinatorEmail: 'neps.us144@saude.recife.pe.gov.br',
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
    coordinatorName: 'Enf. Patrícia Lima (Coord. NEPS)',
    coordinatorEmail: 'neps.us162@saude.recife.pe.gov.br',
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
    coordinatorName: 'Dr. Lucas Silveira (Coord. NEPS)',
    coordinatorEmail: 'neps.us166@saude.recife.pe.gov.br',
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
    coordinatorName: 'Enf. Marcela Queiroz (Coord. NEPS)',
    coordinatorEmail: 'neps.us128@saude.recife.pe.gov.br',
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
    coordinatorName: 'Dra. Fernanda Vasconcelos (Coord. NEPS)',
    coordinatorEmail: 'neps.us160@saude.recife.pe.gov.br',
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
    coordinatorName: 'Enf. Andréia Lins (Coord. NEPS)',
    coordinatorEmail: 'neps.us376@saude.recife.pe.gov.br',
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
    coordinatorName: 'Dra. Camila Nogueira (Coord. NEPS)',
    coordinatorEmail: 'neps.us321@saude.recife.pe.gov.br',
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
    coordinatorName: 'Enf. Juliana Ramos (Coord. NEPS)',
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
    coordinatorName: 'Enf. Sérgio Meirelles (Coord. NEPS)',
    coordinatorEmail: 'neps.us101@saude.recife.pe.gov.br',
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
    coordinatorName: 'Dr. Maurício Brandão (Coord. NEPS)',
    coordinatorEmail: 'neps.us217@saude.recife.pe.gov.br',
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
    coordinatorName: 'Enf. Bruno Esteves (Coord. NEPS)',
    coordinatorEmail: 'neps.us180@saude.recife.pe.gov.br',
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
    coordinatorName: 'Bioméd. Vanessa Holanda (Coord. NEPS)',
    coordinatorEmail: 'neps.us143@saude.recife.pe.gov.br',
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
    title: 'Manejo Clínico de Arboviroses (Dengue, Chikungunya e Zika) na Atenção Básica e Policlínicas',
    thematicAxis: 'Vigilância em Saúde, Arboviroses e Imunização',
    description: 'Capacitação prática em hidratação oportuna, estratificação de risco e notificação compulsória no e-SUS para equipes da rede municipal.',
    unitId: 'unit-159',
    unitName: 'US 159 Policlínica Agamenon Magalhães',
    instructorName: 'Dra. Mariana Guedes (Infectologista)',
    instructorCategory: 'Vigilância em Saúde / Coordenação',
    instructorAffiliation: 'COVS / SERMAC Recife',
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
    location: 'Auditório da Policlínica Agamenon Magalhães',
    maxSeats: 35,
    status: 'concluida',
    checkinPin: '8492',
    enrolledCount: 28,
    attendedCount: 26,
    satisfactionAverage: 4.8,
    syllabus: [
      'Sinais de alarme e estadiamento clínico da Dengue',
      'Protocolo de Hidratação venosa e oral rápida no acolhimento',
      'Critérios de transferência para Urgência e acompanhamento domiciliar',
      'Notificação imediata no SINAN/e-SUS'
    ],
    competenciesToDevelop: [
      'Identificação precoce de sinais de choque e gravidade',
      'Integração médico-enfermagem-ACS no território',
      'Registro qualificado de dados epidemiológicos'
    ],
    materialsNeeded: ['Apostila de manejo clínico MS', 'Projetor', 'Fluxogramas plastificados'],
    createdAt: '2026-08-01',
    createdBy: 'Enf. Carla Albuquerque'
  },
  {
    id: 'act-2',
    code: 'EPS-2026-002',
    title: 'Acolhimento com Classificação de Risco e Manejo Pediátrico em Urgências',
    thematicAxis: 'Humanização e Acolhimento com Classificação de Risco',
    description: 'Oficina interativa de escuta qualificada, gestão de conflitos na porta de entrada e humanização da assistência pediátrica.',
    unitId: 'unit-164',
    unitName: 'US 164 Centro de Reidratação e Urg Ped M Cravo Gama',
    instructorName: 'Prof. Sérgio Meirelles (Psicólogo Hospitalar)',
    instructorCategory: 'Equipe Técnica / Tutor SERMAC',
    instructorAffiliation: 'Coordenação de Humanização SERMAC Recife',
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
    location: 'Sala de Treinamento NEPS Maria Cravo Gama',
    maxSeats: 40,
    status: 'concluida',
    checkinPin: '3170',
    enrolledCount: 38,
    attendedCount: 35,
    satisfactionAverage: 4.9,
    syllabus: [
      'Diretrizes da Política Nacional de Humanização (HumanizaSUS)',
      'Protocolo de Manchester Pediátrico e postura frente a casos prioritários',
      'Técnicas de desescalada verbal e acolhimento dos pais/acompanhantes',
      'Autocuidado dos profissionais que atuam na linha de frente de emergência'
    ],
    competenciesToDevelop: [
      'Escuta atenta e empatia no atendimento humanizado',
      'Comunicação clara sobre tempos de espera e prioridades clínicas',
      'Trabalho articulado entre recepção e equipe de triagem'
    ],
    materialsNeeded: ['Vídeos reflexivos', 'Cartilha de acolhimento', 'Crachás de identificação'],
    createdAt: '2026-08-02',
    createdBy: 'Dr. Thiago Vasconcelos'
  },
  {
    id: 'act-3',
    code: 'EPS-2026-003',
    title: 'Simulação Realística: Ressuscitação Pediátrica Avançada e Suporte Básico de Vida (PALS/BLS)',
    thematicAxis: 'Urgência, Emergência e Suporte à Vida',
    description: 'Treinamento de alta fidelidade com manequins em ressuscitação cardiopulmonar pediátrica de alta qualidade.',
    unitId: 'unit-163',
    unitName: 'US 163 Hospital de Pediatria Helena Moura',
    instructorName: 'Enf. Bruno Esteves e Dra. Beatriz Menezes',
    instructorCategory: 'Facilitador Local NEPS (Unidade)',
    instructorAffiliation: 'Núcleo de Educação em Urgências (NEU/SAMU e H. Helena Moura)',
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
    location: 'Laboratório de Habilidades e Simulação Realística - H. Helena Moura',
    maxSeats: 25,
    status: 'concluida',
    checkinPin: '9021',
    enrolledCount: 25,
    attendedCount: 24,
    satisfactionAverage: 5.0,
    syllabus: [
      'Cadeia de Sobrevivência Pediátrica e reconhecimento rápido da PCR',
      'Compressões torácicas e ventilação com bolsa-valva-máscara em crianças',
      'Operação segura do DEA e desfibrilador manual com pás pediátricas',
      'Dinâmica de equipe de alto desempenho e debriefing estruturado'
    ],
    competenciesToDevelop: [
      'Execução técnica precisa das manobras de RCP pediátrica',
      'Liderança compartilhada e comunicação em circuito fechado',
      'Tomada de decisão sob pressão em ambiente hospitalar pediátrico'
    ],
    materialsNeeded: ['Manequins de RCP pediátricos', 'DEA de treinamento', 'Bolsa-valva-máscara'],
    createdAt: '2026-08-05',
    createdBy: 'Dra. Beatriz Menezes'
  },
  {
    id: 'act-4',
    code: 'EPS-2026-004',
    title: 'Boas Práticas na Assistência ao Parto Humanizado e Manejo de Hemorragia Pós-Parto (HPP)',
    thematicAxis: 'Saúde da Mulher, Materno-Infantil e Pré-Natal',
    description: 'Protocolo de "Zero Morte Materna por Hemorragia" e técnicas de condução humanizada do trabalho de parto.',
    unitId: 'unit-165',
    unitName: 'US 165 Maternidade Bandeira Filho',
    instructorName: 'Dra. Gabriela Fontes e Enf. Luciana Valença',
    instructorCategory: 'Enfermeiro(a) RT / Especialista',
    instructorAffiliation: 'Comissão de Saúde da Mulher SERMAC',
    targetCategories: [
      'Enfermeiro(a)',
      'Técnico(a) de Enfermagem',
      'Médico(a) Especialista / Emergencista',
      'Auxiliar de Enfermagem'
    ],
    modality: 'Presencial',
    methodology: 'Oficina Prática / Hands-on',
    workloadHours: 6,
    dateStart: '2026-08-20',
    dateEnd: '2026-08-20',
    timeSchedule: '08:30 às 15:30',
    location: 'Auditório da Maternidade Bandeira Filho',
    maxSeats: 30,
    status: 'concluida',
    checkinPin: '6543',
    enrolledCount: 29,
    attendedCount: 27,
    satisfactionAverage: 4.9,
    syllabus: [
      'Diretrizes da Rede Alyne / Rede Cegonha no SUS Recife',
      'Identificação precoce do choque hemorrágico pós-parto e índice de choque',
      'Uso de balão de tamponamento intrauterino e traje antichoque não pneumático (TAN)',
      'Métodos não farmacológicos de alívio da dor no parto'
    ],
    competenciesToDevelop: [
      'Agilidade no protocolo de 1ª e 2ª linha para hemorragia puerperal',
      'Postura acolhedora e respeito à autonomia da parturiente',
      'Trabalho articulado da equipe obstétrica multiprofissional'
    ],
    materialsNeeded: ['Traje antichoque (TAN)', 'Balões de tamponamento', 'Manequins de pelve'],
    createdAt: '2026-08-08',
    createdBy: 'Dra. Gabriela Fontes'
  },
  {
    id: 'act-5',
    code: 'EPS-2026-005',
    title: 'Protocolos de Triagem e Regulação Médica das Urgências Pré-Hospitalares',
    thematicAxis: 'Urgência, Emergência e Suporte à Vida',
    description: 'Atualização das diretrizes operacionais de despacho de viaturas, telemedicina e regulação integrada SAMU-Policlínicas.',
    unitId: 'unit-180',
    unitName: 'US 180 Central de Regulação Médica SAMU Metropolitano Recife',
    instructorName: 'Enf. Bruno Esteves e Dr. Maurício Brandão',
    instructorCategory: 'Facilitador Local NEPS (Unidade)',
    instructorAffiliation: 'Núcleo de Educação em Urgências - SAMU 192 Recife',
    targetCategories: [
      'Médico(a) Especialista / Emergencista',
      'Enfermeiro(a)',
      'Condutor de Ambulância / Transporte',
      'Recepcionista / Atendimento'
    ],
    modality: 'Híbrido',
    methodology: 'Estudo de Casos Clínicos Interprofissionais',
    workloadHours: 6,
    dateStart: '2026-08-24',
    dateEnd: '2026-08-25',
    timeSchedule: '09:00 às 12:00',
    location: 'Auditório Central SAMU 192 / Transmissão Online',
    maxSeats: 50,
    status: 'em_andamento',
    checkinPin: '7721',
    enrolledCount: 46,
    attendedCount: 42,
    satisfactionAverage: 4.9,
    syllabus: [
      'Critérios de estratificação telefônica de risco (TARM)',
      'Integração dos fluxos de vaga zero com UPAs e Hospitais Municipais',
      'Telemedicina e apoio médico remoto às equipes de suporte básico (USB)',
      'Gerenciamento de recursos em incidentes com múltiplas vítimas (IMV)'
    ],
    competenciesToDevelop: [
      'Agilidade e clareza na escuta e despacho regulatório',
      'Integração em tempo real com a rede assistencial do Recife',
      'Segurança jurídica e clínica nos registros de regulação'
    ],
    materialsNeeded: ['Simulador de chamadas', 'Plataforma Google Meet', 'Protocolos do SAMU'],
    createdAt: '2026-08-10',
    createdBy: 'Enf. Bruno Esteves'
  },
  {
    id: 'act-6',
    code: 'EPS-2026-006',
    title: 'Qualificação do Registro e Boas Práticas no Prontuário Eletrônico e-SUS',
    thematicAxis: 'Ética, Legislação e Prontuário Eletrônico (e-SUS)',
    description: 'Padronização de evolução clínica, método SOAP, CIAP-2 e faturamento de consultas nas Policlínicas e Centros de Saúde.',
    unitId: 'unit-169',
    unitName: 'US 169 Policlínica Amaury Coutinho',
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
    location: 'Laboratório de Informática - Policlínica Amaury Coutinho',
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
      'Melhoria dos indicadores municipais e faturamento SUS',
      'Garantia do sigilo e segurança dos dados do paciente'
    ],
    materialsNeeded: ['Computadores com ambiente de testes do e-SUS', 'Manual de apoio'],
    createdAt: '2026-08-15',
    createdBy: 'Enf. Rodrigo Cavalcanti'
  },
  {
    id: 'act-7',
    code: 'EPS-2026-007',
    title: 'Biossegurança, Controle de Qualidade e Boas Práticas em Coleta Laboratorial',
    thematicAxis: 'Segurança do Paciente e Controle de Infecções (CCIH)',
    description: 'Capacitação prática em fase pré-analítica, critérios de rejeição de amostras e biossegurança nos postos de coleta.',
    unitId: 'unit-143',
    unitName: 'US 143 Laboratório Municipal do Recife',
    instructorName: 'Bioméd. Vanessa Holanda',
    instructorCategory: 'Facilitador Local NEPS (Unidade)',
    instructorAffiliation: 'Núcleo de Educação Permanente do Laboratório Municipal',
    targetCategories: [
      'Técnico(a) de Enfermagem',
      'Auxiliar de Enfermagem',
      'Recepcionista / Atendimento',
      'Higienização e Apoio Operacional'
    ],
    modality: 'Presencial',
    methodology: 'Oficina Prática / Hands-on',
    workloadHours: 4,
    dateStart: '2026-08-29',
    dateEnd: '2026-08-29',
    timeSchedule: '13:00 às 17:00',
    location: 'Auditório Técnico do Laboratório Municipal do Recife',
    maxSeats: 25,
    status: 'planejada',
    checkinPin: '4401',
    enrolledCount: 19,
    attendedCount: 0,
    satisfactionAverage: 0,
    syllabus: [
      'Fase pré-analítica: identificação correta do paciente e tubos de coleta',
      'Ordem correta dos tubos e prevenção de hemólise',
      'Descarte seguro de perfurocortantes segundo NR-32',
      'Rastreabilidade de exames no sistema municipal de regulação laboratorial'
    ],
    competenciesToDevelop: [
      'Redução drástica de necessidade de recoleta de exames',
      'Cumprimento rigoroso das normas de biossegurança',
      'Acolhimento empático ao paciente na sala de coleta'
    ],
    materialsNeeded: ['Kits de punção venosa didáticos', 'Tubos a vácuo para treino', 'Cartilhas de biossegurança'],
    createdAt: '2026-08-16',
    createdBy: 'Bioméd. Vanessa Holanda',
    plannedAttendeesCount: 25,
    eligibleProfessionalsCount: 30,
    isEsrLinked: true,
    esrLinkType: 'Certificação Oficial ESR'
  },
  {
    id: 'act-8',
    code: 'EPS-2026-008',
    title: 'Manejo Inicial de Intoxicações Exógenas e Acidentes por Animais Peçonhentos',
    thematicAxis: 'Urgência, Emergência e Suporte à Vida',
    description: 'Oficina de identificação e conduta rápida em acidentes escorpiônicos e ofídicos na atenção básica.',
    unitId: 'unit-159',
    unitName: 'US 159 Policlínica Agamenon Magalhães',
    instructorName: 'Dr. Fernando Arcoverde (Toxicologista)',
    instructorCategory: 'Médico(a) Preceptor / Especialista',
    instructorAffiliation: 'Ceatox / SES-PE',
    targetCategories: [
      'Médico(a) da Família / Clínico',
      'Enfermeiro(a)',
      'Técnico(a) de Enfermagem'
    ],
    modality: 'Presencial',
    methodology: 'Estudo de Casos Clínicos Interprofissionais',
    workloadHours: 4,
    dateStart: '2026-08-20',
    dateEnd: '2026-08-20',
    timeSchedule: '14:00 às 18:00',
    location: 'Auditório da Policlínica Agamenon Magalhães',
    maxSeats: 30,
    status: 'cancelada',
    cancellationReason: 'Alteração emergencial na escala de plantão devido a surto sazonal de síndromes respiratórias',
    cancellationCategory: 'Escala de Plantão/Remanejamento',
    cancelledAt: '2026-08-19T14:30:00Z',
    checkinPin: '9912',
    enrolledCount: 15,
    attendedCount: 0,
    satisfactionAverage: 0,
    plannedAttendeesCount: 30,
    eligibleProfessionalsCount: 35,
    isEsrLinked: false,
    createdAt: '2026-08-05',
    createdBy: 'Enf. Carla Albuquerque'
  }
];

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

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // Ação 1 (Arboviroses - US 159 Policlínica Agamenon Magalhães)
  {
    id: 'att-101',
    actionId: 'act-1',
    actionTitle: 'Manejo Clínico de Arboviroses (Dengue, Chikungunya e Zika) na Atenção Básica e Policlínicas',
    actionCode: 'EPS-2026-001',
    thematicAxis: 'Vigilância em Saúde, Arboviroses e Imunização',
    unitId: 'unit-159',
    unitName: 'US 159 Policlínica Agamenon Magalhães',
    participantName: 'Dra. Luiza Helena Ramos',
    cpf: '123.456.789-00',
    registrationNumber: 'MED-4821',
    professionalCategory: 'Médico(a) da Família / Clínico',
    participantUnitId: 'unit-159',
    participantUnitName: 'US 159 Policlínica Agamenon Magalhães',
    workloadHours: 4,
    date: '2026-08-10',
    checkinTimestamp: '2026-08-10T08:04:12Z',
    status: 'presente',
    feedback: {
      satisfactionRating: 5,
      applicabilityRating: 5,
      instructorRating: 5,
      contentClarityRating: 5,
      comment: 'Treinamento excelente e muito prático para a rotina da policlínica.',
      suggestions: 'Disponibilizar mais cópias plastificadas do fluxograma de hidratação.'
    },
    certificateIssued: true,
    certificateCode: 'CERT-EPS-2026-001-A101'
  },
  {
    id: 'att-102',
    actionId: 'act-1',
    actionTitle: 'Manejo Clínico de Arboviroses (Dengue, Chikungunya e Zika) na Atenção Básica e Policlínicas',
    actionCode: 'EPS-2026-001',
    thematicAxis: 'Vigilância em Saúde, Arboviroses e Imunização',
    unitId: 'unit-159',
    unitName: 'US 159 Policlínica Agamenon Magalhães',
    participantName: 'Enf. Amanda Corrêa',
    cpf: '234.567.890-11',
    registrationNumber: 'ENF-9912',
    professionalCategory: 'Enfermeiro(a)',
    participantUnitId: 'unit-159',
    participantUnitName: 'US 159 Policlínica Agamenon Magalhães',
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
    actionTitle: 'Manejo Clínico de Arboviroses (Dengue, Chikungunya e Zika) na Atenção Básica e Policlínicas',
    actionCode: 'EPS-2026-001',
    thematicAxis: 'Vigilância em Saúde, Arboviroses e Imunização',
    unitId: 'unit-159',
    unitName: 'US 159 Policlínica Agamenon Magalhães',
    participantName: 'Carlos Alberto de Souza',
    cpf: '345.678.901-22',
    registrationNumber: 'ACS-1044',
    professionalCategory: 'Agente Comunitário de Saúde (ACS)',
    participantUnitId: 'unit-159',
    participantUnitName: 'US 159 Policlínica Agamenon Magalhães',
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
    actionTitle: 'Manejo Clínico de Arboviroses (Dengue, Chikungunya e Zika) na Atenção Básica e Policlínicas',
    actionCode: 'EPS-2026-001',
    thematicAxis: 'Vigilância em Saúde, Arboviroses e Imunização',
    unitId: 'unit-159',
    unitName: 'US 159 Policlínica Agamenon Magalhães',
    participantName: 'Maria José dos Santos',
    cpf: '456.789.012-33',
    registrationNumber: 'TEC-3318',
    professionalCategory: 'Técnico(a) de Enfermagem',
    participantUnitId: 'unit-159',
    participantUnitName: 'US 159 Policlínica Agamenon Magalhães',
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

  // Ação 2 (Humanização - US 164 Cravo Gama)
  {
    id: 'att-201',
    actionId: 'act-2',
    actionTitle: 'Acolhimento com Classificação de Risco e Manejo Pediátrico em Urgências',
    actionCode: 'EPS-2026-002',
    thematicAxis: 'Humanização e Acolhimento com Classificação de Risco',
    unitId: 'unit-164',
    unitName: 'US 164 Centro de Reidratação e Urg Ped M Cravo Gama',
    participantName: 'Fabiana Antunes',
    cpf: '567.890.123-44',
    registrationNumber: 'REC-7719',
    professionalCategory: 'Recepcionista / Atendimento',
    participantUnitId: 'unit-164',
    participantUnitName: 'US 164 Centro de Reidratação e Urg Ped M Cravo Gama',
    workloadHours: 6,
    date: '2026-08-15',
    checkinTimestamp: '2026-08-14T14:02:11Z',
    status: 'presente',
    feedback: {
      satisfactionRating: 5,
      applicabilityRating: 5,
      instructorRating: 5,
      contentClarityRating: 5,
      comment: 'Muito emocionante e necessário. O acolhimento pediátrico exige sensibilidade.',
      suggestions: 'Realizar treinamentos semestrais para renovar a energia da equipe.'
    },
    certificateIssued: true,
    certificateCode: 'CERT-EPS-2026-002-A201'
  },
  {
    id: 'att-202',
    actionId: 'act-2',
    actionTitle: 'Acolhimento com Classificação de Risco e Manejo Pediátrico em Urgências',
    actionCode: 'EPS-2026-002',
    thematicAxis: 'Humanização e Acolhimento com Classificação de Risco',
    unitId: 'unit-164',
    unitName: 'US 164 Centro de Reidratação e Urg Ped M Cravo Gama',
    participantName: 'Enf. Renato Bezerra',
    cpf: '678.901.234-55',
    registrationNumber: 'ENF-5582',
    professionalCategory: 'Enfermeiro(a)',
    participantUnitId: 'unit-164',
    participantUnitName: 'US 164 Centro de Reidratação e Urg Ped M Cravo Gama',
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

  // Ação 3 (Simulação PCR - US 163 H. Helena Moura)
  {
    id: 'att-301',
    actionId: 'act-3',
    actionTitle: 'Simulação Realística: Ressuscitação Pediátrica Avançada e Suporte Básico de Vida (PALS/BLS)',
    actionCode: 'EPS-2026-003',
    thematicAxis: 'Urgência, Emergência e Suporte à Vida',
    unitId: 'unit-163',
    unitName: 'US 163 Hospital de Pediatria Helena Moura',
    participantName: 'Dr. Leonardo Castilho',
    cpf: '789.012.345-66',
    registrationNumber: 'MED-1109',
    professionalCategory: 'Médico(a) Especialista / Emergencista',
    participantUnitId: 'unit-163',
    participantUnitName: 'US 163 Hospital de Pediatria Helena Moura',
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
    actionTitle: 'Simulação Realística: Ressuscitação Pediátrica Avançada e Suporte Básico de Vida (PALS/BLS)',
    actionCode: 'EPS-2026-003',
    thematicAxis: 'Urgência, Emergência e Suporte à Vida',
    unitId: 'unit-163',
    unitName: 'US 163 Hospital de Pediatria Helena Moura',
    participantName: 'Téc. Sandra Regina de Paula',
    cpf: '890.123.456-77',
    registrationNumber: 'TEC-8840',
    professionalCategory: 'Técnico(a) de Enfermagem',
    participantUnitId: 'unit-163',
    participantUnitName: 'US 163 Hospital de Pediatria Helena Moura',
    workloadHours: 8,
    date: '2026-08-18',
    checkinTimestamp: '2026-08-18T08:00:15Z',
    status: 'presente',
    feedback: {
      satisfactionRating: 5,
      applicabilityRating: 5,
      instructorRating: 5,
      contentClarityRating: 5,
      comment: 'Incrível ter a chance de treinar com manequins com retorno visual imediato.',
    },
    certificateIssued: true,
    certificateCode: 'CERT-EPS-2026-003-A302'
  },
  // Certificados da Enf. Juliana Vasconcelos (Participante Padrão)
  {
    id: 'att-jv-01',
    actionId: 'act-1',
    actionTitle: 'Manejo Clínico de Arboviroses (Dengue, Chikungunya e Zika) na Atenção Básica e Policlínicas',
    actionCode: 'EPS-2026-001',
    thematicAxis: 'Vigilância em Saúde, Arboviroses e Imunização',
    unitId: 'unit-159',
    unitName: 'US 159 Policlínica Agamenon Magalhães',
    participantName: 'Enf. Juliana Vasconcelos',
    cpf: '884.920.111-99',
    registrationNumber: 'SUS-884920',
    professionalCategory: 'Enfermeiro(a)',
    participantUnitId: 'unit-159',
    participantUnitName: 'US 159 Policlínica Agamenon Magalhães',
    workloadHours: 4,
    date: '2026-08-10',
    checkinTimestamp: '2026-08-10T08:01:00Z',
    status: 'presente',
    feedback: {
      satisfactionRating: 5,
      applicabilityRating: 5,
      instructorRating: 5,
      contentClarityRating: 5,
      comment: 'Capacitação muito relevante para a prática assistencial na policlínica.',
    },
    certificateIssued: true,
    certificateCode: 'CERT-EPS-2026-001-JV01'
  },
  {
    id: 'att-jv-02',
    actionId: 'act-3',
    actionTitle: 'Simulação Realística: Ressuscitação Pediátrica Avançada e Suporte Básico de Vida (PALS/BLS)',
    actionCode: 'EPS-2026-003',
    thematicAxis: 'Urgência, Emergência e Suporte à Vida',
    unitId: 'unit-163',
    unitName: 'US 163 Hospital de Pediatria Helena Moura',
    participantName: 'Enf. Juliana Vasconcelos',
    cpf: '884.920.111-99',
    registrationNumber: 'SUS-884920',
    professionalCategory: 'Enfermeiro(a)',
    participantUnitId: 'unit-159',
    participantUnitName: 'US 159 Policlínica Agamenon Magalhães',
    workloadHours: 8,
    date: '2026-08-18',
    checkinTimestamp: '2026-08-18T07:58:30Z',
    status: 'presente',
    feedback: {
      satisfactionRating: 5,
      applicabilityRating: 5,
      instructorRating: 5,
      contentClarityRating: 5,
      comment: 'Excelente dinâmica com manequins e cenário prático.',
    },
    certificateIssued: true,
    certificateCode: 'CERT-EPS-2026-003-JV02'
  }
];

export const INITIAL_TRAINING_NEEDS: TrainingNeedDNC[] = [
  {
    id: 'dnc-1',
    unitId: 'unit-159',
    unitName: 'US 159 Policlínica Agamenon Magalhães',
    suggestedTheme: 'Manejo de Feridas Complexas e Curativos Especiais na Rede Especializada',
    thematicAxis: 'Atenção Primária e Saúde da Família',
    justification: 'Aumento de 40% nos atendimentos de pé diabético e úlceras vasculares na policlínica necessitando de protocolo integrado.',
    targetCategories: ['Enfermeiro(a)', 'Técnico(a) de Enfermagem', 'Médico(a) da Família / Clínico'],
    urgency: 'Alta',
    requestedBy: 'Enf. Carla Albuquerque',
    dateReported: '2026-08-18',
    status: 'Aprovado_LNT'
  },
  {
    id: 'dnc-2',
    unitId: 'unit-165',
    unitName: 'US 165 Maternidade Bandeira Filho',
    suggestedTheme: 'Manejo da Sepse Materna e Neonatal Precoce',
    thematicAxis: 'Urgência, Emergência e Suporte à Vida',
    justification: 'Necessidade de implementação do Protocolo Municipal de Sepse Materna com abertura rápida do pacote de 1 hora.',
    targetCategories: ['Médico(a) Especialista / Emergencista', 'Enfermeiro(a)', 'Técnico(a) de Enfermagem'],
    urgency: 'Crítica',
    requestedBy: 'Dra. Gabriela Fontes',
    dateReported: '2026-08-20',
    status: 'Em_Planejamento'
  },
  {
    id: 'dnc-3',
    unitId: 'unit-180',
    unitName: 'US 180 Central de Regulação Médica SAMU Metropolitano Recife',
    suggestedTheme: 'Manejo Integrado de Crises Psiquiátricas e Agitação Psicomotora no APH',
    thematicAxis: 'Saúde Mental, Drogas e Matriciamento',
    justification: 'Capacitação intersetorial entre SAMU e CAPS para abordagem não-violenta e contenção química segura quando indicada.',
    targetCategories: ['Médico(a) Especialista / Emergencista', 'Enfermeiro(a)', 'Condutor de Ambulância / Transporte'],
    urgency: 'Alta',
    requestedBy: 'Enf. Bruno Esteves',
    dateReported: '2026-08-21',
    status: 'Aprovado_LNT'
  },
  {
    id: 'dnc-4',
    unitId: 'unit-143',
    unitName: 'US 143 Laboratório Municipal do Recife',
    suggestedTheme: 'Diagnóstico Molecular de Arboviroses e Vigilância Genômica',
    thematicAxis: 'Vigilância em Saúde, Arboviroses e Imunização',
    justification: 'Ampliação da capacidade diagnóstica de RT-PCR para detecção precoce de sorotipos de Dengue e Chikungunya.',
    targetCategories: ['Farmacêutico(a)', 'Técnico(a) de Enfermagem', 'Agente de Combate a Endemias (ACE)'],
    urgency: 'Média',
    requestedBy: 'Bioméd. Vanessa Holanda',
    dateReported: '2026-08-22',
    status: 'Pendente'
  }
];

// Helper functions with localStorage persistence
const STORAGE_KEYS = {
  UNITS: 'sermac_eps_units_recife_v4',
  ACTIONS: 'sermac_eps_actions_recife_v4',
  ATTENDANCE: 'sermac_eps_attendance_recife_v4',
  DNC: 'sermac_eps_dnc_recife_v4',
  CENSUS: 'sermac_eps_census_recife_v4',
  USER_PROFILE: 'sermac_eps_current_user_recife_v4'
};

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
        // Guarantee official CNES code and ElasticCNES official baseline consistency across all units
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

export const DEFAULT_NEPS_USERS: AuthUser[] = [
  {
    id: 'usr-neps-159',
    name: 'Enf. Carla Albuquerque',
    email: 'neps.us159@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-129482',
    unitId: 'unit-159',
    unitName: 'US 159 Policlínica Agamenon Magalhães',
    jobTitle: 'Coordenadora NEPS (Enfermeira)',
    avatarInitials: 'CA'
  },
  {
    id: 'usr-neps-163',
    name: 'Dra. Beatriz Menezes',
    email: 'neps.us163@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'CRM-48192',
    unitId: 'unit-163',
    unitName: 'US 163 Hospital de Pediatria Helena Moura',
    jobTitle: 'Coord. NEPS Hospital Pediátrico',
    avatarInitials: 'BM'
  },
  {
    id: 'usr-neps-169',
    name: 'Enf. Rodrigo Cavalcanti',
    email: 'neps.us169@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-088241',
    unitId: 'unit-169',
    unitName: 'US 169 Policlínica Amaury Coutinho',
    jobTitle: 'Coordenador NEPS Policlínica',
    avatarInitials: 'RC'
  },
  {
    id: 'usr-neps-164',
    name: 'Dr. Thiago Vasconcelos',
    email: 'neps.us164@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'CRM-104928',
    unitId: 'unit-164',
    unitName: 'US 164 Centro de Reidratação e Urg Ped M Cravo Gama',
    jobTitle: 'Coordenador NEPS Urgência Pediátrica',
    avatarInitials: 'TV'
  },
  {
    id: 'usr-neps-165',
    name: 'Dra. Gabriela Fontes',
    email: 'neps.us165@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'CRM-33918',
    unitId: 'unit-165',
    unitName: 'US 165 Maternidade Bandeira Filho',
    jobTitle: 'Coordenadora NEPS Maternidade',
    avatarInitials: 'GF'
  },
  {
    id: 'usr-neps-153',
    name: 'Enf. Luciana Valença',
    email: 'neps.us153@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-66291',
    unitId: 'unit-153',
    unitName: 'US 153 Policlínica e Maternidade Arnaldo Marques',
    jobTitle: 'Coordenadora NEPS Maternidade/Poli',
    avatarInitials: 'LV'
  },
  {
    id: 'usr-neps-167',
    name: 'Profa. Mariana Siqueira',
    email: 'neps.us167@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'SMS-04829',
    unitId: 'unit-167',
    unitName: 'US 167 Policlínica e Maternidade Professor Barros Lima',
    jobTitle: 'Coord. NEPS Maternidade/Poli',
    avatarInitials: 'MS'
  },
  {
    id: 'usr-neps-144',
    name: 'Farm. Carlos Eduardo Rocha',
    email: 'neps.us144@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'CRF-44102',
    unitId: 'unit-144',
    unitName: 'US 144 Policlínica Clementino Fraga',
    jobTitle: 'Coordenador NEPS (Farmacêutico)',
    avatarInitials: 'CR'
  },
  {
    id: 'usr-neps-162',
    name: 'Enf. Patrícia Lima',
    email: 'neps.us162@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-55419',
    unitId: 'unit-162',
    unitName: 'US 162 Policlínica Albert Sabin',
    jobTitle: 'Coordenadora NEPS Policlínica',
    avatarInitials: 'PL'
  },
  {
    id: 'usr-neps-166',
    name: 'Dr. Lucas Silveira',
    email: 'neps.us166@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'CRM-19920',
    unitId: 'unit-166',
    unitName: 'US 166 Policlínica Centro',
    jobTitle: 'Coordenador NEPS Policlínica',
    avatarInitials: 'LS'
  },
  {
    id: 'usr-neps-128',
    name: 'Enf. Marcela Queiroz',
    email: 'neps.us128@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-88192',
    unitId: 'unit-128',
    unitName: 'US 128 Policlínica Lessa de Andrade',
    jobTitle: 'Coordenadora NEPS Policlínica',
    avatarInitials: 'MQ'
  },
  {
    id: 'usr-neps-160',
    name: 'Dra. Fernanda Vasconcelos',
    email: 'neps.us160@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'CRM-28491',
    unitId: 'unit-160',
    unitName: 'US 160 Policlínica Gouveia de Barros',
    jobTitle: 'Coordenadora NEPS Policlínica',
    avatarInitials: 'FV'
  },
  {
    id: 'usr-neps-376',
    name: 'Enf. Andréia Lins',
    email: 'neps.us376@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-77401',
    unitId: 'unit-376',
    unitName: 'US 376 Policlínica Salomão Kelner',
    jobTitle: 'Coordenadora NEPS Policlínica',
    avatarInitials: 'AL'
  },
  {
    id: 'usr-neps-321',
    name: 'Dra. Camila Nogueira',
    email: 'neps.us321@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'CRM-91823',
    unitId: 'unit-321',
    unitName: 'US 321 Central de Alergologia',
    jobTitle: 'Coordenadora NEPS Especialidades',
    avatarInitials: 'CN'
  },
  {
    id: 'usr-neps-293',
    name: 'Enf. Juliana Ramos',
    email: 'neps.us293@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-33821',
    unitId: 'unit-293',
    unitName: 'US 293 Policlínica do Pina',
    jobTitle: 'Coordenadora NEPS Policlínica',
    avatarInitials: 'JR'
  },
  {
    id: 'usr-neps-101',
    name: 'Enf. Sérgio Meirelles',
    email: 'neps.us101@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-49102',
    unitId: 'unit-101',
    unitName: 'US 101 Policlínica Prof Waldemar de Oliveira',
    jobTitle: 'Coordenador NEPS Policlínica',
    avatarInitials: 'SM'
  },
  {
    id: 'usr-neps-217',
    name: 'Dr. Maurício Brandão',
    email: 'neps.us217@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'CRM-10928',
    unitId: 'unit-217',
    unitName: 'US 217 Centro Médico Sen José Ermírio de Moraes',
    jobTitle: 'Coordenador NEPS Centro Médico',
    avatarInitials: 'MB'
  },
  {
    id: 'usr-neps-180',
    name: 'Enf. Bruno Esteves',
    email: 'neps.us180@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'COREN-91823',
    unitId: 'unit-180',
    unitName: 'US 180 Central de Regulação Médica SAMU Metropolitano Recife',
    jobTitle: 'Coordenador NEPS SAMU 192',
    avatarInitials: 'BE'
  },
  {
    id: 'usr-neps-143',
    name: 'Bioméd. Vanessa Holanda',
    email: 'neps.us143@saude.recife.pe.gov.br',
    role: 'NEPS_UNIT',
    registrationNumber: 'CRBM-18290',
    unitId: 'unit-143',
    unitName: 'US 143 Laboratório Municipal do Recife',
    jobTitle: 'Coordenadora NEPS Laboratório',
    avatarInitials: 'VH'
  }
];

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
