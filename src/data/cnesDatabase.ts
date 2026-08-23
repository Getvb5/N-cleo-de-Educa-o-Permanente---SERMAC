import { CnesProfessional, HealthUnit, ProfessionalCategory } from '../types';

export const CNES_CODES_BY_UNIT_CODE: Record<string, string> = {
  'US-159': '0002135',
  'US-163': '0002488',
  'US-169': '0002593',
  'US-164': '0002569',
  'US-165': '0002623',
  'US-153': '0002542',
  'US-167': '0002577',
  'US-144': '0002429',
  'US-162': '0002534',
  'US-166': '0002607',
  'US-128': '0002410',
  'US-160': '0002518',
  'US-376': '2714777',
  'US-321': '2634420',
  'US-293': '2516428',
  'US-101': '0002380',
  'US-168': '0002585',
  'US-170': '0002615',
  'US-192': '2516401',
  'US-LAB': '2634455'
};

export const CBO_MAPPING: Record<string, { code: string; name: string; category: ProfessionalCategory }> = {
  '2251-25': { code: '2251-25', name: 'Médico Clínico Geral', category: 'Médico(a) da Família / Clínico' },
  '2251-30': { code: '2251-30', name: 'Médico de Família e Comunidade', category: 'Médico(a) da Família / Clínico' },
  '2251-40': { code: '2251-40', name: 'Médico Emergencista / Intensivista', category: 'Médico(a) Especialista / Emergencista' },
  '2252-50': { code: '2252-50', name: 'Médico Ginecologista e Obstetra', category: 'Médico(a) Especialista / Emergencista' },
  '2251-24': { code: '2251-24', name: 'Médico Pediatra', category: 'Médico(a) Especialista / Emergencista' },
  '2235-05': { code: '2235-05', name: 'Enfermeiro Geral', category: 'Enfermeiro(a)' },
  '2235-65': { code: '2235-65', name: 'Enfermeiro de Saúde da Família', category: 'Enfermeiro(a)' },
  '2235-50': { code: '2235-50', name: 'Enfermeiro Obstetra / Neonatal', category: 'Enfermeiro(a)' },
  '3222-05': { code: '3222-05', name: 'Técnico de Enfermagem', category: 'Técnico(a) de Enfermagem' },
  '3222-30': { code: '3222-30', name: 'Auxiliar de Enfermagem', category: 'Auxiliar de Enfermagem' },
  '5151-05': { code: '5151-05', name: 'Agente Comunitário de Saúde', category: 'Agente Comunitário de Saúde (ACS)' },
  '5151-20': { code: '5151-20', name: 'Agente de Combate a Endemias', category: 'Agente de Combate a Endemias (ACE)' },
  '2515-10': { code: '2515-10', name: 'Psicólogo Clínico / da Saúde', category: 'Psicólogo(a)' },
  '2236-05': { code: '2236-05', name: 'Fisioterapeuta Geral', category: 'Fisioterapeuta' },
  '2516-05': { code: '2516-05', name: 'Assistente Social', category: 'Assistente Social' },
  '2234-05': { code: '2234-05', name: 'Farmacêutico Hospitalar e Clínico', category: 'Farmacêutico(a)' },
  '2237-10': { code: '2237-10', name: 'Nutricionista Clínico', category: 'Nutricionista' },
  '2232-08': { code: '2232-08', name: 'Cirurgião Dentista Clínico Geral', category: 'Cirurgião(ã)-Dentista' },
  '3224-05': { code: '3224-05', name: 'Técnico em Saúde Bucal', category: 'Técnico/Auxiliar de Saúde Bucal' },
  '4221-05': { code: '4221-05', name: 'Recepcionista em Geral / Regulação', category: 'Recepcionista / Atendimento' },
  '4110-10': { code: '4110-10', name: 'Assistente Administrativo / Faturamento SUS', category: 'Agente Administrativo / Faturamento' },
  '5143-20': { code: '5143-20', name: 'Auxiliar de Limpeza e Higienização Hospitalar', category: 'Higienização e Apoio Operacional' },
  '7823-10': { code: '7823-10', name: 'Motorista Socorrista de Ambulância SAMU', category: 'Condutor de Ambulância / Transporte' }
};

