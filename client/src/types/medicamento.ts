export interface MedicacionInterface {
  id: number;
  nombre: string;
  dosis: string;
  horario: string;
  fecha_hora: Date;
  estado: 'Pendiente' | 'Administrada' | 'Omitida';
  residente_id: number;
  cuidador_id: number;
  createdAt: Date;
  updatedAt: Date;
  residente?: {
    id: number;
    nombre: string;
  };
  cuidador?: {
    id: number;
    name: string;
  };
}

export type MedicacionInput = Omit<
  MedicacionInterface,
  'id' | 'residente' | 'cuidador' | 'createdAt' | 'updatedAt'
>;