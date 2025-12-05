"use client";

interface NavbarProps {
  nightMode: boolean;
  setNightMode: (v: boolean) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  lastFetched: Date | null;
}

export default function Navbar({
  nightMode,
  setNightMode,
  searchTerm,
  setSearchTerm,
  lastFetched,
}: NavbarProps) {
  return (
    <nav
      className={`w-full p-4 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 rounded-lg transition-colors ${
        nightMode ? "bg-gray-800 text-white" : "bg-white text-black"
      }`}
    >
      {/* Left: Title */}
      <div className="text-2xl font-bold">
        GTFS-Realtime Viewer
      </div>

      {/* Middle: Search Box */}
      <div className="flex-1 md:px-6">
        <input
          type="text"
          placeholder="Search route, trip, vehicle, stop..."
          className={`w-full px-4 py-2 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            nightMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-gray-100 border-gray-300 text-black placeholder-gray-500"
          }`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Right: Controls */}
      <div className="flex flex-col items-end text-sm">
        <button
          onClick={() => setNightMode(!nightMode)}
          className={`px-4 py-2 rounded-md border transition-colors ${
            nightMode
              ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
              : "border-gray-300 bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {nightMode ? "Light Mode" : "Dark Mode"}
        </button>

        {/* Last Fetched */}
        <div className="mt-2 text-gray-400">
          {lastFetched
            ? `Updated: ${lastFetched.toLocaleString()}`
            : "Fetching…"}
        </div>
      </div>
    </nav>
  );
}
