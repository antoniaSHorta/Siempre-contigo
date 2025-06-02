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