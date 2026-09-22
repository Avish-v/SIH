"use client";

import { DISTRICTS } from "@/lib/ner-data";
import { useStore } from "@/lib/store";
import type { Incident, IncidentType, RiskLevel } from "@/lib/types";
import { api } from "@/lib/api";
import { useState } from "react";

export default function FieldPage() {
  const { addIncident, incidents } = useStore();
  const [offline, setOffline] = useState(true);
  const [photo, setPhoto] = useState<string>();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const district = DISTRICTS.find((d) => d.id === fd.get("district"))!;
    const inc: Incident = {
      id: `f-${Date.now()}`,
      type: fd.get("type") as IncidentType,
      title: String(fd.get("title")),
      districtId: district.id,
      // A report with no device coordinate is district-level, not a fabricated point.
      lat: district.lat,
      lng: district.lng,
      severity: fd.get("severity") as RiskLevel,
      description: String(fd.get("description")),
      photoDataUrl: photo,
      reporter: String(fd.get("reporter") || "Field officer"),
      at: new Date().toISOString(),
      synced: !offline,
    };
    if (offline) {
      addIncident(inc, true);
    } else {
      try {
        const result = await api<{ incident: Incident }>("/incidents", { method: "POST", body: JSON.stringify(inc) });
        addIncident(result.incident);
      } catch (error) {
        alert(error instanceof Error ? error.message : "Unable to submit incident");
        return;
      }
    }
    e.currentTarget.reset();
    setPhoto(undefined);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form className="card space-y-3 p-5" onSubmit={submit}>
        <h2 className="text-lg font-medium">Geo-tagged field report</h2>
        <p className="text-sm text-[#8aa89a]">Demo mode: reports without device GPS use the selected district centroid. Offline reports remain local until submitted.</p>
        <input name="title" required placeholder="Incident title" className="w-full rounded-lg border border-[#1c3a32] bg-[#0d1f1a] p-2 text-sm" />
        <textarea name="description" required placeholder="What is blocking movement?" className="w-full rounded-lg border border-[#1c3a32] bg-[#0d1f1a] p-2 text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <select name="district" className="rounded-lg border border-[#1c3a32] bg-[#0d1f1a] p-2 text-sm">
            {DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select name="type" className="rounded-lg border border-[#1c3a32] bg-[#0d1f1a] p-2 text-sm">
            {["landslide", "flood", "rainfall", "road_damage", "congestion", "bridge", "other"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select name="severity" className="rounded-lg border border-[#1c3a32] bg-[#0d1f1a] p-2 text-sm">
            {["low", "moderate", "high", "critical"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input name="reporter" placeholder="Officer / agency" className="rounded-lg border border-[#1c3a32] bg-[#0d1f1a] p-2 text-sm" />
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => setPhoto(String(r.result));
            r.readAsDataURL(f);
          }}
        />
        {photo && <img src={photo} alt="field" className="h-28 rounded-lg object-cover" />}
        <label className="flex items-center gap-2 text-sm text-[#8aa89a]">
          <input type="checkbox" checked={offline} onChange={(e) => setOffline(e.target.checked)} />
          Simulate low-network (queue locally)
        </label>
        <button className="rounded-lg bg-[#3dcc9a] px-4 py-2 text-sm font-medium text-[#07110f]">Submit incident</button>
      </form>
      <div className="card max-h-[640px] overflow-auto p-5">
        <div className="mb-3 text-sm font-medium">Incident feed</div>
        {incidents.map((i) => (
          <div key={i.id} className="mb-3 border-b border-[#1c3a32] pb-3">
            <div className="flex justify-between text-sm">
              <span>{i.title}</span>
              <span className="text-xs text-[#8aa89a]">{i.synced ? "synced" : "queued"}</span>
            </div>
            <div className="text-xs text-[#8aa89a]">{i.type} · {i.severity} · {i.reporter}</div>
            {i.photoDataUrl && <img src={i.photoDataUrl} alt="" className="mt-2 h-20 rounded object-cover" />}
          </div>
        ))}
      </div>
    </div>
  );
}
