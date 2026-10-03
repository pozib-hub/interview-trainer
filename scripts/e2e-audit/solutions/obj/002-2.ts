export let a = 1;
export let b = 3;

export function c() {
  let b = 4;
  a = 4;
}

c();
