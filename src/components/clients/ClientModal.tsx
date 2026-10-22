/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Save } from 'lucide-react';
import { Client } from '../../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  initialClient?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialClient,
}) => {
  const [fullName, setFullName] = useState(initialClient?.fullName || '');
  const [dniCif, setDniCif] = useState(initialClient?.dniCif || '');
  const [phone, setPhone] = useState(initialClient?.phone || '');
  const [email, setEmail] = useState(initialClient?.email || '');
  const [address, setAddress] = useState(initialClient?.address || '');
  const [companyName, setCompanyName] = useState(initialClient?.companyName || '');
  const [notes, setNotes] = useState(initialClient?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    const client: Client = {
      id: initialClient?.id || `cli-${Date.now()}`,
      fullName: fullName.trim(),
      dniCif: dniCif.trim().toUpperCase(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      companyName: companyName.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: initialClient?.createdAt || new Date().toISOString(),
    };

    onSave(client);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-slate-900">
                {initialClient ? 'Editar Ficha de Cliente' : 'Nuevo Cliente / Empresa'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Gestión de titular y datos de contacto para facturación.</p>
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
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nombre Completo / Razón Social *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej: Manuel Castillo Delgado o Transportes Castillo S.L."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">DNI / NIE / CIF</label>
              <input
                type="text"
                value={dniCif}
                onChange={(e) => setDniCif(e.target.value)}
                placeholder="48291045K o B-84920183"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold uppercase focus:border-red-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Teléfono Móvil *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 600 00 00 00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:border-red-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@email.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Empresa (Opcional)</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Flota / Empresa"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Dirección Postal</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle Mayor 14, 28013 Madrid"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
              Guardar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
