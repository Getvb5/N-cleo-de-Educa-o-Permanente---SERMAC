import React, { useState, useEffect, useRef } from 'react';
import { 
  UserRole, 
  HealthUnit, 
  TrainingAction, 
  AttendanceRecord, 
  TrainingNeedDNC, 
  UnitStaffCensus, 
  FeedbackData, 
  AuthUser, 
  CnesProfessional 
} from './types';
import { 
  getStoredHealthUnits, 
  saveStoredUnits,
  getStoredTrainingActions, 
  saveStoredTrainingActions,
  getStoredAttendance, 
  saveStoredAttendance,
  getStoredDNC,
  saveStoredDNC,
  loadStoredCensus,
  saveStoredCensus,
  loadStoredUser,
  saveStoredUser,
  INITIAL_HEALTH_UNITS
} from './data/mockData';
import { 
  subscribeHealthUnits,
  subscribeTrainingActions,
  subscribeAttendanceRecords,
  subscribeLntNeeds,
  subscribeUnitCensus,
  saveHealthUnitToCloud,
  saveTrainingActionToCloud,
  deleteTrainingActionFromCloud,
  saveAttendanceRecordToCloud,
  saveLntNeedToCloud,
  updateLntStatusInCloud,
  deleteLntNeedFromCloud,
  saveCensusRecordToCloud,
  seedCloudDatabaseIfEmpty
} from './lib/firestoreService';
import { generateMockCnesDatabase } from './data/cnesDatabase';
import { Sidebar, Header } from './components/Navbar';
import { CentralSermacDashboard } from './components/CentralSermacDashboard';
import { NepsUnitDashboard } from './components/NepsUnitDashboard';
import { ParticipantPortal } from './components/ParticipantPortal';
import { NewActionModal } from './components/NewActionModal';
import { TrainingDetailsModal } from './components/TrainingDetailsModal';
import { CertificateModal } from './components/CertificateModal';
import { AiDiagnosisModal } from './components/AiDiagnosisModal';
import { PaepsPlanModal } from './components/PaepsPlanModal';
import { WorkforceCensusModal } from './components/WorkforceCensusModal';
import { CancelActionModal } from './components/CancelActionModal';
import { CnesIntegrationModal } from './components/CnesIntegrationModal';
import { AuthScreen } from './components/AuthScreen';
import { signOutGoogle } from './lib/firebase';

