import { CORRIDORS, DISTRICTS, SEED_VEHICLES, corridorById, districtById, pointOnPath } from "./ner-data";
import { riskLevel, scoreAll, suggestRoutes } from "./ai-engine";
import type { AlertItem, DeliveryCargo, DeliveryRecord, DeliveryStatus, Incident, RiskLevel, Vehicle } from "./types";

/**
 * Stateful demo repository used only when DEMO_MODE is enabled. It deliberately
 * labels every response as demo data and is replaceable with a database adapter.
 */
const incidents: Incident[] = [
  { id: "i1", type: "landslide", title: "Debris on NH-13 near Sela", districtId: "tawang", lat: 27.5, lng: 92.05, severity: "critical", description: "Single-lane blockage after overnight slide. Relief convoy halted.", reporter: "BRO field unit", at: new Date(Date.now() - 3600_000).toISOString(), synced: true },
  { id: "i2", type: "flood", title: "Brahmaputra embankment overflow", districtId: "dibrugarh", lat: 27.4, lng: 94.85, severity: "high", description: "NH-27 shoulder inundated. Trucks diverted via Jorhat feeder.", reporter: "PWD Assam", at: new Date(Date.now() - 7200_000).toISOString(), synced: true },
];
const vehicles: Vehicle[] = SEED_VEHICLES.map((vehicle) => ({ ...vehicle }));
const acknowledgedAlerts = new Set<string>();
const deliveries: DeliveryRecord[] = [];

export function listIncidents() { return [...incidents]; }
export function listDeliveries() { return [...deliveries]; }

export const DEMO_META = {
  mode: "DEMO",
  disclaimer: "Demo/simulated data. This is not live government, GPS, weather, or routing data.",
};

export function requestNumber(value: unknown, fallback: number, min = 0, max = 1) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

export function currentScores() {
  const hour = new Date().getHours();
  const congestion: Record<string, number> = {};
  for (const corridor of CORRIDORS) congestion[corridor.id] = 0.18 + ((hour + corridor.id.length) % 6) * 0.08;
  return { hour, congestion, scores: scoreAll(hour, incidents, congestion) };
}

export function activeAlerts(): AlertItem[] {
  const incidentAlerts: AlertItem[] = incidents.map((incident) => ({
    id: `incident-${incident.id}`,
    kind: incident.type === "flood" ? "inaccessible" : incident.type === "landslide" || incident.type === "road_damage" ? "blocked" : "weather",
    title: incident.title,
    message: incident.description,
    severity: incident.severity,
    at: incident.at,
    districtId: incident.districtId,
  }));
  const vehicleAlerts: AlertItem[] = vehicles.filter((vehicle) => vehicle.delayed || vehicle.status === "halted").map((vehicle) => ({
    id: `vehicle-${vehicle.id}`,
    kind: "delay",
    title: `${vehicle.callsign} delayed`,
    message: `${vehicle.cargo} load has an ETA of ${vehicle.etaHours.toFixed(1)} hours.`,
    severity: vehicle.status === "halted" ? "critical" : "high",
    at: new Date().toISOString(),
  }));
  const deliveryAlerts: AlertItem[] = deliveries.filter((delivery) => delivery.status === "AT_RISK" || delivery.status === "DELAYED").map((delivery) => ({
    id: `delivery-${delivery.id}`,
    kind: "delay",
    title: `${delivery.cargoType.replace(/_/g, " ")} ${delivery.status.toLowerCase()}`,
    message: `Demo delivery ${delivery.id} is linked to ${delivery.relatedIncidentIds.length} simulated incident(s).`,
    severity: delivery.status === "DELAYED" ? "high" : "moderate",
    at: delivery.history[delivery.history.length - 1]?.at ?? new Date().toISOString(),
    corridorId: delivery.corridorId,
  }));
  return [...incidentAlerts, ...vehicleAlerts, ...deliveryAlerts].filter((alert) => !acknowledgedAlerts.has(alert.id));
}

