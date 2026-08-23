import React, { useState } from 'react';
import { HealthUnit, CnesProfessional, CnesSyncSummary, ProfessionalCategory } from '../types';
import { CBO_MAPPING } from '../data/cnesDatabase';
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
  Filter
} from 'lucide-react';

interface CnesIntegrationModalProps {
  units: HealthUnit[];
  selectedUnitId?: string;
  professionals: CnesProfessional[];
  onClose: () => void;
  onSyncUnitCnes: (unitId: string, syncedProfessionals: CnesProfessional[]) => void;
  onAddProfessional?: (newProf: CnesProfessional) => void;
}

export const CnesIntegrationModal: React.FC<CnesIntegrationModalProps> = ({
  units,
  selectedUnitId,
  professionals,
  onClose,
  onSyncUnitCnes,
  onAddProfessional
}) => {
  const [activeUnitId, setActiveUnitId] = useState<string>(selectedUnitId || units[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'consulta' | 'novo_profissional' | 'sincronizacao' | 'importacao_arquivo'>('consulta');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'Ativo' | 'Afastado' | 'Licença'>('todos');
  
  // New Professional Form State
  const [newProfName, setNewProfName] = useState('');
  const [newProfCpf, setNewProfCpf] = useState('');
  const [newProfCns, setNewProfCns] = useState('');
  const [newProfCboKey, setNewProfCboKey] = useState<string>('2235-05');
  const [newProfCouncil, setNewProfCouncil] = useState('');
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
  const [importReport, setImportReport] = useState<CnesSyncSummary | null>(null);

  const currentUnit = units.find(u => u.id === activeUnitId) || units[0];

  // Professionals for this unit or all
  const filteredProfessionals = professionals.filter(p => {
    const matchesUnit = !activeUnitId || p.unitId === activeUnitId;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cpf.includes(searchQuery) ||
      p.cns.includes(searchQuery) ||
      (p.councilRegistration && p.councilRegistration.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.cboCode.includes(searchQuery);
    
    const matchesCategory = categoryFilter === 'todos' || p.professionalCategory === categoryFilter;
    const matchesStatus = statusFilter === 'todos' || p.status === statusFilter;

    return matchesUnit && matchesSearch && matchesCategory && matchesStatus;
  });

  const unitProfessionalsCount = professionals.filter(p => p.unitId === activeUnitId).length;

  const handleSaveNewProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfName.trim() || !newProfCpf.trim()) {
      alert('Por favor informe o Nome Completo e CPF do profissional.');
      return;
    }

    const cboInfo = CBO_MAPPING[newProfCboKey] || {
      code: newProfCboKey,
      name: 'Profissional de Saúde',
      category: 'Enfermeiro(a)'
    };

    const newProfessional: CnesProfessional = {
      id: `cnes-prof-manual-${Date.now()}`,
      cpf: newProfCpf.trim(),
      cns: newProfCns.trim() || `700${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      name: newProfName.trim(),
      cboCode: cboInfo.code,
      cboDescription: cboInfo.name,
      professionalCategory: cboInfo.category,
      councilRegistration: newProfCouncil.trim() || undefined,
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
    setNewProfCpf('');
    setNewProfCns('');
    setNewProfCouncil('');

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
    if (!rawTextImport.trim() && !uploadedFile) {
      alert('Por favor cole os dados no formato CSV/TabWin ou carregue o arquivo do CNES.');
      return;
    }

    setIsSyncing(true);

    setTimeout(() => {
      setIsSyncing(false);
      const summary: CnesSyncSummary = {
        unitId: activeUnitId,
        cnesCode: currentUnit.cnes || '0002135',
        syncedAt: new Date().toISOString(),
        totalActiveProfessionals: unitProfessionalsCount || 48,
        categoriesFound: 8,
        source: uploadedFile?.name.endsWith('.xml') ? 'CNES_ARQUIVO_XML' : 'CNES_ARQUIVO_CSV'
      };
      setImportReport(summary);
      onSyncUnitCnes(activeUnitId, professionals.filter(p => p.unitId === activeUnitId));
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
              
              {/* Alert / Notice for missing professionals */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-950">Profissional não encontrado no espelho do CNES?</span>
                    <span className="text-amber-800 text-[11px]">
                      Admissões recentes, servidores cedidos ou residentes podem não constar no último fechamento DATASUS. Você pode cadastrar o profissional diretamente com declaração de vínculo.
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

              {/* Filter controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar por Nome, CPF, CNS, CBO ou Conselho..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="todos">Todas as Categorias CBO</option>
                    {Array.from(new Set(professionals.map(p => p.professionalCategory))).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="todos">Status Vínculo: Todos</option>
                    <option value="Ativo">Apenas Ativos no CNES</option>
                    <option value="Afastado">Afastados / Licença</option>
                  </select>
                  
                  <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
                    {filteredProfessionals.length} encontrados
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="max-h-[420px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold border-b border-slate-200 z-10">
                      <tr>
                        <th className="p-3">Profissional / CPF / CNS</th>
                        <th className="p-3">Ocupação Oficial (CBO)</th>
                        <th className="p-3">Conselho de Classe</th>
                        <th className="p-3">Carga Horária / Vínculo</th>
                        <th className="p-3 text-center">Status CNES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredProfessionals.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400">
                            <div className="max-w-md mx-auto space-y-2">
                              <p>Nenhum profissional encontrado com os filtros selecionados na unidade <strong>{currentUnit.name}</strong>.</p>
                              <button
                                type="button"
                                onClick={() => setActiveTab('novo_profissional')}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition inline-flex items-center gap-1.5 mt-2 cursor-pointer"
                              >
                                <Users className="w-3.5 h-3.5" />
                                <span>Cadastrar profissional nesta unidade</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredProfessionals.map((prof) => (
                          <tr key={prof.id} className="hover:bg-blue-50/40 transition">
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{prof.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                                <span>CPF: {prof.cpf}</span>
                                <span>•</span>
                                <span>CNS: {prof.cns}</span>
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="font-semibold text-slate-800">{prof.cboDescription}</div>
                              <div className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 inline-block px-1.5 py-0.2 rounded mt-0.5">
                                CBO {prof.cboCode}
                              </div>
                            </td>

                            <td className="p-3">
                              {prof.councilRegistration ? (
                                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                                  {prof.councilRegistration}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">Não exigido</span>
                              )}
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
                      CPF <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={newProfCpf}
                      onChange={(e) => setNewProfCpf(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
                      Registro de Classe / Conselho
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: CRM-PE 24510, COREN-PE 142055"
                      value={newProfCouncil}
                      onChange={(e) => setNewProfCouncil(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
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
                      <option value="Regularização cadastral de CPF/CNS">Regularização cadastral CPF/CNS</option>
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

          {/* TAB 3: IMPORTAÇÃO DE ARQUIVO TABWIN / CSV */}
          {activeTab === 'importacao_arquivo' && (
            <div className="space-y-5 max-w-2xl mx-auto py-2">
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50 transition cursor-pointer">
                <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Carregar Relatório do CNES (CSV, XML ou TabWin)</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Exporte o espelho de profissionais do sistema CNES / DATASUS ou Folha Municipal
                </p>
                <input
                  type="file"
                  accept=".csv,.xml,.txt,.xlsx"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                  className="mt-3 text-xs text-slate-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Ou cole as linhas de profissionais (CPF; Nome; CBO; Carga Horária):</span>
                  <span className="text-[10px] text-slate-400">Ex: 12345678900; Maria Silva; 2235-05; 40</span>
                </label>
                <textarea
                  rows={4}
                  placeholder={`123.456.789-00; Maria Silva; Enfermeiro Geral (2235-05); COREN-PE 123456; 40h\n987.654.321-99; Carlos Lima; Medico Clinico (2251-25); CRM-PE 45678; 20h`}
                  value={rawTextImport}
                  onChange={(e) => setRawTextImport(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {importReport && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1 text-xs text-emerald-900">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Importação processada com sucesso!</span>
                  </div>
                  <p>CNES: {importReport.cnesCode} • {importReport.totalActiveProfessionals} profissionais ativos consolidados.</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleProcessImport}
                  disabled={isSyncing}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Processar e Atualizar Base CNES</span>
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
