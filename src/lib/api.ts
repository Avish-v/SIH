export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!(typeof FormData !== "undefined" && options?.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(`/api${path}`, { ...options, headers, cache: "no-store" });
  const payload = await response.json() as T & { detail?: string };
  if (!response.ok) throw new Error(payload.detail || `Request failed (${response.status})`);
  return payload;
}