export function optimiseRoute(input: Record<string, unknown>) {
  const origin = String(input.origin || "kamrup");
  const destination = String(input.destination || "tawang");
  if (!districtById(origin) || !districtById(destination)) throw new Error("origin and destination must be valid district IDs");
  if (origin === destination) throw new Error("origin and destination must be different");
  const { scores } = currentScores();
  const candidates = suggestRoutes(origin, destination, scores);
  if (!candidates.length) throw new Error("No connected route exists in the demo corridor graph for this pair");
  const route = (name: "SAFEST" | "FASTEST" | "BALANCED", candidate: typeof candidates[number]) => {
    const corridorScores = candidate.corridorIds.map((id) => scores.find((score) => score.corridorId === id)!);
    const distanceKm = candidate.corridorIds.reduce((sum, id) => sum + (corridorById(id)?.baseHours ?? 0) * 38, 0);
    const risk = corridorScores.reduce((sum, score) => sum + score.risk, 0) / corridorScores.length;
    return {
      id: `${name.toLowerCase()}-${candidate.id}`,
      label: `${name} ROUTE`,
      corridor_ids: candidate.corridorIds,
      geometry: candidate.corridorIds.flatMap((id) => corridorById(id)?.path ?? []),
      distance_km: Number(distanceKm.toFixed(1)),
      estimated_travel_hours: candidate.hours,
      risk_score: Number((risk * 100).toFixed(0)),
      flood_risk: Number((corridorScores.reduce((sum, score) => sum + (corridorById(score.corridorId)?.floodExposure ?? 0), 0) / corridorScores.length * 100).toFixed(0)),
      landslide_risk: Number((corridorScores.reduce((sum, score) => sum + (corridorById(score.corridorId)?.landslideHistory ?? 0), 0) / corridorScores.length * 100).toFixed(0)),
      road_condition: risk > 0.75 ? "POOR" : risk > 0.5 ? "MODERATE" : "GOOD",
      traffic_factor: Number((corridorScores.reduce((sum, score) => sum + score.congestion, 0) / corridorScores.length).toFixed(2)),
      accessibility_score: Math.max(0, Math.round(100 - risk * 100)),
      overall_route_score: Math.max(0, Math.round(100 - risk * 70 - candidate.hours * 1.2)),
      data_source: "DEMO CORRIDOR GRAPH (OSRM not used)",
    };
  };
  const safest = [...candidates].sort((a, b) => a.risk - b.risk)[0];
  const fastest = [...candidates].sort((a, b) => a.hours - b.hours)[0];
  const balanced = candidates[0];
  return { ...DEMO_META, origin, destination, options: [route("SAFEST", safest), route("FASTEST", fastest), route("BALANCED", balanced)] };
}

export function aiRisk(input: Record<string, unknown>, type: "flood" | "landslide") {
  const rainfall = requestNumber(input.rainfall, 25, 0, 250) / 100;
  const slope = requestNumber(input.slope, 0.45);
  const elevation = requestNumber(input.elevation, 0.5, 0, 1);
  const history = requestNumber(input.historical_events, 0.3);
  const water = requestNumber(input.road_proximity_to_water, 0.3);
  const probability = Math.min(0.98, Math.max(0.02, type === "flood"
    ? rainfall * 0.43 + water * 0.27 + history * 0.2 + (1 - elevation) * 0.1
    : rainfall * 0.36 + slope * 0.34 + elevation * 0.08 + history * 0.22));
  return { ...DEMO_META, model: `explainable-${type}-risk-demo-v1`, production_accurate: false, [`${type}_probability`]: Number(probability.toFixed(3)), risk_level: riskLevel(probability), confidence: 0.68, factors: { rainfall, slope, elevation, historical_events: history, road_proximity_to_water: water } };
}

export function dashboardSummary() {
  const { scores } = currentScores();
  const alerts = activeAlerts();
  const atRisk = scores.filter((score) => score.level === "high" || score.level === "critical").length;
  return { ...DEMO_META, totals: { active_deliveries: vehicles.filter((vehicle) => vehicle.status !== "arrived").length, vehicles_active: vehicles.filter((vehicle) => vehicle.status !== "arrived").length, safe_routes: scores.filter((score) => score.level === "low" || score.level === "moderate").length, at_risk_routes: atRisk, blocked_roads: scores.filter((score) => !score.accessible).length, active_alerts: alerts.length, emergency_deliveries: vehicles.filter((vehicle) => vehicle.cargo === "medicines" || vehicle.cargo === "relief").length, average_eta_hours: Number((vehicles.reduce((sum, vehicle) => sum + vehicle.etaHours, 0) / vehicles.length).toFixed(1)) }, risk_summary: scores };
}

export function liveVehicles() {
  return vehicles.map((vehicle) => {
    const corridor = corridorById(vehicle.corridorId)!;
    const [latitude, longitude] = pointOnPath(corridor.path, vehicle.progress);
    return { ...vehicle, latitude, longitude, heading: 90, mode: "SIMULATION" };
  });
}

export function createIncident(input: Record<string, unknown>) {
  const districtId = String(input.districtId || "");
  const district = districtById(districtId);
  if (!district || !String(input.title || "").trim() || !String(input.description || "").trim()) throw new Error("title, description, and a valid districtId are required");
  const severity = ["low", "moderate", "high", "critical"].includes(String(input.severity)) ? String(input.severity) as RiskLevel : "moderate";
  const incident: Incident = { id: `incident-${Date.now()}`, type: (String(input.type || "other") as Incident["type"]), title: String(input.title).trim(), description: String(input.description).trim(), districtId, lat: requestNumber(input.lat, district.lat, -90, 90), lng: requestNumber(input.lng, district.lng, -180, 180), severity, photoDataUrl: typeof input.photoDataUrl === "string" ? input.photoDataUrl.slice(0, 2_000_000) : undefined, reporter: String(input.reporter || "Field officer"), at: new Date().toISOString(), synced: true };
  incidents.unshift(incident);
  return incident;
}

