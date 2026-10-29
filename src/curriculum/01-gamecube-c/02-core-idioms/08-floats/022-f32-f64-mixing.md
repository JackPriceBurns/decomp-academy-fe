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
  - Store the double-precision product in an `f64` temporary, then add in a
    separate statement. This prevents MWCC from fusing the operations into `fmadd`.
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
fadd  f0, f1, f2
lfd   f1, lit@sda21(r2)  # load 0.5 as a double
fmul  f1, f1, f0
frsp  f1, f1
blr
```

Here `lit` names the double constant `0.5` in the small data area.

Double math leaves fingerprints: `fadd` and `fmul` with no `s`, `lfd` instead of
`lfs`, and `frsp` at the close. The `frsp` is the giveaway for double-computed,
single-returned code. Write the same thing in straight `f32` and you'd see
`fadds`/`fmuls`/`lfs` with no `frsp`. So whenever `frsp` shows up next to
suffix-less ops, the original C cast its operands to `double`.

When reading separate multiply and add instructions, recall the product
temporary from **Fused Multiply-Add**: separate statements can keep those
operations apart even with `fp_contract on`. Read the arithmetic suffixes and
conversions in the target to work out where each precision is needed.

## Your task

Write `func_80316c98` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_80316c98(f32 a, f32 b) {
    f64 t = (f64)a * (f64)b;
    return (f32)(t + 1.0);
}
```
