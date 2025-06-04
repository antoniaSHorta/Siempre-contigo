import { IActivity } from './IActivity';
import { IUser } from './IUser';

export interface IResident {
    id: number;
    nombre: string;
    nacimiento?: string; 
    estado_salud?: string;
    habitacion?: string;
    ingreso?: string;
    activo: boolean;
    actividades?: IActivity[]; 
    cuidadores?: IUser[];     
    familiares?: IUser[];     
}

