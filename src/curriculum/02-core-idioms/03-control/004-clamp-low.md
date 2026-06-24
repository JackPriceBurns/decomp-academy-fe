---
id: control-clamp-low
title: Clamping to Zero, Branchlessly
difficulty: 2
concepts:
  - if
  - clamp
  - branchless
  - idiom
symbol: clamp_low
hints:
  - Clamping a signed value up to zero needs no branch.
  - Expect a sign mask via `srawi r0, r3, 31` then `andc r3, r3, r0`.
---

# A guard that compiles to no branch at all

`if (x < 0) return 0;` looks like it needs a comparison and a jump. But
clamping a signed value up to zero is a classic branchless trick MWCC knows by
heart, built from an arithmetic shift and an *and-with-complement*:

```asm
srawi r0, r3, 31   # r0 = all 1s if x < 0, else all 0s (sign mask)
andc  r3, r3, r0   # r3 = x AND (NOT mask) -> 0 if x<0, else x
blr
```

`srawi r0, r3, 31` smears the sign bit across the whole word, producing
`0xFFFFFFFF` for negatives and `0` for non-negatives. `andc` then masks `x`
against the *inverse*: negatives become `0`, everything else passes through
untouched. No `cmpwi`, no branch — pure data flow.

Why branchless? MWCC recognises the clamp shape when both paths return a value
derived from the *same* register, and folds it into this `srawi`/`andc` pair.
The single-return form `return x < 0 ? 0 : x;` is recognised identically. Beware
that the logically equivalent inversion `if (x >= 0) return x; return 0;` falls
*outside* the recognised pattern and compiles to a different sequence — source
form can decide codegen.

## Your task

Write `clamp_low`: return `0` if `x < 0`, otherwise return `x`.

<!-- starter -->
```c
int clamp_low(int x) {
    return 0;
}
```

<!-- solution -->
```c
int clamp_low(int x) {
    if (x < 0) return 0;
    return x;
}
```
