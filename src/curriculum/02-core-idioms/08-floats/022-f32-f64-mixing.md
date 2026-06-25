---
id: floats-f32-f64-mixing
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

Promote `f32` operands to `f64` and the whole expression switches register
flavor: the arithmetic becomes the **suffix-less** double forms (`fmul`, `fadd`,
…), and any literal is loaded as a *double* with `lfd` rather than `lfs`. A
single-precision value slots straight into a double operation — it's exactly
representable, so no widening instruction is needed. But returning an `f32` from
double math means the result must be rounded down with **`frsp`** at the end.

Consider `avg2(p, q)`, averaging two values in double precision before narrowing:

```asm
fadd  f0, f1, f2     # double add: (double)p + (double)q
lfd   f1, ...        # load 0.5 as a *double* (lfd, not lfs)
fmul  f1, f1, f0     # double multiply by 0.5
frsp  f1, f1         # round the f64 result back to f32 for return
blr
```

The signatures of double math are everywhere here: `fadd`/`fmul` with no `s`, an
`lfd` (not `lfs`) for the constant, and a closing `frsp`. That `frsp` is the
unmistakable mark of *double-computed, single-returned* code — if you write the
same expression in pure `f32`, you'd get `fadds`/`fmuls`/`lfs` and **no** `frsp`.
So the presence of `frsp` plus suffix-less ops tells you the original C cast its
operands up to `double`.

The target assembly does a different double-precision computation that ends in
`frsp`. Read the suffix-less ops, the `lfd` constant, and the closing `frsp` to
recover where the cast to `f64` happens and what the final narrowing is.

## Your task

Write `mix`, taking two `f32`s, to reproduce the assembly above. Cast as needed
so the arithmetic happens in `f64` and is narrowed back on return.

<!-- starter -->
```c
f32 mix(f32 a, f32 b) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 mix(f32 a, f32 b) {
    f64 t = (f64)a * (f64)b;
    return (f32)(t + 1.0);
}
```
