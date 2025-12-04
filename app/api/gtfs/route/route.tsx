import { NextResponse } from "next/server";
import axios from "axios";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";

export async function GET() {
  const feedUrl = process.env.MTA_GTFS_RT_FEED!;
  const apiKey = process.env.MTA_API_KEY!;

  try {
    const response = await axios.get(feedUrl, {
      responseType: "arraybuffer",
      headers: { "x-api-key": apiKey },
    });

    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(response.data)
    );

    // Ensure always return an array
    const entities = feed.entity ?? [];
    return NextResponse.json(entities);
  } catch (error) {
    console.error("GTFS API fetch error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
