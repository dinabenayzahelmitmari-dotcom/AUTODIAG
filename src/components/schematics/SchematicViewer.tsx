/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Layers,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Cpu,
  Search,
  CheckCircle2,
  FileDown,
  Info,
  Maximize2,
  Minimize2,
  PenTool,
} from 'lucide-react';
import { ElectricalSchematic, SchematicComponent, SchematicWire } from '../../types';

interface SchematicViewerProps {
  schematics: ElectricalSchematic[];
  onAddSchematic?: (sch: ElectricalSchematic) => void;
}

export const SchematicViewer: React.FC<SchematicViewerProps> = ({ schematics }) => {
  const [selectedSchematicId, setSelectedSchematicId] = useState<string>(
    schematics[0]?.id || ''
  );
  const [selectedComponent, setSelectedComponent] = useState<SchematicComponent | null>(null);
  const [selectedPin, setSelectedPin] = useState<{
    component: SchematicComponent;
    pin: any;
  } | null>(null);
  const [probeMode, setProbeMode] = useState<boolean>(true);
  const [inspectedWire, setInspectedWire] = useState<SchematicWire | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const currentSchematic =
    schematics.find((s) => s.id === selectedSchematicId) || schematics[0];

  const filteredSchematics = schematics.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vehicleBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.engineCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.systemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getComponentIcon = (type: SchematicComponent['type']) => {
    switch (type) {
      case 'battery':
        return '🔋';
      case 'fuse':
        return '⚡';
      case 'relay':
        return '🔲';
      case 'ecu':
        return '🧠';
      case 'sensor':
        return '📡';
      case 'actuator':
        return '⚙️';
      case 'ground':
        return '⏚';
      case 'switch':
        return '🔘';
      default:
        return '🔌';
    }
  };

  const getWireStrokeColor = (wireColor: string, isFaulty?: boolean) => {
    if (isFaulty) return '#ef4444'; // Red for damaged/shorted wire
    const lower = wireColor.toLowerCase();
    if (lower.includes('rojo') || lower.includes('rt')) return '#f87171';
    if (lower.includes('marrón') || lower.includes('br')) return '#a16207';
    if (lower.includes('negro') || lower.includes('sw')) return '#64748b';
    if (lower.includes('azul') || lower.includes('bl')) return '#38bdf8';
    if (lower.includes('verde') || lower.includes('gn')) return '#4ade80';
    if (lower.includes('amarillo') || lower.includes('ge')) return '#facc15';
    if (lower.includes('lila') || lower.includes('li')) return '#c084fc';
    return '#94a3b8';
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
                <Layers className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Visor y Analizador de Esquemas Eléctricos
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Interprete recorridos de alimentación, masas, sensores, actuadores y mida con sonda virtual multímetro.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setProbeMode(!probeMode)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition border cursor-pointer ${
                probeMode
                  ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{probeMode ? 'Sonda Multímetro ACTIVA' : 'Activar Sonda Multímetro'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Imprimir Esquema</span>
            </button>
          </div>
        </div>

        {/* Search bar & Selector */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por marca, motor (ej. CRLB, 2ZR-FXE) o sistema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-11 pr-4 py-2.5 text-xs text-slate-800 font-medium focus:border-red-500 focus:bg-white focus:outline-none transition shadow-inner"
            />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold shrink-0">Circuito:</span>
            <select
              value={selectedSchematicId}
              onChange={(e) => {
                setSelectedSchematicId(e.target.value);
                setSelectedComponent(null);
                setSelectedPin(null);
                setInspectedWire(null);
              }}
              className="w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-800 font-bold focus:border-red-500 focus:outline-none cursor-pointer"
            >
              {filteredSchematics.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.vehicleBrand} {s.engineCode} - {s.title.slice(0, 35)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schematic Overview & Veracity Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          {currentSchematic.isOemVerified ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Esquema Documentado Verificado OEM</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Esquema Simplificado para Diagnóstico (No Oficial)</span>
            </span>
          )}
          <span className="text-xs text-slate-600 font-medium">
            {currentSchematic.vehicleBrand} {currentSchematic.vehicleModel} | Motor: <strong className="text-slate-900 font-mono font-bold">{currentSchematic.engineCode}</strong>
          </span>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2 font-medium">
          <Info className="w-4 h-4 text-red-600" />
          <span>Haga clic en componentes o pines para realizar lecturas de tensión.</span>
        </div>
      </div>

      {/* Interactive Visual Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Schematic Canvas (8 spans) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-x-auto min-h-[520px] shadow-lg">
          <div className="text-[11px] font-mono text-slate-400 mb-4 flex items-center justify-between">
            <span>SISTEMA: <strong className="text-white">{currentSchematic.systemName.toUpperCase()}</strong></span>
            <span className="text-red-400 font-bold">MODO SONDA: {probeMode ? 'PUNTA ROJA ACTIVA' : 'NAVEGACIÓN'}</span>
          </div>

          {/* SVG Diagram Layer */}
          <div className="relative min-w-[700px] h-[440px] select-none">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Circuit Grid pattern */}
              <defs>
                <pattern id="circuitGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#circuitGrid)" />

              {/* Draw Connections */}
              {currentSchematic.wires.map((wire, idx) => {
                const strokeColor = getWireStrokeColor(wire.wireColor, wire.isFaulty);
                const isSelected = inspectedWire?.id === wire.id;
                const fromComp = currentSchematic.components.find((c) => c.id === wire.fromComponentId);
                const toComp = currentSchematic.components.find((c) => c.id === wire.toComponentId);

                if (!fromComp || !toComp) return null;

                const x1 = fromComp.x + 70;
                const y1 = fromComp.y + 35;
                const x2 = toComp.x + 70;
                const y2 = toComp.y + 35;
                const midX = (x1 + x2) / 2;
                const pathData = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

                return (
                  <g key={wire.id || idx} className="pointer-events-auto cursor-pointer" onClick={() => setInspectedWire(wire)}>
                    <path
                      d={pathData}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 4 : wire.isFaulty ? 3 : 2}
                      strokeDasharray={wire.isFaulty ? '4 2' : 'none'}
                      className="transition-all hover:stroke-amber-400"
                    />
                    {/* Wire label text */}
                    <text
                      x={midX}
                      y={(y1 + y2) / 2 - 6}
                      fill={wire.isFaulty ? '#f87171' : '#94a3b8'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="select-none font-bold"
                    >
                      {wire.wireColor} ({wire.fromPin}→{wire.toPin})
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Render Schematic Components as HTML nodes */}
            {currentSchematic.components.map((comp) => {
              const isSelected = selectedComponent?.id === comp.id;

              return (
                <div
                  key={comp.id}
                  style={{ left: `${comp.x}px`, top: `${comp.y}px` }}
                  onClick={() => {
                    setSelectedComponent(comp);
                    setInspectedWire(null);
                  }}
                  className={`absolute p-2.5 rounded-xl border text-xs cursor-pointer transition select-none shadow-md ${
                    isSelected
                      ? 'bg-slate-800 border-red-500 shadow-red-500/20 ring-2 ring-red-500'
                      : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-white mb-1">
                    <span>{getComponentIcon(comp.type)}</span>
                    <span className="text-red-400">{comp.code}</span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-medium truncate max-w-[130px]">
                    {comp.label}
                  </div>

                  {/* Component Pin Dots */}
                  <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-800">
                    {comp.pins.map((pin) => (
                      <button
                        key={pin.pinNumber}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPin({ component: comp, pin });
                          setSelectedComponent(comp);
                          setInspectedWire(null);
                        }}
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-950 text-slate-300 hover:bg-red-600 hover:text-white border border-slate-700 transition"
                        title={`Pin ${pin.pinNumber}: ${pin.pinName} (${pin.expectedVoltage})`}
                      >
                        {pin.pinNumber}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details Panel (4 spans): Multimeter Probe Readout & Diagnostics */}
        <div className="lg:col-span-4 space-y-4">
          {/* Probe Readout Box */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-50 text-red-600">
                  <Zap className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-black text-slate-900">Sonda Multímetro en Tiempo Real</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                CAT III 1000V
              </span>
            </div>

            {selectedPin ? (
              <div className="space-y-3.5">
                <div className="p-4 rounded-2xl bg-slate-50 border border-red-200 space-y-1">
                  <div className="text-[10px] font-mono text-red-600 font-black uppercase">
                    PUNTO DE MEDICIÓN ACTIVO
                  </div>
                  <div className="text-sm font-black text-slate-900 font-mono">
                    {selectedPin.component.code} - Pin {selectedPin.pin.pinNumber} ({selectedPin.pin.pinName})
                  </div>
                  <div className="text-xs text-slate-600 font-semibold font-mono">
                    Color Cable: {selectedPin.pin.wireColor}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-mono font-bold uppercase">TENSIÓN ESPERADA</span>
                    <strong className="text-emerald-700 font-mono text-base block font-black">
                      {selectedPin.pin.expectedVoltage || '12.0V - 14.2V'}
                    </strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-mono font-bold uppercase">TIPO DE SEÑAL</span>
                    <strong className="text-slate-800 font-mono text-base uppercase block font-black">
                      {selectedPin.pin.signalType || 'Analógico'}
                    </strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700">
                  <span className="font-bold text-slate-900">Recomendación de Comprobación:</span>
                  <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                    Conectar sonda negra a masa directa de chasis o borne 31. Medir con contacto puesto (Borne 15 ON) y comparar con especificación. Caída admisible máx: 0.2V.
                  </p>
                </div>
              </div>
            ) : inspectedWire ? (
              <div className="space-y-3.5">
                <div className="p-4 rounded-2xl bg-slate-50 border border-red-200 space-y-1">
                  <div className="text-[10px] font-mono text-red-600 uppercase font-black flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    TRAMO DE CABLEADO INSPECCIONADO
                  </div>
                  <div className="text-sm font-black text-slate-900 font-mono">
                    Línea: {inspectedWire.wireColor}
                  </div>
                  {inspectedWire.isFaulty && (
                    <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-mono font-bold border border-red-200">
                      {inspectedWire.faultReason}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-900">Test de Aislamiento y Continuidad:</span>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Desconectar ambos extremos del conector. Comprobar resistencia con multímetro: debe ser menor a 0.5 Ω entre extremos (continuidad) y mayor a 10 MΩ respecto a masa y a positivo (aislamiento).
                  </p>
                </div>
              </div>
            ) : selectedComponent ? (
              <div className="space-y-3.5">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                    COMPONENTE SELECCIONADO
                  </div>
                  <div className="text-sm font-black text-slate-900 font-mono">{selectedComponent.code}</div>
                  <p className="text-xs text-slate-600 font-medium">{selectedComponent.label}</p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-slate-600 text-[11px] block uppercase font-mono">
                    Pines y Conexiones Documentadas:
                  </span>
                  {selectedComponent.pins.map((p) => (
                    <div
                      key={p.pinNumber}
                      onClick={() => setSelectedPin({ component: selectedComponent, pin: p })}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 flex items-center justify-between cursor-pointer font-mono text-xs transition"
                    >
                      <span className="font-black text-red-600">Pin {p.pinNumber}: {p.pinName}</span>
                      <span className="text-[10px] text-slate-600 font-bold">{p.expectedVoltage}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                <Zap className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Haga clic en un pin, componente o cable para ver la telemetría eléctrica esperada.</p>
              </div>
            )}
          </div>

          {/* Quick Legend */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 text-xs space-y-2.5 shadow-sm">
            <span className="font-black text-slate-900 block uppercase font-mono text-[11px]">Convención de Colores DIN / VAG:</span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> RT = Rojo (B+ 12V)
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-700" /> BR = Marrón (Masa 31)
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800" /> SW = Negro (B15 Con.)
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> BL = Azul (Alternador)
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> GN = Verde (Señal)
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> GE = Amarillo (CAN-H)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
