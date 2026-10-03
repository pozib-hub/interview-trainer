import { test, expect, expectTypeOf } from "vitest";
import type { BikeType, CarType, PlaneType } from "../solution";
import { actWithType, actWithClass, Bike, Car, Plane, carType, bikeType, planeType, carInstance, bikeInstance, planeInstance } from "../solution";

test("BikeType имеет type: 'bike'", () => {
  expectTypeOf<BikeType["type"]>().toEqualTypeOf<"bike">();
});

test("CarType имеет type: 'car'", () => {
  expectTypeOf<CarType["type"]>().toEqualTypeOf<"car">();
});

test("PlaneType имеет type: 'plane'", () => {
  expectTypeOf<PlaneType["type"]>().toEqualTypeOf<"plane">();
});

test("actWithType — функция", () => {
  expect(typeof actWithType).toBe("function");
});

test("actWithClass — функция", () => {
  expect(typeof actWithClass).toBe("function");
});

test("carInstance — instanceof Car", () => {
  expect(carInstance).toBeInstanceOf(Car);
});

test("bikeInstance — instanceof Bike", () => {
  expect(bikeInstance).toBeInstanceOf(Bike);
});

test("planeInstance — instanceof Plane", () => {
  expect(planeInstance).toBeInstanceOf(Plane);
});

test("type-объекты имеют правильные типы", () => {
  expectTypeOf(carType).toMatchObjectType<{ type: "car"; drive: () => void }>();
  expectTypeOf(bikeType).toMatchObjectType<{ type: "bike"; ride: () => void }>();
  expectTypeOf(planeType).toMatchObjectType<{ type: "plane"; fly: () => void }>();
});
