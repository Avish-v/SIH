"use client";

import { MapCanvas } from "@/components/MapCanvas";
import { useScores } from "@/lib/store";
import { CORRIDORS } from "@/lib/ner-data";

export default function MapPage() {
  const { scores } = useScores();
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <div className="card overflow-hidden lg:col-span-3" style={{ height: 640 }}>
        <MapCanvas height="640px" />
      </div>
      <div className="card max-h-[640px] overflow-auto p-4">
        <div className="mb-3 text-sm font-medium">Corridor accessibility</div>
        <p className="mb-3 text-xs text-[#8aa89a]">Green open · amber watch · red blocked. Dashed = inaccessible.</p>
        {CORRIDORS.map((c) => {
          const s = scores.find((x) => x.corridorId === c.id)!;
          return (
            <div key={c.id} className="mb-3 border-b border-[#1c3a32] pb-2">
              <div className="text-sm">{c.name}</div>
              <div className="text-xs text-[#8aa89a]">{c.nh} · {s.level} · delay {s.delayHours}h</div>
              <div className="text-xs text-[#8aa89a]">{s.reasons[0]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
