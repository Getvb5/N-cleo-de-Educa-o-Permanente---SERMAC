import React from 'react';
import { HealthUnit, TrainingAction, TrainingNeedDNC } from '../types';
import { 
  X, 
  FileText, 
  Printer, 
  Download, 
  CheckCircle, 
  Target, 
  Calendar, 
  Users, 
  Award,
  Layers
} from 'lucide-react';

interface PaepsPlanModalProps {
  units: HealthUnit[];
  actions: TrainingAction[];
  dncList: TrainingNeedDNC[];
  onClose: () => void;
}

export const PaepsPlanModal: React.FC<PaepsPlanModalProps> = ({
  units = [],
  actions = [],
  dncList = [],
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const totalStaff = units.reduce((acc, u) => acc + u.totalStaff, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Plano Anual de Educação Permanente em Saúde (PAEPS 2026)</h2>
              <p className="text-xs text-slate-300">
                Documento Estratégico Municipal consolidado pela Gestão Central SERMAC e Coordenações NEPS
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              id="btn-print-paeps"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-8 overflow-y-auto text-slate-800 space-y-6 text-xs leading-relaxed">
          
          {/* Document Title Header */}
          <div className="text-center border-b border-slate-300 pb-4">
            <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider">
              Secretaria Municipal de Saúde • SERMAC
            </h3>
            <h1 className="text-xl font-bold text-slate-900 mt-1 uppercase">
              PLANO MUNICIPAL DE EDUCAÇÃO PERMANENTE EM SAÚDE (PAEPS - CICLO 2026)
            </h1>
            <p className="text-slate-500 text-[11px] mt-1 font-mono">
              Fundamentado na Política Nacional de Educação Permanente em Saúde (Portaria GM/MS nº 1.996/2007)
            </p>
          </div>

          {/* Section 1: Overview */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 border-l-4 border-teal-600 pl-2">
              1. Apresentação e Diretrizes Estratégicas
            </h4>
            <p className="text-slate-700">
              O PAEPS 2026 consolida o compromisso da Gestão Central SERMAC e dos Núcleos de Educação Permanente em Saúde (NEPS) das Unidades Básicas, UPAs, CAPS e Hospitais em transformar o cotidiano do trabalho no SUS no principal motor de aprendizagem e qualificação do cuidado. O plano visa atingir uma cobertura mínima de <strong>85% da força de trabalho municipal</strong> ({totalStaff} profissionais cadastrados).
            </p>
          </div>

          {/* Section 2: Macro Goals */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 border-l-4 border-teal-600 pl-2">
              2. Metas & Indicadores de Desempenho
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="font-semibold text-slate-500 block">Meta de Carga Horária</span>
                <span className="text-lg font-bold text-slate-900 font-mono">Mínimo 20h / profissional / ano</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="font-semibold text-slate-500 block">Metodologias Ativas</span>
                <span className="text-lg font-bold text-teal-800 font-mono">≥ 80% das ações práticas</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="font-semibold text-slate-500 block">Satisfação & Reação</span>
                <span className="text-lg font-bold text-amber-800 font-mono">Índice ≥ 4.5 / 5.0</span>
              </div>
            </div>
          </div>

          {/* Section 3: Prioritized Needs from DNC */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 border-l-4 border-teal-600 pl-2">
              3. Matriz de Demandas Priorizadas (Levantamento de Necessidades - DNC)
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Tema Demandado</th>
                    <th className="p-2.5">Unidade Solicitante</th>
                    <th className="p-2.5">Público Prioritário</th>
                    <th className="p-2.5">Urgência</th>
                    <th className="p-2.5">Status no PAEPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dncList.map((dnc) => (
                    <tr key={dnc.id}>
                      <td className="p-2.5 font-bold text-slate-900">{dnc.suggestedTheme}</td>
                      <td className="p-2.5 text-slate-600">{dnc.unitName}</td>
                      <td className="p-2.5 text-slate-600">{dnc.targetCategories.slice(0, 2).join(', ')}...</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          dnc.urgency === 'Crítica' ? 'bg-rose-100 text-rose-800' :
                          dnc.urgency === 'Alta' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {dnc.urgency}
                        </span>
                      </td>
                      <td className="p-2.5 font-semibold text-teal-700">
                        {dnc.status.replace('_', ' ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Scheduled Actions Matrix */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 border-l-4 border-teal-600 pl-2">
              4. Quadro de Ações Educativas Pactuadas na Rede
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Código</th>
                    <th className="p-2.5">Tema / Eixo</th>
                    <th className="p-2.5">Facilitador / Categoria</th>
                    <th className="p-2.5">Carga</th>
                    <th className="p-2.5">Modalidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {actions.slice(0, 5).map((act) => (
                    <tr key={act.id}>
                      <td className="p-2.5 font-mono text-slate-500">{act.code}</td>
                      <td className="p-2.5 font-medium text-slate-900">
                        {act.title}
                        <span className="block text-[10px] text-slate-500">{act.thematicAxis}</span>
                      </td>
                      <td className="p-2.5 text-slate-600">
                        {act.instructorName}
                        <span className="block text-[10px] text-teal-700">{act.instructorCategory}</span>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">{act.workloadHours}h</td>
                      <td className="p-2.5 text-slate-600">{act.modality}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center">
            <div>
              <div className="w-48 h-0.5 bg-slate-400 mx-auto mb-1"></div>
              <p className="font-bold text-xs text-slate-800">Coordenação Geral de Gestão do Trabalho e Educação na Saúde</p>
              <p className="text-[11px] text-slate-500">SERMAC / Secretaria Municipal de Saúde</p>
            </div>
            <div>
              <div className="w-48 h-0.5 bg-slate-400 mx-auto mb-1"></div>
              <p className="font-bold text-xs text-slate-800">Colegiado de Coordenadores NEPS das Unidades</p>
              <p className="text-[11px] text-slate-500">Representação da Rede Municipal de Saúde</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
