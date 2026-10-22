/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FuelType = 'gasoline' | 'diesel' | 'hybrid' | 'phev' | 'electric' | 'lpg' | 'cng';

export type TransmissionType = 'manual' | 'automatic' | 'dual_clutch' | 'cvt';

export type DriveType = 'FWD' | 'RWD' | 'AWD' | '4WD';

export type SystemVoltageType = '12V' | '24V' | '48V_mild_hybrid' | '400V_high_voltage' | '800V_high_voltage';

export type WorkOrderStatus =
  | 'pending'
  | 'in_diagnosis'
  | 'waiting_parts'
  | 'in_repair'
  | 'repaired'
  | 'delivered';

export type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent';

export type FaultSeverity = 'low' | 'medium' | 'high' | 'critical';

export type FaultCategory =
  | 'electrical'
  | 'electronic'
  | 'electromechanical'
  | 'engine'
  | 'transmission'
  | 'high_voltage'
  | 'can_network'
  | 'sensors_actuators';

export type FaultFrequency = 'permanent' | 'intermittent' | 'sporadic';

export interface Client {
  id: string;
  fullName: string;
  dniCif: string;
  phone: string;
  email: string;
  address: string;
  companyName?: string;
  notes?: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  clientId: string;
  brand: string;
  model: string;
  versionTrim: string;
  year: number;
  registrationDate: string;
  licensePlate: string;
  vin: string;
  engineCode: string;
  displacement: string;
  powerHp: number;
  mileage: number;
  transmission: TransmissionType;
  driveType: DriveType;
  fuelType: FuelType;
  systemVoltage: SystemVoltageType;
  injectionType: string;
  installedECUs: string[];
  electronicEquipment: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DTCItem {
  code: string;
  ecu: string;
  status: 'permanent' | 'intermittent' | 'pending' | 'history';
  description?: string;
}

export interface FaultRecord {
  id: string;
  workOrderId?: string;
  vehicleId: string;
  title: string;
  observedSymptoms: string[];
  dashboardWarnings: string[];
  dtcCodes: DTCItem[];
  frequency: FaultFrequency;
  category: FaultCategory;
  severity: FaultSeverity;
  conditions: {
    engineTemp?: string;
    batteryVoltage?: number;
    rpmOrSpeed?: string;
    weatherOrEnv?: string;
    drivingCondition?: string;
  };
  priorRepairs?: string;
  preliminaryChecks?: string;
  hasHighVoltageRisk: boolean;
  hasSafetyRisk: boolean; // Airbags, braking, steering
  imageAttachments?: string[];
  status: 'open' | 'diagnosing' | 'confirmed' | 'resolved';
  createdAt: string;
  updatedAt?: string;
}

export interface DiagnosticStep {
  stepNumber: number;
  name: string;
  toolRequired: string;
  targetComponent: string;
  procedure: string;
  referenceValues: string;
  ifPass: string;
  ifFail: string;
}

export interface DiagnosticHypothesis {
  id: string;
  title: string;
  confidence: 'ALTA' | 'MEDIA' | 'BAJA';
  confidenceScore: number;
  technicalJustification: string;
  rootCauseAnalysis: string;
  diagnosticSteps: DiagnosticStep[];
  suspectedParts: string[];
  safetyWarnings?: string[];
}

export interface TechnicianMeasurement {
  id: string;
  timestamp: string;
  stepNumber: number;
  testName: string;
  measuredValue: string;
  isWithinSpec: boolean;
  notes: string;
}

export interface AIDiagnosisSession {
  id: string;
  faultRecordId: string;
  vehicleId: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'refined' | 'finalized';
  highVoltageWarning?: string;
  safetyAlerts: string[];
  hypotheses: DiagnosticHypothesis[];
  submittedMeasurements: TechnicianMeasurement[];
  aiEvolutionNotes?: string;
  confirmedCause?: string;
  finalReport?: TechnicalRepairReport;
}

export interface TechnicalRepairReport {
  reportDate: string;
  vehicleId: string;
  workOrderId: string;
  faultSummary: string;
  confirmedCause: string;
  appliedSolution: string;
  replacedParts: Array<{ reference: string; name: string; quantity: number }>;
  measurementsMade: Array<{ parameter: string; valueFound: string; standardSpec: string }>;
  postRepairVerifications: string[];
  safetyProtocolsFollowed: string[];
  technicianSignature: string;
  notesForCustomer: string;
}

export interface WorkOrderPart {
  id: string;
  reference: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface WorkOrder {
  id: string;
  number: string; // e.g. OT-2026-001
  clientId: string;
  vehicleId: string;
  entryDate: string;
  estimatedDeliveryDate?: string;
  status: WorkOrderStatus;
  priority: PriorityLevel;
  customerStatedIssue: string;
  assignedTechnician: string;
  laborHours: number;
  laborRatePerHour: number;
  parts: WorkOrderPart[];
  totalEstimate: number;
  faultRecordIds: string[];
  diagnosisSessionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeCase {
  id: string;
  brand: string;
  model: string;
  generation: string;
  yearRange: string;
  engineCode: string;
  affectedSystem: string;
  dtcCodes: string[];
  symptoms: string[];
  confirmedCause: string;
  diagnosticMethod: string;
  appliedSolution: string;
  replacedParts: string[];
  laborTimeHours: number;
  sourceType: 'verified_workshop' | 'official_tsb' | 'community_contributed';
  verifiedCount: number;
  author: string;
  createdAt: string;
}

export interface SchematicComponent {
  id: string;
  label: string;
  type: 'battery' | 'fuse' | 'relay' | 'ecu' | 'sensor' | 'actuator' | 'ground' | 'switch' | 'connector';
  code: string; // e.g. F23, K4, B34, J519
  pins: Array<{
    pinNumber: string;
    pinName: string;
    wireColor: string; // e.g. 'RT/SW' (Rojo/Negro)
    expectedVoltage?: string;
    signalType?: 'power' | 'ground' | 'can_high' | 'can_low' | 'pwm' | 'analog' | 'lin';
  }>;
  x: number;
  y: number;
}

export interface SchematicWire {
  id: string;
  fromComponentId: string;
  fromPin: string;
  toComponentId: string;
  toPin: string;
  wireColor: string;
  wireGauge?: string; // e.g. 0.75 mm²
  isFaulty?: boolean;
  faultReason?: string; // 'Corto a positivo', 'Circuito abierto', 'Caída de tensión 2.8V', etc.
}

export interface ElectricalSchematic {
  id: string;
  title: string;
  systemName: string;
  isOemVerified: boolean;
  vehicleBrand: string;
  vehicleModel: string;
  engineCode: string;
  description: string;
  components: SchematicComponent[];
  wires: SchematicWire[];
}
