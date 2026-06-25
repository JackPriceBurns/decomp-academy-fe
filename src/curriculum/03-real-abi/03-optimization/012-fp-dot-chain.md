---
id: optimization-fp-dot-chain
title: "Chaining: FP Scheduling and fp_contract at Arity Three"
difficulty: 4
concepts:
  - scheduling
  - fp_contract
  - floating-point
  - chaining
symbol: dot3
hints:
  - A sum of products contracts into one `fmuls` seeded by the first term, then an
    `fmadds` per additional term — count the terms by counting the fused ops.
  - Write the dot product as one flat expression; the scheduler decides when each
    `lfs` issues, so don't try to force a load order with temporaries.
---

# The fp pair, scaled up a term

Lesson 6 showed the scheduler weaving the loads of a **two**-term dot product;
lesson 7 showed `fp_contract` fusing a multiply-then-add into `fmadds`. They are
independent mechanisms, and both fire on any sum of products. Here you read them
together at a **larger arity**, where the pattern becomes a fixed shape: the
first product seeds an `fmuls`, and every further term folds in as an `fmadds`.
Around that arithmetic the scheduler shuffles the `lfs` loads to cover their
latencies.

Recall the two-term case from lesson 6, `proj(f32 *u, f32 *w)`:

```asm
lfs    f1, 4(r3)      # loads interleaved by the scheduler
lfs    f0, 4(r4)
lfs    f2, 0(r3)
fmuls  f0, f1, f0     # first product (fp_contract leaves this as a plain fmuls)
lfs    f1, 0(r4)
fmadds f1, f2, f1, f0 # second term fused into a multiply-add
blr
```

One `fmuls` plus one `fmadds`: two terms. Add a third term and the shape extends
predictably — one more `fmadds`, two more `lfs`, all re-scheduled. The count of
fused FP ops tells you the number of terms, and the load offsets tell you which
elements of each array are paired.

Your `dot3` is the next size up. Read the `lfs` offsets to see how many elements
of each array participate and how they pair, then write the dot product as a
single flat expression and let `fp_contract` fuse and the scheduler interleave.

## Your task

Write `dot3(f32 *a, f32 *b)` to reproduce the target assembly — a sum of
element-wise products with the loads scheduled and the additions contracted into
`fmadds`.

<!-- starter -->
```c
f32 dot3(f32 *a, f32 *b) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 dot3(f32 *a, f32 *b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}
```
