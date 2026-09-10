const KEY = "nerlogix-offline-queue";

export interface QueuedReport {
  id: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export function loadQueue(): QueuedReport[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function pushQueue(item: QueuedReport) {
  const q = loadQueue();
  q.push(item);
  localStorage.setItem(KEY, JSON.stringify(q));
}

export function clearQueue() {
  localStorage.setItem(KEY, "[]");
}
