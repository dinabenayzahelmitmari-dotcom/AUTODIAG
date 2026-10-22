/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Car,
  ShieldAlert,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import {
  Vehicle,
  Client,
  FuelType,
  TransmissionType,
  DriveType,
  SystemVoltageType,
} from '../../types';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
  clients: Client[];
  initialVehicle?: Vehicle | null;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  initialVehicle,
}) => {
  const [clientId, setClientId] = useState(initialVehicle?.clientId || clients[0]?.id || '');
  const [brand, setBrand] = useState(initialVehicle?.brand || 'Volkswagen');
  const [model, setModel] = useState(initialVehicle?.model || 'Golf VII');
  const [versionTrim, setVersionTrim] = useState(initialVehicle?.versionTrim || '2.0 TDI Advance');
  const [year, setYear] = useState(initialVehicle?.year || 2018);
  const [registrationDate, setRegistrationDate] = useState(
    initialVehicle?.registrationDate || '2018-05-15'
  );
  const [licensePlate, setLicensePlate] = useState(initialVehicle?.licensePlate || '5420-KPP');
  const [vin, setVin] = useState(initialVehicle?.vin || 'WVWZZZAUZJP192830');
  const [engineCode, setEngineCode] = useState(initialVehicle?.engineCode || 'CRLB');
  const [displacement, setDisplacement] = useState(initialVehicle?.displacement || '1968 cc');
  const [powerHp, setPowerHp] = useState(initialVehicle?.powerHp || 150);
  const [mileage, setMileage] = useState(initialVehicle?.mileage || 145000);
  const [transmission, setTransmission] = useState<TransmissionType>(
    initialVehicle?.transmission || 'manual'
  );
  const [driveType, setDriveType] = useState<DriveType>(initialVehicle?.driveType || 'FWD');
  const [fuelType, setFuelType] = useState<FuelType>(initialVehicle?.fuelType || 'diesel');
  const [systemVoltage, setSystemVoltage] = useState<SystemVoltageType>(
    initialVehicle?.systemVoltage || '12V'
  );
  const [injectionType, setInjectionType] = useState(
    initialVehicle?.injectionType || 'Common Rail Bosch CP4'
  );
  const [ecuInput, setEcuInput] = useState('');
  const [installedECUs, setInstalledECUs] = useState<string[]>(
    initialVehicle?.installedECUs || ['J623 (Motor ECM)', 'J519 (BCM)', 'J104 (ABS/ESP)', 'J533 (Gateway)']
  );
  const [electronicEquipment, setElectronicEquipment] = useState(
    initialVehicle?.electronicEquipment || 'Start-Stop, Sensor Radar Front Assist, Climatronic'
  );
  const [notes, setNotes] = useState(initialVehicle?.notes || '');

  if (!isOpen) return null;

  const handleAddECU = () => {
    if (ecuInput.trim()) {
      setInstalledECUs([...installedECUs, ecuInput.trim()]);
      setEcuInput('');
    }
  };

  const handleRemoveECU = (idx: number) => {
    setInstalledECUs(installedECUs.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const vehicleData: Vehicle = {
      id: initialVehicle?.id || `veh-${Date.now()}`,
      clientId: clientId || 'cli-001',
      brand: brand.trim(),
      model: model.trim(),
      versionTrim: versionTrim.trim(),
      year: Number(year) || 2020,
      registrationDate,
      licensePlate: licensePlate.trim().toUpperCase(),
      vin: vin.trim().toUpperCase(),
      engineCode: engineCode.trim().toUpperCase(),
      displacement: displacement.trim(),
      powerHp: Number(powerHp) || 100,
      mileage: Number(mileage) || 0,
      transmission,
      driveType,
      fuelType,
      systemVoltage,
      injectionType: injectionType.trim(),
      installedECUs,
      electronicEquipment: electronicEquipment.trim(),
      notes: notes.trim(),
      createdAt: initialVehicle?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(vehicleData);
    onClose();
  };

  const isHighVoltage =
    systemVoltage === '400V_high_voltage' ||
    systemVoltage === '800V_high_voltage' ||
    fuelType === 'hybrid' ||
    fuelType === 'phev' ||
    fuelType === 'electric';

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl my-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
              <Car className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {initialVehicle ? 'Editar Ficha Técnica de Vehículo' : 'Ficha Técnica Completa de Vehículo'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Registro de identificación, arquitectura electromecánica y unidades de control.
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
          {/* Section 1: Identification */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-red-600 uppercase tracking-wider font-mono">
              1. Identificación del Vehículo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Marca *</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ej: Volkswagen, BMW, Toyota..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:border-red-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Modelo *</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Ej: Golf VII, Auris, Serie 3..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:border-red-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Versión / Acabado</label>
                <input
                  type="text"
                  value={versionTrim}
                  onChange={(e) => setVersionTrim(e.target.value)}
                  placeholder="Ej: 2.0 TDI Advance BMT"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:border-red-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Matrícula *</label>
                <input
                  type="text"
                  required
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="4829-KMN"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-black focus:border-red-500 focus:bg-white focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Número de Bastidor (VIN)</label>
                <input
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  placeholder="WVWZZZAUZHP189201"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:border-red-500 focus:bg-white focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Año de Fabricación</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kilometraje Actual</label>
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Código de Motor *</label>
                <input
                  type="text"
                  value={engineCode}
                  onChange={(e) => setEngineCode(e.target.value)}
                  placeholder="Ej: CRLB, N47D20C, 2ZR-FXE"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-red-600 font-mono font-black uppercase focus:border-red-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cilindrada y Potencia</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displacement}
                    onChange={(e) => setDisplacement(e.target.value)}
                    placeholder="1968 cc"
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-mono"
                  />
                  <input
                    type="number"
                    value={powerHp}
                    onChange={(e) => setPowerHp(Number(e.target.value))}
                    placeholder="150 CV"
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Propietario / Cliente</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.dniCif})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Technical & Powertrain */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-black text-red-600 uppercase tracking-wider font-mono">
              2. Características Técnicas y Red Eléctrica
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Combustible</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as FuelType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none"
                >
                  <option value="diesel">Diésel</option>
                  <option value="gasoline">Gasolina</option>
                  <option value="hybrid">Híbrido (HEV)</option>
                  <option value="phev">Híbrido Enchufable (PHEV)</option>
                  <option value="electric">Eléctrico Puro (BEV)</option>
                  <option value="lpg">GLP / Gas Licuado</option>
                  <option value="cng">GNC / Gas Natural</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Transmisión</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value as TransmissionType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none"
                >
                  <option value="manual">Manual</option>
                  <option value="automatic">Automática Convertidor</option>
                  <option value="dual_clutch">Doble Embrague (DSG/DCT)</option>
                  <option value="cvt">Variador Continuo (CVT/e-CVT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tracción</label>
                <select
                  value={driveType}
                  onChange={(e) => setDriveType(e.target.value as DriveType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none"
                >
                  <option value="FWD">Delantera (FWD)</option>
                  <option value="RWD">Trasera (RWD)</option>
                  <option value="AWD">Total Permanente (AWD)</option>
                  <option value="4WD">4x4 Conectable (4WD)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <span>Tensión Sistema *</span>
                  {isHighVoltage && <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />}
                </label>
                <select
                  value={systemVoltage}
                  onChange={(e) => setSystemVoltage(e.target.value as SystemVoltageType)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none ${
                    isHighVoltage
                      ? 'border-amber-400 bg-amber-50 text-amber-900'
                      : 'border-slate-200 bg-slate-50 text-slate-900'
                  }`}
                >
                  <option value="12V">12V Estándar</option>
                  <option value="24V">24V Vehículo Industrial</option>
                  <option value="48V_mild_hybrid">48V Microhíbrido (MHEV)</option>
                  <option value="400V_high_voltage">400V Alta Tensión (Híbrido/EV)</option>
                  <option value="800V_high_voltage">800V Ultra Alta Tensión (EV)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sistema de Inyección / Alimentación
                </label>
                <input
                  type="text"
                  value={injectionType}
                  onChange={(e) => setInjectionType(e.target.value)}
                  placeholder="Ej: Common Rail Bosch CP4 / Directa TSI"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Equipamiento Electrónico Relevante
                </label>
                <input
                  type="text"
                  value={electronicEquipment}
                  onChange={(e) => setElectronicEquipment(e.target.value)}
                  placeholder="Ej: Start-Stop, ADAS Front Assist, Xénon..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Installed Control Units (ECUs) */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-black text-red-600 uppercase tracking-wider font-mono">
              3. Unidades de Control Electrónico (ECUs) Instaladas
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Añadir ECU (ej. J500 Dirección EPS, BMS Batería, TCM Caja...)"
                value={ecuInput}
                onChange={(e) => setEcuInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddECU();
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
              />
              <button
                type="button"
                onClick={handleAddECU}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                + Añadir
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {installedECUs.map((ecu, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 font-mono font-bold flex items-center gap-1.5"
                >
                  <span>{ecu}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveECU(idx)}
                    className="text-slate-400 hover:text-red-600 font-bold ml-1"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Historial y Notas de Taller
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Historial de distribución, campañas de servicio OEM o advertencias..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 font-medium"
            />
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
              Guardar Ficha de Vehículo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
