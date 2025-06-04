import React, { useEffect, useState } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonText,
    IonLoading,
    IonBackButton,
    IonButtons,
    IonIcon,
    useIonRouter,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { checkEmailExists, getUserByIdAdmin, updateUserAdmin } from '../../../services/adminService';
import AdminUserForm from '../../../components/Admin/AdminUserForm';
import { IUser } from '../../../interfaces/IUser';
import '../Styles/AdminEdit.css';
import { chevronBackOutline } from 'ionicons/icons';
import Header from '../../../components/Header';

export const AdminUserEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const numericId = Number(id);
    const token = localStorage.getItem('token') || '';
    const router = useIonRouter();

    const [user, setUser] = useState<IUser | null>(null);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
        phone: '',
        location: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getUserByIdAdmin(numericId, token);
                const data = response.user;
                setUser(data);
                setForm({
                    name: data.name,
                    email: data.email,
                    password: '',
                    role: data.role,
                    phone: data.phone,
                    location: data.location
                });
            } catch (err) {
                setError('No se pudo cargar el usuario.');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setError(null);
        setSuccess(null);
    };

    const validateEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSave = async () => {
        if (!form.name.trim() || !form.email.trim() || !form.role.trim() || !form.location.trim() || !form.phone.trim()) {
            setError('Por favor completa todos los campos requeridos.');
            return;
        }

        if (!validateEmail(form.email)) {
        setError('Email no es válido.');
        return;
        }

        if (form.password && form.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        const emailExists = await checkEmailExists(form.email,token);
        
        if(emailExists){
            setError('El correo ya existe');
            return;
        }

        try {
            await updateUserAdmin(numericId, form, token);
            setSuccess('Usuario actualizado correctamente.');
            setTimeout(() => {
                router.push('/admin/users');
            window.location.reload();
        }, 1000);
        } catch (err) {
            setError('Error al actualizar el usuario.');
        }
    };

    if (loading) return <IonLoading isOpen={true} message="Cargando usuario..." />;

    return (
        <IonPage className="admin-user-edit-page">
            <Header title='Editar Usuario'></Header>
            <div className="admin-user-edit-content">
                <div className="admin-user-edit-container">
                    {error && (
                        <IonText color="danger" className="admin-user-edit-message error">
                            <p>{error}</p>
                        </IonText>
                    )}
                    {success && (
                        <IonText color="success" className="admin-user-edit-message success">
                            <p>{success}</p>
                        </IonText>
                    )}

                    {user && (
                        <>
                            <IonText className="admin-user-edit-username" style={{ marginBottom: '1rem', fontWeight: '600', fontSize: '1.2rem' }}>
                                Editando usuario: {user.name}
                            </IonText>
                            <AdminUserForm form={form} onChange={handleChange} error={null} />
                            <IonButton expand="block" onClick={handleSave} className="admin-save-button">
                                Guardar Cambios
                            </IonButton>
                            <IonButton
                                expand="block" 
                                fill="outline" 
                                color="medium" 
                                onClick={() => router.push('/app/admin/users')}
                                >
                                Cancelar
                            </IonButton>
                        </>
                        
                    )}
                </div>
            </div>
        </IonPage>
    );
};
