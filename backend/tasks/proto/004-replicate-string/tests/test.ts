import { test, expect } from "vitest";
import "../solution";

test("повторение 2 раза", () => {
  expect("hello".replicate(2)).toBe("hellohello");
});

test("повторение 3 раза", () => {
  expect("code".replicate(3)).toBe("codecodecode");
});

test("повторение 1 раз", () => {
  expect("js".replicate(1)).toBe("js");
});

test("повторение длинной строки", () => {
  expect("ab".replicate(5)).toBe("ababababab");
});

test("повторение односимвольной строки", () => {
  expect("a".replicate(4)).toBe("aaaa");
});

test("большое количество повторений", () => {
  expect("x".replicate(1000)).toBe("x".repeat(1000));
});

test("this внутри метода — строковое значение", () => {
  expect(String.prototype.replicate.call("hi", 3)).toBe("hihihi");
});

test("не использует встроенный repeat", () => {
  const original = String.prototype.repeat;
  let called = false;
  String.prototype.repeat = function () {
    called = true;
    return original.apply(this, arguments as any);
  };
  "abc".replicate(2);
  String.prototype.repeat = original;
  expect(called).toBe(false);
});
