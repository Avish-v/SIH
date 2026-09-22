"use client";

import { api } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

type Alert = { id: string; kind: string; title: string; message: string; severity: string; at: string };
const KIND: Record<string, string> = { blocked: "Blocked road", inaccessible: "Inaccessible region", delay: "Delayed delivery", corridor: "High-risk corridor", weather: "Weather watch" };

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]); const [error, setError] = useState("");
  const load = useCallback(async () => { try { const result = await api<{ alerts: Alert[] }>("/alerts"); setAlerts(result.alerts); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load alerts."); } }, []);
  useEffect(() => { void load(); }, [load]);
  async function acknowledge(id: string) { try { await api(`/alerts/${id}/acknowledge`, { method: "PATCH" }); await load(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to acknowledge alert."); } }
  return <div className="grid gap-3 md:grid-cols-2">{error && <p className="text-sm text-[#ff6b5a]">{error}</p>}{alerts.map((alert) => <div key={alert.id} className="card p-4"><div className="text-xs uppercase tracking-wide text-[#e2b15a]">{KIND[alert.kind] ?? alert.kind} · {alert.severity}</div><div className="mt-1 font-medium">{alert.title}</div><p className="mt-1 text-sm text-[#8aa89a]">{alert.message}</p><div className="mt-2 flex items-center justify-between text-xs text-[#8aa89a]"><span>{new Date(alert.at).toLocaleString()}</span><button onClick={() => void acknowledge(alert.id)} className="rounded border border-[#1c3a32] px-2 py-1 hover:border-[#3dcc9a]">Acknowledge</button></div></div>)}{!error && alerts.length === 0 && <div className="card p-5 text-sm text-[#8aa89a]">No active demo alerts.</div>}</div>;
}
