import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonButton, IonSegment, IonSegmentButton, IonLabel, IonItem, IonSelect, IonSelectOption, IonDatetime, IonModal } from '@ionic/react';
import { add, close } from 'ionicons/icons';
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import ToggleBar from '../components/ToggleBar';
import MedicacionList from '../components/MedicacionList';
import MedicacionModal, { MedicacionData } from '../components/MedicacionModal';
import logo from '../assets/logo.png';
import './Medicacion.css';

type EstadoMedicacion = 'pendiente' | 'administrada' | 'omitida' | 'retrasada';
type FilterValue = 'todos' | EstadoMedicacion;

interface Medicacion {
  id: number;
  nombre: string;
  dosis: string;
  fecha_hora: string;
  estado: EstadoMedicacion;
  residente: string;
  observaciones?: string;
}

const medicacionesEjemplo: Medicacion[] = [
  {
    id: 1,
    nombre: 'Paracetamol',
    dosis: '500mg',
    fecha_hora: '2024-03-20 08:00:00',
    estado: 'pendiente',
    residente: 'María García',
    observaciones: 'Tomar con agua'
  },
  {
    id: 2,
    nombre: 'Ibuprofeno',
    dosis: '400mg',
    fecha_hora: '2024-03-20 14:00:00',
    estado: 'administrada',
    residente: 'Juan Pérez',
    observaciones: 'Tomar después de comer'
  },
  {
    id: 3,
    nombre: 'Omeprazol',
    dosis: '20mg',
    fecha_hora: '2024-03-20 20:00:00',
    estado: 'omitida',
    residente: 'Ana Martínez',
    observaciones: 'No se administró por malestar'
  }
];

const Medicacion: React.FC = () => {
  const [filter, setFilter] = useState<FilterValue>('todos');
  const [filterDate, setFilterDate] = useState<string | undefined>(undefined);
  const [filterMedicamento, setFilterMedicamento] = useState<string>('all');
  const [filterResident, setFilterResident] = useState<string>('all');
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedicacion, setSelectedMedicacion] = useState<Medicacion | undefined>(undefined);
  const [medicaciones, setMedicaciones] = useState<Medicacion[]>(medicacionesEjemplo);

  const handleEdit = (id: number) => {
    const medicacion = medicaciones.find(m => m.id === id);
    if (medicacion) {
      setSelectedMedicacion(medicacion);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    setMedicaciones(medicaciones.filter(m => m.id !== id));
  };

  const handleAdd = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = (medicacionData: MedicacionData) => {
    const newMedicacion: Medicacion = {
      ...medicacionData,
      id: Math.max(...medicaciones.map(m => m.id)) + 1,
      estado: 'pendiente'
    };
    setMedicaciones([...medicaciones, newMedicacion]);
  };

  const handleSaveEdit = (medicacionData: MedicacionData) => {
    setMedicaciones(medicaciones.map(m => 
      m.id === selectedMedicacion?.id ? { ...medicacionData, id: m.id } : m
    ));
  };

  const clearDateFilter = () => {
    setFilterDate(undefined);
  };

  const filteredMedicaciones = medicaciones.filter(medicacion => {
    const matchesFilter = filter === 'todos' || medicacion.estado === filter;
    const matchesMedicamento = filterMedicamento === 'all' || medicacion.nombre === filterMedicamento;
    const matchesResident = filterResident === 'all' || medicacion.residente === filterResident;
    
    const dateMatch = filterDate ? 
      medicacion.fecha_hora === filterDate :
      true;

    return matchesFilter && matchesMedicamento && matchesResident && dateMatch;
  });

  return (
    <IonPage className="medicacion-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div className="header-content">
            <ToggleBar />
            <img src={logo} alt="Logo" className="header-logo" />
            <IonTitle>Medicación</IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonSegment value={filter} onIonChange={e => setFilter(e.detail.value as FilterValue)}>
          <IonSegmentButton value="todos">
            <IonLabel>Todos</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="pendiente">
            <IonLabel>Pendientes</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="administrada">
            <IonLabel>Administrados</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="omitida">
            <IonLabel>Omitidos</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <IonButton expand="block" className="create-medicacion-button" onClick={handleAdd}>
          <IonIcon icon={add} slot="start" />
          Crear Medicación
        </IonButton>

        <div className="medicacion-filters">
          <IonItem>
            <IonLabel position="stacked">Fecha:</IonLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
              <div
                className="date-filter-display"
                onClick={() => setIsDateModalOpen(true)}
              >
                {filterDate ? format(parseISO(filterDate), 'dd MMM yyyy', { locale: es }) : 'Seleccionar fecha'}
              </div>
              {filterDate && (
                <IonButton 
                  fill="clear" 
                  size="small" 
                  onClick={clearDateFilter}
                  style={{ minHeight: 'auto', minWidth: 'auto', padding: '4px' }}
                >
                  <IonIcon icon={close} style={{ fontSize: '16px' }} />
                </IonButton>
              )}
            </div>
            <IonModal isOpen={isDateModalOpen} onDidDismiss={() => setIsDateModalOpen(false)} keepContentsMounted={true} className="date-picker-modal">
              <IonDatetime
                id="filter-date-datetime"
                presentation="date"
                onIonChange={e => setFilterDate(e.detail.value ? format(parseISO(e.detail.value as string), 'yyyy-MM-dd') : undefined)}
              ></IonDatetime>
            </IonModal>
          </IonItem>

          <IonItem>
            <IonSelect
              label="Medicamento:"
              value={filterMedicamento}
              onIonChange={(e) => setFilterMedicamento(e.detail.value)}
              interface="popover"
            >
              <IonSelectOption value="all">Todos</IonSelectOption>
              {Array.from(new Set(medicaciones.map(m => m.nombre))).map(nombre => (
                <IonSelectOption key={nombre} value={nombre}>
                  {nombre}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonSelect
              label="Residente:"
              value={filterResident}
              onIonChange={(e) => setFilterResident(e.detail.value)}
              interface="popover"
            >
              <IonSelectOption value="all">Todos</IonSelectOption>
              {Array.from(new Set(medicaciones.map(m => m.residente))).map(residente => (
                <IonSelectOption key={residente} value={residente}>
                  {residente}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </div>

        <MedicacionList
          medicaciones={filteredMedicaciones}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <MedicacionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSaveCreate}
          mode="create"
        />

        <MedicacionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedMedicacion(undefined);
          }}
          onSave={handleSaveEdit}
          initialData={selectedMedicacion}
          mode="edit"
        />
      </IonContent>
    </IonPage>
  );
};

export default Medicacion; 