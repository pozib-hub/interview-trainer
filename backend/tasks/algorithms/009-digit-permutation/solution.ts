// По времени: O(n * k log k), где n — количество чисел, k — средняя длина числа
//
export function digitPermutation(arr: number[]) {
  const map = new Map();

  for (const num of arr) {
    // const key = String(num)
    //   .split("")
    //   .filter((n) => n !== "0")
    //   .sort()
    //   .join();

    const key = String(num).replace(/0/g, "").split("").sort().join();

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key).push(num);
  }

  return Array.from(map.values());
}

// O(n * k) по времени — просто перебор цифр, без сортировки!
// Быстрее и легче по памяти, чем сортировка.
export function digitPermutation2(arr: number[]) {
  const map = new Map();

  for (const num of arr) {
    const freq = new Array(10).fill(0);
    let n = Math.abs(num);

    if (n === 0) {
      freq[0] = 1;
    } else {
      while (n > 0) {
        freq[n % 10]++;
        n = Math.floor(n / 10);
      }
    }

    const key = freq.join(",");

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key).push(num);
  }

  return Array.from(map.values());
}

console.clear();
console.log("start test");
console.log(
  digitPermutation([1230, 99, 23001, 123, 111, 300021, 101010, 90000009, 9])
); // [[99, 90000009], [111, 101010], [1230, 23001, 123, 300021], [9]]
console.log(digitPermutation([11, 22])); // [[11], [22]]
console.log(digitPermutation([111111111112, 122222222222])); // [[111111111112], [122222222222]]
console.log("end test");