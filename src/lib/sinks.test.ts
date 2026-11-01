import { describe, expect, it } from "vitest";
import { from, of } from "./creators";
import { first, groupMap, groupObject, last, reduce, toArray } from "./sinks";

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

describe("groupObject", () => {
  it("groups items by key, preserving order", async () => {
    const result = await of(1, 2, 3, 4, 5).sink(
      groupObject((n: number) => (n % 2 ? "odd" : "even")),
    );
    expect(result).toEqual({ odd: [1, 3, 5], even: [2, 4] });
  });

  it("returns a null-prototype object", async () => {
    const result = await of(1).sink(groupObject(() => "a"));
    expect(Object.getPrototypeOf(result)).toBeNull();
  });

  it("returns an empty object for an empty source", async () => {
    expect(await of<number>().sink(groupObject(() => "a"))).toEqual({});
  });

  it("awaits async key functions", async () => {
    const result = await of("a", "bb", "c").sink(
      groupObject(async (s: string) => (s.length < 2 ? "short" : "long")),
    );
    expect(result).toEqual({ short: ["a", "c"], long: ["bb"] });
  });
});

describe("groupMap", () => {
  it("groups items by key, preserving order", async () => {
    const result = await of(1, 2, 3, 4, 5).sink(
      groupMap((n: number) => n % 2 === 0),
    );
    expect([...result]).toEqual([
      [false, [1, 3, 5]],
      [true, [2, 4]],
    ]);
  });

  it("uses object identity for keys", async () => {
    const a = {};
    const b = {};
    const result = await of(1, 2, 3).sink(
      groupMap((n: number) => (n === 2 ? b : a)),
    );
    expect(result.get(a)).toEqual([1, 3]);
    expect(result.get(b)).toEqual([2]);
  });

  it("returns an empty map for an empty source", async () => {
    expect((await of<number>().sink(groupMap(() => 0))).size).toBe(0);
  });

  it("awaits async key functions", async () => {
    const result = await of("a", "bb", "c").sink(
      groupMap(async (s: string) => s.length),
    );
    expect([...result]).toEqual([
      [1, ["a", "c"]],
      [2, ["bb"]],
    ]);
  });
});
