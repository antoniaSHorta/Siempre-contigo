import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Resident } from './Resident';

@Table({
  tableName: 'actividad',
  timestamps: true,
})
export class Activity extends Model {
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
  titulo!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  descripcion?: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  fecha!: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  lugar!: string;

  @Column({
    type: DataType.ENUM('Pendiente', 'En Progreso', 'Completado', 'Incompleto'),
    allowNull: false,
    defaultValue: 'Incompleto',
  })
  estado!: string;

  @Column({
    type: DataType.ENUM('Medicamento', 'Terapia', 'Recreacional', 'Paseo', 'Ejercicio', 'Cita'),
    allowNull: false,
  })
  tipo!: string;

  @ForeignKey(() => Resident)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  residente_id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  cuidador_id!: number;

  @BelongsTo(() => Resident)
  residente!: Resident;

  @BelongsTo(() => User)
  cuidador!: User;
} 