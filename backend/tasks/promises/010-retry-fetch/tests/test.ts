import { test, expect, vi } from "vitest";
import { fetchData } from "../solution";

test("fetchData — успешный ответ", async () => {
  const mockResponse = { ok: true, json: () => Promise.resolve({ data: 42 }) };
  global.fetch = vi.fn().mockResolvedValue(mockResponse as any);

  const result = await fetchData("https://example.com");
  expect(result).toBe(mockResponse);
});

test("fetchData — ретраи при ошибке сети", async () => {
  let attempts = 0;
  global.fetch = vi.fn().mockImplementation(() => {
    attempts++;
    if (attempts < 3) return Promise.reject(new Error("Network error"));
    return Promise.resolve({ ok: true } as any);
  });

  const result = await fetchData("https://example.com");
  expect(result).toEqual({ ok: true });
  expect(attempts).toBe(3);
});

test("fetchData — reject после всех ретраев", async () => {
  global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

  await expect(fetchData("https://example.com")).rejects.toBe(
    "Не удалось получить данные"
  );
});
