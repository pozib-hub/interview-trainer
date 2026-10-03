export function sumIntervals(intervals: [number, number][]) {
  const sorted = intervals.sort((a, b) => a[0] - b[0]);
  let max = 0;
  let res = 0;

  for (let i = 0; i < sorted.length; i++) {
    const [left, right] = sorted[i];
    if (left > max) {
      res += right - left;
    } else if (right > max) {
      res += right - max;
    }
    max = Math.max(right, max);
  }
  return res;
}

// prettier-ignore
console.log(sumIntervals([[1, 5], [6, 10]])); // 8

// prettier-ignore
console.log(sumIntervals([[1, 4], [3, 5]])); // 4  (отрезки [1,4] и [3,5] перекрываются)

// prettier-ignore
console.log(sumIntervals([[1, 2], [2, 3], [3, 4]])); // 3

// prettier-ignore
console.log(sumIntervals([[1, 10], [2, 6], [8, 12]])); // 11