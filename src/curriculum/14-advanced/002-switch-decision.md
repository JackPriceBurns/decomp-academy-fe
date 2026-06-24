---
id: advanced-switch-decision
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

The table form and the compare chain are *both* in MWCC's toolbox, and the
choice is mechanical: it depends on how many cases there are and how densely
they pack. Two rules of thumb that this compiler follows:

- **Dense and few → compare chain.** A run of `0..5` (six consecutive cases)
  still bisects with `cmpwi` / `beq-` / `bge-`. The crossover on this
  toolchain is **seven** consecutive cases: `0..6` and up switch to the table.
  Concretely: `0..5` (six cases) stays a compare chain; `0..6` (seven cases)
  is the first to cross into table form; lesson 1's `0..7` (eight cases) sits
  comfortably above the threshold. The rule is "at least seven," not "more than
  eight."
- **Sparse → compare chain, always.** Cases like `1, 10, 100, 500` are far
  apart. A table indexed by `x` would need 500 entries (mostly default) — far
  too big — so MWCC bisects them no matter how many there are:

```asm
cmpwi r3, 100      # probe the middle case value
beq-  .case100
bge-  .hi          # x > 100 -> search the upper half
cmpwi r3, 10
beq-  .case10
bge-  .default
cmpwi r3, 1
beq-  .case1
b     .default
...
.case1: li r3, 11   # each case body is the same tiny li/blr...
        blr          # ...only the dispatch above differs from the table form
```

So when you're matching a switch, **count the cases and check their spread
first**. A lone `cmplwi` + `bctr` means dense-and-many (write consecutive
cases). A staircase of `cmpwi`/`beq-` against scattered constants means the
original values were sparse — and the *constants in the asm* tell you exactly
which case labels to write.

## Your task

Write `route`, a sparse `switch` on `x`: case `1` → `11`, case `10` → `22`,
case `100` → `33`, case `500` → `44`, default `0`. Four scattered cases stays
a compare chain.

<!-- starter -->
```c
int route(int x) {
    return 0;
}
```

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
