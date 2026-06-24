---
id: gauntlet-testbit-1
title: Test bit 1
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: testb
hints:
  - Isolate the bit with `(x >> 1) & 1`.
  - It folds to a single `rlwinm` that drops bit 1 to the bottom.
---

# Test bit 1

Extracting one bit as a 0/1 value is `(x >> 1) & 1`. MWCC folds the shift
and the mask into a single **`rlwinm`** that rotates bit 1 down to the
bottom and keeps only it (bit 0 collapses to a `clrlwi`).

## Your task
Write `testb` on a `u32`, returning bit 1 of `x` as 0 or 1.

<!-- starter -->
```c
u32 testb(u32 x) {
    // your code here
    return 0;
}
```

<!-- solution -->
```c
u32 testb(u32 x) {
    return (x >> 1) & 1;
}
```
