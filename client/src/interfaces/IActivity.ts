
export type ActivityEstado = 
  'Pendiente' | 'En Progreso' | 'Completado' | 'Incompleto';

export type ActivityTipo = 
  'Medicamento' | 'Terapia' | 'Recreacional' | 'Paseo' |
  'Ejercicio' | 'Cita' | 'Alimentacion' | 'Videollamada';

export interface IActivity {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha: string; 
  lugar?: string;
  estado: ActivityEstado;
  tipo: ActivityTipo;
  residente_id: number;
  cuidador_id: number;
}