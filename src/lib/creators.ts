import type { AnyIterable } from "./util";
import { Wrapper } from "./wrapper";

/**
 * Wraps a sync or async iterable in a {@link Wrapper}, so it can be composed
 * with pipes and sinks.
 *
 * @param iterable The source iterable to wrap.
 * @returns A {@link Wrapper} yielding the awaited values of the source.
 */
export function from<T>(iterable: AnyIterable<T>): Wrapper<Awaited<T>> {
  return new Wrapper(
    (async function* () {
      yield* iterable;
    })(),
  );
}

/**
 * Wraps an iterable that is produced lazily by an async function. `fn` is only
 * called once iteration starts, so any setup it does (and any error it throws)
 * is deferred until then.
 *
 * @param fn A function returning a promise of the source iterable.
 * @returns A {@link Wrapper} yielding the awaited values of the produced
 *   iterable.
 */
export function create<T>(
  fn: () => Promise<AnyIterable<T>>,
): Wrapper<Awaited<T>> {
  return from(
    (async function* () {
      yield* await fn();
    })(),
  );
}

/**
 * Wraps a fixed list of items in a {@link Wrapper}.
 *
 * @param items The items to wrap.
 * @returns A {@link Wrapper} yielding the awaited values of the items.
 */
export function of<T>(...items: readonly T[]): Wrapper<Awaited<T>> {
  return from(items);
}

/**
 * Wraps an empty sequence.
 *
 * @returns A {@link Wrapper} that yields no items.
 */
export function empty(): Wrapper<never> {
  return from([]);
}

/**
 * Wraps an infinite sequence that repeats the same item forever. Combine with
 * a pipe like {@link take} to bound it.
 *
 * @param item The item to yield repeatedly.
 * @returns A {@link Wrapper} that yields `item` endlessly.
 */
export function infinite<T>(item: T): Wrapper<T> {
  return new Wrapper(
    (async function* () {
      while (true) {
        yield item;
      }
    })(),
  );
}
