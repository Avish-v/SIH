"use client";

import { StoreProvider } from "@/lib/store";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

function RoleHydrate() {
  const { setRole } = useStore();
  useEffect(() => {
    const r = sessionStorage.getItem("ner-role") as Role | null;
    if (r) setRole(r);
  }, [setRole]);
  return null;
}

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <RoleHydrate />
          <Topbar />
          <div className="flex-1 overflow-auto p-5">{children}</div>
        </div>
      </div>
    </StoreProvider>
  );
}
