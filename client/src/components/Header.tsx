import { IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton } from "@ionic/react"
import logo from '../assets/logo.png';
import './Header.css';

interface HeaderProps {
  title: string;
  grayBackground?: boolean;
}

const Header:React.FC<HeaderProps> = ({ title,grayBackground }) =>{
    const toolbarClass = grayBackground ? 'custom-toolbar' : '';

    return(
        <>
        <div className="mish">
            <IonHeader className="ion-no-border">
                <IonToolbar className={toolbarClass}>
                <div className="header-content">
                    <img src={logo} alt="Logo" className="header-logo" />
                    <IonTitle className="header-title">{title}</IonTitle>
                </div>
                <IonButtons slot="end">
                    <IonMenuButton autoHide={false} />
                </IonButtons>
                </IonToolbar>
            </IonHeader>
        </div>
        </>
    )
}

export default Header;