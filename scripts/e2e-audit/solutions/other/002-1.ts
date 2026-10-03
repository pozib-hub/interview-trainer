export let counter = 0;

export function one() {
  counter++;
}

export function two(callback: () => void) {
  let counter = 5;
  callback();
}
