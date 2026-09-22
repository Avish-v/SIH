export type RiskLevel = "low" | "moderate" | "high" | "critical";
export type VehicleCargo =
  | "medicines"
  | "food"
  | "construction"
  | "agriculture"
  | "relief";
export type IncidentType =
  | "landslide"
  | "flood"
  | "rainfall"
  | "road_damage"
  | "congestion"
  | "bridge"
  | "other";
export type Role = "command" | "state" | "field" | "logistics";
export type Lang = "en" | "hi" | "as";

export interface District {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  population: number;
  remote: boolean;
}

export interface Corridor {
  id: string;
  name: string;
  from: string;
  to: string;
  nh: string;
  path: [number, number][];
  slopeIndex: number;
  landslideHistory: number;
  floodExposure: number;
  baseHours: number;
}

export interface Vehicle {
  id: string;
  callsign: string;
  cargo: VehicleCargo;
  origin: string;
  destination: string;
  corridorId: string;
  progress: number;
  speedKmh: number;
  etaHours: number;
  delayed: boolean;
  status: "enroute" | "delayed" | "arrived" | "halted";
}

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  districtId: string;
  lat: number;
  lng: number;
  severity: RiskLevel;
  description: string;
  photoDataUrl?: string;
  reporter: string;
  at: string;
  synced: boolean;
}

export interface AlertItem {
  id: string;
  kind: "blocked" | "inaccessible" | "delay" | "corridor" | "weather";
  title: string;
  message: string;
  severity: RiskLevel;
  at: string;
  districtId?: string;
  corridorId?: string;
}

export type DeliveryStatus = "REQUESTED" | "APPROVED" | "ASSIGNED" | "IN_TRANSIT" | "AT_RISK" | "DELAYED" | "DELIVERED" | "REJECTED" | "CANCELLED";
export type DeliveryCargo = "emergency_medicine" | "general_medicine" | "food_supplies" | "emergency_relief";

export interface DeliveryHistoryItem {
  status: DeliveryStatus;
  at: string;
  note: string;
  actor: string;
}

/** A labelled in-memory record used only while DEMO_MODE is enabled. */
export interface DeliveryRecord {
  id: string;
  cargoType: DeliveryCargo;
  originDistrictId: string;
  destinationDistrictId: string;
  status: DeliveryStatus;
  vehicleId?: string;
  operator?: string;
  corridorId?: string;
  routeId?: string;
  etaHours?: number;
  progress: number;
  lastLocation?: { lat: number; lng: number; at: string; mode: "DEMO GPS" };
  relatedIncidentIds: string[];
  history: DeliveryHistoryItem[];
  simulation: true;
}

export interface CorridorScore {
  corridorId: string;
  risk: number;
  level: RiskLevel;
  rainfallMm: number;
  congestion: number;
  delayHours: number;
  accessible: boolean;
  reasons: string[];
}

export interface RouteOption {
  id: string;
  name: string;
  corridorIds: string[];
  hours: number;
  risk: number;
  level: RiskLevel;
  note: string;
}
