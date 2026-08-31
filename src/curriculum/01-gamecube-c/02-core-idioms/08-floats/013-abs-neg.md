---
id: cb5ee752-24d3-588a-9c32-ccb13027b9d0
slug: floats-abs-neg
title: Absolute Value and Negation
difficulty: 2
concepts:
  - floating-point
  - fabs
  - fneg
  - sign-bit
symbol: func_802d7b9c
hints:
  - "`__fabsf` lowers to `fabs` (clear sign bit); unary minus lowers to `fneg`
    (flip sign bit)."
  - "`-__fabsf(x)` becomes `fabs f0, f1` then `fneg f1, f0`."
---

# Sign-bit instructions

A couple of one-instruction operations round out the basics. Floating-point
negation is `fneg`, which flips the sign bit. Absolute value is `fabs`, which
clears it. Each costs one instruction:

```asm
# absval(f32 v):
fabs  f1, f1       # clear sign bit
blr

# negate(f32 v):
fneg  f1, f1       # flip sign bit
blr
```

Use the single-precision intrinsic `__fabsf` and it lowers straight to `fabs`.

The quirk: these two skip the `s` suffix, so even on `f32` you'll read `fabs`
and `fneg`, never an `s`-tagged form. That breaks the single/double naming
rule, and for good reason — toggling a sign bit gives identical bits at single
or double width, so there's nothing to round and no second variant.

Spot the two instructions one after another and the order matters: they don't
commute, so which runs first changes the meaning. The C that lays them down
follows from the disassembly.

## Your task

Write `func_802d7b9c` to compile to the two sign-bit instructions above.

<!-- solution -->
```c
f32 func_802d7b9c(f32 x) {
    return -__fabsf(x);
}
```
