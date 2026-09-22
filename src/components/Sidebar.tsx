"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Map,
  Route,
  Truck,
  ClipboardPen,
  BarChart3,
  Bot,
  Gauge,
  HeartPulse,
} from "lucide-react";
import { STRINGS } from "@/lib/i18n";
import { useStore } from "@/lib/store";

const NAV = [
  { href: "/console", icon: Activity, key: "overview" },
  { href: "/console/map", icon: Map, key: "map" },
  { href: "/console/routes", icon: Route, key: "routes" },
  { href: "/console/fleet", icon: Truck, key: "fleet" },
  { href: "/console/field", icon: ClipboardPen, key: "field" },
  { href: "/console/alerts", icon: Bell, key: "alerts" },
  { href: "/console/analytics", icon: BarChart3, key: "analytics" },
] as const;

export function Sidebar() {
  const path = usePathname();
  const { lang } = useStore();
  const t = STRINGS[lang];
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-[#1c3a32] bg-[#081612] p-4">
      <Link href="/" className="mb-8">
        <div className="text-[10px] tracking-[0.22em] text-[#e2b15a]">SIH26002 · MDONER</div>
        <div className="text-lg font-semibold">{t.brand}</div>
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV.map((n) => {
          const active = path === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                active ? "bg-[#143226] text-[#3dcc9a]" : "text-[#8aa89a] hover:bg-[#10241c]"
              }`}
            >
              <n.icon className="h-4 w-4" />
              {t[n.key]}
            </Link>
          );
        })}
        <Link href="/console/accessibility" className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${path === "/console/accessibility" ? "bg-[#143226] text-[#3dcc9a]" : "text-[#8aa89a] hover:bg-[#10241c]"}`}><Gauge className="h-4 w-4" />Accessibility</Link>
        <Link href="/console/copilot" className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${path === "/console/copilot" ? "bg-[#143226] text-[#3dcc9a]" : "text-[#8aa89a] hover:bg-[#10241c]"}`}><Bot className="h-4 w-4" />AI copilot</Link>
        <Link href="/console/deliveries" className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${path === "/console/deliveries" ? "bg-[#143226] text-[#3dcc9a]" : "text-[#8aa89a] hover:bg-[#10241c]"}`}><Truck className="h-4 w-4" />Deliveries</Link>
        <Link href="/console/health" className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${path === "/console/health" ? "bg-[#143226] text-[#3dcc9a]" : "text-[#8aa89a] hover:bg-[#10241c]"}`}><HeartPulse className="h-4 w-4" />System health</Link>
      </nav>
    </aside>
  );
}
