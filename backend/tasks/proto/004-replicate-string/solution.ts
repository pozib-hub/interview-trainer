declare global {
  interface String {
    replicate(times: number): string;
  }
}

String.prototype.replicate = function (times: number): string {
  return new Array(times).fill(this).join("");
};

export {};
