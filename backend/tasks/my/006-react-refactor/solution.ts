export type GameData = { title: string; description: string };

export async function loadGame(
  params: { id: string; mode: string; platform: string },
  requestGame: (params: any) => Promise<GameData>
): Promise<GameData> {
  return requestGame(params);
}

export function Game({ gameId }: { gameId: string | null }) {
  if (!gameId) {
    return null;
  }
  return { gameId };
}
