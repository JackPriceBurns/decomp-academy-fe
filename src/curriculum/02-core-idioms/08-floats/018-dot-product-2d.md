---
id: floats-dot-product-2d
title: Two Products Summed — the 2D Dot Product
difficulty: 3
concepts:
  - floating-point
  - fmadds
  - dot-product
  - chaining
symbol: dot2
hints:
  - One product is a standalone `fmuls`; the second product and the sum fuse
    into a single `fmadds`.
  - Read the `fmuls` operands and the `fmadds` multiply operands to pair up which
    arguments multiply together.
---

# A sum of two products

A sum of two products — the heart of a 2D dot product, a determinant, a complex
multiply — reads as two multiplies and an add. But the compiler emits only one
`fmuls`, because the *second* product folds into the add via `fmadds`.

Consider `cross(p, q, r, s)` computing `p*r + q*s`:

```asm
fmuls  f0, f2, f4    # f0 = q * s      (one product, standalone)
fmadds f1, f1, f3, f0 # f1 = p*r + f0  =  p*r + q*s
blr
```

The compiler chose to compute `q*s` first with `fmuls`, then fold `p*r` and the
sum into one `fmadds` (recall `fmadds fD, fA, fC, fB` = `fA*fC + fB`). Which
product becomes the standalone `fmuls` and which rides in the `fmadds` is the
compiler's choice — what matters is reading the operand registers to see *which
two arguments pair up* in each multiply. Four float arguments arrive in
`f1`–`f4`.

The target assembly has the same `fmuls` → `fmadds` skeleton. Decode the operand
registers to recover the two products and confirm they're added together.

## Your task

Write `dot2`, taking four `f32`s, to reproduce the assembly above.

<!-- starter -->
```c
f32 dot2(f32 a, f32 b, f32 c, f32 d) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 dot2(f32 a, f32 b, f32 c, f32 d) {
    return a * b + c * d;
}
```
