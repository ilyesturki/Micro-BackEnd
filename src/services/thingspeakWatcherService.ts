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
      if (!latestFeed) return;

      if (latestFeed.entry_id === lastEntryId) return;
      lastEntryId = latestFeed.entry_id;

      const dbSpots = await ParkingSpot.findAll();

      // ---------------------------
      // 1. Build active sensor map from ThingSpeak
      // ---------------------------
      const activeSensors = Object.entries(latestFeed)
        .filter(([key]) => key.startsWith("field"))
        .map(([field, value]) => ({
          sensorField: field,
          status: value === "1" ? "occupied" : "available",
        }));

      // ---------------------------
      // 2. DELETE spots not in ThingSpeak
      // ---------------------------
      for (const dbSpot of dbSpots) {
        const existsInFeed = activeSensors.find(
          (s) => s.sensorField === dbSpot.sensorField
        );

        if (!existsInFeed) {
          await dbSpot.destroy();
        }
      }

      // ---------------------------
      // 3. CREATE or UPDATE spots
      // ---------------------------
      for (const sensor of activeSensors) {
        let spot = dbSpots.find(
          (s) => s.sensorField === sensor.sensorField
        );

        // CREATE if missing
        if (!spot) {
          await ParkingSpot.create({
            spotNumber: sensor.sensorField.toUpperCase(),
            sensorField: sensor.sensorField,
            status: sensor.status,
          });

          continue;
        }

        // UPDATE if changed
        if (spot.status !== sensor.status) {
          spot.status = sensor.status;
          await spot.save();
        }
      }

      // ---------------------------
      // 4. Send updated state to frontend
      // ---------------------------
      const updatedSpots = await ParkingSpot.findAll();

      io.emit("parking-updated", updatedSpots);

      console.log("🚗 Parking fully synced with ThingSpeak");
    } catch (error) {
      console.error("Sync error:", error);
    }
  }, 15000);
};