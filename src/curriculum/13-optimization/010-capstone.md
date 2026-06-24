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

Time to combine the chapter. A linear interpolation `a + (b - a) * t` is the
beating heart of game code (it's literally what SFA's lighting lerps do). Do two
of them and add the results, and three optimizations fire together:

- **fp_contract** fuses each `a + (b - a) * t` so the final `*t + a` becomes one
  `fmadds` (after the `fsubs` for `b - a`).
- **scheduling** hoists all four `lfs` loads to the front and **interleaves** the
  two lerps so their latencies overlap.
- the whole thing stays branch-free and tightly register-allocated thanks to
  `-O4`.

At our default `-O4,p` with `fp_contract on`, the two lerps come out woven
together:

```asm
lfs    f4, 0(r3)      # a[0]
lfs    f2, 0(r4)      # b[0]
lfs    f3, 4(r3)      # a[1]   — loads batched up front
lfs    f0, 4(r4)      # b[1]
fsubs  f2, f2, f4     # lerp0: b[0]-a[0]
fsubs  f0, f0, f3     # lerp1: b[1]-a[1]   — interleaved with lerp0
fmadds f2, f1, f2, f4 # lerp0: a[0] + (b[0]-a[0])*t   (fused)
fmadds f0, f1, f0, f3 # lerp1: a[1] + (b[1]-a[1])*t   (fused)
fadds  f1, f2, f0     # lerp0 + lerp1
blr
```

Had this unit used `#pragma scheduling off`, the two lerps would appear as two
*separate* sequential blocks (load–load–fsubs–fmadds, then again) instead of the
interleaved form above — the exact distinction this chapter trains you to spot.

## Your task

Write `blend(f32 *a, f32 *b, f32 t)` returning
`(a[0] + (b[0]-a[0])*t) + (a[1] + (b[1]-a[1])*t)`. Write the two lerps plainly
and let the optimizer fuse and interleave.

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
