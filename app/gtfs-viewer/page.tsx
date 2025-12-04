"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface StopTimeUpdate {
  stopSequence: number;
  stopId: string;
  arrivalTime: string;
  departureTime: string;
}

interface TripUpdate {
  id: string;
  tripId: string;
  routeId: string;
  directionId?: number;
  vehicleId: string;
  delay: number;
  timestamp: string;
  stopTimeUpdates: StopTimeUpdate[];
}

const formatTime = (epoch: string) => {
  const t = parseInt(epoch, 10);
  if (isNaN(t)) return "N/A";
  return new Date(t * 1000).toLocaleString();
};

export default function GTFSViewer() {
  const [tripUpdates, setTripUpdates] = useState<TripUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTripIds, setExpandedTripIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [nightMode, setNightMode] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchTripUpdates() {
      try {
        const res = await axios.get("/api/gtfs/route");
        const entities = Array.isArray(res.data) ? res.data : [];

        const updates: TripUpdate[] = entities
          .filter((e: any) => e.tripUpdate)
          .map((e: any) => ({
            id: e.id,
            tripId: e.tripUpdate.trip?.tripId || "N/A",
            routeId: e.tripUpdate.trip?.routeId || "N/A",
            directionId: e.tripUpdate.trip?.directionId,
            vehicleId: e.tripUpdate.vehicle?.id || "N/A",
            delay: e.tripUpdate.delay ?? 0,
            timestamp: e.tripUpdate.timestamp ?? "0",
            stopTimeUpdates: (e.tripUpdate.stopTimeUpdate ?? []).map((s: any) => ({
              stopSequence: s.stopSequence,
              stopId: s.stopId,
              arrivalTime: s.arrival?.time || "N/A",
              departureTime: s.departure?.time || "N/A",
            })),
          }));

        setTripUpdates(updates);
        setLastFetched(new Date()); // update last fetched time
      } catch (err) {
        console.error("Error fetching trip updates:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTripUpdates();
    const interval = setInterval(fetchTripUpdates, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const toggleTrip = (uniqueId: string) => {
    const newSet = new Set(expandedTripIds);
    if (newSet.has(uniqueId)) newSet.delete(uniqueId);
    else newSet.add(uniqueId);
    setExpandedTripIds(newSet);
  };

  const filteredTrips = tripUpdates.filter((trip) => {
    const term = searchTerm.toLowerCase();
    return (
      trip.routeId.toLowerCase().includes(term) ||
      trip.tripId.toLowerCase().includes(term) ||
      trip.vehicleId.toLowerCase().includes(term) ||
      trip.stopTimeUpdates.some((st) => st.stopId.toLowerCase().includes(term))
    );
  });

  return (
    <div
      className={`${
        nightMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      } p-6 min-h-screen transition-colors duration-300`}
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-center flex-1">
          GTFS-Realtime Trip Viewer
        </h1>
        <button
          className={`ml-4 px-4 py-2 rounded-lg border ${
            nightMode
              ? "border-gray-700 bg-gray-800 hover:bg-gray-700"
              : "border-gray-300 bg-white hover:bg-gray-200"
          } transition-colors`}
          onClick={() => setNightMode(!nightMode)}
        >
          {nightMode ? "Light Mode" : "Night Mode"}
        </button>
      </div>

      {/* Last Fetched */}
      <div className="mb-4 text-center text-sm text-gray-500">
        {lastFetched
          ? `Last fetched: ${lastFetched.toLocaleString()}`
          : "Fetching data..."}
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search by route, trip ID, vehicle ID, or stop ID..."
          className={`w-full max-w-lg px-4 py-2 rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            nightMode
              ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400"
              : "border-gray-300 bg-white text-black placeholder-gray-500"
          }`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <p className="text-center text-gray-500">Loading GTFS trip updates...</p>}

      {filteredTrips.map((trip) => {
        const uniqueId = `${trip.tripId}-${trip.vehicleId}-${trip.timestamp}`;
        const isExpanded = expandedTripIds.has(uniqueId);
        const direction =
          trip.directionId === 0 ? "Outbound" : trip.directionId === 1 ? "Inbound" : "N/A";

        return (
          <div
            key={uniqueId}
            className={`${
              nightMode ? "bg-gray-800 text-white" : "bg-white text-black"
            } trip-card p-6 mb-4 rounded-lg shadow flex flex-col transition-colors`}
          >
            <div
              className="trip-header flex justify-between cursor-pointer"
              onClick={() => toggleTrip(uniqueId)}
            >
              <div className="space-y-1">
                <div className="font-bold text-lg">
                  Route <span className="text-blue-400">{trip.routeId}</span> — {direction}
                </div>
                <div className="text-sm text-gray-400">{`Trip ID: ${trip.tripId}`}</div>
                <div className="text-sm text-gray-400">{`Vehicle: ${trip.vehicleId}`}</div>
                <div className="text-sm text-red-500 font-semibold">{`Delay: ${trip.delay} sec`}</div>
                <div className="text-sm text-gray-500">{`Feed Timestamp: ${formatTime(
                  trip.timestamp
                )}`}</div>
              </div>
              <div className="text-2xl select-none">{isExpanded ? "–" : "+"}</div>
            </div>

            {isExpanded && (
              <div className="trip-content mt-4 overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className={`${nightMode ? "bg-gray-700" : "bg-gray-100"}`}>
                      <th className="px-4 py-2 border">#</th>
                      <th className="px-4 py-2 border">Stop ID</th>
                      <th className="px-4 py-2 border">Arrival</th>
                      <th className="px-4 py-2 border">Departure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trip.stopTimeUpdates.map((st) => (
                      <tr
                        key={`${uniqueId}-${st.stopSequence}`}
                        className={`odd:${
                          nightMode ? "bg-gray-800" : "bg-white"
                        } even:${nightMode ? "bg-gray-700" : "bg-gray-50"} hover:${
                          nightMode ? "bg-gray-600" : "bg-gray-100"
                        }`}
                      >
                        <td className="px-4 py-2 border">{st.stopSequence}</td>
                        <td className="px-4 py-2 border">{st.stopId}</td>
                        <td className="px-4 py-2 border">{formatTime(st.arrivalTime)}</td>
                        <td className="px-4 py-2 border">{formatTime(st.departureTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {filteredTrips.length === 0 && !loading && (
        <p className="text-center text-gray-500">No trips found.</p>
      )}
    </div>
  );
}
