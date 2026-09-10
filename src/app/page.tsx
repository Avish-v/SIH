"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPinned, Shield, Radio, CloudRain } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  function enter(role: string) {
    sessionStorage.setItem("ner-role", role);
    router.push("/console");
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
          <Link href="/console" className="text-sm text-[#8aa89a] hover:text-white">
            Skip to console →
          </Link>
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
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                ["command", "MDoNER command"],
                ["state", "State transport"],
                ["field", "Field officer"],
                ["logistics", "Logistics operator"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => enter(id)}
                  className="rounded-full border border-[#1c3a32] bg-[#10241c] px-4 py-2 text-sm hover:border-[#3dcc9a]"
                >
                  {label}
                </button>
              ))}
            </div>
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
