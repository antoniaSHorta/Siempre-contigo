import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Resident } from './Resident';

@Table({
    tableName: 'reportes',
    timestamps: false,
})
export class Report extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id',
    })
    id!: number;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: 'fecha',
    })
    date?: Date;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'descripcion',
    })
    description?: string;

    @Column({
    type: DataType.BLOB('long'),
    allowNull: true,
    field: 'archivo_pdf',
    })
    pdf?: Buffer;

    @ForeignKey(() => Resident)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'residente_id',
    })
    residentId!: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'emisor_id',
    })
    senderId?: number;

    @BelongsTo(() => Resident, 'residentId')
    resident!: Resident;

    @BelongsTo(() => User, 'senderId')
    sender?: User;
}
