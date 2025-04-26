export type TryCatch<T = unknown, E = unknown> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: E;
    };
