import React, { useState } from 'react';
import { HealthUnit, ProfessionalCategory, UnitStaffCensus } from '../types';
import { ALL_PROFESSIONAL_CATEGORIES } from '../data/mockData';
import { 
  Building2, 
  Users, 
  Check, 
  X, 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Calculator,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface WorkforceCensusModalProps {
  unit: HealthUnit;
  censusHistory: UnitStaffCensus[];
  onClose: () => void;
  onSaveCensus: (updatedUnit: HealthUnit, newCensus: UnitStaffCensus) => void;
}

export const WorkforceCensusModal: React.FC<WorkforceCensusModalProps> = ({
  unit,
  onClose,
  onSaveCensus
}) => {
  const [period, setPeriod] = useState('Agosto/2026');
  const [breakdown, setBreakdown] = useState<Partial<Record<ProfessionalCategory, number>>>(
    unit.activeStaffBreakdown || {
      'Médico(a) da Família / Clínico': 12,
      'Médico(a) Especialista / Emergencista': 8,
      'Enfermeiro(a)': 14,
      'Técnico(a) de Enfermagem': 22,
      'Auxiliar de Enfermagem': 4,
      'Recepcionista / Atendimento': 4,
      'Higienização e Apoio Operacional': 4
    }
  );
  const [notes, setNotes] = useState(
    'Quadro atualizado com base no espelho de folha e escala do mês.'
  );
  const [importMode, setImportMode] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  // Calculate live sum
  const totalCalculatedStaff: number = (Object.values(breakdown) as (number | undefined)[]).reduce<number>((acc, count) => acc + (Number(count) || 0), 0);

  const handleCategoryChange = (category: ProfessionalCategory, value: string) => {
    const num = parseInt(value, 10);
    setBreakdown(prev => ({
      ...prev,
      [category]: isNaN(num) || num < 0 ? 0 : num
    }));
  };

  const handleQuickPreset = (scaleFactor: number) => {
    const updated: Partial<Record<ProfessionalCategory, number>> = {};
    ALL_PROFESSIONAL_CATEGORIES.forEach(cat => {
      const current = breakdown[cat] || 0;
      if (current > 0) {
        updated[cat] = Math.max(1, Math.round(current * scaleFactor));
      }
    });
    setBreakdown(updated);
  };

  const handleParseImport = () => {
    if (!importText.trim()) return;

    try {
      const lines = importText.split('\n');
      const updated: Partial<Record<ProfessionalCategory, number>> = { ...breakdown };
      let matchedCount = 0;

      lines.forEach(line => {
        const parts = line.split(/[;,\t:]+/);
        if (parts.length >= 2) {
          const rawCat = parts[0].trim().toLowerCase();
          const rawVal = parseInt(parts[1].trim(), 10);

          if (!isNaN(rawVal)) {
            const matched = ALL_PROFESSIONAL_CATEGORIES.find(c => 
              c.toLowerCase().includes(rawCat) || rawCat.includes(c.toLowerCase().slice(0, 8))
            );
            if (matched) {
              updated[matched] = rawVal;
              matchedCount++;
            }
          }
        }
      });

      setBreakdown(updated);
      setImportFeedback(`Sucesso: ${matchedCount} categorias identificadas e importadas.`);
      setTimeout(() => setImportMode(false), 1500);
    } catch (e) {
      setImportFeedback('Erro ao interpretar os dados. Verifique o formato digitado.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newCensus: UnitStaffCensus = {
      id: `census-${unit.id}-${Date.now()}`,
      unitId: unit.id,
      unitName: unit.name,
      period,
      totalActiveStaff: totalCalculatedStaff,
      breakdown,
      notes,
      submittedBy: unit.coordinatorName,
      submittedAt: new Date().toISOString(),
      verifiedBySermac: true
    };

    const updatedUnit: HealthUnit = {
      ...unit,
      totalStaff: totalCalculatedStaff,
      activeStaffBreakdown: breakdown,
      lastCensusDate: new Date().toISOString().split('T')[0],
      censusStatus: 'atualizado'
    };

    onSaveCensus(updatedUnit, newCensus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Censo de Profissionais Ativos</h3>
                <span className="px-2 py-0.5 text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full">
                  Indicador 1 (Índice de Atividade)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                {unit.name} ({unit.code}) • {unit.district}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Contextual Notice */}
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 text-blue-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-blue-300">
                Por que a coleta de profissionais ativos é estratégica?
              </p>
              <p className="text-blue-200/80 leading-relaxed">
                O número de profissionais ativos é o <strong>denominador oficial do Índice de Atividade da Educação Permanente</strong> (Fórmula: <code className="bg-blue-900/50 px-1 py-0.5 rounded text-white font-mono">(Únicos Treinados ÷ Total Ativos) × 100</code>, Meta: ≥ 90%). Manter este censo atualizado garante a fidedignidade dos relatórios enviados à SERMAC e à Secretaria de Saúde.
              </p>
            </div>
          </div>

          {/* Form Top: Period & Total Counter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mês de Referência do Censo
              </label>
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                <option value="Agosto/2026">Agosto / 2026 (Atual)</option>
                <option value="Julho/2026">Julho / 2026</option>
                <option value="Junho/2026">Junho / 2026</option>
                <option value="Setembro/2026">Setembro / 2026 (Projeção)</option>
              </select>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Total de Ativos na Unidade</span>
                <span className="text-2xl font-black text-teal-400">{totalCalculatedStaff}</span>
                <span className="text-[10px] text-slate-500 ml-1.5">profissionais</span>
              </div>
              <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400">
                <Calculator className="w-5 h-5" />
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-300 mb-1.5">Ações Rápidas</span>
              <button
                type="button"
                onClick={() => setImportMode(!importMode)}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5 text-teal-400" />
                {importMode ? 'Voltar para Formulário' : 'Importar / Colar Dados'}
              </button>
            </div>
          </div>

          {/* Import text area tab if active */}
          {importMode ? (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Colar Linhas de Planilha (Formato: Categoria, Quantidade)
                </label>
                <span className="text-[11px] text-slate-500">Ex: Enfermeiro, 14</span>
              </div>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Médico da Família, 12&#10;Enfermeiro, 14&#10;Técnico de Enfermagem, 22&#10;Recepcionista, 4"
                rows={5}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
              />
              {importFeedback && (
                <p className="text-xs text-teal-400 font-medium">{importFeedback}</p>
              )}
              <button
                type="button"
                onClick={handleParseImport}
                className="py-1.5 px-4 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Processar e Preencher
              </button>
            </div>
          ) : null}

          {/* Categorized breakdown table */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Distribuição por Categoria Profissional
              </h4>
              <span className="text-[11px] text-slate-400">
                Preencha o número de servidores ativos em cada função
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {ALL_PROFESSIONAL_CATEGORIES.map(category => {
                const count = breakdown[category] ?? 0;
                return (
                  <div
                    key={category}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                      count > 0 
                        ? 'bg-slate-800/80 border-slate-700' 
                        : 'bg-slate-950/40 border-slate-850 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className="text-xs text-slate-300 font-medium truncate pr-2" title={category}>
                      {category}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <input
                        type="number"
                        min="0"
                        value={count === 0 ? '' : count}
                        placeholder="0"
                        onChange={e => handleCategoryChange(category, e.target.value)}
                        className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-right font-bold text-teal-300 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes and Justification */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Fonte dos Dados e Observações da Coordenação
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Dados conferidos junto à gerência administrativa e CNES municipal em 01/08/2026"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Homologação imediata no Painel SERMAC</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-900/30 transition-colors"
            >
              <Check className="w-4 h-4" />
              Salvar e Atualizar Censo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
