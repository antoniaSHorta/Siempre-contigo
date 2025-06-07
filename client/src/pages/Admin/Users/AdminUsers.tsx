import React, { useEffect, useState } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
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
    IonBackButton,
    IonInput,
    IonSelect,
    IonSelectOption,
    useIonViewWillEnter
} from '@ionic/react';
import {
    eyeOutline,
    pencilOutline,
    personRemoveOutline,
    personAddOutline,
    refreshOutline,
    chevronBackOutline,
} from 'ionicons/icons';
import { useIonRouter } from '@ionic/react';
import { getAllUsersAdmin, toggleStatusUser } from '../../../services/adminService'; 
import { IUser } from '../../../interfaces/IUser';
import '../Styles/AdminUsers.css'; 
import Header from '../../../components/Header';

export const AdminUsers: React.FC = () => {
    const token = localStorage.getItem('token');
    const router = useIonRouter();
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;
    const [errorMessage, setErrorMessage] = useState('No hay usuarios con el rol Familiar o Cuidador.');
    const [filterRole, setFilterRole] = useState<string>('Todos');
    const [searchName, setSearchName] = useState<string>('');


    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterRole, searchName]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const result = await getAllUsersAdmin(token!);
            const filtered = result.users.filter(
                (user: IUser) => user.role === 'Familiar' || user.role === 'Cuidador'
            );
            setUsers([...filtered]);
            setCurrentPage(1);
        } catch (err) {
            setToastMessage('Error al cargar usuarios');
            setErrorMessage('Hubo un error al cargar los usuarios')
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId: number, isActive: boolean) => {
        try {
            await toggleStatusUser(userId, token!, !isActive);
            setToastMessage(`Usuario ${!isActive ? 'activado' : 'desactivado'} correctamente`);
            setUsers(prevUsers => 
                prevUsers.map(user =>
                    user.id === userId ? { ...user, isActive: !isActive } : user
                )
            );
        } catch (err) {
            setToastMessage('No se pudo actualizar el estado del usuario');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchRole = filterRole === 'Todos' || user.role === filterRole;
        const matchName = user.name.toLowerCase().includes(searchName.toLowerCase());
        return matchRole && matchName;
    });

    const goToAddUser = () => router.push('/app/admin/users/add', 'forward');
    const goToEditUser = (id: number) => {
        router.push(`/app/admin/users/edit/${id}`, 'forward')
        window.location.reload();
    };
    const goToDetailUser = (id: number) => {
        router.push(`/app/admin/users/detail/${id}`, 'forward');
        window.location.reload();
    }
        

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    return (
        <IonPage className="admin-users-page">
            <Header title='Usuarios' grayBackground/>
            {users.length > 0 && (
                <div className="admin-users-filters">
                <IonItem className="admin-filter-item">
                    <IonInput
                    label="Filtrar por nombre"
                    labelPlacement="stacked"
                    placeholder="Ej: Juan Pérez"
                    value={searchName}
                    onIonInput={(e) => setSearchName(e.detail.value!)}
                    />
                </IonItem>

                <IonItem className="admin-filter-item">
                    <IonSelect
                    label="Filtrar por rol"
                    labelPlacement="stacked"
                    interface="popover"
                    value={filterRole}
                    onIonChange={(e) => setFilterRole(e.detail.value)}
                    >
                    <IonSelectOption value="Todos">Todos</IonSelectOption>
                    <IonSelectOption value="Cuidador">Cuidador</IonSelectOption>
                    <IonSelectOption value="Familiar">Familiar</IonSelectOption>
                    </IonSelect>
                </IonItem>
                </div>
            )}
            <div className="admin-users-content">
                {loading ? (
                    <p className="admin-no-users-message">Cargando usuarios...</p>
                ) : users.length === 0 ? (
                    <p className="admin-no-users-message">{errorMessage}</p>
                ) : (
                    <>
                        
                        <IonList className="admin-users-list">
                            {currentUsers.map((user) => (
                                <IonItem key={user.id} className="admin-users-item" lines='inset'>
                                    <IonLabel>
                                        <h2 className="admin-users-name">{user.name}</h2>
                                        <p className="admin-users-email">{user.email}</p>
                                        <p className="admin-users-role">{user.role}</p>
                                    </IonLabel>
                                    <IonButtons>
                                        <IonButton className="admin-users-btn-detail" onClick={() => goToDetailUser(user.id)}>
                                            <IonIcon icon={eyeOutline} />
                                        </IonButton>
                                        <IonButton className="admin-users-btn-edit" onClick={() => goToEditUser(user.id)}>
                                            <IonIcon icon={pencilOutline} />
                                        </IonButton>
                                        <IonButton
                                            className={`admin-users-btn-status ${user.isActive ? 'active' : 'inactive'}`}
                                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                                        >
                                            <IonIcon icon={user.isActive ? personRemoveOutline : refreshOutline} />
                                        </IonButton>
                                    </IonButtons>
                                    
                                </IonItem>
                            ))}
                        </IonList>
                    </>
                )}
            </div>
            {(totalPages > 1 && !loading) && (
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
            
            {!loading&& (
                <IonFab vertical="bottom" slot="fixed" className="admin-users-fab">
                        <IonFabButton onClick={goToAddUser}>
                            <IonIcon icon={personAddOutline} />
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

