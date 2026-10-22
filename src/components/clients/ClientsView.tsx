/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Car,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Client, Vehicle } from '../../types';

interface ClientsViewProps {
  clients: Client[];
  vehicles: Vehicle[];
  onOpenCreateClientModal: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  vehicles,
  onOpenCreateClientModal,
  onEditClient,
  onDeleteClient,
  onSelectVehicle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dniCif.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getClientVehicles = (clientId: string) => {
    return vehicles.filter((v) => v.clientId === clientId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
                <Users className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Gestión de Clientes y Flotas
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Directorio de clientes particulares y corporativos con vinculación de vehículos.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenCreateClientModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-md shadow-red-600/20 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cliente</span>
          </button>
        </div>

        {/* Search */}
        <div className="mt-5 pt-4 border-t border-slate-100 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI/CIF, teléfono o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-11 pr-4 py-2.5 text-xs text-slate-800 font-medium focus:border-red-500 focus:bg-white focus:outline-none transition shadow-inner"
          />
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const clientVehicles = getClientVehicles(client.id);

          return (
            <div
              key={client.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 hover:border-slate-300 transition shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900">{client.fullName}</h3>
                  {client.companyName && (
                    <span className="text-xs text-red-600 font-bold block mt-0.5">
                      {client.companyName}
                    </span>
                  )}
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 mt-1.5 inline-block">
                    {client.dniCif || 'Sin DNI'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditClient(client)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteClient(client.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-red-600 cursor-pointer transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono font-bold">{client.phone}</span>
                </div>
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-600">{client.email}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-500 text-[11px]">{client.address}</span>
                  </div>
                )}
              </div>

              {/* Linked Vehicles */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-black text-slate-900 uppercase font-mono block">
                  Vehículos Asociados ({clientVehicles.length}):
                </span>

                {clientVehicles.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">Sin vehículos asignados</p>
                ) : (
                  <div className="space-y-1.5">
                    {clientVehicles.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => onSelectVehicle(v)}
                        className="p-2.5 rounded-2xl bg-slate-50 hover:bg-red-50/50 border border-slate-200 flex items-center justify-between text-xs cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2">
                          <Car className="w-3.5 h-3.5 text-red-600" />
                          <span className="font-black text-slate-900 font-mono">{v.licensePlate}</span>
                          <span className="text-slate-500 text-[11px] font-medium">{v.brand} {v.model}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">{v.year}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
