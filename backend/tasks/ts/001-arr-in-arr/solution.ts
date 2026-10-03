export type Arr = Array<number | Arr>;
// type Arr = (number | Arr)[];

export const arr: Arr = [1, 2, 3, [1, 2, 3, [1, 2, 3]]];