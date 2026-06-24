---
id: gauntlet-array-s32
title: Index a s32 array
difficulty: 3
concepts:
  - pointers
  - arrays
  - s32
symbol: at
hints:
  - A s32 element uses lwzx (scale 4).
  - Write `a[i]`.
---

# Indexed load from a `s32` array

`a[i]` scales the index by `sizeof(s32)` and uses an indexed load: **lwzx (scale 4)**.
Unlike a constant displacement, a *variable* index must be scaled at runtime: MWCC first emits a `slwi` to multiply the index by the element size,
then the indexed load. So expect two instructions, e.g. `slwi r0, r4, N`
followed by the load.

## Your task
Write `at` to match the target.

<!-- starter -->
```c
s32 at(s32* a, int i) {
    return 0;
}
```

<!-- solution -->
```c
s32 at(s32* a, int i) {
    return a[i];
}
```
