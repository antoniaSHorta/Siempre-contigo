import React, { useEffect, useState } from 'react';
import {
    IonPage,
    IonText,
    IonLoading,
    IonButton,
    useIonRouter
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { getResidentById, updateResident, updateResidentCuidadores, updateResidentFamiliares} from '../../../services/residentService';
import { IResident } from '../../../interfaces/IResident';
import AdminResidentForm from '../../../components/Admin/AdminResidentForm';
import Header from '../../../components/Header';
import '../Styles/AdminEdit.css'
import { IUser } from '../../../interfaces/IUser';
import { getAllUsersAdmin } from '../../../services/adminService';

export const AdminResidentEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const numericId = Number(id);
    const token = localStorage.getItem('token') || '';
    const router = useIonRouter();

    const [resident, setResident] = useState<IResident | null>(null);
    const [form, setForm] = useState({
        nombre: '',
        nacimiento: '',
        estado_salud: '',
        habitacion: '',
        ingreso: '',
        cuidadores: [] as number[],
        familiares: [] as number[]
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [cuidadoresDisponibles, setCuidadoresDisponibles] = useState<IUser[]>([]);
    const [familiaresDisponibles, setFamiliaresDisponibles] = useState<IUser[]>([]);

    useEffect(() => {
    const fetchData = async () => {
        try {
            setLoading(true);

            const responseResident = await getResidentById(numericId, token);
            const dataResident: IResident = responseResident;

            const responseUsers = await getAllUsersAdmin(token);
            const allUsers: IUser[] = responseUsers.users;

            const cuidadores = allUsers.filter(u => u.isActive && u.role === 'Cuidador');
            const familiares = allUsers.filter(u => u.isActive && u.role === 'Familiar');

            
            setCuidadoresDisponibles(cuidadores);
            setFamiliaresDisponibles(familiares);

            setResident(dataResident);
            setForm({
                nombre: dataResident.nombre,
                nacimiento: dataResident.nacimiento || '',
                estado_salud: dataResident.estado_salud || '',
                habitacion: dataResident.habitacion || '',
                ingreso: dataResident.ingreso || '',
                cuidadores: dataResident.cuidadores?.map(c => c.id) || [],
                familiares: dataResident.familiares?.map(f => f.id) || [],
            });
        } catch (err) {
            setError('No se pudo cargar el residente o usuarios.');
        } finally {
            setLoading(false);
        }
        };
        fetchData();
    }, [id]);

    const handleChange = (field: string, value: string | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setError(null);
        setSuccess(null);
    };

    const handleSave = async () => {
        if (!form.nombre.trim() || !form.habitacion?.trim() || !form.ingreso?.trim()) {
            setError('Por favor completa todos los campos requeridos.');
            return;
        }

        try {
            const { cuidadores, familiares, ...basicData } = form;
            await Promise.all([
                updateResident(numericId, basicData, token),
                updateResidentCuidadores(numericId, cuidadores, token),
                updateResidentFamiliares(numericId, familiares, token)
            ])
            
            setSuccess('Residente actualizado correctamente.');
            setTimeout(() => {
                router.push('/app/admin/residents');
                window.location.reload();
            }, 1000);
        } catch (err) {
            setError('Error al actualizar el residente.');
        }
    };

    if (loading) return <IonLoading isOpen={true} message="Cargando residente..." />;

    return (
        <IonPage className="admin-user-edit-page">
            <Header title='Editar Residente' grayBackground/>
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

                    {resident && (
                        <>
                            <IonText className="admin-user-edit-username" style={{ marginBottom: '1rem', fontWeight: '600', fontSize: '1.2rem' }}>
                                Editando residente: {resident.nombre}
                            </IonText>
                            <AdminResidentForm form={form} onChange={handleChange} cuidadoresDisponibles={cuidadoresDisponibles} familiaresDisponibles={familiaresDisponibles}/>
                            <IonButton expand="block" onClick={handleSave} className="admin-save-button">
                                Guardar Cambios
                            </IonButton>
                            <IonButton
                                expand="block"
                                fill="outline"
                                color="medium"
                                onClick={() => router.push('/app/admin/residents')}
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
