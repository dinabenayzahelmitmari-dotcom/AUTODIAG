/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Wrench,
  AlertTriangle,
  Car,
  Users,
  GitBranch,
  BookOpen,
  FileText,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'diagnosis'
  | 'work_orders'
  | 'faults'
  | 'vehicles'
  | 'clients'
  | 'schematics'
  | 'decision_trees'
  | 'knowledge_base'
  | 'reports';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openFaultsCount: number;
  activeOrdersCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  openFaultsCount,
  activeOrdersCount,
}) => {
  const menuItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Panel de Control',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'diagnosis',
      label: 'Asistente IA Diagnosis',
      icon: <Cpu className="w-5 h-5 text-amber-400" />,
      badge: 1,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'work_orders',
      label: 'Órdenes de Trabajo',
      icon: <Wrench className="w-5 h-5" />,
      badge: activeOrdersCount,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'faults',
      label: 'Registro de Averías',
      icon: <AlertTriangle className="w-5 h-5" />,
      badge: openFaultsCount,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'vehicles',
      label: 'Fichas de Vehículos',
      icon: <Car className="w-5 h-5" />,
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'schematics',
      label: 'Esquemas Eléctricos',
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
    },
    {
      id: 'decision_trees',
      label: 'Árboles de Decisión',
      icon: <GitBranch className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'knowledge_base',
      label: 'Base de Conocimiento',
      icon: <BookOpen className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: 'reports',
      label: 'Informes de Taller',
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 border border-amber-400/30">
            <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white text-base">AutoDiag</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                PRO AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Diagnóstico Electromecánico</p>
          </div>
        </div>

        {/* Live Workshop Diagnostic Status */}
        <div className="mx-3 mt-3 px-3 py-2 bg-slate-950/70 rounded-lg border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono text-slate-300">OBD-II Online</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
            ISO 14229
          </span>
        </div>

        {/* Navigation list */}
        <nav className="p-2 space-y-1 mt-2">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/15'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-mono font-semibold border ${
                      isActive ? 'bg-slate-950 text-amber-300 border-amber-400/30' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Safety & Protocol Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1 font-semibold text-xs">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Protocolo Taller
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">UNE-EN 50110</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Asistencia técnica consultiva. Verificar siempre con polímetro y documentación oficial OEM.
          </p>
        </div>
      </div>
    </aside>
  );
};
