---
id: 0996110b-1b46-5dee-b2cc-01719152035b
slug: floats-dot-product-2d
title: Two Products Summed — the 2D Dot Product
difficulty: 3
concepts:
  - floating-point
  - fmadds
  - dot-product
  - chaining
symbol: func_80265844
hints:
  - One product is a standalone `fmuls`; the second product and the sum fuse
    into a single `fmadds`.
  - Read the `fmuls` operands and the `fmadds` multiply operands to pair up which
    arguments multiply together.
---

# A sum of two products

Two products added together — you see this shape everywhere: a 2D dot product,
a determinant, a complex multiply. On the face of it that's two multiplies and
an add, but only one `fmuls` shows up, because the second product gets folded
into the add by `fmadds`.

Take `cross(p, q, r, s)`, which computes `p*r + q*s`:

```asm
fmuls  f0, f2, f4    # f0 = q * s      (one product, standalone)
fmadds f1, f1, f3, f0 # f1 = p*r + f0  =  p*r + q*s
blr
```

The compiler did `q*s` first as the standalone `fmuls`, then swept `p*r` and
the running sum into a single `fmadds`. (`fmadds fD, fA, fC, fB` =
`fA*fC + fB`.) Which product lands in the lone `fmuls` and which rides in the
`fmadds` is up to the compiler — what you care about is the operand registers,
since they tell you which two arguments multiply together. The four floats come
in across `f1`–`f4`.

Your target has the same `fmuls` → `fmadds` skeleton. Read the operand
registers, pull out the two products, and check that they're added.

## Your task

Write `func_80265844` to reproduce the assembly above.

<!-- solution -->
```c
f32 func_80265844(f32 a, f32 b, f32 c, f32 d) {
    return a * b + c * d;
}
```
