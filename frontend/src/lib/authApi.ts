import { apiFetch } from "./fetchApi";

export interface AuthInfo {
  authenticated: boolean;
  login: string | null;
}

async function authRequest(path: string, body?: unknown): Promise<AuthInfo> {
  const res = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Что-то пошло не так");
  }
  return data as AuthInfo;
}

export async function fetchMe(): Promise<AuthInfo> {
  const res = await apiFetch("/api/auth/me");
  const data = await res.json();
  return { authenticated: !!data.authenticated, login: data.login || null };
}

export function register(login: string, password: string): Promise<AuthInfo> {
  return authRequest("/api/auth/register", { login, password });
}

export function login(login: string, password: string): Promise<AuthInfo> {
  return authRequest("/api/auth/login", { login, password });
}

export function logout(): Promise<AuthInfo> {
  return authRequest("/api/auth/logout");
}
