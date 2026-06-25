---
id: floats-lerp
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

Linear interpolation — "move a fraction `t` of the way from one value to
another" — is everywhere in game code: camera follows, fades, eased motion. The
classic form is `base + (target - base) * t`. That's a subtract, a multiply, and
an add, but the multiply-then-add tail fuses, so it compiles to just an `fsubs`
and an `fmadds`.

Consider `glide(p, q, s)` interpolating from `p` toward `q` by fraction `s`:

```asm
fsubs  f0, f2, f1    # f0 = q - p        (the difference)
fmadds f1, f3, f0, f1 # f1 = s*f0 + p   =  p + (q - p)*s
blr
```

The `fsubs` computes the difference `q - p` in natural order, and the `fmadds`
does `(s * diff) + p` in one rounding step — recognize `fmadds fD, fA, fC, fB`
as `(fA * fC) + fB`, with `fA = s`, `fC = diff`, and `fB = p` the base. The base
argument `p` appears *twice* in the source: once subtracted inside the
difference and once as the addend. Spotting the same register as both the
`fsubs` left-minuend's subtrahend and the `fmadds` addend is the tell for a lerp.

The target assembly has the identical `fsubs` → `fmadds` shape. Match the
registers back to the three arguments to recover which is the base, which is the
target, and which is the fraction.

## Your task

Write `lerp`, taking three `f32`s (base, target, fraction), to reproduce the
assembly above.

<!-- starter -->
```c
f32 lerp(f32 a, f32 b, f32 t) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 lerp(f32 a, f32 b, f32 t) {
    return a + (b - a) * t;
}
```
