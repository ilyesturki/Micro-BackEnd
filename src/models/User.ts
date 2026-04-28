import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  AllowNull,
  PrimaryKey,
  AutoIncrement,
  BeforeSave,
  HasMany,
  Index,
} from "sequelize-typescript";

@Table({
  tableName: "users",
  timestamps: true, 
  indexes: [
    {
      unique: true,
      fields: ["email"],
    },
  ],
})
class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;


  @AllowNull(false)
  @Column(DataType.STRING)
  firstName!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  lastName!: string;

  @AllowNull(false)
  @Index({ unique: true })
  @Column({
    type: DataType.STRING,
    validate: { isEmail: true },
  })
  set email(value: string) {
    this.setDataValue("email", value.toLowerCase());
  }
  get email(): string {
    return this.getDataValue("email");
  }

  @AllowNull(false)
  @Column(DataType.STRING)
  phone!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  image?: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    validate: {
      len: [8, 255],
    },
  })
  password?: string;


  @Default("pending")
  @AllowNull(false)
  @Column(DataType.ENUM("pending", "active", "inactive"))
  status!: "pending" | "active" | "inactive";

  @AllowNull(true)
  @Column(DataType.STRING)
  activationToken?: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  activationTokenExpires?: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  passwordChangedAt?: Date;

  @AllowNull(true)
  @Column(DataType.STRING)
  pwResetCode?: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  pwResetExpires?: Date;

  @Default(false)
  @Column(DataType.BOOLEAN)
  pwResetVerified!: boolean;

  @BeforeSave
  static setDefaultImage(instance: User) {
    if (!instance.image) {
      instance.image = "https://via.placeholder.com/150";
    }
  }

}

export interface UserType {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image?: string;
  password?: string;
  status: "pending" | "active" | "inactive";
  activationToken?: string;
  activationTokenExpires?: Date;
  passwordChangedAt?: Date;
}

export default User;
