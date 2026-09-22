export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, { ...options, headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) }, cache: "no-store" });
  const payload = await response.json() as T & { detail?: string };
  if (!response.ok) throw new Error(payload.detail || `Request failed (${response.status})`);
  return payload;
}
