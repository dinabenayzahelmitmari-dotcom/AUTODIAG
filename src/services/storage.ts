/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Client,
  Vehicle,
  WorkOrder,
  FaultRecord,
  KnowledgeCase,
  ElectricalSchematic,
  AIDiagnosisSession,
} from '../types';
import {
  initialClients,
  initialVehicles,
  initialWorkOrders,
  initialFaultRecords,
  initialKnowledgeCases,
  initialSchematics,
  initialDiagnosisSessions,
} from '../data/mockData';

const STORAGE_KEYS = {
  CLIENTS: 'autodiag_clients_v1',
  VEHICLES: 'autodiag_vehicles_v1',
  WORK_ORDERS: 'autodiag_work_orders_v1',
  FAULTS: 'autodiag_faults_v1',
  KNOWLEDGE: 'autodiag_knowledge_v1',
  SCHEMATICS: 'autodiag_schematics_v1',
  SESSIONS: 'autodiag_sessions_v1',
  EXPLICIT_EMPTY: 'autodiag_explicit_empty_mode',
};

function loadItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);

    // If array is empty and user has NOT explicitly selected empty mode, provide initial rich data
    if (
      Array.isArray(parsed) &&
      parsed.length === 0 &&
      Array.isArray(defaultValue) &&
      defaultValue.length > 0
    ) {
      const isExplicitEmpty = localStorage.getItem(STORAGE_KEYS.EXPLICIT_EMPTY) === 'true';
      if (!isExplicitEmpty) {
        return defaultValue;
      }
    }

    return parsed;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function saveItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

export const workshopStorage = {
  getClients: (): Client[] => loadItem(STORAGE_KEYS.CLIENTS, initialClients),
  saveClients: (clients: Client[]) => saveItem(STORAGE_KEYS.CLIENTS, clients),

  getVehicles: (): Vehicle[] => loadItem(STORAGE_KEYS.VEHICLES, initialVehicles),
  saveVehicles: (vehicles: Vehicle[]) => saveItem(STORAGE_KEYS.VEHICLES, vehicles),

  getWorkOrders: (): WorkOrder[] => loadItem(STORAGE_KEYS.WORK_ORDERS, initialWorkOrders),
  saveWorkOrders: (orders: WorkOrder[]) => saveItem(STORAGE_KEYS.WORK_ORDERS, orders),

  getFaultRecords: (): FaultRecord[] => loadItem(STORAGE_KEYS.FAULTS, initialFaultRecords),
  saveFaultRecords: (faults: FaultRecord[]) => saveItem(STORAGE_KEYS.FAULTS, faults),

  getKnowledgeCases: (): KnowledgeCase[] => loadItem(STORAGE_KEYS.KNOWLEDGE, initialKnowledgeCases),
  saveKnowledgeCases: (cases: KnowledgeCase[]) => saveItem(STORAGE_KEYS.KNOWLEDGE, cases),

  getSchematics: (): ElectricalSchematic[] => loadItem(STORAGE_KEYS.SCHEMATICS, initialSchematics),
  saveSchematics: (schematics: ElectricalSchematic[]) => saveItem(STORAGE_KEYS.SCHEMATICS, schematics),

  getSessions: (): AIDiagnosisSession[] => loadItem(STORAGE_KEYS.SESSIONS, initialDiagnosisSessions),
  saveSessions: (sessions: AIDiagnosisSession[]) => saveItem(STORAGE_KEYS.SESSIONS, sessions),

  // Preload complete realistic workshop dataset (guarantees data is registered)
  loadFullDemoData: () => {
    localStorage.removeItem(STORAGE_KEYS.EXPLICIT_EMPTY);
    saveItem(STORAGE_KEYS.CLIENTS, initialClients);
    saveItem(STORAGE_KEYS.VEHICLES, initialVehicles);
    saveItem(STORAGE_KEYS.WORK_ORDERS, initialWorkOrders);
    saveItem(STORAGE_KEYS.FAULTS, initialFaultRecords);
    saveItem(STORAGE_KEYS.KNOWLEDGE, initialKnowledgeCases);
    saveItem(STORAGE_KEYS.SCHEMATICS, initialSchematics);
    saveItem(STORAGE_KEYS.SESSIONS, initialDiagnosisSessions);
  },

  // Reset to default data
  resetToDefaults: () => {
    localStorage.removeItem(STORAGE_KEYS.EXPLICIT_EMPTY);
    saveItem(STORAGE_KEYS.CLIENTS, initialClients);
    saveItem(STORAGE_KEYS.VEHICLES, initialVehicles);
    saveItem(STORAGE_KEYS.WORK_ORDERS, initialWorkOrders);
    saveItem(STORAGE_KEYS.FAULTS, initialFaultRecords);
    saveItem(STORAGE_KEYS.KNOWLEDGE, initialKnowledgeCases);
    saveItem(STORAGE_KEYS.SCHEMATICS, initialSchematics);
    saveItem(STORAGE_KEYS.SESSIONS, initialDiagnosisSessions);
  },

  // Clear all data if user specifically wants a 100% blank slate
  clearAllData: () => {
    localStorage.setItem(STORAGE_KEYS.EXPLICIT_EMPTY, 'true');
    saveItem(STORAGE_KEYS.CLIENTS, []);
    saveItem(STORAGE_KEYS.VEHICLES, []);
    saveItem(STORAGE_KEYS.WORK_ORDERS, []);
    saveItem(STORAGE_KEYS.FAULTS, []);
    saveItem(STORAGE_KEYS.SESSIONS, []);
  },
};
