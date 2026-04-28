import axios from "axios";

const CHANNEL_ID = process.env.THINGSPEAK_CHANNEL_ID!;
const READ_API_KEY = process.env.THINGSPEAK_READ_API_KEY!;

interface ThingSpeakFeed {
  entry_id: number;
  created_at: string;
  [key: string]: any;
}

export const getLatestThingSpeakData = async (): Promise<ThingSpeakFeed | null> => {
  try {
    const url = `https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/1.json?api_key=${READ_API_KEY}&res`;
    // const url = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json`;

    const { data } = await axios.get(url);

    if (!data?.feeds?.length) return null;

    return data.feeds[0];
  } catch (error) {
    console.error("ThingSpeak fetch error:", error);
    return null;
  }
};