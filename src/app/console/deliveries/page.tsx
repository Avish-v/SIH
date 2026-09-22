"use client";

import { api } from "@/lib/api";
import { CORRIDORS, DISTRICTS, SEED_VEHICLES, districtById } from "@/lib/ner-data";
import type { DeliveryRecord, DeliveryStatus } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

const nextStatus: Partial<Record<DeliveryStatus, DeliveryStatus>> = {
  REQUESTED: "APPROVED", APPROVED: "ASSIGNED", ASSIGNED: "IN_TRANSIT", IN_TRANSIT: "DELIVERED", AT_RISK: "IN_TRANSIT", DELAYED: "IN_TRANSIT",
};

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try { const response = await api<{ deliveries: DeliveryRecord[] }>("/deliveries"); setDeliveries(response.deliveries); setError(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load deliveries."); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await api<{ delivery: DeliveryRecord }>("/deliveries", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
      setDeliveries((current) => [response.delivery, ...current]); event.currentTarget.reset();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to create delivery."); } finally { setBusy(false); }
  }
  async function advance(delivery: DeliveryRecord) {
    const status = nextStatus[delivery.status]; if (!status) return;
    setBusy(true); setError("");
    const corridor = CORRIDORS[0];
    const body: Record<string, unknown> = { status, actor: "demo operator", progress: status === "IN_TRANSIT" ? 0.35 : delivery.progress, note: "Demo workflow update" };
    if (status === "ASSIGNED") { body.vehicleId = SEED_VEHICLES[0].id; body.operator = "Demo operator"; body.corridorId = corridor.id; body.etaHours = 8; }
    if (status === "DELIVERED") body.confirmation = "Demo receiving officer confirmation";
    try { const response = await api<{ delivery: DeliveryRecord }>(`/deliveries/${delivery.id}/status`, { method: "PATCH", body: JSON.stringify(body) }); setDeliveries((current) => current.map((item) => item.id === delivery.id ? response.delivery : item)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to update delivery."); } finally { setBusy(false); }
  }
  async function simulate(delivery: DeliveryRecord) {
    if (!delivery.corridorId) { setError("Assign the test delivery before simulating a route incident."); return; }
    setBusy(true); setError("");
    try { await api("/simulation/incidents", { method: "POST", body: JSON.stringify({ deliveryId: delivery.id, corridorId: delivery.corridorId, type: "road_damage", severity: "high", title: "Road blockage" }) }); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Simulation failed."); } finally { setBusy(false); }
  }
  return <div className="grid gap-4">
    <div className="rounded-lg border border-[#e2b15a] bg-[#211d12] p-3 text-sm text-[#e2b15a]">SIMULATION — delivery records and DEMO GPS are in memory only. They are never live operational tracking.</div>
    <form onSubmit={create} className="card grid gap-3 p-4 md:grid-cols-4">
      <select name="cargoType" defaultValue="emergency_medicine" className="rounded-lg border border-[#1c3a32] bg-[#0d1f1a] p-2 text-sm"><option value="emergency_medicine">Emergency medicine</option><option value="general_medicine">General medicine</option><option value="food_supplies">Food supplies</option><option value="emergency_relief">Emergency relief</option></select>
      <select name="originDistrictId" defaultValue="kamrup" className="rounded-lg border border-[#1c3a32] bg-[#0d1f1a] p-2 text-sm">{DISTRICTS.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}</select>
      <select name="destinationDistrictId" defaultValue="tawang" className="rounded-lg border border-[#1c3a32] bg-[#0d1f1a] p-2 text-sm">{DISTRICTS.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}</select>
      <button disabled={busy} className="rounded-lg bg-[#3dcc9a] px-3 py-2 text-sm font-medium text-[#07110f] disabled:opacity-60">Create test order</button>
    </form>
    {error && <p className="text-sm text-[#ff6b5a]">{error}</p>}
    <div className="grid gap-3 lg:grid-cols-2">{deliveries.map((delivery) => <div className="card p-4" key={delivery.id}>
      <div className="flex justify-between gap-3"><div className="font-medium">{delivery.cargoType.replace(/_/g, " ")}</div><span className="text-xs text-[#e2b15a]">{delivery.status}</span></div>
      <div className="mt-1 text-xs text-[#8aa89a]">{districtById(delivery.originDistrictId)?.name} → {districtById(delivery.destinationDistrictId)?.name} · {delivery.id}</div>
      <div className="mt-2 text-xs text-[#8aa89a]">Vehicle: {delivery.vehicleId ?? "unassigned"} · Operator: {delivery.operator ?? "unassigned"} · GPS: {delivery.lastLocation ? "DEMO GPS" : "not simulated"}</div>
      {delivery.relatedIncidentIds.length > 0 && <div className="mt-2 text-xs text-[#ff6b5a]">Linked simulation incidents: {delivery.relatedIncidentIds.length}</div>}
      <div className="mt-3 flex gap-2"><button disabled={busy || !nextStatus[delivery.status]} onClick={() => void advance(delivery)} className="rounded border border-[#1c3a32] px-2 py-1 text-xs disabled:opacity-40">Advance lifecycle</button><button disabled={busy || delivery.status !== "IN_TRANSIT" || !delivery.corridorId} onClick={() => void simulate(delivery)} className="rounded border border-[#e2b15a] px-2 py-1 text-xs text-[#e2b15a] disabled:opacity-40">Simulate blockage</button></div>
      <div className="mt-3 border-t border-[#1c3a32] pt-2 text-xs text-[#8aa89a]">{delivery.history.map((entry) => <div key={`${entry.at}-${entry.status}`}>{entry.status} · {entry.note}</div>)}</div>
    </div>)} {!error && deliveries.length === 0 && <div className="card p-4 text-sm text-[#8aa89a]">No test deliveries yet. Create an explicitly labelled test order above.</div>}</div>
  </div>;
}
