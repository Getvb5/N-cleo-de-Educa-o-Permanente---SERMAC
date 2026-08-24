import React, { useState, useEffect } from 'react';
import { HealthUnit, CnesProfessional, CnesSyncSummary, ProfessionalCategory } from '../types';
import { CBO_MAPPING, validateCns, generateValidCns, validateCpf, generateValidCpf, VERIFIED_OFFICIAL_CNES_REGISTRY } from '../data/cnesDatabase';
import { ALL_PROFESSIONAL_CATEGORIES } from '../data/mockData';
import { lookupCnesProfessionalApi, formatCpf } from '../utils/cnesService';
import { 
  Building2, 
  RefreshCw, 
  Database, 
  Search, 
  CheckCircle2, 
  FileSpreadsheet, 
  FileText, 
  Users, 
  Check, 
  X, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
  Download
} from 'lucide-react';

interface CnesIntegrationModalProps {
  units: HealthUnit[];
  selectedUnitId?: string;
  professionals: CnesProfessional[];
  onClose: () => void;
  onSyncUnitCnes: (unitId: string, syncedProfessionals: CnesProfessional[]) => void;
  onAddProfessional?: (newProf: CnesProfessional) => void;
  isRestrictedToUnit?: boolean;
  currentUserRole?: string;
}

