import { Table, Column, Model, DataType } from 'sequelize-typescript';

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
} 