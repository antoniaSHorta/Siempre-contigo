import { IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle, IonTitle, IonToolbar } from "@ionic/react"
import { book, medkit, restaurant, chatbubbles, home, lockClosed, documentTextOutline } from "ionicons/icons"
import { useAuth } from "../contexts/AuthContext";


const SideMenu: React.FC = () => {
    const {isAdmin} = useAuth();
    return (
        <IonMenu 
            contentId="main-content" 
            menuId="sidenav" 
            type="overlay"
            >
                
            <IonHeader>
            <IonToolbar>
                <IonTitle>Menú</IonTitle>
            </IonToolbar>
            </IonHeader>
            <IonContent>
            <IonList>
                <IonMenuToggle autoHide={false}>
                <IonItem routerLink="/app/agenda" routerDirection="none">
                    <IonIcon slot="start" icon={book} />
                    <IonLabel>Agenda</IonLabel>
                </IonItem>
                </IonMenuToggle>
                <IonMenuToggle autoHide={false}>
                <IonItem routerLink="/app/medicamentos" routerDirection="none">
                    <IonIcon slot="start" icon={medkit} />
                    <IonLabel>Medicamentos</IonLabel>
                </IonItem>
                </IonMenuToggle>
                <IonMenuToggle autoHide={false}>
                <IonItem routerLink="/app/alimentacion" routerDirection="none">
                    <IonIcon slot="start" icon={restaurant} />
                    <IonLabel>Alimentacion</IonLabel>
                </IonItem>
                </IonMenuToggle>
                <IonMenuToggle autoHide={false}>
                <IonItem routerLink="/app/chat" routerDirection="none">
                    <IonIcon slot="start" icon={chatbubbles} />
                    <IonLabel>Chat</IonLabel>
                </IonItem>
                <IonItem routerLink="/app/reports/residents" routerDirection="none">
                    <IonIcon slot="start" icon={documentTextOutline} />
                    <IonLabel>Reportes</IonLabel>
                </IonItem>
                {isAdmin &&(
                    <IonItem routerLink="/app/admin" routerDirection="none">
                        <IonIcon slot="start" icon={lockClosed} />
                        <IonLabel>Admin</IonLabel>
                    </IonItem>
                )}
                </IonMenuToggle>
            </IonList>
            </IonContent>
        </IonMenu>
    )
}

export default SideMenu;