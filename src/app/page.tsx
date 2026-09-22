"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { MapPinned, Shield, Radio, CloudRain } from "lucide-react";

export default function HomePage() {
  return (
    <Suspense fallback={<main className="grid-bg min-h-screen" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/console";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try { await api("/auth/" + mode, { method: "POST", body: JSON.stringify(data) }); router.push(next); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Authentication failed."); }
    finally { setBusy(false); }
  }

  return (
    <main className="grid-bg min-h-screen">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3dcc9a] text-[#07110f] font-bold">
              NL
            </div>
            <div>
              <div className="text-sm tracking-[0.2em] text-[#e2b15a]">SIH26002 · MDoNER</div>
              <div className="text-xl font-semibold">NER-LOGIX</div>
            </div>
          </div>
          <div className="text-sm text-[#8aa89a]">Secure operations access</div>
        </header>

        <section className="grid gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              AI logistics intelligence for the
              <span className="text-[#3dcc9a]"> North Eastern Region</span>
            </h1>
            <p className="mt-5 max-w-xl text-[#8aa89a] leading-relaxed">
              Real-time corridor accessibility, landslide and flood disruption prediction,
              GPS tracking of essential supplies, and field reporting built for terrain,
              monsoon, and low-network districts across the eight NER states.
            </p>
            <form onSubmit={submit} className="card mt-8 max-w-md space-y-3 p-5">
              {mode === "register" && <input name="name" required placeholder="Full name" className="w-full rounded-lg border border-[#1c3a32] bg-[#0d1f1a] p-2 text-sm" />}
              <input name="email" type="email" required placeholder="Email address" className="w-full rounded-lg border border-[#1c3a32] bg-[#0d1f1a] p-2 text-sm" />
              <input name="password" type="password" required minLength={10} placeholder="Password (10+ characters)" className="w-full rounded-lg border border-[#1c3a32] bg-[#0d1f1a] p-2 text-sm" />
              {error && <p className="text-sm text-[#ff6b5a]">{error}</p>}
              <button disabled={busy} className="w-full rounded-lg bg-[#3dcc9a] px-4 py-2 text-sm font-medium text-[#07110f] disabled:opacity-60">{busy ? "Authenticating..." : mode === "login" ? "Log in" : "Create account"}</button>
              <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="text-sm text-[#8aa89a] hover:text-white">{mode === "login" ? "Need an account? Register" : "Already registered? Log in"}</button>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              [MapPinned, "GIS accessibility", "District corridors, blocked segments, emergency paths"],
              [CloudRain, "Disruption AI", "Rain, slope, landslide history, flood exposure scoring"],
              [Radio, "GPS essential fleet", "Medicines, food, relief, construction, agri consignments"],
              [Shield, "Offline field sync", "Geo-tagged incidents with photos for low-network belts"],
            ].map(([Icon, t, d]) => (
              <div key={String(t)} className="card p-4">
                <Icon className="mb-3 h-5 w-5 text-[#e2b15a]" />
                <div className="font-medium">{t as string}</div>
                <p className="mt-1 text-xs text-[#8aa89a]">{d as string}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
