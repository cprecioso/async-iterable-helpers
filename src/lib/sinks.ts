import type { MaybePromise } from "./util";
import type { SinkFn } from "./wrapper";

/**
 * Folds the iterable into a single value by applying `fn` to an accumulator
 * and each item. The reducer may be async; its result is awaited.
 *
 * @param fn Combines the accumulator with the next item.
 * @param initialValue The accumulator's starting value.
 * @returns A sink resolving to the final accumulated value.
 */
export function reduce<T, U>(
  fn: (acc: U, item: Awaited<T>) => MaybePromise<U>,
  initialValue: U,
): SinkFn<T, U> {
  return async function (iterable) {
    let acc = initialValue;
    for await (const item of iterable) {
      acc = await fn(acc, item);
    }
    return acc;
  };
}

/**
 * Collects every item into an array, preserving order.
 *
 * @returns A sink resolving to an array of all items.
 */
export function toArray<T>(): SinkFn<T, Awaited<T>[]> {
  return reduce((acc, item) => {
    acc.push(item);
    return acc;
  }, [] as Awaited<T>[]);
}

/**
 * Takes the first item and stops consuming the source.
 *
 * @returns A sink resolving to the first item, or `undefined` if the iterable
 * is empty.
 */
export function first<T>(): SinkFn<T, T | undefined> {
  return async function (iterable) {
    for await (const item of iterable) {
      return item;
    }
    return undefined;
  };
}

/**
 * Consumes the whole iterable and keeps the last item.
 *
 * @returns A sink resolving to the last item, or `undefined` if the iterable
 * is empty.
 */
export function last<T>(): SinkFn<T, Awaited<T> | undefined> {
  return reduce((_, item) => item, undefined as Awaited<T> | undefined);
}
