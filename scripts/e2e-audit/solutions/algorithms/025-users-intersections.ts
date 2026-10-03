export function intersection(user1: number[][], user2: number[][]) {
  const out: number[][] = [];
  let i = 0, j = 0;
  while (i < user1.length && j < user2.length) {
    const start = Math.max(user1[i][0], user2[j][0]);
    const end = Math.min(user1[i][1], user2[j][1]);
    if (start < end) out.push([start, end]);
    if (user1[i][1] < user2[j][1]) i++;
    else j++;
  }
  return out;
}
export function intersection2(user1: number[][], user2: number[][]) {
  return intersection(user1, user2);
}
