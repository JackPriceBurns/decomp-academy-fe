---
id: df9dde57-7967-4a0b-a5d0-2d9ea942357b
slug: floats-missing-f
title: "The Missing f: Hidden Double Math"
difficulty: 3
concepts:
  - floats
  - doubles
  - conversion
  - fingerprints
symbol: func_803e7778
hints:
  - "`0x4004` is exactly halfway between `2.0`'s `0x4000` and `3.0`'s `0x4008` on the double ladder."
  - "Write the constant *without* the `f` suffix, or the conversions won't appear."
---

# Why is this f32 function full of .d?

This mistake catches almost everyone. `upBy(x)` takes an `f32` and returns an
`f32`, but it compiles to *double* arithmetic:

```asm
 0:  lui     at, 0x3ff8    # 1.5's high word, on the DOUBLE ladder
 4:  mtc1    at, ft1f
 8:  mtc1    zero, ft1
 c:  cvt.d.s ft0, fa0      # x promoted: single → double
10:  add.d   ft2, ft0, ft1 # the add happens in f64
14:  cvt.s.d fv0, ft2      # result demoted: double → single
18:  jr      ra
1c:  nop
```

The C is `return x + 1.5;`, and the cause is one missing character. In C,
the constant `1.5` *is a double*. Only `1.5f` is a float. When you mix an
`f32` with a double constant, the C standard requires the math to happen in
double: promote, operate, demote. IDO does exactly that.

The two new conversions complete your `cvt` family: **`cvt.d.s`** (to
double, from single) and **`cvt.s.d`** (back to single). There is no `mtc1`
here, because both values are already on the FPU. These are pure
conversions.

Once you know this pattern, you will spot it quickly: **a function that takes
and returns `f32`, with `.d` operations in the middle between `cvt.d.s` and
`cvt.s.d`, means the source has an unsuffixed constant**. This matters for
matching in both directions. If you write `1.5f` where the original had
`1.5`, the conversions and the `.d` work collapse into one `add.s`.
Instructions disappear and the diff shows the difference. The original
programmer's missing `f` is now part of what you must match, so you have to
reproduce it.

The target has the same conversions around a different operation. Its
constant is on the double ladder, and the first hint decodes it. Write the C
the way the original programmer must have written it.

## Your task

Write `func_803e7778` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_803e7778(f32 x) {
    return x * 2.5;
}
```
