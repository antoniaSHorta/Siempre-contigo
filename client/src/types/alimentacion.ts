export interface AlimentacionInterface {
  id: number;
  tipo?: string;
  descripcion?: string;
  hora?: string;
  fecha_hora?: Date;
  residente_id?: number;
  cuidador_id?: number;
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

export type AlimentacionInput = Omit<
  AlimentacionInterface,
  'id' | 'residente' | 'cuidador'
>;