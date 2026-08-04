---
id: 101e1b3c-e9dc-5023-8a18-57dfcfe24b2f
slug: floats-div-const-reciprocal
title: Dividing by a Constant Becomes a Multiply
difficulty: 2
concepts:
  - floating-point
  - divide
  - reciprocal
  - strength-reduction
symbol: func_8000786c
hints:
  - Dividing by a compile-time constant doesn't use `fdivs` — it folds to a
    reciprocal multiply.
  - Expect an `lfs` of the reciprocal then a single `fmuls`, no division.
---

# A float divide that isn't a divide

Here's a divide the hardware never performs. Hand MWCC a power-of-two constant
divisor and it skips `fdivs`. The reciprocal of a power of two is exactly
representable, so the compiler stores that number and multiplies. One `fmuls`,
done. Watch `y / 8.0f`:

```asm
lfs   f0, ...      # load the reciprocal constant 0.125f from the pool
fmuls f1,f1,f0    # y * 0.125f  — no fdivs in sight
blr
```

The constant lives in a read-only float pool. `lfs` fetches it, `fmuls` applies it,
and the division is gone. Exactness is the whole game. Powers of two qualify;
almost nothing else does. Ask for `y / 3.0f` and the divide comes back as `fdivs`,
since `1/3` can't be written exactly in binary.

Spotting `lfs` then `fmuls` in the target? Work back to the power-of-two divisor
behind that reciprocal. Write it as a plain division in C and trust the compiler to
make the constant. Typing the reciprocal by hand defeats the point.

## Your task

Write `func_8000786c` so it compiles to an `lfs` + `fmuls` pattern.

<!-- solution -->
```c
f32 func_8000786c(f32 x) {
    return x / 4.0f;
}
```
