"use client";

import { CORRIDORS, DISTRICTS, pointOnPath } from "@/lib/ner-data";
import { useScores, useStore } from "@/lib/store";
import type { RiskLevel } from "@/lib/types";
import { MapContainer, Polyline, CircleMarker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const COLORS: Record<RiskLevel, string> = {
  low: "#3dcc9a",
  moderate: "#e2b15a",
  high: "#ef8f4a",
  critical: "#ff6b5a",
};

export default function MapView({ height = "100%" }: { height?: string }) {
  const { vehicles, incidents } = useStore();
  const { scores } = useScores();

  return (
    <div className="map-root overflow-hidden rounded-xl" style={{ height }}>
      <MapContainer center={[26.2, 93.2]} zoom={6} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {CORRIDORS.map((c) => {
          const s = scores.find((x) => x.corridorId === c.id);
          const color = s ? COLORS[s.level] : "#888";
          return (
            <Polyline
              key={c.id}
              positions={c.path}
              pathOptions={{ color, weight: s && !s.accessible ? 7 : 4, opacity: 0.9, dashArray: s && !s.accessible ? "6 8" : undefined }}
            >
              <Popup>
                <strong>{c.name}</strong>
                <div>{c.nh}</div>
                <div>Risk {Math.round((s?.risk ?? 0) * 100)}% · {s?.level}</div>
                <div>Delay +{s?.delayHours}h</div>
                <div>{s?.accessible ? "Open" : "Not accessible"}</div>
              </Popup>
            </Polyline>
          );
        })}
        {DISTRICTS.map((d) => (
          <CircleMarker key={d.id} center={[d.lat, d.lng]} radius={d.remote ? 7 : 9} pathOptions={{ color: d.remote ? "#e2b15a" : "#3dcc9a", fillOpacity: 0.8 }}>
            <Popup>
              {d.name}, {d.state}
              {d.remote ? " · remote" : ""}
            </Popup>
          </CircleMarker>
        ))}
        {vehicles.map((v) => {
          const c = CORRIDORS.find((x) => x.id === v.corridorId);
          if (!c) return null;
          const [lat, lng] = pointOnPath(c.path, v.progress);
          return (
            <CircleMarker key={v.id} center={[lat, lng]} radius={6} pathOptions={{ color: "#fff", fillColor: "#5b9dff", fillOpacity: 1 }}>
              <Popup>
                {v.callsign} · {v.cargo}
                <div>{v.status} · ETA {v.etaHours.toFixed(1)}h</div>
              </Popup>
            </CircleMarker>
          );
        })}
        {incidents.map((i) => (
          <CircleMarker key={i.id} center={[i.lat, i.lng]} radius={8} pathOptions={{ color: COLORS[i.severity], fillOpacity: 0.35 }}>
            <Popup>
              <strong>{i.title}</strong>
              <div>{i.type} · {i.severity}</div>
              <div>{i.description}</div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
