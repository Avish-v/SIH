"use client";

import { LANG_LABEL, STRINGS } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { useStore } from "@/lib/store";
import { WifiOff } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export function Topbar() {
  const router = useRouter();
  const { lang, setLang, role, hour, offlineCount, syncOffline } = useStore();
  const t = STRINGS[lang];
  return (
    <header className="flex items-center justify-between border-b border-[#1c3a32] px-5 py-3">
      <div>
        <div className="text-sm font-medium">{t.live}</div>
        <div className="text-xs text-[#8aa89a]">Simulated ops hour {String(hour).padStart(2, "0")}:00 · role {role}</div>
      </div>
      <div className="flex items-center gap-2">
        {(Object.keys(LANG_LABEL) as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`rounded-full px-3 py-1 text-xs ${lang === l ? "bg-[#3dcc9a] text-[#07110f]" : "bg-[#10241c] text-[#8aa89a]"}`}
          >
            {LANG_LABEL[l]}
          </button>
        ))}
        <button
          onClick={() => {
            const n = syncOffline();
            alert(n ? `Synced ${n} offline report(s)` : "Queue empty");
          }}
          className="ml-2 flex items-center gap-1 rounded-full border border-[#1c3a32] px-3 py-1 text-xs"
        >
          <WifiOff className="h-3 w-3" />
          {t.sync} {offlineCount ? `(${offlineCount})` : ""}
        </button>
        <button
          onClick={() => void api("/auth/logout", { method: "DELETE" }).then(() => router.push("/"))}
          className="rounded-full border border-[#1c3a32] px-3 py-1 text-xs hover:border-[#3dcc9a]"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
