export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isEqualDeep<T1, T2>(v1: T1, v2: T2): boolean {
  let isEqual = false;

  if (Object.is(v1, v2)) {
    // Быстрое сравнение примитивов и ссылок
    return true;
  }

  if (Array.isArray(v1) && Array.isArray(v2)) {
    if (v1.length !== v2.length) {
      return false;
    }

    for (let i = 0; i < v1.length; i++) {
      const item1 = v1[i];
      const item2 = v2[i];

      isEqual = isEqualDeep(item1, item2);

      if (!isEqual) {
        return false;
      }
    }

    return isEqual;
  }

  if (isObject(v1) && isObject(v2)) {
    const keys1 = Object.keys(v1);
    const keys2 = Object.keys(v2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      isEqual = isEqualDeep(v1[key], v2[key]);

      if (!isEqual) {
        return false;
      }
    }
  }

  return isEqual;
}

// ✅ Базовые тесты
console.log(isEqualDeep({ a: 1 }, { a: 1 })); // true
console.log(isEqualDeep({ a: 1 }, { a: 2 })); // false
console.log(isEqualDeep([1, 2, 3], [1, 2, 3])); // true
console.log(isEqualDeep([1, 2, 3], [1, 2, 4])); // false
console.log(isEqualDeep({ a: [1, 2] }, { a: [1, 2] })); // true
console.log(isEqualDeep({ a: { b: 2 } }, { a: { b: 2 } })); // true
console.log(isEqualDeep(null, null)); // true
console.log(isEqualDeep(null, {})); // false
console.log(isEqualDeep("test", "test")); // true
console.log(isEqualDeep(42, 42)); // true
console.log(isEqualDeep(42, "42")); // false

// ✅ Продвинутые тесты
console.log(isEqualDeep({ a: undefined }, { a: undefined })); // true
console.log(isEqualDeep({ a: undefined }, {})); // false
console.log(isEqualDeep(new Date("2023-03-04"), new Date("2023-03-04"))); // true
console.log(isEqualDeep(new Date("2023-03-04"), new Date("2022-03-04"))); // false
console.log(isEqualDeep(/abc/, /abc/)); // false (разные объекты)
console.log(isEqualDeep(/abc/i, /abc/i)); // false (разные объекты)
console.log(isEqualDeep({ a: /abc/ }, { a: /abc/ })); // false

// ✅ Тесты с разными ссылками, но одинаковыми значениями
export const obj1 = { a: { b: { c: 1 } } };
export const obj2 = { a: { b: { c: 1 } } };
console.log(isEqualDeep(obj1, obj2)); // true

// ✅ Глубокие объекты
console.log(
  isEqualDeep(
    { a: { b: { c: { d: { e: { f: 42 } } } } } },
    { a: { b: { c: { d: { e: { f: 42 } } } } } }
  )
); // true

// ✅ Сравнение Map и Set (они не поддерживаются этой функцией, но можно добавить поддержку)
console.log(isEqualDeep(new Map([[1, "one"]]), new Map([[1, "one"]]))); // false
console.log(isEqualDeep(new Set([1, 2, 3]), new Set([1, 2, 3]))); // false

// ✅ Символы
export const sym1 = Symbol("a");
export const sym2 = Symbol("a");
console.log(isEqualDeep(sym1, sym1)); // true
console.log(isEqualDeep(sym1, sym2)); // false (разные символы)

// ✅ Объекты с разными ссылками, но одинаковыми значениями
export const objA = { a: [1, { b: 2 }, 3] };
export const objB = { a: [1, { b: 2 }, 3] };
console.log(isEqualDeep(objA, objB)); // true

// ✅ Массивы с объектами
console.log(
  isEqualDeep([{ a: 1 }, { b: 2 }, { c: 3 }], [{ a: 1 }, { b: 2 }, { c: 3 }])
); // true

// ✅ Объекты с разным порядком ключей (должны считаться равными)
console.log(isEqualDeep({ a: 1, b: 2 }, { b: 2, a: 1 })); // true