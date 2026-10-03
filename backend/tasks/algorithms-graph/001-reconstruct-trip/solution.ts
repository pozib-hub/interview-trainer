export type Tickets = Array<{ from: string; to: string }>;

export function reconstructTrip(tickets: Tickets): Tickets[] {
  const fromToMap = new Map<string, string>();
  const toSet = new Set<string>();

  for (const { from, to } of tickets) {
    fromToMap.set(from, to);
    toSet.add(to);
  }

  let start = tickets.find(({ from }) => !toSet.has(from))?.from;
  if (!start) throw new Error("Не удалось определить начальный город");

  const route: Tickets = [];
  while (fromToMap.has(start)) {
    const to = fromToMap.get(start)!;
    route.push({ from: start, to });
    start = to;
  }

  return route;
}
