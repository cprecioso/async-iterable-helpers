import { describe, expect, it } from "vitest";
import { create, empty, from, infinite, of } from "./creators";
import { take } from "./pipes";
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

describe("create", () => {
  it("wraps a sync iterable produced by the function", async () => {
    expect(await create(async () => [1, 2, 3]).sink(toArray())).toEqual([
      1, 2, 3,
    ]);
  });

  it("wraps an async iterable produced by the function", async () => {
    expect(await create(async () => of("a", "b")).sink(toArray())).toEqual([
      "a",
      "b",
    ]);
  });

  it("wraps an empty iterable", async () => {
    expect(await create(async () => []).sink(toArray())).toEqual([]);
  });

  it("awaits yielded promises", async () => {
    expect(
      await create(async () => [Promise.resolve(1), Promise.resolve(2)]).sink(
        toArray(),
      ),
    ).toEqual([1, 2]);
  });

  it("does not call the function until iteration starts", async () => {
    let called = 0;
    const wrapper = create(async () => {
      called++;
      return [1, 2, 3];
    });
    expect(called).toBe(0);

    await wrapper.sink(toArray());
    expect(called).toBe(1);
  });

  it("does not call the function when a pipe is applied", async () => {
    let called = 0;
    create(async () => {
      called++;
      return [1, 2, 3];
    }).pipe(take(2));
    expect(called).toBe(0);
  });

  it("rejects when the function rejects", async () => {
    const error = new Error("boom");
    await expect(
      create(async () => {
        throw error;
      }).sink(toArray()),
    ).rejects.toThrow(error);
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

describe("empty", () => {
  it("yields no items", async () => {
    expect(await empty().sink(toArray())).toEqual([]);
  });
});

describe("infinite", () => {
  it("repeats the same item", async () => {
    expect(await infinite(7).pipe(take(3)).sink(toArray())).toEqual([7, 7, 7]);
  });

  it("does not terminate on its own", async () => {
    let count = 0;
    for await (const item of infinite("x")) {
      expect(item).toBe("x");
      if (++count >= 5) break;
    }
    expect(count).toBe(5);
  });
});
