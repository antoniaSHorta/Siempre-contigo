import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Resident } from './Resident';

@Table({
  tableName: 'alimentacion',
  timestamps: true,
})
export class Alimentacion extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  tipo?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  descripcion?: string;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  hora?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  fecha_hora?: Date;

  @ForeignKey(() => Resident)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  residente_id?: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  cuidador_id?: number;

  @BelongsTo(() => Resident)
  residente?: Resident;

  @BelongsTo(() => User)
  cuidador?: User;
} 