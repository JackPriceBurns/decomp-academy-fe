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
**negation** is `fneg` (it just flips the sign bit), and **absolute value** is
`fabs` (it clears the sign bit). The single-precision intrinsic `__fabsf` lowers
straight to `fabs`:

```asm
fabs f0, f1        # |x|  (clear sign bit)
fneg f1, f0        # -|x| (flip sign bit)
blr
```

Unlike `fadds`/`fmuls`, the sign-bit instructions have **no `s` variant**: they
appear as `fabs`/`fneg` even on an `f32`. This is one of the few exceptions to
the single/double suffix rule from earlier — flipping a sign bit is bit-identical
at single and double precision, so there's nothing to round and no need for a
separate form.

So `-__fabsf(x)` is "absolute value, then negate", and you see the two sign-bit
ops back to back. Neither rounds or touches the magnitude bits — they're as cheap
as a register move.

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
