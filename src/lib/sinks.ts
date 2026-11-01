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

/**
 * Groups items into a null-prototype object according to the key returned by
 * `fn`. The async counterpart of `Object.groupBy`. The key function may be
 * async; its result is awaited.
 *
 * @param fn Returns the group key for each item.
 * @returns A sink resolving to an object mapping each key to the items in that
 * group, in source order.
 */
export function groupObject<T, K extends PropertyKey>(
  fn: (item: Awaited<T>) => MaybePromise<K>,
): SinkFn<T, Partial<Record<K, Awaited<T>[]>>> {
  return async function (iterable) {
    const groups: Partial<Record<K, Awaited<T>[]>> = Object.create(null);
    for await (const item of iterable) {
      const key = await fn(item);
      (groups[key] ??= []).push(item);
    }
    return groups;
  };
}

/**
 * Groups items into a `Map` according to the key returned by `fn`. The async
 * counterpart of `Map.groupBy`. Keys are compared with SameValueZero, so they
 * may be any value. The key function may be async; its result is awaited.
 *
 * @param fn Returns the group key for each item.
 * @returns A sink resolving to a `Map` from each key to the items in that
 * group, in source order.
 */
export function groupMap<T, K>(
  fn: (item: Awaited<T>) => MaybePromise<K>,
): SinkFn<T, Map<K, Awaited<T>[]>> {
  return async function (iterable) {
    const groups = new Map<K, Awaited<T>[]>();
    for await (const item of iterable) {
      const key = await fn(item);
      let group = groups.get(key);
      if (!group) groups.set(key, (group = []));
      group.push(item);
    }
    return groups;
  };
}
