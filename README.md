# @cprecioso/async-iterable-helpers

Lazy, composable helpers for working with sync and async iterables. Wrap any iterable, build a pipeline of transforms, and consume it with a sink. Nothing is evaluated until a sink runs, and mapping, filtering, and reducing functions may all be async.

Similar to RxJS, but treated as ordered sequences of values rather than streams of events, and implicitly unwrapping `Promise`s.

## Install

```sh
npm install @cprecioso/async-iterable-helpers
```

## Usage

Start with a creator to get a `Wrapper`, chain `.pipe()` calls to transform the
sequence, and finish with `.sink()` to consume it:

```ts
import { from, filter, map, toArray } from "@cprecioso/async-iterable-helpers";

const result = await from([1, 2, 3, 4])
  .pipe(filter((n) => n % 2 === 0))
  .pipe(map(async (n) => n * 10))
  .sink(toArray());

// result: [20, 40]
```

A `Wrapper` is itself an `AsyncIterable`, so you can also use it directly with
`for await`:

```ts
for await (const n of from([1, 2, 3]).pipe(map((n) => n * 2))) {
  console.log(n); // 2, 4, 6
}
```

## API

Check the API reference at https://cprecioso.github.io/async-iterable-helpers/
