export const isInteger = (value: number): boolean => {
  //   return Number.parseInt(value) === value;
  return isFinite(value) && Math.floor(value) === value;
  // return value === parseInt(value, 10);
  // return value % 1 === 0;
};

console.log(isInteger(232.232));
console.log(isInteger(232));