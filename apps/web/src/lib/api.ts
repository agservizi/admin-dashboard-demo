const base = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3001" : "");

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${base}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export { base as apiBaseUrl };
