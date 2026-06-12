import type { MaybePromise } from "./util";
import type { SinkFn } from "./wrapper";

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

export function toArray<T>(): SinkFn<T, T[]> {
  return reduce((acc, item) => {
    acc.push(item);
    return acc;
  }, [] as T[]);
}

export function first<T>(): SinkFn<T, T | undefined> {
  return async function (iterable) {
    for await (const item of iterable) {
      return item;
    }
    return undefined;
  };
}

export function last<T>(): SinkFn<T, T | undefined> {
  return async function (iterable) {
    let lastItem: T | undefined = undefined;
    for await (const item of iterable) {
      lastItem = item;
    }
    return lastItem;
  };
}
