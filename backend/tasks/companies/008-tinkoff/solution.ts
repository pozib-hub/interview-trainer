export function minDifference(nums: number[], k: number): number {
  if (k <= 1 || nums.length === 0) return 0;

  const sorted = [...nums].sort((a, b) => a - b);

  let minDiff = Infinity;
  for (let i = 0; i <= sorted.length - k; i++) {
    const diff = sorted[i + k - 1] - sorted[i];
    if (diff < minDiff) minDiff = diff;
  }

  return minDiff;
}

export function countShips(matrix: number[][]): number {
  if (matrix.length === 0) return 0;

  const rows = matrix.length;
  const cols = matrix[0].length;
  const visited = new Set<string>();
  let count = 0;

  function dfs(r: number, c: number) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    if (matrix[r][c] === 0 || visited.has(`${r},${c}`)) return;
    visited.add(`${r},${c}`);
    dfs(r, c + 1);
    dfs(r + 1, c);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] === 1 && !visited.has(`${r},${c}`)) {
        count++;
        dfs(r, c);
      }
    }
  }

  return count;
}
