# MTA GTFS‑RT Viewer

A small Next.js application for viewing MTA GTFS‑Realtime trip updates. The app fetches GTFS‑RT trip updates via an internal API route and displays live trip, vehicle and stop information with search and a night mode.

## What it does
- Fetches GTFS‑RT trip update entities and renders them in a responsive list
- Expandable trip cards show stop sequences, arrival and departure times
- Search by route, trip ID, vehicle ID or stop ID
- Night mode toggle and last-fetched timestamp

## Key files
- `app/page.tsx` — client page that fetches `/api/gtfs/route` and renders the UI
- `app/components/Navbar.tsx` — search, night-mode toggle and last-fetched indicator
- `app/api/gtfs/route/route.tsx` — server API route returning the GTFS‑RT feed
- `app/globals.css` — global styles

## Prerequisites
- Node.js (16+ recommended)
- npm (or yarn/pnpm)

## Environment Variables
Create a `.env.local` file in the project root with:

```env
MTA_API_KEY=<your-mta-api-key>
MTA_GTFS_RT_FEED=https://gtfsrt.prod.obanyc.com/tripUpdates
```

- `MTA_API_KEY` — your MTA API key for authentication
- `MTA_GTFS_RT_FEED` — URL to the MTA GTFS-Realtime protobuf feed

## Install (PowerShell)
Open a PowerShell terminal and run:

```powershell
npm install
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Build & Production

```powershell
npm run build
npm start
```

## API
The client expects the GTFS feed data at:

- `GET /api/gtfs/route`

This route is implemented at `app/api/gtfs/route/route.tsx`. The frontend expects the response JSON to include an `entity` array of GTFS trip-update entities.

## Developer notes
- The UI uses utility-style CSS classes (Tailwind-style). Ensure Tailwind or equivalent is configured if you copy styles.
- `app/page.tsx` maps incoming feed entities into a `TripUpdate` shape and refreshes every 30 seconds.
- Trip uniqueness in the UI is determined by the composite key: `` `${trip.tripId}-${trip.vehicleId}-${trip.timestamp}` ``.

## Improvements / Next steps
- Resolve `stopId` to human-readable stop names by adding a GTFS static `stops.txt` parser or lookup table.
- Add per-route filtering, sorting by delay, and persistent user preferences (e.g., save night mode to `localStorage`).
- Add tests for API route response parsing and UI components.

## Troubleshooting
- If the client shows "No trips found", check browser devtools network tab for `GET /api/gtfs/route` and inspect the returned JSON.
- If styling appears missing, ensure PostCSS/Tailwind are installed and configured (see `postcss.config.mjs`).

## License
This project is licensed under the MIT License — see the `LICENSE` file for details.



