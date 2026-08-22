import React, { useState } from 'react';
import { TrainingAction } from '../types';
import { AlertTriangle, X, Ban, FileText } from 'lucide-react';

interface CancelActionModalProps {
  action: TrainingAction;
  onClose: () => void;
  onConfirmCancel: (actionId: string, reason: string, category: NonNullable<TrainingAction['cancellationCategory']>) => void;
}

export const CancelActionModal: React.FC<CancelActionModalProps> = ({
  action,
  onClose,
  onConfirmCancel
}) => {
  const [category, setCategory] = useState<NonNullable<TrainingAction['cancellationCategory']>>('Escala de Plantão/Remanejamento');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Por favor, informe a justificativa detalhada do cancelamento.');
      return;
    }
    onConfirmCancel(action.id, reason.trim(), category);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cancelar Ação de Capacitação</h3>
              <p className="text-xs text-slate-400">
                {action.code} • {action.unitName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Ação Selecionada:</span>
            <p className="text-sm font-bold text-white">{action.title}</p>
          </div>

          <div className="p-3 bg-rose-950/20 border border-rose-800/30 rounded-xl text-rose-200 text-xs">
            <p className="font-semibold text-rose-300 mb-0.5">Indicador 5 - Taxa de Cancelamento de EP</p>
            <p className="text-rose-200/80">
              O cancelamento de ações planejadas impacta a meta oficial de cancelamento (Meta: ≤ 10%). O registro detalhado do motivo subsidia o diagnóstico institucional da SERMAC.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Categoria Principal do Cancelamento *
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="Escala de Plantão/Remanejamento">Escala de Plantão / Remanejamento Emergencial</option>
              <option value="Falta de Quórum">Falta de Quórum / Baixa Inscrição Prévia</option>
              <option value="Emergência/Surto">Emergência Sanitária / Surto Epidemiológico</option>
              <option value="Indisponibilidade de Instrutor">Indisponibilidade Imprevista de Instrutor / Facilitador</option>
              <option value="Problemas de Infraestrutura">Problemas de Infraestrutura / Espaço Físico / Equipamentos</option>
              <option value="Outro">Outro Motivo Institucional</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Justificativa Detalhada da Coordenação *
            </label>
            <textarea
              value={reason}
              onChange={e => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              rows={3}
              placeholder="Descreva as circunstâncias que levaram ao cancelamento da atividade..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
            />
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-900/30 transition-colors"
            >
              <Ban className="w-4 h-4" />
              Confirmar Cancelamento
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
