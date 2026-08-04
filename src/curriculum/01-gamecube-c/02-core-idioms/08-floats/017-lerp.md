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
symbol: func_80288c88
hints:
  - A difference computed by `fsubs` is then multiplied-and-added back by a
    single `fmadds`.
  - "`a + (b - a) * t` has the exact shape `base + diff * t`, which fuses to one
    `fmadds` after the `fsubs`."
---

# Linear interpolation in two instructions

Linear interpolation moves a fraction `t` from one value to the next, and game code
uses it constantly: camera follow, fades, eased motion — all lerps. The textbook
form is `base + (target - base) * t`, which counts as subtract, multiply, add. But
the multiply-and-add tail fuses, so you actually get one `fsubs` plus one `fmadds`.

Here's `glide(p, q, s)`, walking from `p` toward `q` by fraction `s`:

```asm
fsubs  f0, f2, f1    # f0 = q - p        (the difference)
fmadds f1, f3, f0, f1 # f1 = s*f0 + p   =  p + (q - p)*s
blr
```

`fsubs` takes `q - p` in plain order. Then `fmadds` rolls `(s * diff) + p` into
one rounded step. `fmadds fD, fA, fC, fB` is `(fA * fC) + fB`, so here `fA = s`,
`fC = diff`, and `fB = p`. Notice `p` shows up twice: once as the thing subtracted,
once as the addend. When one register is both the `fsubs` subtrahend and the
`fmadds` addend, you're almost certainly looking at a lerp.

The target has the same `fsubs` → `fmadds` shape. Trace the registers back to the
three arguments and you can tell base from target from fraction.

## Your task

Write `func_80288c88` to reproduce the assembly above.

<!-- solution -->
```c
f32 func_80288c88(f32 a, f32 b, f32 t) {
    return a + (b - a) * t;
}
```
