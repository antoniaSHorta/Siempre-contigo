import React, { useState } from 'react';
import {
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonToggle,
    IonModal,
} from '@ionic/react';

import './AdminForm.css';

interface ResidentFormProps {
    form: {
        nombre: string;
        nacimiento?: string;
        estado_salud?: string;
        habitacion?: string;
        ingreso?: string;
        cuidadores?: number[];  
        familiares?: number[];  
    };
    onChange: (field: string, value: any) => void;
    cuidadoresDisponibles: IUser[];  
    familiaresDisponibles: IUser[];  
}

import './AdminForm.css'
import { IUser } from '../../interfaces/IUser';
import { format, parseISO } from 'date-fns';

const ResidentForm: React.FC<ResidentFormProps> = ({ form, onChange, cuidadoresDisponibles,familiaresDisponibles }) => {

    const [isNacimientoModalOpen, setIsNacimientoModalOpen] = useState(false);
    const [isIngresoModalOpen, setIsIngresoModalOpen] = useState(false);

    return (
        <div className="admin-user-form-container">
            <IonList>
                <IonItem>
                    <IonLabel position="floating">Nombre</IonLabel>
                    <IonInput
                        value={form.nombre}
                        onIonChange={e => onChange('nombre', e.detail.value!)}
                        required
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="stacked">Fecha de Nacimiento</IonLabel>
                    <div
                        className="date-filter-display"
                        onClick={() => setIsNacimientoModalOpen(true)}
                        style={{ padding: '8px', cursor: 'pointer', width: '100%' }}
                    >
                        {form.nacimiento ? format(parseISO(form.nacimiento), 'dd MMM yyyy') : 'Seleccionar fecha'}
                    </div>
                    <IonModal
                        isOpen={isNacimientoModalOpen}
                        onDidDismiss={() => setIsNacimientoModalOpen(false)}
                        keepContentsMounted={true}
                        className="date-picker-modal"
                    >
                        <IonDatetime
                        presentation="date"
                        value={form.nacimiento || ''}
                        onIonChange={e => {
                            onChange('nacimiento', e.detail.value!);
                            setIsNacimientoModalOpen(false);
                        }}
                        />
                    </IonModal>
                </IonItem>

                <IonItem>
                    <IonLabel>Estado de Salud</IonLabel>
                    <IonSelect
                        value={form.estado_salud || ''}
                        onIonChange={e => onChange('estado_salud', e.detail.value!)}
                        interface="popover"
                    >
                        <IonSelectOption value="Estable">Estable</IonSelectOption>
                        <IonSelectOption value="Requiere atención especial">Requiere atención especial</IonSelectOption>
                        <IonSelectOption value="Requiere terapia física">Requiere terapia física</IonSelectOption>
                        <IonSelectOption value="Crítico">Crítico</IonSelectOption>
                        <IonSelectOption value="Recuperación">Recuperación</IonSelectOption>
                    </IonSelect>
                </IonItem>

                <IonItem>
                    <IonLabel position="floating">Habitación</IonLabel>
                    <IonInput
                        value={form.habitacion || ''}
                        onIonChange={e => onChange('habitacion', e.detail.value!)}
                    />
                </IonItem>

                <IonItem>
                <IonLabel position="stacked">Fecha de Ingreso</IonLabel>
                <div
                    className="date-filter-display"
                    onClick={() => setIsIngresoModalOpen(true)}
                    style={{ padding: '8px', cursor: 'pointer', width: '100%' }}
                >
                    {form.ingreso ? format(parseISO(form.ingreso), 'dd MMM yyyy') : 'Seleccionar fecha'}
                </div>
                <IonModal
                    isOpen={isIngresoModalOpen}
                    onDidDismiss={() => setIsIngresoModalOpen(false)}
                    keepContentsMounted={true}
                    className="date-picker-modal"
                >
                    <IonDatetime
                    presentation="date"
                    value={form.ingreso || ''}
                    onIonChange={e => {
                        onChange('ingreso', e.detail.value!);
                        setIsIngresoModalOpen(false);
                    }}
                    />
                </IonModal>
                </IonItem>

                <IonItem>
                    <IonLabel>Cuidadores</IonLabel>
                    <IonSelect
                        multiple={true}
                        value={form.cuidadores || []}
                        onIonChange={e => onChange('cuidadores', e.detail.value)}
                        interface="popover"
                    >
                        {cuidadoresDisponibles.map(cuidador => (
                            <IonSelectOption key={cuidador.id} value={cuidador.id}>
                                {cuidador.name}
                            </IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>

                <IonItem>
                    <IonLabel>Familiares</IonLabel>
                    <IonSelect
                        multiple={true}
                        value={form.familiares || []}
                        onIonChange={e => onChange('familiares', e.detail.value)}
                        interface="popover"
                    >
                        {familiaresDisponibles.map(familiar => (
                            <IonSelectOption key={familiar.id} value={familiar.id}>
                                {familiar.name}
                            </IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>
            </IonList>
        </div>
    );
};

export default ResidentForm;
