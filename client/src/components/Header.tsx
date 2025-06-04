import { IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton } from "@ionic/react"
import logo from '../assets/logo.png';
import './Header.css';

interface HeaderProps {
  title: string;
}

const Header:React.FC<HeaderProps> = ({ title }) =>{
    return(
        <>
        <IonHeader className="ion-no-border">
            <IonToolbar>
            <div className="header-content">
                <img src={logo} alt="Logo" className="header-logo" />
                <IonTitle className="header-title">{title}</IonTitle>
            </div>
            <IonButtons slot="end">
                <IonMenuButton autoHide={false} />
            </IonButtons>
            </IonToolbar>
        </IonHeader>
        </>
    )
}

export default Header;