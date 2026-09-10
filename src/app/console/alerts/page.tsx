"use client";

import { useStore } from "@/lib/store";

const KIND: Record<string, string> = {
  blocked: "Blocked road",
  inaccessible: "Inaccessible region",
  delay: "Delayed delivery",
  corridor: "High-risk corridor",
  weather: "Weather watch",
};

export default function AlertsPage() {
  const { alerts } = useStore();
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {alerts.map((a) => (
        <div key={a.id} className="card p-4">
          <div className="text-xs uppercase tracking-wide text-[#e2b15a]">{KIND[a.kind]} · {a.severity}</div>
          <div className="mt-1 font-medium">{a.title}</div>
          <p className="mt-1 text-sm text-[#8aa89a]">{a.message}</p>
          <div className="mt-2 text-xs text-[#8aa89a]">{new Date(a.at).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
