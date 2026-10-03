import { test, expect } from "vitest";
import { loadGame, Game } from "../solution";

test("loadGame вызывает requestGame с параметрами", async () => {
  const requestGame = async (params: any) => ({
    title: `Game ${params.id}`,
    description: `Mode: ${params.mode}`,
  });

  const result = await loadGame(
    { id: "123", mode: "real", platform: "desktop" },
    requestGame
  );

  expect(result.title).toBe("Game 123");
  expect(result.description).toBe("Mode: real");
});

test("Game возвращает null для null gameId", () => {
  expect(Game({ gameId: null })).toBeNull();
});

test("Game возвращает объект для валидного gameId", () => {
  const result = Game({ gameId: "42" });
  expect(result).toEqual({ gameId: "42" });
});
