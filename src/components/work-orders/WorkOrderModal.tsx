/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Trash2,
  Calendar,
  User,
  DollarSign,
  Car,
} from 'lucide-react';
import {
  WorkOrder,
  WorkOrderStatus,
  PriorityLevel,
  WorkOrderPart,
  Vehicle,
  Client,
} from '../../types';

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: WorkOrder) => void;
  vehicles: Vehicle[];
  clients: Client[];
  initialOrder?: WorkOrder | null;
  defaultVehicleId?: string;
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  vehicles,
  clients,
  initialOrder,
  defaultVehicleId,
}) => {
  const [vehicleId, setVehicleId] = useState(
    initialOrder?.vehicleId || defaultVehicleId || vehicles[0]?.id || ''
  );
  const [clientId, setClientId] = useState(
    initialOrder?.clientId || clients[0]?.id || ''
  );
  const [status, setStatus] = useState<WorkOrderStatus>(
    initialOrder?.status || 'pending'
  );
  const [priority, setPriority] = useState<PriorityLevel>(
    initialOrder?.priority || 'normal'
  );
  const [customerStatedIssue, setCustomerStatedIssue] = useState(
    initialOrder?.customerStatedIssue || ''
  );
  const [assignedTechnician, setAssignedTechnician] = useState(
    initialOrder?.assignedTechnician || 'Marcos Alonso (Electromecánico Senior)'
  );
  const [laborHours, setLaborHours] = useState(initialOrder?.laborHours || 1.5);
  const [laborRatePerHour, setLaborRatePerHour] = useState(
    initialOrder?.laborRatePerHour || 55
  );
  const [parts, setParts] = useState<WorkOrderPart[]>(initialOrder?.parts || []);
  const [notes, setNotes] = useState(initialOrder?.notes || '');

  // Part adder state
  const [partRef, setPartRef] = useState('');
  const [partDesc, setPartDesc] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [partPrice, setPartPrice] = useState(0);

  // Auto-fill client when vehicle changes
  React.useEffect(() => {
    const selV = vehicles.find((v) => v.id === vehicleId);
    if (selV && selV.clientId) {
      setClientId(selV.clientId);
    }
  }, [vehicleId, vehicles]);

  if (!isOpen) return null;

  const handleAddPart = () => {
    if (partDesc.trim()) {
      setParts([
        ...parts,
        {
          id: `prt-${Date.now()}`,
          reference: partRef.trim().toUpperCase() || 'GEN-REP',
          description: partDesc.trim(),
          quantity: Number(partQty) || 1,
          unitPrice: Number(partPrice) || 0,
        },
      ]);
      setPartRef('');
      setPartDesc('');
      setPartQty(1);
      setPartPrice(0);
    }
  };

  const handleRemovePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  const laborTotal = laborHours * laborRatePerHour;
  const partsTotal = parts.reduce((acc, p) => acc + p.quantity * p.unitPrice, 0);
  const grandTotal = laborTotal + partsTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !customerStatedIssue.trim()) return;

    const order: WorkOrder = {
      id: initialOrder?.id || `ot-${Date.now()}`,
      number: initialOrder?.number || `OT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId,
      vehicleId,
      entryDate: initialOrder?.entryDate || new Date().toISOString(),
      status,
      priority,
      customerStatedIssue: customerStatedIssue.trim(),
      assignedTechnician: assignedTechnician.trim(),
      laborHours: Number(laborHours) || 0,
      laborRatePerHour: Number(laborRatePerHour) || 55,
      parts,
      totalEstimate: grandTotal,
      faultRecordIds: initialOrder?.faultRecordIds || [],
      notes: notes.trim(),
      createdAt: initialOrder?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(order);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl my-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
              <Wrench className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-slate-900">
                {initialOrder ? `Editar ${initialOrder.number}` : 'Nueva Orden de Trabajo (O.T.)'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Registro de entrada a taller, tiempos y presupuesto.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Vehículo *</label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:border-red-500 focus:bg-white focus:outline-none"
                required
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.licensePlate} - {v.brand} {v.model} ({v.engineCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cliente / Titular</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-red-500 focus:bg-white focus:outline-none"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.dniCif})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Estado de la Reparación</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none uppercase font-mono font-bold"
              >
                <option value="pending">Pendiente</option>
                <option value="in_diagnosis">En Diagnóstico</option>
                <option value="waiting_parts">Esperando Piezas</option>
                <option value="in_repair">En Reparación</option>
                <option value="repaired">Reparado</option>
                <option value="delivered">Entregado</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-red-500 focus:bg-white focus:outline-none"
              >
                <option value="urgent">Urgente (Inmovilizado)</option>
                <option value="high">Alta</option>
                <option value="normal">Normal</option>
                <option value="low">Baja</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Técnico Asignado</label>
              <input
                type="text"
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-red-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Motivo de Entrada / Problema Descrito por el Cliente *
            </label>
            <textarea
              rows={2}
              required
              value={customerStatedIssue}
              onChange={(e) => setCustomerStatedIssue(e.target.value)}
              placeholder="El cliente indica que pierde fuerza en subidas..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-medium focus:border-red-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Labor and Rates */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Horas de Mano de Obra</label>
              <input
                type="number"
                step="0.5"
                value={laborHours}
                onChange={(e) => setLaborHours(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Tarifa Horaria (€/h)</label>
              <input
                type="number"
                value={laborRatePerHour}
                onChange={(e) => setLaborRatePerHour(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
              />
            </div>
          </div>

          {/* Spare Parts Section */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-black text-slate-900 block uppercase font-mono text-[11px]">Piezas y Recambios Empleados:</span>

            <div className="grid grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="Referencia OEM"
                value={partRef}
                onChange={(e) => setPartRef(e.target.value)}
                className="col-span-3 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-mono uppercase text-[11px]"
              />
              <input
                type="text"
                placeholder="Descripción recambio"
                value={partDesc}
                onChange={(e) => setPartDesc(e.target.value)}
                className="col-span-4 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 text-[11px]"
              />
              <input
                type="number"
                placeholder="Cant."
                value={partQty}
                onChange={(e) => setPartQty(Number(e.target.value))}
                className="col-span-2 bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-slate-900 text-[11px] font-mono font-bold"
              />
              <input
                type="number"
                placeholder="€/ud"
                value={partPrice}
                onChange={(e) => setPartPrice(Number(e.target.value))}
                className="col-span-2 bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-slate-900 text-[11px] font-mono font-bold"
              />
              <button
                type="button"
                onClick={handleAddPart}
                className="col-span-1 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center font-black transition cursor-pointer"
              >
                +
              </button>
            </div>

            {parts.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {parts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] font-mono"
                  >
                    <span className="font-bold text-slate-800">{p.reference} - {p.description} (x{p.quantity})</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 font-black">{(p.quantity * p.unitPrice).toFixed(2)} €</strong>
                      <button
                        type="button"
                        onClick={() => handleRemovePart(p.id)}
                        className="text-slate-400 hover:text-red-600 font-bold ml-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total Summary */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 font-medium">
                MO: {laborTotal.toFixed(2)} € + Recambios: {partsTotal.toFixed(2)} €
              </span>
              <span className="text-slate-900 font-black text-sm">
                Total Estimado: <span className="text-red-600">{grandTotal.toFixed(2)} €</span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-md shadow-red-600/20 cursor-pointer"
            >
              Guardar Orden de Trabajo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
