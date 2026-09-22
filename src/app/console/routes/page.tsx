"use client";

import { api } from "@/lib/api";
import { DISTRICTS } from "@/lib/ner-data";
import { useCallback, useEffect, useState } from "react";

type OptimisedRoute = { id: string; label: string; estimated_travel_hours: number; risk_score: number; distance_km: number; accessibility_score: number; overall_route_score: number; data_source: string };
type RouteResponse = { options: OptimisedRoute[]; disclaimer: string };

export default function RoutesPage() {
  const [from, setFrom] = useState("kamrup");
  const [to, setTo] = useState("tawang");
  const [options, setOptions] = useState<OptimisedRoute[]>([]);
  const [status, setStatus] = useState("Loading route recommendation…");
  const [loading, setLoading] = useState(false);

  const optimise = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api<RouteResponse>("/routes/optimize", { method: "POST", body: JSON.stringify({ origin: from, destination: to, vehicle_type: "high_clearance_truck", delivery_priority: "EMERGENCY", weather_conditions: "demo", risk_tolerance: "low" }) });
      setOptions(result.options);
      setStatus(result.disclaimer);
    } catch (error) {
      setOptions([]);
      setStatus(error instanceof Error ? error.message : "Unable to calculate route.");
    } finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { void optimise(); }, [optimise]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card p-5">
        <h2 className="text-lg font-medium">AI route prediction &amp; optimisation</h2>
        <p className="mt-1 text-sm text-[#8aa89a]">Calls the route optimisation API. It uses a clearly-labelled demo corridor graph until OSRM is configured.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-xs text-[#8aa89a]">Origin
            <select value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 w-full rounded-lg border border-[#1c3a32] bg-[#0d1f1a] p-2 text-sm text-white">{DISTRICTS.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}</select>
          </label>
          <label className="text-xs text-[#8aa89a]">Destination
            <select value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 w-full rounded-lg border border-[#1c3a32] bg-[#0d1f1a] p-2 text-sm text-white">{DISTRICTS.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}</select>
          </label>
        </div>
        <button onClick={() => void optimise()} disabled={loading} className="mt-4 rounded-lg bg-[#3dcc9a] px-4 py-2 text-sm font-medium text-[#07110f] disabled:opacity-60">{loading ? "Optimising…" : "Recalculate route"}</button>
        <p className="mt-3 text-xs text-[#e2b15a]">{status}</p>
      </div>
      <div className="space-y-3">
        {!loading && options.length === 0 && <div className="card p-5 text-sm text-[#8aa89a]">No connected path in the seeded demo corridor graph. Try Guwahati → Tawang, Silchar → Aizawl, or Agartala → Silchar.</div>}
        {options.map((option) => <div key={option.id} className="card p-4">
          <div className="flex items-center justify-between"><div className="font-medium">{option.label}</div><div className="text-xs uppercase text-[#e2b15a]">risk {option.risk_score}/100</div></div>
          <div className="mt-1 text-sm text-[#8aa89a]">{option.distance_km} km · ETA {option.estimated_travel_hours}h · accessibility {option.accessibility_score}/100</div>
          <div className="mt-2 text-xs text-[#8aa89a]">Overall route score {option.overall_route_score}/100 · {option.data_source}</div>
        </div>)}
      </div>
    </div>
  );
}
