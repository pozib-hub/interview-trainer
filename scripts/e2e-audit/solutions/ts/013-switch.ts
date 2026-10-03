export type BikeType = { type: "bike"; ride: () => void };
export type CarType = { type: "car"; drive: () => void };
export type PlaneType = { type: "plane"; fly: () => void };

export class Bike {
  ride() {}
}
export class Car {
  drive() {}
}
export class Plane {
  fly() {}
}

export const carType: CarType = { type: "car", drive: () => {} };
export const bikeType: BikeType = { type: "bike", ride: () => {} };
export const planeType: PlaneType = { type: "plane", fly: () => {} };

export const carInstance = new Car();
export const bikeInstance = new Bike();
export const planeInstance = new Plane();

export const actWithType = (entity: BikeType | CarType | PlaneType) => {
  switch (entity.type) {
    case "bike":
      return entity.ride();
    case "car":
      return entity.drive();
    case "plane":
      return entity.fly();
  }
};

export const actWithClass = (entity: Bike | Car | Plane) => {
  if (entity instanceof Bike) {
    return entity.ride();
  }
  if (entity instanceof Car) {
    return entity.drive();
  }
  if (entity instanceof Plane) {
    return entity.fly();
  }
};
