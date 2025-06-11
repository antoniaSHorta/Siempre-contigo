export interface Activity {
  id: number;
  fecha: Date;
  titulo: string;
  descripcion?: string;
  tipo: string;
  residente_id: number;
  lugar: string;
  estado: string;
  cuidador_id: number;
  residente?: {
    id: number;
    nombre: string;
  };
  cuidador?: {
    id: number;
    name: string;
  };
}

export type ActivityInput = Omit<Activity, 'id' | 'cuidador' | 'residente'>;

export const ACTIVITY_TYPES_FOR_CREATION = ['Terapia', 'Recreacional', 'Paseo', 'Ejercicio', 'Cita', 'Videollamada'] as const;
export const ACTIVITY_TYPES = ['Medicamento', 'Terapia', 'Recreacional', 'Paseo', 'Ejercicio', 'Cita', 'Alimentacion', 'Videollamada'] as const;
export const ACTIVITY_LOCATIONS = ['Hospital', 'Interno', 'Exterior', 'Gimnasio', 'Sala de estar'] as const;
export const ACTIVITY_STATUSES = ['Pendiente', 'En Progreso', 'Completado', 'Incompleto'] as const; 