---
id: gauntlet-array-u16
title: Index a u16 array
difficulty: 3
concepts:
  - pointers
  - arrays
  - u16
symbol: at
hints:
  - A u16 element uses lhzx (scale 2).
  - Write `a[i]`.
---

# Indexed load from a `u16` array

`a[i]` scales the index by `sizeof(u16)` and uses an indexed load: **lhzx (scale 2)**.
Unlike a constant displacement, a *variable* index must be scaled at runtime: MWCC first emits a `slwi` to multiply the index by the element size,
then the indexed load. So expect two instructions, e.g. `slwi r0, r4, N`
followed by the load.

## Your task
Write `at` to match the target.

<!-- starter -->
```c
u16 at(u16* a, int i) {
    return 0;
}
```

<!-- solution -->
```c
u16 at(u16* a, int i) {
    return a[i];
}
```
