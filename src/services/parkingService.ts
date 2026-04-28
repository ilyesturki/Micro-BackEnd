import factory from "./factoryService";
import ParkingSpot from "../models/ParkingSpot";


export const getParkingSpots = factory.getAll(ParkingSpot);