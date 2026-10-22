/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Cpu,
  ShieldAlert,
  AlertTriangle,
  Wrench,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Plus,
  RefreshCw,
  FileText,
  Sparkles,
  Layers,
  Zap,
} from 'lucide-react';
import {
  Vehicle,
  FaultRecord,
  AIDiagnosisSession,
  DiagnosticHypothesis,
  DiagnosticStep,
  TechnicianMeasurement,
} from '../../types';
import { automotiveApi } from '../../services/api';
import { SafetyBanner } from '../common/SafetyBanner';

interface DiagnosisWorkbenchProps {
  vehicle: Vehicle;
  faultRecord: FaultRecord;
  session?: AIDiagnosisSession;
  allFaults: FaultRecord[];
  allVehicles: Vehicle[];
  onSelectFault: (fault: FaultRecord) => void;
  onUpdateSession: (updatedSession: AIDiagnosisSession) => void;
  onOpenReportModal: (session: AIDiagnosisSession) => void;
  onOpenSchematic: (vehicle: Vehicle) => void;
}

export const DiagnosisWorkbench: React.FC<DiagnosisWorkbenchProps> = ({
  vehicle,
  faultRecord,
  session,
  allFaults,
  allVehicles,
  onSelectFault,
  onUpdateSession,
  onOpenReportModal,
  onOpenSchematic,
}) => {
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string>('');
  const [measurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [activeStepForMeasurement, setActiveStepForMeasurement] = useState<DiagnosticStep | null>(null);

  // Measurement form state
  const [measuredValue, setMeasuredValue] = useState('');
  const [isWithinSpec, setIsWithinSpec] = useState(true);
  const [measurementNotes, setMeasurementNotes] = useState('');
  const [isSubmittingMeasurement, setIsSubmittingMeasurement] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isHighVoltage =
    vehicle.systemVoltage === '400V_high_voltage' ||
    vehicle.systemVoltage === '800V_high_voltage' ||
    vehicle.fuelType === 'hybrid' ||
    vehicle.fuelType === 'electric' ||
    faultRecord.hasHighVoltageRisk;

  // Active hypotheses
  const hypotheses: DiagnosticHypothesis[] = session?.hypotheses || [];
  const selectedHypothesis =
    hypotheses.find((h) => h.id === selectedHypothesisId) || hypotheses[0];

  // Trigger comprehensive diagnosis via Gemini
  const handleRunFullDiagnosis = async () => {
    setIsDiagnosing(true);
    setStatusMessage('Consultando motor de IA automotriz con telemetría de vehículo...');
    try {
      const result = await automotiveApi.requestDiagnosis({
        vehicle,
        faultRecord,
      });

      const newSession: AIDiagnosisSession = {
        id: session?.id || `diag-${Date.now()}`,
        faultRecordId: faultRecord.id,
        vehicleId: vehicle.id,
        createdAt: session?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        safetyAlerts: result.safetyAlerts || [],
        highVoltageWarning: result.highVoltageWarning,
        hypotheses: result.hypotheses || [],
        submittedMeasurements: session?.submittedMeasurements || [],
      };

      onUpdateSession(newSession);
      if (result.hypotheses?.length > 0) {
        setSelectedHypothesisId(result.hypotheses[0].id);
      }
      setStatusMessage('Diagnóstico generado con éxito por el Asistente Técnico.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error en el asistente: ${err.message || 'Compruebe conexión'}`);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Submit actual workshop multimeter/oscilloscope measurement to refine hypotheses
  const handleSubmitMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStepForMeasurement || !session) return;

    setIsSubmittingMeasurement(true);
    try {
      const newMeasurement: Omit<TechnicianMeasurement, 'id' | 'timestamp'> = {
        stepNumber: activeStepForMeasurement.stepNumber,
        testName: activeStepForMeasurement.name,
        measuredValue,
        isWithinSpec,
        notes: measurementNotes,
      };

      const result = await automotiveApi.refineWithMeasurement({
        session,
        newMeasurement,
        vehicle,
        faultRecord,
      });

      const fullMeasurement: TechnicianMeasurement = {
        ...newMeasurement,
        id: `m-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };

      const updatedSession: AIDiagnosisSession = {
        ...session,
        updatedAt: new Date().toISOString(),
        submittedMeasurements: [...session.submittedMeasurements, fullMeasurement],
        hypotheses: result.updatedHypotheses || session.hypotheses,
        aiEvolutionNotes: result.aiEvolutionNotes,
        confirmedCause: result.confirmedCause || session.confirmedCause,
      };

      onUpdateSession(updatedSession);
      setMeasurementModalOpen(false);
      setMeasuredValue('');
      setMeasurementNotes('');
      setActiveStepForMeasurement(null);
      setStatusMessage('Medición analizada e incorporada al árbol de diagnosis.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error al registrar medición: ${err.message}`);
    } finally {
      setIsSubmittingMeasurement(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Vehicle/Fault Switcher */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-red-50 text-red-600">
                <Cpu className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Mesa de Trabajo y Asistente Técnico de Diagnóstico
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Análisis multivariable con razonamiento electromecánico y validación de tolerancias OEM.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Fault Case Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Caso Activo:</span>
              <select
                value={faultRecord.id}
                onChange={(e) => {
                  const f = allFaults.find((item) => item.id === e.target.value);
                  if (f) onSelectFault(f);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono font-semibold focus:border-red-500 focus:outline-none"
              >
                {allFaults.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.dtcCodes.map((d) => d.code).join('/') || 'Fallo'} - {f.title.slice(0, 45)}...
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => onOpenSchematic(vehicle)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
              title="Abrir esquema eléctrico interactivo del sistema"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ver Esquema Eléctrico</span>
            </button>

            <button
              onClick={handleRunFullDiagnosis}
              disabled={isDiagnosing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/30 disabled:opacity-50"
            >
              {isDiagnosing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 fill-white" />
              )}
              <span>{isDiagnosing ? 'Analizando con IA...' : 'Actualizar Diagnosis'}</span>
            </button>
          </div>
        </div>

        {/* Vehicle & Fault Quick Context Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono font-semibold">Vehículo</span>
            <span className="font-bold text-slate-900 truncate block">
              {vehicle.brand} {vehicle.model}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono font-semibold">Matrícula / VIN</span>
            <span className="font-mono font-bold text-red-600">{vehicle.licensePlate}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono font-semibold">Código Motor</span>
            <span className="font-mono font-bold text-slate-700">{vehicle.engineCode || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono font-semibold">Tensión Sistema</span>
            <span
              className={`font-mono font-bold ${
                isHighVoltage ? 'text-red-600' : 'text-slate-700'
              }`}
            >
              {vehicle.systemVoltage}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono font-semibold">Inyección</span>
            <span className="text-slate-700 truncate block font-medium">{vehicle.injectionType}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono font-semibold">Kilometraje</span>
            <span className="font-mono text-slate-700 font-bold">{vehicle.mileage.toLocaleString()} km</span>
          </div>
        </div>
      </div>

      {/* Safety Protocol Banner if High Voltage or Safety Systems */}
      <SafetyBanner
        systemVoltage={vehicle.systemVoltage}
        isHighVoltage={isHighVoltage}
        alerts={session?.safetyAlerts}
      />

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-white border border-red-200 text-red-800 text-xs flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-600" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* Fault Record Details & Confirmed Cause if resolved */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-rose-100 text-rose-700 border border-rose-200 uppercase">
              {faultRecord.severity}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700 border border-slate-200">
              {faultRecord.category}
            </span>
            <span className="text-xs text-slate-500">
              Frecuencia: <strong className="text-slate-800">{faultRecord.frequency}</strong>
            </span>
          </div>

          {session?.confirmedCause && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Causa Raíz Confirmada en Taller</span>
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold text-slate-900">{faultRecord.title}</h2>

        {/* Symptoms and DTC tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-red-600" />
              Síntomas Observados:
            </span>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
              {faultRecord.observedSymptoms.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              Códigos DTC Registrados:
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {faultRecord.dtcCodes.map((dtc) => (
                <div
                  key={dtc.code}
                  className="px-3 py-1 rounded-xl bg-white border border-rose-200 font-mono text-xs text-red-600 font-bold shadow-sm"
                >
                  {dtc.code}
                  <span className="text-[10px] text-slate-500 ml-1.5 font-normal">
                    [{dtc.ecu}] {dtc.description ? `- ${dtc.description.slice(0, 30)}...` : ''}
                  </span>
                </div>
              ))}
            </div>
            {faultRecord.conditions.engineTemp && (
              <div className="text-[11px] text-slate-500 pt-1">
                Condición térmica: <strong className="text-slate-700">{faultRecord.conditions.engineTemp}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Live AI Evolution feedback if technician added measurements */}
        {session?.aiEvolutionNotes && (
          <div className="mt-3 p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-slate-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-red-700">
              <Sparkles className="w-4 h-4 text-red-600" />
              Evolución Diagnóstica por Resultados de Taller:
            </div>
            <p className="leading-relaxed text-slate-700">{session.aiEvolutionNotes}</p>
          </div>
        )}
      </div>

      {/* Main Diagnostic Workbench: Hypotheses Cards on Left, Selected Diagnostic Steps on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 spans): Ranked Hypotheses */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-red-600" />
              Hipótesis Diagnósticas Ordenadas ({hypotheses.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Por evidencia y certeza</span>
          </div>

          {hypotheses.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center space-y-3 shadow-sm">
              <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500">
                Aún no se ha ejecutado el diagnóstico inteligente para esta avería.
              </p>
              <button
                onClick={handleRunFullDiagnosis}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full text-xs shadow-md shadow-red-600/20"
              >
                Generar Hipótesis con IA
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {hypotheses.map((hyp, index) => {
                const isSelected = selectedHypothesis?.id === hyp.id;
                return (
                  <div
                    key={hyp.id || index}
                    onClick={() => setSelectedHypothesisId(hyp.id)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-red-500 shadow-md ring-2 ring-red-500/20'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-slate-400">Hipótesis #{index + 1}</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                            hyp.confidence === 'ALTA'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : hyp.confidence === 'MEDIA'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Confianza {hyp.confidence} ({hyp.confidenceScore}%)
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">
                      {hyp.title}
                    </h4>

                    {/* Confidence bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2.5">
                      <div
                        className={`h-full transition-all duration-500 ${
                          hyp.confidenceScore >= 80
                            ? 'bg-emerald-500'
                            : hyp.confidenceScore >= 50
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${hyp.confidenceScore}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {hyp.technicalJustification}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{hyp.diagnosticSteps.length} pruebas sugeridas</span>
                      <span className="text-red-600 flex items-center gap-1 font-bold">
                        Ver protocolo <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (7 spans): Diagnostic Protocol & Steps */}
        <div className="lg:col-span-7 space-y-4">
          {selectedHypothesis ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-red-600 uppercase tracking-wider">
                    Protocolo de Comprobación Instrumental
                  </span>
                  <button
                    onClick={() => onOpenReportModal(session!)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold border border-emerald-300 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Emitir Informe Técnico</span>
                  </button>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedHypothesis.title}
                </h3>
              </div>

              {/* Electro-Mechanical Deep Dive */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-red-600" />
                  Mecanismo Físico / Causa Raíz Explicada:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedHypothesis.rootCauseAnalysis || selectedHypothesis.technicalJustification}
                </p>

                {selectedHypothesis.suspectedParts && selectedHypothesis.suspectedParts.length > 0 && (
                  <div className="pt-2 text-[11px] text-slate-600 flex flex-wrap gap-1.5 items-center">
                    <span className="text-slate-400 font-semibold">Piezas candidatas:</span>
                    {selectedHypothesis.suspectedParts.map((p, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full bg-white text-slate-800 font-mono text-[10px] border border-slate-200 shadow-sm font-semibold">
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Steps List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Pruebas Secuenciales Requeridas
                </h4>

                {selectedHypothesis.diagnosticSteps.map((step) => {
                  const matchingMeasurement = session?.submittedMeasurements.find(
                    (m) => m.stepNumber === step.stepNumber
                  );

                  return (
                    <div
                      key={step.stepNumber}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {step.stepNumber}
                          </span>
                          <span className="text-sm font-bold text-slate-900">{step.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] px-2.5 py-1 rounded-full bg-white text-slate-600 font-mono border border-slate-200 shadow-sm font-semibold">
                            🛠 {step.toolRequired}
                          </span>

                          <button
                            onClick={() => {
                              setActiveStepForMeasurement(step);
                              setMeasurementModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-sm"
                          >
                            + Registrar Valor Real
                          </button>
                        </div>
                      </div>

                      {/* Procedure & Reference values */}
                      <div className="text-xs text-slate-700 space-y-2 pl-8">
                        <div>
                          <strong className="text-slate-900">Procedimiento: </strong>
                          {step.procedure}
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-900 shadow-sm">
                          <strong className="text-red-600 font-sans font-bold">Valor de Referencia OEM: </strong>
                          {step.referenceValues}
                        </div>

                        {/* Pass/Fail Logic */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-medium">
                            <strong className="text-emerald-950 font-bold">✓ Si Conforme (Pasa): </strong> {step.ifPass}
                          </div>
                          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-[11px] text-red-900 font-medium">
                            <strong className="text-red-950 font-bold">✗ Si Falla (Fuera de rango): </strong> {step.ifFail}
                          </div>
                        </div>

                        {/* Recorded measurement badge if technician already tested this */}
                        {matchingMeasurement && (
                          <div className="mt-2 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-xs">
                            <div>
                              <span className="text-slate-500 font-medium">Resultado aportado por mecánico: </span>
                              <strong className="font-mono text-slate-900 font-black">"{matchingMeasurement.measuredValue}"</strong>
                              <span
                                className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  matchingMeasurement.isWithinSpec
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {matchingMeasurement.isWithinSpec ? 'DENTRO DE TOLERANCIA' : 'FUERA DE ESPECIFICACIÓN'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(matchingMeasurement.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Safety Disclaimers: Never replace without physical test */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 font-medium">
                  <strong className="font-bold">Regla de Oro de Diagnóstico:</strong>
                  <p className="leading-snug text-amber-800">
                    No sustituya componentes basándose únicamente en códigos DTC de memoria. Verifique previamente caídas de tensión, masas y continuidad en el cableado con el multímetro u osciloscopio antes de autorizar la orden de recambio.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center text-xs text-slate-400 shadow-sm">
              Seleccione una hipótesis en la columna izquierda para inspeccionar las pruebas técnicas.
            </div>
          )}
        </div>
      </div>

      {/* Workshop Measurement Recording Modal */}
      {measurementModalOpen && activeStepForMeasurement && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-2xl bg-red-50 text-red-600">
                  <Activity className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">Registrar Medición de Taller</h3>
                  <p className="text-xs text-slate-500 font-medium">Paso #{activeStepForMeasurement.stepNumber}: {activeStepForMeasurement.name}</p>
                </div>
              </div>
              <button
                onClick={() => setMeasurementModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitMeasurement} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 font-mono font-bold uppercase text-[10px]">VALOR ESPERADO DOCUMENTADO:</span>
                <p className="text-red-600 font-mono font-black">{activeStepForMeasurement.referenceValues}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lectura Obtenida en Multímetro / Osciloscopio / Manómetro *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 0.45 bar de vacío / 11.4V / Caída de 0.85V en masa / Señal PWM distorsionada"
                  value={measuredValue}
                  onChange={(e) => setMeasuredValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono font-bold focus:border-red-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dictamen del Técnico frente a Tolerancia OEM:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsWithinSpec(true)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      isWithinSpec
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-black'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Conforme (Dentro de norma)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsWithinSpec(false)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      !isWithinSpec
                        ? 'bg-red-50 border-red-500 text-red-800 font-black'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Falla (Fuera de tolerancia)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notas de Campo / Condiciones de Prueba
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Al forzar la varilla con la mano tiene holgura lateral apreciable / Ruido audible de fuga de aire"
                  value={measurementNotes}
                  onChange={(e) => setMeasurementNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-medium focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMeasurementModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMeasurement}
                  className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingMeasurement ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                  )}
                  <span>Reevaluar Diagnóstico con IA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