const cargoTypes: DeliveryCargo[] = ["emergency_medicine", "general_medicine", "food_supplies", "emergency_relief"];
const statusTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
  REQUESTED: ["APPROVED", "REJECTED", "CANCELLED"], APPROVED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["IN_TRANSIT", "DELAYED", "CANCELLED"], IN_TRANSIT: ["AT_RISK", "DELAYED", "DELIVERED"],
  AT_RISK: ["IN_TRANSIT", "DELAYED", "CANCELLED"], DELAYED: ["IN_TRANSIT", "CANCELLED"],
  DELIVERED: [], REJECTED: [], CANCELLED: [],
};

function deliveryDistrict(value: unknown, field: string) {
  const district = districtById(String(value || ""));
  if (!district) throw new Error(`${field} must be a valid district ID`);
  return district;
}

export function createDelivery(input: Record<string, unknown>) {
  const cargoType = String(input.cargoType || "") as DeliveryCargo;
  if (!cargoTypes.includes(cargoType)) throw new Error("cargoType must be emergency_medicine, general_medicine, food_supplies, or emergency_relief");
  const origin = deliveryDistrict(input.originDistrictId, "originDistrictId");
  const destination = deliveryDistrict(input.destinationDistrictId, "destinationDistrictId");
  if (origin.id === destination.id) throw new Error("origin and destination must be different");
  const now = new Date().toISOString();
  const delivery: DeliveryRecord = {
    id: `demo-delivery-${Date.now()}`, cargoType, originDistrictId: origin.id, destinationDistrictId: destination.id,
    status: "REQUESTED", progress: 0, relatedIncidentIds: [], simulation: true,
    history: [{ status: "REQUESTED", at: now, actor: String(input.actor || "operator"), note: "Demo test order created" }],
  };
  deliveries.unshift(delivery);
  return delivery;
}

export function updateDelivery(id: string, input: Record<string, unknown>) {
  const delivery = deliveries.find((item) => item.id === id);
  if (!delivery) throw new Error("Delivery not found");
  const status = String(input.status || "") as DeliveryStatus;
  if (!statusTransitions[delivery.status]?.includes(status)) throw new Error(`Cannot change ${delivery.status} to ${status}`);
  if (status === "ASSIGNED") {
    if (!String(input.vehicleId || "").trim() || !String(input.operator || "").trim()) throw new Error("vehicleId and operator are required before assignment");
    delivery.vehicleId = String(input.vehicleId); delivery.operator = String(input.operator);
  }
  if (status === "DELIVERED" && !String(input.confirmation || "").trim()) throw new Error("A delivery confirmation is required before marking delivered");
  delivery.status = status;
  delivery.progress = status === "DELIVERED" ? 1 : requestNumber(input.progress, delivery.progress, 0, 0.99);
  if (typeof input.corridorId === "string" && corridorById(input.corridorId)) delivery.corridorId = input.corridorId;
  if (typeof input.routeId === "string") delivery.routeId = input.routeId;
  if (Number.isFinite(Number(input.etaHours))) delivery.etaHours = requestNumber(input.etaHours, 0, 0, 999);
  if (input.location && typeof input.location === "object") {
    const location = input.location as Record<string, unknown>;
    delivery.lastLocation = { lat: requestNumber(location.lat, 0, -90, 90), lng: requestNumber(location.lng, 0, -180, 180), at: new Date().toISOString(), mode: "DEMO GPS" };
  }
  delivery.history.push({ status, at: new Date().toISOString(), actor: String(input.actor || "operator"), note: String(input.note || (status === "DELIVERED" ? "Delivery confirmation recorded" : "Demo delivery updated")) });
  return delivery;
}

