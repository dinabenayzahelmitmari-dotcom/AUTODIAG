/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Car,
  AlertTriangle,
  Wrench,
  Cpu,
  Clock,
  ArrowRight,
  ShieldAlert,
  Search,
  CheckCircle2,
  TrendingUp,
  Euro,
  ShieldCheck,
  Camera,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Vehicle, FaultRecord, WorkOrder, Client } from '../../types';

interface DashboardViewProps {
  vehicles: Vehicle[];
  faults: FaultRecord[];
  workOrders: WorkOrder[];
  clients: Client[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onSelectFaultForDiagnosis: (fault: FaultRecord) => void;
  onNavigateTab: (tab: any) => void;
  onOpenNewFaultModal: () => void;
  onLoadFullDemoData: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  vehicles,
  faults,
  workOrders,
  clients,
  onSelectVehicle,
  onSelectFaultForDiagnosis,
  onNavigateTab,
  onOpenNewFaultModal,
  onLoadFullDemoData,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'hoy' | 'este_mes' | 'ano_2026'>('este_mes');

  const activeOrders = workOrders.filter((o) => o.status !== 'delivered');
  const openFaults = faults.filter((f) => f.status !== 'resolved');
  const urgentOrders = workOrders.filter((o) => o.priority === 'urgent' || o.priority === 'high');

  const totalBudget = workOrders.reduce((sum, o) => sum + (o.totalEstimate || 0), 0);

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.fullName || 'Cliente particular';
  };

