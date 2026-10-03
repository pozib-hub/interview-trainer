export type GameData = { title?: string; description?: string };

export const loadGame = async (
  params: { id: string; mode: string; platform: string },
  requestGame: (params: any) => Promise<any>
) => {
  return requestGame({ id: params.id, mode: params.mode });
};

export function Game({ gameId }: { gameId: string | null }) {
  if (gameId === null) {
    return null;
  }
  return { gameId };
}
