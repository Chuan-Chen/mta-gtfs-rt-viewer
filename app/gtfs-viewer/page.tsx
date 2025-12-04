"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Vehicle {
  id: string;
  routeId?: string;
  latitude?: number;
  longitude?: number;
}

export default function GTFSViewer() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const res = await axios.get("/api/gtfs/route");

        // Make sure data is an array
        const entities = Array.isArray(res.data) ? res.data : [];

        const vehicleData = entities
          .filter((e: any) => e.vehicle)
          .map((e: any) => ({
            id: e.id,
            routeId: e.vehicle.trip?.routeId,
            latitude: e.vehicle.position?.latitude,
            longitude: e.vehicle.position?.longitude,
          }));

        setVehicles(vehicleData);
      } catch (err) {
        console.error("Error fetching GTFS data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();

    // Optional: refresh every 15s
    const interval = setInterval(fetchVehicles, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-center mt-10">Loading GTFS data...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">MTA GTFS-RT Vehicles</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Route</th>
              <th className="px-4 py-2 border">Latitude</th>
              <th className="px-4 py-2 border">Longitude</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{v.id}</td>
                <td className="px-4 py-2 border">{v.routeId || "N/A"}</td>
                <td className="px-4 py-2 border">{v.latitude?.toFixed(6)}</td>
                <td className="px-4 py-2 border">{v.longitude?.toFixed(6)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
