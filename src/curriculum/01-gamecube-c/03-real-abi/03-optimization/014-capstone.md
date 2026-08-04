---
id: bd0ef424-dfa0-51e9-9965-06e35b7568c4
slug: optimization-capstone
title: "Capstone: Scheduling Meets fp_contract"
difficulty: 5
concepts:
  - scheduling
  - fp_contract
  - capstone
  - lerp
symbol: func_80343bd0
hints:
  - Write each lerp as `a[i] + (b[i] - a[i]) * t` and sum the two.
  - fp_contract turns each `... * t + a[i]` into an `fmadds` — let the compiler
    do the fusion.
  - The scheduler batches the four loads and interleaves the two lerps — write
    the math naturally, and the order will follow.
---

# Everything at once

This is where the chapter comes together. Linear interpolation — landing a value
some fraction of the way between two endpoints — runs through game code
everywhere (SFA's lighting lerps are built on it). Write a pair of them, add the
results, and three of the passes you've met all go off at once:

- **fp_contract** collapses the multiply-then-add in each lerp into a single
  `fmadds`, once the `fsubs` for the difference is out of the way.
- **scheduling** drags all four `lfs` loads up front and **interleaves** the two
  lerps so one's latency hides behind the other's work.
- `-O4` keeps the result branch-free and packs it into a tight set of registers.

To see the same shape at a different arity, here's a *three-component* take,
`mix2`, where `fp_contract` and scheduling do their thing on three lerps:

```asm
lfs    f5, 0(r3)       # p[0]
lfs    f2, 0(r4)       # q[0]
lfs    f4, 4(r3)       # p[1]   — all six loads hoisted
lfs    f0, 4(r4)       # q[1]
fsubs  f2, f2, f5      # lerp0: q[0]-p[0]
lfs    f6, 8(r3)       # p[2]
fsubs  f0, f0, f4      # lerp1: q[1]-p[1]   interleaved
lfs    f3, 8(r4)       # q[2]
fmadds f2, f1, f2, f5  # lerp0 fused
fsubs  f3, f3, f6      # lerp2: q[2]-p[2]
fmadds f0, f1, f0, f4  # lerp1 fused
fmadds f1, f1, f3, f6  # lerp2 fused
fadds  f0, f2, f0
fadds  f1, f1, f0
blr
```

See how each lerp's `fsubs` and `fmadds` are braided into the next rather than
sitting in their own block? That's the scheduler. Compile the same unit with
`#pragma scheduling off` and every lerp would stand alone, finished before the
following one starts.

For your `func_80343bd0`, tally the `lfs` instructions in the target asm to learn
how many arrays show up and how many elements each one reaches; every
`fsubs`/`fmadds` pair marks one lerp.

## Your task

Write `blend(f32 *a, f32 *b, f32 t)` to reproduce the assembly above. Write the
lerps in the natural form and let the optimizer fuse and interleave.

<!-- solution -->
```c
f32 func_80343bd0(f32 *a, f32 *b, f32 t) {
    f32 x = a[0] + (b[0] - a[0]) * t;
    f32 y = a[1] + (b[1] - a[1]) * t;
    return x + y;
}
```
