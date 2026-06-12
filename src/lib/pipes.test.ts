import { describe, expect, it } from "vitest";
import { from, of } from "./creators";
import { filter, filterMap, map, take } from "./pipes";
import { toArray } from "./sinks";

describe("map", () => {
  it("transforms each item", async () => {
    expect(
      await of(1, 2, 3)
        .pipe(map((n: number) => n * 2))
        .sink(toArray()),
    ).toEqual([2, 4, 6]);
  });

  it("awaits async mapping functions", async () => {
    expect(
      await of(1, 2)
        .pipe(map(async (n: number) => n + 1))
        .sink(toArray()),
    ).toEqual([2, 3]);
  });

  it("yields nothing for an empty source", async () => {
    expect(
      await of<number>()
        .pipe(map((n: number) => n))
        .sink(toArray()),
    ).toEqual([]);
  });
});

describe("filter", () => {
  it("keeps only matching items", async () => {
    expect(
      await of(1, 2, 3, 4)
        .pipe(filter((n: number) => n % 2 === 0))
        .sink(toArray()),
    ).toEqual([2, 4]);
  });

  it("awaits async predicates", async () => {
    expect(
      await of(1, 2, 3)
        .pipe(filter(async (n: number) => n > 1))
        .sink(toArray()),
    ).toEqual([2, 3]);
  });

  it("yields nothing when nothing matches", async () => {
    expect(
      await of(1, 2)
        .pipe(filter(() => false))
        .sink(toArray()),
    ).toEqual([]);
  });
});

describe("filterMap", () => {
  it("maps and drops null/undefined results", async () => {
    expect(
      await of(1, 2, 3, 4)
        .pipe(filterMap((n: number) => (n % 2 === 0 ? n * 10 : null)))
        .sink(toArray()),
    ).toEqual([20, 40]);
  });

  it("drops undefined results", async () => {
    expect(
      await of(1, 2, 3)
        .pipe(filterMap((n: number) => (n === 2 ? undefined : n)))
        .sink(toArray()),
    ).toEqual([1, 3]);
  });

  it("keeps falsy non-null values like 0 and empty string", async () => {
    expect(
      await of(1, 2)
        .pipe(filterMap((n: number) => (n === 1 ? 0 : "")))
        .sink(toArray()),
    ).toEqual([0, ""]);
  });

  it("awaits async mapping functions", async () => {
    expect(
      await of(1, 2, 3)
        .pipe(filterMap(async (n: number) => (n > 1 ? n : null)))
        .sink(toArray()),
    ).toEqual([2, 3]);
  });
});

describe("take", () => {
  it("yields at most n items", async () => {
    expect(await of(1, 2, 3, 4).pipe(take(2)).sink(toArray())).toEqual([1, 2]);
  });

  it("yields everything when n exceeds length", async () => {
    expect(await of(1, 2).pipe(take(10)).sink(toArray())).toEqual([1, 2]);
  });

  it("yields nothing when n is 0", async () => {
    expect(await of(1, 2, 3).pipe(take(0)).sink(toArray())).toEqual([]);
  });

  it("stops consuming the source once n items are taken", async () => {
    let produced = 0;
    async function* counting() {
      while (true) {
        produced++;
        yield produced;
      }
    }
    expect(await from(counting()).pipe(take(3)).sink(toArray())).toEqual([
      1, 2, 3,
    ]);
    // One extra item is pulled before the break short-circuits.
    expect(produced).toBe(4);
  });
});
