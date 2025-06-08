import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { User } from './User';
import { Notificacion } from './Notificacion';

@Table({
  tableName: 'notificacion_user',
  timestamps: false,
})
export class NotificacionUser extends Model {
  @ForeignKey(() => Notificacion)
  @Column
  notificacion_id!: number;

  @ForeignKey(() => User)
  @Column
  user_id!: number;
}