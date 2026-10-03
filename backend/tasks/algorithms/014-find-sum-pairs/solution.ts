export const findSumPairs = (array: number[], targetSum: number) => {
  const hash: Record<string, number> = {};

  for (let index = 0; index < array.length; index++) {
    // 4
    const pair1 = array[index];

    // 12 - 4 = 8
    const pair2 = targetSum - pair1;

    if (hash[pair2]) {
      return [pair2, pair1];
    }

    // 12 = { 4 : 8 }
    hash[pair1] = pair2;
  }

  return [];
};

console.log(findSumPairs([6, 4, 7, 0, 1, 2, 8, 5], 7));

// // [1, 2, 6, 4, 8, 5], targetSum 7=> [1,6]

// const findSumPairs = (array: number[], targetSum: number) => {
//     const pairs: number[] = [];
//     //   const hash: Record<number, number> = {};

//     for (let i = 0; i < array.length; i++) {
//       const pair1 = array[i];

//       for (let j = i + 1; j < array.length; j++) {
//         const pair2 = array[j];
//         const sum = pair1 + pair2;

//         if (sum === targetSum) {
//           return [pair1, pair2];
//         }
//       }
//     }

//     return pairs;
//   };

//   console.log(findSumPairs([1, 2, 6, 4, 8, 5], 7));

//   function twoSum(arr: number[], targetSum: number): number[] | null {
//     const seen = new Set<number>();

//     for (const num of arr) {
//       const complement = targetSum - num;

//       if (seen.has(complement)) {
//         return [complement, num];
//       }

//       seen.add(num);
//     }

//     return null; // если нет пары
//   }

//   console.log(twoSum([1, 2, 6, 4, 8, 5], 12));