"use client";

import { StoreProvider } from "@/lib/store";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

function RoleHydrate() {
  const { setRole } = useStore();
  useEffect(() => {
    void (async () => {
      try {
        const { user } = await api<{ user: { role: string } }>('/auth/me');
        const role = user.role === "ADMIN" ? "command" : user.role === "LOGISTICS_OPERATOR" ? "logistics" : user.role === "EMERGENCY_OFFICER" ? "state" : "field";
        setRole(role);
      } catch {
        setRole("command");
      }
    })();
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
