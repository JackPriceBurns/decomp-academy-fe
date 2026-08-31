---
id: df9dde57-7967-4a0b-a5d0-2d9ea942357b
slug: floats-missing-f
title: "The Missing f: A Double Detour"
difficulty: 3
concepts:
  - floats
  - doubles
  - conversion
  - fingerprints
symbol: func_803e7778
hints:
  - "`0x4004` sits between `2.0`'s `0x4000` and `3.0`'s `0x4008` on the
    double ladder — exactly halfway."
  - "Write the constant *without* the `f` suffix, or the sandwich won't appear."
---

# Why is this f32 function full of .d?

Here's a trap that catches everyone. `upBy(x)` takes an `f32`,
returns an `f32` — and compiles to *double* arithmetic:

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

The C is `return x + 1.5;` — and the culprit is one missing
character. In C, the constant `1.5` *is a double*; only `1.5f` is a
float. Mix an `f32` with a double constant and the standard requires
the math to happen in double: promote, operate, demote. IDO does
exactly, faithfully that.

The two new conversions complete your `cvt` family: **`cvt.d.s`**
(to double, from single) and **`cvt.s.d`** back down. No ferries —
both worlds are FPU-side, so it's pure conversion, no `mtc1`.

The fingerprint reads instantly once you know it: **an `f32`-in,
`f32`-out function whose middle is `.d` operations bracketed by
`cvt.d.s` … `cvt.s.d` means an unsuffixed constant** in the source.
And it matters for matching in both directions: write `1.5f` where
the original had `1.5` and this whole sandwich collapses into one
`add.s` — instructions vanish, the diff lights up. The original
programmer's sloppiness is now load-bearing, and you must reproduce
it.

The target is the same sandwich around a different operation, with
the constant one hint away on the double ladder. Spell your C the
way the original must have.

## Your task

Write `func_803e7778` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_803e7778(f32 x) {
    return x * 2.5;
}
```
