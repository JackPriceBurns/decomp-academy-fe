---
id: gauntlet-array-s16
title: Index a s16 array
difficulty: 3
concepts:
  - pointers
  - arrays
  - s16
symbol: at
hints:
  - A s16 element uses lhax (scale 2).
  - Write `a[i]`.
---

# Indexed load from a `s16` array

`a[i]` scales the index by `sizeof(s16)` and uses an indexed load: **lhax (scale 2)**.
Unlike a constant displacement, a *variable* index must be scaled at runtime: MWCC first emits a `slwi` to multiply the index by the element size,
then the indexed load. So expect two instructions, e.g. `slwi r0, r4, N`
followed by the load.

## Your task
Write `at` to match the target.

<!-- starter -->
```c
s16 at(s16* a, int i) {
    return 0;
}
```

<!-- solution -->
```c
s16 at(s16* a, int i) {
    return a[i];
}
```
