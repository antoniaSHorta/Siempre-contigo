// src/pages/Admin/Medicine/AdminMedicine.tsx

import React, { useEffect, useState } from 'react';
import {
    IonPage,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonFab,
    IonFabButton,
    IonButtons,
    IonToast,
    IonInput,
    IonSelect,
    IonSelectOption,
    useIonViewWillEnter
} from '@ionic/react';
import {
    heartOutline,
    heartDislikeOutline,
    addCircleOutline,
    refreshOutline,
    eyeOffOutline,
    eyeOutline,
    pencilOutline,
} from 'ionicons/icons';
import { useIonRouter } from '@ionic/react';
import { IMedicine } from '../../../interfaces/IMedicine';
import '../Styles/AdminUsers.css';
import Header from '../../../components/Header';
import axios from 'axios';
import { de } from 'date-fns/locale';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173/api';

interface ResidentOption {
    id: number;
    nombre: string;
}

export const AdminMedicine: React.FC = () => {
    const token = localStorage.getItem('token');
    const router = useIonRouter();
    const [medicines, setMedicines] = useState<IMedicine[]>([]);
    const [residents, setResidents] = useState<ResidentOption[]>([]); // State for residents to populate filter
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const medicinesPerPage = 5;
    const [errorMessage, setErrorMessage] = useState('No hay medicamentos registrados.');
    const [filterResident, setFilterResident] = useState<number | 'Todos'>('Todos');
    const [searchName, setSearchName] = useState<string>('');

    useIonViewWillEnter(() => {
        fetchData();
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [filterResident, searchName]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (!token) {
                setErrorMessage('No hay sesión activa. Por favor, inicie sesión.');
                setLoading(false);
                return;
            }

            // Fetch Medicines
            const medicinesResponse = await axios.get(`${API_BASE_URL}/medicacion/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            // --- IMPORTANT: Ensure medicinesResponse.data is an array ---
            // If your API returns { data: [...] }, you'd use medicinesResponse.data.data
            // If it directly returns [...], then medicinesResponse.data is correct.
            // Check your API response to confirm.
            const fetchedMedicines: IMedicine[] = Array.isArray(medicinesResponse.data)
                ? medicinesResponse.data
                : medicinesResponse.data.data || []; // Adjust based on your API structure

            setMedicines(fetchedMedicines);

            // Fetch Residents for the filter dropdown
            const residentsResponse = await axios.get(`${API_BASE_URL}/residents/`, { // Assuming /residentes/ endpoint
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const fetchedResidents: ResidentOption[] = Array.isArray(residentsResponse.data)
                ? residentsResponse.data
                : residentsResponse.data.data || []; // Adjust based on your API structure
            setResidents(fetchedResidents);


            setErrorMessage('No hay medicamentos registrados.');
        } catch (err: any) {
            console.error('Error al cargar datos:', err);
            setToastMessage(`Error al cargar datos: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
            setErrorMessage('Hubo un error al cargar los datos.');
            setMedicines([]); // Ensure it's an empty array on error
            setResidents([]); // Ensure it's an empty array on error
        } finally {
            setLoading(false);
        }
    };

    // Assuming IMedicine has an 'isActive' property to toggle status
    const handleToggleStatus = async (medicineId: number, isActive: boolean) => {
        try {
            if (!token) {
                setToastMessage('No hay sesión activa para realizar esta acción.');
                return;
            }
            // Assuming an endpoint to toggle medicine status
            // And that your API expects an 'isActive' boolean in the request body
            await axios.patch(`${API_BASE_URL}/medicacion/${medicineId}/status`, { isActive: !isActive }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setToastMessage(`Medicamento ${!isActive ? 'activado' : 'desactivado'} correctamente`);
            // Optimistically update UI
            setMedicines(prevMedicines =>
                prevMedicines.map(medicine =>
                    medicine.id === medicineId ? { ...medicine, isActive: !isActive } : medicine
                )
            );
        } catch (err: any) {
            console.error('Error al actualizar el estado del medicamento:', err);
            setToastMessage(`No se pudo actualizar el estado del medicamento: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
        }
    };

    const filteredMedicines = medicines.filter(medicine => {
        const matchResident = filterResident === 'Todos' || medicine.residente_id === filterResident;
        const matchName = medicine.nombre.toLowerCase().includes(searchName.toLowerCase());
        return matchResident && matchName;
    });

    const goToAddMedicine = () => router.push('/app/admin/medicines/add', 'forward');
    const goToEditMedicine = (id: number) => {
        router.push(`/app/admin/medicines/edit/${id}`, 'forward');
    };
    const goToDetailMedicine = (id: number) => {
        router.push(`/app/admin/medicines/detail/${id}`, 'forward');
    };

    const totalPages = Math.ceil(filteredMedicines.length / medicinesPerPage);
    const indexOfLastMedicine = currentPage * medicinesPerPage;
    const indexOfFirstMedicine = indexOfLastMedicine - medicinesPerPage;
    const currentMedicines = filteredMedicines.slice(indexOfFirstMedicine, indexOfLastMedicine);

    return (
        <IonPage className="admin-users-page">
            <Header title='Medicamentos' grayBackground />
            {/* Only show filters if there are medicines to display */}
            {medicines.length > 0 && (
                <div className="admin-users-filters">
                    <IonItem className="admin-filter-item">
                        <IonInput
                            label="Filtrar por nombre"
                            labelPlacement="stacked"
                            placeholder="Ej: Ibuprofeno"
                            value={searchName}
                            onIonInput={(e) => setSearchName(e.detail.value!)}
                        />
                    </IonItem>

                    <IonItem className="admin-filter-item">
                        <IonSelect
                            label="Filtrar por residente"
                            labelPlacement="stacked"
                            interface="popover"
                            value={filterResident}
                            onIonChange={(e) => setFilterResident(e.detail.value)}
                        >
                            <IonSelectOption value="Todos">Todos los Residentes</IonSelectOption>
                            {residents.map((resident) => (
                                <IonSelectOption key={resident.id} value={resident.id}>
                                    {resident.nombre}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                    </IonItem>
                </div>
            )}
            <IonContent className="admin-users-content">
                {loading ? (
                    <p className="admin-no-users-message">Cargando medicamentos...</p>
                ) : medicines.length === 0 && !loading ? ( // Display error message only if no medicines and not loading
                    <p className="admin-no-users-message">{errorMessage}</p>
                ) : (
                    <>
                        <IonList className="admin-users-list">
                            {currentMedicines.map((medicine) => (
                                <IonItem key={medicine.id} className="admin-users-item" lines='inset'>
                                    <IonLabel>
                                        <h2 className="admin-users-name">{medicine.nombre}</h2>
                                        <p className="admin-users-email">Dosis: {medicine.dosis}</p>
                                        <p className="admin-users-role">Horario: {medicine.horario}</p>
                                        <p className="admin-users-role">
                                            Residente: {residents.find(r => r.id === medicine.residente_id)?.nombre || 'Desconocido'}
                                        </p>
                                    </IonLabel>
                                    <IonButtons>
                                        <IonButton className="admin-users-btn-edit" onClick={() => goToEditMedicine(medicine.id)}>
                                            <IonIcon icon={pencilOutline} />
                                        </IonButton>

                                    </IonButtons>
                                </IonItem>
                            ))}
                        </IonList>
                    </>
                )}
            </IonContent>

            {(totalPages > 1 && !loading && filteredMedicines.length > 0) && (
                <div className="admin-users-pagination-fixed">
                    <div className="admin-users-pagination">
                        <IonItem className='admin-filter-item'>
                            <IonLabel>Página</IonLabel>
                            <IonSelect
                                interface="popover"
                                value={currentPage}
                                onIonChange={(e) => setCurrentPage(Number(e.detail.value))}
                            >
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <IonSelectOption key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>
                    </div>
                </div>
            )}

            {!loading && (
                <IonFab vertical="bottom" horizontal="end" slot="fixed" className="admin-users-fab">
                    <IonFabButton onClick={goToAddMedicine}>
                        <IonIcon icon={addCircleOutline} />
                    </IonFabButton>
                </IonFab>
            )}

            <IonToast
                isOpen={!!toastMessage}
                message={toastMessage}
                duration={2000}
                onDidDismiss={() => setToastMessage('')}
                position="bottom"
            />
        </IonPage>
    );
};

export default AdminMedicine;