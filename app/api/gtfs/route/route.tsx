import { NextResponse } from "next/server";
import axios from "axios";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";

export async function GET() {
  const feedUrl = process.env.MTA_GTFS_RT_FEED!;

  const response = await axios.get(feedUrl, {
    responseType: "arraybuffer",
    headers: {
      "x-api-key": process.env.MTA_API_KEY!,
    },
  });

  const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
    new Uint8Array(response.data)
  );

  return NextResponse.json(feed);
}
