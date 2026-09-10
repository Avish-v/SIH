"use client";

import { corridorById, districtById } from "@/lib/ner-data";
import { useStore } from "@/lib/store";

const CARGO: Record<string, string> = {
  medicines: "Medicines",
  food: "Food supplies",
  construction: "Construction",
  agriculture: "Agricultural produce",
  relief: "Relief / disaster",
};

export default function FleetPage() {
  const { vehicles } = useStore();
  return (
    <div className="card overflow-auto">
      <div className="border-b border-[#1c3a32] px-4 py-3 text-sm font-medium">GPS movement of essential commodities</div>
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-[#8aa89a]">
          <tr>
            <th className="px-4 py-2">Callsign</th>
            <th>Cargo</th>
            <th>Corridor</th>
            <th>Progress</th>
            <th>ETA</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v.id} className="border-t border-[#1c3a32]">
              <td className="px-4 py-3 font-medium">{v.callsign}</td>
              <td>{CARGO[v.cargo]}</td>
              <td className="text-[#8aa89a]">
                {districtById(v.origin)?.name} → {districtById(v.destination)?.name}
                <div className="text-xs">{corridorById(v.corridorId)?.nh}</div>
              </td>
              <td>
                <div className="h-1.5 w-28 rounded bg-[#1c3a32]">
                  <div className="h-1.5 rounded bg-[#3dcc9a]" style={{ width: `${v.progress * 100}%` }} />
                </div>
              </td>
              <td>{v.etaHours.toFixed(1)}h</td>
              <td className={v.status === "enroute" ? "text-[#3dcc9a]" : "text-[#ff6b5a]"}>{v.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
