import type { MaybePromise } from "./util";
import type { PipeFn } from "./wrapper";

export function map<T, U>(
  fn: (item: Awaited<T>) => MaybePromise<U>,
): PipeFn<T, Awaited<U>> {
  return async function* (iterable) {
    for await (const item of iterable) {
      yield await fn(item);
    }
  };
}

export function filter<T>(
  fn: (item: Awaited<T>) => MaybePromise<boolean>,
): PipeFn<T, T> {
  return async function* (iterable) {
    for await (const item of iterable) {
      if (await fn(item)) {
        yield item;
      }
    }
  };
}

export function filterMap<T, U>(
  fn: (item: Awaited<T>) => MaybePromise<U | null>,
): PipeFn<T, Awaited<U>> {
  return async function* (iterable) {
    for await (const item of iterable) {
      const result = await fn(item);
      if (result != null) {
        yield result;
      }
    }
  };
}

export function take<T>(n: number): PipeFn<T, T> {
  return async function* (iterable) {
    let i = 0;
    for await (const item of iterable) {
      if (i++ < n) {
        yield item;
      } else {
        break;
      }
    }
  };
}
