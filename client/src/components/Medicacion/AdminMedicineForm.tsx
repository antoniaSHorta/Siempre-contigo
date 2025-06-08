import React, { useEffect, useState } from 'react';
import {
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonText,
} from '@ionic/react';

import './AdminMedicineForm.css';
import { getAllUsersAdmin } from '../../services/adminService';
import { IUser } from '../../interfaces/IUser';

export interface MedicineFormFields {
    nombre: string;
    dosis: string;
    fecha_hora: string;
    horario: string;
    residente_id: number | undefined;
    cuidador_id: number | undefined;
}

export interface ResidentOption {
    id: number;
    nombre: string;
}

export interface CuidadorOption {
    id: number;
    nombre: string;
}

interface AdminMedicineFormProps {
    form: MedicineFormFields;
    onChange: (field: keyof MedicineFormFields, value: string | number | undefined) => void;
    residents: ResidentOption[];
    cuidadores: CuidadorOption[];
    isAdmin: boolean;
    error?: string | null;
    isEdit?: boolean;
}

const AdminMedicineForm: React.FC<AdminMedicineFormProps> = ({
    form,
    onChange,
    residents,
    isAdmin,
    error,
    isEdit,
}) => {
    const [cuidadoresDisponibles, setCuidadoresDisponibles] = useState<IUser[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                let token = localStorage.getItem('token') || '';
                if (!token) {
                    console.warn('No token found in localStorage. Cannot fetch users.');
                    return;
                }
                const response = await getAllUsersAdmin(token);
                const users: IUser[] = response.users;

                setCuidadoresDisponibles(users.filter(u => u.isActive && u.role === 'Cuidador'));
            } catch (err) {
                console.error('Error al cargar cuidadores y familiares:', err);
            }
        };

        if (isAdmin) {
            fetchUsers();
        } else {
            setCuidadoresDisponibles([]);
        }
    }, [isAdmin]);

    return (
        <div className="admin-medicine-form-container">
            <IonList>
                <IonItem>
                    <IonLabel position="floating">Nombre del Medicamento</IonLabel>
                    <IonInput
                        value={form.nombre}
                        onIonChange={e => onChange('nombre', e.detail.value!)}
                        required
                        type="text"
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="floating">Dosis</IonLabel>
                    <IonInput
                        value={form.dosis}
                        onIonChange={e => onChange('dosis', e.detail.value!)}
                        required
                        type="text"
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="floating">Fecha</IonLabel>
                    <IonInput
                        value={form.fecha_hora}
                        onIonChange={e => onChange('fecha_hora', e.detail.value!)}
                        required
                        type="date"
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="floating">Horario</IonLabel>
                    <IonInput
                        value={form.horario}
                        onIonChange={e => onChange('horario', e.detail.value!)}
                        required
                        type="time"
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="floating">Residente</IonLabel>
                    <IonSelect
                        value={form.residente_id}
                        onIonChange={e => onChange('residente_id', e.detail.value)}
                        placeholder="Seleccione un residente"
                        interface="popover"
                    >
                        {residents.map((resident) => (
                            <IonSelectOption key={resident.id} value={resident.id}>
                                {resident.nombre}
                            </IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>

                {isAdmin && (
                    <IonItem>
                        <IonLabel position="floating">Cuidador</IonLabel>
                        <IonSelect
                            value={form.cuidador_id}
                            onIonChange={e => onChange('cuidador_id', e.detail.value)}
                            placeholder="Seleccione un cuidador"
                            interface="popover"
                        >
                            {cuidadoresDisponibles.map((cuidador) => (
                                <IonSelectOption key={cuidador.id} value={cuidador.id}>
                                    {cuidador.name}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                    </IonItem>
                )}

                {error && (
                    <IonItem>
                        <IonText color="danger" className="form-error-text">
                            {error}
                        </IonText>
                    </IonItem>
                )}
            </IonList>
        </div>
    );
};

export default AdminMedicineForm;