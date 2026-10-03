export type ApiRequest<T extends "GET" | "POST"> = {
  method: T;
  data: T extends "GET" ? string : number;
};

export type Movies = "titanic" | "avatar" | "inception" | "batman";
export type MoviesRating = Record<Movies, number>;

export const moviesRating: MoviesRating = {
  titanic: 8,
  avatar: 8,
  inception: 9,
  batman: 7,
};
