import React from 'react';
import { AttendanceRecord, TrainingAction } from '../types';
import { 
  X, 
  Printer, 
  Download, 
  Award, 
  CheckCircle2, 
  QrCode, 
  Building2, 
  ShieldCheck 
} from 'lucide-react';

interface CertificateModalProps {
  record: AttendanceRecord | null;
  action?: TrainingAction;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  record,
  action,
  onClose
}) => {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(record.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        
        {/* Modal Top Bar */}
        <div className="bg-slate-900 px-6 py-3 flex items-center justify-between text-white print:hidden">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm">Declaração / Certificado Oficial de Capacitação</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              id="btn-print-certificate"
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
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Printable Area) */}
        <div className="p-8 md:p-12 bg-gradient-to-br from-amber-50/40 via-white to-slate-50 relative border-8 border-double border-slate-300 m-4 rounded-xl">
          
          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
            <Award className="w-96 h-96 text-slate-900" />
          </div>

          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-6 mb-8">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                SUS
              </div>
              <div className="text-left">
                <h3 className="font-black text-slate-800 text-base tracking-wide uppercase">
                  Secretaria Municipal de Saúde • SERMAC
                </h3>
                <p className="text-xs font-semibold text-teal-700 tracking-wider uppercase">
                  Núcleo de Educação Permanente em Saúde (NEPS)
                </p>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-black text-slate-900 tracking-wider mt-4">
              CERTIFICADO DE CAPACITAÇÃO EM SAÚDE
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Código Autenticador: {record.certificateCode}
            </p>
          </div>

          {/* Text Statement */}
          <div className="text-center space-y-6 text-slate-700 leading-relaxed text-sm md:text-base font-normal">
            <p>
              Certificamos que o(a) profissional de saúde
            </p>
            <p className="text-xl md:text-2xl font-serif font-bold text-slate-900 border-b-2 border-slate-300 inline-block px-8 pb-1">
              {record.participantName}
            </p>
            <p className="text-xs text-slate-600">
              Categoria: <strong className="text-slate-800">{record.professionalCategory}</strong> | Matrícula SUS: <strong className="text-slate-800">{record.registrationNumber}</strong> | CPF: <strong className="text-slate-800">{record.cpf}</strong>
            </p>

            <p className="max-w-2xl mx-auto text-justify md:text-center pt-2">
              concluiu com êxito e frequência integral a ação de Educação Permanente em Saúde com o tema{' '}
              <strong className="text-slate-900">"{record.actionTitle}"</strong>, correspondente ao eixo temático de{' '}
              <em className="text-teal-800 font-medium">{record.thematicAxis}</em>, realizada na unidade{' '}
              <strong className="text-slate-800">{record.unitName}</strong>, totalizando a carga horária de{' '}
              <strong className="text-slate-900 bg-amber-100 px-2 py-0.5 rounded font-mono">{record.workloadHours} horas</strong>.
            </p>
          </div>

          {/* Signatures & Verification */}
          <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            
            {/* Signature 1 */}
            <div className="text-center">
              <div className="w-44 h-0.5 bg-slate-400 mx-auto mb-2"></div>
              <p className="font-semibold text-xs text-slate-800">Coordenação NEPS da Unidade</p>
              <p className="text-[11px] text-slate-500">{record.unitName}</p>
            </div>

            {/* QR Code Validation */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="p-2 bg-white border border-slate-300 rounded-lg shadow-sm mb-1.5">
                <QrCode className="w-14 h-14 text-slate-800" />
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Validação Digital NEPS/SUS</span>
              <span className="text-[9px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Frequência Homologada
              </span>
            </div>

            {/* Signature 2 */}
            <div className="text-center">
              <div className="w-44 h-0.5 bg-slate-400 mx-auto mb-2"></div>
              <p className="font-semibold text-xs text-slate-800">Diretoria de Gestão do Trabalho / SERMAC</p>
              <p className="text-[11px] text-slate-500">Secretaria Municipal de Saúde</p>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 text-center text-[11px] text-slate-400">
            Emitido em {formattedDate} • Válido para fins de comprovação curricular e progressão no Plano de Cargos, Carreiras e Salários do SUS.
          </div>
        </div>

      </div>
    </div>
  );
};
