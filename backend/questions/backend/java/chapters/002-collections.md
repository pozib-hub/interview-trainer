# Collections и дженерики

## Как устроена иерархия Collections?

Две ветки. `Collection`: `List` (ArrayList, LinkedList), `Set` (HashSet, TreeSet, LinkedHashSet), `Queue`/`Deque` (ArrayDeque, PriorityQueue). Отдельно — `Map` (HashMap, TreeMap, LinkedHashMap), в Collection не входит.

```java
List<String> list = new ArrayList<>();
Set<Integer> set = new HashSet<>();
Map<String, Integer> map = new HashMap<>();
```

Выбор: порядок + индексы — List; уникальность — Set; пары ключ-значение — Map. Конкретный класс — по требованиям к порядку и производительности.

## Чем ArrayList отличается от LinkedList?

ArrayList — массив под капотом: O(1) доступ по индексу, дорогие вставки/удаления в середине (сдвиг), дешёвая итерация. LinkedList — двусвязный список: O(1) вставка при наличии итератора на позицию, доступ по индексу O(n), больше памяти на элемент.

```java
List<Integer> a = new ArrayList<>();  // чтение по индексу — базовый случай
List<Integer> l = new LinkedList<>(); // очередь/дек — лучше ArrayDeque
```

На практике LinkedList выигрывает редко: даже «дешёвая» вставка требует дорогой навигации. Для очередей — ArrayDeque, для списков — ArrayList.

## Как работает HashMap внутри?

Массив корзин; ключ попадает в корзину по `hash(key)`. Коллизии — цепочки (с Java 8 сбалансированное дерево при ≥8 узлах в корзине). При заполнении (load factor 0.75) — рехеш с удвоением ёмкости.

```java
Map<String, Integer> m = new HashMap<>();
m.put("a", 1);  // hash("a") → корзина
m.get("a");     // hash → корзина → equals по цепочке
```

Отсюда контракт equals/hashCode: нарушение — объект «теряется». Ключи-мутабельные объекты после вставки менять нельзя: hash устареет.

## Чем TreeMap отличается от HashMap?

TreeMap — красно-чёрное дерево: ключи упорядочены (natural ordering или Comparator), навигация (`floorKey`, `ceilingKey`, `headMap`), O(log n) операции. HashMap — без порядка, O(1) в среднем.

```java
TreeMap<Integer, String> tm = new TreeMap<>();
tm.put(3, "c"); tm.put(1, "a");
tm.firstKey();   // 1 — всегда отсортировано
```

Нужен порядок обхода — TreeMap (или LinkedHashMap для порядка вставки). Нужна скорость — HashMap.

## Что такое fail-fast итераторы?

Итераторы коллекций из `java.util` бросают `ConcurrentModificationException`, если коллекция структурно меняется во время итерации (вне `iterator.remove()`).

```java
for (String s : list) {
    if (s.isEmpty()) list.remove(s); // ConcurrentModificationException
}

// Правильно:
for (Iterator<String> it = list.iterator(); it.hasNext(); ) {
    if (it.next().isEmpty()) it.remove();
}
// или list.removeIf(String::isEmpty);
```

Fail-fast — защита от неопределённого поведения, а не гарантия: на многопоточных модификациях поведение всё равно не определено. Concurrent коллекции используют weakly consistent итераторы.

## Что такое дженерики и стирание типов?

Дженерики — параметризация типов: `List<String>` проверяется компилятором. Стирание — информация о типе-параметре в рантайме отсутствует: `List<String>` и `List<Integer>` — один класс `List`.

```java
List<String> a = new ArrayList<>();
// a.getClass() == b.getClass() — один и тот же класс

// Нельзя: new T(), T.class, instanceof List<String>
<T> T first(List<T> list) { return list.get(0); }
```

Стирание — цена обратной совместимости с Java 1.4. Обходные пути для «реификации»: передача `Class<T>` параметром, теги, super type tokens.

## Что такое bounded types и wildcards?

Ограничения сверху/снизу для гибкости API. `<? extends T>` — «читаем T» (producer), `<? super T>` — «пишем T» (consumer). PECS: Producer Extends, Consumer Super.

```java
// принимает List<Integer>, List<Double>…
double sum(List<? extends Number> src) {
    double s = 0;
    for (Number n : src) s += n.doubleValue();
    return s;
}

// пишет в любой Number-список
void fillWithZeros(List<? super Integer> dst) { dst.add(0); }
```

Без wildcards `List<Number>` и `List<Integer>` — разные типы без наследования: инвариантность дженериков.

## Что такое Stream API и когда его применять?

Декларативная обработка данных: filter/map/reduce/collect над источниками. Ленивые промежуточные операции, терминальная запускает конвейер.

```java
List<String> adults = users.stream()
    .filter(u -> u.getAge() >= 18)
    .map(User::getName)
    .sorted()
    .collect(Collectors.toList());

int total = orders.parallelStream() // параллельный вариант
    .mapToInt(Order::amount)
    .sum();
```

Силы — читаемость конвейеров и parallelStream. Слабости — отладка и overhead для простых циклов: `for` для 5 элементов читаемее stream.
