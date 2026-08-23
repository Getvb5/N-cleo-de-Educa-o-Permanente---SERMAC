import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  HealthUnit, 
  TrainingAction, 
  AttendanceRecord, 
  TrainingNeedDNC,
  UnitStaffCensus,
  FeedbackData,
  AuthUser 
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
  DEFAULT_SERMAC_USER,
  DEFAULT_NEPS_USERS,
  DEFAULT_PARTICIPANT_USER
} from './data/mockData';
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

  // Core Data State
  const [actions, setActions] = useState<TrainingAction[]>(() => getStoredTrainingActions());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getStoredAttendance());
  const [dncList, setDncList] = useState<TrainingNeedDNC[]>(() => getStoredDNC());
  const [censusList, setCensusList] = useState<UnitStaffCensus[]>(() => loadStoredCensus());

  // Modal States
  const [isNewActionOpen, setIsNewActionOpen] = useState(false);
  const [isAiDiagnosisOpen, setIsAiDiagnosisOpen] = useState(false);
  const [isPaepsPlanOpen, setIsPaepsPlanOpen] = useState(false);
  const [selectedActionDetails, setSelectedActionDetails] = useState<TrainingAction | null>(null);
  const [selectedCertificateRecord, setSelectedCertificateRecord] = useState<AttendanceRecord | null>(null);
  const [selectedCensusUnit, setSelectedCensusUnit] = useState<HealthUnit | null>(null);
  const [selectedActionToCancel, setSelectedActionToCancel] = useState<TrainingAction | null>(null);

  // Sync to LocalStorage on changes
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

  // Handlers
  const handleSaveNewAction = (newAction: TrainingAction) => {
    const updated = [newAction, ...actions];
    setActions(updated);
    setIsNewActionOpen(false);
  };

  const handleUpdateActionStatus = (actionId: string, newStatus: TrainingAction['status']) => {
    setActions(prev => prev.map(a => a.id === actionId ? { ...a, status: newStatus } : a));
    if (selectedActionDetails && selectedActionDetails.id === actionId) {
      setSelectedActionDetails(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleConfirmCancelAction = (
    actionId: string, 
    reason: string, 
    category: 'Logística / Local' | 'Instrutor Indisponível' | 'Emergência Epidemiológica' | 'Baixa Adesão Prévia' | 'Outro'
  ) => {
    setActions(prev => prev.map(a => {
      if (a.id === actionId) {
        return {
          ...a,
          status: 'cancelada',
          cancellationReason: reason,
          cancellationCategory: category,
          cancellationDate: new Date().toISOString().split('T')[0]
        };
      }
      return a;
    }));
    setSelectedActionToCancel(null);
    if (selectedActionDetails && selectedActionDetails.id === actionId) {
      setSelectedActionDetails(prev => prev ? { 
        ...prev, 
        status: 'cancelada',
        cancellationReason: reason,
        cancellationCategory: category,
        cancellationDate: new Date().toISOString().split('T')[0]
      } : null);
    }
  };

  const handleSaveCensus = (newCensus: UnitStaffCensus) => {
    // Update or add census
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
    setUnits(prev => prev.map(u => {
      if (u.id === newCensus.unitId) {
        return {
          ...u,
          totalStaff: newCensus.totalActiveStaff,
          activeStaffBreakdown: newCensus.breakdown
        };
      }
      return u;
    }));

    setSelectedCensusUnit(null);
  };

  const handleAddAttendance = (recordData: Omit<AttendanceRecord, 'id' | 'certificateCode'>) => {
    const certCode = `CERT-${recordData.actionCode}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      certificateCode: certCode
    };

    const updated = [newRecord, ...attendance];
    setAttendance(updated);

    // Increment attended count on action
    setActions(prev => prev.map(a => {
      if (a.id === recordData.actionId) {
        const count = (a.attendedCount || 0) + 1;
        return { ...a, attendedCount: count };
      }
      return a;
    }));
  };

  const handleSaveFeedback = (attendanceId: string, feedback: FeedbackData) => {
    setAttendance(prev => prev.map(a => {
      if (a.id === attendanceId) {
        return { ...a, feedback };
      }
      return a;
    }));
  };

  const handleSubmitDNC = (dncData: Omit<TrainingNeedDNC, 'id' | 'dateReported' | 'status'>) => {
    const newDnc: TrainingNeedDNC = {
      ...dncData,
      id: `dnc-${Date.now()}`,
      dateReported: new Date().toISOString().split('T')[0],
      status: 'Pendente'
    };
    setDncList(prev => [newDnc, ...prev]);
  };

  const handleUpdateDncStatus = (dncId: string, status: TrainingNeedDNC['status']) => {
    setDncList(prev => prev.map(d => d.id === dncId ? { ...d, status } : d));
  };

  // UI State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If not authenticated, render Login Screen
  if (!isLoggedIn) {
    return <AuthScreen units={units} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen w-full bg-[#F1F5F9] text-slate-900 font-sans antialiased">
      
      {/* Sidebar Navigation */}
      <Sidebar
        currentRole={currentRole}
        units={units}
        selectedUnitId={selectedUnitId}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenNewAction={() => setIsNewActionOpen(true)}
        onOpenAiDiagnosis={() => setIsAiDiagnosisOpen(true)}
        onOpenPaepsPlan={() => setIsPaepsPlanOpen(true)}
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
          onOpenNewAction={() => setIsNewActionOpen(true)}
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
            />
          )}

          {currentRole === 'NEPS_UNIT' && (
            <NepsUnitDashboard
              unit={currentUnit}
              actions={actions}
              attendance={attendance}
              dncList={dncList}
              censusList={censusList}
              onOpenNewAction={() => setIsNewActionOpen(true)}
              onSelectAction={(action) => setSelectedActionDetails(action)}
              onOpenCertificate={(record) => setSelectedCertificateRecord(record)}
              onSubmitDNC={handleSubmitDNC}
              onOpenCensusModal={(unit) => setSelectedCensusUnit(unit)}
              onOpenCancelModal={(action) => setSelectedActionToCancel(action)}
            />
          )}

          {currentRole === 'PARTICIPANT' && (
            <ParticipantPortal
              actions={actions}
              attendance={attendance}
              units={units}
              onRegisterCheckin={handleAddAttendance}
              onSaveFeedback={handleSaveFeedback}
              onOpenCertificate={(record) => setSelectedCertificateRecord(record)}
            />
          )}

        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-center text-xs text-slate-500 print:hidden mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-slate-600 font-medium">
              <strong className="text-slate-800">EPS-SUS SERMAC</strong> • Sistema Municipal de Educação Permanente em Saúde e Qualificação do Cuidado
            </span>
            <span className="text-[11px] text-slate-400">
              Conforme Diretrizes da Política Nacional de Educação Permanente em Saúde (PNEPS/SUS)
            </span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      {isNewActionOpen && (
        <NewActionModal
          units={units}
          selectedUnitId={selectedUnitId}
          onClose={() => setIsNewActionOpen(false)}
          onSave={handleSaveNewAction}
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
        />
      )}

      {selectedCensusUnit && (
        <WorkforceCensusModal
          unit={selectedCensusUnit}
          currentCensus={censusList.find(c => c.unitId === selectedCensusUnit.id)}
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

    </div>
  );
}
