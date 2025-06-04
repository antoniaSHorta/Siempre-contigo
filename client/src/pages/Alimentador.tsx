import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonButton, IonSegment, IonSegmentButton, IonLabel, IonItem, IonSelect, IonSelectOption, IonDatetime, IonModal } from '@ionic/react';
import { add, close } from 'ionicons/icons';
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import ToggleBar from '../components/ToggleBar';
import AlimentacionList from '../components/AlimentacionList';
import AlimentacionModal, { AlimentacionData } from '../components/AlimentacionModal';
import logo from '../assets/logo.png';
import './Alimentador.css';

type EstadoAlimentacion = 'pendiente' | 'completado' | 'cancelado';
type FilterValue = EstadoAlimentacion | 'todos';

interface Alimentacion {
  id: number;
  residente: string;
  tipo: string;
  fecha: string;
  hora: string;
  estado: EstadoAlimentacion;
  observaciones?: string;
}

const TIPOS_ALIMENTACION = ['Desayuno', 'Almuerzo', 'Cena', 'Merienda', 'Snack'];

// Datos de ejemplo - Esto debería venir de tu backend
const alimentacionesEjemplo: Alimentacion[] = [
  {
    id: 1,
    residente: 'María García',
    tipo: 'Desayuno',
    fecha: '2024-03-20',
    hora: '08:00',
    estado: 'pendiente',
    observaciones: 'Preferencia por café descafeinado'
  },
  {
    id: 2,
    residente: 'Juan Pérez',
    tipo: 'Almuerzo',
    fecha: '2024-03-20',
    hora: '13:00',
    estado: 'completado',
    observaciones: 'Dieta baja en sal'
  },
  {
    id: 3,
    residente: 'Ana Martínez',
    tipo: 'Cena',
    fecha: '2024-03-20',
    hora: '19:00',
    estado: 'cancelado',
    observaciones: 'No asistirá a la cena'
  }
];

const Alimentador: React.FC = () => {
  const [filter, setFilter] = useState<FilterValue>('todos');
  const [filterDate, setFilterDate] = useState<string | undefined>(undefined);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterResident, setFilterResident] = useState<string>('all');
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAlimentacion, setSelectedAlimentacion] = useState<Alimentacion | undefined>(undefined);
  const [alimentaciones, setAlimentaciones] = useState<Alimentacion[]>(alimentacionesEjemplo);

  const handleEdit = (id: number) => {
    const alimentacion = alimentaciones.find(a => a.id === id);
    if (alimentacion) {
      setSelectedAlimentacion(alimentacion);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    setAlimentaciones(alimentaciones.filter(a => a.id !== id));
  };

  const handleAdd = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = (alimentacionData: AlimentacionData) => {
    const newAlimentacion: Alimentacion = {
      ...alimentacionData,
      id: Math.max(...alimentaciones.map(a => a.id)) + 1,
      estado: 'pendiente'
    };
    setAlimentaciones([...alimentaciones, newAlimentacion]);
  };

  const handleSaveEdit = (alimentacionData: AlimentacionData) => {
    setAlimentaciones(alimentaciones.map(a => 
      a.id === selectedAlimentacion?.id ? { ...alimentacionData, id: a.id } : a
    ));
  };

  const clearDateFilter = () => {
    setFilterDate(undefined);
  };

  const filteredAlimentaciones = alimentaciones.filter(alimentacion => {
    const matchesFilter = filter === 'todos' || alimentacion.estado === filter;
    const matchesType = filterType === 'all' || alimentacion.tipo === filterType;
    const matchesResident = filterResident === 'all' || alimentacion.residente === filterResident;
    
    const dateMatch = filterDate ? 
      alimentacion.fecha === filterDate :
      true;

    return matchesFilter && matchesType && matchesResident && dateMatch;
  });

  return (
    <IonPage className="alimentador-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div className="header-content">
            <ToggleBar />
            <img src={logo} alt="Logo" className="header-logo" />
            <IonTitle>Alimentación</IonTitle>
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
          <IonSegmentButton value="completado">
            <IonLabel>Completados</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="cancelado">
            <IonLabel>Cancelados</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <IonButton expand="block" className="create-alimentacion-button" onClick={handleAdd}>
          <IonIcon icon={add} slot="start" />
          Crear Alimentación
        </IonButton>

        <div className="alimentador-filters">
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
              label="Tipo de Alimentación:"
              value={filterType}
              onIonChange={(e) => setFilterType(e.detail.value)}
              interface="popover"
            >
              <IonSelectOption value="all">Todos</IonSelectOption>
              {TIPOS_ALIMENTACION.map(tipo => (
                <IonSelectOption key={tipo} value={tipo}>
                  {tipo}
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
              {Array.from(new Set(alimentaciones.map(a => a.residente))).map(residente => (
                <IonSelectOption key={residente} value={residente}>
                  {residente}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </div>

        <AlimentacionList
          alimentaciones={filteredAlimentaciones}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <AlimentacionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSaveCreate}
          mode="create"
        />

        <AlimentacionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAlimentacion(undefined);
          }}
          onSave={handleSaveEdit}
          initialData={selectedAlimentacion}
          mode="edit"
        />
      </IonContent>
    </IonPage>
  );
};

export default Alimentador; 