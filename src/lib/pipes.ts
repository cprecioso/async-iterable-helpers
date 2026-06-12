import type { MaybePromise } from "./util";
import type { PipeFn } from "./wrapper";

/**
 * Transforms each item using `fn`. The mapping function may be async; its
 * result is awaited before being yielded.
 *
 * @param fn Maps an item to a new value (or a promise of one).
 * @returns A pipe that yields the mapped values.
 */
export function map<T, U>(
  fn: (item: Awaited<T>) => MaybePromise<U>,
): PipeFn<T, Awaited<U>> {
  return async function* (iterable) {
    for await (const item of iterable) {
      yield await fn(item);
    }
  };
}

/**
 * Keeps only the items for which `fn` returns a truthy value. The predicate
 * may be async; its result is awaited.
 *
 * @param fn Predicate deciding whether to keep an item.
 * @returns A pipe that yields the items passing the predicate.
 */
export function filter<T>(
  fn: (item: Awaited<T>) => MaybePromise<boolean>,
): PipeFn<T, Awaited<T>> {
  return async function* (iterable) {
    for await (const item of iterable) {
      if (await fn(item)) {
        yield item;
      }
    }
  };
}

/**
 * Maps and filters in a single step: items for which `fn` returns `null` (or
 * `undefined`) are dropped, all other results are yielded. The mapping
 * function may be async; its result is awaited.
 *
 * @param fn Maps an item to a value to yield, or `null`/`undefined` to drop it.
 * @returns A pipe that yields the non-nullish mapped values.
 */
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

/**
 * Yields at most the first `n` items, then stops consuming the source.
 *
 * @param n The maximum number of items to yield.
 * @returns A pipe that yields up to `n` items.
 */
export function take<T>(n: number): PipeFn<T, Awaited<T>> {
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
