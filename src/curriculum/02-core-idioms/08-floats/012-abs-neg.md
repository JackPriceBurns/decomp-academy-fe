---
id: floats-abs-neg
title: Absolute Value and Negation
difficulty: 2
concepts:
  - floating-point
  - fabs
  - fneg
  - sign-bit
symbol: negabs
hints:
  - "`__fabsf` lowers to `fabs` (clear sign bit); unary minus lowers to `fneg`
    (flip sign bit)."
  - "`-__fabsf(x)` becomes `fabs f0, f1` then `fneg f1, f0`."
---

# Sign-bit instructions

Two tiny, single-instruction operations round out the chapter. Floating-point
**negation** is `fneg` (it flips the sign bit), and **absolute value** is
`fabs` (it clears the sign bit). Used separately, each is one instruction:

```asm
# absval(f32 v):
fabs  f1, f1       # clear sign bit
blr

# negate(f32 v):
fneg  f1, f1       # flip sign bit
blr
```

The single-precision intrinsic `__fabsf` lowers straight to `fabs`.

Unlike `fadds`/`fmuls`, the sign-bit instructions have **no `s` variant**: they
appear as `fabs`/`fneg` even on an `f32`. This is one of the few exceptions to
the single/double suffix rule from earlier — flipping or clearing a sign bit is
bit-identical at single and double precision, so there is nothing to round and no
need for a separate form.

When you see both instructions back to back, consider which sign-bit operation
comes first and which comes second — they are not commutative. The C expression
that produces each one in sequence should be clear from the order.

## Your task

Write `negabs` taking an `f32 x` to compile to the two sign-bit instructions above.

<!-- starter -->
```c
f32 negabs(f32 x) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 negabs(f32 x) {
    return -__fabsf(x);
}
```
