import {
    Table,
    Model,
    Column,
    HasMany
  } from "sequelize-typescript";
  import ParkingSpot from "./ParkingSpot";
  
  @Table
  class Parking extends Model {
    @Column
    name!: string;
  
    @Column
    location!: string;
  
    @HasMany(() => ParkingSpot)
    spots!: ParkingSpot[];
  }
  
  export default Parking;