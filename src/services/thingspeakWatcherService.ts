import { Server as SocketIOServer } from "socket.io";
import { getLatestThingSpeakData } from "./thingspeakService";
import ParkingSpot from "../models/ParkingSpot";

let lastEntryId: number | null = null;

export const startThingSpeakWatcher = (io: SocketIOServer) => {
  setInterval(async () => {
    try {
      const data = await getLatestThingSpeakData();
      console.log(data);
      if (!data) return;

      const latestFeed = data.feeds?.[data.feeds.length - 1];
      console.log(latestFeed);
      if (!latestFeed) return;

      // if (latestFeed.entry_id === lastEntryId) return;
      lastEntryId = latestFeed.entry_id;
      console.log(lastEntryId);
      // ONLY ONE SENSOR
      const sensorValue = latestFeed.field1;
      console.log(sensorValue);
      if (sensorValue === undefined) return;

      const newStatus =
        sensorValue === "1" ? "occupied" : "available";

      // assume only one spot in DB
      let spot = await ParkingSpot.findOne({
        where: { sensorField: "field1" },
      });

      // CREATE if not exists
      if (!spot) {
        spot = await ParkingSpot.create({
          spotNumber: "A1",
          sensorField: "field1",
          status: newStatus,
        });
      }

      // UPDATE if changed
      if (spot.status !== newStatus) {
        spot.status = newStatus;
        await spot.save();
      }

      const updatedSpots = await ParkingSpot.findAll();
      console.log(updatedSpots);
      io.emit("parking-updated", updatedSpots);

      console.log("🚗 Single spot updated");
    } catch (error) {
      console.error("Sync error:", error);
    }
  }, 15000);
};