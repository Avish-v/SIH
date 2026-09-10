import { CORRIDORS, DISTRICTS } from "./ner-data";
import type { CorridorScore, Incident, RiskLevel, RouteOption } from "./types";

export interface WeatherTick {
  rainfallMm: number;
  hour: number;
}

function clamp(n: number, a = 0, b = 1) {
  return Math.max(a, Math.min(b, n));
}

export function riskLevel(score: number): RiskLevel {
  if (score >= 0.75) return "critical";
  if (score >= 0.55) return "high";
  if (score >= 0.35) return "moderate";
  return "low";
}

/** Deterministic pseudo-weather by corridor + hour (demo stand-in for IMD / Open-Meteo). */
export function weatherFor(corridorId: string, hour: number): WeatherTick {
  const seed = corridorId.charCodeAt(1) + corridorId.charCodeAt(corridorId.length - 1);
  const monsoon = 0.55 + 0.35 * Math.sin((hour / 24) * Math.PI * 2 + seed);
  const burst = Math.max(0, Math.sin(hour * 0.37 + seed) ** 5);
  const rainfallMm = clamp(monsoon * 18 + burst * 42, 0, 90);
  return { rainfallMm, hour };
}

export function scoreCorridor(
  corridorId: string,
  hour: number,
  incidents: Incident[],
  congestion: number,
): CorridorScore {
  const c = CORRIDORS.find((x) => x.id === corridorId)!;
  const { rainfallMm } = weatherFor(corridorId, hour);
  const rain = clamp(rainfallMm / 55);
  const localIncidents = incidents.filter((i) => {
    const d = DISTRICTS.find((x) => x.id === i.districtId);
    return d && (c.from === d.id || c.to === d.id);
  });
  const incidentHit = clamp(localIncidents.length * 0.22 + (localIncidents.some((i) => i.severity === "critical") ? 0.25 : 0));

  const risk = clamp(
    0.22 * rain +
      0.2 * c.slopeIndex +
      0.18 * c.landslideHistory +
      0.16 * c.floodExposure +
      0.14 * congestion +
      0.1 * incidentHit,
  );

  const reasons: string[] = [];
  if (rain > 0.45) reasons.push(`Heavy rainfall (${rainfallMm.toFixed(0)} mm)`);
  if (c.slopeIndex > 0.7) reasons.push("Steep Himalayan / hill gradient");
  if (c.landslideHistory > 0.5) reasons.push("Historical landslide corridor");
  if (c.floodExposure > 0.5) reasons.push("Flood-plain / river exposure");
  if (congestion > 0.5) reasons.push("Traffic congestion");
  if (incidentHit > 0.2) reasons.push("Active field incidents on corridor");
  if (!reasons.length) reasons.push("Stable operating conditions");

  const delayHours = Number((c.baseHours * (0.15 + risk * 1.35)).toFixed(1));
  const accessible = risk < 0.82 && !localIncidents.some((i) => i.type === "landslide" && i.severity === "critical");

  return {
    corridorId,
    risk,
    level: riskLevel(risk),
    rainfallMm,
    congestion,
    delayHours,
    accessible,
    reasons,
  };
}

export function scoreAll(hour: number, incidents: Incident[], congestionMap: Record<string, number>) {
  return CORRIDORS.map((c) => scoreCorridor(c.id, hour, incidents, congestionMap[c.id] ?? 0.25));
}

const GRAPH: Record<string, { to: string; corridorId: string }[]> = {};
for (const c of CORRIDORS) {
  (GRAPH[c.from] ??= []).push({ to: c.to, corridorId: c.id });
  (GRAPH[c.to] ??= []).push({ to: c.from, corridorId: c.id });
}

export function suggestRoutes(
  from: string,
  to: string,
  scores: CorridorScore[],
): RouteOption[] {
  const scoreOf = (id: string) => scores.find((s) => s.corridorId === id);
  const options: RouteOption[] = [];

  function walk(node: string, path: string[], used: string[], riskAcc: number, hours: number) {
    if (path.length > 5) return;
    if (node === to && path.length) {
      const avg = riskAcc / path.length;
      options.push({
        id: `r-${path.join("-")}`,
        name: path.map((id) => CORRIDORS.find((x) => x.id === id)?.name.split("–")[0]).join(" → "),
        corridorIds: [...path],
        hours: Number(hours.toFixed(1)),
        risk: avg,
        level: riskLevel(avg),
        note: path.some((id) => !scoreOf(id)?.accessible) ? "Contains a blocked segment" : "Recommended operating path",
      });
      return;
    }
    for (const edge of GRAPH[node] ?? []) {
      if (used.includes(edge.corridorId)) continue;
      const s = scoreOf(edge.corridorId);
      if (!s) continue;
      const c = CORRIDORS.find((x) => x.id === edge.corridorId)!;
      walk(edge.to, [...path, edge.corridorId], [...used, edge.corridorId], riskAcc + s.risk, hours + c.baseHours * (1 + s.risk));
    }
  }

  walk(from, [], [], 0, 0);

  const unique = new Map<string, RouteOption>();
  for (const o of options) unique.set(o.corridorIds.join(">"), o);
  return [...unique.values()]
    .sort((a, b) => a.risk * 8 + a.hours - (b.risk * 8 + b.hours))
    .slice(0, 4)
    .map((o, i) => ({
      ...o,
      name: i === 0 ? `Primary · ${o.hours}h` : `Alternate ${i} · ${o.hours}h`,
      note:
        i === 0
          ? "Lowest combined delay and disruption risk"
          : o.note,
    }));
}

export function districtConnectivity(scores: CorridorScore[]) {
  return DISTRICTS.map((d) => {
    const linked = CORRIDORS.filter((c) => c.from === d.id || c.to === d.id);
    const related = linked.map((c) => scores.find((s) => s.corridorId === c.id)!).filter(Boolean);
    const avg = related.length ? related.reduce((a, s) => a + s.risk, 0) / related.length : 0.4;
    const blocked = related.filter((s) => !s.accessible).length;
    return {
      district: d,
      risk: avg,
      level: riskLevel(avg),
      blocked,
      corridors: related.length,
      accessible: blocked === 0 && avg < 0.75,
    };
  });
}
