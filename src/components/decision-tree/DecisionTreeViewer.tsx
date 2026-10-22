/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GitBranch,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface DecisionNode {
  id: string;
  stepNumber: number;
  question: string;
  toolRequired: string;
  testProcedure: string;
  referenceSpec: string;
  yesNextId: string | null;
  noNextId: string | null;
  outcome?: {
    type: 'success' | 'failure' | 'action';
    title: string;
    description: string;
    recommendedRepair: string;
    partsCandidate?: string[];
  };
}

interface DiagnosticTree {
  id: string;
  title: string;
  system: string;
  applicableDTCs: string[];
  description: string;
  startNodeId: string;
  nodes: { [key: string]: DecisionNode };
}

export const DecisionTreeViewer: React.FC = () => {
  const trees: DiagnosticTree[] = [
    {
      id: 'tree-can',
      title: 'Diagnóstico de Red de Comunicación CAN Bus (U0100 / Fallo Multiplexado)',
      system: 'Redes de Comunicación y Módulos Gateway',
      applicableDTCs: ['U0100', 'U0126', 'U110F', 'U0401'],
      description:
        'Procedimiento metódico para diagnosticar colapso de red CAN High / Low, cortocircuitos a masa o positivo, y resistencia de terminación anómala.',
      startNodeId: 'can-1',
      nodes: {
        'can-1': {
          id: 'can-1',
          stepNumber: 1,
          question: '¿La resistencia entre los pines 6 (CAN High) y 14 (CAN Low) del puerto OBD-II mide 60 Ω ± 4 Ω con contacto quitado?',
          toolRequired: 'Multímetro en rango 200 Ω',
          testProcedure:
            'Desconectar el contacto, esperar a que la red entre en reposo (sleep mode, aprox. 2 min). Medir resistencia en bornes 6 y 14 del conector DLC.',
          referenceSpec: '58.0 Ω a 63.0 Ω (Dos resistencias de 120 Ω en paralelo instaladas en los módulos extremos).',
          yesNextId: 'can-3',
          noNextId: 'can-2',
        },
        'can-2': {
          id: 'can-2',
          stepNumber: 2,
          question: '¿La lectura obtenida es de aproximadamente 120 Ω?',
          toolRequired: 'Multímetro en Ω',
          testProcedure: 'Analizar el valor medido si no fueron 60 Ω.',
          referenceSpec: '120 Ω indica circuito abierto en una de las dos resistencias terminales OEM.',
          yesNextId: 'can-outcome-120',
          noNextId: 'can-outcome-short',
        },
        'can-3': {
          id: 'can-3',
          stepNumber: 3,
          question: 'Con contacto puesto, ¿los voltajes de reposo son: CAN-H ≈ 2.5V - 3.5V y CAN-L ≈ 2.5V - 1.5V?',
          toolRequired: 'Multímetro en V DC o Osciloscopio 2 canales',
          testProcedure:
            'Conectar punta negra a masa del chasis (pin 4 DLC) y punta roja a pin 6 (CAN-H), luego a pin 14 (CAN-L).',
          referenceSpec: 'CAN-H: 2.5V recesivo a 3.5V dominante. CAN-L: 2.5V recesivo a 1.5V dominante. Suma CAN-H + CAN-L ≈ 5.0V.',
          yesNextId: 'can-4',
          noNextId: 'can-outcome-bias-fault',
        },
        'can-4': {
          id: 'can-4',
          stepNumber: 4,
          question: 'En el osciloscopio, ¿las tramas de datos reflejan espejo simétrico perfecto sin picos parásitos ni redondeo de flancos?',
          toolRequired: 'Osciloscopio a 500 kbps (Base de tiempos 10 µs / div)',
          testProcedure:
            'Capturar 5 tramas consecutivas mientras se sacude suavemente el mazo de cables y conectores principales.',
          referenceSpec: 'Flancos cuadrados limpios de 2.0V de amplitud diferencial.',
          yesNextId: 'can-outcome-ok',
          noNextId: 'can-outcome-noise',
        },
        'can-outcome-120': {
          id: 'can-outcome-120',
          stepNumber: 5,
          question: 'Resultado',
          toolRequired: 'Inspección',
          testProcedure: 'Conclusión',
          referenceSpec: 'N/A',
          yesNextId: null,
          noNextId: null,
          outcome: {
            type: 'failure',
            title: 'Línea de bus CAN abierta hacia una unidad terminal',
            description:
              'Al medir 120 Ω en lugar de 60 Ω, se deduce que uno de los dos módulos de terminación (generalmente la ECU de motor o el Cuadro de Instrumentos / Gateway) está desconectado, sin alimentación o con corte de línea.',
            recommendedRepair:
              'Comprobar continuidad del par trenzado hasta la ECU de motor y verificar alimentaciones del módulo.',
            partsCandidate: ['Cableado par trenzado CAN', 'Unidad de control de motor o Gateway'],
          },
        },
        'can-outcome-short': {
          id: 'can-outcome-short',
          stepNumber: 5,
          question: 'Resultado',
          toolRequired: 'Inspección',
          testProcedure: 'Conclusión',
          referenceSpec: 'N/A',
          yesNextId: null,
          noNextId: null,
          outcome: {
            type: 'failure',
            title: 'Cortocircuito entre líneas CAN o hacia masa/positivo',
            description:
              'Si la resistencia es cercana a 0 Ω, hay un corto entre CAN-H y CAN-L. Si es infinita, el conector DLC está desvinculado del bus principal.',
            recommendedRepair:
              'Desconectar unidades una a una en el peine distribuidor de CAN hasta que la resistencia suba a 60 Ω para aislar el módulo defectuoso.',
          },
        },
        'can-outcome-bias-fault': {
          id: 'can-outcome-bias-fault',
          stepNumber: 5,
          question: 'Resultado',
          toolRequired: 'Inspección',
          testProcedure: 'Conclusión',
          referenceSpec: 'N/A',
          yesNextId: null,
          noNextId: null,
          outcome: {
            type: 'failure',
            title: 'Tensión de polarización dominante anormal (Corto a B+ o Masa)',
            description:
              'Uno de los cables de la red está en contacto con masa del chasis (0V fijo) o con +12V continuo por rozamiento o agua en un pasamuros.',
            recommendedRepair:
              'Revisar manguitos pasacables en puertas, vano motor y bajo moqueta buscando aplastamiento de cables.',
          },
        },
        'can-outcome-noise': {
          id: 'can-outcome-noise',
          stepNumber: 5,
          question: 'Resultado',
          toolRequired: 'Inspección',
          testProcedure: 'Conclusión',
          referenceSpec: 'N/A',
          yesNextId: null,
          noNextId: null,
          outcome: {
            type: 'failure',
            title: 'Ruido electromagnético o interferencia parásita',
            description:
              'Se detectan picos espurios o pérdida de simetría provocados habitualmente por el alternador (diodo rectificador dañado) o bobinas de encendido con aislamiento agrietado.',
            recommendedRepair:
              'Desconectar el alternador momentáneamente o comprobar rizado de tensión en alterna con osciloscopio (< 0.2V AC).',
          },
        },
        'can-outcome-ok': {
          id: 'can-outcome-ok',
          stepNumber: 5,
          question: 'Resultado',
          toolRequired: 'Inspección',
          testProcedure: 'Conclusión',
          referenceSpec: 'N/A',
          yesNextId: null,
          noNextId: null,
          outcome: {
            type: 'success',
            title: 'Capa física de red CAN Bus en perfecto estado',
            description:
              'La resistencia de 60 Ω, las tensiones de polarización y las señales cuadradas diferenciales son impecables. La causa del código U0100 no es el cableado, sino un cuelgue interno del microcontrolador de una ECU por caída momentánea de su alimentación 12V.',
            recommendedRepair:
              'Inspeccionar el relé de alimentación principal de la ECU y comprobar caídas de tensión en sus bornes 30 y 15.',
          },
        },
      },
    },
    {
      id: 'tree-ground',
      title: 'Comprobación de Caídas de Tensión y Masa Flotante (P0562 / Errores Múltiples)',
      system: 'Sistema de Carga, Batería y Masas de Potencia',
      applicableDTCs: ['P0562', 'P0606', 'U1000', 'P0560'],
      description:
        'Método dinámico bajo carga para detectar falsos contactos y resistencias parásitas en bornes de masa que provocan fallos esporádicos difíciles.',
      startNodeId: 'gnd-1',
      nodes: {
        'gnd-1': {
          id: 'gnd-1',
          stepNumber: 1,
          question: 'Con el motor en marcha y consumidores encendidos (luces largas + luneta), ¿la caída de tensión entre el borne negativo de la batería y el bloque del motor es menor a 0.10V (100 mV)?',
          toolRequired: 'Multímetro en rango 2V DC con cables largos',
          testProcedure:
            'Colocar punta negra en el borne metálico de plomo negativo de la batería y punta roja en metal limpio del bloque motor. Acelerar a 2000 RPM.',
          referenceSpec: 'Menor a 0.05V (50 mV). Máximo admisible: 0.10V.',
          yesNextId: 'gnd-2',
          noNextId: 'gnd-outcome-engine-ground',
        },
        'gnd-2': {
          id: 'gnd-2',
          stepNumber: 2,
          question: '¿La caída de tensión entre el borne negativo de la batería y la chapa del chasis es menor a 0.05V (50 mV)?',
          toolRequired: 'Multímetro en rango 2V DC',
          testProcedure:
            'Medir entre borne de plomo negativo y tornillo de masa de torreta de amortiguador o carrocería.',
          referenceSpec: '< 0.05V.',
          yesNextId: 'gnd-3',
          noNextId: 'gnd-outcome-chassis-ground',
        },
        'gnd-3': {
          id: 'gnd-3',
          stepNumber: 3,
          question: 'Entre el terminal positivo B+ del alternador y el borne positivo de la batería, ¿la caída de tensión es menor a 0.25V?',
          toolRequired: 'Multímetro en 20V DC',
          testProcedure:
            'Medir entre la tuerca B+ trasera del alternador y el borne de plomo positivo de la batería con consumidores activados.',
          referenceSpec: '< 0.25V.',
          yesNextId: 'gnd-outcome-ok',
          noNextId: 'gnd-outcome-bplus',
        },
        'gnd-outcome-engine-ground': {
          id: 'gnd-outcome-engine-ground',
          stepNumber: 4,
          question: 'Resultado',
          toolRequired: 'Taller',
          testProcedure: 'Conclusión',
          referenceSpec: 'N/A',
          yesNextId: null,
          noNextId: null,
          outcome: {
            type: 'failure',
            title: 'Malla o trenza de masa motor-carrocería sulfatada / rota',
            description:
              'Una caída superior a 0.2V en el retorno de masa del motor provoca que la corriente busque retorno por las masas finas de los sensores de la ECU, quemando las pistas internas de masa del módulo.',
            recommendedRepair:
              'Desmontar la trenza de masa principal, limpiar con cepillo de alambre y grasa de cobre, o sustituirla por nueva.',
            partsCandidate: ['Trenza de masa chasis-caja de cambios'],
          },
        },
        'gnd-outcome-chassis-ground': {
          id: 'gnd-outcome-chassis-ground',
          stepNumber: 4,
          question: 'Resultado',
          toolRequired: 'Taller',
          testProcedure: 'Conclusión',
          referenceSpec: 'N/A',
          yesNextId: null,
          noNextId: null,
          outcome: {
            type: 'failure',
            title: 'Conexión de masa principal de carrocería floja o pintada',
            description:
              'Típico tras reparaciones de chapa y pintura donde no se lijó la pintura en el punto de atornillado del borne de masa.',
            recommendedRepair:
              'Lijar chapa viva y reapretar al par prescrito.',
          },
        },
        'gnd-outcome-bplus': {
          id: 'gnd-outcome-bplus',
          stepNumber: 4,
          question: 'Resultado',
          toolRequired: 'Taller',
          testProcedure: 'Conclusión',
          referenceSpec: 'N/A',
          yesNextId: null,
          noNextId: null,
          outcome: {
            type: 'failure',
            title: 'Caída excesiva en el cable positivo de carga del alternador',
            description:
              'Terminal engarzado del cable de carga recalentado con resistencia parásita. La batería no se carga correctamente a pesar de que el alternador genera 14V.',
            recommendedRepair:
              'Sustituir el tramo de cable B+ o soldar nuevo terminal con estaño de alta temperatura.',
          },
        },
        'gnd-outcome-ok': {
          id: 'gnd-outcome-ok',
          stepNumber: 4,
          question: 'Resultado',
          toolRequired: 'Taller',
          testProcedure: 'Conclusión',
          referenceSpec: 'N/A',
          yesNextId: null,
          noNextId: null,
          outcome: {
            type: 'success',
            title: 'Circuito de masa y carga en estado óptimo',
            description:
              'Todas las caídas de tensión están por debajo de 0.05V. El sistema eléctrico de potencia no tiene resistencia parásita.',
            recommendedRepair: 'No intervenir en las líneas de masa.',
          },
        },
      },
    },
  ];

  const [selectedTreeId, setSelectedTreeId] = useState<string>(trees[0].id);
  const currentTree = trees.find((t) => t.id === selectedTreeId) || trees[0];
  const [currentNodeId, setCurrentNodeId] = useState<string>(currentTree.startNodeId);
  const [history, setHistory] = useState<string[]>([]);

  const handleSelectTree = (treeId: string) => {
    setSelectedTreeId(treeId);
    const tree = trees.find((t) => t.id === treeId) || trees[0];
    setCurrentNodeId(tree.startNodeId);
    setHistory([]);
  };

  const handleChoice = (isYes: boolean) => {
    const node = currentTree.nodes[currentNodeId];
    if (!node) return;
    const nextId = isYes ? node.yesNextId : node.noNextId;
    if (nextId) {
      setHistory((prev) => [...prev, currentNodeId]);
      setCurrentNodeId(nextId);
    }
  };

  const handleReset = () => {
    setCurrentNodeId(currentTree.startNodeId);
    setHistory([]);
  };

  const currentNode = currentTree.nodes[currentNodeId];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
                <GitBranch className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Árboles de Decisión y Procedimientos Guiados
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Avance secuencial desde el síntoma inicial hasta la causa confirmada con bifurcación por mediciones reales.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Árbol</span>
            </button>
          </div>
        </div>

        {/* Tree Selector Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
          {trees.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectTree(t.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                selectedTreeId === t.id
                  ? 'bg-[#0b1329] text-white border-[#0b1329] shadow-md shadow-slate-900/10'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-red-500" />
              <span>{t.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Step Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl font-mono text-xs font-black bg-red-50 text-red-600 border border-red-200">
              Paso #{currentNode?.stepNumber || 1}
            </span>
            <span className="text-xs font-bold text-slate-600">{currentTree.system}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <span className="font-bold">DTCs vinculados:</span>
            {currentTree.applicableDTCs.map((d) => (
              <span key={d} className="px-2 py-0.5 rounded-lg bg-red-50 text-red-600 font-black border border-red-200">
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* If Terminal Outcome Node */}
        {currentNode?.outcome ? (
          <div
            className={`p-6 sm:p-7 rounded-3xl border space-y-4 shadow-sm ${
              currentNode.outcome.type === 'success'
                ? 'bg-emerald-50/70 border-emerald-300'
                : 'bg-red-50/70 border-red-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`p-3 rounded-2xl ${
                  currentNode.outcome.type === 'success'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {currentNode.outcome.type === 'success' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </span>
              <div>
                <span className="text-xs font-mono uppercase font-black text-slate-500">
                  CONCLUSIÓN TÉCNICA DEL ÁRBOL
                </span>
                <h3 className="text-lg font-black text-slate-900">{currentNode.outcome.title}</h3>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {currentNode.outcome.description}
            </p>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-sm">
              <span className="text-xs font-black text-red-600 flex items-center gap-1.5 uppercase font-mono">
                <Zap className="w-3.5 h-3.5" />
                Intervención Correctiva Recomendada:
              </span>
              <p className="text-xs text-slate-800 font-bold">
                {currentNode.outcome.recommendedRepair}
              </p>

              {currentNode.outcome.partsCandidate && (
                <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-bold">Piezas implicadas:</span>
                  {currentNode.outcome.partsCandidate.map((p, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-mono text-[11px] font-bold border border-slate-200">
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-md shadow-red-600/20 cursor-pointer"
              >
                Reiniciar Prueba Guiada
              </button>
            </div>
          </div>
        ) : (
          /* Active Question Node */
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-black text-red-600 uppercase tracking-wider">
                COMPROBACIÓN EN CURSO:
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {currentNode?.question}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase font-mono">
                  <Activity className="w-3.5 h-3.5 text-red-600" />
                  Procedimiento de Medición:
                </span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {currentNode?.testProcedure}
                </p>
                <div className="text-[11px] text-red-600 font-mono font-bold pt-1">
                  🛠 Herramienta: {currentNode?.toolRequired}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Valor de Referencia Documentado OEM:
                </span>
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-emerald-800 shadow-sm">
                  {currentNode?.referenceSpec}
                </div>
              </div>
            </div>

            {/* Answer buttons: SÍ vs NO */}
            <div className="pt-2">
              <span className="text-xs text-slate-500 block mb-2 font-bold uppercase font-mono">
                Seleccione el resultado de la comprobación:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleChoice(true)}
                  className="p-5 rounded-2xl bg-white hover:bg-emerald-50/50 border-2 border-slate-200 hover:border-emerald-500 text-left transition group shadow-sm cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-black text-slate-900 group-hover:text-emerald-700">
                      SÍ / Conforme
                    </span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-500 leading-snug font-medium">
                    El valor medido se encuentra dentro de la especificación técnica admitida.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleChoice(false)}
                  className="p-5 rounded-2xl bg-white hover:bg-rose-50/50 border-2 border-slate-200 hover:border-red-500 text-left transition group shadow-sm cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-black text-slate-900 group-hover:text-red-700">
                      NO / Fuera de especificación
                    </span>
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-xs text-slate-500 leading-snug font-medium">
                    Lectura anómala, abierta, cortocircuitada o fuera de tolerancia permitida.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trail History Navigation */}
        {history.length > 0 && (
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
            <span className="font-bold">Ruta recorrida:</span>
            {history.map((stepId) => (
              <span key={stepId} className="flex items-center gap-1 font-mono text-slate-600 font-bold">
                Paso #{currentTree.nodes[stepId]?.stepNumber}
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </span>
            ))}
            <span className="text-red-600 font-mono font-black">Paso Actual</span>
          </div>
        )}
      </div>
    </div>
  );
};
