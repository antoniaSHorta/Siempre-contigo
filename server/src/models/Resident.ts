import { Table, Column, Model, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';
import { Activity } from './Activity';
import { User } from './User';
import { ResidentesCuidadores } from './ResidentesCuidadores';
import { ResidentesFamiliares } from './ResidentesFamiliares';

@Table({
  tableName: 'residentes',
  timestamps: true,
})
export class Resident extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nombre!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  nacimiento?: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  estado_salud?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  habitacion?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  ingreso?: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  activo!: boolean;

  @HasMany(() => Activity)
  actividades!: Activity[];

  @BelongsToMany(() => User, () => ResidentesCuidadores)
  cuidadores!: User[];

  @BelongsToMany(() => User, () => ResidentesFamiliares)
  familiares!: User[];
} 