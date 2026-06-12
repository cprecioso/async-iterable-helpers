import { describe, expect, it } from "vitest";
import { of } from "./creators";
import { toArray } from "./sinks";
import { Wrapper } from "./wrapper";

describe("Wrapper", () => {
  it("pipe applies a transform and returns a new Wrapper", async () => {
    const wrapped = of(1, 2, 3);
    const piped = wrapped.pipe(async function* (iterable) {
      for await (const item of iterable) yield item * 2;
    });
    expect(piped).toBeInstanceOf(Wrapper);
    expect(await piped.sink(toArray())).toEqual([2, 4, 6]);
  });

  it("pipe calls can be chained", async () => {
    const result = of(1, 2, 3, 4)
      .pipe(async function* (iterable) {
        for await (const item of iterable) if (item % 2 === 0) yield item;
      })
      .pipe(async function* (iterable) {
        for await (const item of iterable) yield item + 1;
      });
    expect(await result.sink(toArray())).toEqual([3, 5]);
  });

  it("sink consumes the iterable and returns a promise", async () => {
    const wrapped = of(1, 2, 3);
    const total = await wrapped.sink(async (iterable) => {
      let acc = 0;
      for await (const item of iterable) acc += item;
      return acc;
    });
    expect(total).toBe(6);
  });
});
