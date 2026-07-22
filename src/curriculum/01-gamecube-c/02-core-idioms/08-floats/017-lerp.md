---
id: ea2322c6-c0f2-5e45-a015-b6c7c3a23eb9
slug: floats-lerp
title: The Lerp Idiom — fsubs Feeding fmadds
difficulty: 3
concepts:
  - floating-point
  - fmadds
  - interpolation
  - chaining
symbol: lerp
hints:
  - A difference computed by `fsubs` is then multiplied-and-added back by a
    single `fmadds`.
  - "`a + (b - a) * t` has the exact shape `base + diff * t`, which fuses to one
    `fmadds` after the `fsubs`."
---

# Linear interpolation in two instructions

Linear interpolation moves a fraction `t` of the way from one value to the next,
and game code leans on it constantly. Camera follow, fades, eased motion, all
lerps. The textbook form is `base + (target - base) * t`, which counts out as a
subtract, a multiply, and an add. But that multiply-and-add tail fuses, so what
you actually get is one `fsubs` plus one `fmadds`.

Here's `glide(p, q, s)`, walking from `p` toward `q` by a fraction `s`:

```asm
fsubs  f0, f2, f1    # f0 = q - p        (the difference)
fmadds f1, f3, f0, f1 # f1 = s*f0 + p   =  p + (q - p)*s
blr
```

The `fsubs` takes the difference `q - p`, plain order. Then the `fmadds` rolls
`(s * diff) + p` into one rounded step. Same decoding as before, `fmadds fD, fA,
fC, fB` is `(fA * fC) + fB`, which here puts `fA = s`, `fC = diff`, and `fB = p`
as the base. Notice `p` shows up *twice* in the source, once buried in the
difference as the thing subtracted, once again as the addend. When one register
is both the `fsubs` subtrahend and the `fmadds` addend, you are almost certainly
looking at a lerp.

The target carries the identical `fsubs` → `fmadds` shape. Trace the registers
back to the three arguments and you can tell base from target from fraction.

## Your task

Write `lerp` to reproduce the
assembly above.

<!-- solution -->
```c
f32 lerp(f32 a, f32 b, f32 t) {
    return a + (b - a) * t;
}
```
