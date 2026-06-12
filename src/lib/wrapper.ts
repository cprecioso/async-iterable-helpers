export type PipeFn<T, U> = (iterable: AsyncIterable<T>) => AsyncIterable<U>;
export type SinkFn<T, U> = (iterable: AsyncIterable<T>) => Promise<U>;

export class Wrapper<T> {
  #iterable;

  constructor(iterable: AsyncIterable<T>) {
    this.#iterable = iterable;
  }

  pipe<U>(fn: PipeFn<T, U>): Wrapper<U> {
    return new Wrapper(fn(this.#iterable));
  }

  sink<U>(fn: SinkFn<T, U>): Promise<U> {
    return fn(this.#iterable);
  }
}
