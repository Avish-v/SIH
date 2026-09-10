"use client";

import { DISTRICTS } from "@/lib/ner-data";
import { suggestRoutes } from "@/lib/ai-engine";
import { useScores } from "@/lib/store";
import { useMemo, useState } from "react";

export default function RoutesPage() {
  const { scores } = useScores();
  const [from, setFrom] = useState("kamrup");
  const [to, setTo] = useState("tawang");
  const options = useMemo(() => suggestRoutes(from, to, scores), [from, to, scores]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card p-5">
        <h2 className="text-lg font-medium">AI route prediction &amp; optimisation</h2>
        <p className="mt-1 text-sm text-[#8aa89a]">
          Graph search over NER corridors weighted by rainfall, slope, landslide history, flood exposure, congestion and live incidents.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-xs text-[#8aa89a]">
            Origin
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-full rounded-lg border border-[#1c3a32] bg-[#0d1f1a] p-2 text-sm text-white">
              {DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-[#8aa89a]">
            Destination
            <select value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-full rounded-lg border border-[#1c3a32] bg-[#0d1f1a] p-2 text-sm text-white">
              {DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="space-y-3">
        {options.length === 0 && (
          <div className="card p-5 text-sm text-[#8aa89a]">
            No connected path in the seeded corridor graph. Try Guwahati → Tawang, Silchar → Aizawl, or Agartala → Silchar.
          </div>
        )}
        {options.map((o) => (
          <div key={o.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">{o.name}</div>
              <div className="text-xs uppercase text-[#e2b15a]">{o.level}</div>
            </div>
            <div className="mt-1 text-sm text-[#8aa89a]">{o.note} · risk {(o.risk * 100).toFixed(0)}%</div>
            <div className="mt-2 text-xs text-[#8aa89a]">{o.corridorIds.join(" → ")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
