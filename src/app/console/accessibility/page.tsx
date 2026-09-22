"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type District = { district: string; state: string; accessibility_score: number; classification: string; blocked_roads: number; remote: boolean };
export default function AccessibilityPage() {
  const [districts, setDistricts] = useState<District[]>([]); const [error, setError] = useState("");
  useEffect(() => { api<{ districts: District[] }>("/accessibility/districts").then((data) => setDistricts(data.districts)).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load accessibility.")); }, []);
  return <div className="grid gap-4"><div><h2 className="text-lg font-medium">District accessibility monitor</h2><p className="text-sm text-[#8aa89a]">Scores combine corridor disruption risk and remote-area exposure. Results are demo calculations.</p></div>{error && <p className="text-sm text-[#ff6b5a]">{error}</p>}<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{districts.map((district) => <div className="card p-4" key={district.district}><div className="flex justify-between"><span>{district.district}</span><span className="text-[#e2b15a]">{district.accessibility_score}/100</span></div><div className="mt-1 text-xs text-[#8aa89a]">{district.state} · {district.classification} · {district.blocked_roads} blocked links {district.remote ? "· remote" : ""}</div><div className="mt-3 h-2 overflow-hidden rounded bg-[#1c3a32]"><div className="h-full bg-[#3dcc9a]" style={{ width: `${district.accessibility_score}%` }} /></div></div>)}</div></div>;
}
