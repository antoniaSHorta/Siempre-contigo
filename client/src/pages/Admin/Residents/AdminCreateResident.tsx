import React, { useEffect, useState } from 'react';
import {
    IonPage,
    IonText,
    IonButton,
    IonLoading,
    useIonRouter
} from '@ionic/react';
import { IResident } from '../../../interfaces/IResident';
import { IUser } from '../../../interfaces/IUser';
import { getAllUsersAdmin } from '../../../services/adminService';
import { createResident, addResidentCuidadores, addResidentFamiliares } from '../../../services/residentService';
import AdminResidentForm from '../../../components/Admin/AdminResidentForm';
import Header from '../../../components/Header';
import '../Styles/AdminCreate.css'

export const AdminCreateResident: React.FC = () => {
    const router = useIonRouter();
    const token = localStorage.getItem('token') || '';

    const [form, setForm] = useState({
        nombre: '',
        nacimiento: '',
        estado_salud: '',
        habitacion: '',
        ingreso: '',
        cuidadores: [],
        familiares: []
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [cuidadoresDisponibles, setCuidadoresDisponibles] = useState<IUser[]>([]);
    const [familiaresDisponibles, setFamiliaresDisponibles] = useState<IUser[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUsersAdmin(token);
                const users: IUser[] = response.users;

                setCuidadoresDisponibles(users.filter(u  => u.isActive && u.role === 'Cuidador'));
                setFamiliaresDisponibles(users.filter(u => u.isActive && u.role === 'Familiar'));
            } catch (err) {
                setError('Error al cargar cuidadores y familiares.');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleChange = (key: string, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async () => {
        if (!form.nombre.trim() || !form.habitacion?.trim() || !form.ingreso?.trim()) {
            setError('Por favor completa todos los campos requeridos.');
            return;
        }

        setLoading(true);
        try {
            const response = await createResident(form, token);
            const newResidentId = response.data.data.id;
            

            if (!newResidentId) throw new Error('No se obtuvo el ID del nuevo residente.');

            
            await addResidentCuidadores(newResidentId, form.cuidadores || [], token!);
            await addResidentFamiliares(newResidentId, form.familiares || [], token!);
            
            console.log("hola")

            setSuccess('Residente creado correctamente.');
            setTimeout(() => {
                router.push('/app/admin/residents');
                window.location.reload();
            }, 1000);
        } catch (err) {
            setError('Error al crear el residente.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <IonLoading isOpen={true} message="Cargando..." />;

    return (
        <IonPage className="admin-user-edit-page">
            <Header title='Crear nuevo residente' grayBackground/>
            <div className="admin-user-edit-content">
                <div className="admin-user-edit-container">
                    <div className="admin-form-header-text">Crear nuevo residente</div>
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
                    <AdminResidentForm
                        form={form}
                        onChange={handleChange}
                        cuidadoresDisponibles={cuidadoresDisponibles}
                        familiaresDisponibles={familiaresDisponibles}
                    />

                    <IonButton expand="block" onClick={handleSubmit} className="admin-save-button" disabled={loading}>
                        {loading ? 'Creando...' : 'Crear Residente'}
                    </IonButton>
                    <IonButton
                        expand="block"
                        fill="outline"
                        color="medium"
                        onClick={() => router.push('/app/admin/residents')}
                    >
                        Cancelar
                    </IonButton>
                </div>
            </div>
        </IonPage>
    );
};
