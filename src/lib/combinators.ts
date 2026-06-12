/**
 * Concatenates several sync or async iterables into a single async iterable,
 * yielding all items from the first, then the second, and so on. Each iterable
 * is consumed lazily, only when the previous one is exhausted.
 *
 * @param iterables The iterables to concatenate, in order.
 * @returns An async iterable yielding the awaited values of each iterable in
 * sequence.
 */
export function concatAll<T>(
  iterables: (Iterable<T> | AsyncIterable<T>)[],
): AsyncIterable<Awaited<T>> {
  return (async function* () {
    for (const iterable of iterables) {
      yield* iterable;
    }
  })();
}
