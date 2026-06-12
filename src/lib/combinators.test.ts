import { describe, expect, it } from "vitest";
import { concatAll } from "./combinators";
import { from, of } from "./creators";
import { toArray } from "./sinks";

describe("concatAll", () => {
  it("concatenates several sync iterables in order", async () => {
    expect(
      await from(concatAll([[1, 2], [3], [4, 5]])).sink(toArray()),
    ).toEqual([1, 2, 3, 4, 5]);
  });

  it("concatenates async iterables", async () => {
    expect(await from(concatAll([of(1, 2), of(3, 4)])).sink(toArray())).toEqual(
      [1, 2, 3, 4],
    );
  });

  it("mixes sync and async iterables", async () => {
    expect(await from(concatAll([[1], of(2, 3)])).sink(toArray())).toEqual([
      1, 2, 3,
    ]);
  });

  it("yields nothing for no iterables", async () => {
    expect(await from(concatAll<number>([])).sink(toArray())).toEqual([]);
  });

  it("skips empty iterables", async () => {
    expect(await from(concatAll([[], [1], []])).sink(toArray())).toEqual([1]);
  });

  it("consumes each iterable lazily", async () => {
    let started = false;
    async function* second() {
      started = true;
      yield 3;
    }
    const it = concatAll<number>([[1, 2], second()])[Symbol.asyncIterator]();
    await it.next();
    expect(started).toBe(false);
  });
});
