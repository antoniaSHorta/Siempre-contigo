import { Table, Column, Model, DataType, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import bcrypt from 'bcryptjs';

@Table({
  tableName: 'usuarios',
  timestamps: true,
})
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'nombre'
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
    field: 'correo',
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'contrasena'
  })
  password!: string;

  @Column({
    type: DataType.ENUM('Admin', 'Cuidador', 'Familiar'),
    defaultValue: 'Familiar',
    field: 'rol'
  })
  role!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'telefono'
  })
  phone?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'direccion'
  })
  location?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: 'activo',
  })
  isActive!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'conectado',
  })
  isConnected!: boolean;

  @Column({
    type: DataType.STRING,
    field: 'fire_base_token',
  })
  fire_base_token!: string;

  @BeforeCreate
  static async hashPasswordBeforeCreate(instance: User) {
    if (instance.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  @BeforeUpdate
  static async hashPasswordBeforeUpdate(instance: User) {
    if (instance.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
} 