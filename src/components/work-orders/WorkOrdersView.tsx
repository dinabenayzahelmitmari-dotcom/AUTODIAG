/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Clock,
  Car,
  User,
  ArrowRight,
  CheckCircle2,
  Cpu,
  AlertCircle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { WorkOrder, WorkOrderStatus, Vehicle, Client, FaultRecord } from '../../types';

interface WorkOrdersViewProps {
  workOrders: WorkOrder[];
  vehicles: Vehicle[];
  clients: Client[];
  faults: FaultRecord[];
  onOpenCreateOrderModal: () => void;
  onEditOrder: (order: WorkOrder) => void;
  onDeleteOrder: (id: string) => void;
  onUpdateStatus: (orderId: string, newStatus: WorkOrderStatus) => void;
  onSelectFaultForDiagnosis: (fault: FaultRecord) => void;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  workOrders,
  vehicles,
  clients,
  faults,
  onOpenCreateOrderModal,
  onEditOrder,
  onDeleteOrder,
  onUpdateStatus,
  onSelectFaultForDiagnosis,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredOrders = workOrders.filter((order) => {
    const v = vehicles.find((item) => item.id === order.vehicleId);
    const matchesSearch =
      order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerStatedIssue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v && v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getVehicle = (vId: string) => vehicles.find((v) => v.id === vId);
  const getClient = (cId: string) => clients.find((c) => c.id === cId);
  const getFaultForOrder = (order: WorkOrder) => {
    return faults.find((f) => f.workOrderId === order.id || order.faultRecordIds.includes(f.id));
  };

  const statusColumns: Array<{ id: WorkOrderStatus; label: string; headerColor: string; pillColor: string }> = [
    { id: 'pending', label: 'Pendiente', headerColor: 'text-slate-700', pillColor: 'bg-slate-200 text-slate-800' },
    { id: 'in_diagnosis', label: 'En Diagnóstico', headerColor: 'text-red-700', pillColor: 'bg-red-100 text-red-800' },
    { id: 'waiting_parts', label: 'Esperando Piezas', headerColor: 'text-amber-700', pillColor: 'bg-amber-100 text-amber-800' },
    { id: 'in_repair', label: 'En Reparación', headerColor: 'text-blue-700', pillColor: 'bg-blue-100 text-blue-800' },
    { id: 'repaired', label: 'Reparado', headerColor: 'text-emerald-700', pillColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'delivered', label: 'Entregado', headerColor: 'text-slate-600', pillColor: 'bg-slate-200 text-slate-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
                <Wrench className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Gestión de Órdenes de Trabajo (O.T.)
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Control de flujo de taller: diagnosis, repuestos, mano de obra y facturación estimada.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenCreateOrderModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-md shadow-red-600/20 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nueva O.T.</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por O.T., matrícula o síntoma..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-11 pr-4 py-2.5 text-xs text-slate-800 font-medium focus:border-red-500 focus:bg-white focus:outline-none transition shadow-inner"
            />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold shrink-0">Filtrar:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-800 font-bold focus:border-red-500 focus:outline-none uppercase font-mono cursor-pointer"
            >
              <option value="all">TODOS LOS ESTADOS</option>
              <option value="pending">PENDIENTE</option>
              <option value="in_diagnosis">EN DIAGNÓSTICO</option>
              <option value="waiting_parts">ESPERANDO PIEZAS</option>
              <option value="in_repair">EN REPARACIÓN</option>
              <option value="repaired">REPARADO</option>
              <option value="delivered">ENTREGADO</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {statusColumns.map((col) => {
          const colOrders = filteredOrders.filter((o) => o.status === col.id);

          return (
            <div
              key={col.id}
              className="rounded-3xl border border-slate-200/90 bg-slate-100/70 p-3.5 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200">
                <span className={`text-xs font-black font-mono uppercase tracking-tight ${col.headerColor}`}>
                  {col.label}
                </span>
                <span className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center font-bold ${col.pillColor}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1">
                {colOrders.map((order) => {
                  const vehicle = getVehicle(order.vehicleId);
                  const client = getClient(order.clientId);
                  const linkedFault = getFaultForOrder(order);

                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5 shadow-sm hover:border-slate-300 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-red-600 text-xs">
                          {order.number}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onEditOrder(order)}
                            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                            title="Editar O.T."
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {vehicle && (
                        <div className="space-y-0.5">
                          <div className="font-mono text-xs font-black text-slate-900 flex items-center justify-between">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">{vehicle.licensePlate}</span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {vehicle.brand} {vehicle.model}
                            </span>
                          </div>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-600 font-medium line-clamp-2">
                        {order.customerStatedIssue}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-500 font-medium">
                          {order.laborHours}h | {order.parts.length} rep.
                        </span>
                        <strong className="text-slate-900 font-black">{order.totalEstimate} €</strong>
                      </div>

                      {/* Direct jump to AI Diagnosis if fault is linked */}
                      {linkedFault && (
                        <button
                          onClick={() => onSelectFaultForDiagnosis(linkedFault)}
                          className="w-full mt-1 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-[10px] font-black border border-red-200 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Cpu className="w-3 h-3" />
                          <span>Asistente IA</span>
                        </button>
                      )}

                      {/* Status Transition Shortcut */}
                      <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-bold">Estado:</span>
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateStatus(order.id, e.target.value as WorkOrderStatus)}
                          className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2 py-0.5 text-[10px] font-mono font-bold focus:outline-none cursor-pointer"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="in_diagnosis">Diagnóstico</option>
                          <option value="waiting_parts">Piezas</option>
                          <option value="in_repair">Reparación</option>
                          <option value="repaired">Reparado</option>
                          <option value="delivered">Entregado</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
