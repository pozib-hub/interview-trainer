export const sortDates = (arr: { date: string }[]) => {
  return [...arr].sort((a, b) => {
    const [d1, m1, y1] = a.date.split(".").map(Number);
    const [d2, m2, y2] = b.date.split(".").map(Number);
    return y1 - y2 || m1 - m2 || d1 - d2;
  });
};
