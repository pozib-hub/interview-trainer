export type Type = readonly unknown[];

export type Concat<T extends Type, U extends Type> = [...T, ...U];