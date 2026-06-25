---
id: floats-dot-product-3d
title: Accumulating Three Products — the 3D Dot Product
difficulty: 3
concepts:
  - floating-point
  - fmadds
  - dot-product
  - structs
symbol: dot3
hints:
  - Each struct field is fetched with its own `lfs` at offset 0/4/8; the running
    total accumulates through repeated `fmadds`.
  - One standalone `fmuls` starts the chain, then each further product folds into
    an `fmadds` carrying the running sum.
---

# A chain of fused multiply-adds

Extend the sum-of-products to three terms — a 3D dot product — and a clear
pattern emerges: **one `fmuls` to start the accumulator, then one `fmadds` per
remaining term**, each folding its product into the running total. This
`fmuls` + `fmadds` + `fmadds` shape is the canonical accumulation idiom, and it
generalizes to any number of terms.

Reading struct fields adds `lfs` loads at each offset. Consider `weigh3(t, wa,
wb, wc)` summing each field of a `{f32 a,b,c}` struct scaled by a matching
weight argument:

```asm
lfs    f0, 4(r3)      # t->b
lfs    f4, 0(r3)      # t->a
fmuls  f0, f0, f2     # f0 = t->b * wb          (accumulator seed)
lfs    f2, 8(r3)      # t->c
fmadds f0, f4, f1, f0 # f0 = t->a*wa + f0       (fold in first term)
fmadds f1, f2, f3, f0 # f1 = t->c*wc + f0       (fold in last term)
blr
```

The compiler may interleave the `lfs` loads and even reorder which product seeds
the `fmuls`, but the structure is fixed: as many `lfs` pairs as there are
multiplied terms, one `fmuls`, and `fmadds` accumulators threading the running
sum to `f1`. Read each `lfs` offset to know which field (0/4/8 ⇒ first/second/
third) it fetched.

The target assembly multiplies the matching fields of two `Vec3`s (in `r3` and
`r4`) and sums the three products. Trace the `lfs` offsets to pair up the fields,
then confirm the products accumulate together.

The two arguments point to this struct:

```c
typedef struct { f32 x, y, z; } Vec3;
```

## Your task

With the `Vec3` struct above, write `dot3` taking two `Vec3*`s to reproduce the
assembly above.

<!-- context -->
```c
typedef struct { f32 x, y, z; } Vec3;
```

<!-- starter -->
```c
f32 dot3(Vec3* a, Vec3* b) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 dot3(Vec3* a, Vec3* b) {
    return a->x * b->x + a->y * b->y + a->z * b->z;
}
```
