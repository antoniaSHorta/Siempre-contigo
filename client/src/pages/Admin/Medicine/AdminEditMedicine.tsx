import React, { useState, useEffect } from 'react';
import {
    IonPage,
    IonContent,
    IonButton,
    useIonToast,
    useIonRouter,
    IonLabel,
    useIonViewWillEnter
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import Header from '../../../components/Header';
import AdminMedicineForm from '../../../components/Medicacion/AdminMedicineForm';
import { MedicineFormFields } from '../../../components/Medicacion/AdminMedicineForm';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173/api';

interface ResidentOption {
    id: number;
    nombre: string;
}

interface CuidadorOption {
    id: number;
    nombre: string;
}

const AdminEditMedicine: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [presentToast] = useIonToast();
    const router = useIonRouter();

    const [medicineForm, setMedicineForm] = useState<MedicineFormFields>({
        nombre: '',
        dosis: '',
        fecha_hora: '',
        horario: '',
        residente_id: undefined,
        cuidador_id: undefined,
    });

    const [residents, setResidents] = useState<ResidentOption[]>([]);
    const [cuidadores, setCuidadores] = useState<CuidadorOption[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

    useIonViewWillEnter(() => {
        fetchDependenciesAndMedicine();
    });

    const fetchDependenciesAndMedicine = async () => {
        setIsLoadingData(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay sesión activa.');
            }

            const residentsResponse = await axios.get(`${API_BASE_URL}/residents/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResidents(Array.isArray(residentsResponse.data) ? residentsResponse.data : residentsResponse.data.data || []);

            if (user?.role === 'admin') {
                    const cuidadoresResponse = await axios.get(`${API_BASE_URL}/users/cuidadores`, {
                    });
                    setCuidadores(cuidadoresResponse.data.data);
                } else {
                    setMedicineForm(prev => ({ ...prev, cuidador_id: user?.id }));
                }
                
            if (id) {
                const medicineResponse = await axios.get(`${API_BASE_URL}/medicacion/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const fetchedMedicine = medicineResponse.data.data || medicineResponse.data;

                const dateTime = new Date(fetchedMedicine.fecha_hora);
                const formattedDate = dateTime.toISOString().split('T')[0];
                const formattedTime = dateTime.toTimeString().slice(0, 5);

                setMedicineForm({
                    nombre: fetchedMedicine.nombre,
                    dosis: fetchedMedicine.dosis,
                    fecha_hora: formattedDate,
                    horario: formattedTime,
                    residente_id: fetchedMedicine.residente_id,
                    cuidador_id: fetchedMedicine.cuidador_id,
                });

                if (user?.role !== 'admin' && user?.role !== 'Admin' && user?.id) {
                    setMedicineForm(prev => ({ ...prev, cuidador_id: user.id }));
                }

            } else {
                if (user?.role !== 'admin' && user?.role !== 'Admin' && user?.id) {
                    setMedicineForm(prev => ({ ...prev, cuidador_id: user.id }));
                }
            }
        } catch (err: any) {
            console.error('Error fetching data for form:', err);
            presentToast({
                message: `Error al cargar datos necesarios: ${err.response?.data?.message || err.message}`,
                duration: 2500,
                color: 'danger',
                position: 'top',
            });
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleFormChange = (field: keyof MedicineFormFields, value: string | number | undefined) => {
        setMedicineForm(prevForm => ({
            ...prevForm,
            [field]: value,
        }));
        setFormError(null);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        if (!medicineForm.nombre || !medicineForm.dosis || !medicineForm.horario || medicineForm.residente_id === undefined) {
            setFormError('Todos los campos obligatorios deben ser completados.');
            presentToast({
                message: 'Por favor, rellena todos los campos obligatorios.',
                duration: 2000,
                color: 'danger',
                position: 'top',
            });
            setIsSubmitting(false);
            return;
        }

        const finalCuidadorId = user?.role === 'admin' || user?.role === 'Admin' ? medicineForm.cuidador_id : user?.id;

        if (finalCuidadorId === undefined) {
            setFormError('No se pudo determinar el cuidador.');
            presentToast({
                message: 'Error: No se pudo determinar el cuidador.',
                duration: 2000,
                color: 'danger',
                position: 'top',
            });
            setIsSubmitting(false);
            return;
        }

        let fecha_hora_combined: Date;
        try {
            const [year, month, day] = medicineForm.fecha_hora.split('-').map(Number);
            const [newHour, newMinute] = medicineForm.horario.split(':').map(Number);
            fecha_hora_combined = new Date(year, month - 1, day, newHour, newMinute, 0);
            if (isNaN(fecha_hora_combined.getTime())) {
                throw new Error('Fecha u hora inválida.');
            }
        } catch (dateError) {
            setFormError('Formato de fecha u horario inválido.');
            presentToast({
                message: 'Error en el formato de fecha u horario.',
                duration: 2000,
                color: 'danger',
                position: 'top',
            });
            setIsSubmitting(false);
            return;
        }

        const dataToSend = {
            ...medicineForm,
            residente_id: medicineForm.residente_id,
            cuidador_id: finalCuidadorId,
            fecha_hora: fecha_hora_combined.toISOString(),
        };

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay sesión activa.');
            }
            await axios.put(`${API_BASE_URL}/medicacion/${id}`, dataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            presentToast({
                message: 'Medicación actualizada con éxito.',
                duration: 1500,
                color: 'success',
                position: 'top',
            });

            router.goBack();

        } catch (err: any) {
            console.error('Error updating medicación:', err);
            setFormError(`Error al actualizar medicación: ${err.response?.data?.message || err.message}`);
            presentToast({
                message: `Error al actualizar medicación: ${err.response?.data?.message || err.message}`,
                duration: 2000,
                color: 'danger',
                position: 'top',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoBack = () => {
        router.goBack();
    };

    const isCurrentUserAdmin = user?.role === 'admin' || user?.role === 'Admin';

    if (isLoadingData) {
        return (
            <IonPage>
                <Header title="Editar Medicación" />
                <IonContent className="ion-padding ion-text-center">
                    <IonLabel>Cargando datos de la medicación...</IonLabel>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <Header title="Editar Medicación" />
            <IonContent className="ion-padding">
                <form onSubmit={handleSubmit}>
                    <AdminMedicineForm
                        form={medicineForm}
                        onChange={handleFormChange}
                        residents={residents}
                        cuidadores={cuidadores}
                        isAdmin={isCurrentUserAdmin}
                        error={formError}
                        isEdit={true}
                    />
                    <IonButton expand="block" type="submit" className="ion-margin-top" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando cambios...' : 'Guardar Cambios'}
                    </IonButton>
                </form>
                <IonButton expand="block" color={'light'} onClick={handleGoBack} className="ion-margin-top">
                    <IonLabel>Volver</IonLabel>
                </IonButton>
            </IonContent>
        </IonPage>
    );
};

export default AdminEditMedicine;