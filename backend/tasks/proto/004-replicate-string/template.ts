declare global {
  interface String {
    replicate(times: number): string;
  }
}

// TODO: реализуйте — назначьте метод replicate на String.prototype
String.prototype.replicate = function (times: number): string {
  return "";
};

export {};
