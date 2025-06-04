import { IonButton, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast, IonSpinner } from '@ionic/react';
import Header from '../components/Header';
import FechaWrapper from '../components/FechaWrapper';
import { MedicacionInterface } from '../types/medicamento';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MedicamentoCard from '../components/MedicamentoCard';
import './Medicamentos.css';
import { addCircle, body, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173/api';

interface residentInterface{
    id: number,
    nombre: string
}

const Medicamentos: React.FC = () => {
    const [fechaActual, setFechaActual] = useState(new Date());
    const [listaMedicamento, setListaMedicamento] = useState<MedicacionInterface[]>([]);
    const [residents, setResidents] = useState<Array<residentInterface>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [presentAlert] = useIonAlert();
    const [presentToast] = useIonToast();
    const { user } = useAuth();

    const ejemploMedicacionDummy: MedicacionInterface = {
        id: 1,
        nombre: 'Paracetamol',
        dosis: '500mg',
        horario: '13:00',
        fecha_hora: new Date(new Date().setHours(13, 0, 0, 0)),
        estado: 'Pendiente',
        residente_id: 1,
        cuidador_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const formattedDateForApi = useMemo(() => {
        return fechaActual.toISOString().split('T')[0];
    }, [fechaActual]);

    useEffect(() => {
        const fetchResidents = async () => {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              console.error('No hay sesión activa');
              return;
            }
    
            const response = await fetch('/api/residents/', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
    
            if (!response.ok) {
              throw new Error('Error al cargar los residentes');
            }
    
            const data = await response.json();
            setResidents(data.data);
          } catch (error) {
            console.error('Error fetching residents:', error);
          }
        };
    
        fetchResidents();
    }, []);

    // Función para cargar las Medicamentoes
    const fetchMedicaciones = useCallback(async () => {
        if (!user?.id) {
            setError('Usuario no autorizado.');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/Medicamento/byFecha/${formattedDateForApi}`,{
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            const data: MedicacionInterface[] = response.data.data;

            setListaMedicamento(data);
            } catch (err: any) {
                presentToast(
                    {
                        message: `Error al cargar los datos, se presentan datos dummy`,
                        duration: 1500,
                        color: 'danger',
                        position: 'top',
                    }
                )
                setListaMedicamento([ejemploMedicacionDummy]);
            } finally {
            setIsLoading(false);
        }
    }, [formattedDateForApi, user?.id]);

    useEffect(() => {
        fetchMedicaciones();
    }, [fetchMedicaciones]);


    // --- CRUD Operations Handlers ---

    const handleAdministrarClick = (entry: MedicacionInterface) => {
        presentAlert({
            header: 'Confirmar Acción',
            cssClass: '.Medicamento-action-sheet-custom',
            message: `¿El residente ha ingerido "${entry.nombre}: ${entry.dosis}"?`,
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => {
                        console.log('ñamt');
                    },
                },
                {
                    text: 'Confirmar',
                    handler: async () => {
                        // TODO: Implementar notificacion
                        console.log(`ñam`);
                        presentToast({
                            message: `Se marcó como administrado: ${entry.nombre} - ${entry.dosis}, notificación enviada`,
                            duration: 1500,
                            color: 'success',
                            position: 'top',
                        });
                    },
                },
            ],
        });
    };

    // Funcion para editar la entrada de alimentación seleccionada
    const handleEditClick = (entry: MedicacionInterface) => {
        const dateToUse = entry.fecha_hora ? new Date(entry.fecha_hora) : new Date();

        const currentHour = String(dateToUse.getHours()).padStart(2, '0');
        const currentMinute = String(dateToUse.getMinutes()).padStart(2, '0');
        const formattedTime = `${currentHour}:${currentMinute}`;

        presentAlert({
            header: 'Editar Entrada de Medicación',
            cssClass: '.medicacion-action-sheet-custom',
            inputs: [
                {
                name: 'nombre',
                type: 'text',
                placeholder: 'Nombre del medicamento',
                value: entry.nombre,
                attributes: { required: true },
                },
                {
                name: 'dosis',
                type: 'text',
                placeholder: 'Dosis (Ej: 500mg)',
                value: entry.dosis,
                attributes: { required: true },
                },
                {
                name: 'horario',
                type: 'time',
                value: entry.horario,
                attributes: { required: true },
                },
            ],
            buttons: [
                {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => console.log('Edición cancelada.'),
                },
                {
                text: 'Guardar',
                handler: async (data: { nombre: string; dosis: string; horario: string }) => {
                    if (!data.nombre || !data.dosis || !data.horario) {
                    presentToast({
                        message: 'Todos los campos son obligatorios.',
                        duration: 2000,
                        color: 'danger',
                        position: 'top',
                    });
                    return false;
                    }

                    const [newHour, newMinute] = data.horario.split(':').map(Number);
                    const originalDate = entry.fecha_hora ? new Date(entry.fecha_hora) : new Date();
                    const newFechaHora = new Date(
                    originalDate.getFullYear(),
                    originalDate.getMonth(),
                    originalDate.getDate(),
                    newHour,
                    newMinute,
                    0
                    ).toISOString();

                    try {
                    const token = localStorage.getItem('token');
                    await axios.put(
                        `${API_BASE_URL}/medicacion/${entry.id}`,
                        {
                        nombre: data.nombre,
                        dosis: data.dosis,
                        horario: data.horario,
                        fecha_hora: newFechaHora,
                        residente_id: entry.residente_id,
                        cuidador_id: entry.cuidador_id,
                        estado: entry.estado || 'Pendiente',
                        },
                        {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        }
                    );
                    presentToast({
                        message: 'Entrada de medicación actualizada con éxito.',
                        duration: 1500,
                        color: 'success',
                        position: 'top',
                    });
                    fetchMedicaciones();
                    } catch (err: any) {
                    console.error('Error updating medicación:', err);
                    presentToast({
                        message: `Error al actualizar: ${err.response?.data?.message || err.message}`,
                        duration: 2000,
                        color: 'danger',
                        position: 'top',
                    });
                    }
                },
                },
            ],
            });

        }
    // Funcion para eliminar una entrada
    const handleDeleteClick = (id: number) => {
        presentAlert({
            header: 'Confirmar Eliminación',
            cssClass: '.Medicamento-action-sheet-custom',
            message: '¿Estás seguro de que quieres eliminar esta entrada?',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => console.log('Eliminación cancelada'),
                },
                {
                    text: 'Eliminar',
                    role: 'destructive',
                    handler: async () => {
                        try {
                            await axios.delete(`${API_BASE_URL}/medicamento/${id}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                                    },
                                }
                            );
                            presentToast({
                                message: 'Entrada eliminada con éxito.',
                                duration: 1500,
                                color: 'danger',
                                position: 'top',
                            });
                            fetchMedicaciones();
                        } catch (err: any) {
                            console.error('Error deleting Medicamento:', err);
                            presentToast({
                                message: `Error al eliminar: ${err.response?.data?.message || err.message}`,
                                duration: 2000,
                                color: 'danger',
                                position: 'top',
                            });
                        }
                    },
                },
            ],
        });
    };

    // Funcionalidad para agregar una entrada
    const handleAddEntry = (residents: Array<residentInterface>) => {

        const now = new Date();
        const currentHour = String(now.getHours()).padStart(2, '0');
        const currentMinute = String(now.getMinutes()).padStart(2, '0');
        const defaultTime = `${currentHour}:${currentMinute}`;

        presentAlert({
            header: 'Agregar Nueva Entrada de Alimentación',
            cssClass: '.Medicamento-action-sheet-custom',
            inputs: [
                {
                    name: 'tipo',
                    type: 'text',
                    placeholder: 'Nombre',
                    value: '',
                    attributes: { required: true }
                },
                {
                    name: 'dosis',
                    type: 'textarea',
                    placeholder: 'Descripción de la comida...',
                    value: '',
                    attributes: { required: true }
                },
                {
                    name: 'horario',
                    type: 'time',
                    value: defaultTime,
                    attributes: { required: true }
                },
                {
                    name: 'residente',
                    type: 'text',
                    value: '',
                    placeholder: 'Nombre del residente...',
                    attributes: { required: true }
                }
            ],
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Guardar',
                    handler: async (data: { tipo: string; descripcion: string; hora: string; residente: string }) => {
                        if (!data.tipo || !data.descripcion || !data.hora) {
                            presentToast({
                                message: 'Todos los campos son obligatorios, incluyendo el residente.',
                                duration: 2000,
                                color: 'danger',
                                position: 'top',
                            });
                            return false;
                        }

                        let finalResidenteId: number | undefined;

                        try {
                            if (!data.residente) {
                                throw new Error("residente no está definido en data");
                            }
                            console.log(data)
                            const foundResident = residents.find(res => res.nombre.toLowerCase() === data.residente.toLowerCase());
                            if (foundResident) {
                                finalResidenteId = foundResident.id;
                            } else {
                                let token = localStorage.getItem('token');
                                if (!token) {
                                    throw new Error('No hay sesión activa');
                                }
                                const response = await axios.get(`${API_BASE_URL}/residents/`, {
                                    params: { nombre: data.residente },
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                });

                                if (response.data && response.data.id) {
                                    finalResidenteId = response.data.id;
                                } else {
                                    presentToast({
                                        message: 'Residente no encontrado. Por favor, ingrese un nombre de residente válido.',
                                        duration: 2000,
                                        color: 'danger',
                                        position: 'top',
                                    });
                                    return false; // Evita que se cierre el alert
                                }
                            }

                            if (!finalResidenteId) { // Doble verificación por si la lógica anterior falla
                                presentToast({
                                    message: 'No se pudo determinar el ID del residente. Verifique el nombre.',
                                    duration: 2000,
                                    color: 'danger',
                                    position: 'top',
                                });
                                return false;
                            }

                            const [newHour, newMinute] = data.hora.split(':').map(Number);
                            
                            const newFechaHora = new Date(
                                fechaActual.getFullYear(),
                                fechaActual.getMonth(),
                                fechaActual.getDate(),
                                newHour,
                                newMinute,
                                0
                            );

                            const newEntryData = {
                                tipo: data.tipo,
                                descripcion: data.descripcion,
                                hora: data.hora,
                                fecha_hora: newFechaHora,
                                residente_id: finalResidenteId,
                                cuidador_id: user?.id,
                            };
                            
                            console.log("Llegue a agregar con los datos:", newEntryData)

                            let token = localStorage.getItem('token');
                            if (!token) {
                                throw new Error('No hay sesión activa');
                            }

                            await axios.post(`${API_BASE_URL}/Medicamento/`,newEntryData,{
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });
                            presentToast({
                                message: 'Nueva entrada agregada con éxito.',
                                duration: 1500,
                                color: 'success',
                                position: 'top',
                            });
                            fetchMedicaciones();
                        } catch (err: any) {
                            console.error('Error adding Medicamento or finding resident:', err);
                            let errorMessage = 'Error al agregar entrada de alimentación.';
                            if (err.response && err.response.data && err.response.data.message) {
                                errorMessage = `Error al agregar: ${err.response.data.message}`;
                            } else if (err.message) {
                                errorMessage = `Error al agregar: ${err.message}`;
                            }
                            presentToast({
                                message: errorMessage,
                                duration: 2000,
                                color: 'danger',
                                position: 'top',
                            });
                            return false;
                        }
                    },
                },
            ],
        });
    };

    if (isLoading) {
        return (
            <IonPage>
                <Header title='Alimentación' />
                <IonContent className='ion-padding ion-text-center'>
                    <IonSpinner name="crescent" />
                    <IonText>Cargando entradas...</IonText>
                </IonContent>
            </IonPage>
        );
    }

    if (error) {
        return (
            <IonPage>
                <Header title='Alimentación' />
                <IonContent className='ion-padding ion-text-center'>
                    <IonText color="danger">Error al cargar las entradas: {error}</IonText>
                    <IonButton onClick={() => fetchMedicaciones()}>Reintentar</IonButton>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <>
            <IonPage className='medicamento-page'>
                <Header title='Medicación' />
                <IonContent className='medicamento-content '>
                    <div className='medicamento-content-wrapper'>
                        <div className='medicamento-fecha-nav'>
                            <IonButton onClick={() => {
                                setFechaActual(prevDate => {
                                    const newDate = new Date(prevDate);
                                    newDate.setDate(newDate.getDate() - 1);
                                    return newDate;
                                });
                            }}>
                                <IonIcon icon={chevronBackOutline} slot="icon-only" />
                            </IonButton>
                            <FechaWrapper fecha={fechaActual} />
                            <IonButton onClick={() => {
                                setFechaActual(prevDate => {
                                    const newDate = new Date(prevDate);
                                    newDate.setDate(newDate.getDate() + 1);
                                    return newDate;
                                });
                            }}>
                                <IonIcon icon={chevronForwardOutline} slot="icon-only" />
                            </IonButton>
                        </div>
                        
                        {listaMedicamento && listaMedicamento.length > 0 ? (
                            <IonList className='medicamento-lista-entradas'>
                                {listaMedicamento.map(entry => (
                                    <MedicamentoCard
                                        key={entry.id || `${entry.nombre}-${entry.dosis}-${Math.random()}`}
                                        medicamento={entry}
                                        onComerClick={handleAdministrarClick}
                                        onEditClick={handleEditClick}
                                        onDeleteClick={handleDeleteClick}
                                    />
                                ))}
                                <IonItem className="medicamento-card-item">
                                    <IonButton fill="clear" className="add-button-content"
                                        onClick={() => handleAddEntry(residents)}>
                                        <IonIcon icon={addCircle} slot="start" className="add-icon" />
                                        <IonLabel className="add-label">Agregar Nueva Entrada</IonLabel>
                                    </IonButton>
                                </IonItem>
                            </IonList>
                        ) : (
                            <IonList className='medicamento-lista-entradas'>
                                <IonText className='Medicamento-lista-sin-datos'>
                                    No hay registros de alimentación para esta fecha.
                                </IonText>
                                <IonItem className="medicamento-card-item">
                                    <IonButton fill="clear" className="add-button-content"
                                        onClick={() => handleAddEntry(residents)}>
                                        <IonIcon icon={addCircle} slot="start" className="add-icon" />
                                        <IonLabel className="add-label">Agregar Nueva Entrada</IonLabel>
                                    </IonButton>
                                </IonItem>
                            </IonList>
                        )}
                    </div>
                </IonContent>
            </IonPage>
        </>
    );
};
export default Medicamentos;