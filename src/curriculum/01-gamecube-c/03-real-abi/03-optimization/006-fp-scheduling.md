---
id: 032f6424-030a-591a-8615-6404055b371c
slug: optimization-fp-scheduling
title: Scheduling Floating-Point Work
difficulty: 4
concepts:
  - scheduling
  - floating-point
  - latency
symbol: func_800cbd90
hints:
  - Just write `a[0]*b[0] + a[1]*b[1]` — one expression.
  - Let the scheduler interleave the loads — no need to introduce temporaries to
    force an order.
  - The `+` of two products becomes an `fmuls` plus an `fmadds`, with loads
    woven between them.
---

# Long FP latencies are where the scheduler works hardest

Floating-point loads and `fmuls` both take several cycles to land, which is why
the `,p` scheduler shows its hand most plainly on FP code. In source order you'd
expect something tidy: a load pair then a multiply, then another load pair and a
closing multiply-add. The scheduler refuses to leave it that way. It drags later
loads forward and starts the second product early, threading the two halves of
the work through each other.

```asm
lfs    f1, 4(r3)     # second element of a loaded first
lfs    f0, 4(r4)     # matching element of b
lfs    f2, 0(r3)     # first element of a slotted in behind
fmuls  f0, f1, f0    # one product started early
lfs    f1, 0(r4)     # remaining element of b arrives while fmuls runs
fmadds f1, f2, f1, f0
blr
```

The loads and the two FP ops come out interleaved, not bundled term by term. The
source is just two independent products added together, and the scheduler alone
decided when each load fired. It's the same scheduler from lesson 2; the
difference is that FP stalls run longer, so the rearrangement buys more.

One caution: the `fmadds` isn't the scheduler's doing at all. It comes from
`fp_contract` fusion, a separate mechanism that's also on at `-O4,p`. The next
lesson digs into `fp_contract` properly. For now just be aware it exists, so you
don't chalk the fused multiply-add up to scheduling.

So when an FP target has its loads scattered through the multiplies, reach for
the scheduler as the explanation before you invent some exotic source expression.

## Your task

Write `func_800cbd90` to reproduce the assembly above. Read the load offsets to
determine which elements from each array are paired together, then write the
natural C and let the scheduler interleave.

<!-- solution -->
```c
f32 func_800cbd90(f32 *a, f32 *b) {
    return a[0]*b[0] + a[1]*b[1];
}
```
