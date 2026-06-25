---
id: floats-weighted-sum
title: A Weighted Sum Folds Into One fmadds
difficulty: 3
concepts:
  - floating-point
  - fmadds
  - constants
  - chaining
symbol: wsum
hints:
  - Two float-literal weights are loaded with two `lfs`; one product is a plain
    `fmuls`, the other fuses into the final `fmadds`.
  - "`fmadds fD, fA, fC, fB` is `fA*fC + fB`, so the `fmadds` carries *both* its
    own multiply and the previously computed product."
---

# Two scaled terms, one fused add

A weighted sum `a*w1 + b*w2` looks like two multiplies and an add — three
operations. With `fp_contract` on, the compiler collapses the trailing
multiply-and-add into a single `fmadds`, so only one explicit `fmuls` survives.
The two literal weights each come from the float pool via `lfs`.

Consider `blend(p, q)` mixing two values 0.875 / 0.125:

```asm
lfs   f0, ...        # load 0.875f from the pool
lfs   f3, ...        # load 0.125f from the pool
fmuls f0, f0, f2     # f0 = 0.875 * p    (the standalone product)
fmadds f1, f3, f1, f0 # f1 = 0.125 * q + f0  =  0.875*p + 0.125*q
blr
```

Decode the `fmadds`: `fmadds fD, fA, fC, fB` is `(fA * fC) + fB`. Here `fA`/`fC`
are the second weight and its argument, and `fB` is the running product from the
`fmuls`. So one `fmuls` plus one `fmadds` expresses *both* weighted terms and
their sum. The two `lfs` loads reveal the two constants — read them straight from
the pool entries.

The target assembly has the same `lfs`/`lfs`/`fmuls`/`fmadds` skeleton with
different weights. Identify each loaded constant and which argument it scales.

## Your task

Write `wsum`, taking two `f32`s, to reproduce the assembly above. Write it as a
plain weighted sum and let the compiler fuse the tail.

<!-- starter -->
```c
f32 wsum(f32 a, f32 b) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 wsum(f32 a, f32 b) {
    return a * 0.75f + b * 0.25f;
}
```
