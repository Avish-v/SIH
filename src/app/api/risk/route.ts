import { NextResponse } from "next/server";
import { CORRIDORS } from "@/lib/ner-data";
import { scoreAll } from "@/lib/ai-engine";

export async function GET() {
  const hour = new Date().getHours();
  const congestion: Record<string, number> = {};
  for (const c of CORRIDORS) congestion[c.id] = 0.3;
  const scores = scoreAll(hour, [], congestion);
  return NextResponse.json({
    source: "NER-LOGIX disruption engine (demo). Swap rainfall with IMD / Open-Meteo.",
    hour,
    scores,
  });
}
