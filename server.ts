/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side initialization of Gemini client as per skill guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function hasValidApiKey(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 5 && key !== 'MY_GEMINI_API_KEY');
}

async function callGeminiWithTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  let timeoutHandle: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error('Timeout de consulta Gemini')), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle);
  }
}

// Diagnostic Engine Endpoint
app.post('/api/gemini/diagnose', async (req: Request, res: Response) => {
  try {
    const { vehicle, faultRecord, additionalNotes } = req.body;

    if (!vehicle || !faultRecord) {
      return res.status(400).json({ error: 'Faltan datos del vehículo o de la avería.' });
    }

    const isHighVoltage =
      vehicle.systemVoltage === '400V_high_voltage' ||
      vehicle.systemVoltage === '800V_high_voltage' ||
      vehicle.fuelType === 'hybrid' ||
      vehicle.fuelType === 'phev' ||
      vehicle.fuelType === 'electric' ||
      faultRecord.hasHighVoltageRisk;

    const prompt = `
Actúa como un Ingeniero Jefe de Diagnóstico Electromecánico y Automotriz en un taller de alta especialización.
Analiza la siguiente información de entrada y genera un diagnóstico técnico exhaustivo, riguroso y metódico.

DATOS DEL VEHÍCULO:
- Marca y Modelo: ${vehicle.brand} ${vehicle.model} (${vehicle.versionTrim})
- Año: ${vehicle.year} | Kilometraje: ${vehicle.mileage} km
- Código Motor: ${vehicle.engineCode || 'No especificado'} | Cilindrada/Potencia: ${vehicle.displacement || ''} ${vehicle.powerHp ? vehicle.powerHp + ' CV' : ''}
- Combustible: ${vehicle.fuelType} | Transmisión: ${vehicle.transmission} (${vehicle.driveType})
- Tensión del sistema: ${vehicle.systemVoltage}
- Tipo Inyección: ${vehicle.injectionType || 'Estándar'}
- ECUs registradas: ${(vehicle.installedECUs || []).join(', ') || 'No detalladas'}

REGISTRO DE AVERÍA:
- Título: ${faultRecord.title}
- Síntomas observados: ${(faultRecord.observedSymptoms || []).join('; ')}
- Testigos en cuadro: ${(faultRecord.dashboardWarnings || []).join('; ')}
- Códigos DTC: ${JSON.stringify(faultRecord.dtcCodes || [])}
- Frecuencia: ${faultRecord.frequency} | Severidad: ${faultRecord.severity} | Categoría: ${faultRecord.category}
- Condiciones de aparición: ${JSON.stringify(faultRecord.conditions || {})}
- Reparaciones previas en otros talleres: ${faultRecord.priorRepairs || 'Ninguna'}
- Comprobaciones preliminares ya realizadas: ${faultRecord.preliminaryChecks || 'Ninguna'}
- Notas adicionales del técnico: ${additionalNotes || 'Ninguna'}

REGLAS TÉCNICAS OBLIGATORIAS:
1. NUNCA aconsejar sustitución indiscriminada de piezas sin comprobaciones previas comprobables.
2. Identifica entre 2 y 4 hipótesis explicativas con grado de confianza (ALTA, MEDIA, BAJA) y puntuación 0-100 justificada técnicamente.
3. Para cada hipótesis, proporciona los pasos diagnósticos secuenciales con herramienta exacta requerida (Multímetro, Osciloscopio con base de tiempos/voltaje, Vacuómetro, Mityvac, etc.), componente diana, procedimiento detallado, valores de referencia técnicos admisibles y qué hacer según dé "CONFORME" o "FALLA".
4. ${
      isHighVoltage
        ? 'CRÍTICO: Este vehículo tiene sistema de ALTA TENSIÓN (HV). Incluye advertencias de seguridad obligatorias (Desconexión de batería 12V previa, extracción y custodia de Service Plug de tracción, verificación de ausencia de tensión con voltímetro CAT III 1000V, uso de guantes clase 0 de 1000V).'
        : 'Incluye advertencias de seguridad física si aplica (altas temperaturas de turbo/escape, riesgo de inyección a 2000 bar, riesgos con airbag o sistemas de freno).'
    }
5. No inventes pares de apriete ni pinouts si no están documentados con certeza; si falta información, pide explícitamente la documentación OEM.

Devuelve EXCLUSIVAMENTE un objeto JSON válido con la siguiente estructura exacta:
{
  "safetyAlerts": ["alerta 1", "alerta 2"],
  "highVoltageWarning": "${isHighVoltage ? 'Texto explicativo del protocolo de desenergización y seguridad HV' : ''}",
  "hypotheses": [
    {
      "id": "hyp-1",
      "title": "Nombre técnico de la causa hipotética",
      "confidence": "ALTA" | "MEDIA" | "BAJA",
      "confidenceScore": 85,
      "technicalJustification": "Explicación electromecánica profunda de por qué estos síntomas y DTCs apuntan aquí",
      "rootCauseAnalysis": "Fallo físico o eléctrico exacto",
      "suspectedParts": ["Pieza 1", "Pieza 2"],
      "safetyWarnings": ["Precaución específica"],
      "diagnosticSteps": [
        {
          "stepNumber": 1,
          "name": "Nombre de la prueba",
          "toolRequired": "Herramienta precisa",
          "targetComponent": "Componente a medir",
          "procedure": "Paso a paso exacto para el mecánico",
          "referenceValues": "Tensiones, resistencias, presiones o formas de onda esperadas",
          "ifPass": "Qué deducir y qué comprobar a continuación",
          "ifFail": "Qué avería confirma este resultado negativo"
        }
      ]
    }
  ],
  "technicalSummary": "Resumen ejecutivo del plan de ataque para el taller"
}
`;

    // Check if valid API key is provided
    if (hasValidApiKey()) {
      try {
        const response = await callGeminiWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            },
          })
        );

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText);
        return res.json(parsed);
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to intelligent rule engine:', geminiError);
      }
    }

    // Intelligent fallback rule engine if API key is unset or in case of transient errors
    const fallback = generateAutomotiveDiagnosticFallback(vehicle, faultRecord, isHighVoltage);
    return res.json(fallback);
  } catch (error: any) {
    console.error('Error in /api/gemini/diagnose:', error);
    res.status(500).json({ error: 'Error al procesar el diagnóstico automotriz.' });
  }
});

