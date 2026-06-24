---
id: optimization-fp-scheduling
title: Scheduling Floating-Point Work
difficulty: 4
concepts:
  - scheduling
  - floating-point
  - latency
symbol: dot2
hints:
  - Just write `a[0]*b[0] + a[1]*b[1]` — one expression.
  - Let the scheduler interleave the loads — no need to introduce temporaries to
    force an order.
  - The `+` of two products becomes an `fmuls` plus an `fmadds`, with loads
    woven between them.
---

# FP latencies are long — so the scheduler tries hardest here

Floating-point loads and `fmuls` have multi-cycle latencies, so the `,p`
scheduler is most visibly active on FP code. Take a two-element dot product
`a[0]*b[0] + a[1]*b[1]`. Written the obvious way it would load a[0],b[0], multiply,
load a[1],b[1], multiply-add. The scheduler instead hoists a later load and
starts the second product *early*, weaving the two computations together:

```asm
lfs    f1, 4(r3)     # a[1] loaded first
lfs    f0, 4(r4)     # b[1]
lfs    f2, 0(r3)     # a[0] slotted in behind
fmuls  f0, f1, f0    # a[1]*b[1] started before a[0]*b[0]
lfs    f1, 0(r4)     # b[0]
fmadds f1, f2, f1, f0
blr
```

The loads and the two FP ops are **interleaved**, not grouped per term. This is
the same scheduler from lesson 2, but the payoff is larger because FP stalls are
longer.

Note that the `fmadds` here comes from `fp_contract` fusion, *not* from the
scheduler — they're two independent mechanisms that happen to both be on at
`-O4,p`. The next lesson covers `fp_contract` in detail; for now just notice it
exists so you don't attribute the fused multiply-add to scheduling.

When an FP target's loads look shuffled across the multiplies, suspect the
scheduler before you suspect an exotic source expression.

## Your task

Write `dot2(f32 *a, f32 *b)` to match the interleaved `fmuls`/`fmadds` assembly
above. Write it as the plain sum of two products and let the scheduler interleave.

<!-- starter -->
```c
f32 dot2(f32 *a, f32 *b) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 dot2(f32 *a, f32 *b) {
    return a[0]*b[0] + a[1]*b[1];
}
```
