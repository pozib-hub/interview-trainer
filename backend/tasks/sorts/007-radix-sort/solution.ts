// O(n) - для чисел

export function radixSort(arr: number[]): number[] {
  const maxNum = Math.max(...arr);
  let digitPlace = 1;

  while (maxNum / digitPlace > 1) {
    countingSortByDigit(arr, digitPlace);
    digitPlace *= 10;
  }

  return arr;
}

export function countingSortByDigit(arr: number[], digitPlace: number) {
  const output = new Array(arr.length).fill(0);
  const count = new Array(10).fill(0);

  for (let num of arr) {
    count[Math.floor(num / digitPlace) % 10]++;
  }

  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1];
  }

  for (let i = arr.length - 1; i >= 0; i--) {
    const num = arr[i];
    const index = Math.floor(num / digitPlace) % 10;
    output[count[index] - 1] = num;
    count[index]--;
  }

  for (let i = 0; i < arr.length; i++) {
    arr[i] = output[i];
  }
}