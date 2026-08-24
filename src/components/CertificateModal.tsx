import React, { useRef, useState, useEffect } from 'react';
import { AttendanceRecord, TrainingAction } from '../types';
import { 
  X, 
  Printer, 
  Download, 
  Award, 
  CheckCircle2, 
  QrCode, 
  Loader2
} from 'lucide-react';
import { toPng } from 'html-to-image';

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
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!certificateRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(certificateRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true
      });
      const link = document.createElement('a');
      const sanitizedName = record.participantName.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
      link.download = `Certificado_${sanitizedName || 'Profissional'}_${record.certificateCode || 'NEPS'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao gerar imagem do certificado:', err);
      // Fallback to print dialog if canvas generation fails
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const formattedDate = new Date(record.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div 
      id="certificate-modal-overlay"
      className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Bar */}
        <div className="bg-slate-900 px-4 sm:px-6 py-3 flex items-center justify-between text-white print:hidden border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-semibold text-xs sm:text-sm truncate">Declaração / Certificado de Capacitação</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              id="btn-download-certificate"
              type="button"
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition shadow-xs cursor-pointer"
              title="Baixar imagem em alta resolução (.png)"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isDownloading ? 'Gerando...' : 'Baixar'}</span>
            </button>
            <button
              id="btn-print-certificate"
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
            <button
              id="btn-close-certificate-top"
              type="button"
              onClick={onClose}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white transition text-xs font-medium cursor-pointer"
              title="Fechar Certificado (Esc)"
            >
              <X className="w-4 h-4" />
              <span>Fechar</span>
            </button>
          </div>
        </div>

        {/* Certificate Body (Printable Area) */}
        <div 
          ref={certificateRef}
          className="p-6 sm:p-10 md:p-12 bg-gradient-to-br from-amber-50/40 via-white to-slate-50 relative border-4 sm:border-8 border-double border-slate-300 m-3 sm:m-4 rounded-xl"
        >
          
          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
            <Award className="w-72 sm:w-96 h-72 sm:h-96 text-slate-900" />
          </div>

          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-5 sm:pb-6 mb-6 sm:mb-8">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md">
                SUS
              </div>
              <div className="text-left">
                <h3 className="font-black text-slate-800 text-sm sm:text-base tracking-wide uppercase">
                  Secretaria Municipal de Saúde • SESAU
                </h3>
                <p className="text-[11px] sm:text-xs font-semibold text-teal-700 tracking-wider uppercase">
                  Núcleo de Educação Permanente em Saúde (NEPS)
                </p>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-slate-900 tracking-wider mt-3 sm:mt-4">
              CERTIFICADO DE CAPACITAÇÃO EM SAÚDE
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-mono mt-1">
              Código Autenticador: {record.certificateCode}
            </p>
          </div>

          {/* Text Statement */}
          <div className="text-center space-y-4 sm:space-y-6 text-slate-700 leading-relaxed text-xs sm:text-sm md:text-base font-normal">
            <p>
              Certificamos que o(a) profissional de saúde
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-slate-900 border-b-2 border-slate-300 inline-block px-4 sm:px-8 pb-1">
              {record.participantName}
            </p>
            <p className="text-xs text-slate-600">
              Categoria: <strong className="text-slate-800">{record.professionalCategory}</strong> | Matrícula SUS: <strong className="text-slate-800">{record.registrationNumber}</strong>{record.cpf ? <> | CPF: <strong className="text-slate-800">{record.cpf}</strong></> : null}
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
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end">
            
            {/* Signature 1 */}
            <div className="text-center">
              <div className="w-36 sm:w-44 h-0.5 bg-slate-400 mx-auto mb-2"></div>
              <p className="font-semibold text-xs text-slate-800">Coordenação NEPS da Unidade</p>
              <p className="text-[11px] text-slate-500">{record.unitName}</p>
            </div>

            {/* QR Code Validation */}
            <div className="flex flex-col items-center justify-center text-center my-2 md:my-0">
              <div className="p-2 bg-white border border-slate-300 rounded-lg shadow-xs mb-1.5">
                <QrCode className="w-12 sm:w-14 h-12 sm:h-14 text-slate-800" />
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Validação Digital NEPS/SUS</span>
              <span className="text-[9px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Frequência Homologada
              </span>
            </div>

            {/* Signature 2 */}
            <div className="text-center">
              <div className="w-36 sm:w-44 h-0.5 bg-slate-400 mx-auto mb-2"></div>
              <p className="font-semibold text-xs text-slate-800">Coordenação do Núcleo de Educação Permanente em Saúde - SERMAC</p>
              <p className="text-[11px] text-slate-500">Secretaria Municipal de Saúde • SESAU</p>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 sm:mt-8 text-center text-[10px] sm:text-[11px] text-slate-400">
            Emitido em {formattedDate} • Válido para fins de comprovação curricular e progressão no Plano de Cargos, Carreiras e Salários do SUS.
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 print:hidden">
          <span className="text-xs text-slate-500">
            Pressione <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 bg-slate-200 border border-slate-300 rounded-md">Esc</kbd> ou clique fora da área do certificado para fechar.
          </span>
          <div className="flex items-center space-x-2">
            <button
              id="btn-close-certificate-bottom"
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer shadow-xs"
            >
              Fechar Certificado
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
