---
id: floats-div-const-reciprocal
title: Dividing by a Constant Becomes a Multiply
difficulty: 2
concepts:
  - floating-point
  - divide
  - reciprocal
  - strength-reduction
symbol: quarter
hints:
  - Dividing by a compile-time constant doesn't use `fdivs` — it folds to a
    reciprocal multiply.
  - Expect an `lfs` of the reciprocal then a single `fmuls`, no division.
---

# A float divide that isn't a divide

Dividing a float by a **power-of-two constant** doesn't need `fdivs` at all.
MWCC folds it into a multiply by the *exactly representable* reciprocal — a
single `fmuls`. For example, `y / 8.0f` compiles as:

```asm
lfs   f0, ...      # load the reciprocal constant 0.125f from the pool
fmuls f1,f1,f0    # y * 0.125f  — no fdivs in sight
blr
```

The reciprocal constant lives in a read-only float pool and is loaded with
`lfs`. The divide is gone entirely. This fold only happens when the reciprocal
is *exact* — i.e. powers of two. `y / 3.0f` keeps a real `fdivs`, because
`1/3` can't be stored exactly.

When you see `lfs` + `fmuls` in target assembly, your job is to identify which
power-of-two divisor produces that specific reciprocal. Write the division in
C; don't hand-write the reciprocal constant yourself.

## Your task

Write `quarter` taking an `f32 x` so it compiles to an `lfs` + `fmuls` pattern.

<!-- starter -->
```c
f32 quarter(f32 x) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 quarter(f32 x) {
    return x / 4.0f;
}
```
