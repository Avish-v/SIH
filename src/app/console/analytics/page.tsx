"use client";

import { useScores, useStore } from "@/lib/store";

export default function AnalyticsPage() {
  const { vehicles } = useStore();
  const { scores, districts } = useScores();
  const gaps = districts.filter((d) => !d.accessible || d.district.remote);
  const bottleneck = [...scores].sort((a, b) => b.risk - a.risk)[0];
  const emergency = scores.filter((s) => s.accessible && s.level !== "critical");

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs text-[#8aa89a]">Top logistics bottleneck</div>
          <div className="mt-2 text-lg">{bottleneck?.corridorId}</div>
          <div className="text-sm text-[#8aa89a]">Risk {(bottleneck.risk * 100).toFixed(0)}% · +{bottleneck.delayHours}h delay</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-[#8aa89a]">Emergency-capable corridors</div>
          <div className="mt-2 text-3xl">{emergency.length}</div>
          <div className="text-xs text-[#8aa89a]">Still usable for relief routing</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-[#8aa89a]">Supply chain pressure</div>
          <div className="mt-2 text-3xl">{vehicles.filter((v) => v.delayed).length}/{vehicles.length}</div>
          <div className="text-xs text-[#8aa89a]">Essential loads running late</div>
        </div>
      </div>
      <div className="card p-5">
        <div className="mb-3 font-medium">Supply-chain gaps &amp; remote accessibility</div>
        <div className="grid gap-2 md:grid-cols-3">
          {gaps.map((d) => (
            <div key={d.district.id} className="rounded-lg border border-[#1c3a32] p-3 text-sm">
              <div>{d.district.name}</div>
              <div className="text-xs text-[#8aa89a]">
                {d.district.remote ? "Remote district" : "Hub"} · {d.level} · {d.blocked} blocked links
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
