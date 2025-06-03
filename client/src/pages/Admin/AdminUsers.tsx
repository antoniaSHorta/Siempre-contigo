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
    IonBackButton
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
import { getAllUsersAdmin, toggleStatusUser } from '../../services/adminService'; 
import { IUser } from '../../interfaces/IUser';
import './AdminUsers.css'

export const AdminUsers: React.FC = () => {
    const token = localStorage.getItem('token');
    const router = useIonRouter();
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const result = await getAllUsersAdmin(token!);
            const filteredUsers = result.users.filter(
                (user: IUser) => user.role === 'Familiar' || user.role === 'Cuidador'
            );
            setUsers(filteredUsers);
            setCurrentPage(1);
        } catch (err) {
            setToastMessage('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId: number, isActive: boolean) => {
        try {
        await toggleStatusUser(userId, token!, !isActive);
            setToastMessage(`Usuario ${!isActive ? 'activado' : 'desactivado'} correctamente`);
            fetchUsers();
        } catch (err) {
            setToastMessage('No se pudo actualizar el estado del usuario');
        }
    };

    const goToAddUser = () => router.push('/admin/users/add', 'forward');
    const goToEditUser = (id: number) => router.push(`/admin/users/edit/${id}`, 'forward');
    const goToDetailUser = (id: number) => router.push(`/admin/users/detail/${id}`, 'forward');

    const totalPages = Math.ceil(users.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    return (
        <IonPage className="admin-users-page">
            <IonHeader>
                <IonToolbar className="admin-users-toolbar">
                    <IonButtons slot="start">
                        <button className="admin-back-btn" onClick={() => router.push('/admin')}>
                            <IonIcon icon={chevronBackOutline} />
                        </button>
                    </IonButtons>
                    <IonTitle className="admin-users-title">Usuarios</IonTitle>
                </IonToolbar>
            </IonHeader>
            <div className="admin-users-content">
                {loading ? (
                    <p>Cargando usuarios...</p>
                ) : users.length === 0 ? (
                    <p className="admin-no-users-message">No hay usuarios con el rol Familiar o Cuidador.</p>
                ) : (
                    <>
                        <IonList className="admin-users-list">
                            {currentUsers.map((user) => (
                                <IonItem key={user.id} className="admin-users-item">
                                    <IonLabel>
                                        <h2 className="admin-users-name">{user.name}</h2>
                                        <p className="admin-users-email">{user.email}</p>
                                        <p className="admin-users-role">{user.role}</p>
                                    </IonLabel>
                                    <IonButtons slot="end">
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
                        <div className="admin-users-pagination-fixed">
                            <div className="admin-users-pagination">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="admin-users-pagination-btn"
                                >
                                    Anterior
                                </button>

                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNumber = index + 1;
                                    return (
                                        <button
                                            key={pageNumber}
                                            className={`admin-users-page-number ${currentPage === pageNumber ? 'active' : ''}`}
                                            onClick={() => setCurrentPage(pageNumber)}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}

                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="admin-users-pagination-btn"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    </>
                )}

                <IonFab vertical="bottom" horizontal="end" slot="fixed" className="admin-users-fab">
                    <IonFabButton onClick={goToAddUser}>
                        <IonIcon icon={personAddOutline} />
                    </IonFabButton>
                </IonFab>
            </div>

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

