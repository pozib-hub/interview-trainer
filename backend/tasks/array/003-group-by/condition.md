# Это чисто для себя

Это чисто для себя

  function groupByKey<T, K extends keyof T>(
    array: T[],
    key: K
  ): Record<string | number | symbol, T[]> {
    return array.reduce((acc, element) => {
      const groupKey = element[key]; // Получаем ключ для группировки

      // Убедимся, что groupKey имеет тип string | number | symbol
      const groupKeyTyped = groupKey as string | number | symbol;

      if (acc[groupKeyTyped]) {
        acc[groupKeyTyped].push(element);
      } else {
        acc[groupKeyTyped] = [element];
      }

      return acc;
    }, {} as Record<string | number | symbol, T[]>); // Типизируем пустой объект как Record<string | number | symbol, T[]>
  }

  // Пример использования:
  const data = [
    { id: 1, category: "A", name: "Item 1" },
    { id: 2, category: "B", name: "Item 2" },
    { id: 3, category: "A", name: "Item 3" },
  ];

  console.log(groupByKey(data, "category"));
