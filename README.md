# @cprecioso/async-iterable-helpers

Lazy, composable helpers for working with sync and async iterables. Wrap any iterable, build a pipeline of transforms, and consume it with a sink. Nothing is evaluated until a sink runs, and mapping, filtering, and reducing functions may all be async.

The iterables here match JS Async Generators semantics (and indeed are implemented through Async Generators). In Observable parlance, that means they are [**cold**](https://rxjs.dev/guide/glossary-and-semantics#cold) and [**pull-based**](https://rxjs.dev/guide/glossary-and-semantics#pull). The scheduler is always async (based on native `Promise` resolution), and elements in the stream are processed one at a time through the whole chain before going on to the next one. `Promise`s are implicitly unwrapped.

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
