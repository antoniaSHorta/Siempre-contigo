import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { Resident } from './Resident';
import { User } from './User';

@Table({
  tableName: 'residentes_familiares',
  timestamps: false,
})
export class ResidentesFamiliares extends Model {
  @ForeignKey(() => Resident)
  @Column
  residente_id!: number;

  @ForeignKey(() => User)
  @Column
  familiar_id!: number;
}
