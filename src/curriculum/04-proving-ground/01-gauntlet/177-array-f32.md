---
id: gauntlet-array-f32
title: Index a f32 array
difficulty: 3
concepts:
  - pointers
  - arrays
  - f32
symbol: at
hints:
  - A f32 element uses lfsx (scale 4).
  - Write `a[i]`.
---

# Indexed load from a `f32` array

`a[i]` scales the index by `sizeof(f32)` and uses an indexed load: **lfsx (scale 4)**.
Unlike a constant displacement, a *variable* index must be scaled at runtime: MWCC first emits a `slwi` to multiply the index by the element size,
then the indexed load. So expect two instructions, e.g. `slwi r0, r4, N`
followed by the load.

## Your task
Write `at` to match the target.

<!-- starter -->
```c
f32 at(f32* a, int i) {
    return 0;
}
```

<!-- solution -->
```c
f32 at(f32* a, int i) {
    return a[i];
}
```
