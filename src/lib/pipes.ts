import { concatAll } from "./combinators";
import { compose, type AnyIterable, type MaybePromise } from "./util";
import type { PipeFn } from "./wrapper";

/**
 * Invokes `fn` for each item in the source, yielding the original items unchanged.
 * The function may be async; its result is awaited.
 *
 * @param fn Function to invoke for each item.
 * @returns A pipe that yields the original items.
 */
export function tap<T>(
  fn: (item: Awaited<T>) => MaybePromise<void>,
): PipeFn<T, Awaited<T>> {
  return async function* (iterable) {
    for await (const item of iterable) {
      await fn(item);
      yield item;
    }
  };
}

/**
 * Pairs each item with its zero-based index, yielding `[index, item]` tuples in
 * order.
 *
 * @returns A pipe that yields `[index, item]` pairs.
 */
export function enumerated<T>(): PipeFn<T, [number, Awaited<T>]> {
  return async function* (iterable) {
    let i = 0;
    for await (const item of iterable) {
      yield [i++, item];
    }
  };
}

/**
 * Runs `fn` as a running accumulation over the source, yielding the accumulator
 * after each item. Like a `reduce` that emits every intermediate result. The
 * reducer may be async; its result is awaited before being yielded.
 *
 * @param fn Combines the current accumulator with an item to produce the next.
 * @param initial The starting accumulator value.
 * @returns A pipe that yields the accumulator after each item.
 */
export function scan<T, U>(
  fn: (acc: U, item: Awaited<T>) => MaybePromise<U>,
  initial: U,
): PipeFn<T, Awaited<U>> {
  return async function* (iterable) {
    let acc = initial;
    for await (const item of iterable) {
      acc = await fn(acc, item);
      yield acc;
    }
  };
}

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