  const getVehicleInfo = (vehicleId: string) => {
    return vehicles.find((v) => v.id === vehicleId);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Top Title Card with Period Selector (Exact replica of reference) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Panel de Control (Dashboard)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Seguimiento de diagnósticos, códigos de avería DTC, comprobaciones eléctricas e intervenciones en taller.
          </p>
        </div>

        {/* Period Pills Selector */}
        <div className="bg-slate-100 rounded-full p-1.5 flex items-center gap-1 self-start md:self-auto shrink-0 border border-slate-200">
          <button
            onClick={() => setSelectedPeriod('hoy')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              selectedPeriod === 'hoy'
                ? 'bg-[#0b1329] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setSelectedPeriod('este_mes')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              selectedPeriod === 'este_mes'
                ? 'bg-[#0b1329] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Este Mes
          </button>
          <button
            onClick={() => setSelectedPeriod('ano_2026')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              selectedPeriod === 'ano_2026'
                ? 'bg-[#0b1329] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Año 2026
          </button>
        </div>
      </div>

      {/* If empty, show full demo load banner */}
      {vehicles.length === 0 && (
        <div className="bg-white rounded-3xl p-6 border-2 border-dashed border-red-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Base de Datos del Taller sin Registros Activos</span>
            </h3>
            <p className="text-xs text-slate-500">
              No hay vehículos ni averías registradas. Puede cargar de forma inmediata el catálogo completo de demostración.
            </p>
          </div>
          <button
            onClick={onLoadFullDemoData}
            className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 transition"
          >
            Cargar Datos de Taller
          </button>
        </div>
      )}

      {/* 2. Four KPI Cards Grid (Exact matching of style, typography, and borders) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Vehículos Gestionados */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              VEHÍCULOS GESTIONADOS
            </span>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Car className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-4xl font-black text-slate-900 font-mono tracking-tight">
              {vehicles.length}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>{activeOrders.length} en taller</span>
            <span>{workOrders.filter((o) => o.status === 'delivered').length} entregados</span>
          </div>
        </div>

        {/* Card 2: Averías / Diagnósticos Activos (With RED vertical stripe accent on right edge!) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 border-r-4 border-r-red-600 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              AVERÍAS EN DIAGNOSIS
            </span>
            <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-red-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-4xl font-black text-slate-900 font-mono tracking-tight">
              {openFaults.length}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Resolución activa</span>
            <span className="font-bold text-emerald-600 font-mono">96%</span>
          </div>
        </div>

        {/* Card 3: Volumen / Presupuestos en Curso */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              PRESUPUESTOS Y RECAMBIOS
            </span>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Euro className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-4xl font-black text-slate-900 font-mono tracking-tight">
              {totalBudget.toLocaleString()} €
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Facturación estimada</span>
            <span className="font-mono text-slate-600">Garantía OEM</span>
          </div>
        </div>

        {/* Card 4: Auditorías y Protocolos Técnicos */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              AUDITORÍAS Y PROTOCOLOS
            </span>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-4xl font-black text-slate-900 font-mono tracking-tight">
              {vehicles.filter((v) => v.fuelType === 'hybrid' || v.fuelType === 'electric').length > 0 ? '100%' : '12'}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>120 puntos mecánicos</span>
            <span className="text-slate-600 font-medium">Sin fallos</span>
          </div>
        </div>
      </div>

      {/* 3. AI Modules Bottom Bar (Exact replica of reference bottom strip) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-slate-500 tracking-wider uppercase font-mono">
          MÓDULOS IA:
        </span>

        <button
          onClick={() => onNavigateTab('diagnosis')}
          className="bg-[#0b1329] hover:bg-[#131d38] text-white rounded-full px-4 py-2 flex items-center gap-2.5 text-xs font-bold transition shadow-sm"
        >
          <Camera className="w-4 h-4 text-red-500" />
          <span>Peritaje Fotográfico y Detección de Averías</span>
          <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
            IA MULTIMODAL
          </span>
        </button>

        <button
          onClick={() => onNavigateTab('decision_trees')}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 flex items-center gap-2 text-xs font-semibold transition"
        >
          <Wrench className="w-3.5 h-3.5 text-slate-600" />
          <span>Árboles de Decisión CAN & Masas</span>
        </button>

        <button
          onClick={() => onNavigateTab('schematics')}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 flex items-center gap-2 text-xs font-semibold transition"
        >
          <Zap className="w-3.5 h-3.5 text-slate-600" />
          <span>Visor de Esquemas & Sonda Virtual</span>
        </button>
      </div>

      {/* 4. Active Diagnostic Operations & Registered Work Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Active Fault Cases */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Casos de Avería Registrados</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-slate-200 text-slate-700">
                {openFaults.length} activos
              </span>
            </h2>
            <button
              onClick={() => onNavigateTab('faults')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {openFaults.map((fault) => {
              const vehicle = getVehicleInfo(fault.vehicleId);
              return (
                <div
                  key={fault.id}
                  className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-5 transition shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {vehicle && (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-400 font-mono text-xs font-bold shadow-sm">
                            {vehicle.licensePlate}
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-700">
                          {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehículo'}
                        </span>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono uppercase ${
                            fault.severity === 'critical'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {fault.severity}
                        </span>

                        {fault.hasHighVoltageRisk && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold border border-red-200">
                            ⚡ ALTA TENSIÓN
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {fault.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {fault.observedSymptoms[0]}
                      </p>

                      {/* DTC Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-xs text-slate-400 font-mono">DTCs:</span>
                        {fault.dtcCodes.map((dtc) => (
                          <span
                            key={dtc.code}
                            className="text-xs px-2.5 py-0.5 rounded-lg font-mono font-bold bg-slate-100 text-red-600 border border-slate-200"
                          >
                            {dtc.code}
                            <span className="text-[10px] text-slate-500 font-normal ml-1">
                              ({dtc.ecu})
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(fault.createdAt).toLocaleDateString('es-ES')}
                      </span>

                      <button
                        onClick={() => onSelectFaultForDiagnosis(fault)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-md shadow-red-600/20"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Abrir IA Diagnosis</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Work Orders & Registered Fleet */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Órdenes de Trabajo
            </h2>
            <button
              onClick={() => onNavigateTab('work_orders')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeOrders.slice(0, 4).map((order) => {
              const vehicle = getVehicleInfo(order.vehicleId);
              return (
                <div
                  key={order.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2 shadow-sm hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-red-600">{order.number}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : 'Vehículo'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Cliente: {getClientName(order.clientId)}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Técnico: <strong className="text-slate-700">{order.assignedTechnician.split(' ')[0]}</strong></span>
                    <span className="font-bold text-slate-900">{order.totalEstimate} €</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Fleet Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <Car className="w-4 h-4 text-slate-500" />
                Vehículos en Flota ({vehicles.length})
              </span>
              <button
                onClick={() => onNavigateTab('vehicles')}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Catálogo
              </button>
            </div>

            <div className="space-y-1.5">
              {vehicles.slice(0, 3).map((v) => (
                <div
                  key={v.id}
                  onClick={() => onSelectVehicle(v)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-between cursor-pointer transition text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 font-mono">{v.licensePlate}</div>
                    <div className="text-[11px] text-slate-500">{v.brand} {v.model}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200 font-semibold">
                    {v.year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
