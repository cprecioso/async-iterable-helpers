import { Wrapper } from "./wrapper";

export function from<T>(
  iterable: Iterable<T> | AsyncIterable<T>,
): Wrapper<Awaited<T>> {
  return new Wrapper(
    (async function* () {
      yield* iterable;
    })(),
  );
}

export function of<T>(...items: readonly T[]): Wrapper<Awaited<T>> {
  return from(items);
}
