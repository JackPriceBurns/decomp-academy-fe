---
id: gauntlet-array-u8
title: Index a u8 array
difficulty: 3
concepts:
  - pointers
  - arrays
  - u8
symbol: at
hints:
  - A u8 element uses lbzx (scale 1).
  - Write `a[i]`.
---

# Indexed load from a `u8` array

`a[i]` scales the index by `sizeof(u8)` and uses an indexed load: **lbzx (scale 1)**.
Unlike a constant displacement, a *variable* index must be scaled at runtime. For a 1-byte element the scale is 1, so no shift is needed — just the
indexed load.

## Your task
Write `at` to match the target.

<!-- starter -->
```c
u8 at(u8* a, int i) {
    return 0;
}
```

<!-- solution -->
```c
u8 at(u8* a, int i) {
    return a[i];
}
```
