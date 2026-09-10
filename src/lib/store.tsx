"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { districtConnectivity, scoreAll, weatherFor } from "./ai-engine";
import { CORRIDORS, SEED_VEHICLES } from "./ner-data";
import { clearQueue, loadQueue, pushQueue } from "./offline";
import type { AlertItem, Incident, Lang, Role, Vehicle } from "./types";

interface Store {
  hour: number;
  vehicles: Vehicle[];
  incidents: Incident[];
  alerts: AlertItem[];
  lang: Lang;
  role: Role;
  setLang: (l: Lang) => void;
  setRole: (r: Role) => void;
  addIncident: (i: Incident, offline?: boolean) => void;
  syncOffline: () => number;
  offlineCount: number;
}

const Ctx = createContext<Store | null>(null);

const SEED_INCIDENTS: Incident[] = [
  {
    id: "i1",
    type: "landslide",
    title: "Debris on NH-13 near Sela",
    districtId: "tawang",
    lat: 27.5,
    lng: 92.05,
    severity: "critical",
    description: "Single-lane blockage after overnight slide. Relief convoy halted.",
    reporter: "BRO field unit",
    at: new Date(Date.now() - 3600_000).toISOString(),
    synced: true,
  },
  {
    id: "i2",
    type: "flood",
    title: "Brahmaputra embankment overflow",
    districtId: "dibrugarh",
    lat: 27.4,
    lng: 94.85,
    severity: "high",
    description: "NH-27 shoulder inundated. Trucks diverted via Jorhat feeder.",
    reporter: "PWD Assam",
    at: new Date(Date.now() - 7200_000).toISOString(),
    synced: true,
  },
  {
    id: "i3",
    type: "rainfall",
    title: "Cloudburst, East Khasi Hills",
    districtId: "eastkhasi",
    lat: 25.55,
    lng: 91.88,
    severity: "moderate",
    description: "Low visibility on Guwahati–Shillong stretch.",
    reporter: "Meghalaya Police",
    at: new Date(Date.now() - 1800_000).toISOString(),
    synced: true,
  },
];

function buildAlerts(vehicles: Vehicle[], incidents: Incident[], hour: number): AlertItem[] {
  const items: AlertItem[] = [];
  for (const i of incidents.slice(0, 8)) {
    items.push({
      id: `a-${i.id}`,
      kind: i.type === "landslide" || i.type === "road_damage" ? "blocked" : i.type === "flood" ? "inaccessible" : "weather",
      title: i.title,
      message: i.description,
      severity: i.severity,
      at: i.at,
      districtId: i.districtId,
    });
  }
  for (const v of vehicles.filter((v) => v.delayed || v.status === "halted")) {
    items.push({
      id: `av-${v.id}`,
      kind: "delay",
      title: `${v.callsign} delayed`,
      message: `${v.cargo} shipment ETA ${v.etaHours.toFixed(1)}h · status ${v.status}`,
      severity: v.status === "halted" ? "critical" : "high",
      at: new Date().toISOString(),
    });
  }
  const risky = CORRIDORS.filter((c) => weatherFor(c.id, hour).rainfallMm > 40).slice(0, 3);
  for (const c of risky) {
    items.push({
      id: `w-${c.id}-${hour}`,
      kind: "corridor",
      title: `High-risk corridor: ${c.name}`,
      message: `${weatherFor(c.id, hour).rainfallMm.toFixed(0)} mm rainfall proxy · landslide/flood watch`,
      severity: "high",
      at: new Date().toISOString(),
      corridorId: c.id,
    });
  }
  return items.sort((a, b) => (a.severity === "critical" ? -1 : 1)).slice(0, 12);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hour, setHour] = useState(14);
  const [vehicles, setVehicles] = useState(SEED_VEHICLES);
  const [incidents, setIncidents] = useState(SEED_INCIDENTS);
  const [lang, setLang] = useState<Lang>("en");
  const [role, setRole] = useState<Role>("command");
  const [offlineCount, setOfflineCount] = useState(0);

  useEffect(() => {
    setOfflineCount(loadQueue().length);
    const t = setInterval(() => {
      setHour((h) => (h + 1) % 24);
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.status === "arrived") return v;
          const bump = v.status === "halted" ? 0 : 0.012 + Math.random() * 0.01;
          const progress = Math.min(1, v.progress + bump);
          const delayed = v.delayed || Math.random() < 0.02;
          return {
            ...v,
            progress,
            etaHours: Math.max(0.2, v.etaHours - 0.08),
            delayed,
            status: progress >= 1 ? "arrived" : v.status === "halted" ? "halted" : delayed ? "delayed" : "enroute",
          };
        }),
      );
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const addIncident = useCallback((i: Incident, offline?: boolean) => {
    if (offline) {
      pushQueue({ id: i.id, payload: i as unknown as Record<string, unknown>, createdAt: i.at });
      setOfflineCount(loadQueue().length);
      setIncidents((p) => [{ ...i, synced: false }, ...p]);
      return;
    }
    setIncidents((p) => [i, ...p]);
  }, []);

  const syncOffline = useCallback(() => {
    const n = loadQueue().length;
    setIncidents((p) => p.map((i) => ({ ...i, synced: true })));
    clearQueue();
    setOfflineCount(0);
    return n;
  }, []);

  const alerts = useMemo(() => buildAlerts(vehicles, incidents, hour), [vehicles, incidents, hour]);

  const value = useMemo(
    () => ({ hour, vehicles, incidents, alerts, lang, role, setLang, setRole, addIncident, syncOffline, offlineCount }),
    [hour, vehicles, incidents, alerts, lang, role, addIncident, syncOffline, offlineCount],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("store");
  return s;
}

export function useScores() {
  const { hour, incidents } = useStore();
  const congestion = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of CORRIDORS) m[c.id] = 0.15 + (c.id.charCodeAt(1) % 7) / 18 + (hour % 5) * 0.03;
    return m;
  }, [hour]);
  const scores = useMemo(() => scoreAll(hour, incidents, congestion), [hour, incidents, congestion]);
  const districts = useMemo(() => districtConnectivity(scores), [scores]);
  return { scores, districts, congestion };
}
