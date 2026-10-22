/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vehicle, FaultRecord, AIDiagnosisSession, TechnicianMeasurement, WorkOrder } from '../types';

export const automotiveApi = {
  /**
   * Request comprehensive AI diagnosis from server-side Gemini
   */
  async requestDiagnosis(params: {
    vehicle: Vehicle;
    faultRecord: FaultRecord;
    additionalNotes?: string;
  }): Promise<{
    hypotheses: any[];
    safetyAlerts: string[];
    highVoltageWarning?: string;
    technicalSummary?: string;
  }> {
    const res = await fetch('/api/gemini/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Error en el servidor de diagnóstico: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * Refine diagnosis when the technician records a physical measurement
   */
  async refineWithMeasurement(params: {
    session: AIDiagnosisSession;
    newMeasurement: Omit<TechnicianMeasurement, 'id' | 'timestamp'>;
    vehicle?: Vehicle;
    faultRecord?: FaultRecord;
  }): Promise<{
    aiEvolutionNotes: string;
    updatedHypotheses: any[];
    confirmedCause?: string | null;
    recommendedAction?: string;
  }> {
    const res = await fetch('/api/gemini/refine-diagnosis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Error al actualizar diagnóstico con medición: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * Generate official workshop repair report certificate
   */
  async generateTechnicalReport(params: {
    vehicle?: Vehicle;
    workOrder?: WorkOrder;
    faultRecord?: FaultRecord;
    session?: AIDiagnosisSession;
  }): Promise<{
    reportTitle: string;
    faultSummary: string;
    confirmedCause: string;
    appliedSolution: string;
    postRepairVerifications: string[];
    notesForCustomer: string;
  }> {
    const res = await fetch('/api/gemini/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Error al generar informe técnico: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * Query DTC technical meaning & ECU trigger conditions
   */
  async lookupDTC(code: string, brand?: string): Promise<{
    code: string;
    title: string;
    affectedSystem: string;
    detectionConditions: string;
    priorityChecks: string[];
    commonCulprits: string[];
  }> {
    const res = await fetch('/api/gemini/dtc-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, brand }),
    });

    if (!res.ok) {
      throw new Error(`Error al consultar código DTC: ${res.statusText}`);
    }

    return await res.json();
  },
};
