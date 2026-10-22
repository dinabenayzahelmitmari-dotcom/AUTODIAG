/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Car,
  Plus,
  Search,
  ShieldAlert,
  Wrench,
  AlertTriangle,
  Cpu,
  Edit2,
  Trash2,
  Zap,
} from 'lucide-react';
import { Vehicle, Client, FaultRecord, WorkOrder } from '../../types';

interface VehicleManagementViewProps {
  vehicles: Vehicle[];
  clients: Client[];
  faults: FaultRecord[];
  workOrders: WorkOrder[];
  onOpenCreateVehicleModal: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onSelectVehicleForDiagnosis: (vehicle: Vehicle) => void;
  onNewOrderForVehicle: (vehicle: Vehicle) => void;
}

export const VehicleManagementView: React.FC<VehicleManagementViewProps> = ({
  vehicles,
  clients,
  faults,
  workOrders,
  onOpenCreateVehicleModal,
  onEditVehicle,
  onDeleteVehicle,
  onSelectVehicleForDiagnosis,
  onNewOrderForVehicle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.engineCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const getClient = (clientId: string) => {
    return clients.find((c) => c.id === clientId);
  };

  const vehicleFaults = faults.filter((f) => f.vehicleId === selectedVehicle?.id);
  const vehicleOrders = workOrders.filter((o) => o.vehicleId === selectedVehicle?.id);

  const isHighVoltage =
    selectedVehicle &&
    (selectedVehicle.systemVoltage === '400V_high_voltage' ||
      selectedVehicle.systemVoltage === '800V_high_voltage' ||
      selectedVehicle.fuelType === 'hybrid' ||
      selectedVehicle.fuelType === 'electric' ||
      selectedVehicle.fuelType === 'phev');

  return (
    <div className="space-y-6">
      {/* Header and Actions Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
                <Car className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Flota y Fichas Técnicas de Vehículos
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Gestione bastidores (VIN), arquitecturas de motor, ECUs instaladas y sistemas de alta tensión.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenCreateVehicleModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-md shadow-red-600/20 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nuevo Vehículo</span>
          </button>
        </div>

        {/* Search */}
        <div className="mt-5 pt-4 border-t border-slate-100 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por matrícula (4829-KMN), VIN, código motor (CRLB), modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-11 pr-4 py-2.5 text-xs text-slate-800 font-medium focus:border-red-500 focus:bg-white focus:outline-none transition shadow-inner"
          />
        </div>
      </div>

      {/* Main Grid: Vehicle Cards on Left, Detailed Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vehicles list (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-2">
            <span>Vehículos registrados ({filteredVehicles.length})</span>
            <span>Seleccione para ver historial</span>
          </div>

          <div className="space-y-3">
            {filteredVehicles.length === 0 && (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
                <Car className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No hay ningún vehículo registrado con este criterio de búsqueda.</p>
                <button
                  onClick={onOpenCreateVehicleModal}
                  className="px-5 py-2 bg-red-600 text-white font-bold rounded-full text-xs shadow-md shadow-red-600/20"
                >
                  + Registrar Vehículo
                </button>
              </div>
            )}
            {filteredVehicles.map((vehicle) => {
              const isSelected = selectedVehicle?.id === vehicle.id;
              const isHV =
                vehicle.systemVoltage.includes('high_voltage') ||
                vehicle.fuelType === 'hybrid' ||
                vehicle.fuelType === 'electric';

              return (
                <div
                  key={vehicle.id}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-50/40 border-2 border-red-600 shadow-md shadow-red-600/10'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono font-black text-slate-900 text-sm tracking-wider bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                      {vehicle.licensePlate}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isHV && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-600" /> HV
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        {vehicle.year}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 mb-0.5">
                    {vehicle.brand} {vehicle.model}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                    {vehicle.versionTrim}
                  </p>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Motor: <strong className="text-slate-800 font-bold">{vehicle.engineCode || 'N/A'}</strong></span>
                    <span>{vehicle.mileage.toLocaleString()} km</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Vehicle Detail Dossier (7 cols) */}
        <div className="lg:col-span-7">
          {selectedVehicle ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-6 shadow-sm sticky top-24">
              {/* Top Banner of Vehicle */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono font-black text-lg text-slate-900 bg-slate-100 px-3.5 py-1 rounded-2xl border border-slate-200">
                      {selectedVehicle.licensePlate}
                    </span>
                    {isHighVoltage && (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300 flex items-center gap-1 animate-pulse">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        ALTA TENSIÓN ({selectedVehicle.systemVoltage})
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    {selectedVehicle.brand} {selectedVehicle.model}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">{selectedVehicle.versionTrim}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditVehicle(selectedVehicle)}
                    className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                    title="Editar ficha"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteVehicle(selectedVehicle.id)}
                    className="p-2.5 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-red-600 border border-slate-200 transition cursor-pointer"
                    title="Eliminar vehículo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">BASTIDOR (VIN)</span>
                  <strong className="text-slate-900 font-mono block truncate font-black mt-0.5">{selectedVehicle.vin || 'Desconocido'}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">CÓDIGO MOTOR</span>
                  <strong className="text-red-600 font-mono block font-black mt-0.5">{selectedVehicle.engineCode || 'N/A'}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">POTENCIA / CILINDRADA</span>
                  <strong className="text-slate-800 font-mono block font-bold mt-0.5">{selectedVehicle.powerHp} CV ({selectedVehicle.displacement})</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">COMBUSTIBLE</span>
                  <strong className="text-slate-800 uppercase block font-bold mt-0.5">{selectedVehicle.fuelType}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">CAMBIO Y TRACCIÓN</span>
                  <strong className="text-slate-800 block font-bold mt-0.5">{selectedVehicle.transmission} ({selectedVehicle.driveType})</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">SISTEMA INYECCIÓN</span>
                  <strong className="text-slate-800 block truncate font-bold mt-0.5">{selectedVehicle.injectionType}</strong>
                </div>
              </div>

              {/* Control Units (ECUs) tags */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block uppercase font-mono">
                  Módulos y Centralitas Electrónicas (ECUs):
                </span>
                <div className="flex flex-wrap gap-2">
                  {(selectedVehicle.installedECUs || []).map((ecu, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-200"
                    >
                      {ecu}
                    </span>
                  ))}
                </div>
              </div>

              {/* Linked Owner Client */}
              {getClient(selectedVehicle.clientId) && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono font-bold block">CLIENTE / TITULAR</span>
                    <strong className="text-slate-900 font-bold text-sm">{getClient(selectedVehicle.clientId)?.fullName}</strong>
                    <span className="text-slate-500 ml-2 font-mono">({getClient(selectedVehicle.clientId)?.phone})</span>
                  </div>
                  <span className="text-slate-600 font-mono text-xs font-semibold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {getClient(selectedVehicle.clientId)?.dniCif}
                  </span>
                </div>
              )}

              {/* Associated Faults */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Averías Registradas ({vehicleFaults.length})
                  </span>
                  <button
                    onClick={() => onSelectVehicleForDiagnosis(selectedVehicle)}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-bold cursor-pointer"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Abrir en IA Diagnosis</span>
                  </button>
                </div>

                {vehicleFaults.length === 0 ? (
                  <p className="text-xs text-slate-400 p-4 bg-slate-50 rounded-2xl text-center border border-slate-100">
                    No hay averías abiertas para este vehículo.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {vehicleFaults.map((f) => (
                      <div
                        key={f.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{f.title}</div>
                          <div className="text-[11px] text-red-600 font-mono font-bold mt-0.5">
                            DTCs: {f.dtcCodes.map((d) => d.code).join(', ')}
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-700 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                          {f.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Action Footer */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                <button
                  onClick={() => onNewOrderForVehicle(selectedVehicle)}
                  className="flex-1 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-slate-600" />
                  <span>Crear Orden de Trabajo</span>
                </button>
                <button
                  onClick={() => onSelectVehicleForDiagnosis(selectedVehicle)}
                  className="flex-1 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition cursor-pointer"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Iniciar Diagnosis IA</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center text-xs text-slate-400 shadow-sm">
              Seleccione un vehículo para ver su ficha técnica completa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
