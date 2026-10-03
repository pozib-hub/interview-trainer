# TS: type narrowing

Даны типы:

```ts
type User = { name: string };
type Manager = { name: string; token: string };
type UserMain = User | Manager;
```

1. Реализуйте `login(user: UserMain): string` — если у пользователя есть `token`, вернуть `"${name} (${token})"`, иначе просто `name`.

2. Реализуйте type guard `isManager(user: UserMain): user is Manager`.
