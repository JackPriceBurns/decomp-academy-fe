---
id: 8c5b267c-8162-5802-bd61-42fdb287904e
slug: floats-f32-f64-mixing
title: Mixing f32 and f64 — Double Math, then frsp
difficulty: 3
concepts:
  - floating-point
  - double-precision
  - frsp
  - conversion
symbol: mix
hints:
  - Casting the operands to `f64` switches the arithmetic to the suffix-less
    `fmul`/`fadd` and pulls constants in as `lfd` doubles.
  - Returning `f32` from double math forces a final `frsp` to round the result
    back to single precision.
---

# When the math goes double and comes back single

Promote your `f32` operands to `f64` and the whole expression changes flavor.
The arithmetic drops its `s` suffix and becomes the plain double forms, `fmul`
and `fadd` and friends, while any constant arrives as a *double* through `lfd`
instead of `lfs`. A single-precision value can step straight into a double op, no
widening instruction required, because it is already exactly representable. The
catch comes at the end. Hand back an `f32` from double math and the result has to
be rounded down with **`frsp`** first.

Take `avg2(p, q)`, which averages two values in double precision and then
narrows:

```asm
fadd  f0, f1, f2     # double add: (double)p + (double)q
lfd   f1, ...        # load 0.5 as a *double* (lfd, not lfs)
fmul  f1, f1, f0     # double multiply by 0.5
frsp  f1, f1         # round the f64 result back to f32 for return
blr
```

Double math leaves fingerprints all over this. `fadd` and `fmul` with no `s`, an
`lfd` rather than `lfs` for the constant, and that `frsp` at the close. The
`frsp` is the giveaway for *double-computed, single-returned* code. Write the
same thing in straight `f32` and you would see `fadds`/`fmuls`/`lfs` with no
`frsp` anywhere. So whenever a `frsp` shows up next to suffix-less ops, the
original C cast its operands up to `double`.

Your target runs a different double-precision computation that still finishes on
`frsp`. Read the suffix-less ops, the `lfd` constant, and that closing `frsp`,
and you can locate where the cast to `f64` happens and what the final narrowing
does.

## Your task

Write `mix` to reproduce the assembly above. Cast as needed
so the arithmetic happens in `f64` and is narrowed back on return.

<!-- solution -->
```c
f32 mix(f32 a, f32 b) {
    f64 t = (f64)a * (f64)b;
    return (f32)(t + 1.0);
}
```
