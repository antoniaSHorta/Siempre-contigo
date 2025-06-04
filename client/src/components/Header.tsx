import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/react';
import './Header.css';
import logo from '../assets/logo.png';

interface CustomHeaderProps {
    title: string;
}

const Header: React.FC<CustomHeaderProps> = ({ title}) => {
    return (
        <IonHeader className="custom-header">
            <IonToolbar className="custom-toolbar">
                <div className="custom-header-content">
                    <img src={logo} alt="Logo" className="custom-header-logo" />
                    <IonTitle className="custom-header-title">{title}</IonTitle>
                </div>
            </IonToolbar>
        </IonHeader>
    );
};

export default Header;
