const base = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === "string" ? base + input : input;
  return fetch(url, init);
}