export default function App() {
  // Authentication & Role State
  const initialUser = loadStoredUser();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(initialUser);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(initialUser !== null);
  const [currentRole, setCurrentRole] = useState<UserRole>(initialUser?.role || 'SERMAC_CENTRAL');
  
  const [units, setUnits] = useState<HealthUnit[]>(() => getStoredHealthUnits());
  const [selectedUnitId, setSelectedUnitId] = useState<string>(() => initialUser?.unitId || units[0]?.id || 'unit-1');

  // Core Data State (Loaded locally & synchronized live with Cloud Firestore)
  const [actions, setActions] = useState<TrainingAction[]>(() => getStoredTrainingActions());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getStoredAttendance());
  const [dncList, setDncList] = useState<TrainingNeedDNC[]>(() => getStoredDNC());
  const [censusList, setCensusList] = useState<UnitStaffCensus[]>(() => loadStoredCensus());
  
  // CNES Database State
  const [cnesProfessionals, setCnesProfessionals] = useState<CnesProfessional[]>(() => {
    const stored = localStorage.getItem('eps_cnes_professionals_v4');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 5000) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    const generated = generateMockCnesDatabase(INITIAL_HEALTH_UNITS);
    try {
      localStorage.setItem('eps_cnes_professionals_v4', JSON.stringify(generated));
    } catch (e) {}
    return generated;
  });

  // Modal States
  const [isNewActionOpen, setIsNewActionOpen] = useState(false);
  const [actionToEdit, setActionToEdit] = useState<TrainingAction | null>(null);
  const [isAiDiagnosisOpen, setIsAiDiagnosisOpen] = useState(false);
  const [isPaepsPlanOpen, setIsPaepsPlanOpen] = useState(false);
  const [selectedActionDetails, setSelectedActionDetails] = useState<TrainingAction | null>(null);
  const [selectedCertificateRecord, setSelectedCertificateRecord] = useState<AttendanceRecord | null>(null);
  const [selectedCensusUnit, setSelectedCensusUnit] = useState<HealthUnit | null>(null);
  const [selectedActionToCancel, setSelectedActionToCancel] = useState<TrainingAction | null>(null);
  const [isCnesModalOpen, setIsCnesModalOpen] = useState(false);
  const [cnesTargetUnitId, setCnesTargetUnitId] = useState<string | undefined>(undefined);

  const initialCloudSyncDone = useRef(false);

  // ----------------------------------------------------
  // Cloud Firestore Real-Time Subscriptions & Initialization
  // ----------------------------------------------------
  useEffect(() => {
    let unsubscribeUnits: () => void = () => {};
    let unsubscribeActions: () => void = () => {};
    let unsubscribeAttendance: () => void = () => {};
    let unsubscribeLnt: () => void = () => {};
    let unsubscribeCensus: () => void = () => {};

    const initCloud = async () => {
      try {
        if (!initialCloudSyncDone.current) {
          initialCloudSyncDone.current = true;
          await seedCloudDatabaseIfEmpty(
            getStoredHealthUnits(),
            getStoredTrainingActions(),
            getStoredAttendance(),
            getStoredDNC(),
            loadStoredCensus()
          );
        }

        unsubscribeUnits = subscribeHealthUnits((cloudUnits) => {
          if (cloudUnits && cloudUnits.length > 0) {
            setUnits(cloudUnits);
          }
        });

        unsubscribeActions = subscribeTrainingActions((cloudActions) => {
          if (cloudActions) {
            setActions(cloudActions);
          }
        });

        unsubscribeAttendance = subscribeAttendanceRecords((cloudAttendance) => {
          if (cloudAttendance) {
            setAttendance(cloudAttendance);
          }
        });

        unsubscribeLnt = subscribeLntNeeds((cloudLnt) => {
          if (cloudLnt) {
            setDncList(cloudLnt);
          }
        });

        unsubscribeCensus = subscribeUnitCensus((cloudCensus) => {
          if (cloudCensus) {
            setCensusList(cloudCensus);
          }
        });
      } catch (err) {
        console.warn('Firestore cloud sync connection notice:', err);
      }
    };

    initCloud();

    return () => {
      unsubscribeUnits();
      unsubscribeActions();
      unsubscribeAttendance();
      unsubscribeLnt();
      unsubscribeCensus();
    };
  }, []);

  // Sync to LocalStorage as resilient cache
  useEffect(() => {
    try {
      localStorage.setItem('eps_cnes_professionals_v4', JSON.stringify(cnesProfessionals));
    } catch (e) {}
  }, [cnesProfessionals]);

  useEffect(() => {
    saveStoredTrainingActions(actions);
  }, [actions]);

  useEffect(() => {
    saveStoredAttendance(attendance);
  }, [attendance]);

  useEffect(() => {
    saveStoredDNC(dncList);
  }, [dncList]);

  useEffect(() => {
    saveStoredCensus(censusList);
  }, [censusList]);

  useEffect(() => {
    saveStoredUnits(units);
  }, [units]);

  useEffect(() => {
    if (currentUser) {
      saveStoredUser(currentUser);
    }
  }, [currentUser]);

  // Handle Login
  const handleLoginSuccess = (user: AuthUser, unitId?: string) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (unitId) {
      setSelectedUnitId(unitId);
    } else if (user.unitId) {
      setSelectedUnitId(user.unitId);
    }
    setIsLoggedIn(true);
    saveStoredUser(user);
  };

  // Handle Logout
  const handleLogout = async () => {
    await signOutGoogle();
    setCurrentUser(null);
    setIsLoggedIn(false);
    saveStoredUser(null);
  };

  // Selected Unit object
  const currentUnit = units.find(u => u.id === selectedUnitId) || units[0];

  // ----------------------------------------------------
  // Handlers with Cloud Firestore Persistence
  // ----------------------------------------------------
  const handleSaveAction = (savedAction: TrainingAction) => {
    setActions(prev => {
      const exists = prev.some(a => a.id === savedAction.id);
      const updated = exists 
        ? prev.map(a => a.id === savedAction.id ? savedAction : a)
        : [savedAction, ...prev];
      saveStoredTrainingActions(updated);
      return updated;
    });

    // Persist to Cloud Firestore
    saveTrainingActionToCloud(savedAction).catch(err => {
      console.error('Error syncing saved action to Firestore:', err);
    });

    setIsNewActionOpen(false);
    setActionToEdit(null);
    if (selectedActionDetails && selectedActionDetails.id === savedAction.id) {
      setSelectedActionDetails(savedAction);
    }
  };

  const handleEditAction = (action: TrainingAction) => {
    setActionToEdit(action);
    setIsNewActionOpen(true);
  };

  const handleDeleteAction = (actionId: string) => {
    setActions(prev => prev.filter(a => a.id !== actionId));
    setAttendance(prev => prev.filter(att => att.actionId !== actionId));
    if (selectedActionDetails && selectedActionDetails.id === actionId) {
      setSelectedActionDetails(null);
    }
    // Delete from Cloud Firestore
    deleteTrainingActionFromCloud(actionId).catch(err => {
      console.error('Error deleting action from Firestore:', err);
    });
  };

  const handleUpdateActionStatus = (actionId: string, newStatus: TrainingAction['status']) => {
    const targetAction = actions.find(a => a.id === actionId);
    if (targetAction) {
      const updatedAction = { ...targetAction, status: newStatus };
      setActions(prev => prev.map(a => a.id === actionId ? updatedAction : a));
      if (selectedActionDetails && selectedActionDetails.id === actionId) {
        setSelectedActionDetails(updatedAction);
      }
      // Save status to Cloud Firestore
      saveTrainingActionToCloud(updatedAction).catch(err => {
        console.error('Error updating action status in Firestore:', err);
      });
    }
  };

  const handleConfirmCancelAction = (
    actionId: string, 
    reason: string, 
    category: 'Logística / Local' | 'Instrutor Indisponível' | 'Emergência Epidemiológica' | 'Baixa Adesão Prévia' | 'Outro'
  ) => {
    const targetAction = actions.find(a => a.id === actionId);
    if (targetAction) {
      const updatedAction: TrainingAction = {
        ...targetAction,
        status: 'cancelada',
        cancellationReason: reason,
        cancellationCategory: category,
        cancellationDate: new Date().toISOString().split('T')[0]
      };

      setActions(prev => prev.map(a => a.id === actionId ? updatedAction : a));
      setSelectedActionToCancel(null);
      if (selectedActionDetails && selectedActionDetails.id === actionId) {
        setSelectedActionDetails(updatedAction);
      }

      // Save to Cloud Firestore
      saveTrainingActionToCloud(updatedAction).catch(err => {
        console.error('Error saving canceled action to Firestore:', err);
      });
    }
  };

  const handleSaveCensus = (newCensus: UnitStaffCensus) => {
    // Update or add census locally
    setCensusList(prev => {
      const idx = prev.findIndex(c => c.unitId === newCensus.unitId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newCensus;
        return next;
      }
      return [...prev, newCensus];
    });

    // Also update health unit totalStaff and activeStaffBreakdown
    let updatedUnitObj: HealthUnit | undefined;
    setUnits(prev => prev.map(u => {
      if (u.id === newCensus.unitId) {
        updatedUnitObj = {
          ...u,
          totalStaff: newCensus.totalActiveStaff,
          activeStaffBreakdown: newCensus.breakdown
        };
        return updatedUnitObj;
      }
      return u;
    }));

    // Persist to Cloud Firestore
    saveCensusRecordToCloud(newCensus).catch(err => {
      console.error('Error saving census to Firestore:', err);
    });
    if (updatedUnitObj) {
      saveHealthUnitToCloud(updatedUnitObj).catch(err => {
        console.error('Error saving updated unit to Firestore:', err);
      });
    }

    setSelectedCensusUnit(null);
  };

  const handleSyncUnitCnes = (unitId: string, syncedProfessionals: CnesProfessional[]) => {
    // 1. Update professionals list for this unit
    setCnesProfessionals(prev => {
      const otherUnitProfs = prev.filter(p => p.unitId !== unitId);
      return [...otherUnitProfs, ...syncedProfessionals];
    });

    // 2. Count active professionals by category
    const breakdown: Partial<Record<import('./types').ProfessionalCategory, number>> = {};
    syncedProfessionals.filter(p => p.status === 'Ativo').forEach(p => {
      breakdown[p.professionalCategory] = (breakdown[p.professionalCategory] || 0) + 1;
    });
    const totalActive = Object.values(breakdown).reduce((acc, count) => acc + (count || 0), 0);

    // 3. Update HealthUnit object
    const targetUnit = units.find(u => u.id === unitId);
    if (targetUnit) {
      const updatedUnit: HealthUnit = {
        ...targetUnit,
        totalStaff: totalActive || targetUnit.totalStaff,
        activeStaffBreakdown: Object.keys(breakdown).length > 0 ? breakdown : targetUnit.activeStaffBreakdown,
        cnesSyncedAt: new Date().toISOString()
      };

      setUnits(prev => prev.map(u => u.id === unitId ? updatedUnit : u));

      // 4. Update or create Census Record
      const newCensus: UnitStaffCensus = {
        id: `census-cnes-${unitId}-${Date.now()}`,
        unitId,
        unitName: targetUnit.name,
        period: 'Agosto/2026',
        totalActiveStaff: totalActive || targetUnit.totalStaff,
        breakdown: Object.keys(breakdown).length > 0 ? breakdown : targetUnit.activeStaffBreakdown || {},
        notes: `Sincronizado automaticamente com o barramento DATASUS / CNES (${targetUnit.cnes || 'Oficial'}).`,
        submittedBy: 'Sincronizador CNES / DATASUS',
        submittedAt: new Date().toISOString(),
        verifiedBySermac: true
      };

      setCensusList(prev => {
        const idx = prev.findIndex(c => c.unitId === unitId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = newCensus;
          return next;
        }
        return [...prev, newCensus];
      });

      // Persist unit and census to Cloud Firestore
      saveHealthUnitToCloud(updatedUnit).catch(err => console.error('Firestore unit sync error:', err));
      saveCensusRecordToCloud(newCensus).catch(err => console.error('Firestore census sync error:', err));
    }
  };

  const handleAddCnesProfessional = (newProf: CnesProfessional) => {
    setCnesProfessionals(prev => [newProf, ...prev]);

    // Recalculate unit staff breakdown
    const unitId = newProf.unitId;
    const targetUnit = units.find(u => u.id === unitId);
    if (targetUnit) {
      const breakdown = { ...(targetUnit.activeStaffBreakdown || {}) };
      breakdown[newProf.professionalCategory] = (breakdown[newProf.professionalCategory] || 0) + 1;
      const totalStaff = Object.values(breakdown).reduce<number>((acc, v) => acc + (Number(v) || 0), 0);
      const updatedUnit: HealthUnit = {
        ...targetUnit,
        totalStaff: totalStaff || targetUnit.totalStaff + 1,
        activeStaffBreakdown: breakdown,
        cnesSyncedAt: new Date().toISOString()
      };

      setUnits(prev => prev.map(u => u.id === unitId ? updatedUnit : u));
      saveHealthUnitToCloud(updatedUnit).catch(err => console.error('Firestore unit save error:', err));
    }
  };

  const handleUpdateCurrentUser = (updatedUser: AuthUser) => {
    setCurrentUser(updatedUser);
    saveStoredUser(updatedUser);
  };

  const handleAddAttendance = (recordData: AttendanceRecord | Omit<AttendanceRecord, 'id' | 'certificateCode'>) => {
    const certCode = ('certificateCode' in recordData && recordData.certificateCode)
      ? recordData.certificateCode
      : `CERT-${recordData.actionCode}-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = ('id' in recordData && recordData.id)
      ? recordData.id
      : `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newRecord: AttendanceRecord = {
      ...recordData,
      id,
      certificateCode: certCode
    };

    setAttendance(prev => {
      const exists = prev.some(a => a.id === newRecord.id);
      if (exists) {
        return prev.map(a => a.id === newRecord.id ? newRecord : a);
      }
      return [newRecord, ...prev];
    });

    // Save attendance to Cloud Firestore
    saveAttendanceRecordToCloud(newRecord).catch(err => {
      console.error('Error saving attendance to Firestore:', err);
    });

    // Increment attended count on action
    setActions(prev => prev.map(a => {
      if (a.id === recordData.actionId) {
        const count = (a.attendedCount || 0) + 1;
        const updatedAction = { ...a, attendedCount: count };
        // Save action updated count to Cloud Firestore
        saveTrainingActionToCloud(updatedAction).catch(err => console.error('Firestore action attended update error:', err));
        return updatedAction;
      }
      return a;
    }));
  };

  const handleSaveFeedback = (attendanceId: string, feedback: FeedbackData) => {
    setAttendance(prev => {
      const updatedList = prev.map(a => {
        if (a.id === attendanceId) {
          const updated = { ...a, feedback };
          saveAttendanceRecordToCloud(updated).catch(err => console.error('Firestore feedback save error:', err));
          return updated;
        }
        return a;
      });
      return updatedList;
    });
  };

  const handleSubmitDNC = (dncData: Omit<TrainingNeedDNC, 'id' | 'dateReported' | 'status'>) => {
    const newDnc: TrainingNeedDNC = {
      ...dncData,
      id: `dnc-${Date.now()}`,
      dateReported: new Date().toISOString().split('T')[0],
      status: 'Pendente'
    };
    setDncList(prev => [newDnc, ...prev]);
    saveLntNeedToCloud(newDnc).catch(err => console.error('Firestore LNT submit error:', err));
  };

  const handleAddLntNeed = (newLntData: Omit<TrainingNeedDNC, 'id' | 'dateReported'>) => {
    const newDnc: TrainingNeedDNC = {
      ...newLntData,
      id: `dnc-lnt-${Date.now()}`,
      dateReported: new Date().toISOString().split('T')[0],
      status: newLntData.status || 'Aprovado_LNT'
    };
    setDncList(prev => [newDnc, ...prev]);
    saveLntNeedToCloud(newDnc).catch(err => console.error('Firestore LNT add error:', err));
  };

  const handleDeleteDnc = (dncId: string) => {
    setDncList(prev => prev.filter(d => d.id !== dncId));
    deleteLntNeedFromCloud(dncId).catch(err => console.error('Firestore LNT delete error:', err));
  };

  const handleUpdateDncStatus = (dncId: string, status: TrainingNeedDNC['status']) => {
    setDncList(prev => prev.map(d => d.id === dncId ? { ...d, status } : d));
    updateLntStatusInCloud(dncId, status).catch(err => console.error('Firestore LNT status update error:', err));
  };

  const handleGlobalExportCSV = () => {
    const headers = 'Código;Tema;Eixo Temático;Unidade;Docente;Categoria Instrutora;Carga Horária;Modalidade;Presentes;Status\n';
    const rows = actions.map(a => 
      `"${a.code}";"${a.title}";"${a.thematicAxis}";"${a.unitName}";"${a.instructorName}";"${a.instructorCategory}";"${a.workloadHours}";"${a.modality}";"${a.attendedCount}";"${a.status}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SERMAC_Relatorio_Consolidado_EPS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // UI State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If not authenticated, render Login Screen
  if (!isLoggedIn) {
    return <AuthScreen units={units} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen w-full bg-[#F0F2F5] text-slate-900 font-sans antialiased selection:bg-[#1351b4] selection:text-white">
      
      {/* Sidebar Navigation */}
      <Sidebar
        currentRole={currentRole}
        units={units}
        selectedUnitId={selectedUnitId}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenNewAction={() => {
          setActionToEdit(null);
          setIsNewActionOpen(true);
        }}
        onOpenAiDiagnosis={() => setIsAiDiagnosisOpen(true)}
        onOpenPaepsPlan={() => setIsPaepsPlanOpen(true)}
        onOpenCnesModal={() => {
          setCnesTargetUnitId(selectedUnitId || units[0]?.id || '');
          setIsCnesModalOpen(true);
        }}
        onOpenCensusModal={(u) => setSelectedCensusUnit(u || currentUnit)}
        onExportCsv={handleGlobalExportCSV}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main View Area (Header at top + Main Content below) */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        
        {/* Top Header */}
        <Header
          currentRole={currentRole}
          units={units}
          selectedUnitId={selectedUnitId}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenNewAction={() => {
            setActionToEdit(null);
            setIsNewActionOpen(true);
          }}
          onOpenAiDiagnosis={() => setIsAiDiagnosisOpen(true)}
          onOpenPaepsPlan={() => setIsPaepsPlanOpen(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Main Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
          
          {/* Dynamic View based on Role */}
          {currentRole === 'SERMAC_CENTRAL' && (
            <CentralSermacDashboard
              units={units}
              actions={actions}
              attendance={attendance}
              dncList={dncList}
              censusList={censusList}
              onOpenAiDiagnosis={() => setIsAiDiagnosisOpen(true)}
              onOpenPaepsPlan={() => setIsPaepsPlanOpen(true)}
              onSelectAction={(action) => setSelectedActionDetails(action)}
              onUpdateDncStatus={handleUpdateDncStatus}
              onOpenCensusModal={(unit) => setSelectedCensusUnit(unit)}
              onOpenCnesModal={(unitId) => {
                setCnesTargetUnitId(unitId);
                setIsCnesModalOpen(true);
              }}
              onOpenCancelModal={(action) => setSelectedActionToCancel(action)}
              onEditAction={handleEditAction}
              onDeleteAction={handleDeleteAction}
            />
          )}

          {currentRole === 'NEPS_UNIT' && (
            <NepsUnitDashboard
              unit={currentUnit}
              actions={actions}
              attendance={attendance}
              dncList={dncList}
              censusList={censusList}
              onOpenNewAction={() => {
                setActionToEdit(null);
                setIsNewActionOpen(true);
              }}
              onSelectAction={(action) => setSelectedActionDetails(action)}
              onOpenCertificate={(record) => setSelectedCertificateRecord(record)}
              onSubmitDNC={handleSubmitDNC}
              onOpenCensusModal={(unit) => setSelectedCensusUnit(unit)}
              onOpenCancelModal={(action) => setSelectedActionToCancel(action)}
              onEditAction={handleEditAction}
              onDeleteAction={handleDeleteAction}
              onOpenCnesModal={(unitId) => {
                setCnesTargetUnitId(unitId || currentUnit.id);
                setIsCnesModalOpen(true);
              }}
            />
          )}

          {currentRole === 'PARTICIPANT' && (
            <ParticipantPortal
              currentUser={currentUser}
              actions={actions}
              attendance={attendance}
              units={units}
              cnesProfessionals={cnesProfessionals}
              onRegisterCheckin={handleAddAttendance}
              onSaveFeedback={handleSaveFeedback}
              onOpenCertificate={(record) => setSelectedCertificateRecord(record)}
              onOpenCnesModal={() => {
                setCnesTargetUnitId(undefined);
                setIsCnesModalOpen(true);
              }}
              onAddCnesProfessional={handleAddCnesProfessional}
              onUpdateCurrentUser={handleUpdateCurrentUser}
            />
          )}

        </main>
      </div>

      {/* Modals */}
      {isNewActionOpen && (
        <NewActionModal
          units={units}
          selectedUnitId={selectedUnitId}
          currentRole={currentRole}
          actionToEdit={actionToEdit}
          onClose={() => {
            setIsNewActionOpen(false);
            setActionToEdit(null);
          }}
          onSave={handleSaveAction}
        />
      )}

      {selectedActionDetails && (
        <TrainingDetailsModal
          action={selectedActionDetails}
          attendanceList={attendance.filter(a => a.actionId === selectedActionDetails.id)}
          units={units}
          onClose={() => setSelectedActionDetails(null)}
          onUpdateStatus={handleUpdateActionStatus}
          onAddAttendance={handleAddAttendance}
          onOpenCertificate={(record) => setSelectedCertificateRecord(record)}
          onEditAction={handleEditAction}
          onDeleteAction={handleDeleteAction}
          onOpenCancelModal={(action) => setSelectedActionToCancel(action)}
        />
      )}

      {selectedCertificateRecord && (
        <CertificateModal
          record={selectedCertificateRecord}
          action={actions.find(a => a.id === selectedCertificateRecord.actionId)}
          onClose={() => setSelectedCertificateRecord(null)}
        />
      )}

      {isAiDiagnosisOpen && (
        <AiDiagnosisModal
          actions={actions}
          attendance={attendance}
          units={units}
          onClose={() => setIsAiDiagnosisOpen(false)}
        />
      )}

      {isPaepsPlanOpen && (
        <PaepsPlanModal
          units={units}
          actions={actions}
          dncList={dncList}
          onClose={() => setIsPaepsPlanOpen(false)}
          onAddLntNeed={handleAddLntNeed}
          onUpdateDncStatus={handleUpdateDncStatus}
          onDeleteDnc={handleDeleteDnc}
        />
      )}

      {selectedCensusUnit && (
        <WorkforceCensusModal
          unit={selectedCensusUnit}
          currentCensus={censusList.find(c => c.unitId === selectedCensusUnit.id)}
          cnesProfessionals={cnesProfessionals}
          onClose={() => setSelectedCensusUnit(null)}
          onSaveCensus={handleSaveCensus}
        />
      )}

      {selectedActionToCancel && (
        <CancelActionModal
          action={selectedActionToCancel}
          onClose={() => setSelectedActionToCancel(null)}
          onConfirmCancel={handleConfirmCancelAction}
        />
      )}

      {isCnesModalOpen && (
        <CnesIntegrationModal
          units={currentRole === 'NEPS_UNIT' && currentUser?.unitId ? units.filter(u => u.id === currentUser.unitId) : units}
          selectedUnitId={currentRole === 'NEPS_UNIT' && currentUser?.unitId ? currentUser.unitId : (cnesTargetUnitId || selectedUnitId)}
          professionals={cnesProfessionals}
          isRestrictedToUnit={currentRole === 'NEPS_UNIT'}
          currentUserRole={currentRole}
          onClose={() => {
            setIsCnesModalOpen(false);
            setCnesTargetUnitId(undefined);
          }}
          onSyncUnitCnes={handleSyncUnitCnes}
          onAddProfessional={handleAddCnesProfessional}
        />
      )}

    </div>
  );
}
