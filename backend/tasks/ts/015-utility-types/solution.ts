export type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};

// =============================================================

export type MyOmit<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
};

// =============================================================

export type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// =============================================================

export type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// =============================================================

export type MyRequired<T> = {
  [P in keyof T]-?: T[P];
};

// =============================================================

export type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

// =============================================================
export type MyExclude<T, U> = T extends U ? never : T;

// =============================================================

export type MyExtract<T, U> = T extends U ? T : never;

// =============================================================

export type MyReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : never;

// =============================================================

export type MyInstanceType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : never;

// type PersonInstance = MyInstanceType<typeof Person>;