import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";
import User from "./User";

@Table({ tableName: "notifications", timestamps: true })
class Notification extends Model {
  @PrimaryKey 
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.TEXT)
  message!: string;

  @Column(DataType.STRING)
  sender!: string;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number; 


  @Default("unread")
  @Column(DataType.ENUM("unread", "read"))
  status!: "unread" | "read";

  @Column(DataType.ENUM("High", "Medium", "Low"))
  priority!: "High" | "Medium" | "Low";

  @Column(DataType.STRING)
  actionLink!: string;

  @BelongsTo(() => User)
  user!: User;
}

export default Notification;
