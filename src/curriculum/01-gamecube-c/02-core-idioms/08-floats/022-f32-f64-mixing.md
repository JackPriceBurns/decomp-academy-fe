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
symbol: func_80316c98
hints:
  - Casting the operands to `f64` switches the arithmetic to the suffix-less
    `fmul`/`fadd` and pulls constants in as `lfd` doubles.
  - Returning `f32` from double math forces a final `frsp` to round the result
    back to single precision.
---

# When the math goes double and comes back single

Promote `f32` operands to `f64` and the expression changes flavor. The arithmetic
drops its `s` suffix and becomes plain double forms — `fmul`, `fadd`, etc.
Constants arrive as doubles through `lfd` instead of `lfs`. An `f32` can step
straight into a double op; no widening instruction needed because it's already
exactly representable. The catch comes at the end: return an `f32` from double
math and the result must be rounded down with `frsp`.

Take `avg2(p, q)`, averaging two values in double precision then narrowing:

```asm
fadd  f0, f1, f2     # double add: (double)p + (double)q
lfd   f1, ...        # load 0.5 as a *double* (lfd, not lfs)
fmul  f1, f1, f0     # double multiply by 0.5
frsp  f1, f1         # round the f64 result back to f32 for return
blr
```

Double math leaves fingerprints: `fadd` and `fmul` with no `s`, `lfd` instead of
`lfs`, and `frsp` at the close. The `frsp` is the giveaway for double-computed,
single-returned code. Write the same thing in straight `f32` and you'd see
`fadds`/`fmuls`/`lfs` with no `frsp`. So whenever `frsp` shows up next to
suffix-less ops, the original C cast its operands to `double`.

Your target runs a different double-precision computation that still ends with
`frsp`. Read the suffix-less ops, the `lfd` constant, and the closing `frsp` to
locate where the cast to `f64` happens and what the final narrowing does.

## Your task

Write `func_80316c98` to reproduce the assembly above. Cast as needed so the
arithmetic happens in `f64` and is narrowed back on return.

<!-- solution -->
```c
f32 func_80316c98(f32 a, f32 b) {
    f64 t = (f64)a * (f64)b;
    return (f32)(t + 1.0);
}
```
