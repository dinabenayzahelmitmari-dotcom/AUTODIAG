/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Wrench,
  Plus,
  Tag,
  Car,
  Activity,
  Layers,
} from 'lucide-react';
import { KnowledgeCase } from '../../types';

interface KnowledgeBaseViewProps {
  cases: KnowledgeCase[];
  onAddCase: (newCase: KnowledgeCase) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  cases,
  onAddCase,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  // New Case form state
  const [brand, setBrand] = useState('Volkswagen');
  const [model, setModel] = useState('Golf VII');
  const [generation, setGeneration] = useState('MQB');
  const [yearRange, setYearRange] = useState('2014-2019');
  const [engineCode, setEngineCode] = useState('CRLB');
  const [affectedSystem, setAffectedSystem] = useState('Sobrealimentación');
  const [dtcCodes, setDtcCodes] = useState('P0299');
  const [symptoms, setSymptoms] = useState('Pérdida de potencia en plena carga');
  const [confirmedCause, setConfirmedCause] = useState('Álabes de geometría variable atascados');
  const [diagnosticMethod, setDiagnosticMethod] = useState('Comprobación de vacío con Mityvac');
  const [appliedSolution, setAppliedSolution] = useState('Descarbonización y ajuste de varilla');
  const [replacedParts, setReplacedParts] = useState('Ninguna (Limpieza ultrasónica)');
  const [laborTimeHours, setLaborTimeHours] = useState(3.5);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.engineCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dtcCodes.some((d) => d.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.confirmedCause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.affectedSystem.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSource = sourceFilter === 'all' || c.sourceType === sourceFilter;
    const matchesBrand = selectedBrand === 'all' || c.brand === selectedBrand;
    return matchesSearch && matchesSource && matchesBrand;
  });

  const brands = Array.from(new Set(cases.map((c) => c.brand)));

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    const newCase: KnowledgeCase = {
      id: `kb-${Date.now()}`,
      brand,
      model,
      generation,
      yearRange,
      engineCode,
      affectedSystem,
      dtcCodes: dtcCodes.split(',').map((s) => s.trim().toUpperCase()),
      symptoms: [symptoms],
      confirmedCause,
      diagnosticMethod,
      appliedSolution,
      replacedParts: replacedParts.split(',').map((p) => p.trim()),
      laborTimeHours: Number(laborTimeHours) || 2,
      sourceType: 'verified_workshop',
      verifiedCount: 1,
      author: 'Taller Registrado',
      createdAt: new Date().toISOString(),
    };

    onAddCase(newCase);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
                <BookOpen className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Base de Conocimiento de Averías Verificadas
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Boletines oficiales TSB, casuística real confirmada por mecánicos y soluciones con tiempo de reparación.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-md shadow-red-600/20 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Documentar Nueva Reparación Verificada</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por DTC (P0299, P0A0D), código motor (CRLB, N47), síntoma o causa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-11 pr-4 py-2.5 text-xs text-slate-800 font-medium focus:border-red-500 focus:bg-white focus:outline-none transition shadow-inner"
            />
          </div>

          <div className="w-full sm:w-auto flex flex-wrap gap-2">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-800 font-bold focus:border-red-500 focus:outline-none uppercase font-mono cursor-pointer"
            >
              <option value="all">TODAS LAS FUENTES</option>
              <option value="verified_workshop">TALLER VERIFICADO</option>
              <option value="official_tsb">BOLETÍN OFICIAL OEM (TSB)</option>
              <option value="community_contributed">COMUNIDAD TÉCNICA</option>
            </select>

            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-800 font-bold focus:border-red-500 focus:outline-none font-mono cursor-pointer"
            >
              <option value="all">TODAS LAS MARCAS</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm hover:border-slate-300 transition"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-slate-900 text-sm">
                  {c.brand} {c.model}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-lg font-mono font-black bg-slate-100 text-slate-900 border border-slate-200">
                  {c.engineCode}
                </span>
                <span className="text-xs text-slate-500 font-mono font-medium">({c.yearRange})</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold font-mono">
                  {c.affectedSystem}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {c.sourceType === 'official_tsb' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black font-mono bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                    <span>Boletín Oficial OEM (TSB)</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-black font-mono bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Caso Verificado en Taller ({c.verifiedCount} veces)</span>
                  </span>
                )}
              </div>
            </div>

            {/* DTC Codes and Root Cause */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-500 font-bold font-mono">DTCs implicados:</span>
                {c.dtcCodes.map((dtc) => (
                  <span
                    key={dtc}
                    className="text-xs px-2.5 py-0.5 rounded-lg font-mono font-black bg-red-50 text-red-600 border border-red-200"
                  >
                    {dtc}
                  </span>
                ))}
              </div>

              <div>
                <span className="text-xs font-black text-red-600 block font-mono uppercase">
                  CAUSA RAÍZ CONFIRMADA:
                </span>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {c.confirmedCause}
                </p>
              </div>
            </div>

            {/* Diagnostic method & Applied solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-black text-slate-700 block uppercase font-mono text-[11px]">
                  Procedimiento de Comprobación Instrumental:
                </span>
                <p className="text-slate-600 leading-relaxed font-medium">{c.diagnosticMethod}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-black text-emerald-800 block uppercase font-mono text-[11px]">
                  Solución Aplicada y Resultado:
                </span>
                <p className="text-slate-600 leading-relaxed font-medium">{c.appliedSolution}</p>
              </div>
            </div>

            {/* Replaced Parts & Labor */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="font-bold">Piezas sustituidas: </span>
                <strong className="text-slate-800 font-bold">{c.replacedParts.join(', ')}</strong>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-700 font-bold">
                  <Clock className="w-3.5 h-3.5 text-red-600" />
                  {c.laborTimeHours} horas
                </span>
                <span className="text-slate-400 font-medium">{c.author}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal to document a new verified repair */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-red-600" />
                <span>Documentar Avería Verificada en Base de Conocimiento</span>
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marca</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modelo</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código Motor</label>
                  <input
                    type="text"
                    required
                    value={engineCode}
                    onChange={(e) => setEngineCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-red-600 font-mono uppercase font-black focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Códigos DTC (separados por coma)</label>
                  <input
                    type="text"
                    required
                    value={dtcCodes}
                    onChange={(e) => setDtcCodes(e.target.value)}
                    placeholder="P0299, P2563"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-red-600 font-mono uppercase font-bold focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sistema Afectado</label>
                  <input
                    type="text"
                    required
                    value={affectedSystem}
                    onChange={(e) => setAffectedSystem(e.target.value)}
                    placeholder="Sobrealimentación / Red CAN"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Causa Raíz Confirmada *</label>
                <textarea
                  rows={2}
                  required
                  value={confirmedCause}
                  onChange={(e) => setConfirmedCause(e.target.value)}
                  placeholder="Explicación del origen físico o eléctrico demostrado..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-slate-900 font-medium focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Método de Comprobación Instrumental *</label>
                <textarea
                  rows={2}
                  required
                  value={diagnosticMethod}
                  onChange={(e) => setDiagnosticMethod(e.target.value)}
                  placeholder="Medición con polímetro / osciloscopio que aisló el problema..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-slate-900 font-medium focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Solución Técnica Aplicada *</label>
                <textarea
                  rows={2}
                  required
                  value={appliedSolution}
                  onChange={(e) => setAppliedSolution(e.target.value)}
                  placeholder="Sustitución, descarbonización, saneamiento de masa..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-slate-900 font-medium focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Piezas Sustituidas</label>
                  <input
                    type="text"
                    value={replacedParts}
                    onChange={(e) => setReplacedParts(e.target.value)}
                    placeholder="Ref. recambio o descripción"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tiempo de Reparación (Horas)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={laborTimeHours}
                    onChange={(e) => setLaborTimeHours(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-md shadow-red-600/20 cursor-pointer"
                >
                  Guardar en Base de Conocimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