/** Creates test-only data and links one explicitly selected delivery through a configured corridor. */
export function simulateIncident(input: Record<string, unknown>) {
  const delivery = deliveries.find((item) => item.id === String(input.deliveryId || ""));
  if (!delivery) throw new Error("A valid deliveryId is required for a simulation");
  const corridor = corridorById(String(input.corridorId || delivery.corridorId || ""));
  if (!corridor) throw new Error("A valid corridorId is required; proximity alone is not treated as route impact");
  if (delivery.corridorId && delivery.corridorId !== corridor.id) throw new Error("Selected incident corridor does not match the delivery's configured corridor");
  const district = districtById(corridor.to)!;
  const severity = ["low", "moderate", "high", "critical"].includes(String(input.severity)) ? String(input.severity) as RiskLevel : "high";
  const incident: Incident = { id: `simulation-${Date.now()}`, type: (String(input.type || "road_damage") as Incident["type"]), title: `SIMULATION — ${String(input.title || "Road disruption")}`, description: "Test-only incident. No live emergency notification has been sent.", districtId: district.id, lat: district.lat, lng: district.lng, severity, reporter: "NER-LOGIX simulation", at: new Date().toISOString(), synced: true };
  incidents.unshift(incident);
  delivery.relatedIncidentIds.push(incident.id);
  if (delivery.status === "IN_TRANSIT" || delivery.status === "AT_RISK") {
    delivery.status = severity === "high" || severity === "critical" ? "DELAYED" : "AT_RISK";
    delivery.history.push({ status: delivery.status, at: new Date().toISOString(), actor: "simulation", note: `Linked to ${incident.id} on ${corridor.name}` });
  }
  return { incident, delivery, mode: "SIMULATION" as const };
}

export function resetSimulation() {
  const removedDeliveryIds = deliveries.map((delivery) => delivery.id);
  deliveries.splice(0, deliveries.length);
  for (let index = incidents.length - 1; index >= 0; index -= 1) if (incidents[index].id.startsWith("simulation-")) incidents.splice(index, 1);
  return { ...DEMO_META, removedDeliveries: removedDeliveryIds.length, message: "Only in-memory simulation records were removed." };
}

export function accessibility() {
  const { scores } = currentScores();
  return DISTRICTS.map((district) => {
    const linked = CORRIDORS.filter((corridor) => corridor.from === district.id || corridor.to === district.id);
    const relevant = linked.map((corridor) => scores.find((score) => score.corridorId === corridor.id)!).filter(Boolean);
    const average = relevant.length ? relevant.reduce((sum, score) => sum + score.risk, 0) / relevant.length : 0.55;
    const score = Math.round(Math.max(0, 100 - average * 100 - (district.remote ? 8 : 0)));
    return { district: district.name, state: district.state, accessibility_score: score, classification: score >= 80 ? "Good" : score >= 60 ? "Moderate" : score >= 40 ? "Poor" : "Critical", blocked_roads: relevant.filter((result) => !result.accessible).length, remote: district.remote };
  });
}

export function recommendHubs(input: Record<string, unknown>) {
  const destination = districtById(String(input.destination || "kamrup"));
  if (!destination) throw new Error("destination must be a valid district ID");
  const hubs = ["kamrup", "silchar", "imphal", "agartala", "itanagar"].map((id, index) => {
    const district = districtById(id)!;
    const distance = Math.hypot(district.lat - destination.lat, district.lng - destination.lng) * 111;
    const score = Math.max(1, Math.round(95 - distance / 8 - index * 3));
    return { id: `hub-${id}`, name: `${district.name} Logistics Hub`, district: district.name, latitude: district.lat, longitude: district.lng, capacity_percent: 72 - index * 5, connectivity_score: score, recommendation_score: score, data_source: "DEMO" };
  });
  return { ...DEMO_META, hubs: hubs.sort((a, b) => b.recommendation_score - a.recommendation_score).slice(0, 3) };
}

export function copilotQuery(query: string) {
  const lower = query.toLowerCase();
  const origin = lower.includes("guwahati") ? "kamrup" : lower.includes("silchar") ? "silchar" : "kamrup";
  const destination = lower.includes("imphal") ? "imphal" : lower.includes("tawang") ? "tawang" : lower.includes("aizawl") ? "aizawl" : "tawang";
  let recommendation: ReturnType<typeof optimiseRoute> | undefined;
  try { recommendation = optimiseRoute({ origin, destination }); } catch { /* explain unavailable demo link below */ }
  const selected = recommendation?.options[0];
  return { ...DEMO_META, intent: lower.includes("medicine") ? "EMERGENCY_MEDICINE" : "ROUTE_ADVICE", origin, destination, priority: lower.includes("emergency") || lower.includes("medicine") ? "EMERGENCY" : "HIGH", suitable_vehicle: lower.includes("medicine") ? "Temperature-controlled medical van" : "All-weather high-clearance truck", recommendation: selected ?? null, nearest_hub: recommendHubs({ destination }).hubs[0], answer: selected ? `Use the ${selected.label}; it is the least-risk connected demo route at ${selected.estimated_travel_hours} hours and risk score ${selected.risk_score}/100.` : "No connected path is available in the seeded demo graph. Escalate for airlift or a field assessment." };
}

export function acknowledgeAlert(id: string) { acknowledgedAlerts.add(id); return { ...DEMO_META, id, acknowledged: true }; }
