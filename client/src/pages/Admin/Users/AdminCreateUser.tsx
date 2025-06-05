import React, { useState } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonText,
    IonButtons,
    IonIcon,
} from '@ionic/react';
import { useIonRouter } from '@ionic/react';
import AdminUserForm from '../../../components/Admin/AdminUserForm';
import { checkEmailExists, createUserAdmin } from '../../../services/adminService'; 
import '../Styles/AdminCreate.css';
import { chevronBackOutline } from 'ionicons/icons';
import Header from '../../../components/Header';

export const AdminCreateUser: React.FC = () => {
    const router = useIonRouter();
    const token = localStorage.getItem('token') || '';
    const validRoles = ['Cuidador','Familiar'];

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Cuidador',
        phone: '',
        location: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setError(null);
        setSuccess(null);
    };

    const validateEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const isValidChileanPhone = (phone: string): boolean => {
        return /^(\+569\d{8}|9\d{8})$/.test(phone);
    };

    const handleSubmit = async () => {
        setError(null);
        setSuccess(null);

        if (!form.name.trim() || !form.email.trim() || !form.role.trim() || !form.location.trim() || !form.phone.trim()) {
            setError('Por favor, completa todos los campos.');
        return;
        }

        if (!validateEmail(form.email)) {
            setError('Email no es válido.');
        return;
        }

        if (!isValidChileanPhone(form.phone)) {
            setError('El número de teléfono debe tener el formato +569XXXXXXXX o 9XXXXXXXX.');
            return;
        }

        if (form.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
        }
        
        if (!validRoles.includes(form.role)) {
            setError('El rol seleccionado no es válido.');
            return;
        }

        const emailExists = await checkEmailExists(form.email,token);

        if(emailExists){
            setError('El correo ya existe');
            return;
        }

        setLoading(true);
        try {
        const newUser = {
            ...form,
            isActive: true,
            isConnected: false,
        };
        console.log(newUser)

        await createUserAdmin(newUser, token);
        setSuccess('Usuario creado correctamente.');
        setForm({
            name: '',
            email: '',
            password: '',
            role: 'Cuidador',
            phone: '',
            location: ''
        });

        setTimeout(() => {
            router.push('/app/admin/users');
        }, 1000);
        } catch (err) {
            setError('Error al crear el usuario. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage className="admin-user-create-page">
            <Header title='Añadir nuevo usuario' grayBackground/>
            <div className="admin-user-create-content">
                <div className="admin-user-create-container">
                    <div className="admin-form-header-text">Crear nuevo usuario</div>
                    <AdminUserForm form={form} onChange={handleChange} error={error} isEdit={false}/>

                    {error && <div className="admin-user-create-message error">{error}</div>}
                    {success && <div className="admin-user-create-message success">{success}</div>}

                    <IonButton expand="block" className="admin-save-button" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Creando...' : 'Crear Usuario'}
                    </IonButton>

                    <IonButton
                        expand="block" 
                        fill="outline" 
                        color="medium" 
                        onClick={() => router.push('/app/admin/users')}
                        >
                        Cancelar
                    </IonButton>
                </div>
            </div>
        </IonPage>
    );
};

