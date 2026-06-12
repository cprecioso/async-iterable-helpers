export type PipeFn<T, U> = (iterable: AsyncIterable<T>) => AsyncIterable<U>;
export type SinkFn<T, U> = (iterable: AsyncIterable<T>) => Promise<U>;

export class Wrapper<T> implements AsyncIterable<T> {
  #iterable;

  constructor(iterable: AsyncIterable<T>) {
    this.#iterable = iterable;
  }

  [Symbol.asyncIterator]() {
    return this.#iterable[Symbol.asyncIterator]();
  }

  /**
   * Applies a pipe to the wrapped iterable, returning a new {@link Wrapper}
   * over the transformed values. Lazy: nothing is consumed until a sink runs.
   *
   * @param fn The pipe to apply.
   * @returns A new {@link Wrapper} over the piped values.
   */
  pipe<U>(fn: PipeFn<T, U>): Wrapper<U> {
    return new Wrapper(fn(this.#iterable));
  }

  /**
   * Drives the wrapped iterable through a sink, consuming it and producing a
   * final value.
   *
   * @param fn The sink to apply.
   * @returns A promise resolving to the sink's result.
   */
  sink<U>(fn: SinkFn<T, U>): Promise<U> {
    return fn(this.#iterable);
  }
}
