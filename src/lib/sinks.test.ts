import { describe, expect, it } from "vitest";
import { from, of } from "./creators";
import { first, last, reduce, toArray } from "./sinks";

describe("reduce", () => {
  it("folds items into an accumulator", async () => {
    const sum = reduce((acc, n: number) => acc + n, 0);
    expect(await of(1, 2, 3, 4).sink(sum)).toBe(10);
  });

  it("returns the initial value for an empty source", async () => {
    const sum = reduce((acc, n: number) => acc + n, 42);
    expect(await of<number>().sink(sum)).toBe(42);
  });

  it("awaits async reducers", async () => {
    const sum = reduce(async (acc, n: number) => acc + n, 0);
    expect(await of(1, 2, 3).sink(sum)).toBe(6);
  });
});

describe("toArray", () => {
  it("collects all items into an array", async () => {
    expect(await of(1, 2, 3).sink(toArray<number>())).toEqual([1, 2, 3]);
  });

  it("returns an empty array for an empty source", async () => {
    expect(await of<number>().sink(toArray<number>())).toEqual([]);
  });
});

describe("first", () => {
  it("returns the first item", async () => {
    expect(await of(1, 2, 3).sink(first<number>())).toBe(1);
  });

  it("returns undefined for an empty source", async () => {
    expect(await of<number>().sink(first<number>())).toBeUndefined();
  });

  it("stops consuming after the first item", async () => {
    let produced = 0;
    async function* counting() {
      while (true) {
        produced++;
        yield produced;
      }
    }
    expect(await from(counting()).sink(first())).toBe(1);
    expect(produced).toBe(1);
  });
});

describe("last", () => {
  it("returns the last item", async () => {
    expect(await of(1, 2, 3).sink(last<number>())).toBe(3);
  });

  it("returns undefined for an empty source", async () => {
    expect(await of<number>().sink(last<number>())).toBeUndefined();
  });
});
