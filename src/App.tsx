/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Client,
  Vehicle,
  WorkOrder,
  FaultRecord,
  KnowledgeCase,
  ElectricalSchematic,
  AIDiagnosisSession,
  WorkOrderStatus,
} from './types';
import { workshopStorage } from './services/storage';

import { MessageSquare, Sparkles } from 'lucide-react';

// Common Components
import { Sidebar, NavTab } from './components/common/Sidebar';
import { Header } from './components/common/Header';

// Feature Views
import { DashboardView } from './components/dashboard/DashboardView';
import { DiagnosisWorkbench } from './components/diagnosis/DiagnosisWorkbench';
import { VehicleManagementView } from './components/vehicles/VehicleManagementView';
import { VehicleModal } from './components/vehicles/VehicleModal';
import { FaultRegistrationModal } from './components/faults/FaultRegistrationModal';
import { FaultsListView } from './components/faults/FaultsListView';
import { ClientsView } from './components/clients/ClientsView';
import { ClientModal } from './components/clients/ClientModal';
import { WorkOrdersView } from './components/work-orders/WorkOrdersView';
import { WorkOrderModal } from './components/work-orders/WorkOrderModal';
import { SchematicViewer } from './components/schematics/SchematicViewer';
import { DecisionTreeViewer } from './components/decision-tree/DecisionTreeViewer';
import { KnowledgeBaseView } from './components/knowledge-base/KnowledgeBaseView';
import { RepairReportView } from './components/reports/RepairReportView';

