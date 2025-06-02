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

    //Handlers
    const handleComerClick = (entry:AlimentacionInterface) =>{
        presentAlert({
            header: 'Confirmar Acción',
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

    const handleEditClick = (entry:AlimentacionInterface) =>{
        // Formatear la hora actual a HH:mm para el input del alert
        const currentHour = String(entry.hora.getHours()).padStart(2, '0');
        const currentMinute = String(entry.hora.getMinutes()).padStart(2, '0');
        const formattedTime = `${currentHour}:${currentMinute}`;

        presentAlert({
            header: 'Editar Entrada de Alimentación',
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
        
    }

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
                                onClick={() =>{}}                                >
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