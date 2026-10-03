export interface User {
  name?: string;
  age: number;
  email: string;
}

export type PartialWithRequired<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

export type UserWithRequiredName = PartialWithRequired<User, "name">;

export const user: UserWithRequiredName = {
  name: "John",
  age: 323,
  email: "dsdsd@gmail.com",
};
