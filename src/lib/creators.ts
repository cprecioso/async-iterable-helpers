import { Wrapper } from "./wrapper";

/**
 * Wraps a sync or async iterable in a {@link Wrapper}, so it can be composed
 * with pipes and sinks.
 *
 * @param iterable The source iterable to wrap.
 * @returns A {@link Wrapper} yielding the awaited values of the source.
 */
export function from<T>(
  iterable: Iterable<T> | AsyncIterable<T>,
): Wrapper<Awaited<T>> {
  return new Wrapper(
    (async function* () {
      yield* iterable;
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
