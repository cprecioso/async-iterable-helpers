import { describe, expect, it } from "vitest";
import { from, of } from "./creators";
import { toArray } from "./sinks";

describe("from", () => {
  it("wraps a sync iterable", async () => {
    expect(await from([1, 2, 3]).sink(toArray())).toEqual([1, 2, 3]);
  });

  it("wraps an async iterable", async () => {
    expect(await from(of("a", "b")).sink(toArray())).toEqual(["a", "b"]);
  });

  it("wraps any sync iterable, not just arrays", async () => {
    expect(await from(new Set([1, 1, 2, 3])).sink(toArray())).toEqual([
      1, 2, 3,
    ]);
  });

  it("wraps an empty iterable", async () => {
    expect(await from([]).sink(toArray())).toEqual([]);
  });

  it("awaits yielded promises", async () => {
    expect(
      await from([Promise.resolve(1), Promise.resolve(2)]).sink(toArray()),
    ).toEqual([1, 2]);
  });

  it("returns a Wrapper that can be sunk", async () => {
    const result = await from([1, 2, 3]).sink(async (iterable) => {
      let total = 0;
      for await (const item of iterable) total += item;
      return total;
    });
    expect(result).toBe(6);
  });
});

describe("of", () => {
  it("wraps a fixed list of items", async () => {
    expect(await of(1, 2, 3).sink(toArray())).toEqual([1, 2, 3]);
  });

  it("wraps no items", async () => {
    expect(await of().sink(toArray())).toEqual([]);
  });

  it("awaits yielded promises", async () => {
    expect(await of(Promise.resolve("x")).sink(toArray())).toEqual(["x"]);
  });
});
