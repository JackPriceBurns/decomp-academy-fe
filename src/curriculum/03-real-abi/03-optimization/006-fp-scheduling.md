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
scheduler is most visibly active on FP code. Written in source order you would
expect: load pair, multiply, load pair, multiply-add. The scheduler hoists
later loads and starts a second product early, weaving the two computations
together:

```asm
lfs    f1, 4(r3)     # second element of a loaded first
lfs    f0, 4(r4)     # matching element of b
lfs    f2, 0(r3)     # first element of a slotted in behind
fmuls  f0, f1, f0    # one product started early
lfs    f1, 0(r4)     # remaining element of b arrives while fmuls runs
fmadds f1, f2, f1, f0
blr
```

The loads and the two FP ops are **interleaved**, not grouped per term. The
source was written as two independent products summed together; the scheduler
decided when to issue each load. This is the same scheduler from lesson 2, but
the payoff is larger because FP stalls are longer.

Note that `fmadds` comes from `fp_contract` fusion, *not* from the scheduler —
they're two independent mechanisms both active at `-O4,p`. The next lesson
covers `fp_contract` in detail; for now just notice it exists so you don't
attribute the fused multiply-add to scheduling.

When an FP target's loads look shuffled across the multiplies, suspect the
scheduler before you suspect an exotic source expression.

## Your task

Write `dot2(f32 *a, f32 *b)` to reproduce the assembly above. Read the load
offsets to determine which elements from each array are paired together, then
write the natural C and let the scheduler interleave.

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
