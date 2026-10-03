export type IsNever<T> = [T] extends [never] ? true : false;

export type IsTuple<T> = T extends readonly any[]
  ? number extends T["length"]
    ? false
    : true
  : false;
