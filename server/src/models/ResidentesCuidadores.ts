import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { Resident } from './Resident';
import { User } from './User';

@Table({
  tableName: 'residentes_cuidadores',
  timestamps: false,
})
export class ResidentesCuidadores extends Model {
  @ForeignKey(() => Resident)
  @Column
  residente_id!: number;

  @ForeignKey(() => User)
  @Column
  cuidador_id!: number;
}