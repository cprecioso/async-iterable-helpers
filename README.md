# @cprecioso/order-by-example

Build a comparator from example orderings. Give it lists of items in the order you want, and it returns a `compare` function you can hand to `Array.prototype.sort`.

Targets ES2019. Runs in Node, the browser, and anywhere else.

## Install

```sh
npm install @cprecioso/order-by-example
```

## Usage

```ts
import { makeSort } from "@cprecioso/order-by-example";

const sort = makeSort([
  ["apple", "banana", "cherry"],
  ["banana", "date"],
]);

["cherry", "banana", "apple"].sort(sort.compare);
// ['apple', 'banana', 'cherry']

sort.compare("apple", "banana"); // -1
sort.compare("banana", "date"); // -1
sort.compare("apple", "date"); // 0 — no single example contains both
```

## API

Check the API reference at https://cprecioso.github.io/order-by-example/
