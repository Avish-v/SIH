# NER-LOGIX — SIH26002

AI-Based Smart Logistics and Accessibility Intelligence Platform for the North Eastern Region (NER)

**Organisation:** Ministry of Development of North Eastern Region (MDoNER)  
**Theme:** Transportation & Logistics · **Deadline:** 30 September 2026

## What this prototype demonstrates

| Requirement | Where it lives |
| --- | --- |
| Real-time road / bridge / corridor accessibility | GIS map + corridor list |
| Disruption prediction (landslide, flood, rain, damage, congestion) | `src/lib/ai-engine.ts` |
| Alternate routes and delay estimates | Route intelligence page |
| GPS tracking of essential cargo | Fleet page + live map markers |
| Automated alerts | Alerts + command overview |
| Geo-tagged field reports, photos, offline queue | Field reporting |
| District connectivity, bottlenecks, emergency paths | Analytics + overview |
| Multilingual notifications (EN / हिन्दी / অসমীয়া) | Top bar language switch |
| Cloud-ready APIs | `GET /api/risk` |

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo path for judges (4 minutes)

1. Landing → enter as **MDoNER command**.
2. Overview: KPIs, live dark GIS of 8 NER states, district connectivity.
3. GIS: colour-coded corridors (green / amber / red, dashed = blocked).
4. Route intelligence: Guwahati (Kamrup Metro) → Tawang. Show primary vs alternate.
5. Fleet: medicines / food / relief GPS tracks updating every few seconds.
6. Field: submit a landslide with photo and **low-network** checked, then **Sync offline queue**.
7. Switch language to हिन्दी or অসমীয়া.

## Architecture (SIH-ready, replaceable later)

- **Web console:** Next.js 15, TypeScript, Tailwind.
- **GIS:** Leaflet / Carto dark tiles (no paid map key).
- **AI engine:** explainable weighted model  
  `risk = rain + slope + landslide history + flood exposure + congestion + incidents`  
  plus corridor-graph search for alternates. Designed to swap rainfall with Open-Meteo / IMD and to train a tabular model on historic BRO / PWD incidents.
- **Offline:** `localStorage` report queue (PWA cache can be added next).
- **Integrations (stubs):** weather via engine hour-tick; `/api/risk` for government systems.

NER seed coverage: Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura — including remote districts (Tawang, Anjaw, Ukhrul, Mon, Lawngtlai, North Sikkim).

## Next 20 days (if you continue past the prototype)

1. Bind Open-Meteo + IMD nowcast for true rainfall.  
2. Ingest BHUVAN / NHAI / BRO shapefiles.  
3. Train gradient boosting on historic slide/flood labels.  
4. Add AIS-140 / VAHAN GPS adapters.  
5. PWA + SMS/IVR for truly offline districts.  
6. NIC / MDoNER SSO and role-based access.
