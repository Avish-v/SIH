"use client";

import { useState } from "react";
import { CORRIDORS, DISTRICTS, pointOnPath } from "@/lib/ner-data";
import { useScores, useStore } from "@/lib/store";
import type { RiskLevel } from "@/lib/types";
import { MapContainer, Polyline, CircleMarker, Popup, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type MapLayer = "satellite" | "street" | "terrain";

const MAP_LAYERS: Record<MapLayer, { label: string; url: string; attribution: string }> = {
  satellite: {
    label: "Satellite View",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
  },
  street: {
    label: "Street Map",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  terrain: {
    label: "Terrain Map",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri — Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), TomTom, 2012",
  },
};

const COLORS: Record<RiskLevel, string> = {
  low: "#3dcc9a",
  moderate: "#e2b15a",
  high: "#ef8f4a",
  critical: "#ff6b5a",
};

export default function MapView({ height = "100%" }: { height?: string }) {
  const { vehicles, incidents } = useStore();
  const { scores } = useScores();
  const [activeLayer, setActiveLayer] = useState<MapLayer>("satellite");
  const [tileError, setTileError] = useState(false);
  const layer = MAP_LAYERS[activeLayer];

  const changeLayer = (nextLayer: MapLayer) => {
    setTileError(false);
    setActiveLayer(nextLayer);
  };

  const handleTileError = () => {
    setTileError(true);
    if (activeLayer !== "street") {
      setActiveLayer("street");
    }
  };

  return (
    <div className="map-root overflow-hidden rounded-xl" style={{ height }}>
      <div className="map-layer-control">
        <label htmlFor="map-layer">Map layer</label>
        <select id="map-layer" value={activeLayer} onChange={(event) => changeLayer(event.target.value as MapLayer)}>
          {Object.entries(MAP_LAYERS).map(([value, option]) => (
            <option key={value} value={value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {tileError && (
        <div className="map-tile-status" role="status">
          Map tiles unavailable. Showing Street Map.
        </div>
      )}
      <MapContainer center={[26.2, 93.2]} zoom={6} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          key={activeLayer}
          attribution={layer.attribution}
          className={activeLayer === "satellite" ? "map-tiles-satellite" : "map-tiles"}
          eventHandlers={{ tileerror: handleTileError }}
          url={layer.url}
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
            <Tooltip permanent direction="top" offset={[0, -8]} className="map-place-label">
              {d.name}
            </Tooltip>
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
