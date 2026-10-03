export type ApiRequest<T extends "GET" | "POST"> = {
  method: T;
  data: T extends "GET" ? string : number;
};

export function request<T extends "GET" | "POST">(args: ApiRequest<T>) {}

export const moviesRating = { titanic: 8, avatar: 8, inception: 9, batman: 7 };

export type Movies = keyof typeof moviesRating;
export type MoviesRating = Record<Movies, number>;

export let example: Partial<MoviesRating> = { titanic: 8 };
export let movie: Movies = "avatar";
