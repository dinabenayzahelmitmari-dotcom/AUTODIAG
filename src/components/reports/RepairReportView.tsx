/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Car,
  User,
  Wrench,
  Activity,
  Zap,
} from 'lucide-react';
import { Vehicle, Client, WorkOrder, FaultRecord, AIDiagnosisSession } from '../../types';

interface RepairReportViewProps {
  vehicle?: Vehicle;
  client?: Client;
  workOrder?: WorkOrder;
  faultRecord?: FaultRecord;
  session?: AIDiagnosisSession;
  allVehicles: Vehicle[];
  allWorkOrders: WorkOrder[];
  allFaults: FaultRecord[];
  allClients: Client[];
}

export const RepairReportView: React.FC<RepairReportViewProps> = ({
  vehicle: initialVehicle,
  client: initialClient,
  workOrder: initialWorkOrder,
  faultRecord: initialFaultRecord,
  session,
  allVehicles,
  allWorkOrders,
  allFaults,
  allClients,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    initialVehicle?.id || allVehicles[0]?.id || ''
  );

  const vehicle = allVehicles.find((v) => v.id === selectedVehicleId) || allVehicles[0];
  const client = allClients.find((c) => c.id === vehicle?.clientId) || allClients[0];
  const linkedFault = allFaults.find((f) => f.vehicleId === vehicle?.id) || allFaults[0];
  const linkedOrder = allWorkOrders.find((o) => o.vehicleId === vehicle?.id) || allWorkOrders[0];

  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Non-printed control header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
                <FileText className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Emisión de Informe Técnico Oficial de Taller
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Certificado técnico de diagnosis y reparación para entrega al cliente y archivo de garantías.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-800 font-mono font-bold focus:border-red-500 focus:outline-none cursor-pointer"
            >
              {allVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.licensePlate} - {v.brand} {v.model}
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-md shadow-red-600/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Exportar PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Printable Report Document */}
      <div className="bg-white text-slate-900 border border-slate-200/90 rounded-3xl p-8 max-w-4xl mx-auto shadow-sm print:bg-white print:text-black print:border-none print:shadow-none print:p-0 print:m-0 space-y-6">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-200 print:border-black pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white font-black flex items-center justify-center font-mono text-xs print:bg-black print:text-white">
                A
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 print:text-black">
                CENTRO TÉCNICO AUTODIAG PRO
              </h2>
            </div>
            <p className="text-xs text-slate-500 print:text-gray-600 font-medium">
              Especialistas en Diagnosis Electrónica, Inyección y Sistemas de Alta Tensión
            </p>
            <p className="text-[11px] text-slate-400 font-mono print:text-gray-500">
              NIF: B-89210342 | Registro Industrial: 28/89402 | UNE-EN 50110
            </p>
          </div>

          <div className="text-right text-xs font-mono space-y-1">
            <div className="text-red-600 print:text-black font-black text-sm">
              INFORME Nº {linkedOrder?.number || 'INF-2026-0042'}
            </div>
            <div className="text-slate-500 print:text-gray-600 font-bold">Fecha: {currentDate}</div>
            <div className="text-[10px] text-emerald-700 print:text-green-700 font-black">
              ✓ DIAGNOSIS CERTIFICADA
            </div>
          </div>
        </div>

        {/* Vehicle & Customer Identity Columns */}
        <div className="grid grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 print:bg-gray-100 border border-slate-200 print:border-gray-300 text-xs">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-red-600 print:text-gray-700 uppercase font-mono block">
              IDENTIFICACIÓN DEL VEHÍCULO
            </span>
            <div className="text-sm font-black text-slate-900 print:text-black">
              {vehicle?.brand} {vehicle?.model} ({vehicle?.versionTrim})
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 font-mono text-[11px] text-slate-600">
              <div>Matrícula: <strong className="text-slate-900 print:text-black font-black">{vehicle?.licensePlate}</strong></div>
              <div>Bastidor: <strong className="text-slate-900 print:text-black truncate">{vehicle?.vin}</strong></div>
              <div>Cód. Motor: <strong className="text-red-600 print:text-black font-black">{vehicle?.engineCode}</strong></div>
              <div>Kilometraje: <strong className="text-slate-900 print:text-black">{vehicle?.mileage.toLocaleString()} km</strong></div>
              <div>Tensión: <strong className="text-slate-900 print:text-black font-bold">{vehicle?.systemVoltage}</strong></div>
              <div>Combustible: <strong className="text-slate-900 print:text-black uppercase font-bold">{vehicle?.fuelType}</strong></div>
            </div>
          </div>

          <div className="space-y-1.5 border-l border-slate-200 print:border-gray-300 pl-6">
            <span className="text-[10px] font-black text-red-600 print:text-gray-700 uppercase font-mono block">
              TITULAR / CLIENTE
            </span>
            <div className="text-sm font-black text-slate-900 print:text-black">
              {client?.fullName}
            </div>
            <div className="text-xs text-slate-600 print:text-gray-700 space-y-0.5 pt-1">
              <div>DNI/CIF: <span className="font-mono font-bold text-slate-800">{client?.dniCif}</span></div>
              <div>Teléfono: <span className="font-mono font-bold text-slate-800">{client?.phone}</span></div>
              <div>Dirección: {client?.address}</div>
            </div>
          </div>
        </div>

        {/* Symptoms and DTCs registered */}
        <div className="space-y-2">
          <span className="text-xs font-black text-slate-900 print:text-black uppercase font-mono block">
            1. Síntomas Reportados y Códigos de Avería DTC Registrados en Diagnosis
          </span>
          <div className="p-4 rounded-2xl bg-slate-50 print:bg-white border border-slate-200 print:border-gray-300 space-y-2 text-xs">
            <div className="text-slate-700 print:text-gray-800 font-medium">
              <strong className="text-slate-900">Motivo de Intervención: </strong>
              {linkedFault?.title || linkedOrder?.customerStatedIssue}
            </div>
            {linkedFault && (
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono">
                <span className="text-slate-500 print:text-gray-600 font-bold">DTCs en memoria:</span>
                {linkedFault.dtcCodes.map((dtc) => (
                  <span
                    key={dtc.code}
                    className="px-2.5 py-0.5 rounded-lg bg-red-50 print:bg-gray-200 border border-red-200 print:border-gray-400 text-red-700 print:text-red-700 font-black"
                  >
                    {dtc.code} ({dtc.ecu})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Physical Measurements & Diagnostic Steps */}
        <div className="space-y-2">
          <span className="text-xs font-black text-slate-900 print:text-black uppercase font-mono block">
            2. Comprobaciones Instrumentales Efectuadas (Polímetro / Osciloscopio / Manómetro)
          </span>
          <div className="p-4 rounded-2xl bg-slate-50 print:bg-white border border-slate-200 print:border-gray-300 text-xs space-y-2">
            <p className="text-slate-700 print:text-gray-800 leading-relaxed font-medium">
              De acuerdo con el protocolo técnico, se procedió a la comprobación física de circuitos de alimentación, resistencia de masa y señales de modulación sin reemplazo preventivo previo.
            </p>

            {session?.submittedMeasurements && session.submittedMeasurements.length > 0 ? (
              <div className="space-y-1.5 pt-2 font-mono text-[11px]">
                {session.submittedMeasurements.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-white print:bg-gray-100 border border-slate-200 print:border-gray-300 flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-slate-900 print:text-black font-bold">{m.testName}: </strong>
                      <span className="text-red-600 print:text-black font-bold">"{m.measuredValue}"</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                        m.isWithinSpec
                          ? 'bg-emerald-100 text-emerald-800 print:text-green-800'
                          : 'bg-red-100 text-red-800 print:text-red-800'
                      }`}
                    >
                      {m.isWithinSpec ? 'CONFORME' : 'FUERA DE ESPECIFICACIÓN'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 print:text-gray-600 italic">
                Comprobación de caídas de tensión en masa (&lt; 0.10V) y estanqueidad neumática completadas con instrumental homologado.
              </p>
            )}
          </div>
        </div>

        {/* Confirmed Root Cause */}
        <div className="space-y-2">
          <span className="text-xs font-black text-red-600 print:text-black uppercase font-mono block">
            3. Dictamen y Causa Raíz Demostrada
          </span>
          <div className="p-4 rounded-2xl bg-red-50/60 print:bg-gray-100 border border-red-200 print:border-black text-xs space-y-1.5">
            <div className="font-black text-slate-900 print:text-black text-sm">
              {session?.confirmedCause || 'Agarrotamiento mecánico o discontinuidad eléctrica en el circuito documentado'}
            </div>
            <p className="text-slate-700 print:text-gray-800 leading-relaxed font-medium">
              La discrepancia en parámetros se originó por fallo electromecánico verificado. Se descartan anomalías en la unidad de control de motor y cableado general.
            </p>
          </div>
        </div>

        {/* Post-repair verifications and safety protocols */}
        <div className="space-y-2">
          <span className="text-xs font-black text-slate-900 print:text-black uppercase font-mono block">
            4. Control de Calidad y Pruebas Posteriores a la Reparación
          </span>
          <ul className="p-4 rounded-2xl bg-slate-50 print:bg-white border border-slate-200 print:border-gray-300 text-xs space-y-1.5 list-disc list-inside text-slate-700 print:text-gray-800 font-medium">
            <li>Prueba dinámica en carretera durante 15 km comprobando entrega de par y ausencia de modo degradado.</li>
            <li>Ciclo de conducción completo validando la operatividad de los monitores OBD-II.</li>
            <li>Barrido electrónico final con máquina de diagnosis: 0 códigos de avería (DTCs) presentes o pendientes.</li>
            <li>Reapriete de conectores y fijaciones conforme a especificación técnica.</li>
          </ul>
        </div>

        {/* Signatures & Warranty Footer */}
        <div className="pt-8 border-t border-slate-200 print:border-black grid grid-cols-2 gap-8 text-xs">
          <div className="space-y-12">
            <span className="text-slate-500 print:text-gray-600 block font-bold">
              Firma y Sello del Técnico Responsable:
            </span>
            <div className="border-t border-slate-300 print:border-black pt-2">
              <strong className="text-slate-900 print:text-black block font-black">
                {linkedOrder?.assignedTechnician || 'Marcos Alonso'}
              </strong>
              <span className="text-[11px] text-slate-500 print:text-gray-600">
                Especialista Electromecánico Colegiado
              </span>
            </div>
          </div>

          <div className="space-y-12">
            <span className="text-slate-500 print:text-gray-600 block font-bold">
              Conformidad de Entrega del Cliente:
            </span>
            <div className="border-t border-slate-300 print:border-black pt-2">
              <strong className="text-slate-900 print:text-black block font-black">
                {client?.fullName}
              </strong>
              <span className="text-[11px] text-slate-500 print:text-gray-600">
                Vehículo recibido en condiciones operativas
              </span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="text-[10px] text-slate-400 print:text-gray-500 pt-4 border-t border-slate-100 print:border-gray-300 text-center leading-relaxed font-medium">
          Garantía técnica de reparación de 3 meses o 2.000 km conforme a Real Decreto 1457/1986. Las piezas sustituidas quedan a disposición del cliente conforme a normativa.
        </div>
      </div>
    </div>
  );
};
