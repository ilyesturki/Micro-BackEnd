import {
    Table,
    Model,
    Column,
    ForeignKey,
    BelongsTo
  } from "sequelize-typescript";
  import Parking from "./Parking";
  
  @Table
  class ParkingSpot extends Model {
    @Column
    spotNumber!: string;
  
    @Column
    sensorField!: string;
  
    @Column
    status!: string;
  
    @ForeignKey(() => Parking)
    @Column
    parkingId!: number;
  
    @BelongsTo(() => Parking)
    parking!: Parking;
  }
  
  export default ParkingSpot;