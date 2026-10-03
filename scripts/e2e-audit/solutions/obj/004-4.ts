export function Count() {
  let counter = 0;
  const fn = () => {
    console.log(counter);
    counter++;
  };
  return fn;
}

export const c = Count();
export const b = Count();
