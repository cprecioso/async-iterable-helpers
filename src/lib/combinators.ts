import { from } from "./creators";
import { flatMap } from "./pipes";
import type { AnyIterable } from "./util";
import type { Wrapper } from "./wrapper";

/**
 * Concatenates several sync or async iterables into a single async iterable,
 * yielding all items from the first, then the second, and so on. Each iterable
 * is consumed lazily, only when the previous one is exhausted.
 *
 * @param iterables The iterables to concatenate, in order.
 * @returns A wrapper yielding the awaited values of each iterable in sequence.
 */
export function concatAll<T>(
  iterables: AnyIterable<AnyIterable<T>>,
): Wrapper<Awaited<T>> {
  return from(iterables).pipe(flatMap((iterable) => from(iterable)));
}
