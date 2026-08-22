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
  Layers,
  ClipboardList
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
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Levantamento de Necessidades de Treinamento – LNT (Ciclo 2026)</h2>
              <p className="text-xs text-slate-300">
                Diagnóstico Situacional e Matriz de Demandas Formativas consolidado pela SERMAC e Núcleos NEPS
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              id="btn-print-lnt"
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
              LEVANTAMENTO DE NECESSIDADES DE TREINAMENTO – LNT (CICLO 2026)
            </h1>
            <p className="text-slate-500 text-[11px] mt-1 font-mono">
              Instrumento Técnico de Diagnóstico e Planejamento da Política Nacional de Educação Permanente em Saúde (PNEPS/SUS)
            </p>
          </div>

          {/* Section 1: Overview */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 border-l-4 border-teal-600 pl-2">
              1. Apresentação e Justificativa do LNT
            </h4>
            <p className="text-slate-700">
              O <strong>Levantamento de Necessidades de Treinamento – LNT 2026</strong> consolida a identificação diagnóstica e participativa dos nós críticos nos processos de trabalho de todas as 19 unidades da rede de saúde (Policlínicas, Maternidades, Hospitais, Centros de Saúde, SAMU 192 e Laboratório Municipal). Conduzido pela Gestão Central SERMAC em articulação direta com os Núcleos de Educação Permanente em Saúde (NEPS), o LNT subsidia a elaboração de intervenções formativas contextualizadas para os <strong>{totalStaff} profissionais da rede municipal</strong>.
            </p>
          </div>

          {/* Section 2: Macro Goals */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 border-l-4 border-teal-600 pl-2">
              2. Metas & Critérios de Priorização do LNT
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="font-semibold text-slate-500 block">Cobertura de Levantamento</span>
                <span className="text-lg font-bold text-slate-900 font-mono">100% das Unidades de Saúde</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="font-semibold text-slate-500 block">Foco em Metodologias Ativas</span>
                <span className="text-lg font-bold text-teal-800 font-mono">≥ 80% das ações práticas</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="font-semibold text-slate-500 block">Índice de Resolubilidade</span>
                <span className="text-lg font-bold text-amber-800 font-mono">≥ 90% das demandas atendidas</span>
              </div>
            </div>
          </div>

          {/* Section 3: Prioritized Needs from DNC / LNT */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 border-l-4 border-teal-600 pl-2">
              3. Matriz de Demandas Priorizadas pelo LNT (Diagnóstico por Unidade)
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Tema Demandado no LNT</th>
                    <th className="p-2.5">Unidade Solicitante</th>
                    <th className="p-2.5">Público Prioritário</th>
                    <th className="p-2.5">Urgência</th>
                    <th className="p-2.5">Status no LNT</th>
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
                        {dnc.status.replace('_', ' ').replace('PAEPS', 'LNT')}
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
              4. Quadro de Ações Formativas Vinculadas ao LNT
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
              <p className="text-[11px] text-slate-500">Comissão de Validação do LNT / SUS</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
