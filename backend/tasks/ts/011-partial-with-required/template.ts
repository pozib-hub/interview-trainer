export type User = { name?: string; age: number; email: string };
export type PartialWithRequired<T, K extends keyof T> = any;
export type UserWithRequiredName = any;
