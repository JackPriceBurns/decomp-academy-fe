---
id: a04bde01-c208-5054-b364-7d32a2cf5ad9
slug: advanced-switch-decision
title: Table or Chain? The Density Rule
difficulty: 3
concepts:
  - switch
  - jump-table
  - compare-chain
  - heuristic
symbol: route
hints:
  - Sparse case values can't be table-indexed, so MWCC bisects them with a
    compare chain regardless of count.
  - Expect `cmpwi` / `beq-` / `bge-` probing the case values in sorted order, no
    `bctr`.
---

# When does MWCC pick which?

MWCC keeps both the table form and the compare chain in its toolbox, and it picks
between them by rote. What decides it is the number of cases and how tightly they
pack. Two rules of thumb capture how this compiler behaves.

- **Dense and few → compare chain.** Six cases in a row, `0..5`, still bisect
  with `cmpwi` / `beq-` / `bge-`. The line gets crossed at **seven** consecutive
  cases on this toolchain, where `0..6` and anything longer flips to the table.
  So `0..5` (six cases) stays a chain, `0..6` (seven cases) is the first to tip
  into table form, and lesson 1's `0..7` (eight cases) sits well clear of the
  edge. Read the rule as "at least seven," not "more than eight."
- **Sparse → compare chain, always.** Values like `2, 20, 200, 1000` sprawl too
  far apart. Indexing a table by `x` would mean 1000 entries, nearly all of them
  default, which is plainly too big, so MWCC falls back to bisecting them however
  many there are:

```asm
cmpwi r3, 200      # probe the middle case value
beq-  .case200
bge-  .hi          # x > 200 -> search the upper half
cmpwi r3, 20
beq-  .case20
bge-  .default
cmpwi r3, 2
beq-  .case2
b     .default
.hi:
cmpwi r3, 1000
beq-  .case1000
b     .default
...
.case2:    li r3, 1   # each case body is the same tiny li/blr...
           blr         # ...only the dispatch above differs from the table form
```

When you're matching a switch, **count the cases and check their spread
first**. One `cmplwi` followed by `bctr` points to dense-and-many, so you write
consecutive cases. A staircase of `cmpwi`/`beq-` against scattered constants
points the other way, to sparse originals, and the *constants in the asm* hand
you the exact case labels to write.

## Your task

Write `route(int x)`: a sparse `switch` on `x`. Read the `cmpwi` probe values
from the assembly above to recover which case labels to write, and read the
`li r3, N` in each arm to recover the return value. Four scattered cases stays
a compare chain.

<!-- solution -->
```c
int route(int x) {
    switch (x) {
        case 1:   return 11;
        case 10:  return 22;
        case 100: return 33;
        case 500: return 44;
        default:  return 0;
    }
}
```
