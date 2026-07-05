import { describe, expect, it } from "vitest";
import { from, of } from "./creators";
import {
  append,
  concat,
  filter,
  filterMap,
  flatMap,
  flatten,
  map,
  prepend,
  scan,
  take,
  tap,
} from "./pipes";
import { toArray } from "./sinks";

describe("tap", () => {
  it("yields the original items unchanged", async () => {
    expect(
      await of(1, 2, 3)
        .pipe(tap(() => {}))
        .sink(toArray()),
    ).toEqual([1, 2, 3]);
  });

  it("invokes fn once for each item in order", async () => {
    const seen: number[] = [];
    await of(1, 2, 3)
      .pipe(tap((n: number) => void seen.push(n)))
      .sink(toArray());
    expect(seen).toEqual([1, 2, 3]);
  });

  it("awaits async functions before yielding", async () => {
    const seen: number[] = [];
    const result = await of(1, 2, 3)
      .pipe(
        tap(async (n: number) => {
          seen.push(n);
        }),
      )
      .sink(toArray());
    expect(result).toEqual([1, 2, 3]);
    expect(seen).toEqual([1, 2, 3]);
  });

  it("does not modify items when fn returns a value", async () => {
    expect(
      await of(1, 2)
        .pipe(tap((n: number) => (n * 100) as unknown as void))
        .sink(toArray()),
    ).toEqual([1, 2]);
  });

  it("does not invoke fn for an empty source", async () => {
    let calls = 0;
    expect(
      await of<number>()
        .pipe(tap(() => void calls++))
        .sink(toArray()),
    ).toEqual([]);
    expect(calls).toBe(0);
  });
});

describe("scan", () => {
  it("yields the accumulator after each item", async () => {
    expect(
      await of(1, 2, 3, 4)
        .pipe(scan((acc: number, n: number) => acc + n, 0))
        .sink(toArray()),
    ).toEqual([1, 3, 6, 10]);
  });

  it("does not yield the initial value", async () => {
    expect(
      await of<number>()
        .pipe(scan((acc: number, n: number) => acc + n, 42))
        .sink(toArray()),
    ).toEqual([]);
  });

  it("awaits async reducers", async () => {
    expect(
      await of(1, 2, 3)
        .pipe(scan(async (acc: number, n: number) => acc + n, 0))
        .sink(toArray()),
    ).toEqual([1, 3, 6]);
  });

  it("can accumulate into a different type", async () => {
    expect(
      await of("a", "b", "c")
        .pipe(scan((acc: string[], s: string) => [...acc, s], [] as string[]))
        .sink(toArray()),
    ).toEqual([["a"], ["a", "b"], ["a", "b", "c"]]);
  });
});

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

describe("concat", () => {
  it("yields the source followed by a sync iterable", async () => {
    expect(
      await of(1, 2)
        .pipe(concat([3, 4]))
        .sink(toArray()),
    ).toEqual([1, 2, 3, 4]);
  });

  it("yields the source followed by an async iterable", async () => {
    expect(
      await of(1, 2)
        .pipe(concat(of(3, 4)))
        .sink(toArray()),
    ).toEqual([1, 2, 3, 4]);
  });

  it("handles an empty source", async () => {
    expect(
      await of<number>()
        .pipe(concat([1, 2]))
        .sink(toArray()),
    ).toEqual([1, 2]);
  });
});

describe("prepend", () => {
  it("yields the given items before the source", async () => {
    expect(await of(3, 4).pipe(prepend(1, 2)).sink(toArray())).toEqual([
      1, 2, 3, 4,
    ]);
  });

  it("yields the source unchanged when no items are given", async () => {
    expect(await of(1, 2).pipe(prepend()).sink(toArray())).toEqual([1, 2]);
  });
});

describe("append", () => {
  it("yields the given items after the source", async () => {
    expect(await of(1, 2).pipe(append(3, 4)).sink(toArray())).toEqual([
      1, 2, 3, 4,
    ]);
  });

  it("yields the source unchanged when no items are given", async () => {
    expect(await of(1, 2).pipe(append()).sink(toArray())).toEqual([1, 2]);
  });
});

describe("flatten", () => {
  it("flattens a source of sync iterables by one level", async () => {
    expect(
      await of([1, 2], [3], [4, 5]).pipe(flatten()).sink(toArray()),
    ).toEqual([1, 2, 3, 4, 5]);
  });

  it("flattens a source of async iterables", async () => {
    expect(await of(of(1, 2), of(3)).pipe(flatten()).sink(toArray())).toEqual([
      1, 2, 3,
    ]);
  });

  it("flattens only one level", async () => {
    expect(
      await of([[1], [2]], [[3]])
        .pipe(flatten())
        .sink(toArray()),
    ).toEqual([[1], [2], [3]]);
  });

  it("yields nothing for empty inner iterables", async () => {
    expect(
      await of<number[]>([], [], []).pipe(flatten()).sink(toArray()),
    ).toEqual([]);
  });
});

describe("flatMap", () => {
  it("maps each item to an iterable and flattens the results", async () => {
    expect(
      await of(1, 2, 3)
        .pipe(flatMap((n: number) => [n, n * 10]))
        .sink(toArray()),
    ).toEqual([1, 10, 2, 20, 3, 30]);
  });

  it("awaits async mapping functions", async () => {
    expect(
      await of(1, 2)
        .pipe(flatMap(async (n: number) => [n, -n]))
        .sink(toArray()),
    ).toEqual([1, -1, 2, -2]);
  });

  it("accepts async iterables from the mapping function", async () => {
    expect(
      await of(1, 2)
        .pipe(flatMap((n: number) => of(n, n)))
        .sink(toArray()),
    ).toEqual([1, 1, 2, 2]);
  });

  it("drops items that map to an empty iterable", async () => {
    expect(
      await of(1, 2, 3)
        .pipe(flatMap((n: number) => (n % 2 === 0 ? [n] : [])))
        .sink(toArray()),
    ).toEqual([2]);
  });
});
