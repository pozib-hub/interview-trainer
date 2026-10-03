export type User = { name: string };
export type Manager = { name: string; token: string };
export type UserMain = User | Manager;

export function isManager(user: UserMain): user is Manager {
  return "token" in user;
}

export function login(user: UserMain): string {
  if (isManager(user)) {
    return `${user.name} (${user.token})`;
  }
  return user.name;
}