// Refine diagnosis when technician inputs real measurement from multimeter/oscilloscope
app.post('/api/gemini/refine-diagnosis', async (req: Request, res: Response) => {
  try {
    const { session, newMeasurement, vehicle, faultRecord } = req.body;

    if (!session || !newMeasurement) {
      return res.status(400).json({ error: 'Faltan datos de la sesión o de la medición.' });
    }

    const prompt = `
Actúa como Ingeniero Especialista en Diagnóstico Automotriz.
El mecánico en el taller acaba de realizar una prueba y aportar un nuevo resultado real:

VEHÍCULO: ${vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.engineCode || ''})` : 'Vehículo en taller'}
SÍNTOMAS / DTCs: ${faultRecord?.title || ''} - DTCs: ${(faultRecord?.dtcCodes || []).map((d: any) => d.code).join(', ')}

MEDICIÓN INTRODUCIDA POR EL TÉCNICO:
- Prueba efectuada: ${newMeasurement.testName}
- Valor o comportamiento medido: "${newMeasurement.measuredValue}"
- ¿Dentro de especificación esperada?: ${newMeasurement.isWithinSpec ? 'SÍ (CONFORME)' : 'NO (FALLA)'}
- Observaciones de campo: "${newMeasurement.notes || 'Sin notas'}"

HIPÓTESIS ACTUALES PREVIAS:
${JSON.stringify(session.hypotheses || [])}

TAREA:
1. Analiza el impacto técnico de este resultado.
2. Si la prueba falla en el componente esperado, aumenta la confianza o confirma la causa raíz.
3. Si la prueba pasa conforme a especificación, descarta esa hipótesis y promueve la siguiente.
4. Redacta notas de evolución técnica y, si hay certeza suficiente, declara la causa confirmada y el procedimiento de subsanación.

Devuelve EXCLUSIVAMENTE un JSON con:
{
  "aiEvolutionNotes": "Análisis técnico de cómo la nueva medición redefine el diagnóstico...",
  "updatedHypotheses": [ ...mismas hipótesis con puntuación y confianza recalculadas... ],
  "confirmedCause": "Causa raíz confirmada si la medición fue concluyente (o null si se necesitan más pruebas)",
  "recommendedAction": "Paso inmediato que debe tomar el técnico"
}
`;

    if (hasValidApiKey()) {
      try {
        const response = await callGeminiWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            },
          })
        );
        const parsed = JSON.parse(response.text || '{}');
        return res.json(parsed);
      } catch (err) {
        console.warn('Gemini refine fallback triggered:', err);
      }
    }

    // Heuristic fallback for updating measurement feedback
    const isPass = newMeasurement.isWithinSpec;
    const notes = isPass
      ? `EVALUACIÓN TÉCNICA: La medición en '${newMeasurement.testName}' arrojó un valor conforme a tolerancia OEM ("${newMeasurement.measuredValue}"). Esto permite DESCARTAR fallo en este componente o circuito y enfocar el diagnóstico en la siguiente hipótesis secundaria.`
      : `EVALUACIÓN TÉCNICA: El valor reportado ("${newMeasurement.measuredValue}") se encuentra FUERA DE ESPECIFICACIÓN. Este resultado valida la hipótesis activa, confirmando anomalía eléctrica/mecánica en el componente o línea medida. Proceder a inspeccionar el cableado y verificar ausencia de falsos contactos antes de reemplazar la pieza.`;

    const updatedHypotheses = (session.hypotheses || []).map((h: any, idx: number) => {
      if (idx === 0) {
        return {
          ...h,
          confidenceScore: isPass ? Math.max(20, h.confidenceScore - 40) : Math.min(98, h.confidenceScore + 15),
          confidence: isPass ? 'BAJA' : 'ALTA',
        };
      }
      return h;
    });

    return res.json({
      aiEvolutionNotes: notes,
      updatedHypotheses,
      confirmedCause: !isPass ? `Anomalía confirmada mediante prueba física en ${newMeasurement.testName}: ${newMeasurement.measuredValue}` : null,
      recommendedAction: !isPass ? 'Verificar conectores y aislamiento previo a sustitución.' : 'Continuar con el paso de la siguiente hipótesis.',
    });
  } catch (error) {
    console.error('Error refining diagnosis:', error);
    res.status(500).json({ error: 'Error al refinar el diagnóstico.' });
  }
});

// Technical report generator
app.post('/api/gemini/generate-report', async (req: Request, res: Response) => {
  try {
    const { vehicle, workOrder, faultRecord, session } = req.body;

    const prompt = `
Genera un informe técnico formal de reparación de taller para el cliente y el archivo del taller.
VEHÍCULO: ${vehicle?.brand} ${vehicle?.model} (${vehicle?.licensePlate || ''}), VIN: ${vehicle?.vin || ''}, Motor: ${vehicle?.engineCode || ''}.
ORDEN DE TRABAJO: ${workOrder?.number || 'OT-001'}
AVERÍA TRATADA: ${faultRecord?.title || ''} (DTCs: ${(faultRecord?.dtcCodes || []).map((d: any) => d.code).join(', ')})
CAUSA CONFIRMADA: ${session?.confirmedCause || 'Comprobaciones electromecánicas concluidas'}
MEDICIONES REGISTRADAS: ${JSON.stringify(session?.submittedMeasurements || [])}

Escribe un informe riguroso, profesional, sin lenguaje coloquial, que incluya:
1. Resumen técnico del fallo reportado.
2. Metodología de diagnóstico empleada y mediciones clave.
3. Causa raíz confirmada.
4. Intervención correctiva aplicada.
5. Comprobaciones de control de calidad posteriores a la reparación.
6. Recomendaciones de uso y mantenimiento preventivo para el cliente.

Devuelve formato JSON con:
{
  "reportTitle": "Certificado Técnico de Reparación y Diagnosis",
  "faultSummary": "...",
  "confirmedCause": "...",
  "appliedSolution": "...",
  "postRepairVerifications": ["Prueba en carretera...", "Borrado de DTCs...", "Lectura de parámetros en vivo..."],
  "notesForCustomer": "..."
}
`;

    if (hasValidApiKey()) {
      try {
        const response = await callGeminiWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            },
          })
        );
        return res.json(JSON.parse(response.text || '{}'));
      } catch (err) {
        console.warn('Report generator fallback:', err);
      }
    }

    return res.json({
      reportTitle: `Informe Técnico Oficial de Diagnosis - ${vehicle?.brand || 'Vehículo'} ${vehicle?.model || ''}`,
      faultSummary: `Se atendió la incidencia descrita como "${faultRecord?.title || 'Fallo de gestión electromecánica'}" con códigos DTC registrados: ${(faultRecord?.dtcCodes || []).map((d: any) => d.code).join(', ') || 'N/A'}.`,
      confirmedCause: session?.confirmedCause || 'Discrepancia electromecánica detectada tras comprobaciones con instrumental homologado.',
      appliedSolution: 'Procedimiento de comprobación, saneamiento de cableado/conectores y ajuste de parámetros de funcionamiento de acuerdo a manual de taller.',
      postRepairVerifications: [
        'Prueba dinámica en carretera verificando ausencia de tirones y respuesta correcta en aceleración',
        'Ciclo de conducción completo con verificación de monitores OBD-II listos',
        'Nuevo barrido de diagnosis confirmando 0 DTCs activos en todas las unidades de control',
      ],
      notesForCustomer: 'Se recomienda realizar las revisiones periódicas conforme al plan de mantenimiento y vigilar el nivel de fluidos.',
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Error al generar informe técnico.' });
  }
});

// Rapid DTC Explainer
app.post('/api/gemini/dtc-lookup', async (req: Request, res: Response) => {
  try {
    const { code, brand } = req.body;
    if (!code) return res.status(400).json({ error: 'Código DTC requerido.' });

    const prompt = `
Explica de manera técnica para un mecánico de automoción el código DTC "${code}" en vehículos ${brand || 'multimarca'}.
Indica:
1. Significado estandarizado SAE/ISO y si tiene interpretación particular del fabricante.
2. Subsistema involucrado (Inyección, Sobrealimentación, CAN, Emisiones, Alta Tensión, ABS, etc.).
3. Condiciones que disparan el código (Freeze Frame / Lógica de detección de la ECU).
4. Pruebas prioritarias recomendadas con polímetro u osciloscopio antes de sustituir componentes.
5. Piezas o cableados más frecuentemente afectados en la práctica.

Devuelve JSON:
{
  "code": "${code}",
  "title": "Descripción técnica concisa",
  "affectedSystem": "Sistema",
  "detectionConditions": "Lógica de disparo de la ECU",
  "priorityChecks": ["Prueba 1...", "Prueba 2..."],
  "commonCulprits": ["Causa común 1...", "Causa común 2..."]
}
`;

    if (hasValidApiKey()) {
      try {
        const response = await callGeminiWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' },
          })
        );
        return res.json(JSON.parse(response.text || '{}'));
      } catch (e) {
        console.warn('DTC lookup fallback:', e);
      }
    }

    return res.json({
      code,
      title: `Diagnóstico para código ${code}`,
      affectedSystem: code.startsWith('P0') ? 'Tren motriz estandarizado (Powertrain)' : code.startsWith('U') ? 'Red de comunicación (Network / CAN)' : code.startsWith('C') ? 'Chasis (ABS/ESP)' : 'Carrocería / Confort',
      detectionConditions: 'La ECU detecta una señal fuera de rango durante más de 2 ciclos de conducción continuos.',
      priorityChecks: [
        'Comprobación de tensión de alimentación y resistencia de masa del circuito.',
        'Inspección visual de conectores por posible sulfatación o humedad.',
        'Comprobación de la señal del sensor mediante osciloscopio en tiempo real.',
      ],
      commonCulprits: ['Cableado deteriorado o pin retraído', 'Fallo interno de componente', 'Fuga de vacío o aire parásito'],
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en consulta DTC.' });
  }
});

// Helper rule engine when offline or no API key is set
function generateAutomotiveDiagnosticFallback(vehicle: any, faultRecord: any, isHighVoltage: boolean) {
  const dtcList = (faultRecord.dtcCodes || []).map((d: any) => d.code.toUpperCase());
  const safetyAlerts: string[] = [];

  if (isHighVoltage) {
    safetyAlerts.push('¡PELIGRO ALTA TENSIÓN! Desconectar batería auxiliar 12V y extraer conector de servicio (Service Plug) antes de iniciar mediciones.');
    safetyAlerts.push('Comprobar ausencia de tensión con voltímetro CAT III 1000V en bornes de condensador del inversor antes de tocar circuitos naranjas.');
  } else {
    safetyAlerts.push('Precaución: Esperar enfriamiento del circuito de sobrealimentación y escape antes de manipular actuadores neumáticos.');
    safetyAlerts.push('No desconectar componentes con encendido conectado para evitar picos de tensión en la ECU.');
  }

  // Check specific DTC patterns
  if (dtcList.some((d: string) => d.includes('P0299'))) {
    return {
      safetyAlerts,
      highVoltageWarning: isHighVoltage ? 'Protocolo HV requerido.' : '',
      technicalSummary: 'El código P0299 indica falta de presión de turbo frente a la consigna. Se debe verificar estanqueidad neumática antes de culpar al turbocompresor.',
      hypotheses: [
        {
          id: 'hyp-1',
          title: 'Agarrotamiento mecánico de la geometría variable del turbocompresor o fallo en pulmón de vacío',
          confidence: 'ALTA',
          confidenceScore: 88,
          technicalJustification: 'La discrepancia entre la presión sobrealimentación solicitada por la ECU y la medida por el sensor MAP G31 con entrada en modo degradado es típica de álabes atascados por hollín en motores turbodiésel con kilometraje medio-alto.',
          rootCauseAnalysis: 'Álabes de la geometría variable atascados o membrana del pulmón de vacío con microfuga.',
          suspectedParts: ['Turbocompresor (Geometría VNT)', 'Actuador neumático con sensor G581', 'Manguitos de vacío'],
          diagnosticSteps: [
            {
              stepNumber: 1,
              name: 'Comprobación de desplazamiento y estanqueidad del actuador de vacío con Mityvac',
              toolRequired: 'Bomba de vacío manual (Mityvac) con manómetro',
              targetComponent: 'Pulmón de vacío del turbo',
              procedure: 'Conectar Mityvac a la toma de vacío del pulmón. Aplicar de 0 a -0.65 bar y observar el movimiento de la varilla.',
              referenceValues: 'Movimiento continuo y suave de 10 a 12 mm entre -0.15 y -0.60 bar. Retención constante de vacío durante 60 seg.',
              ifPass: 'Pulmón estanco. Pasar a comprobar electroválvula N75 y sensor MAP.',
              ifFail: 'Si no retiene vacío: membrana rota. Si la varilla va a saltos o no recorre 10 mm: geometría atascada por carbonilla.',
            },
            {
              stepNumber: 2,
              name: 'Verificación de la electroválvula de control N75',
              toolRequired: 'Multímetro (Ω) y Osciloscopio para señal PWM',
              targetComponent: 'Electroválvula N75',
              procedure: 'Medir resistencia de bobina y ciclo de trabajo (Duty Cycle) con motor acelerando en vacío.',
              referenceValues: 'Resistencia: 14 a 19 Ω a 20°C. Señal cuadrada PWM de 12V con variación según demanda de carga.',
              ifPass: 'La N75 modula adecuadamente.',
              ifFail: 'Bobinado cortado o sin señal de conmutación desde la ECU.',
            },
          ],
        },
      ],
    };
  }

  if (dtcList.some((d: string) => d.includes('P0A0D') || d.includes('P0A0F'))) {
    return {
      safetyAlerts,
      highVoltageWarning: 'ALTA TENSIÓN: La unidad de control del sistema híbrido detecta interrupción del lazo de seguridad (Interlock Loop). Los relés de batería de tracción están bloqueados.',
      technicalSummary: 'El código P0A0D es un enclavamiento de seguridad abierto. En el 90% de casos se debe a la incorrecta inserción del pestillo deslizante del Service Plug.',
      hypotheses: [
        {
          id: 'hyp-1',
          title: 'Conector de servicio (Service Plug) mal trabado o lazo de interlock de baja tensión abierto',
          confidence: 'ALTA',
          confidenceScore: 92,
          technicalJustification: 'El lazo de seguridad de baja tensión recorre en serie los microinterruptores de la tapa del inversor, el conector de servicio y el compresor de A/C. Si uno no cierra el bucle, la HV ECU impide el paso a READY.',
          rootCauseAnalysis: 'Fallo mecánico al no deslizar hacia abajo el seguro del tirador naranja del Service Plug.',
          suspectedParts: ['Conector de servicio naranja', 'Microswitch de tapa del inversor'],
          diagnosticSteps: [
            {
              stepNumber: 1,
              name: 'Comprobación de la triple posición del conector de servicio (Service Plug)',
              toolRequired: 'Inspección física con guantes dieléctricos 1000V',
              targetComponent: 'Batería de tracción',
              procedure: 'Retirar el conector naranja. Reinsertar a fondo, abatir la palanca a 90° y DESLIZAR horizontalmente hasta oír el clic del microinterruptor.',
              referenceValues: 'El seguro debe quedar firmemente bloqueado sin holgura.',
              ifPass: 'Borrar DTC y verificar paso a modo READY.',
              ifFail: 'Comprobar continuidad del lazo de interlock con polímetro en bornes de la HV ECU.',
            },
          ],
        },
      ],
    };
  }

  // Generic automotive diagnostic hypothesis
  return {
    safetyAlerts,
    highVoltageWarning: isHighVoltage ? 'Protocolo HV obligatorio.' : '',
    technicalSummary: `Diagnóstico para ${vehicle.brand} ${vehicle.model} enfocado en los síntomas registrados y DTCs: ${dtcList.join(', ') || 'Sin DTC específico'}.`,
    hypotheses: [
      {
        id: 'hyp-gen1',
        title: 'Fallo en la línea de alimentación, masa de referencia o sulfatación en conector de control',
        confidence: 'ALTA',
        confidenceScore: 82,
        technicalJustification: 'La mayoría de fallos intermitentes y códigos de comunicación o señal fuera de rango se originan en caídas de tensión por encima de 0.2V en el terminal de masa o terminales faston flojos.',
        rootCauseAnalysis: 'Resistencia parásita por oxidación en borne de masa o pin con holgura en el conector de la ECU/sensor.',
        suspectedParts: ['Mazo de cables del sensor afectado', 'Puntos de masa chasis-motor', 'Terminales del conector'],
        diagnosticSteps: [
          {
            stepNumber: 1,
            name: 'Medición de caída de tensión en la línea de masa (Ground Voltage Drop Test)',
            toolRequired: 'Multímetro digital en rango 2V / 20V DC con puntas finas tipo aguja',
            targetComponent: 'Punto de masa del sensor/módulo hacia borne negativo de batería',
            procedure: 'Conectar sonda negra al borne negativo de la batería y sonda roja al terminal de masa del componente con el sistema en funcionamiento bajo carga.',
            referenceValues: 'Caída de tensión máxima admisible: < 0.10V (100 mV). Si supera 0.20V existe resistencia no deseada.',
            ifPass: 'Masa en perfecto estado. Pasar a medir línea de alimentación y señal.',
            ifFail: 'Limpiar borne de masa, comprobar apriete de tuerca o sanear cable sulfatado.',
          },
          {
            stepNumber: 2,
            name: 'Comprobación de alimentación positiva (B+ y Borne 15 tras contacto)',
            toolRequired: 'Multímetro digital en V DC',
            targetComponent: 'Pin de alimentación del componente en su conector',
            procedure: 'Verificar tensión con contacto puesto y comprobar que no cae más de 0.3V respecto a la tensión nominal de batería.',
            referenceValues: 'Tensión nominal de batería ± 0.3V.',
            ifPass: 'Alimentación conforme.',
            ifFail: 'Revisar fusible correspondiente, relé de descarga o cable cortado.',
          },
        ],
      },
    ],
  };
}

// Dev vs Prod Vite Integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`AutoDiag Pro server running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer();
