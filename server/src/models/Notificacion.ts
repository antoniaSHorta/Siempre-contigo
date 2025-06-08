import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import { User } from './User';
import { NotificacionUser } from './NotificacionUser';

@Table({
  tableName: 'notificaciones',
  timestamps: false,
})
export class Notificacion extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  fecha_envio!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  fecha_programada!: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  titulo!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  contenido!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  schedule_id!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  leida!: boolean;

  @BelongsToMany(() => User, () => NotificacionUser)
  destinatarios!: User[];
}