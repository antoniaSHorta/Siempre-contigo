import { IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle, IonTitle, IonToolbar } from "@ionic/react"
import { book, medkit, restaurant, chatbubbles, home } from "ionicons/icons"


const SideMenu: React.FC = () => {
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
                <IonItem routerLink="/app/home" routerDirection="none">
                    <IonIcon slot="start" icon={home} />
                    <IonLabel>Home</IonLabel>
                </IonItem>
                </IonMenuToggle>
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
                </IonMenuToggle>
            </IonList>
            </IonContent>
        </IonMenu>
    )
}

export default SideMenu;