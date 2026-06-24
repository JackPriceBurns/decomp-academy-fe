---
id: gauntlet-testbit-3
title: Test bit 3
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: testb
hints:
  - Isolate the bit with `(x >> 3) & 1`.
  - It folds to a single `rlwinm` that drops bit 3 to the bottom.
---

# Test bit 3

Extracting one bit as a 0/1 value is `(x >> 3) & 1`. MWCC folds the shift
and the mask into a single **`rlwinm`** that rotates bit 3 down to the
bottom and keeps only it (bit 0 collapses to a `clrlwi`).

## Your task
Write `testb` on a `u32`, returning bit 3 of `x` as 0 or 1.

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
    return (x >> 3) & 1;
}
```
