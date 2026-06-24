---
id: optimization-capstone
title: "Capstone: Scheduling Meets fp_contract"
difficulty: 5
concepts:
  - scheduling
  - fp_contract
  - capstone
  - lerp
symbol: blend
hints:
  - Write each lerp as `a[i] + (b[i] - a[i]) * t` and sum the two.
  - fp_contract turns each `... * t + a[i]` into an `fmadds` — let the compiler
    do the fusion.
  - The scheduler batches the four loads and interleaves the two lerps — write
    the math naturally, and the order will follow.
---

# Everything at once

Time to combine the chapter. A linear interpolation — computing a value that
sits proportionally between two endpoints — is the beating heart of game code
(it's literally what SFA's lighting lerps do). Write two of them and sum the
results, and three optimizations fire together:

- **fp_contract** fuses the multiply-then-add in each lerp into one `fmadds`
  per lerp (after the `fsubs` for the difference).
- **scheduling** hoists all four `lfs` loads to the front and **interleaves**
  the two lerps so their latencies overlap.
- the whole thing stays branch-free and tightly register-allocated thanks to
  `-O4`.

For comparison, here is a *three-component* version (`mix2`) to show what
`fp_contract` + scheduling looks like at a different arity:

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

Each lerp's `fsubs` and `fmadds` pair is interleaved rather than sequential —
that's the scheduler at work. Had this unit used `#pragma scheduling off`, each
lerp would appear as a self-contained block before the next begins.

Count the `lfs` instructions in the target asm for `blend` to know how many
arrays are involved and how many elements each covers; each `fsubs`/`fmadds`
pair is one lerp.

## Your task

Write `blend(f32 *a, f32 *b, f32 t)` to reproduce the assembly above. Write
the lerps in the natural form and let the optimizer fuse and interleave.

<!-- starter -->
```c
f32 blend(f32 *a, f32 *b, f32 t) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 blend(f32 *a, f32 *b, f32 t) {
    f32 x = a[0] + (b[0] - a[0]) * t;
    f32 y = a[1] + (b[1] - a[1]) * t;
    return x + y;
}
```
