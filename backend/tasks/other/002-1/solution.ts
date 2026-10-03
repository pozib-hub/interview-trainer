export let counter = 0;
export function one() {
  console.log(++counter);
}
one();
export function two(callback: () => void) {
  let counter = 5;
  callback();
}

two(one);