export default function App() {
  // Global persisted data
  const [clients, setClients] = useState<Client[]>(() => workshopStorage.getClients());
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => workshopStorage.getVehicles());
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => workshopStorage.getWorkOrders());
  const [faults, setFaults] = useState<FaultRecord[]>(() => workshopStorage.getFaultRecords());
  const [knowledgeCases, setKnowledgeCases] = useState<KnowledgeCase[]>(() => workshopStorage.getKnowledgeCases());
  const [schematics, setSchematics] = useState<ElectricalSchematic[]>(() => workshopStorage.getSchematics());
  const [sessions, setSessions] = useState<AIDiagnosisSession[]>(() => workshopStorage.getSessions());

  // Active navigation & selections
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVehicleId, setActiveVehicleId] = useState<string>(() => vehicles[0]?.id || '');
  const [activeFaultId, setActiveFaultId] = useState<string>(() => faults[0]?.id || '');

  // Modals state
  const [isFaultModalOpen, setIsFaultModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<WorkOrder | null>(null);

  // Sync with localStorage
  useEffect(() => {
    workshopStorage.saveClients(clients);
  }, [clients]);

  useEffect(() => {
    workshopStorage.saveVehicles(vehicles);
  }, [vehicles]);

  useEffect(() => {
    workshopStorage.saveWorkOrders(workOrders);
  }, [workOrders]);

  useEffect(() => {
    workshopStorage.saveFaultRecords(faults);
  }, [faults]);

  useEffect(() => {
    workshopStorage.saveKnowledgeCases(knowledgeCases);
  }, [knowledgeCases]);

  useEffect(() => {
    workshopStorage.saveSessions(sessions);
  }, [sessions]);

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];
  const activeFault = faults.find((f) => f.id === activeFaultId) || faults[0];
  const activeSession = sessions.find((s) => s.faultRecordId === activeFault?.id);

  // Handlers
  const handleSelectVehicle = (vehicle: Vehicle) => {
    setActiveVehicleId(vehicle.id);
    const relatedFault = faults.find((f) => f.vehicleId === vehicle.id);
    if (relatedFault) {
      setActiveFaultId(relatedFault.id);
    }
  };

  const handleSelectFaultForDiagnosis = (fault: FaultRecord) => {
    setActiveFaultId(fault.id);
    setActiveVehicleId(fault.vehicleId);
    setCurrentTab('diagnosis');
  };

  const handleSaveVehicle = (vehicle: Vehicle) => {
    if (vehicleToEdit) {
      setVehicles(vehicles.map((v) => (v.id === vehicle.id ? vehicle : v)));
    } else {
      setVehicles([vehicle, ...vehicles]);
      setActiveVehicleId(vehicle.id);
    }
    setVehicleToEdit(null);
  };

  const handleDeleteVehicle = (id: string) => {
    if (confirm('¿Está seguro de eliminar este vehículo y sus datos técnicos?')) {
      setVehicles(vehicles.filter((v) => v.id !== id));
    }
  };

  const handleSaveClient = (client: Client) => {
    if (clientToEdit) {
      setClients(clients.map((c) => (c.id === client.id ? client : c)));
    } else {
      setClients([client, ...clients]);
    }
    setClientToEdit(null);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('¿Eliminar este cliente?')) {
      setClients(clients.filter((c) => c.id !== id));
    }
  };

  const handleSaveFault = (newFault: FaultRecord) => {
    setFaults([newFault, ...faults]);
    setActiveFaultId(newFault.id);
    setActiveVehicleId(newFault.vehicleId);
    setCurrentTab('diagnosis');
  };

  const handleDeleteFault = (id: string) => {
    if (confirm('¿Eliminar esta avería?')) {
      setFaults(faults.filter((f) => f.id !== id));
    }
  };

  const handleSaveWorkOrder = (order: WorkOrder) => {
    if (orderToEdit) {
      setWorkOrders(workOrders.map((o) => (o.id === order.id ? order : o)));
    } else {
      setWorkOrders([order, ...workOrders]);
    }
    setOrderToEdit(null);
  };

  const handleDeleteWorkOrder = (id: string) => {
    if (confirm('¿Eliminar esta Orden de Trabajo?')) {
      setWorkOrders(workOrders.filter((o) => o.id !== id));
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: WorkOrderStatus) => {
    setWorkOrders(
      workOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o))
    );
  };

  const handleUpdateSession = (updatedSession: AIDiagnosisSession) => {
    const existing = sessions.find((s) => s.id === updatedSession.id);
    if (existing) {
      setSessions(sessions.map((s) => (s.id === updatedSession.id ? updatedSession : s)));
    } else {
      setSessions([updatedSession, ...sessions]);
    }
  };

  const handleLoadFullDemoData = () => {
    workshopStorage.loadFullDemoData();
    const loadedClients = workshopStorage.getClients();
    const loadedVehicles = workshopStorage.getVehicles();
    const loadedOrders = workshopStorage.getWorkOrders();
    const loadedFaults = workshopStorage.getFaultRecords();
    const loadedCases = workshopStorage.getKnowledgeCases();
    const loadedSchematics = workshopStorage.getSchematics();
    const loadedSessions = workshopStorage.getSessions();

    setClients(loadedClients);
    setVehicles(loadedVehicles);
    setWorkOrders(loadedOrders);
    setFaults(loadedFaults);
    setKnowledgeCases(loadedCases);
    setSchematics(loadedSchematics);
    setSessions(loadedSessions);

    if (loadedVehicles.length > 0) setActiveVehicleId(loadedVehicles[0].id);
    if (loadedFaults.length > 0) setActiveFaultId(loadedFaults[0].id);
  };

  const handleClearAllData = () => {
    if (confirm('¿Vaciar todos los registros del taller para empezar en blanco? Podrá recargar los datos de prueba en cualquier momento.')) {
      workshopStorage.clearAllData();
      setClients([]);
      setVehicles([]);
      setWorkOrders([]);
      setFaults([]);
      setSessions([]);
      setActiveVehicleId('');
      setActiveFaultId('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans flex flex-col relative">
      {/* Top Header matching reference image layout and colors */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeVehicle={activeVehicle}
        totalVehicles={vehicles.length}
        totalFaults={faults.length}
        onOpenNewFaultModal={() => setIsFaultModalOpen(true)}
        onOpenNewVehicleModal={() => {
          setVehicleToEdit(null);
          setIsVehicleModalOpen(true);
        }}
        onOpenNewOrderModal={() => {
          setOrderToEdit(null);
          setIsOrderModalOpen(true);
        }}
        onLoadFullDemoData={handleLoadFullDemoData}
        onClearAllData={handleClearAllData}
      />

      {/* Main Content Area in Light Gray Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              vehicles={vehicles}
              faults={faults}
              workOrders={workOrders}
              clients={clients}
              onSelectVehicle={handleSelectVehicle}
              onSelectFaultForDiagnosis={handleSelectFaultForDiagnosis}
              onNavigateTab={setCurrentTab}
              onOpenNewFaultModal={() => setIsFaultModalOpen(true)}
              onLoadFullDemoData={handleLoadFullDemoData}
            />
          )}

          {currentTab === 'diagnosis' && (
            <DiagnosisWorkbench
              vehicle={activeVehicle}
              faultRecord={activeFault}
              session={activeSession}
              allFaults={faults}
              allVehicles={vehicles}
              onSelectFault={(f) => {
                setActiveFaultId(f.id);
                setActiveVehicleId(f.vehicleId);
              }}
              onUpdateSession={handleUpdateSession}
              onOpenReportModal={() => setCurrentTab('reports')}
              onOpenSchematic={() => setCurrentTab('schematics')}
            />
          )}

          {currentTab === 'vehicles' && (
            <VehicleManagementView
              vehicles={vehicles}
              clients={clients}
              faults={faults}
              workOrders={workOrders}
              onOpenCreateVehicleModal={() => {
                setVehicleToEdit(null);
                setIsVehicleModalOpen(true);
              }}
              onEditVehicle={(v) => {
                setVehicleToEdit(v);
                setIsVehicleModalOpen(true);
              }}
              onDeleteVehicle={handleDeleteVehicle}
              onSelectVehicleForDiagnosis={(v) => {
                handleSelectVehicle(v);
                setCurrentTab('diagnosis');
              }}
              onNewOrderForVehicle={(v) => {
                setActiveVehicleId(v.id);
                setOrderToEdit(null);
                setIsOrderModalOpen(true);
              }}
            />
          )}

          {currentTab === 'faults' && (
            <FaultsListView
              faults={faults}
              vehicles={vehicles}
              onOpenNewFaultModal={() => setIsFaultModalOpen(true)}
              onSelectFaultForDiagnosis={handleSelectFaultForDiagnosis}
              onDeleteFault={handleDeleteFault}
            />
          )}

          {currentTab === 'work_orders' && (
            <WorkOrdersView
              workOrders={workOrders}
              vehicles={vehicles}
              clients={clients}
              faults={faults}
              onOpenCreateOrderModal={() => {
                setOrderToEdit(null);
                setIsOrderModalOpen(true);
              }}
              onEditOrder={(order) => {
                setOrderToEdit(order);
                setIsOrderModalOpen(true);
              }}
              onDeleteOrder={handleDeleteWorkOrder}
              onUpdateStatus={handleUpdateOrderStatus}
              onSelectFaultForDiagnosis={handleSelectFaultForDiagnosis}
            />
          )}

          {currentTab === 'clients' && (
            <ClientsView
              clients={clients}
              vehicles={vehicles}
              onOpenCreateClientModal={() => {
                setClientToEdit(null);
                setIsClientModalOpen(true);
              }}
              onEditClient={(c) => {
                setClientToEdit(c);
                setIsClientModalOpen(true);
              }}
              onDeleteClient={handleDeleteClient}
              onSelectVehicle={(v) => {
                handleSelectVehicle(v);
                setCurrentTab('vehicles');
              }}
            />
          )}

          {currentTab === 'schematics' && (
            <SchematicViewer schematics={schematics} />
          )}

          {currentTab === 'decision_trees' && <DecisionTreeViewer />}

          {currentTab === 'knowledge_base' && (
            <KnowledgeBaseView
              cases={knowledgeCases}
              onAddCase={(newCase) => setKnowledgeCases([newCase, ...knowledgeCases])}
            />
          )}

          {currentTab === 'reports' && (
            <RepairReportView
              vehicle={activeVehicle}
              faultRecord={activeFault}
              session={activeSession}
              allVehicles={vehicles}
              allWorkOrders={workOrders}
              allFaults={faults}
              allClients={clients}
            />
          )}
        </main>

      {/* Floating Action Button (Exact match of bottom right red button in reference) */}
      <button
        onClick={() => {
          if (faults.length > 0) {
            handleSelectFaultForDiagnosis(faults[0]);
          } else {
            setIsFaultModalOpen(true);
          }
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 hover:bg-red-500 rounded-full shadow-2xl shadow-red-600/40 flex items-center justify-center text-white cursor-pointer z-40 transition-transform hover:scale-110 active:scale-95"
        title="Abrir Asistente Técnico IA / Nueva Avería"
      >
        <MessageSquare className="w-6 h-6 fill-white" />
      </button>

      {/* Global Modals */}
      <FaultRegistrationModal
        isOpen={isFaultModalOpen}
        onClose={() => setIsFaultModalOpen(false)}
        vehicles={vehicles}
        defaultVehicleId={activeVehicleId}
        onSaveFault={handleSaveFault}
      />

      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => {
          setIsVehicleModalOpen(false);
          setVehicleToEdit(null);
        }}
        clients={clients}
        initialVehicle={vehicleToEdit}
        onSave={handleSaveVehicle}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setClientToEdit(null);
        }}
        initialClient={clientToEdit}
        onSave={handleSaveClient}
      />

      <WorkOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setOrderToEdit(null);
        }}
        vehicles={vehicles}
        clients={clients}
        initialOrder={orderToEdit}
        defaultVehicleId={activeVehicleId}
        onSave={handleSaveWorkOrder}
      />
    </div>
  );
}
