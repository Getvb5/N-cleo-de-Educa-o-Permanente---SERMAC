import { 
  HealthUnit, 
  TrainingAction, 
  AttendanceRecord, 
  SermacIndicatorReport, 
  ProfessionalCategory 
} from '../types';

export const OFFICIAL_INDICATOR_METAS = {
  ATIVIDADE_EP: 90, // >= 90%
  EXECUCAO_PLANO_TEP: 100, // 100%
  ASSIDUIDADE_TEMA: 100, // 100%
  ADESAO_CATEGORIA: 90, // >= 90%
  TAXA_CANCELAMENTO: 10, // <= 10%
  VINCULACAO_ESR: null // A definir
};

export function calculateSermacIndicators(
  units: HealthUnit[],
  actions: TrainingAction[],
  attendance: AttendanceRecord[],
  selectedUnitId?: string,
  selectedPeriod: string = 'Agosto/2026'
): SermacIndicatorReport {
  // Filter by unit if requested
  const filteredUnits = selectedUnitId && selectedUnitId !== 'all'
    ? units.filter(u => u.id === selectedUnitId)
    : units;

  const filteredActions = selectedUnitId && selectedUnitId !== 'all'
    ? actions.filter(a => a.unitId === selectedUnitId)
    : actions;

  const filteredAttendance = selectedUnitId && selectedUnitId !== 'all'
    ? attendance.filter(r => r.unitId === selectedUnitId || r.participantUnitId === selectedUnitId)
    : attendance;

  // 1. INDICADOR 1: Índice de Atividade da Educação Permanente
  // Fórmula: (Nº de profissionais únicos que participaram de ações de EPS ÷ Nº total de profissionais ativos) × 100 (Meta >= 90%)
  const presentRecords = filteredAttendance.filter(r => r.status === 'presente');
  const uniqueParticipantsSet = new Set<string>();
  presentRecords.forEach(r => {
    const key = r.cpf || r.registrationNumber || r.participantName;
    if (key) uniqueParticipantsSet.add(key);
  });
  const totalUniqueParticipants = uniqueParticipantsSet.size;

  const totalActiveStaff = filteredUnits.reduce((acc, u) => acc + (u.totalStaff || 0), 0);
  const rawAtividadeRate = totalActiveStaff > 0 ? (totalUniqueParticipants / totalActiveStaff) * 100 : 0;
  const atividadeRate = Math.min(100, Math.round(rawAtividadeRate * 10) / 10);

  const atividadeByUnit = filteredUnits.map(unit => {
    const unitPresent = attendance.filter(r => (r.participantUnitId === unit.id || r.unitId === unit.id) && r.status === 'presente');
    const unitUnique = new Set(unitPresent.map(r => r.cpf || r.registrationNumber || r.participantName)).size;
    const unitStaff = unit.totalStaff || 1;
    const unitRate = Math.min(100, Math.round((unitUnique / unitStaff) * 1000) / 10);
    return {
      unitId: unit.id,
      unitName: unit.name,
      uniqueParticipants: unitUnique,
      totalActiveStaff: unitStaff,
      rate: unitRate,
      isGoalMet: unitRate >= OFFICIAL_INDICATOR_METAS.ATIVIDADE_EP
    };
  }).sort((a, b) => b.rate - a.rate);

  // 2. INDICADOR 2: Taxa de Execução do Plano do Núcleo de Educação Permanente (TEP)
  // Fórmula: TEP = (Nº de atividades efetivamente realizadas ÷ Nº de atividades planejadas no período) × 100 (Meta: 100%)
  const completedActions = filteredActions.filter(a => a.status === 'concluida');
  const totalPlannedActions = filteredActions.length; // Total no plano (planejadas, em andamento, concluídas, canceladas)
  const rawTepRate = totalPlannedActions > 0 ? (completedActions.length / totalPlannedActions) * 100 : 0;
  const tepRate = Math.round(rawTepRate * 10) / 10;

  const tepByUnit = filteredUnits.map(unit => {
    const unitActs = actions.filter(a => a.unitId === unit.id);
    const executed = unitActs.filter(a => a.status === 'concluida').length;
    const planned = unitActs.length;
    const rate = planned > 0 ? Math.round((executed / planned) * 1000) / 10 : 0;
    return {
      unitId: unit.id,
      unitName: unit.name,
      executed,
      planned,
      rate,
      isGoalMet: rate >= OFFICIAL_INDICATOR_METAS.EXECUCAO_PLANO_TEP
    };
  }).sort((a, b) => b.rate - a.rate);

  // 3. INDICADOR 3: Coeficiente de Assiduidade por Tema
  // Fórmula: (Nº de profissionais treinados no tema ÷ Nº de profissionais previstos para o tema) × 100 (Meta: 100%)
  let totalTrainedInTheme = 0;
  let totalExpectedInTheme = 0;

  const assiduidadeByAction = completedActions.map(action => {
    const trained = action.attendedCount || 0;
    const expected = action.plannedAttendeesCount || action.maxSeats || (trained > 0 ? trained : 25);
    totalTrainedInTheme += trained;
    totalExpectedInTheme += expected;

    const rate = expected > 0 ? Math.min(100, Math.round((trained / expected) * 1000) / 10) : 0;
    return {
      actionId: action.id,
      actionCode: action.code,
      title: action.title,
      thematicAxis: action.thematicAxis,
      unitName: action.unitName,
      trained,
      expected,
      rate,
      isGoalMet: rate >= OFFICIAL_INDICATOR_METAS.ASSIDUIDADE_TEMA
    };
  });

  const overallAssiduidadeRate = totalExpectedInTheme > 0 
    ? Math.min(100, Math.round((totalTrainedInTheme / totalExpectedInTheme) * 1000) / 10) 
    : 0;

  // 4. INDICADOR 4: Taxa de Adesão por Categoria Profissional aos Treinamentos Ofertados
  // Fórmula: (Nº de profissionais da categoria que participaram ÷ Nº de profissionais da categoria elegíveis) × 100 (Meta: >= 90%)
  const categoryParticipationMap: Record<string, { participants: Set<string>; eligible: number }> = {};

  // Aggregate eligible staff by category from units active staff breakdown
  filteredUnits.forEach(u => {
    const breakdown = u.activeStaffBreakdown || {};
    Object.entries(breakdown).forEach(([cat, count]) => {
      if (!categoryParticipationMap[cat]) {
        categoryParticipationMap[cat] = { participants: new Set(), eligible: 0 };
      }
      categoryParticipationMap[cat].eligible += (count as number) || 0;
    });
  });

  // Track unique participants per category
  presentRecords.forEach(r => {
    const cat = r.professionalCategory;
    if (!categoryParticipationMap[cat]) {
      categoryParticipationMap[cat] = { participants: new Set(), eligible: Math.max(10, filteredUnits.length * 3) };
    }
    const idKey = r.cpf || r.registrationNumber || r.participantName;
    categoryParticipationMap[cat].participants.add(idKey);
  });

  const categoryAdhesionList = Object.entries(categoryParticipationMap).map(([cat, data]) => {
    const trained = data.participants.size;
    const eligible = Math.max(trained, data.eligible || 15);
    const rate = eligible > 0 ? Math.min(100, Math.round((trained / eligible) * 1000) / 10) : 0;
    return {
      category: cat as ProfessionalCategory,
      participantsCount: trained,
      eligibleCount: eligible,
      rate,
      isGoalMet: rate >= OFFICIAL_INDICATOR_METAS.ADESAO_CATEGORIA
    };
  }).sort((a, b) => b.rate - a.rate);

  const averageCategoryAdhesion = categoryAdhesionList.length > 0
    ? Math.round((categoryAdhesionList.reduce((acc, c) => acc + c.rate, 0) / categoryAdhesionList.length) * 10) / 10
    : 0;

  // 5. INDICADOR 5: Taxa de Cancelamento das Ações de Educação Permanente
  // Fórmula: (Nº de treinamentos cancelados no período ÷ Nº total de treinamentos planejados no período) × 100 (Meta: <= 10%)
  const cancelledActions = filteredActions.filter(a => a.status === 'cancelada');
  const cancelRate = totalPlannedActions > 0 
    ? Math.round((cancelledActions.length / totalPlannedActions) * 1000) / 10 
    : 0;

  const reasonsMap: Record<string, number> = {};
  cancelledActions.forEach(a => {
    const reason = a.cancellationCategory || a.cancellationReason || 'Outro';
    reasonsMap[reason] = (reasonsMap[reason] || 0) + 1;
  });

  const reasonsBreakdown = Object.entries(reasonsMap).map(([reason, count]) => ({
    reason,
    count,
    percentage: cancelledActions.length > 0 ? Math.round((count / cancelledActions.length) * 100) : 0
  }));

  // 6. INDICADOR 6: Percentual de Treinamentos Vinculados à Escola de Saúde do Recife (ESR)
  // Fórmula: (Nº de treinamentos vinculados à ESR realizados no período ÷ Nº total de treinamentos realizados pelo NEP) × 100 (Meta: A definir)
  const esrLinkedActions = completedActions.filter(a => a.isEsrLinked);
  const esrRate = completedActions.length > 0 
    ? Math.round((esrLinkedActions.length / completedActions.length) * 1000) / 10 
    : 0;

  const esrTypesMap: Record<string, number> = {};
  esrLinkedActions.forEach(a => {
    const type = a.esrLinkType || 'Parceria Pedagógica ESR';
    esrTypesMap[type] = (esrTypesMap[type] || 0) + 1;
  });

  const esrTypesBreakdown = Object.entries(esrTypesMap).map(([type, count]) => ({
    type,
    count
  }));

  return {
    period: selectedPeriod,
    generatedAt: new Date().toISOString(),
    atividadeEP: {
      uniqueParticipants: totalUniqueParticipants,
      totalActiveStaff,
      rate: atividadeRate,
      meta: OFFICIAL_INDICATOR_METAS.ATIVIDADE_EP,
      isGoalMet: atividadeRate >= OFFICIAL_INDICATOR_METAS.ATIVIDADE_EP,
      byUnit: atividadeByUnit
    },
    execucaoPlanoTEP: {
      executedActions: completedActions.length,
      plannedActions: totalPlannedActions,
      rate: tepRate,
      meta: OFFICIAL_INDICATOR_METAS.EXECUCAO_PLANO_TEP,
      isGoalMet: tepRate >= OFFICIAL_INDICATOR_METAS.EXECUCAO_PLANO_TEP,
      byUnit: tepByUnit
    },
    assiduidadePorTema: {
      totalTrainedInTheme,
      totalExpectedInTheme,
      rate: overallAssiduidadeRate,
      meta: OFFICIAL_INDICATOR_METAS.ASSIDUIDADE_TEMA,
      isGoalMet: totalExpectedInTheme > 0 && overallAssiduidadeRate >= OFFICIAL_INDICATOR_METAS.ASSIDUIDADE_TEMA,
      byAction: assiduidadeByAction
    },
    adesaoPorCategoria: {
      overallRate: averageCategoryAdhesion,
      meta: OFFICIAL_INDICATOR_METAS.ADESAO_CATEGORIA,
      byCategory: categoryAdhesionList
    },
    taxaCancelamento: {
      cancelledActions: cancelledActions.length,
      totalPlannedActions,
      rate: cancelRate,
      meta: OFFICIAL_INDICATOR_METAS.TAXA_CANCELAMENTO,
      isGoalMet: cancelRate <= OFFICIAL_INDICATOR_METAS.TAXA_CANCELAMENTO,
      reasonsBreakdown
    },
    vinculacaoESR: {
      esrLinkedActions: esrLinkedActions.length,
      totalCompletedActions: completedActions.length,
      rate: esrRate,
      metaLabel: 'A definir',
      byType: esrTypesBreakdown
    }
  };
}
