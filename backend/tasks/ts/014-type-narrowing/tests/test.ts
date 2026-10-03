import { test, expect } from "vitest";
import { login, isManager, type User, type Manager, type UserMain } from "../solution";

test("login — User возвращает только имя", () => {
  const user: User = { name: "Alice" };
  expect(login(user)).toBe("Alice");
});

test("login — Manager возвращает имя и токен", () => {
  const manager: Manager = { name: "Bob", token: "abc123" };
  expect(login(manager)).toBe("Bob (abc123)");
});

test("isManager — true для Manager", () => {
  expect(isManager({ name: "Bob", token: "xyz" })).toBe(true);
});

test("isManager — false для User", () => {
  expect(isManager({ name: "Alice" })).toBe(false);
});

test("UserMain — объединение User | Manager", () => {
  const u: UserMain = { name: "test" };
  const m: UserMain = { name: "test", token: "t" };
  expect(u.name).toBe("test");
  expect(m.name).toBe("test");
});
