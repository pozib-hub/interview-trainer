# TS: discriminated unions и switch

Даны три типа транспортных средств:

```ts
type BikeType = { type: "bike"; ride: () => void };
type CarType = { type: "car"; drive: () => void };
type PlaneType = { type: "plane"; fly: () => void };
```

1. Реализуйте `actWithType(entity: BikeType | CarType | PlaneType)` — вызывает нужный метод в зависимости от `type` через `switch`.

2. Создайте классы `Bike`, `Car`, `Plane` с методами `ride()`, `drive()`, `fly()` соответственно.

3. Реализуйте `actWithClass(entity: Bike | Car | Plane)` — вызывает нужный метод через `instanceof`.

Создайте экспортируемые экземпляры: `carType`, `bikeType`, `planeType`, `carInstance`, `bikeInstance`, `planeInstance`.
