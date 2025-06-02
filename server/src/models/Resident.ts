import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Activity } from './Activity';

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
} 