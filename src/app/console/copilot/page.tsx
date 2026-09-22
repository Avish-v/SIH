"use client";

import { api } from "@/lib/api";
import { useState } from "react";

type CopilotResult = { answer: string; intent: string; origin: string; destination: string; priority: string; suitable_vehicle: string; recommendation: { label: string; estimated_travel_hours: number; risk_score: number } | null; nearest_hub: { name: string; connectivity_score: number } | null; disclaimer: string };

export default function CopilotPage() {
  const [query, setQuery] = useState("Send emergency medicine from Guwahati to Imphal.");
  const [result, setResult] = useState<CopilotResult>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function ask() {
    setLoading(true); setError("");
    try { setResult(await api<CopilotResult>("/copilot/query", { method: "POST", body: JSON.stringify({ query }) })); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to request recommendation."); }
    finally { setLoading(false); }
  }
  return <div className="mx-auto grid max-w-4xl gap-4">
    <div className="card p-5"><h2 className="text-lg font-medium">AI Logistics Copilot</h2><p className="mt-1 text-sm text-[#8aa89a]">A deterministic decision service for demo reliability; it calls route and hub recommendation logic rather than returning hard-coded chat text.</p>
      <div className="mt-4 flex gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-[#1c3a32] bg-[#0d1f1a] p-3 text-sm" aria-label="Logistics request" /><button onClick={() => void ask()} disabled={loading} className="rounded-lg bg-[#3dcc9a] px-4 text-sm font-medium text-[#07110f] disabled:opacity-60">{loading ? "Analysing…" : "Recommend"}</button></div>
    </div>
    {error && <div className="card border-[#ff6b5a] p-4 text-sm text-[#ff6b5a]">{error}</div>}
    {result && <div className="card grid gap-3 p-5 md:grid-cols-2"><div><div className="text-xs text-[#e2b15a]">{result.intent} · {result.priority}</div><p className="mt-2 text-sm">{result.answer}</p><p className="mt-3 text-xs text-[#8aa89a]">{result.disclaimer}</p></div><div className="grid gap-2 text-sm"><div className="rounded-lg border border-[#1c3a32] p-3">Route: {result.origin} → {result.destination}<br />Vehicle: {result.suitable_vehicle}</div>{result.recommendation && <div className="rounded-lg border border-[#1c3a32] p-3">{result.recommendation.label}<br />ETA {result.recommendation.estimated_travel_hours}h · Risk {result.recommendation.risk_score}/100</div>}{result.nearest_hub && <div className="rounded-lg border border-[#1c3a32] p-3">Nearest hub: {result.nearest_hub.name}<br />Connectivity {result.nearest_hub.connectivity_score}/100</div>}</div></div>}
  </div>;
}
