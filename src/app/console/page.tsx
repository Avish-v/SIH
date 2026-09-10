"use client";

import { MapCanvas } from "@/components/MapCanvas";
import { DISTRICTS } from "@/lib/ner-data";
import { useScores, useStore } from "@/lib/store";
import { AlertTriangle, MapPinned, Truck, Wifi } from "lucide-react";

const LEVEL_COLOR: Record<string, string> = {
  low: "text-[#3dcc9a]",
  moderate: "text-[#e2b15a]",
  high: "text-[#ef8f4a]",
  critical: "text-[#ff6b5a]",
};

export default function OverviewPage() {
  const { vehicles, incidents, alerts } = useStore();
  const { scores, districts } = useScores();
  const blocked = scores.filter((s) => !s.accessible).length;
  const remoteDown = districts.filter((d) => d.district.remote && !d.accessible).length;
  const delayed = vehicles.filter((v) => v.delayed || v.status === "halted").length;

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-4">
        {[
          [MapPinned, "Districts monitored", String(DISTRICTS.length), "8 NER states"],
          [AlertTriangle, "Corridors not accessible", String(blocked), `${scores.filter((s) => s.level === "critical").length} critical`],
          [Truck, "Delayed essential loads", String(delayed), `${vehicles.length} GPS tracks`],
          [Wifi, "Remote pockets cut off", String(remoteDown), `${incidents.length} field incidents`],
        ].map(([Icon, label, val, sub]) => (
          <div key={String(label)} className="card kpi">
            <div className="flex items-center gap-2 text-xs text-[#8aa89a]">
              <Icon className="h-4 w-4 text-[#e2b15a]" /> {label as string}
            </div>
            <div className="mt-2 text-3xl font-semibold">{val as string}</div>
            <div className="text-xs text-[#8aa89a]">{sub as string}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="card overflow-hidden lg:col-span-3" style={{ height: 420 }}>
          <MapCanvas height="420px" />
        </div>
        <div className="card flex max-h-[420px] flex-col overflow-hidden p-4 lg:col-span-2">
          <div className="mb-3 text-sm font-medium">Priority alerts</div>
          <div className="space-y-2 overflow-auto">
            {alerts.slice(0, 8).map((a) => (
              <div key={a.id} className="rounded-lg border border-[#1c3a32] p-2">
                <div className={`text-xs ${LEVEL_COLOR[a.severity]}`}>{a.kind} · {a.severity}</div>
                <div className="text-sm">{a.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card p-4">
        <div className="mb-3 text-sm font-medium">District-wise connectivity</div>
        <div className="grid gap-2 md:grid-cols-4">
          {districts.map((d) => (
            <div key={d.district.id} className="rounded-lg border border-[#1c3a32] p-3">
              <div className="flex justify-between text-sm">
                <span>{d.district.name}</span>
                <span className={LEVEL_COLOR[d.level]}>{d.accessible ? "open" : "gap"}</span>
              </div>
              <div className="text-xs text-[#8aa89a]">{d.district.state}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
