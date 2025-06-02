import React, { useState, useEffect } from 'react';
import { IonText } from '@ionic/react';
import './FechaWrapper.css';

interface FechaProps {
  fecha: Date;
}

const FechaWrapper: React.FC<FechaProps> = ({ fecha }) => {

    const [fechaFormateadaDisplay, setFechaFormateadaDisplay] = useState<string>('');
    
    const capitalizeFirstLetter = (str: string): string => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

  useEffect(() => {
    const opcionesFecha: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const diaSemana = capitalizeFirstLetter(fecha.toLocaleDateString('es-CL', { weekday: 'long' }));
    const diaMesAnio = fecha.toLocaleDateString('es-CL', { day: 'numeric'});
    const mes = capitalizeFirstLetter(fecha.toLocaleDateString('es-CL', { month: 'long' }));

    const fechaCompleta = `${diaSemana} ${diaMesAnio} de ${mes} de ${fecha.getFullYear()}`;
    setFechaFormateadaDisplay(fechaCompleta);
  }, [fecha]);

  return (
    <div className="fecha-content">
      <IonText color="dark">
        <p className="fecha-texto-fecha">{fechaFormateadaDisplay}</p>
      </IonText>
    </div>
  );
}

export default FechaWrapper;