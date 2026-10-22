/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, CheckSquare, Square, AlertOctagon, Info } from 'lucide-react';

interface SafetyBannerProps {
  systemVoltage: string;
  isHighVoltage: boolean;
  alerts?: string[];
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({
  systemVoltage,
  isHighVoltage,
  alerts = [],
}) => {
  const [checkedSteps, setCheckedSteps] = useState<{ [key: number]: boolean }>({});

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const highVoltageProtocolSteps = [
    'Quitar contacto y alejar llave inteligente a más de 5 metros del vehículo.',
    'Desconectar el borne negativo de la batería auxiliar de 12V para deshabilitar la electrónica de control.',
    'Utilizar guantes dieléctricos Clase 0 (1000V) previamente inspeccionados contra pinchazos.',
    'Extraer el conector de servicio de tracción (Service Plug naranja) y depositarlo en caja de seguridad custodiada.',
    'Esperar un tiempo mínimo de 10 minutos para la descarga completa de los condensadores internos del inversor.',
    'Comprobar ausencia total de tensión en los bornes del inversor con voltímetro CAT III 1000V homologado.',
  ];

  if (!isHighVoltage && alerts.length === 0) {
    return null;
  }

  const allCompleted = highVoltageProtocolSteps.every((_, idx) => checkedSteps[idx]);

  return (
    <div className="mb-6 rounded-3xl border border-amber-300 bg-amber-50/90 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 border border-amber-200 shrink-0 mt-0.5">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-amber-950 flex items-center gap-2">
              <span>ADVERTENCIA DE SEGURIDAD TÉCNICA OBLIGATORIA</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-black">
                {systemVoltage.replace('_', ' ').toUpperCase()}
              </span>
            </h3>

            {isHighVoltage && (
              <span
                className={`text-xs px-3 py-1 rounded-full font-mono font-bold border ${
                  allCompleted
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                {allCompleted ? '✓ Protocolo de Desenergización Completado' : '⚠ Zona Energizada - Riesgo Eléctrico'}
              </span>
            )}
          </div>

          <p className="text-xs text-amber-900/80 mt-1.5 leading-relaxed font-medium">
            {isHighVoltage
              ? 'Este vehículo incorpora circuitos de tracción de alta tensión continua (200V - 800V DC). El contacto directo puede provocar fibrilación ventricular o quemaduras graves. Siga estrictamente las 5 reglas de oro antes de manipular cableados de color naranja o carcasas de inversor.'
              : 'Verifique los procedimientos de seguridad antes de intervenir en este sistema.'}
          </p>

          {/* Checklist for HV */}
          {isHighVoltage && (
            <div className="mt-3.5 pt-3 border-t border-amber-200/80">
              <div className="text-xs font-bold text-amber-950 mb-2.5 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-amber-700" />
                Checklist de Desenergización y Seguridad Previa (UNE-EN 50110):
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {highVoltageProtocolSteps.map((step, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleStep(idx)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-2xl text-left text-xs transition border ${
                      checkedSteps[idx]
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                        : 'bg-white border-amber-200 text-slate-700 hover:border-amber-300'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {checkedSteps[idx] ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Additional alerts if any */}
          {alerts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-200 text-[11px] text-amber-900 font-medium shadow-sm"
                >
                  <Info className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
