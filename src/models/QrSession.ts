import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table
class QrSession extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  qrId!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt!: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  used!: boolean;
}

export default QrSession;