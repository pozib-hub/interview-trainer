export function Count() {
  let counter = 0;
  return () => {
    console.log(counter++);
  };
}

export const c = Count();

c();
c();

c.counter = 0;

c();

export const b = Count();

b();