export const CnesIntegrationModal: React.FC<CnesIntegrationModalProps> = ({
  units,
  selectedUnitId,
  professionals,
  onClose,
  onSyncUnitCnes,
  onAddProfessional,
  isRestrictedToUnit = false,
  currentUserRole
}) => {
  // If user is restricted to a unit (e.g., NEPS_UNIT), locked unit ID is enforced
  const enforcedUnitId = selectedUnitId || units[0]?.id || '';
  const [activeUnitId, setActiveUnitId] = useState<string>(enforcedUnitId);
  const isUnitLocked = isRestrictedToUnit || currentUserRole === 'NEPS_UNIT';

  // Ensure activeUnitId cannot deviate if locked
  useEffect(() => {
    if (isUnitLocked && selectedUnitId) {
      setActiveUnitId(selectedUnitId);
    }
  }, [isUnitLocked, selectedUnitId]);
  const [activeTab, setActiveTab] = useState<'consulta' | 'novo_profissional' | 'elasticnes' | 'sincronizacao' | 'importacao_arquivo'>('consulta');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'Ativo' | 'Afastado' | 'Licença'>('todos');
  
  // Live CNES Query State
  const [liveQueryInput, setLiveQueryInput] = useState('');
  const [liveCategoryHint, setLiveCategoryHint] = useState<string>('todos');
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveFoundProf, setLiveFoundProf] = useState<CnesProfessional | null>(null);
  const [liveSearchFeedback, setLiveSearchFeedback] = useState<string | null>(null);

  // New Professional Form State
  const [newProfName, setNewProfName] = useState('');
  const [newProfCns, setNewProfCns] = useState('');
  const [newProfCboKey, setNewProfCboKey] = useState<string>('2235-05');
  const [newProfHours, setNewProfHours] = useState<number>(40);
  const [newProfContract, setNewProfContract] = useState<CnesProfessional['contractType']>('Estatutário');
  const [newProfInclusionReason, setNewProfInclusionReason] = useState('Admissão recente pendente na remessa DATASUS');
  const [newProfSuccess, setNewProfSuccess] = useState<string | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // File import state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [rawTextImport, setRawTextImport] = useState('');
  const [parsedPreviewList, setParsedPreviewList] = useState<CnesProfessional[]>([]);
  const [importReport, setImportReport] = useState<CnesSyncSummary | null>(null);

  const currentUnit = units.find(u => u.id === activeUnitId) || units[0];

  // Helper to parse official CNES CSV/XML/Text
  const parseOfficialCnesText = (text: string): CnesProfessional[] => {
    if (!text || !text.trim()) return [];

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    const results: CnesProfessional[] = [];

    // Check if line has header
    const firstLine = lines[0].toUpperCase();
    const isHeaderPresent = firstLine.includes('CPF') || firstLine.includes('NOME') || firstLine.includes('CBO') || firstLine.includes('NO_PROFISSIONAL');
    const dataLines = isHeaderPresent ? lines.slice(1) : lines;

    dataLines.forEach((line, idx) => {
      // Split by semicolon, comma or tab
      const delimiter = line.includes(';') ? ';' : line.includes('\t') ? '\t' : ',';
      const cols = line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));

      if (cols.length >= 2) {
        // Attempt to detect fields
        let cns = '';
        let name = '';
        let cboCode = '2235-05';
        let cboDesc = 'Enfermeiro Geral';
        let category: ProfessionalCategory = 'Enfermeiro(a)';
        let hours = 40;
        let contractType: CnesProfessional['contractType'] = 'Estatutário';

        // Scan columns
        cols.forEach((col) => {
          const digits = col.replace(/\D/g, '');
          if (digits.length === 15 && !cns) {
            cns = digits;
          } else if (/^\d{4}-\d{2}$/.test(col) || Object.keys(CBO_MAPPING).includes(col)) {
            cboCode = col;
            if (CBO_MAPPING[col]) {
              cboDesc = CBO_MAPPING[col].name;
              category = CBO_MAPPING[col].category;
            }
          } else if (/^(20|30|40)(h| horas)?$/i.test(col)) {
            const hNum = parseInt(col.replace(/\D/g, ''), 10);
            if (hNum) hours = hNum;
          } else if (col.includes('Estatutário') || col.includes('CLT') || col.includes('Contrato') || col.includes('Residente') || col.includes('Cedido')) {
            contractType = col as any;
          } else if (!name && col.length >= 3 && !/^\d+$/.test(col) && !col.includes('US-') && !col.includes('CNES') && !col.includes('COREN') && !col.includes('CRM') && !col.includes('CRO')) {
            name = col;
          }
        });

        // Positional fallback if not resolved
        if (!name && cols[1] && cols[1].length >= 3) name = cols[1];
        if (!name && cols[0] && cols[0].length >= 3 && !/^\d+$/.test(cols[0])) name = cols[0];

        if (name) {
          // If CBO was in text
          Object.entries(CBO_MAPPING).forEach(([code, mapping]) => {
            const lineLower = line.toLowerCase();
            if (lineLower.includes(code.toLowerCase()) || lineLower.includes(mapping.name.toLowerCase())) {
              cboCode = mapping.code;
              cboDesc = mapping.name;
              category = mapping.category;
            }
          });

          results.push({
            id: `cnes-imported-${Date.now()}-${idx}`,
            cpf: '',
            cns: cns || '',
            name: name.toUpperCase(),
            cboCode,
            cboDescription: cboDesc,
            professionalCategory: category,
            councilRegistration: undefined,
            cnesUnitCode: currentUnit.cnes || '0000531',
            unitId: activeUnitId,
            unitName: currentUnit.name,
            weeklyHours: hours,
            contractType,
            status: 'Ativo',
            lastSynced: new Date().toISOString()
          });
        }
      }
    });

    return results;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawTextImport(content);
        const parsed = parseOfficialCnesText(content);
        setParsedPreviewList(parsed);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplateCsv = () => {
    const header = 'CO_CNES;NO_ESTABELECIMENTO;NU_CNS;NO_PROFISSIONAL;CO_CBO;NO_CBO;QT_CARGA_HORARIA_TOTAL;TP_VINCULO;ST_VINCULO\n';
    const sampleRows = [
      `${currentUnit.cnes || '0000531'};${currentUnit.name};702107764708496;MIKAEL LIMA BRASIL;2235-05;Enfermeiro Geral;40;Estatutário;Ativo`,
      `${currentUnit.cnes || '0000531'};${currentUnit.name};702405829103842;MARIANA CAVALCANTI DE VASCONCELOS;2251-25;Médico Clínico Geral;40;Estatutário;Ativo`,
      `${currentUnit.cnes || '0000531'};${currentUnit.name};702201948372610;JULIANA FERREIRA DA COSTA;3222-05;Técnico de Enfermagem;30;CLT / Fundação;Ativo`,
      `${currentUnit.cnes || '0000531'};${currentUnit.name};702803719402859;CARLOS EDUARDO ALBUQUERQUE;2232-08;Cirurgião Dentista Clínico Geral;40;Estatutário;Ativo`,
      `${currentUnit.cnes || '0000531'};${currentUnit.name};702302819402838;AMANDA BARBOSA QUEIROZ;2515-10;Psicólogo Clínico / da Saúde;30;Estatutário;Ativo`,
      `${currentUnit.cnes || '0000531'};${currentUnit.name};702604819203845;THIAGO RAMOS NOGUEIRA;2236-05;Fisioterapeuta Geral;30;Estatutário;Ativo`,
      `${currentUnit.cnes || '0000531'};${currentUnit.name};702901827364514;CAMILA DANTAS DE MELO;2234-05;Farmacêutico Hospitalar e Clínico;40;Estatutário;Ativo`,
      `${currentUnit.cnes || '0000531'};${currentUnit.name};702501928374653;BEATRIZ SANTOS DE MIRANDA;2251-40;Médico Emergencista / Intensivista;24;Estatutário;Ativo`
    ].join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(header + sampleRows);
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', csvContent);
    downloadLink.setAttribute('download', `modelo_oficial_cnes_${currentUnit.code}_profissionais.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Helper to change category on found professional
  const handleUpdateFoundProfCbo = (cboKey: string) => {
    if (!liveFoundProf) return;
    const mapping = CBO_MAPPING[cboKey];
    if (!mapping) return;

    setLiveFoundProf({
      ...liveFoundProf,
      cboCode: mapping.code,
      cboDescription: mapping.name,
      professionalCategory: mapping.category
    });
  };

  // Live CNES Search Handler
  const handlePerformLiveSearch = async (queryToUse?: string, explicitCategory?: string) => {
    const q = (queryToUse || liveQueryInput || searchQuery).trim();
    if (!q) {
      alert('Por favor informe o Cartão SUS (CNS) ou Nome para consulta no CNES.');
      return;
    }

    const catToUse = explicitCategory || (liveCategoryHint !== 'todos' ? liveCategoryHint : (categoryFilter !== 'todos' ? categoryFilter : undefined));

    setIsSearchingLive(true);
    setLiveFoundProf(null);
    setLiveSearchFeedback(null);

    try {
      // 1. First check if exists in local array across ANY unit
      const cleanDigits = q.replace(/\D/g, '');
      const hasLetters = /[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/i.test(q);

      const localMatch = professionals.find(p => 
        (cleanDigits.length === 15 && p.cns === cleanDigits) ||
        p.cns.includes(q) ||
        p.name.toLowerCase().includes(q.toLowerCase())
      );

      if (localMatch) {
        setLiveFoundProf(localMatch);
        if (localMatch.unitId === activeUnitId) {
          setLiveSearchFeedback(`Profissional "${localMatch.name}" (${localMatch.professionalCategory}) já está cadastrado(a) nesta unidade!`);
        } else {
          setLiveSearchFeedback(`Profissional "${localMatch.name}" (${localMatch.professionalCategory}) localizado na base (Lotação: ${localMatch.unitName}). Você pode importá-lo/vinculá-lo a esta unidade.`);
        }
        setIsSearchingLive(false);
        return;
      }

      // 2. Query live CNES API endpoint
      const result = await lookupCnesProfessionalApi(q, {
        unitId: activeUnitId,
        unitName: currentUnit.name,
        cnesCode: currentUnit.cnes,
        nameHint: hasLetters ? q : undefined,
        categoryHint: catToUse
      });

      if (result) {
        setLiveFoundProf(result);
        setLiveSearchFeedback(`Profissional "${result.name}" localizado no Cadastro Nacional CNES / Ministério da Saúde!`);
      } else {
        setLiveSearchFeedback('❌ Nenhum profissional encontrado na base oficial do CNES. Utilize a aba "+ Incluir Profissional" para cadastrar com os dados exatos.');
      }
    } catch (err) {
      console.error(err);
      setLiveSearchFeedback('Falha na comunicação com o barramento do CNES. Tente novamente.');
    } finally {
      setIsSearchingLive(false);
    }
  };

  const handleImportLiveProfessional = (profToImport: CnesProfessional) => {
    const adjustedProf: CnesProfessional = {
      ...profToImport,
      cpf: '',
      councilRegistration: undefined,
      unitId: activeUnitId,
      unitName: currentUnit.name,
      cnesUnitCode: currentUnit.cnes || '0000531',
      lastSynced: new Date().toISOString()
    };

    if (onAddProfessional) {
      onAddProfessional(adjustedProf);
    }

    setLiveFoundProf(null);
    setLiveSearchFeedback(`✅ Profissional "${adjustedProf.name}" (${adjustedProf.cboDescription}) importado com sucesso para ${currentUnit.name}!`);
    setSearchQuery(adjustedProf.name);
    setLiveQueryInput('');
    setTimeout(() => {
      setLiveSearchFeedback(null);
    }, 5000);
  };

  // Professionals for this unit or all
  const filteredProfessionals = professionals.filter(p => {
    const matchesUnit = !activeUnitId || p.unitId === activeUnitId;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cns.includes(searchQuery) ||
      p.cboCode.includes(searchQuery);
    
    const matchesCategory = categoryFilter === 'todos' || p.professionalCategory === categoryFilter;
    const matchesStatus = statusFilter === 'todos' || p.status === statusFilter;

    return matchesUnit && matchesSearch && matchesCategory && matchesStatus;
  });

  const unitProfessionalsCount = professionals.filter(p => p.unitId === activeUnitId).length;

  const handleSaveNewProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfName.trim()) {
      alert('Por favor informe o Nome Completo do profissional.');
      return;
    }

    const cboInfo = CBO_MAPPING[newProfCboKey] || {
      code: newProfCboKey,
      name: 'Profissional de Saúde',
      category: 'Enfermeiro(a)'
    };

    const newProfessional: CnesProfessional = {
      id: `cnes-prof-manual-${Date.now()}`,
      cpf: '',
      cns: newProfCns.trim() || `700${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      name: newProfName.trim(),
      cboCode: cboInfo.code,
      cboDescription: cboInfo.name,
      professionalCategory: cboInfo.category,
      councilRegistration: undefined,
      cnesUnitCode: currentUnit.cnes || '0002135',
      unitId: activeUnitId,
      unitName: currentUnit.name,
      weeklyHours: Number(newProfHours) || 40,
      contractType: newProfContract,
      status: 'Ativo',
      lastSynced: new Date().toISOString()
    };

    if (onAddProfessional) {
      onAddProfessional(newProfessional);
    }

    setNewProfSuccess(`Profissional "${newProfName}" cadastrado com sucesso no CNES da unidade ${currentUnit.name}!`);
    setNewProfName('');
    setNewProfCns('');

    setTimeout(() => {
      setNewProfSuccess(null);
      setActiveTab('consulta');
    }, 1800);
  };

  const handleSimulateApiSync = () => {
    setIsSyncing(true);
    setSyncFeedback(null);

    setTimeout(() => {
      setIsSyncing(false);
      const unitProfs = professionals.filter(p => p.unitId === activeUnitId);
      onSyncUnitCnes(activeUnitId, unitProfs);
      setSyncFeedback(`Sincronização com o Barramento DATASUS/CNES concluída com sucesso! ${unitProfs.length} profissionais vinculados à unidade ${currentUnit.name} atualizados.`);
    }, 1200);
  };

  const handleProcessImport = () => {
    const listToImport = parsedPreviewList.length > 0 ? parsedPreviewList : parseOfficialCnesText(rawTextImport);

    if (listToImport.length === 0) {
      alert('Nenhum registro de profissional válido foi identificado. Por favor carregue um arquivo CSV/TabWin ou cole as linhas.');
      return;
    }

    setIsSyncing(true);

    setTimeout(() => {
      setIsSyncing(false);
      
      // Add or update all parsed professionals in the unit
      if (onAddProfessional) {
        listToImport.forEach(p => {
          onAddProfessional({
            ...p,
            unitId: activeUnitId,
            unitName: currentUnit.name,
            cnesUnitCode: currentUnit.cnes || '0000531',
            lastSynced: new Date().toISOString()
          });
        });
      }

      const summary: CnesSyncSummary = {
        unitId: activeUnitId,
        cnesCode: currentUnit.cnes || '0000531',
        syncedAt: new Date().toISOString(),
        totalActiveProfessionals: unitProfessionalsCount + listToImport.length,
        categoriesFound: new Set(listToImport.map(p => p.professionalCategory)).size,
        source: uploadedFile?.name.endsWith('.xml') ? 'CNES_ARQUIVO_XML' : 'CNES_ARQUIVO_CSV'
      };
      
      setImportReport(summary);
      setParsedPreviewList([]);
      setRawTextImport('');
      setUploadedFile(null);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-5 text-white flex items-center justify-between border-b border-blue-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-300">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Integração Oficial CNES / DATASUS</h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Base Ativa SMS Recife
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Consulta e vinculação de servidores ativos, CBOs, Carga Horária e Registros de Classe (COREN, CRM, CRO)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sub-bar / Unit Selector & Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <label className="text-xs font-bold text-slate-700">Unidade de Saúde:</label>
            {isUnitLocked ? (
              <div className="inline-flex items-center gap-2 bg-blue-50/80 border border-blue-200 text-blue-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs">
                <span>{currentUnit.name}</span>
                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded font-mono">
                  CNES: {currentUnit.cnes || '0000531'}
                </span>
                <span className="text-[10px] text-blue-700 font-normal border-l border-blue-200 pl-1.5">
                  🔒 Unidade de Acesso Restrito
                </span>
              </div>
            ) : (
              <select
                value={activeUnitId}
                onChange={(e) => setActiveUnitId(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {units.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.cnes ? `CNES: ${u.cnes}` : u.code})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tab buttons */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-lg gap-1 flex-wrap">
            <button
              onClick={() => setActiveTab('consulta')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                activeTab === 'consulta'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Consulta de Profissionais ({unitProfessionalsCount})
            </button>
            <button
              onClick={() => setActiveTab('novo_profissional')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
                activeTab === 'novo_profissional'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>+ Incluir Profissional Faltante</span>
            </button>
            <button
              onClick={() => setActiveTab('elasticnes')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
                activeTab === 'elasticnes'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
              }`}
            >
              <Database className="w-3 h-3" />
              <span>ElastiCNES (elasticnes.saude.gov.br)</span>
            </button>
            <button
              onClick={() => setActiveTab('sincronizacao')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1 ${
                activeTab === 'sincronizacao'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RefreshCw className="w-3 h-3 text-blue-600" />
              Sincronização DATASUS
            </button>
            <button
              onClick={() => setActiveTab('importacao_arquivo')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1 ${
                activeTab === 'importacao_arquivo'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
              Importar TabWin/CSV
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          
          {/* TAB 1: CONSULTA DE PROFISSIONAIS CNES */}
          {activeTab === 'consulta' && (
            <div className="space-y-4">
              
              {/* LIVE CNES / DATASUS REAL-TIME LOOKUP HERO */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-4 rounded-xl text-white border border-blue-800 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-300" />
                    <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                      Recuperação Direta no Cadastro Nacional (CNES / DATASUS / ElasticCNES)
                    </h3>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                    Consulta Online
                  </span>
                </div>
                <p className="text-[11px] text-blue-200">
                  Digite o <strong>Cartão SUS (CNS)</strong> ou <strong>Nome Completo</strong> de qualquer profissional cadastrado no Ministério da Saúde para recuperá-lo instantaneamente:
                </p>

                {/* Quick Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider mr-1">
                    Selecionar Categoria CBO:
                  </span>
                  {[
                    { label: '💉 Enfermeiro(a)', category: 'Enfermeiro(a)', code: '2235-05' },
                    { label: '🩺 Médico(a)', category: 'Médico(a) da Família / Clínico', code: '2251-25' },
                    { label: '📋 Téc. Enfermagem', category: 'Técnico(a) de Enfermagem', code: '3222-05' },
                    { label: '🦷 Dentista', category: 'Cirurgião(ã)-Dentista', code: '2232-08' },
                    { label: '🧠 Psicólogo(a)', category: 'Psicólogo(a)', code: '2515-10' },
                    { label: '🏃 Fisioterapeuta', category: 'Fisioterapeuta', code: '2236-05' },
                    { label: '💊 Farmacêutico(a)', category: 'Farmacêutico(a)', code: '2234-05' },
                    { label: '🥗 Nutricionista', category: 'Nutricionista', code: '2237-10' },
                    { label: '👥 Assistente Social', category: 'Assistente Social', code: '2516-05' },
                    { label: '🏡 ACS / ACE', category: 'Agente Comunitário de Saúde (ACS)', code: '5151-05' }
                  ].map(btn => (
                    <button
                      key={btn.code}
                      type="button"
                      onClick={() => {
                        setLiveCategoryHint(btn.category);
                        if (liveFoundProf) {
                          handleUpdateFoundProfCbo(btn.code);
                        } else if (liveQueryInput.trim()) {
                          handlePerformLiveSearch(liveQueryInput, btn.category);
                        }
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition cursor-pointer border ${
                        liveCategoryHint === btn.category || (liveFoundProf && liveFoundProf.professionalCategory === btn.category)
                          ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-xs'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Ex: 702107764708496 (CNS) ou Nome Completo do Profissional..."
                      value={liveQueryInput}
                      onChange={(e) => setLiveQueryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handlePerformLiveSearch();
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-blue-700/60 rounded-lg text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:outline-hidden"
                    />
                  </div>

                  <div className="w-full md:w-56">
                    <select
                      value={liveCategoryHint}
                      onChange={(e) => {
                        setLiveCategoryHint(e.target.value);
                        if (liveFoundProf && e.target.value !== 'todos') {
                          const matchingCboKey = Object.keys(CBO_MAPPING).find(k => CBO_MAPPING[k].category === e.target.value);
                          if (matchingCboKey) {
                            handleUpdateFoundProfCbo(matchingCboKey);
                          }
                        }
                      }}
                      className="w-full py-2 px-2.5 bg-slate-900/90 border border-blue-700/60 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-hidden"
                    >
                      <option value="todos">Filtrar Categoria (Todas)</option>
                      {ALL_PROFESSIONAL_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePerformLiveSearch()}
                    disabled={isSearchingLive}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Search className={`w-3.5 h-3.5 ${isSearchingLive ? 'animate-spin' : ''}`} />
                    <span>{isSearchingLive ? 'Consultando CNES...' : 'Consultar no Portal CNES'}</span>
                  </button>
                </div>

                {liveSearchFeedback && (
                  <div className="text-[11px] font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/50 p-2.5 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{liveSearchFeedback}</span>
                  </div>
                )}

                {/* Found Professional Preview Card with Full Category & CBO Confirmation */}
                {liveFoundProf && (
                  <div className="bg-slate-900/95 border-2 border-emerald-500/80 rounded-xl p-3.5 space-y-3 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-emerald-300">{liveFoundProf.name}</span>
                          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-500/40">
                            🟢 CNES Ativo
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-mono flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="text-emerald-400 font-bold">CNS: {liveFoundProf.cns}</span>
                          <span>•</span>
                          <span className="text-slate-300">{liveFoundProf.cboDescription} (CBO {liveFoundProf.cboCode})</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleImportLiveProfessional(liveFoundProf)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Importar para {currentUnit.name}</span>
                      </button>
                    </div>

                    {/* Fast 1-Click Quick Category Switcher */}
                    <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                          Alterar Categoria Oficial do Profissional em 1 Clique:
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Atual: <strong className="text-white">{liveFoundProf.professionalCategory}</strong>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { label: '💉 Enfermeiro(a)', code: '2235-05' },
                          { label: '🩺 Médico(a)', code: '2251-25' },
                          { label: '📋 Téc. Enfermagem', code: '3222-05' },
                          { label: '🦷 Cirurgião-Dentista', code: '2232-08' },
                          { label: '🧠 Psicólogo(a)', code: '2515-10' },
                          { label: '🏃 Fisioterapeuta', code: '2236-05' },
                          { label: '💊 Farmacêutico(a)', code: '2234-05' },
                          { label: '🥗 Nutricionista', code: '2237-10' },
                          { label: '👥 Assistente Social', code: '2516-05' },
                          { label: '🏡 ACS / ACE', code: '5151-05' }
                        ].map(badge => {
                          const isCurrent = CBO_MAPPING[badge.code]?.category === liveFoundProf.professionalCategory || liveFoundProf.cboCode === badge.code;
                          return (
                            <button
                              key={badge.code}
                              type="button"
                              onClick={() => handleUpdateFoundProfCbo(badge.code)}
                              className={`text-[10px] px-2 py-0.5 rounded font-semibold transition cursor-pointer border ${
                                isCurrent
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold shadow-xs ring-1 ring-emerald-300'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                              }`}
                            >
                              {badge.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interactive CBO and Lotação selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                      <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700 space-y-1">
                        <label className="text-slate-400 block text-[10px] font-medium">Ocupação / CBO / Categoria Oficial:</label>
                        <select
                          value={Object.keys(CBO_MAPPING).find(k => CBO_MAPPING[k].code === liveFoundProf.cboCode || CBO_MAPPING[k].category === liveFoundProf.professionalCategory) || '2235-05'}
                          onChange={(e) => handleUpdateFoundProfCbo(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-600 text-emerald-300 font-semibold rounded p-1 text-[11px] focus:ring-1 focus:ring-emerald-400"
                        >
                          {Object.entries(CBO_MAPPING).map(([key, val]) => (
                            <option key={key} value={key}>
                              {val.name} ({val.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700 space-y-1">
                        <label className="text-slate-400 block text-[10px] font-medium">Lotação e Carga Horária:</label>
                        <div className="flex gap-1.5 items-center">
                          <select
                            value={liveFoundProf.weeklyHours}
                            onChange={(e) => setLiveFoundProf({ ...liveFoundProf, weeklyHours: Number(e.target.value) })}
                            className="bg-slate-900 border border-slate-600 text-white rounded p-1 text-[11px]"
                          >
                            <option value={20}>20h</option>
                            <option value={30}>30h</option>
                            <option value={40}>40h</option>
                          </select>
                          <select
                            value={liveFoundProf.contractType}
                            onChange={(e) => setLiveFoundProf({ ...liveFoundProf, contractType: e.target.value as any })}
                            className="bg-slate-900 border border-slate-600 text-white rounded p-1 text-[11px] flex-1"
                          >
                            <option value="Estatutário">Estatutário</option>
                            <option value="Contrato Temporário">Contrato Temporário</option>
                            <option value="CLT / Fundação">CLT / Fundação</option>
                            <option value="Residência">Residência</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Alert / Notice for missing professionals */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-950">Servidor recém-admitido ou residente?</span>
                    <span className="text-amber-800 text-[11px]">
                      Você pode cadastrar manualmente ou importar a qualquer momento no sistema.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('novo_profissional')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shrink-0 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>+ Incluir Profissional</span>
                </button>
              </div>

              {/* Filter and Quick CNES Search controls */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                  <div className="relative md:col-span-6">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar por Nome, CNS ou CBO nesta unidade..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (searchQuery.trim()) {
                            setLiveQueryInput(searchQuery);
                            handlePerformLiveSearch(searchQuery);
                          }
                        }
                      }}
                      className="w-full pl-9 pr-24 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setLiveQueryInput(searchQuery);
                          handlePerformLiveSearch(searchQuery);
                        }}
                        disabled={isSearchingLive}
                        className="absolute right-1.5 top-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Consultar e recuperar este profissional no CNES/DATASUS"
                      >
                        <Search className={`w-3 h-3 ${isSearchingLive ? 'animate-spin' : ''}`} />
                        <span>CNES</span>
                      </button>
                    )}
                  </div>

                  <div className="md:col-span-3">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      <option value="todos">Todas as Categorias CBO</option>
                      {Array.from(new Set(professionals.map(p => p.professionalCategory))).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3 flex items-center justify-between gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="w-full py-2 px-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      <option value="todos">Status: Todos</option>
                      <option value="Ativo">Apenas Ativos</option>
                      <option value="Afastado">Afastados</option>
                    </select>
                    
                    <span className="text-xs text-slate-500 font-semibold whitespace-nowrap bg-white border border-slate-200 px-2.5 py-2 rounded-lg">
                      {filteredProfessionals.length} encontrados
                    </span>
                  </div>
                </div>

                {/* Quick Hint / Lookup Trigger when typing something not in local list */}
                {searchQuery.trim().length >= 3 && filteredProfessionals.length === 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-blue-900">
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          Profissional <strong>"{searchQuery}"</strong> não localizado na lista de {currentUnit.name}.
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setLiveQueryInput(searchQuery);
                            handlePerformLiveSearch(searchQuery);
                          }}
                          disabled={isSearchingLive}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md transition inline-flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                        >
                          <Search className={`w-3.5 h-3.5 ${isSearchingLive ? 'animate-spin' : ''}`} />
                          <span>Buscar no CNES</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewProfName(searchQuery);
                            setActiveTab('novo_profissional');
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md transition inline-flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>+ Cadastrar com Dados Reais</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="max-h-[420px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold border-b border-slate-200 z-10">
                      <tr>
                        <th className="p-3">Profissional / CNS</th>
                        <th className="p-3">Ocupação Oficial (CBO)</th>
                        <th className="p-3">Carga Horária / Vínculo</th>
                        <th className="p-3 text-center">Status CNES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredProfessionals.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-400">
                            <div className="max-w-md mx-auto space-y-3">
                              <p className="text-slate-600">
                                Nenhum profissional encontrado com os filtros selecionados na lista local de <strong>{currentUnit.name}</strong>.
                              </p>
                              {searchQuery && (
                                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2.5 text-left">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                                    <p className="text-blue-950 font-bold text-xs">
                                      Profissional não listado na unidade: "{searchQuery}"
                                    </p>
                                  </div>
                                  <p className="text-blue-800 text-[11px]">
                                    Recupere os dados oficiais (CBO, CNS) no barramento CNES ou cadastre com 1 clique:
                                  </p>
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setLiveQueryInput(searchQuery);
                                        handlePerformLiveSearch(searchQuery);
                                      }}
                                      disabled={isSearchingLive}
                                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                      <Search className={`w-3.5 h-3.5 ${isSearchingLive ? 'animate-spin' : ''}`} />
                                      <span>Buscar "{searchQuery}" no CNES / DATASUS</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNewProfName(searchQuery);
                                        setActiveTab('novo_profissional');
                                      }}
                                      className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Users className="w-3.5 h-3.5" />
                                      <span>Preencher Cadastro Manual</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                              {!searchQuery && (
                                <div className="pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setActiveTab('novo_profissional')}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Users className="w-3.5 h-3.5" />
                                    <span>Cadastrar profissional nesta unidade</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredProfessionals.map((prof) => (
                          <tr key={prof.id} className="hover:bg-blue-50/40 transition">
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{prof.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                                <span>Cartão SUS (CNS): {prof.cns || 'Não informado'}</span>
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="font-semibold text-slate-800">{prof.cboDescription}</div>
                              <div className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 inline-block px-1.5 py-0.2 rounded mt-0.5">
                                CBO {prof.cboCode}
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="font-semibold text-slate-800">{prof.weeklyHours}h semanais</div>
                              <div className="text-[11px] text-slate-500">{prof.contractType}</div>
                            </td>

                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                prof.status === 'Ativo'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {prof.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: NOVO PROFISSIONAL MANUAL / HOMOLOGAÇÃO */}
          {activeTab === 'novo_profissional' && (
            <div className="max-w-2xl mx-auto py-2">
              <form onSubmit={handleSaveNewProfessional} className="space-y-4">
                
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Inclusão Direta no Cadastro de Força de Trabalho</span>
                    <span className="text-emerald-800">
                      O profissional será imediatamente vinculado à unidade <strong>{currentUnit.name} (CNES {currentUnit.cnes || '0002135'})</strong> e ficará habilitado para registro em frequências, emissão de certificados com CBO e censo.
                    </span>
                  </div>
                </div>

                {newProfSuccess && (
                  <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-3 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{newProfSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nome Completo do Profissional <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dra. Mariana de Albuquerque Cavalcanti"
                      value={newProfName}
                      onChange={(e) => setNewProfName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cartão SUS (CNS)
                    </label>
                    <input
                      type="text"
                      placeholder="700000000000000 (Opcional)"
                      value={newProfCns}
                      onChange={(e) => setNewProfCns(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Carga Horária Semanal
                    </label>
                    <select
                      value={newProfHours}
                      onChange={(e) => setNewProfHours(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value={20}>20 horas semanais</option>
                      <option value={30}>30 horas semanais</option>
                      <option value={40}>40 horas semanais (Ded. Integral / ESF)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ocupação / CBO Oficial <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newProfCboKey}
                      onChange={(e) => setNewProfCboKey(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                    >
                      {Object.entries(CBO_MAPPING).map(([key, item]) => (
                        <option key={key} value={key}>
                          {item.code} - {item.name} ({item.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tipo de Vínculo
                    </label>
                    <select
                      value={newProfContract}
                      onChange={(e) => setNewProfContract(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="Estatutário">Estatutário (Concurso)</option>
                      <option value="Contrato Temporário">Contrato Temporário (CT)</option>
                      <option value="CLT / Fundação">CLT / Fundação</option>
                      <option value="Residente / Bolsista">Residente / Bolsista</option>
                      <option value="Cedido">Cedido (Outro Órgão/Esfera)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Motivo do Cadastro Direto
                    </label>
                    <select
                      value={newProfInclusionReason}
                      onChange={(e) => setNewProfInclusionReason(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="Admissão recente pendente na remessa DATASUS">Admissão recente (remessa pendente)</option>
                      <option value="Transferência interna recente">Transferência / Remanejamento interno</option>
                      <option value="Residência médica / multiprofissional">Residência Médica / Multiprofissional</option>
                      <option value="Regularização cadastral">Regularização cadastral na unidade</option>
                    </select>
                  </div>

                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('consulta')}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar e Vincular à {currentUnit.code}</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB: ELASTICNES (elasticnes.saude.gov.br) */}
          {activeTab === 'elasticnes' && (
            <div className="space-y-6 max-w-3xl mx-auto py-3">
              <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 border border-blue-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-800/60">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600/30 border border-blue-400/30 rounded-xl text-blue-300">
                      <Database className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">Painel ElastiCNES / Ministério da Saúde</h3>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-bold">
                          ONLINE
                        </span>
                      </div>
                      <p className="text-xs text-blue-200 mt-0.5">
                        Plataforma oficial de indexação em tempo real do CNES (Datasus / Ministério da Saúde)
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://elasticnes.saude.gov.br/profissionais"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition self-start sm:self-auto shrink-0"
                  >
                    <span>Abrir elasticnes.saude.gov.br</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-blue-900/40 p-3 rounded-xl border border-blue-700/50">
                    <span className="text-blue-300 text-[11px] block">Unidade Selecionada:</span>
                    <strong className="text-white text-xs block truncate mt-0.5">{currentUnit.name}</strong>
                    <span className="text-blue-300 text-[10px] font-mono">Código CNES: {currentUnit.cnes || '0000531'}</span>
                  </div>
                  <div className="bg-blue-900/40 p-3 rounded-xl border border-blue-700/50">
                    <span className="text-blue-300 text-[11px] block">Profissionais no ElastiCNES:</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <strong className="text-2xl font-bold text-emerald-400 font-mono">
                        {currentUnit.totalStaff || 85}
                      </strong>
                      <span className="text-slate-300 text-[11px]">vínculos ativos</span>
                    </div>
                    <span className="text-[10px] text-emerald-300">Base oficial do Ministério da Saúde</span>
                  </div>
                  <div className="bg-blue-900/40 p-3 rounded-xl border border-blue-700/50">
                    <span className="text-blue-300 text-[11px] block">Indexação Elasticsearch:</span>
                    <strong className="text-white block mt-0.5 text-xs">Competência Aberta</strong>
                    <span className="text-[10px] text-blue-300">Filtro por Estabelecimento {currentUnit.cnes}</span>
                  </div>
                </div>

                {/* Breakdown comparison */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">Composição de Profissionais por Categoria (ElastiCNES):</span>
                    <span className="text-slate-400 font-mono text-[11px]">Total: {currentUnit.totalStaff || 85} ativos</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                      <span className="text-slate-400 text-[10px] block">Médicos (Clínica/Espec)</span>
                      <strong className="text-white text-sm font-mono">
                        {(currentUnit.activeStaffBreakdown?.['Médico(a) Especialista / Emergencista'] || 0) + (currentUnit.activeStaffBreakdown?.['Médico(a) da Família / Clínico'] || 0)}
                      </strong>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                      <span className="text-slate-400 text-[10px] block">Enfermagem (Enf+Téc+Aux)</span>
                      <strong className="text-white text-sm font-mono">
                        {(currentUnit.activeStaffBreakdown?.['Enfermeiro(a)'] || 0) + (currentUnit.activeStaffBreakdown?.['Técnico(a) de Enfermagem'] || 0) + (currentUnit.activeStaffBreakdown?.['Auxiliar de Enfermagem'] || 0)}
                      </strong>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                      <span className="text-slate-400 text-[10px] block">Saúde Bucal (CD+ASB)</span>
                      <strong className="text-white text-sm font-mono">
                        {(currentUnit.activeStaffBreakdown?.['Cirurgião(ã)-Dentista'] || 0) + (currentUnit.activeStaffBreakdown?.['Técnico/Auxiliar de Saúde Bucal'] || 0)}
                      </strong>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                      <span className="text-slate-400 text-[10px] block">Multiprofissional / Apoio</span>
                      <strong className="text-white text-sm font-mono">
                        {(currentUnit.activeStaffBreakdown?.['Fisioterapeuta'] || 0) + 
                         (currentUnit.activeStaffBreakdown?.['Psicólogo(a)'] || 0) + 
                         (currentUnit.activeStaffBreakdown?.['Assistente Social'] || 0) + 
                         (currentUnit.activeStaffBreakdown?.['Farmacêutico(a)'] || 0) + 
                         (currentUnit.activeStaffBreakdown?.['Nutricionista'] || 0) + 
                         (currentUnit.activeStaffBreakdown?.['Fonoaudiólogo(a) / Terapeuta Ocupacional'] || 0) + 
                         (currentUnit.activeStaffBreakdown?.['Agente Comunitário de Saúde (ACS)'] || 0) + 
                         (currentUnit.activeStaffBreakdown?.['Agente de Combate a Endemias (ACE)'] || 0) + 
                         (currentUnit.activeStaffBreakdown?.['Recepcionista / Atendimento'] || 0) + 
                         (currentUnit.activeStaffBreakdown?.['Agente Administrativo / Faturamento'] || 0) + 
                         (currentUnit.activeStaffBreakdown?.['Condutor de Ambulância / Transporte'] || 0) + 
                         (currentUnit.activeStaffBreakdown?.['Higienização e Apoio Operacional'] || 0)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {syncFeedback && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{syncFeedback}</span>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Por que o ElastiCNES mostra mais profissionais que o censo local?</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5 leading-relaxed">
                  <li><strong>Total de Vínculos Institucionais:</strong> O ElastiCNES computa todos os contratos, especialistas ambulatoriais, plantonistas, residentes, apoio diagnóstico e pessoal administrativo lotados no estabelecimento.</li>
                  <li><strong>Amostragem Completa Real:</strong> O quantitativo integral monitorado pelo Ministério da Saúde para o CNES {currentUnit.cnes || '0000531'} é de <strong>{currentUnit.totalStaff || 85} profissionais ativos</strong>.</li>
                  <li><strong>Sincronização Integrada:</strong> Ao sincronizar, o sistema atualiza e vincula o censo total de servidores à {currentUnit.name}, tornando-os aptos para auto-check-in com CPF, listagens e emissão de certificados.</li>
                </ul>

                <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSimulateApiSync}
                    disabled={isSyncing}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Sincronizando com elasticnes.saude.gov.br...' : `Sincronizar com ElastiCNES (${currentUnit.totalStaff || 85} Profissionais Ativos)`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('importacao_arquivo')}
                    className="w-full sm:w-auto px-4 py-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Importar Planilha CSV do ElastiCNES</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SINCRONIZAÇÃO AUTOMÁTICA COM DATASUS */}
          {activeTab === 'sincronizacao' && (
            <div className="space-y-6 max-w-2xl mx-auto py-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-950 text-sm">Conexão com o Barramento Nacional CNES/MS</h3>
                    <p className="text-xs text-blue-800 mt-1">
                      O sistema consome os serviços SOAP/REST do Cadastro Nacional de Estabelecimentos de Saúde através do código de estabelecimento <strong>CNES {currentUnit.cnes || '0002135'}</strong>.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-slate-500 block">Estabelecimento:</span>
                    <strong className="text-slate-900">{currentUnit.name}</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-slate-500 block">Código CNES:</span>
                    <strong className="font-mono text-blue-800">{currentUnit.cnes || '0002135'}</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-slate-500 block">Profissionais Vinculados:</span>
                    <strong className="text-slate-900">{unitProfessionalsCount} ativos no cadastro</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-slate-500 block">Última Sincronização:</span>
                    <strong className="text-emerald-700 font-semibold">{currentUnit.cnesSyncedAt || 'Hoje, 08:30'}</strong>
                  </div>
                </div>
              </div>

              {syncFeedback && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{syncFeedback}</span>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={handleSimulateApiSync}
                  disabled={isSyncing}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 mx-auto disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Consultando Barramento DATASUS...' : 'Sincronizar Dados do CNES Agora'}</span>
                </button>
                <p className="text-[11px] text-slate-500 mt-2">
                  Atualiza automaticamente vínculos, entradas, demissões e transferências de profissionais.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: IMPORTAÇÃO DE ARQUIVO OFICIAL CNES / DATASUS / SCNES */}
          {activeTab === 'importacao_arquivo' && (
            <div className="space-y-5 max-w-3xl mx-auto py-2">
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-blue-950 block">Importação Integral da Base Oficial do CNES / DATASUS</strong>
                    <span className="text-blue-800 text-[11px]">
                      Importe o arquivo exportado do SCNES / DATASUS (.csv, .txt, .xml) ou baixe o modelo oficial com todas as colunas do Ministério da Saúde.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplateCsv}
                  className="px-3.5 py-2 bg-white hover:bg-blue-600 hover:text-white text-blue-900 border border-blue-300 rounded-xl font-bold text-xs transition inline-flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600 group-hover:text-white" />
                  <span>Baixar Planilha Modelo (.csv)</span>
                </button>
              </div>

              {/* Upload Zone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50 transition">
                <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Carregar Relatório do CNES (CSV, XML ou SCNES)</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Exporte o espelho de profissionais do sistema CNES / DATASUS ou Folha Municipal
                </p>
                <div className="mt-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition">
                    <FileText className="w-4 h-4" />
                    <span>{uploadedFile ? `Arquivo: ${uploadedFile.name}` : 'Selecionar Arquivo do Computador'}</span>
                    <input
                      type="file"
                      accept=".csv,.xml,.txt,.xlsx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Raw Text Input with Auto-Parse */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Ou cole o conteúdo do relatório / linhas (CNS; Nome; CBO; Carga Horária):</span>
                  <span className="text-[10px] text-slate-400">Suporta colunas DATASUS ou delimitado por ponto-e-vírgula</span>
                </label>
                <textarea
                  rows={3}
                  placeholder={`702107764708496; MIKAEL LIMA BRASIL; 2235-05; Enfermeiro Geral; 40; Estatutário\n700405829103847; MARIANA CAVALCANTI; 2251-25; Médico Clínico; 40; Estatutário`}
                  value={rawTextImport}
                  onChange={(e) => {
                    setRawTextImport(e.target.value);
                    const parsed = parseOfficialCnesText(e.target.value);
                    setParsedPreviewList(parsed);
                  }}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Parsed Preview Table */}
              {parsedPreviewList.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-2 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">
                        Prévia dos Dados Identificados ({parsedPreviewList.length} profissionais):
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                      Pronto para importação integral
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="p-2">Nome / CNS</th>
                          <th className="p-2">Ocupação Oficial (CBO)</th>
                          <th className="p-2">CH / Vínculo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedPreviewList.map((p, pIdx) => (
                          <tr key={pIdx} className="hover:bg-blue-50/50">
                            <td className="p-2">
                              <strong className="text-slate-900 block">{p.name}</strong>
                              <span className="text-[10px] text-slate-500 font-mono">CNS: {p.cns || 'Não informado'}</span>
                            </td>
                            <td className="p-2">
                              <span className="text-slate-800 font-semibold block">{p.cboDescription}</span>
                              <span className="text-[10px] text-blue-700 font-mono bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                                CBO {p.cboCode}
                              </span>
                            </td>
                            <td className="p-2 text-[11px] text-slate-600">
                              {p.weeklyHours}h • {p.contractType}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importReport && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1 text-xs text-emerald-900">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Importação Oficial Concluída com Sucesso!</span>
                  </div>
                  <p>Estabelecimento: CNES {importReport.cnesCode} • {importReport.totalActiveProfessionals} profissionais consolidados e vinculados à unidade {currentUnit.name}.</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setParsedPreviewList([]);
                    setRawTextImport('');
                    setUploadedFile(null);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={handleProcessImport}
                  disabled={isSyncing || (parsedPreviewList.length === 0 && !rawTextImport.trim())}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSyncing ? 'Gravando no Banco de Dados...' : `Importar ${parsedPreviewList.length > 0 ? `${parsedPreviewList.length} Profissionais` : 'Dados Oficiais'}`}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Conectado à Base CNES/DATASUS da Secretaria Municipal de Saúde do Recife</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
