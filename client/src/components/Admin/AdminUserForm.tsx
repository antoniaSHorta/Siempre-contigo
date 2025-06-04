import React from 'react';
import {
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonText,
} from '@ionic/react';

import './AdminForm.css'

interface UserFormProps {
    form: {
        name: string;
        email: string;
        password: string;
        role: string;
        phone: string;
        location: string;
    };
    onChange: (field: string, value: string) => void;
    error?: string | null;
}

const AdminUserForm: React.FC<UserFormProps> = ({ form, onChange, error }) => {
    return (
        <div className="admin-user-form-container">
            <IonList>
                <IonItem>
                    <div className="form-field-container">
                        <IonLabel position="floating">Nombre</IonLabel>
                        <IonInput
                            value={form.name}
                            onIonChange={e => onChange('name', e.detail.value!)}
                            required
                            type="text"
                            autocomplete="name"
                        />
                    </div>
                </IonItem>

                <IonItem>
                    <IonLabel position="floating">Email</IonLabel>
                    <IonInput
                        value={form.email}
                        onIonChange={e => onChange('email', e.detail.value!)}
                        required
                        type="email"
                        autocomplete="email"
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="floating">Contraseña</IonLabel>
                    <IonInput
                        value={form.password}
                        onIonChange={e => onChange('password', e.detail.value!)}
                        required
                        type="password"
                        autocomplete="new-password"
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="floating">Teléfono</IonLabel>
                    <IonInput
                        value={form.phone}
                        onIonChange={e => onChange('phone', e.detail.value!)}
                        required
                        type="tel"
                        autocomplete="tel"
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="floating">Dirección</IonLabel>
                    <IonInput
                        value={form.location}
                        onIonChange={e => onChange('location', e.detail.value!)}
                        required
                        type="text"
                        autocomplete="street-address"
                    />
                </IonItem>

                <IonItem>
                    <IonLabel>Rol</IonLabel>
                    <IonSelect
                        value={form.role}
                        onIonChange={e => onChange('role', e.detail.value!)}
                        interface="popover"
                        className='custom-select'
                    >
                        <IonSelectOption value="Familiar">Familiar</IonSelectOption>
                        <IonSelectOption value="Cuidador">Cuidador</IonSelectOption>
                    </IonSelect>
                </IonItem>
            </IonList>
        </div>
    );
};

export default AdminUserForm;