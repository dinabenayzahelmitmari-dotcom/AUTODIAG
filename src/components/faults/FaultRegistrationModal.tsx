/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Sparkles,
  Car,
  Search,
  Plus,
  Trash2,
  Cpu,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import {
  Vehicle,
  FaultRecord,
  DTCItem,
  FaultFrequency,
  FaultSeverity,
  FaultCategory,
} from '../../types';
import { automotiveApi } from '../../services/api';

interface FaultRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  defaultVehicleId?: string;
  onSaveFault: (newFault: FaultRecord) => void;
}

export const FaultRegistrationModal: React.FC<FaultRegistrationModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  defaultVehicleId,
  onSaveFault,
}) => {
  const [vehicleId, setVehicleId] = useState(defaultVehicleId || vehicles[0]?.id || '');
  const [title, setTitle] = useState('');
  const [symptomInput, setSymptomInput] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([
    'Tirones en aceleración fuerte',
    'Pérdida de potencia acusada en pendientes (Modo degradado)',
  ]);
  const [dashboardWarnings, setDashboardWarnings] = useState<string[]>([
    'MIL / Check Engine',
    'Testigo de Precalentamiento',
  ]);
  const [dtcCodes, setDtcCodes] = useState<DTCItem[]>([
    { code: 'P0299', ecu: 'J623 (ECM Motor)', status: 'permanent', description: 'Presión de sobrealimentación baja' },
  ]);
  const [frequency, setFrequency] = useState<FaultFrequency>('intermittent');
  const [category, setCategory] = useState<FaultCategory>('electromechanical');
  const [severity, setSeverity] = useState<FaultSeverity>('high');
  const [engineTemp, setEngineTemp] = useState('Temperatura de servicio (85°C - 90°C)');
  const [batteryVoltage, setBatteryVoltage] = useState('12.6');
  const [rpmOrSpeed, setRpmOrSpeed] = useState('A partir de 2.200 RPM en 4ª marcha');
  const [drivingCondition, setDrivingCondition] = useState('Aceleración a plena carga');
  const [priorRepairs, setPriorRepairs] = useState('');
  const [preliminaryChecks, setPreliminaryChecks] = useState('');
  const [hasHighVoltageRisk, setHasHighVoltageRisk] = useState(false);
  const [hasSafetyRisk, setHasSafetyRisk] = useState(false);

  // Quick DTC Input helper
  const [newDtcCode, setNewDtcCode] = useState('');
  const [newDtcEcu, setNewDtcEcu] = useState('ECM');
  const [isLookingUpDTC, setIsLookingUpDTC] = useState(false);

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  // Sync high voltage risk if vehicle is hybrid/electric
  React.useEffect(() => {
    if (selectedVehicle) {
      if (
        selectedVehicle.fuelType === 'hybrid' ||
        selectedVehicle.fuelType === 'electric' ||
        selectedVehicle.systemVoltage.includes('high_voltage')
      ) {
        setHasHighVoltageRisk(true);
      }
    }
  }, [selectedVehicle]);

  if (!isOpen) return null;

  const handleAddSymptom = () => {
    if (symptomInput.trim()) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const handleRemoveSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const toggleWarning = (warning: string) => {
    if (dashboardWarnings.includes(warning)) {
      setDashboardWarnings(dashboardWarnings.filter((w) => w !== warning));
    } else {
      setDashboardWarnings([...dashboardWarnings, warning]);
    }
  };

  const handleAddDTC = async () => {
    const code = newDtcCode.trim().toUpperCase();
    if (!code) return;

    setIsLookingUpDTC(true);
    let desc = '';
    try {
      const lookup = await automotiveApi.lookupDTC(code, selectedVehicle?.brand);
      desc = lookup.title || '';
    } catch {
      desc = 'Código registrado en máquina de diagnosis';
    } finally {
      setIsLookingUpDTC(false);
    }

    setDtcCodes([
      ...dtcCodes,
      {
        code,
        ecu: newDtcEcu,
        status: 'permanent',
        description: desc,
      },
    ]);
    setNewDtcCode('');
  };

  const handleRemoveDTC = (code: string) => {
    setDtcCodes(dtcCodes.filter((d) => d.code !== code));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !title.trim()) return;

    const newFault: FaultRecord = {
      id: `flt-${Date.now()}`,
      vehicleId,
      title: title.trim(),
      observedSymptoms: symptoms.length > 0 ? symptoms : ['Anomalía en funcionamiento'],
      dashboardWarnings,
      dtcCodes,
      frequency,
      category,
      severity,
      conditions: {
        engineTemp,
        batteryVoltage: parseFloat(batteryVoltage) || 12.6,
        rpmOrSpeed,
        drivingCondition,
      },
      priorRepairs: priorRepairs.trim(),
      preliminaryChecks: preliminaryChecks.trim(),
      hasHighVoltageRisk,
      hasSafetyRisk,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    onSaveFault(newFault);
    onClose();
  };

  const commonWarningsList = [
    'MIL / Check Engine',
    'Testigo de Precalentamiento',
    'Testigo ABS',
    'Testigo ESP / Antideslizamiento',
    'Avería Sistema Híbrido',
    'Testigo Batería 12V',
    'Testigo Airbag / SRS',
    'Fallo Dirección Asistida',
    'Filtro de Partículas DPF',
    'Presión de Aceite',
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl my-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
              <Sparkles className="w-6 h-6 fill-red-600" />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-900">Registro Inteligente de Avería</h2>
              <p className="text-xs text-slate-500 font-medium">
                Documente síntomas, códigos DTC, telemetría y condiciones para el asistente de IA.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Vehicle Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-red-600" />
              Vehículo Afectado *
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:border-red-500 focus:bg-white focus:outline-none"
              required
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.licensePlate} - {v.brand} {v.model} ({v.engineCode || 'Motor'}) - {v.fuelType}
                </option>
              ))}
            </select>
          </div>

          {/* Fault Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Título Técnico de la Incidencia *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Falta de potencia bajo carga y código P0299 con testigo de precalentamiento"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none font-bold"
            />
          </div>

          {/* Category, Frequency & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FaultCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:border-red-500 focus:outline-none"
              >
                <option value="electromechanical">Electromecánica</option>
                <option value="electrical">Eléctrica (Cableado/Masa)</option>
                <option value="electronic">Electrónica / ECUs</option>
                <option value="high_voltage">Alta Tensión (HV 400V/800V)</option>
                <option value="can_network">Red CAN / Multiplexado</option>
                <option value="engine">Motor Térmico</option>
                <option value="transmission">Caja de Cambios</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Frecuencia</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as FaultFrequency)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:border-red-500 focus:outline-none"
              >
                <option value="intermittent">Intermitente (Aparece y desaparece)</option>
                <option value="permanent">Permanente (Fijo continuo)</option>
                <option value="sporadic">Esporádica (Baches / Ocasional)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gravedad</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as FaultSeverity)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:border-red-500 focus:outline-none"
              >
                <option value="high">Alta (Inmovilización parcial / Limp Mode)</option>
                <option value="critical">Crítica (Vehículo parado / Alta tensión)</option>
                <option value="medium">Media (Aviso en cuadro sin parada)</option>
                <option value="low">Leve (Molestia acústica / Confort)</option>
              </select>
            </div>
          </div>

          {/* DTC Input & List */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase font-mono">
              <Cpu className="w-4 h-4 text-red-600" />
              Códigos de Avería DTC (ISO 15031 / OBD-II)
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej. P0300, P0299, U0100..."
                value={newDtcCode}
                onChange={(e) => setNewDtcCode(e.target.value)}
                className="w-36 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-red-600 font-mono font-black uppercase focus:border-red-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="ECU (ej. ECM, TCM, BCM, ABS)"
                value={newDtcEcu}
                onChange={(e) => setNewDtcEcu(e.target.value)}
                className="w-36 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:border-red-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddDTC}
                disabled={isLookingUpDTC || !newDtcCode.trim()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isLookingUpDTC ? 'Consultando...' : 'Añadir DTC'}</span>
              </button>
            </div>

            {/* Added DTC tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {dtcCodes.map((dtc) => (
                <div
                  key={dtc.code}
                  className="px-3 py-1.5 rounded-xl bg-white border border-red-200 text-xs font-mono flex items-center gap-2 shadow-sm"
                >
                  <span className="text-red-600 font-black">{dtc.code}</span>
                  <span className="text-slate-500 font-medium">({dtc.ecu})</span>
                  {dtc.description && (
                    <span className="text-slate-700 text-[11px] truncate max-w-[200px]">
                      {dtc.description}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveDTC(dtc.code)}
                    className="text-slate-400 hover:text-red-600 font-bold ml-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Warnings selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Testigos Iluminados en Cuadro de Instrumentos:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {commonWarningsList.map((warning) => {
                const isSelected = dashboardWarnings.includes(warning);
                return (
                  <button
                    key={warning}
                    type="button"
                    onClick={() => toggleWarning(warning)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition border cursor-pointer ${
                      isSelected
                        ? 'bg-red-50 text-red-700 border-red-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {warning}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symptoms input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Síntomas Observados por el Conductor / Mecánico:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Añadir síntoma (ej. No arranca en caliente, humo negro, chirrido en frío...)"
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSymptom();
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:border-red-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSymptom}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Añadir
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {symptoms.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 font-medium flex items-center gap-1.5"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSymptom(idx)}
                    className="text-slate-400 hover:text-red-600 font-bold"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Operating Conditions: Temp, Voltage, RPM, Road */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1 uppercase">
                Temperatura Motor al Fallar
              </label>
              <input
                type="text"
                value={engineTemp}
                onChange={(e) => setEngineTemp(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1 uppercase">
                Tensión Batería (V)
              </label>
              <input
                type="text"
                value={batteryVoltage}
                onChange={(e) => setBatteryVoltage(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1 uppercase">
                Régimen / Velocidad
              </label>
              <input
                type="text"
                value={rpmOrSpeed}
                onChange={(e) => setRpmOrSpeed(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1 uppercase">
                Condición Dinámica
              </label>
              <input
                type="text"
                value={drivingCondition}
                onChange={(e) => setDrivingCondition(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Prior Repairs and Preliminary checks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reparaciones Previas Efectuadas
              </label>
              <textarea
                rows={2}
                placeholder="Ej. Se cambió sensor MAP en otro taller sin mejoría..."
                value={priorRepairs}
                onChange={(e) => setPriorRepairs(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 font-medium focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Comprobaciones Preliminares Ya Realizadas
              </label>
              <textarea
                rows={2}
                placeholder="Ej. Revisados manguitos de intercooler, estancos..."
                value={preliminaryChecks}
                onChange={(e) => setPreliminaryChecks(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 font-medium focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Safety Checkboxes */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-bold">
              <input
                type="checkbox"
                checked={hasHighVoltageRisk}
                onChange={(e) => setHasHighVoltageRisk(e.target.checked)}
                className="rounded text-red-600 focus:ring-0"
              />
              <span className="text-amber-800">⚡ Involucra Alta Tensión (Híbrido / Eléctrico)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-bold">
              <input
                type="checkbox"
                checked={hasSafetyRisk}
                onChange={(e) => setHasSafetyRisk(e.target.checked)}
                className="rounded text-red-600 focus:ring-0"
              />
              <span>Involucra Seguridad Crítica (Frenos / Airbag / Dirección)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md shadow-red-600/20 cursor-pointer"
            >
              Guardar y Abrir en Asistente IA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
