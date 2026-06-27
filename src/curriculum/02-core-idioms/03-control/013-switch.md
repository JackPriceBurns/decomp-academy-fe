---
id: control-switch
title: "Switch: The Compare Chain"
difficulty: 4
concepts:
  - switch
  - branch
  - comparison
  - control-flow
symbol: classify
hints:
  - A small dense switch becomes a binary-search compare chain, not a table.
  - Cases are tested in value order with `cmpwi` / `beq-` / `bge-`.
---

# How MWCC lays out a switch

A `switch` over a handful of cases doesn't always become a jump table. For a
small dense set, MWCC builds a **binary-search compare chain** — it bisects the
case values with signed compares to reach the right arm in a logarithmic number
of tests:

```asm
cmpwi r3, 2       # probe the middle case first
beq-  .case2
bge-  .hi         # x > 2 -> search the upper half
cmpwi r3, 0       # lower half: 0 or 1?
beq-  .case0
bge-  .case1
b     .default
.hi:
cmpwi r3, 4       # upper half: 3, or out of range?
bge-  .default
b     .case3
```

Each `.caseN` is a tiny `li r3, <value>` / `blr` block, and anything that falls
through every test lands in `.default`. Note the cases are tested **in value
order**, not source order — the compiler sorts them to bisect. A cascade of
`cmpwi`/`beq`/`bge` against ascending constants is the unmistakable shape of a
dense `switch`. This compare-chain strategy is specific to small case sets;
larger dense switches (around seven or more consecutive cases) flip to a jump
table (a `b` through a computed table address), a pattern a later lesson covers.

## Your task

Write `classify`: a `switch` on `x` returning `10`, `20`, `30`, `40` for cases
`0..3`, and `0` by default.

<!-- starter -->
```c
int classify(int x) {
    return 0;
}
```

<!-- solution -->
```c
int classify(int x) {
    switch (x) {
        case 0: return 10;
        case 1: return 20;
        case 2: return 30;
        case 3: return 40;
        default: return 0;
    }
}
```
