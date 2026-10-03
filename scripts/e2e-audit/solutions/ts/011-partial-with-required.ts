export type User = { name?: string; age: number; email: string };

export type PartialWithRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type UserWithRequiredName = PartialWithRequired<User, "name">;
