"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/console");
  }, [router]);

  return (
    <main className="grid-bg min-h-screen">
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="card rounded-2xl border border-[#1c3a32] px-6 py-4 text-sm text-[#8aa89a]">
          Redirecting to the operations console…
        </div>
      </div>
    </main>
  );
}
