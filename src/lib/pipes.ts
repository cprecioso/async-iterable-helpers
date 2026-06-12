import { concatAll } from "./combinators";
import { compose, type AnyIterable, type MaybePromise } from "./util";
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

/**
 * Appends another sync or async iterable after the source, yielding all of the
 * source's items first, then all of `iterable`'s.
 *
 * @param iterable The iterable to yield after the source is exhausted.
 * @returns A pipe that yields the source followed by `iterable`.
 */
export function concat<T>(iterable: AnyIterable<T>): PipeFn<T, Awaited<T>> {
  return (source) => concatAll([source, iterable]);
}

/**
 * Yields the given items before the source's items.
 *
 * @param items The items to yield ahead of the source.
 * @returns A pipe that yields `items` followed by the source.
 */
export function prepend<T>(...items: readonly T[]): PipeFn<T, Awaited<T>> {
  return (source) => concatAll([items, source]);
}

/**
 * Yields the given items after the source's items.
 *
 * @param items The items to yield once the source is exhausted.
 * @returns A pipe that yields the source followed by `items`.
 */
export function append<T>(...items: readonly T[]): PipeFn<T, Awaited<T>> {
  return (source) => concatAll([source, items]);
}

/**
 * Flattens a source of iterables by one level, yielding each inner item in
 * order. The inner iterables may be sync or async.
 *
 * @returns A pipe that yields the items of each inner iterable.
 */
export function flatten<T>(): PipeFn<AnyIterable<T>, Awaited<T>> {
  return async function* (iterable) {
    for await (const item of iterable) {
      yield* item;
    }
  };
}

/**
 * Maps each item to an iterable and flattens the results by one level. The
 * mapping function may be async, and may return a sync or async iterable.
 *
 * @param fn Maps an item to an iterable of values to yield.
 * @returns A pipe that yields the flattened mapped values.
 */
export function flatMap<T, U>(
  fn: (item: Awaited<T>) => MaybePromise<AnyIterable<U>>,
): PipeFn<T, Awaited<U>> {
  return compose(map(fn), flatten());
}
