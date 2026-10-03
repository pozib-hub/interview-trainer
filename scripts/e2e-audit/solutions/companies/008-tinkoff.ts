export function minDifference(nums: number[], k: number): number {
  if (nums.length === 0 || k <= 1) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  let min = Infinity;
  for (let i = 0; i + k - 1 < sorted.length; i++) {
    const diff = sorted[i + k - 1] - sorted[i];
    if (diff < min) min = diff;
  }
  return min;
}

export function countShips(matrix: number[][]): number {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  const visited: boolean[][] = Array.from({ length: rows }, () => new Array(cols).fill(false));
  let ships = 0;

  const dfs = (r: number, c: number) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    if (visited[r][c] || matrix[r][c] !== 1) return;
    visited[r][c] = true;
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] === 1 && !visited[r][c]) {
        ships++;
        dfs(r, c);
      }
    }
  }
  return ships;
}
