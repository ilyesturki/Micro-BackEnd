import { Server as SocketIOServer } from "socket.io";
import { getLatestThingSpeakData } from "./thingspeakService";
import ParkingSpot from "../models/ParkingSpot";

let lastEntryId: number | null = null;

export const startThingSpeakWatcher = (io: SocketIOServer) => {
  setInterval(async () => {
    try {
      const data = await getLatestThingSpeakData();

      if (!data) return;

      if (data.entry_id === lastEntryId) return;

      lastEntryId = data.entry_id;

      const spots = await ParkingSpot.findAll();

      let hasChanges = false;

      for (const spot of spots) {
        const sensorValue = data[spot.sensorField];

        if (sensorValue === undefined) continue;

        const newStatus =
          sensorValue === "1" ? "occupied" : "available";

        if (spot.status !== newStatus) {
          spot.status = newStatus;
          await spot.save();
          hasChanges = true;
        }
      }

      if (hasChanges) {
        const updatedSpots = await ParkingSpot.findAll();

        io.emit("parking-updated", updatedSpots);

        console.log("Parking spots updated");
      }
    } catch (error) {
      console.error("Watcher error:", error);
    }
  }, 15000);
};