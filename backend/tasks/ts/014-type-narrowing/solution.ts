export type User = {
  name: string;
};

export type Manager = {
  name: string;
  token: string;
};

export type UserMain = User | Manager;

export function login(user: UserMain): string {
  if ("token" in user) {
    return `${user.name} (${user.token})`;
  }
  return user.name;
}

export function isManager(user: UserMain): user is Manager {
  return "token" in user;
}
