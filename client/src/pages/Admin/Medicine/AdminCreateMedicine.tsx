import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonButton, useIonToast } from '@ionic/react';
import Header from '../../../components/Header';
import AdminMedicineForm from '../../../components/Medicacion/AdminMedicineForm'
import { MedicineFormFields } from '../../../components/Medicacion/AdminMedicineForm';
import { useAuth } from '../../../contexts/AuthContext'; 
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173/api';

// Interfaces que AdminMedicineForm necesita
interface ResidentOption {
    id: number;
    nombre: string;
}

interface CuidadorOption {
    id: number;
    nombre: string;
}

const AdminCreateMedicine: React.FC = () => {
    const { user } = useAuth(); // Obtén el usuario autenticado
    const [presentToast] = useIonToast();

    // Estado del formulario de medicación
    const [medicineForm, setMedicineForm] = useState({
        nombre: '',
        dosis: '',
        fecha_hora : '',
        horario: '',
        residente_id: undefined,
        cuidador_id: undefined, // Se inicializa como undefined
    });

    const [residents, setResidents] = useState<ResidentOption[]>([]);
    const [cuidadores, setCuidadores] = useState<CuidadorOption[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No hay sesión activa.');
                }
                const residentsResponse = await axios.get(`${API_BASE_URL}/residents/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResidents(residentsResponse.data.data);

                if (user?.role === 'admin') {
                    const cuidadoresResponse = await axios.get(`${API_BASE_URL}/users/cuidadores`, {
                    });
                    setCuidadores(cuidadoresResponse.data.data);
                } else {
                    setMedicineForm(prev => ({ ...prev, cuidador_id: user?.id }));
                }

            } catch (err: any) {
                console.error('Error fetching form dependencies:', err);
                presentToast({
                    message: `Error al cargar datos necesarios: ${err.response?.data?.message || err.message}`,
                    duration: 2500,
                    color: 'danger',
                    position: 'top',
                });
            }
        };
        fetchDependencies();
    }, [user, presentToast]);

    const getFormattedCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses son 0-11
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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

        const finalCuidadorId = user?.role === 'Admin' ? medicineForm.cuidador_id : user?.id;

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

        const [year, month, day] = medicineForm.fecha_hora.split('-').map(Number);
        const [newHour, newMinute] = medicineForm.horario.split(':').map(Number);

        const fecha_hora_combined = new Date(year, month - 1, day, newHour, newMinute, 0);

        console.log(fecha_hora_combined)
        
        const dataToSend = {
            ...medicineForm,
            residente_id: medicineForm.residente_id,
            cuidador_id: finalCuidadorId, 
            fecha_hora: fecha_hora_combined.toISOString(),
            estado: 'pendiente',
        };
        console.log(dataToSend)
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay sesión activa.');
            }
            console.log(dataToSend)
            await axios.post(`${API_BASE_URL}/medicacion/`, dataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            presentToast({
                message: 'Medicación agregada con éxito.',
                duration: 1500,
                color: 'success',
                position: 'top',
            });

            setMedicineForm({
                nombre: '',
                dosis: '',
                fecha_hora: getFormattedCurrentDate(),
                horario: '',
                residente_id: undefined,
                cuidador_id: user?.role === 'admin' ? undefined : user?.id,
            });
            console.log()
        } catch (err: any) {
            console.error('Error creating medicación:', err);
            setFormError(`Error al crear medicación: ${err.response?.data?.message || err.message}`);
            presentToast({
                message: `Error al crear medicación: ${err.response?.data?.message || err.message}`,
                duration: 2000,
                color: 'danger',
                position: 'top',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Asegúrate de que user?.role sea 'admin' o 'Admin' según lo que uses en tu backend
    const isCurrentUserAdmin = user?.role === 'admin' || user?.role === 'Admin';

    return (
        <IonPage>
            <Header title="Administrar Medicación" />
            <IonContent className="ion-padding">
                <form onSubmit={handleSubmit}>
                    <AdminMedicineForm
                        form={medicineForm}
                        onChange={handleFormChange}
                        residents={residents}
                        cuidadores={cuidadores}
                        isAdmin={isCurrentUserAdmin}
                        error={formError}
                        // isEdit={false} // Si este formulario es solo para crear, no necesitas isEdit
                    />
                    <IonButton expand="block" type="submit" className="ion-margin-top" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Crear Medicación'}
                    </IonButton>
                </form>
            </IonContent>
        </IonPage>
    );
};

export default AdminCreateMedicine;