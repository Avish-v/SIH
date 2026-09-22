"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type Service = { name: string; status: string; httpStatus: number | null; lastSuccessfulCheck: string | null; detail: string };
export default function HealthPage() {
  const [services, setServices] = useState<Service[]>([]); const [checkedAt, setCheckedAt] = useState(""); const [error, setError] = useState("");
  async function load() { try { const data = await api<{ services: Service[]; checkedAt: string }>("/system/health"); setServices(data.services); setCheckedAt(data.checkedAt); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Health check unavailable."); } }
  useEffect(() => { void load(); }, []);
  return <div className="grid gap-4"><div className="flex items-end justify-between"><div><h2 className="text-lg font-medium">System health</h2><p className="text-sm text-[#8aa89a]">Administrator-only. Statuses do not imply unconfigured integrations are live.</p></div><button onClick={() => void load()} className="rounded border border-[#1c3a32] px-3 py-1 text-sm">Refresh</button></div>{error && <div className="card border-[#ff6b5a] p-4 text-sm text-[#ff6b5a]">{error}</div>}{checkedAt && <div className="text-xs text-[#8aa89a]">Last health check: {new Date(checkedAt).toLocaleString()}</div>}<div className="grid gap-3 md:grid-cols-2">{services.map((service) => <div className="card p-4" key={service.name}><div className="flex justify-between gap-3"><span>{service.name}</span><span className="text-xs text-[#e2b15a]">{service.status}</span></div><p className="mt-2 text-xs text-[#8aa89a]">{service.detail}</p><div className="mt-2 text-xs text-[#8aa89a]">HTTP: {service.httpStatus ?? "—"} · Last success: {service.lastSuccessfulCheck ? new Date(service.lastSuccessfulCheck).toLocaleString() : "—"}</div></div>)}</div></div>;
}
