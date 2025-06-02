import { IonButton, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react';
import Header from '../components/Header'
import FechaWrapper from '../components/FechaWrapper';
import {AlimentacionInterface} from '../Util/AlimentacionInterface'
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AlimentacionCard from '../components/AlimentacionCard';
import './Alimentacion.css';
import { addCircle, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';

const Alimentacion:React.FC = () =>{

    const [fechaActual, setFechaActual] = useState(new Date());
    const [listaAlimentacion, setListaAlimentacion] = useState(new Array<AlimentacionInterface>())
    const [presentAlert] = useIonAlert(); 
    const [presentToast] = useIonToast();
    const {user} = useAuth()

    const opcionesFechaDisplay: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    const fechaParaMostrar = fechaActual.toLocaleDateString('es-CL', opcionesFechaDisplay);

    useEffect(() => {
        
        const datosEjemplo: AlimentacionInterface[] = [
            {
                id: 1,
                tipo: 'Desayuno',
                descripcion: 'Tostadas con palta y café',
                hora: new Date(2025, 5, 1, 6, 0, 0),
            },
            {
                id: 2,
                tipo: 'Almuerzo',
                descripcion: 'Ensalada de pollo con quinoa',
                hora: new Date(2025, 5, 1, 12, 0, 0),
            },
            {
                id: 3,
                tipo: 'Cena',
                descripcion: 'Sopa de verduras y pechuga a la plancha',
                hora: new Date(2025, 5, 1, 18, 0, 0),
            },
            {
                id: 4,
                tipo: 'Snack',
                descripcion: 'Yogur con frutos rojos',
                hora: new Date(2025, 5, 2, 22, 0, 0),
            }
        ];
         const alimentosDelDia = datosEjemplo.filter(entry =>
            entry.hora.getDate() === fechaActual.getDate() &&
            entry.hora.getMonth() === fechaActual.getMonth() &&
            entry.hora.getFullYear() === fechaActual.getFullYear()
        );

        setListaAlimentacion(alimentosDelDia)
    },[fechaActual])

    // TODO Cargar las entradas de alimentacion desde la base de datos
    /*useEffect(() => {
    const cargarAlimentacion = async (user.id, fechaActual) => {
      try {
        const data = await api;
        setListaAlimentacion(data);
      } catch (error) {
        console.error('Error al cargar la alimentación para la fecha actual:', error);
      }
    };

    cargarAlimentacion();*/

    //Handler para señalar que el residente comió
    // TODO hacer que la notificación en el otro lado
    const handleComerClick = (entry:AlimentacionInterface) =>{
        presentAlert({
            header: 'Confirmar Acción',
            cssClass:'.alimentacion-action-sheet-custom ',
            message: `¿El residente ha comido "${entry.tipo}: ${entry.descripcion}"?`,
            buttons: [
                {
                text: 'Cancelar',
                role: 'cancel', // Le da un estilo de cancelación
                handler: () => {
                    console.log('ñamnt!');
                },
                },
                {
                text: 'Confirmar',
                handler: () => {
                    console.log(`ñam!`);
                    },
                },
            ],
            });
    }

    //Handler para editar los campos de la entrada de la comida
    const handleEditClick = (entry:AlimentacionInterface) =>{
        // Formatear la hora actual a HH:mm para el input del alert
        const currentHour = String(entry.hora.getHours()).padStart(2, '0');
        const currentMinute = String(entry.hora.getMinutes()).padStart(2, '0');
        const formattedTime = `${currentHour}:${currentMinute}`;

        presentAlert({
            header: 'Editar Entrada de Alimentación',
            cssClass:'.alimentacion-action-sheet-custom ',
            inputs: [
                {
                    name: 'tipo',
                    type: 'text',
                    placeholder: 'Tipo (Ej: Desayuno, Almuerzo)',
                    value: entry.tipo,
                    attributes: {
                        required: true,
                    }
                },
                {
                    name: 'descripcion',
                    type: 'textarea',
                    placeholder: 'Descripción de la comida',
                    value: entry.descripcion,
                    attributes: {
                        required: true,
                    }
                },
                {
                    name: 'hora',
                    type: 'time',
                    value: formattedTime,
                    attributes: {
                        required: true,
                    }
                }
            ],
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => {
                        console.log('Edición cancelada.');
                    },
                },
                {
                    text: 'Guardar',
                    handler: (data) => {
                        if (!data.tipo || !data.descripcion || !data.hora) {
                            presentToast({
                                message: 'Todos los campos son obligatorios.',
                                duration: 2000,
                                color: 'danger',
                                position: 'top',
                            });
                            return false;
                        }

                        const [newHour, newMinute] = data.hora.split(':').map(Number);
                        const newHora = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), newHour, newMinute, 0);

                        const updatedEntry: AlimentacionInterface = {
                            ...entry,
                            tipo: data.tipo,
                            descripcion: data.descripcion,
                            hora: newHora,
                        };

                        setListaAlimentacion(prevList =>
                            prevList.map(item => (item.id === updatedEntry.id ? updatedEntry : item))
                        );
                         
                        // TODO llamada API para actualizar en la base de datos

                        presentToast({
                            message: 'Entrada actualizada con éxito.',
                            duration: 1500,
                            color: 'success',
                            position: 'top',
                        });
                        console.log('Entrada actualizada:', updatedEntry);
                    },
                },
            ],
        });
    }

    const handleDeleteClick = (id:number) =>{
        presentAlert({
            header: 'Confirmar Eliminación',
            cssClass:'.alimentacion-action-sheet-custom ',
            message: '¿Estás seguro de que quieres eliminar esta entrada?',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => {
                        console.log('Eliminación cancelada');
                    },
                },
                {
                    text: 'Eliminar',
                    role: 'destructive',
                    handler: () => {
                        setListaAlimentacion(prev => prev.filter(item => item.id !== id));
                        presentToast({
                            message: 'Entrada eliminada con éxito.',
                            duration: 1500,
                            color: 'danger',
                            position: 'top',
                        });
                        console.log(`Eliminado ID: ${id}`);
                    },
                },
            ],
        });
        // TODO llamada API para borrar en la base de datos
    }

    const handleAddEntry = () => {
        const now = new Date();
        const currentHour = String(now.getHours()).padStart(2, '0');
        const currentMinute = String(now.getMinutes()).padStart(2, '0');
        const defaultTime = `${currentHour}:${currentMinute}`;

        presentAlert({
            header: 'Agregar Nueva Entrada de Alimentación',
            cssClass:'.alimentacion-action-sheet-custom ',
            inputs: [
                {
                    name: 'tipo',
                    type: 'text',
                    placeholder: 'Tipo (Ej: Desayuno, Almuerzo)',
                    value: '',
                    attributes: { required: true }
                },
                {
                    name: 'descripcion',
                    type: 'textarea',
                    placeholder: 'Descripción de la comida',
                    value: '',
                    attributes: { required: true }
                },
                {
                    name: 'hora',
                    type: 'time',
                    value: defaultTime,
                    attributes: { required: true }
                }
            ],
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => {
                        console.log('Adición cancelada.');
                    },
                },
                {
                    text: 'Guardar',
                    handler: (data) => {
                        if (!data.tipo || !data.descripcion || !data.hora) {
                            presentToast({
                                message: 'Todos los campos son obligatorios.',
                                duration: 2000,
                                color: 'danger',
                                position: 'top',
                            });
                            return false;
                        }

                        const [newHour, newMinute] = data.hora.split(':').map(Number);
                        const newHora = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), newHour, newMinute, 0);
                        
                        const newId = listaAlimentacion.length > 0
                            ? Math.max(...listaAlimentacion.map(item => item.id)) + 1
                            : 1;

                        const newEntry: AlimentacionInterface = {
                            id: newId,
                            tipo: data.tipo,
                            descripcion: data.descripcion,
                            hora: newHora,
                        };

                        setListaAlimentacion(prevList => [...prevList, newEntry]);

                        // TODO: Llamada API para guardar en la base de datos

                        presentToast({
                            message: 'Nueva entrada agregada con éxito.',
                            duration: 1500,
                            color: 'success',
                            position: 'top',
                        });
                    },
                },
            ],
        });
    };

    return(
        <>
            <IonPage className='alimentacion-page'>
                <Header title='Alimentación'/>
                <IonContent className='alimentacion-content '>
                    <div className='alimentacion-content-wrapper'>
                        <div className= 'alimentacion-fecha-nav'>
                            <IonButton onClick = {() => {
                                    setFechaActual(prevDate => {
                                    const newDate = new Date(prevDate);
                                    newDate.setDate(newDate.getDate() - 1);
                                    return newDate;
                                    })
                                 }}>
                                <IonIcon icon={chevronBackOutline} slot="icon-only"/>
                            </IonButton>
                            <FechaWrapper fecha={fechaActual}/>
                            <IonButton onClick = {() => {
                                    setFechaActual(prevDate => {
                                    const newDate = new Date(prevDate);
                                    newDate.setDate(newDate.getDate() + 1);
                                    return newDate;
                                    })
                                 }}>
                                <IonIcon icon={chevronForwardOutline} slot="icon-only"/>
                            </IonButton>
                        </div>
                        
                        {listaAlimentacion.length > 0 ? (
                            <IonList className='alimentacion-lista-entradas'>
                                {listaAlimentacion.sort((a, b) => a.hora.getTime() - b.hora.getTime()).map(entry => (
                                        <AlimentacionCard
                                            key={entry.id || `${entry.tipo}-${entry.hora.getTime()}-${Math.random()}`}
                                            entry={entry}
                                            onComerClick={handleComerClick}
                                            onEditClick={handleEditClick}
                                            onDeleteClick={handleDeleteClick}
                                        />
                                    ))
                                }
                                <IonItem className="alimentacion-card-item">
                                    <IonButton fill="clear" className="add-button-content"
                                    onClick={handleAddEntry}                                >
                                        <IonIcon icon={addCircle} slot="start" className="add-icon" />
                                        <IonLabel className="add-label">Agregar Nueva Entrada</IonLabel>
                                    </IonButton>
                                </IonItem>
                            </IonList>
                        ) : (
                            <IonList className='alimentacion-lista-entradas'>
                                <IonText className='alimentacion-lista-sin-datos'>
                                    No hay registros de alimentación para hoy.
                                </IonText>
                            <IonItem className="alimentacion-card-item">
                                    <IonButton fill="clear" className="add-button-content"
                                    onClick={handleAddEntry}                                >
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
}

export default Alimentacion;