// Gerador determinístico de base de profissionais CNES para as unidades da rede
export const generateMockCnesDatabase = (units: HealthUnit[]): CnesProfessional[] => {
  const professionals: CnesProfessional[] = [];

  const firstNames = ['Ana', 'Carlos', 'Beatriz', 'Juliana', 'Marcos', 'Fernanda', 'Rafael', 'Luciana', 'Rodrigo', 'Camila', 'Eduardo', 'Patricia', 'Lucas', 'Mariana', 'Thiago', 'Carla', 'Sergio', 'Amanda', 'Gabriel', 'Larissa', 'Bruno', 'Renata', 'Diego', 'Vanessa'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Lima', 'Ferreira', 'Costa', 'Rodrigues', 'Albuquerque', 'Cavalcanti', 'Menezes', 'Queiroz', 'Ramos', 'Gouveia', 'Vasconcelos', 'Siqueira', 'Lins', 'Nogueira', 'Bandeira'];

  let idCounter = 1000;

  units.forEach(unit => {
    const cnesCode = CNES_CODES_BY_UNIT_CODE[unit.code] || '0002135';
    const breakdown = unit.activeStaffBreakdown || {
      'Enfermeiro(a)': 6,
      'Técnico(a) de Enfermagem': 10,
      'Médico(a) da Família / Clínico': 4,
      'Recepcionista / Atendimento': 3
    };

    Object.entries(breakdown).forEach(([catKey, count]) => {
      const category = catKey as ProfessionalCategory;
      const numProfessionals = Number(count) || 0;

      // Find matching CBO
      const cboEntry = Object.values(CBO_MAPPING).find(m => m.category === category) || {
        code: '3222-05',
        name: category,
        category
      };

      for (let i = 0; i < numProfessionals; i++) {
        idCounter++;
        const fn = firstNames[(idCounter + i) % firstNames.length];
        const ln1 = lastNames[(idCounter * 3 + i) % lastNames.length];
        const ln2 = lastNames[(idCounter * 7 + i) % lastNames.length];
        const fullName = `${fn} ${ln1} ${ln2}`;

        // Deterministic CPF
        const rawCpf = String(10000000000 + (idCounter * 876543) % 89999999999);
        const formattedCpf = `${rawCpf.slice(0, 3)}.${rawCpf.slice(3, 6)}.${rawCpf.slice(6, 9)}-${rawCpf.slice(9, 11)}`;

        // Deterministic CNS (Cartão SUS)
        const rawCns = String(700000000000000 + (idCounter * 1234567) % 299999999999999);

        // Council registration
        let councilRegistration = undefined;
        if (category === 'Enfermeiro(a)') {
          councilRegistration = `COREN-PE ${(100000 + (idCounter % 899999))}-ENF`;
        } else if (category === 'Técnico(a) de Enfermagem') {
          councilRegistration = `COREN-PE ${(200000 + (idCounter % 899999))}-TE`;
        } else if (category.startsWith('Médico')) {
          councilRegistration = `CRM-PE ${(10000 + (idCounter % 89999))}`;
        } else if (category.startsWith('Cirurgião')) {
          councilRegistration = `CRO-PE ${(5000 + (idCounter % 89999))}`;
        }

        professionals.push({
          id: `cnes-prof-${idCounter}`,
          cpf: formattedCpf,
          cns: rawCns,
          name: fullName,
          cboCode: cboEntry.code,
          cboDescription: cboEntry.name,
          professionalCategory: category,
          councilRegistration,
          cnesUnitCode: cnesCode,
          unitId: unit.id,
          unitName: unit.name,
          weeklyHours: [20, 30, 40][(idCounter + i) % 3],
          contractType: ['Estatutário', 'Estatutário', 'Contrato Temporário', 'CLT / Fundação'][(idCounter + i) % 4] as any,
          status: 'Ativo',
          lastSynced: '2026-08-20T10:00:00Z'
        });
      }
    });
  });

  return professionals;
};
