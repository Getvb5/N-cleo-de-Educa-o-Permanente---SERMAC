import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  HealthUnit, 
  TrainingAction, 
  AttendanceRecord, 
  TrainingNeedDNC, 
  UnitStaffCensus 
} from '../types';

// Collection names
export const COLLECTIONS = {
  UNITS: 'health_units',
  ACTIONS: 'training_actions',
  ATTENDANCE: 'attendance_records',
  LNT: 'lnt_needs',
  CENSUS: 'unit_census'
};

/**
 * Recursively cleans and removes all `undefined` values from an object or array.
 * Firebase Firestore throws a fatal error if any property contains `undefined`.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data as any)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return data;
}

// ----------------------------------------------------
// Health Units
// ----------------------------------------------------
export function subscribeHealthUnits(
  onData: (units: HealthUnit[]) => void, 
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, COLLECTIONS.UNITS);
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const units: HealthUnit[] = [];
        snapshot.forEach((docSnap) => {
          units.push(docSnap.data() as HealthUnit);
        });
        units.sort((a, b) => a.name.localeCompare(b.name));
        onData(units);
      }
    }, (error) => {
      console.warn('Firestore units subscription error:', error);
      if (onError) onError(error);
    });
  } catch (err: any) {
    console.warn('Could not establish units snapshot:', err);
    return () => {};
  }
}

export async function saveHealthUnitToCloud(unit: HealthUnit): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.UNITS, unit.id);
    const sanitized = sanitizeForFirestore(unit);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    console.error('Error saving unit to cloud:', err);
    throw err;
  }
}

export async function batchSaveHealthUnitsToCloud(units: HealthUnit[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const unit of units) {
      const docRef = doc(db, COLLECTIONS.UNITS, unit.id);
      const sanitized = sanitizeForFirestore(unit);
      batch.set(docRef, sanitized, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.error('Error batch saving units to cloud:', err);
    throw err;
  }
}

// ----------------------------------------------------
// Training Actions
// ----------------------------------------------------
export function subscribeTrainingActions(
  onData: (actions: TrainingAction[]) => void, 
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, COLLECTIONS.ACTIONS);
    return onSnapshot(colRef, (snapshot) => {
      const actions: TrainingAction[] = [];
      snapshot.forEach((docSnap) => {
        actions.push(docSnap.data() as TrainingAction);
      });
      // Sort newest first
      actions.sort((a, b) => new Date(b.dateStart || '').getTime() - new Date(a.dateStart || '').getTime());
      onData(actions);
    }, (error) => {
      console.warn('Firestore actions subscription error:', error);
      if (onError) onError(error);
    });
  } catch (err: any) {
    console.warn('Could not establish actions snapshot:', err);
    return () => {};
  }
}

export async function saveTrainingActionToCloud(action: TrainingAction): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.ACTIONS, action.id);
    const sanitized = sanitizeForFirestore(action);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    console.error('Error saving action to cloud:', err);
    throw err;
  }
}

export async function deleteTrainingActionFromCloud(actionId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.ACTIONS, actionId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting action from cloud:', err);
    throw err;
  }
}

export async function batchSaveActionsToCloud(actions: TrainingAction[]): Promise<void> {
  try {
    if (actions.length === 0) return;
    const batch = writeBatch(db);
    for (const action of actions) {
      const docRef = doc(db, COLLECTIONS.ACTIONS, action.id);
      const sanitized = sanitizeForFirestore(action);
      batch.set(docRef, sanitized, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.error('Error batch saving actions to cloud:', err);
    throw err;
  }
}

// ----------------------------------------------------
// Attendance & Feedback Records
// ----------------------------------------------------
export function subscribeAttendanceRecords(
  onData: (records: AttendanceRecord[]) => void, 
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, COLLECTIONS.ATTENDANCE);
    return onSnapshot(colRef, (snapshot) => {
      const records: AttendanceRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push(docSnap.data() as AttendanceRecord);
      });
      // Sort newest first
      records.sort((a, b) => new Date(b.checkinTimestamp || '').getTime() - new Date(a.checkinTimestamp || '').getTime());
      onData(records);
    }, (error) => {
      console.warn('Firestore attendance subscription error:', error);
      if (onError) onError(error);
    });
  } catch (err: any) {
    console.warn('Could not establish attendance snapshot:', err);
    return () => {};
  }
}

export async function saveAttendanceRecordToCloud(record: AttendanceRecord): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.ATTENDANCE, record.id);
    const sanitized = sanitizeForFirestore(record);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    console.error('Error saving attendance to cloud:', err);
    throw err;
  }
}

export async function batchSaveAttendanceToCloud(records: AttendanceRecord[]): Promise<void> {
  try {
    if (records.length === 0) return;
    const batch = writeBatch(db);
    for (const record of records) {
      const docRef = doc(db, COLLECTIONS.ATTENDANCE, record.id);
      const sanitized = sanitizeForFirestore(record);
      batch.set(docRef, sanitized, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.error('Error batch saving attendance to cloud:', err);
    throw err;
  }
}

// ----------------------------------------------------
// LNT / DNC Needs
// ----------------------------------------------------
export function subscribeLntNeeds(
  onData: (needs: TrainingNeedDNC[]) => void, 
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, COLLECTIONS.LNT);
    return onSnapshot(colRef, (snapshot) => {
      const needs: TrainingNeedDNC[] = [];
      snapshot.forEach((docSnap) => {
        needs.push(docSnap.data() as TrainingNeedDNC);
      });
      needs.sort((a, b) => new Date(b.dateReported || '').getTime() - new Date(a.dateReported || '').getTime());
      onData(needs);
    }, (error) => {
      console.warn('Firestore LNT subscription error:', error);
      if (onError) onError(error);
    });
  } catch (err: any) {
    console.warn('Could not establish LNT snapshot:', err);
    return () => {};
  }
}

export async function saveLntNeedToCloud(need: TrainingNeedDNC): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.LNT, need.id);
    const sanitized = sanitizeForFirestore(need);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    console.error('Error saving LNT need to cloud:', err);
    throw err;
  }
}

export async function updateLntStatusInCloud(needId: string, status: TrainingNeedDNC['status']): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.LNT, needId);
    await setDoc(docRef, { status }, { merge: true });
  } catch (err) {
    console.error('Error updating LNT status in cloud:', err);
    throw err;
  }
}

export async function deleteLntNeedFromCloud(needId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.LNT, needId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting LNT need from cloud:', err);
    throw err;
  }
}

export async function batchSaveLntToCloud(needs: TrainingNeedDNC[]): Promise<void> {
  try {
    if (needs.length === 0) return;
    const batch = writeBatch(db);
    for (const need of needs) {
      const docRef = doc(db, COLLECTIONS.LNT, need.id);
      const sanitized = sanitizeForFirestore(need);
      batch.set(docRef, sanitized, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.error('Error batch saving LNT needs to cloud:', err);
    throw err;
  }
}

// ----------------------------------------------------
// Unit Staff Census
// ----------------------------------------------------
export function subscribeUnitCensus(
  onData: (censusList: UnitStaffCensus[]) => void, 
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, COLLECTIONS.CENSUS);
    return onSnapshot(colRef, (snapshot) => {
      const censusList: UnitStaffCensus[] = [];
      snapshot.forEach((docSnap) => {
        censusList.push(docSnap.data() as UnitStaffCensus);
      });
      censusList.sort((a, b) => (a.unitName || '').localeCompare(b.unitName || ''));
      onData(censusList);
    }, (error) => {
      console.warn('Firestore census subscription error:', error);
      if (onError) onError(error);
    });
  } catch (err: any) {
    console.warn('Could not establish census snapshot:', err);
    return () => {};
  }
}

export async function saveCensusRecordToCloud(census: UnitStaffCensus): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.CENSUS, census.unitId);
    const sanitized = sanitizeForFirestore(census);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    console.error('Error saving census record to cloud:', err);
    throw err;
  }
}

export async function batchSaveCensusToCloud(censusList: UnitStaffCensus[]): Promise<void> {
  try {
    if (censusList.length === 0) return;
    const batch = writeBatch(db);
    for (const census of censusList) {
      const docRef = doc(db, COLLECTIONS.CENSUS, census.unitId);
      const sanitized = sanitizeForFirestore(census);
      batch.set(docRef, sanitized, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.error('Error batch saving census to cloud:', err);
    throw err;
  }
}

// ----------------------------------------------------
// Initialization & One-Time Database Seeding (if empty)
// ----------------------------------------------------
export async function seedCloudDatabaseIfEmpty(
  initialUnits: HealthUnit[],
  initialActions: TrainingAction[],
  initialAttendance: AttendanceRecord[],
  initialLnt: TrainingNeedDNC[],
  initialCensus: UnitStaffCensus[]
): Promise<boolean> {
  try {
    const unitsSnap = await getDocs(collection(db, COLLECTIONS.UNITS));
    if (unitsSnap.empty) {
      console.log('Seeding Firestore with initial health units...');
      await batchSaveHealthUnitsToCloud(initialUnits);
      
      if (initialActions.length > 0) {
        await batchSaveActionsToCloud(initialActions);
      }
      if (initialAttendance.length > 0) {
        await batchSaveAttendanceToCloud(initialAttendance);
      }
      if (initialLnt.length > 0) {
        await batchSaveLntToCloud(initialLnt);
      }
      if (initialCensus.length > 0) {
        await batchSaveCensusToCloud(initialCensus);
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Error during cloud database check/seed:', err);
    return false;
  }
}
