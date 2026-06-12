/** @inline */
export type MaybePromise<T> = T | Promise<T>;

export function compose<T, U, V>(f: (x: T) => U, g: (x: U) => V): (x: T) => V {
  return (x) => g(f(x));
}
