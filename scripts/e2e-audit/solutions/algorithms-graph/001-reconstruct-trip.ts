export function reconstructTrip(tickets: Tickets): Tickets[] {
  const outgoing = new Map<string, { from: string; to: string }>();
  const destinations = new Set<string>();
  for (const t of tickets) {
    outgoing.set(t.from, t);
    destinations.add(t.to);
  }
  let current = tickets.find((t) => !destinations.has(t.from))!.from;
  const route: Tickets = [];
  while (outgoing.has(current)) {
    const t = outgoing.get(current)!;
    route.push(t);
    current = t.to;
  }
  return route;
}
export type Tickets = { from: string; to: string }[];
