/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Search,
  Plus,
  ShieldAlert,
  Database,
  Trash2,
  Cpu,
  Layers,
  Wrench,
  AlertTriangle,
  Car,
  Users,
  BookOpen,
  FileText,
  GitBranch,
} from 'lucide-react';
import { Vehicle } from '../../types';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeVehicle?: Vehicle;
  totalVehicles: number;
  totalFaults: number;
  onOpenNewFaultModal: () => void;
  onOpenNewVehicleModal: () => void;
  onOpenNewOrderModal: () => void;
  onLoadFullDemoData: () => void;
  onClearAllData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  activeVehicle,
  totalVehicles,
  totalFaults,
  onOpenNewFaultModal,
  onOpenNewVehicleModal,
  onOpenNewOrderModal,
  onLoadFullDemoData,
  onClearAllData,
}) => {
  const isHighVoltage =
    activeVehicle &&
    (activeVehicle.systemVoltage === '400V_high_voltage' ||
      activeVehicle.systemVoltage === '800V_high_voltage' ||
      activeVehicle.fuelType === 'hybrid' ||
      activeVehicle.fuelType === 'electric' ||
      activeVehicle.fuelType === 'phev');

  const navLinks: Array<{ id: NavTab; label: string }> = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'diagnosis', label: 'IA Diagnosis' },
    { id: 'work_orders', label: 'Órdenes' },
    { id: 'faults', label: 'Averías' },
    { id: 'vehicles', label: 'Vehículos' },
    { id: 'clients', label: 'Clientes' },
    { id: 'schematics', label: 'Esquemas' },
    { id: 'decision_trees', label: 'Árboles' },
    { id: 'knowledge_base', label: 'Conocimiento' },
    { id: 'reports', label: 'Informes' },
  ];

  return (
    <header className="bg-[#0b1329] border-b border-slate-850 px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-md">
      {/* Top Row: Brand, Subtitle & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Brand Group */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-red-600/30 shrink-0">
            A
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                AUTODIAG<span className="text-red-500">PRO</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#182343] text-slate-300 border border-slate-700">
                {currentTab.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Panel de Control de Diagnóstico y Reparación de Automoción con IA
            </p>
          </div>
        </div>

        {/* Center / Search bar */}
        <div className="flex-1 max-w-md mx-auto w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por matrícula (ej. 4829-KMN), VIN, código DTC..."
            className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 self-end lg:self-auto">
          {/* Main Red CTA Button matching the reference screenshot */}
          <button
            onClick={onOpenNewFaultModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs transition shadow-lg shadow-red-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Operación / DTC</span>
          </button>

          {/* Quick Data Loading tools */}
          <div className="flex items-center gap-1 bg-[#131d38] p-1 rounded-xl border border-slate-700/70">
            <button
              onClick={onLoadFullDemoData}
              className="px-2.5 py-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Cargar datos de prueba de vehículos, averías y clientes"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cargar Datos</span>
            </button>

            <button
              onClick={onClearAllData}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              title="Vaciar taller (Empezar en blanco)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row Navigation Pills */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <nav className="flex items-center gap-1 text-xs">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Active vehicle preview badge */}
        {activeVehicle && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#131d38] border border-slate-700/80 text-xs shrink-0">
            <span className="text-slate-400">En banco:</span>
            <span className="font-mono font-bold text-amber-400">{activeVehicle.licensePlate}</span>
            <span className="text-slate-200 truncate max-w-[120px]">
              {activeVehicle.brand} {activeVehicle.model}
            </span>
            {isHighVoltage && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                ⚡ 400V
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
