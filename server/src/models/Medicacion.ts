import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Resident } from './Resident';

@Table({
  tableName: 'medicacion',
  timestamps: false,
})
export class Medicacion extends Model {
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
  nombre?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  dosis?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  horario?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  cuidador_id?: number;

  @ForeignKey(() => Resident)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  residente_id?: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  estado?: string;

  @BelongsTo(() => User, 'cuidador_id')
  cuidador?: User;

  @BelongsTo(() => Resident, 'residente_id')
  residente?: Resident;
} 