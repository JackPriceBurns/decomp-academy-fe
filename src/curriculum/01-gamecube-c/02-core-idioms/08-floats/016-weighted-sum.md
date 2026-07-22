---
id: 8f892afe-933f-5eee-a082-cf018f100367
slug: floats-weighted-sum
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

A weighted sum `a*w1 + b*w2` reads like three operations, two multiplies and an
add. The compiler is cheaper than that. With `fp_contract` on it fuses the last
multiply and the add into a single `fmadds`, and one standalone `fmuls` is all
that is left over. The weights are constants, so each one gets loaded out of the
float pool with an `lfs`.

Take `blend(p, q)`, mixing two values 0.875 / 0.125:

```asm
lfs   f0, ...        # load 0.875f from the pool
lfs   f3, ...        # load 0.125f from the pool
fmuls f0, f0, f2     # f0 = 0.875 * p    (the standalone product)
fmadds f1, f3, f1, f0 # f1 = 0.125 * q + f0  =  0.875*p + 0.125*q
blr
```

The `fmadds` is the dense one. `fmadds fD, fA, fC, fB` computes `(fA * fC) + fB`,
so here `fA` and `fC` are the second weight times its argument, and `fB` is the
product `fmuls` already left behind. Both scaled terms and the add, packed into
those two instructions. And the constants are no mystery, they are exactly what
the two `lfs` pull off the pool.

Same `lfs`/`lfs`/`fmuls`/`fmadds` skeleton shows up in the target, only the
weights change. Pin down each loaded constant and which argument it scales.

## Your task

Write `wsum` to reproduce the assembly above. Write it as a
plain weighted sum and let the compiler fuse the tail.

<!-- solution -->
```c
f32 wsum(f32 a, f32 b) {
    return a * 0.75f + b * 0.25f;
}
```
