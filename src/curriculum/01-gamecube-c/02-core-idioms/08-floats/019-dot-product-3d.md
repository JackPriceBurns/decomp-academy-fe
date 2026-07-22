---
id: 66671dce-9c82-5968-ac7f-b1880724fc89
slug: floats-dot-product-3d
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

Stretch the sum-of-products to three terms and you have a 3D dot product. The
shape it compiles to is easy to spot once you have seen it. One `fmuls` kicks
off the accumulator. After that, one `fmadds` per term, each dropping its
product onto the running total. `fmuls` then `fmadds` then `fmadds`, that is the
accumulation idiom, and it keeps going for as many terms as you have.

Fields out of a struct each cost an `lfs`. Here is `weigh3(t, wa, wb, wc)`,
adding up the fields of a `{f32 a,b,c}` struct, each scaled by its own weight
argument:

```asm
lfs    f0, 4(r3)      # t->b
lfs    f4, 0(r3)      # t->a
fmuls  f0, f0, f2     # f0 = t->b * wb          (accumulator seed)
lfs    f2, 8(r3)      # t->c
fmadds f0, f4, f1, f0 # f0 = t->a*wa + f0       (fold in first term)
fmadds f1, f2, f3, f0 # f1 = t->c*wc + f0       (fold in last term)
blr
```

Loads can be interleaved, and the compiler picks whichever product seeds the
`fmuls`. None of that changes the bones of it. An `lfs` pair per multiplied term,
one `fmuls`, then `fmadds` after `fmadds` carrying the sum into `f1`. The offset
on each `lfs` is the field number, 0 then 4 then 8 for first, second, third.

Your target multiplies the matching fields of two `Vec3`s, one parked in `r3`,
the other in `r4`, and sums the three products. Walk the `lfs` offsets to match
the fields up, then make sure those products all feed one accumulator.

Both arguments point at this struct:

```c
typedef struct { f32 x, y, z; } Vec3;
```

## Your task

With the `Vec3` struct above, write `dot3` to reproduce the
assembly above.

<!-- context -->
```c
typedef struct { f32 x, y, z; } Vec3;
```

<!-- solution -->
```c
f32 dot3(Vec3* a, Vec3* b) {
    return a->x * b->x + a->y * b->y + a->z * b->z;
}
```
