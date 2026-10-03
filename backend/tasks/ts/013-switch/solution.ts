export type BikeType = { type: "bike"; ride: () => void };
export type CarType = { type: "car"; drive: () => void };
export type PlaneType = { type: "plane"; fly: () => void };

export const actWithType = (entity: BikeType | CarType | PlaneType) => {
  switch (entity.type) {
    case "bike":
      entity.ride();
      break;
    case "car":
      entity.drive();
      break;
    case "plane":
      entity.fly();
      break;
  }
};

export const carType: CarType = { type: "car", drive: () => {} };
export const bikeType: BikeType = { type: "bike", ride: () => {} };
export const planeType: PlaneType = { type: "plane", fly: () => {} };

export class Bike {
  ride() {}
}

export class Car {
  drive() {}
}

export class Plane {
  fly() {}
}

export const actWithClass = (entity: Bike | Car | Plane) => {
  if (entity instanceof Bike) {
    entity.ride();
  } else if (entity instanceof Car) {
    entity.drive();
  } else if (entity instanceof Plane) {
    entity.fly();
  }
};

export const carInstance = new Car();
export const bikeInstance = new Bike();
export const planeInstance = new Plane();
