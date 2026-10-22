# AutoDiag Pro - Plataforma Inteligente de Diagnóstico y Reparación Automotriz con IA

Plataforma técnica industrial diseñada para talleres mecánicos, electromecánicos y especialistas en diagnosis automotriz multimarca. Integra un motor de razonamiento técnico con inteligencia artificial (Google Gemini), protocolos guiados de comprobación paso a paso, interpretación de mediciones físicas (multímetro, osciloscopio, vacuómetro), visor interactivo de esquemas eléctricos y gestión integral de órdenes de trabajo.

---

## 1. Arquitectura del Sistema

- **Frontend**: React 19 con TypeScript, Vite, Tailwind CSS v4, Lucide Icons, tipografía monoespaciada para telemetría automotriz y maquetación de estilo industrial.
- **Backend**: Node.js + Express con integración `@google/genai` (modelo `gemini-3.8-flash`) en servidor seguro, sin exposición de claves en el cliente.
- **Motor de Diagnóstico Híbrido**:
  1. Motor de razonamiento asistido por IA para síntesis de averías complejas, cruce de códigos DTC y cálculo de grado de confianza.
  2. Motor de reglas de respaldo determinista basado en especificaciones SAE J2012, ISO 14229 (UDS) y normativas UNE-EN 50110.
- **Persistencia**: Sincronización en tiempo real con almacenamiento local (`localStorage`) y base de datos relacional extensible.

---

## 2. Módulos y Funcionalidades Principales

### 2.1. Ficha Técnica Completa del Vehículo
- Identificación exhaustiva: Marca, Modelo, Acabado/Versión, Año, Matrícula, Bastidor (VIN 17 caracteres), Código de motor, Cilindrada y Potencia, Kilometraje.
- Arquitectura electromecánica: Combustible (Diésel, Gasolina, Híbrido HEV, Enchufable PHEV, Eléctrico BEV, GLP), Transmisión (Manual, Convertidor, Doble embrague DSG/DCT, e-CVT), Tracción (FWD, RWD, AWD, 4x4).
- Tensión del sistema: 12V, 24V, 48V (Mild Hybrid), 400V y 800V de Alta Tensión con protocolos de seguridad obligatorios.
- Centralitas y ECUs instaladas: ECM (Motor), TCM (Caja), BCM (Carrocería), Gateway CAN, ABS/ESP, EPS, Inversor y BMS.

### 2.2. Registro Inteligente de Averías y Códigos DTC
- Captura de síntomas del cliente y del mecánico.
- Selector de testigos iluminados en cuadro (MIL, Precalentamiento, ABS, ESP, Avería Híbrido, Batería 12V, Airbag).
- Registro de códigos DTC estandarizados y específicos de fabricante (ej. P0299, P0A0D, U0100, P0300).
- Telemetría en freeze frame: temperatura de motor, voltaje de batería, RPM y condiciones dinámicas de aparición.
- Comprobaciones preliminares y antecedentes en otros talleres.

### 2.3. Asistente Técnico IA de Diagnosis (Mesa de Trabajo)
- Hipótesis diagnósticas ordenadas por evidencia y grado de confianza (ALTA, MEDIA, BAJA) con barra porcentual.
- Explicación física y electromecánica de la causa raíz (sin inventar pinouts ni pares de apriete).
- Pruebas secuenciales con indicación de herramienta requerida, procedimiento paso a paso, valores de referencia documentados y consecuencias Si Conforme / Si Falla.
- **Reevaluación en Tiempo Real**: El mecánico introduce el valor medido en polímetro u osciloscopio y el asistente recalcula la probabilidad de las hipótesis hasta confirmar la causa raíz.

### 2.4. Visor Interactivo de Esquemas Eléctricos
- Distinción visual obligatoria: **Esquema Documentado OEM** vs **Esquema Simplificado para Diagnóstico**.
- Nodos interactivos: Batería 12V, Fusibles, Relés, Sensores, Actuadores, ECU y Masas de chasis.
- **Sonda Multímetro Virtual**: Al hacer clic sobre cualquier pin o componente, muestra la tensión esperada, tipo de señal (PWM, Analógica, CAN-H, B+, Masa 31) y detecta tramos dañados o en cortocircuito.

### 2.5. Árboles de Decisión Guiados
- Flujos de diagnóstico paso a paso para averías electromecánicas críticas:
  - Red CAN Bus en cortocircuito o línea abierta (U0100).
  - Caídas de tensión en masa y circuito de carga (P0562 / masa flotante).
  - Pérdida de sobrealimentación y pulmón de turbo (P0299).
  - Interlock de seguridad de Alta Tensión (P0A0D).

### 2.6. Base de Conocimiento de Averías Verificadas
- Catálogo de boletines técnicos oficiales (TSB) y casos resueltos por talleres asociados.
- Filtros por fabricante, código de motor, sistema y código DTC.
- Documentación de soluciones aplicadas, recambios y tiempos de mano de obra.

### 2.7. Gestión del Taller y Órdenes de Trabajo (O.T.)
- Tablero Kanban por estados: Pendiente, En diagnóstico, Esperando piezas, En reparación, Reparado y Entregado.
- Desglose de horas de mano de obra, recambios con referencia OEM y presupuesto total automático.
- Directorio de clientes con vinculación de flotas.
- **Certificado Técnico Oficial de Reparación**: Imprimible y exportable en PDF con checklist de control de calidad, borrado de DTCs y firma del técnico.

---

## 3. Requisitos e Instalación

### Requisitos previos:
- Node.js versión 18 o superior.
- Gestor de paquetes npm.

### Pasos de instalación:
```bash
# 1. Clonar el repositorio o abrir en AI Studio
cd /app/applet

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional)
cp .env.example .env
# Añadir la clave de Gemini en GEMINI_API_KEY si se dispone de una personal.
# (La aplicación incluye motor determinista de respaldo en caso de no disponer de clave).

# 4. Iniciar en entorno de desarrollo (servidor Express + Vite en puerto 3000)
npm run dev
```

---

## 4. Estructura de Carpetas

```
├── index.html                   # Entry point HTML con metadatos y fuentes JetBrains Mono
├── package.json                 # Dependencias y scripts de ejecución
├── server.ts                    # Backend Express y proxy seguro para Gemini AI
├── src/
│   ├── App.tsx                  # Componente raíz y orquestador de estado
│   ├── main.tsx                 # Montaje de React 19
│   ├── index.css                # Estilos Tailwind CSS y reglas de impresión
│   ├── types/
│   │   └── index.ts             # Modelos de datos TypeScript
│   ├── data/
│   │   └── mockData.ts          # Casos demostrativos reales (VAG, Toyota, BMW, Ford)
│   ├── services/
│   │   ├── api.ts               # Cliente API HTTP
│   │   └── storage.ts           # Persistencia en localStorage
│   └── components/
│       ├── common/              # Sidebar, Header y SafetyBanner
│       ├── dashboard/           # Panel de control e indicadores
│       ├── diagnosis/           # Mesa de trabajo de diagnosis IA
│       ├── vehicles/            # Catálogo y formulario técnico de vehículos
│       ├── faults/              # Registro de averías y lista
│       ├── work-orders/         # Tablero Kanban y órdenes de trabajo
│       ├── clients/             # Directorio de clientes
│       ├── schematics/          # Visor y sonda de esquemas eléctricos
│       ├── decision-tree/       # Árboles de decisión interactivos
│       ├── knowledge-base/      # Base de reparaciones verificadas
│       └── reports/             # Certificado técnico oficial imprimible
```
