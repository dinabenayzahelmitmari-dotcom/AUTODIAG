/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Cpu,
  Car,
  Activity,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { FaultRecord, Vehicle } from '../../types';

interface FaultsListViewProps {
  faults: FaultRecord[];
  vehicles: Vehicle[];
  onOpenNewFaultModal: () => void;
  onSelectFaultForDiagnosis: (fault: FaultRecord) => void;
  onDeleteFault: (id: string) => void;
}

export const FaultsListView: React.FC<FaultsListViewProps> = ({
  faults,
  vehicles,
  onOpenNewFaultModal,
  onSelectFaultForDiagnosis,
  onDeleteFault,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredFaults = faults.filter((f) => {
    const v = vehicles.find((item) => item.id === f.vehicleId);
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.dtcCodes.some((d) => d.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v && v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = categoryFilter === 'all' || f.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const getVehicle = (vId: string) => vehicles.find((v) => v.id === vId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
                <AlertTriangle className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Registro y Catálogo de Averías
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Historial de códigos DTC, síntomas observados y condiciones de fallo para cada vehículo.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenNewFaultModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-md shadow-red-600/20 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Avería / DTC</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código DTC (P0299, P0A0D), matrícula o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-11 pr-4 py-2.5 text-xs text-slate-800 font-medium focus:border-red-500 focus:bg-white focus:outline-none transition shadow-inner"
            />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold shrink-0">Categoría:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-800 font-bold focus:border-red-500 focus:outline-none uppercase font-mono cursor-pointer"
            >
              <option value="all">TODAS LAS CATEGORÍAS</option>
              <option value="electromechanical">ELECTROMECÁNICA</option>
              <option value="electrical">ELÉCTRICA</option>
              <option value="electronic">ELECTRÓNICA</option>
              <option value="high_voltage">ALTA TENSIÓN</option>
              <option value="can_network">RED CAN</option>
              <option value="engine">MOTOR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Faults Cards */}
      <div className="space-y-3.5">
        {filteredFaults.length === 0 && (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
            <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No hay averías registradas con estos filtros.</p>
            <button
              onClick={onOpenNewFaultModal}
              className="px-5 py-2 bg-red-600 text-white font-bold rounded-full text-xs shadow-md shadow-red-600/20"
            >
              + Registrar Nueva Avería
            </button>
          </div>
        )}
        {filteredFaults.map((fault) => {
          const vehicle = getVehicle(fault.vehicleId);

          return (
            <div
              key={fault.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-3.5 hover:border-slate-300 transition shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {vehicle && (
                      <span className="px-3 py-1 rounded-xl font-mono font-black text-xs bg-slate-100 text-slate-900 border border-slate-200">
                        {vehicle.licensePlate} ({vehicle.brand} {vehicle.model})
                      </span>
                    )}

                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase ${
                        fault.severity === 'critical'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {fault.severity}
                    </span>

                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold font-mono border border-slate-200">
                      {fault.category}
                    </span>

                    {fault.hasHighVoltageRisk && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black border border-amber-300 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-600" /> RIESGO ALTA TENSIÓN
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {fault.title}
                  </h3>

                  {/* DTC tags */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {fault.dtcCodes.map((dtc) => (
                      <span
                        key={dtc.code}
                        className="px-3 py-1 rounded-xl bg-red-50 border border-red-200 font-mono font-black text-xs text-red-600"
                      >
                        {dtc.code}
                        <span className="text-slate-500 font-medium ml-1.5">
                          ({dtc.ecu})
                        </span>
                      </span>
                    ))}
                  </div>

                  {/* Observed symptoms */}
                  <div className="pt-2 text-xs text-slate-700 space-y-1">
                    <span className="text-slate-400 block font-mono text-[10px] uppercase font-bold">
                      Síntomas Documentados:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 font-medium">
                      {fault.observedSymptoms.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="text-xs text-slate-400 font-mono font-semibold">
                    {new Date(fault.createdAt).toLocaleDateString('es-ES')}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectFaultForDiagnosis(fault)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-md shadow-red-600/20 cursor-pointer"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Abrir Asistente IA</span>
                    </button>

                    <button
                      onClick={() => onDeleteFault(fault.id)}
                      className="p-2.5 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-red-600 border border-slate-200 transition cursor-pointer"
                      title="Eliminar avería"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
