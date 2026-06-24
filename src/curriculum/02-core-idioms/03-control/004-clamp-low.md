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

Some `if`/`else` patterns look like they need a comparison and a jump, but
MWCC recognises certain shapes and collapses them into pure data flow. Clamping
a signed value against zero is one such shape — no `cmpwi`, no branch, just two
instructions:

```asm
srawi r0, r3, 31   # arithmetic shift right 31: produces a sign mask in r0
andc  r3, r3, r0   # r3 = r3 AND (NOT r0)
blr
```

`srawi r0, r3, 31` is an **arithmetic right shift by 31**. Because the shift is
*arithmetic*, it sign-extends: for a negative input the result is `0xFFFFFFFF`
(all ones); for a non-negative input the result is `0` (all zeros). This
produces a *sign mask* in `r0`.

`andc rD, rA, rB` computes `rA AND (NOT rB)`. When the mask is all-ones,
`NOT rB` is all-zeros, so `rA AND 0 = 0`. When the mask is all-zeros, `NOT rB`
is all-ones, so `rA AND ~0 = rA` — the original value passes through unchanged.

Why branchless? MWCC recognises the clamp shape when both paths return a value
derived from the *same* register, and folds it into this `srawi`/`andc` pair.
Beware that writing the logically equivalent `if (x >= 0) return x; return 0;`
falls *outside* the recognised pattern and compiles to a different sequence —
source form can decide codegen.

## Your task

Write `clamp_low`, taking a single `int`, to reproduce the assembly above.

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
